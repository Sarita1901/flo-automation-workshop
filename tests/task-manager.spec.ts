import { test, expect } from '@playwright/test';

/**
 * Automated coverage for the Simple Task Manager (US-001).
 * Each test below automates exactly one manual test case from TestCases.md.
 *
 * TC01 → Add valid task
 * TC02 → Empty task validation
 * TC03 → Complete task
 * TC04 → Delete task
 * TC05 → Task counter
 * TC06 → End-to-end task lifecycle
 */

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

// TC01 → Add valid task
test('TC01 - Add a valid task', async ({ page }) => {
  const taskInput = page.getByLabel('New task');
  const addButton = page.getByRole('button', { name: 'Add Task' });

  await taskInput.fill('Buy groceries');
  await addButton.click();

  await expect(page.locator('.task-item').filter({ hasText: 'Buy groceries' })).toBeVisible();
  await expect(taskInput).toHaveValue('');
});

// TC02 → Empty task validation
test('TC02 - Try to add an empty task', async ({ page }) => {
  const addButton = page.getByRole('button', { name: 'Add Task' });
  const errorMessage = page.locator('#errorMessage');

  await expect(errorMessage).toBeHidden();

  await addButton.click();

  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText(/task cannot be empty/i);
  await expect(page.locator('.task-item')).toHaveCount(0);
});

// TC03 → Complete task
test('TC03 - Mark a task as completed', async ({ page }) => {
  const taskName = 'Read a book';
  await page.getByLabel('New task').fill(taskName);
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskItem = page.locator('.task-item').filter({ hasText: taskName });
  const completeCheckbox = page.getByRole('checkbox', { name: `Mark "${taskName}" as completed` });

  await completeCheckbox.check();

  await expect(completeCheckbox).toBeChecked();
  await expect(taskItem).toHaveClass(/completed/);
});

// TC04 → Delete task
test('TC04 - Delete a task', async ({ page }) => {
  const taskName = 'Walk the dog';
  await page.getByLabel('New task').fill(taskName);
  await page.getByRole('button', { name: 'Add Task' }).click();

  const taskItem = page.locator('.task-item').filter({ hasText: taskName });
  await expect(taskItem).toBeVisible();

  await page.getByRole('button', { name: `Delete "${taskName}"` }).click();

  await expect(taskItem).toHaveCount(0);
});

// TC05 → Task counter
test('TC05 - Verify incomplete-task counter after adding and completing a task', async ({ page }) => {
  const taskName = 'Pay bills';
  const counter = page.locator('#taskCounter');

  await expect(counter).toHaveText('0 incomplete tasks');

  await page.getByLabel('New task').fill(taskName);
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(counter).toHaveText('1 incomplete task');

  await page.getByRole('checkbox', { name: `Mark "${taskName}" as completed` }).check();
  await expect(counter).toHaveText('0 incomplete tasks');
});

// TC06 → End-to-end task lifecycle
test('TC06 - End-to-end flow: add a task, complete it, delete it', async ({ page }) => {
  const taskName = 'Finish report';
  const counter = page.locator('#taskCounter');
  const taskItem = page.locator('.task-item').filter({ hasText: taskName });

  // Add
  await page.getByLabel('New task').fill(taskName);
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(taskItem).toBeVisible();
  await expect(counter).toHaveText('1 incomplete task');

  // Complete
  await page.getByRole('checkbox', { name: `Mark "${taskName}" as completed` }).check();
  await expect(taskItem).toHaveClass(/completed/);
  await expect(counter).toHaveText('0 incomplete tasks');

  // Delete
  await page.getByRole('button', { name: `Delete "${taskName}"` }).click();
  await expect(taskItem).toHaveCount(0);
  await expect(counter).toHaveText('0 incomplete tasks');
});
