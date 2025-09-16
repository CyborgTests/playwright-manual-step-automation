# 🤖 Cyborg Tests Guidelines v0.1

Welcome to Cyborg Tests! 🎉 This guide is your perfect starting point for understanding how to seamlessly integrate Cyborg Tests into your testing activities — whether it's regression, acceptance, smoke testing, daily runs, or any other testing scenario.  

We encourage you to adapt, extend, and modify these guidelines to fit your unique workflow. Your testing journey is unique, and Cyborg Tests is here to support it!

💬 **Have feedback or questions?** We'd love to hear from you! Reach out on our **[Discord community](https://discord.gg/uc9q7URDnw)** or create a **[GitHub issue](https://github.com/CyborgTests/playwright-manual-step-automation/issues)**. Your input helps make Cyborg Tests better for everyone!

---

## Table of Contents

1. [🚀 Getting Started](#1--getting-started)
2. [🏃‍♂️ Running Tests](#2-️-running-tests)
3. [📊 Reporting](#3--reporting)
4. [👥 Assigning Tests to Team Members](#4--assigning-tests-to-team-members)
5. [🤝 Combining with Automated Tests](#5--combining-with-automated-tests)
6. [🎯 Advanced Tips & Best Practices](#6--advanced-tips--best-practices)

---

## 1. 🚀 Getting Started

Cyborg Tests extend the Playwright test framework by introducing the powerful `manualStep()` function.  
This enables you to create **hybrid test flows** that are partly automated and partly manual — just like real cyborgs! 🤖✨

### Quick Example

```ts
test("video call quality", async ({ page }) => {
  await page.goto("/video-call");
  await manualStep("Check if video/audio quality looks fine to the human eye");
  await page.click("text=End Call");
});
```

### Why Choose Cyborg Tests?

✅ **Fully compatible** with your existing Playwright codebase  
✅ **Version controlled** — treat them just like your automated tests  
✅ **Perfect for QA engineers** to cover test cases that are:
  - **Impossible to automate** (visual quality checks, accessibility reviews, user experience validation)
  - **Too expensive or complex** to fully automate right now
  - **Not yet automated** due to resource, budget, or time constraints
  - **Require human judgment** (subjective assessments, exploratory scenarios)

### Installation

First, install the Cyborg Tests package:

```bash
npm install @cyborgtests/test
```

Then import it in your test files:

```ts
import test from "@cyborgtests/test";
```
This is an extended original test that now allows you to use `manualStep()` function:

```ts
test(
  "product details page should be displayed correctly",
  async ({ page, manualStep }) => {
    // Automated step
    await page.goto("/product/cherry-tomatoes");
    // Manual steps
    await manualStep(`Verify that product details are displayed correctly - 
      CHERRY TOMATOES
      cherry tomatoes, salt, sugar, greens, acetic acid, garlic, spices
      `);
    await manualStep(`Verify that product price is displayed correctly - $95`);
    await manualStep("Verify that product image is displayed correctly");
  }
);
```


⸻

## 2. 🏃‍♂️ Running Tests

Running your Cyborg tests is just like running regular Playwright tests, with one exciting difference: when your test reaches a `manualStep()`, it will pause and present you with the **Test Control Panel**. Here, you'll make the important decisions about whether each manual step passes or fails.

### How to Run Cyborg Tests

You can start your Cyborg tests using any of these familiar methods:

#### Command Line Interface (CLI)
```bash
npx playwright test --workers=1 --timeout=0
```

#### Playwright UI Mode
```bash
npx playwright test --ui
```

#### IDE Extensions
Use the [Playwright VS Code extension](https://playwright.dev/docs/getting-started-vscode) for an integrated development experience.

### Important Configuration Rules

#### 🚫 Disable Parallelization
Run tests sequentially to avoid confusion with multiple manual steps:
```bash
--workers=1
```
*You probably don't want to handle multiple manual steps simultaneously, right?* 😉

#### ⏰ Adjust Timeouts
Increase or disable timeouts since manual actions take longer than automated ones:
```bash
--timeout=0  # Disables test-level timeout completely
```

By default, Playwright has a 30-second timeout, which works great for automated tests but isn't sufficient for human decision-making. Learn more about [timeout configuration](https://playwright.dev/docs/test-cli#:~:text=%2D%2Dtimeout%20%3Ctimeout%3E,default%3A%2030%20seconds).




⸻

## 3. 📊 Reporting

Great news! Cyborg Tests work seamlessly with all your favorite Playwright reporters. The easiest way to get started is with the built-in HTML reporter, but you have plenty of options.

### Supported ALL playwright-test compatible reporters!

### Recommended Configuration

We **highly recommend** enabling visual artifacts for your Cyborg test runs. This creates a complete record of both your manual actions and automated execution for future review and debugging:

```ts
// playwright.config.ts
export default defineConfig({
  reporters: [
    ["html", { open: "never" }], // Generate HTML report
    ["blob"], // For report merging (if using report server)
  ],
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure", 
    screenshot: {
      mode: "retain-on-failure",
      fullPage: true,
    },
  },
});
```

### Managing Test Results

⚠️ **Important**: Each test execution will override previous results by default.

**To preserve results:**
- **Copy** the `test-results` folder after each run
- **Use a report server** (see section 5) for centralized storage
- **Archive important runs** with meaningful names

### Best Practices

🎯 **Enable full-page screenshots** to capture complete context  
🎯 **Record videos** to understand user interactions  
🎯 **Keep traces** for detailed debugging information  
🎯 **Use meaningful test names** for easier result identification

⸻

## 4. 👥 Assigning Tests to Team Members

One of the most powerful features of Cyborg Tests is the ability to distribute test execution across your QA team. Here's how to set up test ownership and assignment!

### Setting Up User Identification

Cyborg Tests uses two methods to identify who should run which tests (in order of priority):

1. **`QA_USERNAME` environment variable** (highest priority)
2. **Git username** from `git config user.name` (fallback)

### Creating Test Assignments

First, create a centralized file to manage your team assignments:

```ts
// tags.ts
export const OWNER = {
  ALEX_HOT: "@alexhot",
  BILL_GATES: "@billgates",
  SAM_ALTMAN: "@sam_altman",
};
```

Then assign tests to specific team members:

```ts
// cart.cyborg.test.ts
import test from "@cyborgtests/test";
import { OWNER } from "../tags";

test(
  "shopping cart quantity update",
  {
    tag: [OWNER.ALEX_HOT, "@CYBORG"],
  },
  async ({ page, manualStep }) => {
    await page.goto("/cart");
    await manualStep(
      "In the shopping cart, locate a product with a quantity selector"
    );
    await manualStep("Change the quantity value");
    await manualStep(
      "Verify the cart updates to reflect the new quantity and recalculates the total price accordingly"
    );
  }
);
```

### Filtering Tests by Owner

Configure your Playwright setup to automatically filter tests based on the current user:

```ts
// playwright.config.ts
import { execSync } from 'child_process';

export default defineConfig({
  projects: [
    {
      name: "cyborg-tests",
      grep: new RegExp(
        process.env.QA_USERNAME || 
        execSync('git config user.name', { encoding: 'utf8' }).trim() || 
        ""
      ),
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
```

### Benefits of Test Assignment

🎯 **Parallel execution**: Multiple QA engineers can work simultaneously  
🎯 **Specialization**: Assign tests based on domain expertise  
🎯 **Load balancing**: Distribute workload evenly across the team  
🎯 **Accountability**: Clear ownership of test results

### Pro Tips for Team Management

💡 **Use descriptive owner names** that match your team structure  
💡 **Consider domain expertise** when assigning tests (e.g., payment expert handles checkout tests)  
💡 **Rotate assignments** periodically to cross-train team members  
💡 **Have backup assignments** for when team members are unavailable

⸻

## 5. 🤝 Combining with Automated Tests

Here's the beautiful part: **you don't need to separate Cyborg tests from your automated tests!** They work together harmoniously in the same ecosystem.

### The Perfect Harmony

✨ **Same repository**: All tests live together  
✨ **Same test runner**: Use Playwright for everything  
✨ **Same reporting**: Unified results and insights  
✨ **Same tooling**: Leverage your existing setup

The only difference is where you strategically place `manualStep()` calls!

### Gradual Automation Strategy

This setup makes it incredibly easy to **gradually evolve your testing strategy**:

1. **Start manual**: Create a test with multiple manual steps
2. **Go hybrid**: Automate some parts, keep manual verification
3. **Full automation**: Remove manual steps as automation improves

### Best Practices for Mixed Testing

#### Tag Your Tests Clearly

Always tag tests that contain manual steps:

```ts
test("shopping cart quantity update", { 
  tag: [OWNER.ALEX_HOT, "@CYBORG"] 
}, async ({ page, manualStep }) => {
  // Your test logic here
});
```

#### Separate Automated and Manual Runs

Configure different projects for different execution contexts:

```ts
// playwright.config.ts
export default defineConfig({
  projects: [
    // For CI/automated runs - exclude manual tests
    {
      name: "automated",
      grepInvert: new RegExp("@CYBORG"),
      use: { ...devices["Desktop Chrome"] },
    },
    // For manual QA sessions - include manual tests  
    {
      name: "cyborg",
      grep: new RegExp("@CYBORG"),
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

#### Organize Your Test Files

You have flexibility in how you structure your tests:

**Option 1: Mixed files** (good for related test cases)
```
cart.test.ts  // Contains both automated and manual tests
```

**Option 2: Separate files** (good for clear separation)
```
cart.test.ts        // Automated tests only
cart.cyborg.test.ts // Manual/hybrid tests only
```

### 🚀 Advanced: Unified Reporting

Want a **single comprehensive report** combining all your automated and manual test results? Here's how:

#### Required Components

1. **[Playwright Reports Server](https://github.com/CyborgTests/playwright-reports-server)** - Merges and serves combined reports
2. **[Reporter Plugin](https://github.com/CyborgTests/reporter-playwright-reports-server)** - Publishes results to the server
3. **Blob Reporter** - Generates raw result data

#### Setup Configuration

```ts
// playwright.config.ts
export default defineConfig({
  reporters: [
    ["blob"], // Required for report merging
    ["@cyborgtests/reporter-playwright-reports-server", {
      serverUrl: "http://your-reports-server.com"
    }],
  ],
});
```

#### The Unified Workflow

1. **CI runs automated tests** → Results published to server
2. **QA team runs manual tests** → Results published to server  
3. **Generate combined report** → Single HTML report with all results

This gives you the complete picture of your application's quality! 📊



⸻

## 6. 🎯 Advanced Tips & Best Practices

### Enhance Your Tests with Metadata

Take advantage of Playwright's powerful annotation system to make your Cyborg tests even more informative:

#### Using Tags for Organization
```ts
test("payment flow validation", {
  tag: ["@CYBORG", "@payment", "@critical", "@regression"]
}, async ({ page, manualStep }) => {
  // Your test logic
});
```

**Use tags when you want to:**
- **Filter tests** (by feature, owner, severity, etc.)
- **Group related tests** for execution
- **Organize test suites** by domain or priority

#### Using Annotations for Context
```ts
test("complex user journey", async ({ page, manualStep }) => {
  test.info().annotations.push(
    { type: "issue", description: "https://jira.company.com/PROJ-123" },
    { type: "documentation", description: "See user guide section 4.2" },
    { type: "note", description: "Pay special attention to loading states" }
  );
  
  // Your test logic
});
```

**Use annotations to provide:**
- **Links to requirements** or user stories
- **References to bug reports** or issues
- **Special instructions** for testers
- **Documentation links** for complex features

### Leverage Your Existing Code

🔄 **Reuse everything!** Cyborg tests work seamlessly with your existing Playwright infrastructure:

```ts
// Reuse page objects
import { LoginPage } from '../pages/LoginPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';

// Reuse API helpers  
import { createTestUser, setupTestData } from '../helpers/api';

test("end-to-end checkout flow", async ({ page, manualStep }) => {
  // Use existing API setup
  const user = await createTestUser();
  await setupTestData(user.id);
  
  // Use existing page objects
  const loginPage = new LoginPage(page);
  await loginPage.login(user.email, user.password);
  
  const cartPage = new ShoppingCartPage(page);
  await cartPage.addProductToCart("premium-widget");
  
  // Add manual verification where automation falls short
  await manualStep("Verify the checkout form displays correct tax calculations for your region");
});
```

### Writing Effective Manual Steps

✍️ **Craft clear, actionable manual steps:**

```ts
// ❌ Vague and unhelpful
await manualStep("Check if everything looks good");

// ✅ Clear and specific
await manualStep("Verify the product image displays correctly and matches the product title");

// ✅ Include context and expected outcome
await manualStep("Click the 'Apply Discount' button and confirm the total price updates to show the 10% discount");

// ✅ Provide guidance for edge cases
await manualStep("Test the search functionality with special characters (e.g., '@', '#', '&') - results should handle these gracefully without errors");
```

### Performance Considerations

⚡ **Optimize your manual testing sessions:**

- **Group related tests** to maintain context and flow
- **Prepare test data** in advance to avoid delays
- **Use meaningful test names** that describe the user scenario
- **Keep manual steps focused** on what truly requires human judgment

### Community & Collaboration

🌟 **Share your success stories!**

- **Contribute patterns** that work well for your team
- **Share innovative use cases** on our Discord community
- **Report issues and suggest improvements** on GitHub
- **Help other teams** by documenting your lessons learned


**Happy testing with Cyborg Tests!** 🤖✨

Remember: The goal isn't to replace all automation, but to create the perfect balance between automated efficiency and human insight. You've got this! 💪
