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

export interface InjectedTestInfo {
  testId: string;
  attachments: any[];
  project?: {
    name: string;
    [key: string]: any;
  };
  config: any;
  title: string;
  titlePath: string[];
  file: string;
  tags: string[];
  annotations: Array<{
    type: string;
    description: string;
  }>;
}

declare global {
  interface Window {
    getTestInfo: () => Promise<InjectedTestInfo>;
    skipTest: () => void;
    testUtils?: {
      addStep: (
        step: string,
        params?: { isSoft?: boolean; [key: string]: any }
      ) => void;
      resumeTest: () => void;
      hasFailed?: boolean;
      failedReason?: string;
    };
  }
}
