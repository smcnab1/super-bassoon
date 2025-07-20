const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:8000/src/pages/assessments/brief/generate.html';

// Example valid assessment JSON for import
const validAssessment = {
  assessmentKey: 'ED70011X',
  assessmentTitle: 'Foundations of Simulation Education',
  overview: 'Overview text',
  requirements: ['Requirement 1', 'Requirement 2'],
  criteria: ['Criterion 1', 'Criterion 2'],
  tools: ['Tool 1', 'Tool 2'],
  prepare: ['Prepare 1', 'Prepare 2'],
  importantNote: 'Important note here.'
};

// Utility: wait for toast
async function waitForToast(page, text) {
  await expect(page.locator('#toastContainer')).toContainText(text, { timeout: 3000 });
}

test.describe('Assessment Brief Generate Page', () => {
  test('should load the page and display main UI elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('h1')).toContainText('Generate Assessment Brief');
    await expect(page.locator('#mainContentContainer')).toBeVisible();
    await expect(page.locator('a.skip-link')).toBeVisible();
    await expect(page.locator('#footer-container')).toBeVisible();
  });

  test('should allow preset selection and update review', async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for preset buttons to load
    await page.waitForSelector('.preset-btn');
    // Click the first enabled preset button
    const btns = page.locator('.preset-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      // If modal appears, select first cohort/assessment
      const modal = page.locator('#assessmentSelectModal');
      if (await modal.isVisible()) {
        const cohortBtn = modal.locator('.cohort-btn');
        await cohortBtn.first().click();
      }
      // Review section should update
      await expect(page.locator('#review')).toContainText('Overview');
    }
  });

  test('should import valid JSON via text and update review', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#importJsonContainer');
    // Open JSON import section if collapsed
    const sectionHeader = page.locator('.section-header');
    if (await sectionHeader.count() > 0) await sectionHeader.first().click();
    // Switch to paste tab
    const pasteTab = page.locator('.tab-btn').first();
    await pasteTab.click();
    // Paste JSON and import
    await page.fill('#jsonTextarea', JSON.stringify(validAssessment));
    await page.click('#importFromText');
    await waitForToast(page, 'JSON preset imported successfully');
    await expect(page.locator('#review')).toContainText('Foundations of Simulation Education');
  });

  test('should import valid JSON via file and update review', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#importJsonContainer');
    // Open JSON import section if collapsed
    const sectionHeader = page.locator('.section-header');
    if (await sectionHeader.count() > 0) await sectionHeader.first().click();
    // Switch to file tab
    const fileTab = page.locator('.tab-btn').nth(1);
    await fileTab.click();
    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('.file-select-btn');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'assessment.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(validAssessment)) });
    await page.click('#importFromFile');
    await waitForToast(page, 'JSON file imported successfully');
    await expect(page.locator('#review')).toContainText('Foundations of Simulation Education');
  });

  test('should show error toast for invalid JSON import', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('#importJsonContainer');
    // Open JSON import section if collapsed
    const sectionHeader = page.locator('.section-header');
    if (await sectionHeader.count() > 0) await sectionHeader.first().click();
    // Switch to paste tab
    const pasteTab = page.locator('.tab-btn').first();
    await pasteTab.click();
    // Paste invalid JSON and import
    await page.fill('#jsonTextarea', '{invalid json');
    await page.click('#importFromText');
    await waitForToast(page, 'Invalid JSON format');
  });

  test('should require submission date for actions', async ({ page }) => {
    await page.goto(BASE_URL);
    // Load a preset to enable actions
    await page.waitForSelector('.preset-btn');
    const btns = page.locator('.preset-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      // If modal appears, select first cohort/assessment
      const modal = page.locator('#assessmentSelectModal');
      if (await modal.isVisible()) {
        const cohortBtn = modal.locator('.cohort-btn');
        await cohortBtn.first().click();
      }
    }
    // Clear submission date
    await page.fill('#submissionDate', '');
    // Try to click Preview
    await page.click('#previewBtn');
    await waitForToast(page, 'Please select a submission date');
    // Set submission date
    const now = new Date();
    const iso = now.toISOString().slice(0, 16);
    await page.fill('#submissionDate', iso);
    // Preview should now work
    await page.click('#previewBtn');
    // Preview frame should be shown or updated (if implemented)
  });

  test('should perform all PageTools actions', async ({ page }) => {
    await page.goto(BASE_URL);
    // Load a preset to enable actions
    await page.waitForSelector('.preset-btn');
    const btns = page.locator('.preset-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      // If modal appears, select first cohort/assessment
      const modal = page.locator('#assessmentSelectModal');
      if (await modal.isVisible()) {
        const cohortBtn = modal.locator('.cohort-btn');
        await cohortBtn.first().click();
      }
    }
    // Set submission date
    const now = new Date();
    const iso = now.toISOString().slice(0, 16);
    await page.fill('#submissionDate', iso);
    // Preview
    await page.click('#previewBtn');
    // New Tab (should open, but we can't check content in headless mode)
    await page.click('#openTabBtn');
    // Copy (should copy HTML to clipboard)
    await page.click('#copyBtn');
    // Reset (should show modal or reset data)
    await page.click('#resetBtn');
    // If modal appears, confirm reset
    const resetModal = page.locator('#resetModal');
    if (await resetModal.isVisible()) {
      const confirmBtn = resetModal.locator('button, .btn').first();
      await confirmBtn.click();
    }
    // Review should show warning or be cleared
    await expect(page.locator('#review')).toContainText('No assessment data');
  });

  test('should have collapsible review sections', async ({ page }) => {
    await page.goto(BASE_URL);
    // Load a preset to enable review
    await page.waitForSelector('.preset-btn');
    const btns = page.locator('.preset-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      // If modal appears, select first cohort/assessment
      const modal = page.locator('#assessmentSelectModal');
      if (await modal.isVisible()) {
        const cohortBtn = modal.locator('.cohort-btn');
        await cohortBtn.first().click();
      }
    }
    // Expand/collapse first review section
    const header = page.locator('.review-collapsible-header').first();
    await header.click();
    const content = header.locator('..').locator('.review-collapsible-content');
    expect(await content.getAttribute('class')).not.toContain('collapsed');
    await header.click();
    expect(await content.getAttribute('class')).toContain('collapsed');
  });

  test('should have a footer element after data is loaded', async ({ page }) => {
    await page.goto(BASE_URL);
    // Load a preset to enable footer
    await page.waitForSelector('.preset-btn');
    const btns = page.locator('.preset-btn:not([disabled])');
    if (await btns.count() > 0) {
      await btns.first().click();
      // If modal appears, select first cohort/assessment
      const modal = page.locator('#assessmentSelectModal');
      if (await modal.isVisible()) {
        const cohortBtn = modal.locator('.cohort-btn');
        await cohortBtn.first().click();
      }
    }
    await page.waitForFunction(() => {
      const el = document.querySelector('#footer-container .footer');
      return !!el;
    });
    const footer = page.locator('#footer-container .footer');
    expect(await footer.count()).toBeGreaterThan(0);
  });

  test('should have working skip link for accessibility', async ({ page }) => {
    await page.goto(BASE_URL);
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeVisible();
    await skipLink.focus();
    await skipLink.press('Enter');
    // Optionally check document.activeElement
  });
}); 