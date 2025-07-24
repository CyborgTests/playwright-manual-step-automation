# Cyborg Test

Cyborg Test is a powerfull extension for [Playwright](https://playwright.dev/) that allows you to include manual verification steps in your automated test flow. 
When a manual step is hit, a separate window appears showing the step description that needs to be executed, so a tester can mark it as passed or failed. 
This lets you combine automated checks with human input in the same test case.

## Installation

```bash
npm install @cyborgtests/test
```

This library expects `@playwright/test` to be available in your project as peer dependency.

## Usage

```ts
import test from '@cyborgtests/test';

// Regular Playwright test syntax with additional `manualStep` helper
// that pauses execution until the tester confirms the step.
test('example with manual step', async ({ page, manualStep }) => {
  await page.goto('https://example.com');

  await manualStep('Verify the login screen is displayed correctly');

  // continue with the rest of your automated script
});
```

When `manualStep` is called the test pauses and the Cyborg Test UI window appears. Use the `✅ Step passed` or `❌ Step failed` buttons to resume the test. Failing a step throws an error so your CI can detect it.

## Soft Fail for Manual Steps

You can use `manualStep.soft` to mark a manual step as a soft fail. If a soft manual step fails, the test will continue running, and the failure will be annotated as a soft fail (warning) in the report.

**Usage:**

```ts
await manualStep('This is a hard manual step'); // Test fails if this step fails
await manualStep.soft('This is a soft manual step'); // Test continues if this step fails, and a warning is shown
```

- Soft fails are shown as warnings in the UI and annotated in the test report.
- Use soft fails for non-critical manual verifications where you want to highlight issues but not fail the entire test.

# Test Builder

The Test Builder is a powerful visual test recording tool that allows you to create Playwright tests by interacting with web pages. It automatically captures user interactions and generates executable Playwright test code.

## Features

### 🎯 **Visual Test Recording**
- **Click Recording**: Automatically captures clicks on any element
- **Form Input Recording**: Records text input and form interactions
- **Navigation Detection**: Intelligently handles page navigation and link clicks

### 🎨 **Interactive UI**
- **Context Menu**: Right-click on any element for additional actions
- **Real-time Recording**: See recorded elements as you interact
- **Test Generation**: Generate Playwright code with one click
- **Copy to Clipboard**: Easy code copying for immediate use

### 🔧 **Advanced Actions**
- **Element Verification**: Mark elements as "should exist" or "should not exist"
- **Focus Actions**: Record focus events for accessibility testing
- **Smart Selectors**: Generates robust CSS selectors for reliable test execution

## How It Works

### 1. **Start Recording**
The test builder automatically starts recording when loaded. You'll see a control panel showing the number of recorded elements.

### 2. **Interact with the Page**
- **Click** any element to record a click action
- **Type** in input fields to record form interactions
- **Right-click** elements for additional verification options

### 3. **Generate Test Code**
- Click the "Generate Test" button to create Playwright code
- Copy the generated code to your clipboard
- Paste into your test file

## Generated Code Examples

### Basic Click Test
```typescript
await page.click('button[data-testid="submit"]');
```

### Form Interaction
```typescript
await page.fill('input[name="email"]', 'user@example.com');
await page.click('button[type="submit"]');
```

### Element Verification
```typescript
await expect(page.locator('.success-message')).toBeVisible();
await expect(page.locator('.error-message')).not.toBeVisible();
```

## Context Menu Actions

Right-click on any element to access additional recording options:

- **Should Exist**: Verify element is visible
- **Should Not Exist**: Verify element is hidden
- **Focus**: Record focus event
- **Click**: Record click event

## Analytics Configuration

The package includes Google Analytics integration that is enabled by default. The following data is collected:
- Unique user ID (generated on first run)
- Test execution events (start of the test)
- Test results (passed/failed)
- External link clicks
- Browser, OS information and country

This data helps us understand how the tool is being used and improve it. No personal or sensitive information is collected.

To turn off analytics, use the following configuration:

```typescript
import { config } from '@cyborgtests/test';

config.setConfig({
  analyticsEnabled: false
});
```