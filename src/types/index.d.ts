import { Page, Browser, BrowserContext } from '@playwright/test';

declare module '@playwright/test' {
  interface PlaywrightTestArgs {
    manualStep: (stepName: string) => Promise<void>;
    testControl: {
      page: Page;
      browser: Browser;
      context: BrowserContext;
    };
  }
} 