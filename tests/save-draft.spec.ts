import { test, expect } from '@playwright/test';
import { YammerFeedPage } from '../page-objects/yammer-feed-page';
import { draftPostData } from '../test-data/draft-post-data';

/**
 * TC_001 — Save a New Post as Draft
 *
 * Preconditions:
 * - A `storageState` (auth/user.json) with a signed-in Microsoft 365 session
 *   is available. See README for how to capture it.
 * - The signed-in user is a member of the "FLO 2026" community.
 */
test.describe('Yammer / Viva Engage — Drafts', () => {
    test('TC_001 - Save a new post as draft in FLO 2026 community', async ({ page }) => {
        const feed = new YammerFeedPage(page);

        await test.step('Open Viva Engage feed', async () => {
            await feed.goto();
        });

        await test.step('Open composer in FLO 2026 community', async () => {
            await feed.openComposerInCommunity(draftPostData.community);
        });

        await test.step('Enter post content', async () => {
            await feed.enterPostContent(draftPostData.content);
        });

        await test.step('Save as draft', async () => {
            await feed.saveAsDraft();
            await feed.verifyDraftSaved();
        });

        await test.step('Verify draft exists in Drafts list', async () => {
            await feed.openDraftsList();
            await feed.assertDraftExists(draftPostData.snippet);
        });
    });
});
