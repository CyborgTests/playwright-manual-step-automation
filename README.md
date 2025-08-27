<a href="https://www.cyborgtests.com/" target="_blank">
  <img src="https://cdn.prod.website-files.com/67f5380f43dbd686532cd541/686bcc6d09e3deeafa38eaed_cyborg-test-banner.png" alt="Banner" style="width: 100%" />
</a>

# Cyborg Test
**Capture Manual Steps. Create Automated Tests**

Cyborg Test is a powerful extension for [Playwright](https://playwright.dev/) that allows you to include manual verification steps in your automated test flow. 
When a manual step is hit, a separate window appears showing the step description that needs to be executed, so a tester can mark it as passed or failed. 
This lets you combine automated checks with human input in the same test case.

## 🤖 Demo

**Try it out!** Click the button below to open a live demo environment where you can experience Cyborg Test in action.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/CyborgTests/demo-playwright-manual-step-automation)

**How to try locally:** [YouTube - How to Try CyborgTests locally](https://www.youtube.com/watch?v=QLSjvs11Oyw)

See how Cyborg Test turns manual steps into streamlined Playwright tests:
[YouTube - 🤖 Introducing CyborgTests - Stop Wrestling with Partially Automatable Tests!](https://www.youtube.com/watch?v=jO-N1Fcofog&ab_channel=HOTtesting)

<div align="center">
    <img alt="Demo 2" src="https://cdn.prod.website-files.com/67f5380f43dbd686532cd541/68874ae64e22ec7bf685969e_manualStep.gif" />
    <div>Manual Step Demo</div>
    <br />
    <img alt="Demo 1" src="https://cdn.prod.website-files.com/67f5380f43dbd686532cd541/68874aebb6babee061d07ad2_testBuilder.gif" />
    <div>Test Builder Demo</div>
</div>

## 🚀 Installation

```bash
npm install @cyborgtests/test
```

This library expects `@playwright/test` to be available in your project as peer dependency.

## 🧪 Usage

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

## ⚠️ Soft Fail for Manual Steps

You can use `manualStep.soft` to mark a manual step as a soft fail. If a soft manual step fails, the test will continue running, and the failure will be annotated as a soft fail (warning) in the report.

**Usage:**

```ts
await manualStep('This is a hard manual step'); // Test fails if this step fails
await manualStep.soft('This is a soft manual step'); // Test continues if this step fails, and a warning is shown
```

- Soft fails are shown as warnings in the UI and annotated in the test report.
- Use soft fails for non-critical manual verifications where you want to highlight issues but not fail the entire test.

## 📊 Analytics Configuration

Google Analytics is enabled by default to help us understand usage. The following data is collected:
- Unique user ID (generated on first run)
- Test execution events (start of the test)
- Test results (passed/failed)
- External link clicks
- Browser, OS information and country

This data helps us understand how the tool is being used and improve it. We do not collect any personal or sensitive information.

To turn off analytics, use the following configuration:

```typescript
import { config } from '@cyborgtests/test';

config.setConfig({
  analyticsEnabled: false
});
```

## 🤝 Contributing

We welcome contributions! If you'd like to report a bug, request a feature, or submit a pull request, check out our [contributing guidelines](./CONTRIBUTING.md).

---
<p align="center">
  ⭐️ Found this useful? Star the repo to support the project!
</p>
