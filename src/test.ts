import {
  Browser,
  BrowserContext,
  Page,
  expect,
  test as pwTest,
} from "@playwright/test";
import { chromium } from "playwright";
import { config } from "./config";
import {
  DEFAULT_SKIP_REASON,
  DEFAULT_FAILURE_REASON,
} from "./constants/messages";
import { startServer } from "./utils/server";
import openInDefaultBrowser from "./utils/openInDefaultBrowser";
import {
  checkJiraConfig,
  getJiraProjectKey,
  getJiraIssueTypes,
  createJiraTicket,
} from "./utils/jira";

const getFile = async () => {
  const fs = await import("fs/promises");
  const path = await import("path");
  const testBuilderAppPath = path.resolve(
    process.cwd(),
    "node_modules/@cyborgtests/test/test-builder-build",
  );

  const html = await fs.readFile(
    path.join(testBuilderAppPath, "index.html"),
    "utf-8",
  );

  // extract <script> contents — only inline, not external src
  const script = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n");

  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join("\n");

  return { script, styles };
};

class TestFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestFailedError";
  }
}

const test = pwTest.extend<{
  testControl: {
    page: Page;
    browser: Browser;
    context: BrowserContext;
  };
  manualStep: ((
    stepName: string,
    params?: { [key: string]: any },
  ) => Promise<void>) & {
    soft: (stepName: string, params?: { [key: string]: any }) => Promise<void>;
  };
}>({
  testControl: async ({ page, context, browser }, use, testInfo) => {
    let tcBrowser: Browser | null = null;
    let tcPage: Page | null = null;
    let server: any = null;

    const getTestControl = async () => {
      if (!tcBrowser) {
        const controlPanelSize = { width: 500, height: 750 };
        const hasDeviceScaleFactor = !!(testInfo.project.use as any)
          ?.deviceScaleFactor;

        tcBrowser = await chromium.launch({
          headless: false,
          args: [
            `--window-size=${controlPanelSize.width},${controlPanelSize.height}`,
          ],
        });

        server = await startServer(config.uiPort);

        tcPage = await tcBrowser.newPage({
          viewport: hasDeviceScaleFactor ? controlPanelSize : null,
        });

        const { script, styles } = await getFile();
        await page.addInitScript(
          ({ script: scriptContent, styles: stylesContent }) => {
            document.addEventListener("DOMContentLoaded", () => {
              const rootDiv = document.createElement("div");
              rootDiv.id = "cyborg-app";
              document.body.appendChild(rootDiv);

              const script = document.createElement("script");
              script.type = "module";
              script.textContent = scriptContent;
              document.head.appendChild(script);

              const style = document.createElement("style");
              style.setAttribute("rel", "stylesheet");
              style.textContent = stylesContent;
              document.head.appendChild(style);
            });
          },
          { script, styles },
        );

        await tcPage.goto(`http://localhost:${config.uiPort}`);

        await tcPage.exposeFunction("openInMainBrowser", (link: string) => {
          openInDefaultBrowser(link);
        });

        await tcPage.evaluate(() => {
          (window as any).testUtils.openInMainBrowser = (
            window as any
          ).openInMainBrowser;
        });

        await tcPage.exposeFunction("getTestInfo", () => {
          return {
            testId: testInfo.testId,
            attachments: testInfo.attachments,
            annotations: testInfo.annotations,
            project: testInfo.project,
            config: testInfo.config,
            title: testInfo.title,
            titlePath: testInfo.titlePath,
            file: testInfo.file,
            tags: testInfo.tags,
          };
        });

        await tcPage.exposeFunction("skipTest", () => {
          if (testInfo.skip) {
            testInfo.skip(true);
          }
        });

        await tcPage.exposeFunction("checkJiraConfig", () => {
          return checkJiraConfig();
        });

        await tcPage.exposeFunction("getJiraProjectKey", () => {
          return getJiraProjectKey();
        });

        await tcPage.exposeFunction(
          "getJiraIssueTypes",
          async (projectKey: string) => {
            return await getJiraIssueTypes(projectKey);
          },
        );

        await tcPage.exposeFunction(
          "createJiraTicket",
          async (ticketInfo: any) => {
            return await createJiraTicket(ticketInfo);
          },
        );

        await tcPage.bringToFront();
      }

      return {
        browser: tcBrowser,
        context: tcPage!.context(),
        page: tcPage!,
      };
    };

    const testControlObj = {
      get page() {
        throw new Error(
          "testControl.page is not available. Use manualStep() to initialize the control panel.",
        );
      },
      get browser() {
        throw new Error(
          "testControl.browser is not available. Use manualStep() to initialize the control panel.",
        );
      },
      get context() {
        throw new Error(
          "testControl.context is not available. Use manualStep() to initialize the control panel.",
        );
      },
      _getTestControl: getTestControl,
      _initialized: false,
    };

    await use(testControlObj as any);

    // Cleanup
    if (tcPage) {
      await (tcPage as Page).close();
    }
    if (tcBrowser) {
      await (tcBrowser as Browser).close();
    }
    if (server) {
      server.kill();
    }
  },
  manualStep: async ({ testControl, page, browser, context }, use) => {
    let currentResumeResolver: (() => void) | null = null;
    let resumeFunctionExposed = false;
    let skipTestRequested = false;

    const manualStep = async (
      stepName: string,
      params: { isSoft?: boolean; [key: string]: any } = {},
    ) => {
      test.setTimeout(0);
      return await test.step(
        `✋ [MANUAL] ${stepName}`,
        async (step) => {
          const tc = await (testControl as any)._getTestControl();
          (testControl as any)._initialized = true;

          await tc.page.evaluate(
            ({
              stepName,
              params,
            }: {
              stepName: string;
              params: { isSoft?: boolean; [key: string]: any };
            }) => {
              (window as any).testUtils?.addStep(stepName, params);
            },
            { stepName, params },
          );

          const resumePromise = new Promise<void>((resolve) => {
            currentResumeResolver = resolve;
          });

          if (!resumeFunctionExposed) {
            await tc.page.exposeFunction("resumeTest", () => {
              if (currentResumeResolver) {
                currentResumeResolver();
                currentResumeResolver = null;
              }
            });
            resumeFunctionExposed = true;
          }

          await tc.page.evaluate(() => {
            if ((window as any).testUtils) {
              (window as any).testUtils.resumeTest = (window as any).resumeTest;
              (window as any).testUtils.skipTest = (window as any).skipTest;
            }
          });

          await resumePromise;

          const stepState = await tc.page.evaluate(() => {
            const utils = (window as any).testUtils;
            return {
              hasFailed: !!utils?.hasFailed,
              failedReason: utils?.failedReason || "",
              isSkipped: !!utils?.isSkipped,
              skipReason: utils?.skipReason || "",
              isTestSkipped: !!utils?.isTestSkipped,
              testSkipReason: utils?.testSkipReason || "",
            };
          });

          await tc.page.evaluate(() => {
            const utils = (window as any).testUtils;
            delete utils.hasFailed;
            delete utils.failedReason;
            delete utils.isSkipped;
            delete utils.skipReason;
            delete utils.isTestSkipped;
            delete utils.testSkipReason;
          });

          if (stepState.hasFailed) {
            const failureReason =
              stepState.failedReason || DEFAULT_FAILURE_REASON;
            const failDescription = `Manual step failed: ${stepName} - ${failureReason}`;
            if (!params.isSoft) {
              test.info().annotations.push({
                type: "fail",
                description: failDescription,
              });
            }
            throw new TestFailedError(
              params.isSoft
                ? `${stepName} - ${failureReason}`
                : failDescription,
            );
          }
          if (stepState.isSkipped) {
            const skipReason = stepState.skipReason || DEFAULT_SKIP_REASON;
            const skipDescription = `Step is skipped: ${stepName}: ${skipReason}`;
            test.info().annotations.push({
              type: "skip",
              description: skipDescription,
            });
            (step as any).skip?.(true, skipDescription);
          }
          if (stepState.isTestSkipped) {
            const skipReason = stepState.testSkipReason || DEFAULT_SKIP_REASON;
            test.info().annotations.push({
              type: "skip",
              description: "Test is skipped:",
            });
            skipTestRequested = true;
            test.skip(true, skipReason);
          }
        },
        { box: true, timeout: 0 },
      );
    };
    manualStep.soft = async (
      stepName: string,
      params: { [key: string]: any } = {},
    ) =>
      await test.step(
        `✋ [MANUAL][SOFT] ${stepName}`,
        async () => {
          try {
            await manualStep(stepName, { isSoft: true, ...params });
          } catch (err) {
            if (skipTestRequested) {
              throw err;
            }
            const message = (err as Error)?.message || "";
            test.info().annotations.push({
              type: "softFail",
              description: `Soft fail in manual step: ${message}`,
            });
            expect
              .soft(false, `Soft fail in manual step: ${message}`)
              .toBeTruthy();
          }
        },
        { box: true, timeout: 0 },
      );
    await use(manualStep);
    try {
      if (currentResumeResolver) {
        (currentResumeResolver as () => void)();
        currentResumeResolver = null;
      }
    } catch (err) {
      // no-op - control panel might not be initialized
    }
  },
});

export default test;
