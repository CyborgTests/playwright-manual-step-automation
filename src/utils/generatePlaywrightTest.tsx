export interface RecordedElement {
  selector: string;
  eventType: 'click' | 'keydown' | 'should-exists' | 'should-not-exist' | 'focus';
  data?: {
    text?: string;
    mightNavigate?: boolean;
    isDirectLinkClick?: boolean;
    href?: string | null;
  };
}

export const generatePlaywrightTest = (recordedElements: RecordedElement[]): string => {
  if (recordedElements.length === 0) {
    return '// No recorded elements to generate test from';
  }

  let testCode = ``;

  recordedElements.forEach((element) => {
    if (element.eventType === 'click') {
      if (element.data?.isDirectLinkClick && element.data?.href) {
        testCode += `await page.goto('${element.data.href}');\n`;
      } else {
        testCode += `await page.click('${element.selector}');\n`;
        
        if (element.data?.mightNavigate) {
          testCode += `await page.waitForLoadState('networkidle');\n`;
        }
      }
    } else if (element.eventType === 'keydown') {
      testCode += `await page.fill('${element.selector}', '${element.data?.text || ''}');\n`;
    } else if (element.eventType === 'should-exists') {
      testCode += `await expect(page.locator('${element.selector}')).toBeVisible();\n`;
    } else if (element.eventType === 'should-not-exist') {
      testCode += `await expect(page.locator('${element.selector}')).not.toBeVisible();\n`;
    } else if (element.eventType === 'focus') {
      testCode += `await page.focus('${element.selector}');\n`;
    }
  });

  return testCode;
};
