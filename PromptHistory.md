# Prompt History — Task Manager Workshop Demo

This file consolidates the prompts used to build this project, each updated
to fold in follow-up steps that were requested afterward but weren't in the
original prompt. Running these updated versions from scratch would produce
the final result in one pass.

---

## 1. Build the app

> Act as a software developer.
>
> I have provided a very small user story above for a workshop demonstration.
>
> Your goal is to build ONLY the minimum working application required to
> satisfy the user story and its 5 acceptance criteria.
>
> IMPORTANT CONSTRAINTS:
> - Build a very small Task Manager web application.
> - Use only HTML, CSS and vanilla JavaScript.
> - Do NOT use React, Angular, Vue, Node backend, database, API or authentication.
> - Do NOT add features that are not explicitly mentioned in the user story.
> - Keep the project to approximately 3–5 files.
> - The application must run locally with a simple web server and must
>   also work when opened directly via the VS Code "Live Server" extension,
>   with no code changes (plain static files, relative paths only, no build
>   step).
> - Keep the UI simple.
> - Use clear IDs and accessible buttons/inputs so Playwright can automate it
>   easily.
>
> The application must support ONLY:
> 1. Add a task
> 2. Prevent an empty task
> 3. Mark a task as completed
> 4. Delete a task
> 5. Display and update the incomplete-task counter
>
> First briefly explain your implementation approach. Then create the
> complete project.
>
> Do NOT create test cases. Do NOT create automation. Do NOT create CI/CD.
> Do NOT add extra functionality.
>
> The purpose of this project is a short AI-assisted engineering workshop
> demo, so simplicity is more important than production-level architecture.

---

## 2. Create the manual test cases

> Now act as a QA Engineer.
>
> Using ONLY the user story and acceptance criteria provided above, create a
> SMALL manual test suite for this workshop demonstration.
>
> Create EXACTLY 6 test cases. Do NOT create more than 6. Focus only on the
> most important functional scenarios.
>
> Use this coverage:
> - TC01 - Add a valid task
> - TC02 - Try to add an empty task
> - TC03 - Mark a task as completed
> - TC04 - Delete a task
> - TC05 - Verify incomplete-task counter after adding and completing a task
> - TC06 - End-to-end flow: add a task → complete it → delete it
>
> Do NOT create separate tests for: browsers, accessibility, performance,
> security, responsive design, API, database, login, usability, exploratory
> testing, boundary testing, duplicate tasks, special characters, long text,
> multiple users, or error handling other than the empty-task validation.
> These are intentionally OUT OF SCOPE.
>
> For each test case provide only: Test Case ID, Test Scenario,
> Preconditions, Test Steps, Expected Result, Priority.
>
> Keep the test cases short and easy to demonstrate. Return exactly 6 test
> cases and nothing more.
>
> Save all 6 test cases into a file (e.g., `TestCases.md`) in the same
> folder as `UserStory.docx`, rather than only outputting them in chat.

---

## 3. Automate the test cases

> Now act as a Senior SDET / Automation Engineer.
>
> Using the EXACT 6 manual test cases created above, convert them into
> Playwright automated tests.
>
> - Automate ONLY these 6 test cases. Do NOT create additional test cases.
> - Use Playwright with TypeScript.
> - Keep the automation simple. Do not introduce Page Object Model unless it
>   genuinely simplifies the small project.
> - Use stable IDs or accessible locators. Do not use hard-coded waits. Use
>   clear assertions.
> - Each automated test must map to exactly one manual test case.
>
> Create:
> - `tests/task-manager.spec.ts`
> - `playwright.config.ts`
>
> Add comments showing the mapping (TC01 → Add valid task, TC02 → Empty task
> validation, TC03 → Complete task, TC04 → Delete task, TC05 → Task counter,
> TC06 → End-to-end task lifecycle). Do not create any other tests.
>
> Once the automation code works, commit it and push directly to the
> `main` branch of the repository — no feature branch or pull request needed
> for this workshop repo.

---

## 4. Create and stand up the Jenkins pipeline

> Act as a DevOps Engineer.
>
> I have a Playwright TypeScript project stored in a Git repository:
> https://github.com/Sarita1901/flo-automation-workshop/tree/main
>
> Create a Jenkins Pipeline configuration that will:
> 1. Checkout the code from the Git repository.
> 2. Install the required Node.js dependencies.
> 3. Install Playwright Chromium.
> 4. Run the existing Playwright test suite.
> 5. Do NOT create or modify any test cases.
> 6. Publish the Playwright HTML report as a Jenkins build artifact.
> 7. Mark the Jenkins build as FAILED if any Playwright test fails.
> 8. Keep the pipeline simple and suitable for a workshop demonstration.
>
> The project currently contains exactly 6 Playwright tests.
>
> Create a `Jenkinsfile` for this project. Jenkins is running locally at
> `http://localhost:8080/` (I'll provide login credentials for API access).
>
> Commit and push the `Jenkinsfile` to `main` first. Then, don't just write
> the file — actually create the Pipeline job in the running Jenkins instance
> (e.g. "Pipeline script from SCM" pointing at this repo/branch/Jenkinsfile),
> trigger a build, and confirm it completes successfully end-to-end.
>
> After creating it, explain each pipeline stage in simple terms.

---

## 5. Fix/extend the test report

> The Playwright HTML report (`playwright-report/index.html`) appears blank
> when opened by double-clicking it directly — because it's a JS-module
> single-page app that browsers block from loading over the `file://`
> protocol.
>
> Create an additional, plain static HTML report (no JS modules, no fetch
> calls) that lists each of the 6 test cases with its pass/fail status and
> duration, so it can be opened directly in a browser with no server needed.
>
> Update the Jenkins pipeline so this new summary report is generated and
> archived as a build artifact alongside the existing Playwright HTML
> report.
