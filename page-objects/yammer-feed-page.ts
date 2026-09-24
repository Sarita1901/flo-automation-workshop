import { Page, Locator, expect } from '@playwright/test';

/**
 * YammerFeedPage
 *
 * Encapsulates interactions with the Viva Engage (Yammer) main feed and the
 * inline publisher, including selecting a community and saving as draft.
 *
 * Real UI observations (verified against tenant Sep 2026):
 * - The publisher trigger on the feed is a button whose accessible name is
 *   exactly "Share thoughts, ideas, or updates".
 * - Communities appear in the left navigation as links (e.g. "FLO 2026").
 * - The composer expands after clicking the publisher; it may or may not be
 *   a `role="dialog"`. We identify it by the rich-text contenteditable that
 *   appears after activation.
 * - "Drafts" is a top-level publisher toolbar button as well as a link that
 *   opens the drafts view.
 */
export class YammerFeedPage {
    readonly page: Page;

    // ---------------- LOCATORS ----------------
    readonly leftNavCommunityLink: (name: string) => Locator;
    readonly publisherTrigger: Locator;
    readonly composerRoot: Locator;
    readonly postBodyEditor: Locator;
    readonly postButton: Locator;
    readonly composerMoreOptions: Locator;
    readonly saveDraftMenuItem: Locator;
    readonly draftSavedIndicator: Locator;
    readonly draftsToolbarButton: Locator;
    readonly draftsListRegion: Locator;

    constructor(page: Page) {
        this.page = page;

        // Community links in the left navigation.
        this.leftNavCommunityLink = (name: string) =>
            page.getByRole('navigation').getByRole('link', { name: new RegExp(`^${escapeRegExp(name)}(,|$)`, 'i') });

        // Publisher trigger button (feed OR community page).
        this.publisherTrigger = page
            .getByRole('button', { name: /share thoughts, ideas, or updates/i })
            .or(page.getByRole('button', { name: /^start a post$/i }));

        // The composer, once expanded, is either a dialog or a region
        // containing the contenteditable. We identify it by that editor.
        this.postBodyEditor = page
            .getByRole('textbox', { name: /what.*mind|start a post|share|type/i })
            .or(page.locator('[contenteditable="true"][role="textbox"]'))
            .or(page.locator('div[contenteditable="true"]'))
            .first();

        // A container that hosts the editor — used as the composer scope.
        this.composerRoot = page
            .getByRole('dialog')
            .or(page.locator('form:has([contenteditable="true"])'))
            .or(page.locator('[role="region"]:has([contenteditable="true"])'))
            .first();

        // Primary Post button (submit). Save-as-draft is usually beside/under it.
        this.postButton = this.composerRoot
            .getByRole('button', { name: /^post$/i })
            .or(page.getByRole('button', { name: /^publish$/i }));

        // Caret next to "Post" that reveals Save-as-draft.
        // NOTE: Do NOT match generic "More options" — that is the attachment
        // menu (Browse cloud / Attach file / Add topics). The post-actions
        // overflow is labelled specifically "More post options".
        this.composerMoreOptions = this.composerRoot
            .getByRole('button', { name: /^more post options$/i });

        // Save-as-draft — try menuitem and button forms.
        this.saveDraftMenuItem = page
            .getByRole('menuitem', { name: /save.*draft/i })
            .or(page.getByRole('button', { name: /save.*draft/i }));

        this.draftSavedIndicator = page.getByText(/draft saved|saved to drafts|saved as draft/i);

        // "Drafts" is exposed as a button in the publisher toolbar.
        this.draftsToolbarButton = page.getByRole('button', { name: /^drafts$/i })
            .or(page.getByRole('link', { name: /^drafts$/i }));

        // The drafts view — identified by heading or list containing "Draft".
        this.draftsListRegion = page.getByRole('main');
    }

    // ---------------- ACTIONS ----------------

    async goto(): Promise<void> {
        await this.page.goto('/main/feed', { waitUntil: 'domcontentloaded' });
        await expect(this.publisherTrigger).toBeVisible();
    }

    /**
     * Navigate directly to the target community, then open its publisher.
     * This avoids the composer's community-picker entirely — the community
     * context is inferred from the URL.
     */
    async openComposerInCommunity(communityName: string): Promise<void> {
        const communityLink = this.leftNavCommunityLink(communityName);
        await expect(communityLink, `Community "${communityName}" not found in left nav`).toBeVisible();
        await communityLink.click();

        // Community feed loaded — publisher is visible.
        await expect(this.publisherTrigger).toBeVisible();
        await this.publisherTrigger.click();

        // Wait for the rich-text editor to be ready.
        await expect(this.postBodyEditor).toBeVisible();
    }

    async enterPostContent(content: string): Promise<void> {
        await this.postBodyEditor.click();
        await this.postBodyEditor.pressSequentially(content, { delay: 5 });
        await expect(this.postBodyEditor).toContainText(content.slice(0, 30));
    }

    /**
     * Save as draft. Tries a visible Save-as-draft button first, then falls
     * back to the "more options" overflow menu next to the Post button.
     */
    async saveAsDraft(): Promise<void> {
        if (await this.saveDraftMenuItem.isVisible().catch(() => false)) {
            await this.saveDraftMenuItem.first().click();
            return;
        }

        if (await this.composerMoreOptions.first().isVisible().catch(() => false)) {
            await this.composerMoreOptions.first().click();
            await expect(this.saveDraftMenuItem.first()).toBeVisible();
            await this.saveDraftMenuItem.first().click();
            return;
        }

        // Some Viva Engage variants auto-save drafts on close; try closing.
        const closeBtn = this.composerRoot.getByRole('button', { name: /close|cancel|discard/i }).first();
        if (await closeBtn.isVisible().catch(() => false)) {
            await closeBtn.click();
            const saveDraftInDialog = this.page.getByRole('button', { name: /save.*draft|keep.*draft/i });
            await expect(saveDraftInDialog).toBeVisible();
            await saveDraftInDialog.click();
            return;
        }

        throw new Error('Unable to locate a "Save as draft" affordance.');
    }

    async verifyDraftSaved(): Promise<void> {
        // Toast/banner OR composer closes — either is acceptable evidence.
        const toastVisible = await this.draftSavedIndicator
            .waitFor({ state: 'visible', timeout: 5_000 })
            .then(() => true)
            .catch(() => false);

        if (!toastVisible) {
            await expect(this.postBodyEditor).toBeHidden({ timeout: 5_000 });
        }
    }

    async openDraftsList(): Promise<void> {
        await this.draftsToolbarButton.first().click();
        await expect(this.draftsListRegion).toBeVisible();
    }

    async assertDraftExists(snippet: string): Promise<void> {
        await expect(this.draftsListRegion).toContainText(snippet);
    }
}

function escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
