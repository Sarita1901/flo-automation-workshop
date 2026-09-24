# FLO Yammer / Viva Engage Automation

Playwright + TypeScript automation for **TC_001 — Save a New Post as Draft** in Yammer / Viva Engage.

## Project Structure

```
FloProject/
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── page-objects/
│   └── yammer-feed-page.ts       # Page Object for feed + composer
├── test-data/
│   └── draft-post-data.ts        # Community name + post content
└── tests/
    └── save-draft.spec.ts        # TC_001 test spec
```

## Setup

```powershell
cd C:\FLO\FloProject
npm install
npx playwright install chromium
```

### Capture a signed-in session (one-time)

Viva Engage requires Microsoft 365 SSO. Capture a session so tests don't have to sign in every run:

```powershell
npx playwright codegen https://engage.cloud.microsoft/main/feed --save-storage=auth/user.json
```

Complete the SSO flow in the launched browser, close it, then in `playwright.config.ts` uncomment:

```ts
storageState: 'auth/user.json',
```

## Run

```powershell
npm run test:draft         # runs TC_001 headed
npm test                   # runs everything
npm run report             # opens HTML report
```

---

## 1. Test Case File — `tests/save-draft.spec.ts`

Uses `test.step()` blocks that mirror the scenario:
1. Open feed → 2. Open composer → 3. Select FLO 2026 → 4. Enter content → 5. Save as draft → 6. Verify draft in Drafts list.

## 2. Page Object — `page-objects/yammer-feed-page.ts`

Encapsulates:
- `goto()` — navigates to `/main/feed`
- `openComposer()` — clicks "New post"
- `selectCommunity(name)` — opens community picker, searches, selects
- `enterPostContent(text)` — fills the contenteditable body
- `saveAsDraft()` — clicks Save as Draft (with fallback to overflow menu)
- `verifyDraftSaved()` — asserts the "Draft saved" toast
- `openDraftsList()` / `assertDraftExists(snippet)` — post-save verification

## 3. Test Data — `test-data/draft-post-data.ts`

Isolates the community name, post body, and a stable snippet used to find the draft in the Drafts list.

---

## 4. Explanation of Locators

Preference order used throughout the Page Object:

| Priority | Strategy | Why |
|----------|----------|-----|
| 1 | `getByRole()` with accessible name | Resilient to CSS changes; matches how users interact |
| 2 | `getByPlaceholder()` / `getByText()` | User-facing, semi-stable |
| 3 | `[contenteditable="true"]` scoped to the composer dialog | Rich-text editors expose no textbox role by default |
| 4 | `.or()` fallbacks | Guards against minor label wording changes |

**Scoping:** the composer is a modal `role="dialog"`. All composer-internal locators are chained off `composerDialog` to avoid matching stray elements on the feed underneath.

**⚠ These locators are assumptions.** Viva Engage's DOM is not publicly documented. Every locator marked in the file should be validated with `npx playwright codegen` against the live app, and adjusted if the accessible names or structure differ in your tenant.

## 5. Explanation of Assertions

| Assertion | Why it's meaningful |
|-----------|---------------------|
| `expect(newPostButton).toBeVisible()` after `goto` | Confirms the feed rendered and the user is authenticated |
| `expect(composerDialog).toBeVisible()` | Confirms the modal actually opened before we interact |
| `expect(composerDialog).toContainText(communityName)` | Confirms community selection was applied — not just clicked |
| `expect(postBodyEditor).toContainText(content)` | Guards against Yammer's rich editor silently swallowing input |
| `expect(draftSavedIndicator).toBeVisible()` | Confirms the save succeeded server-side, not just that the button was clicked |
| `expect(draftsList).toContainText(snippet)` | End-to-end proof: the draft is actually persisted and retrievable |

All assertions use Playwright's **web-first assertions** — no `waitForTimeout`, no polling primitives. Playwright auto-retries each assertion until the configured `expect.timeout` (15s).

## 6. Assumptions & Risks

### Assumptions
1. **Authentication:** a stored `storageState` for a Microsoft 365 user is available. Interactive SSO (MFA, Conditional Access) is not scripted.
2. **Membership:** the signed-in user is a member of a community named exactly **FLO 2026**.
3. **UI:** Viva Engage exposes a composer as a `role="dialog"` with a Fluent UI-style community picker and a contenteditable body. Actual DOM should be verified.
4. **Draft feature:** the tenant has drafts enabled (some Viva Engage feature-flag rollouts hide it).
5. **URL:** `https://engage.cloud.microsoft/main/feed` is the correct entry point. Some tenants still land on `web.yammer.com`.

### Risks
- **Locator drift:** Yammer/Viva Engage ships UI updates frequently. Prefer role-based locators (already done) and add `data-testid`s if you own the app.
- **Toast timing:** the "Draft saved" toast is short-lived. If flakiness appears, swap the toast assertion for `openDraftsList()` verification only.
- **Multiple "FLO 2026" matches:** if any community name contains "FLO 2026" as a substring, the regex match may pick the wrong option. Tighten to `^FLO 2026$` once confirmed.
- **Overflow menu variation:** "Save as draft" is sometimes a primary button, sometimes hidden behind a caret. The Page Object handles both, but the fallback labels (`more|options|caret|▼`) should be verified.
- **Tenant policy:** some orgs disable Drafts or restrict posting to certain communities via policy; test will fail as a real assertion failure, not a bug.
- **MFA / session expiry:** the stored `storageState` will eventually expire and require re-capture.

## Recommended Next Steps

1. Run `npx playwright codegen` against the live app and confirm every locator marked as an assumption.
2. If your team owns any part of the composer, add `data-testid` attributes for the community picker, body editor, and Save-as-draft menu item.
3. Add an `afterEach` cleanup step that deletes the created draft via the drafts list, so repeated runs don't accumulate drafts.
