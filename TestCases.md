# Manual Test Suite — Simple Task Manager (US-001)

## TC01 — Add a valid task
- **Preconditions:** Task Manager app is loaded; task list is empty or has existing tasks.
- **Test Steps:**
  1. Click the task input field.
  2. Type a valid task name (e.g., "Buy groceries").
  3. Click **Add Task**.
- **Expected Result:** The task appears as a new item in the task list; input field is cleared.
- **Priority:** High

## TC02 — Try to add an empty task
- **Preconditions:** Task Manager app is loaded; task input field is empty.
- **Test Steps:**
  1. Leave the task input field empty.
  2. Click **Add Task**.
- **Expected Result:** No task is added to the list; a validation message is displayed indicating the task cannot be empty.
- **Priority:** High

## TC03 — Mark a task as completed
- **Preconditions:** At least one incomplete task exists in the task list.
- **Test Steps:**
  1. Locate an existing incomplete task in the list.
  2. Click its checkbox to mark it as completed.
- **Expected Result:** The task is visually distinguishable as completed (e.g., strikethrough/greyed text).
- **Priority:** High

## TC04 — Delete a task
- **Preconditions:** At least one task exists in the task list.
- **Test Steps:**
  1. Locate an existing task in the list.
  2. Click its **Delete** button.
- **Expected Result:** The task is removed from the list and no longer displayed.
- **Priority:** High

## TC05 — Verify incomplete-task counter after adding and completing a task
- **Preconditions:** Task Manager app is loaded; counter shows current incomplete-task count.
- **Test Steps:**
  1. Note the current incomplete-task counter value.
  2. Add a new task and verify the counter increases by 1.
  3. Mark that task as completed and verify the counter decreases by 1 (back to original value).
- **Expected Result:** The counter accurately reflects the number of incomplete tasks after each action.
- **Priority:** High

## TC06 — End-to-end flow: add a task → complete it → delete it
- **Preconditions:** Task Manager app is loaded.
- **Test Steps:**
  1. Add a new task using the input field and **Add Task** button.
  2. Verify the task appears in the list and the counter increases.
  3. Mark the task as completed and verify it is visually distinguishable and the counter decreases.
  4. Delete the task and verify it is removed from the list.
- **Expected Result:** The task moves correctly through add → complete → delete, with the list and counter updating accurately at each step.
- **Priority:** Medium
