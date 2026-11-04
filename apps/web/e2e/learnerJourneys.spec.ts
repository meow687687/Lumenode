import { test, expect, Page } from '@playwright/test';

async function dismissTourIfPresent(page: Page) {
  try {
    const modal = page.getByRole('dialog', { name: 'Explore. Understand. Build.' });
    if (await modal.isVisible({ timeout: 1500 })) {
      const skipBtn = modal.getByRole('button', { name: 'Skip Tour' }).first();
      await skipBtn.click();
      await expect(modal).not.toBeVisible();
    }
  } catch {
    // Modal already absent
  }
}

test.describe('Lumenode Real Browser E2E Learner Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Journey 1: First-time learner onboarding, step navigation, and skip persistence', async ({ page }) => {
    // 1. Onboarding tour auto-launches on clean session
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { level: 2 })).toHaveText('Explore. Understand. Build.');
    await expect(modal.getByText('Welcome to Lumenode')).toBeVisible();

    // 2. Next step navigation
    const nextBtn = modal.getByRole('button', { name: 'Next' });
    await nextBtn.click();
    await expect(modal.getByText('Concept-First, Language-Independent')).toBeVisible();

    // 3. Skip tour
    const skipBtn = modal.getByRole('button', { name: 'Skip Tour' }).first();
    await skipBtn.click();
    await expect(modal).not.toBeVisible();

    // 4. Reload page and verify onboarding stays dismissed
    await page.reload();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 5. Re-launch onboarding manually from Header
    const tourHelpBtn = page.getByRole('button', { name: 'Platform Tour & Guide' });
    await tourHelpBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Journey 2: Cross-curriculum global search and keyboard discovery', async ({ page }) => {
    await dismissTourIfPresent(page);

    // Trigger Search Modal via Header
    const searchBtn = page.getByRole('button', { name: /Search/i });
    await searchBtn.click();

    const searchInput = page.getByPlaceholder(/Search lessons, concepts, languages/i);
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('pointers');
    const resultItem = page.getByRole('option', { name: /Demystifying Pointers/i }).first();
    await expect(resultItem).toBeVisible();

    // Navigate to lesson
    await resultItem.click();
    await expect(page).toHaveURL(/.*\/lessons\/c-pointers-basics/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Journey 3: Subject navigation and curriculum drill-down', async ({ page }) => {
    await dismissTourIfPresent(page);

    // Go to Explore
    await page.goto('/explore');
    await dismissTourIfPresent(page);

    await expect(page.getByRole('heading', { name: 'Knowledge Catalog & Curricula' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'C Programming', level: 3 })).toBeVisible();

    // Deep link to a concept
    await page.goto('/concepts/memory.pointers-intro');
    await dismissTourIfPresent(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pointers and Virtual Memory Addressing/i);
  });

  test('Journey 4: Interactive simulation player controls (Step Forward, Backward, Reset)', async ({ page }) => {
    // Navigate directly to BST laboratory
    await page.goto('/labs/bst');
    await dismissTourIfPresent(page);

    await expect(page.getByRole('heading', { name: 'Binary Search Tree (BST) Laboratory' })).toBeVisible();

    // Trigger In-Order traversal simulation
    const inOrderBtn = page.getByRole('button', { name: 'In-Order' });
    await inOrderBtn.click();

    // Verify simulation container renders
    await expect(page.getByText(/Step \d+ of \d+/i)).toBeVisible();

    // Click Step Forward
    const stepForwardBtn = page.getByTitle(/Step Forward/i);
    await expect(stepForwardBtn).toBeVisible();
    await stepForwardBtn.click();

    // Verify step progression
    await expect(page.getByText(/Step [1-9] of \d+/i)).toBeVisible();

    // Click Step Backward
    const stepBackwardBtn = page.getByTitle(/Step Backward/i);
    await stepBackwardBtn.click();
  });

  test('Journey 5: In-browser SQL execution via Web Worker and SQLite WASM', async ({ page }) => {
    await page.goto('/labs/sql');
    await dismissTourIfPresent(page);

    // Ensure SQL playground loaded
    await expect(page.getByText(/SQL Playground/i)).toBeVisible();

    // Click Execute Query
    const executeBtn = page.getByRole('button', { name: /Run SQL/i });
    await executeBtn.click();

    // Results table should render rows
    await expect(page.locator('table')).toBeVisible();
  });

  test('Journey 6: In-browser Python sandbox execution via Pyodide WASM Worker', async ({ page }) => {
    await page.goto('/labs/code');
    await dismissTourIfPresent(page);

    // Ensure Code sandbox loaded
    await expect(page.getByText(/Code Execution Laboratory/i)).toBeVisible();

    // Select Python
    const pyBtn = page.getByRole('button', { name: /Python \(Pyodide WASM\)/i });
    await pyBtn.click();

    // Run Code
    const runBtn = page.getByRole('button', { name: /^Run$/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // Verify terminal output renders
    await expect(page.locator('pre').first()).toBeVisible();
  });

  test('Journey 7: Responsive mobile viewport and hamburger navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await dismissTourIfPresent(page);

    // Hamburger button should be visible on mobile
    const menuBtn = page.getByRole('button', { name: /Toggle navigation menu/i });
    await expect(menuBtn).toBeVisible();

    // Open sidebar
    await menuBtn.click();
    await expect(page.getByText('Foundational Curricula')).toBeVisible();

    // Close or navigate
    const exploreLink = page.getByRole('link', { name: /Explore All Subjects/i });
    await exploreLink.click();
    await expect(page).toHaveURL(/.*\/explore/);
  });

  test('Journey 8: Truthful reporting when remote C/C++ compiler gateway is offline', async ({ page }) => {
    await page.goto('/labs/code');
    await dismissTourIfPresent(page);

    // Switch to C
    const cBtn = page.getByRole('button', { name: /C \(GCC 13\)/i });
    await cBtn.click();

    // Should indicate remote execution requirement rather than fabricating fake outputs
    await expect(page.getByText(/Remote Gateway Pending/i)).toBeVisible();
  });

  test('Journey 9: Beta Feedback submission and local queuing', async ({ page }) => {
    await page.goto('/');
    await dismissTourIfPresent(page);

    // Open Feedback modal
    const feedbackBtn = page.getByRole('button', { name: 'Beta Feedback & Suggestions' });
    await feedbackBtn.click();

    const feedbackModalHeading = page.getByRole('heading', { name: 'Beta Feedback & Suggestions' });
    await expect(feedbackModalHeading).toBeVisible();

    // Select suggestion
    await page.getByRole('button', { name: 'Suggestion', exact: true }).click();

    // Fill comment
    const commentInput = page.getByPlaceholder(/What was confusing, inspiring, or broken/i);
    await commentInput.fill('Please add a 3D visualization for cache associative sets!');

    // Submit
    const submitBtn = page.getByRole('button', { name: /Submit Feedback/i });
    await submitBtn.click();

    // Verify confirmation
    await expect(page.getByRole('heading', { name: 'Thank You for Your Feedback!' })).toBeVisible();
  });
});
