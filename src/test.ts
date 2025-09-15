import {
  Browser,
  BrowserContext,
  Page,
  expect,
  test as pwTest,
} from "@playwright/test";
import { chromium } from "playwright";
import { config } from "./config";
import { startServer } from "./utils/server";
import openInDefaultBrowser from "./utils/openInDefaultBrowser";

const getFile = async () => {
  const fs = await import('fs/promises');
  const path = await import('path');
  const testBuilderAppPath = path.resolve(process.cwd(), 'node_modules/@cyborgtests/test/test-builder-build');

  const html = await fs.readFile(path.join(testBuilderAppPath, 'index.html'), 'utf-8');

  // extract <script> contents — only inline, not external src
  const script = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .join('\n');

  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(match => match[1])
    .join('\n');

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
  manualStep: (stepName: string) => Promise<void>;
}>({
  testControl: async ({ page, context, browser }, use) => {
    let tcBrowser: Browser | null = null;
    let tcPage: Page | null = null;
    let server: any = null;

    const getTestControl = async () => {
      if (!tcBrowser) {
        tcBrowser = await chromium.launch({
          headless: false,
        });

        server = await startServer(config.uiPort);

        tcPage = await tcBrowser.newPage({
          viewport: { width: 500, height: 750 },
        });

        const { script, styles } = await getFile();
        await page.addInitScript(({ script: scriptContent, styles: stylesContent }) => {
          document.addEventListener('DOMContentLoaded', () => {
            const rootDiv = document.createElement('div');
            rootDiv.id = 'cyborg-app';
            document.body.appendChild(rootDiv);

            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = scriptContent;
            document.head.appendChild(script);

            const style = document.createElement('style');
            style.setAttribute('rel', 'stylesheet');
            style.textContent = stylesContent;
            document.head.appendChild(style);
          });
        }, { script, styles });

        await tcPage.goto(`http://localhost:${config.uiPort}`);

        await tcPage.exposeFunction('openInMainBrowser', (link: string) => {
          openInDefaultBrowser(link);
        });
        await tcPage.evaluate(() => {
          (window as any).testUtils.openInMainBrowser = (window as any).openInMainBrowser;
        });

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
        throw new Error('testControl.page is not available. Use manualStep() to initialize the control panel.');
      },
      get browser() {
        throw new Error('testControl.browser is not available. Use manualStep() to initialize the control panel.');
      },
      get context() {
        throw new Error('testControl.context is not available. Use manualStep() to initialize the control panel.');
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
    const manualStep = async (stepName: string, params: { isSoft?: boolean } = {}) =>
      await test.step(
        `✋ [MANUAL] ${stepName}`,
        async () => {
          const tc = await (testControl as any)._getTestControl();
          (testControl as any)._initialized = true;
          
          await tc.page.evaluate((_testName: string) => {
            (window as any)?.testUtils?.setTestName(_testName);
          }, test.info().title);

          await tc.page.evaluate(
            ({ stepName, params }: { stepName: string; params: { isSoft?: boolean } }) => {
              (window as any).testUtils?.addStep(stepName, params);
            },
            { stepName, params }
          );

          await tc.page.pause();

          const hasFailed = await tc.page.evaluate(() => {
            if ((window as any).testUtils.hasFailed) {
              delete (window as any).testUtils.hasFailed;
              return true;
            }
            return false;
          });
          if (hasFailed) {
            const reason = await tc.page.evaluate(() => {
              const reason = (window as any).testUtils?.failedReason || '';
              delete (window as any).testUtils.failedReason;
              return reason;
            });
            const errorMessage = `${stepName}${reason ? ` - ${reason}` : ''}`;
            throw new TestFailedError(errorMessage);
          }
        },
        { box: true }
      );
    manualStep.soft = async (stepName: string) =>
      await test.step(
        `✋ [MANUAL][SOFT] ${stepName}`,
        async () => {
          try {
            await manualStep(stepName, { isSoft: true });
          } catch (err) {
            test.info().annotations.push({
              type: 'softFail',
              description: `Soft fail in manual step: ${(err as Error).message}`,
            });
            await expect.soft(false, `Soft fail in manual step: ${(err as Error).message}`).toBeTruthy();
            console.warn(`Soft fail in manual step: ${stepName}`, err);
          }
        },
        { box: true }
      );
    await use(manualStep);
    try {
      if ((testControl as any)._initialized) {
        const tc = await (testControl as any)._getTestControl();
        await tc.page.evaluate("playwright.resume()");
      }
    } catch (err) {
      // no-op - control panel might not be initialized
    }
  },
});

export default test;
