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
    const tcBrowser = await chromium.launch({
      headless: false,
      args: ['--window-position=0,0']
    });

    const server = await startServer(config.uiPort);

    const tcPage = await tcBrowser.newPage({
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

    await use({
      browser: tcBrowser,
      context: tcPage.context(),
      page: tcPage,
    });

    // Cleanup
    await tcPage.close();
    await tcPage.context().close();
    await tcBrowser.close();
    server.kill();
  },
  browser: async ({ browser }, use, testInfo) => {
    const useCfg = testInfo.project.use as any;
    const name = useCfg.defaultBrowserType as 'chromium' | 'firefox' | 'webkit';
    if (name !== 'chromium') {
      await use(browser);
      return;
    }
    const channel = useCfg.channel as string | undefined;
    const headless = !!useCfg.headless;
    
    const customBrowser: Browser = await chromium.launch({
      headless,
      channel,
      args: [
        '--window-position=500,0'
      ],
    });
    await use(customBrowser);
    await customBrowser.close();
  },
  manualStep: async ({ testControl, page, browser, context }, use) => {
    const manualStep = async (stepName: string, params: { isSoft?: boolean } = {}) =>
      await test.step(
        `✋ [MANUAL] ${stepName}`,
        async () => {
          await testControl.page.evaluate((_testName) => {
            (window as any)?.testUtils?.setTestName(_testName);
          }, test.info().title);

          // Write current step name
          await testControl.page.evaluate(
            ({ stepName, params }) => {
              (window as any).testUtils?.addStep(stepName, params);
            },
            { stepName, params }
          );

          // Pause for manual step
          await testControl.page.pause();

          // If last step failed, throw error
          const hasFailed = await testControl.page.evaluate(() => {
            if ((window as any).testUtils.hasFailed) {
              delete (window as any).testUtils.hasFailed;
              return true;
            }
            return false;
          });
          if (hasFailed) {
            const reason = await testControl.page.evaluate(() => {
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
            // This will mark the step as failed, but not fail the test
            await expect.soft(false, `Soft fail in manual step: ${(err as Error).message}`).toBeTruthy();
            // Optionally log
            console.warn(`Soft fail in manual step: ${stepName}`, err);
          }
        },
        { box: true }
      );
    await use(manualStep);
    // In case test interupted
    try {
      await testControl.page.evaluate("playwright.resume()");
    } catch (err) {
      // no-op
    }
  },
});

export default test;
