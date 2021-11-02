import { browser, by } from 'protractor';
import { SitePage } from './app.po';

describe('cookies popup', () => {
  const getButton = (idx: number) => page.cookiesPopup.all(by.css('.actions .mat-button')).get(idx);
  let page: SitePage;

  beforeEach(async () => {
    page = new SitePage();
    await page.navigateTo('', true);
  });

  afterEach(() => browser.executeScript('localStorage.clear()'));

  it('should be shown by default', async () => {
    expect(await page.cookiesPopup.isDisplayed()).toBe(true);
  });

  it('should open a new tab with more info when clicking the first button', async () => {
    // Click the "Learn more" button.
    await page.click(getButton(0));

    // Switch to the newly opened tab.
    const originalWindowHandle = await browser.getWindowHandle();
    const openedWindowHandle = (await browser.getAllWindowHandles()).pop() as string;
    await browser.switchTo().window(openedWindowHandle);
    await browser.waitForAngularEnabled(false);

    // Verify the tab's URL.
    expect(await browser.getCurrentUrl()).toBe('https://policies.google.com/technologies/cookies');

    // Close the tab and switch back to the original tab.
    await browser.waitForAngularEnabled(true);
    await browser.close();
    await browser.switchTo().window(originalWindowHandle);
  });

  it('should not hide the popup when clicking the first button', async () => {
    await page.click(getButton(0));

    expect(await page.cookiesPopup.isDisplayed()).toBe(true);
  });

  it('should hide the popup when clicking the second button', async () => {
    expect(await page.cookiesPopup.isDisplayed()).toBe(true);

    await page.click(getButton(1));
    expect(await page.cookiesPopup.isPresent()).toBe(false);

    await page.navigateTo('', true);
    expect(await page.cookiesPopup.isPresent()).toBe(false);
  });
});
