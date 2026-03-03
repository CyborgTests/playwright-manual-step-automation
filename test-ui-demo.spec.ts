import test from "./src";

test("demo: test confirmation dialog for Failed", async ({
  page,
  manualStep,
}) => {
  // Navigate to a test page
  await page.goto("https://example.com");

  // First step
  await manualStep.soft("This is the first manual step in the test");

  // Second step - for testing Failed button
  await manualStep.soft(
    "Now click the ❌ Failed button to see the confirmation dialog with the failure reason input",
  );
});

test("demo: test confirmation dialog for Skip", async ({
  page,
  manualStep,
}) => {
  // Navigate to a test page
  await page.goto("https://example.com");

  // Step
  await manualStep.soft("This is a manual step");

  // Second step - for testing Skip button
  await manualStep.soft(
    "Now click the Skip Step button to see the yellow confirmation dialog",
  );
});
