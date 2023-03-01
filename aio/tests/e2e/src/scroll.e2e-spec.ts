import { browser } from 'protractor';
import { SitePage } from './app.po';

describe('site auto-scrolling', () => {
  let page: SitePage;

  // Helpers
  const scrollAndWait = async (y: Parameters<SitePage['scrollTo']>[0] = 'bottom') => {
    await page.scrollTo(y);
    await browser.sleep(500);  // Scroll position is stored every 250ms for performance reasons.
  };

  beforeEach(async () => {
    page = new SitePage();
    await page.navigateTo('');
  });

  it('should be initially scrolled to top', async () => {
    expect(await page.getScrollTop()).toBe(0);
  });

  it('should scroll to top when navigating to a different page', async () => {
    await scrollAndWait();
    expect(await page.getScrollTop()).not.toBe(0);

    await page.navigateTo('docs');
    expect(await page.getScrollTop()).toBe(0);
  });

  it('should retain the scroll position on reload', async () => {
    await scrollAndWait();
    expect(await page.getScrollTop()).not.toBe(0);

    await browser.refresh();
    expect(await page.getScrollTop()).not.toBe(0);
  });

  it('should scroll to top when navigating to a different page via a link', async () => {
    await scrollAndWait();
    expect(await page.getScrollTop()).not.toBe(0);

    await page.docsMenuLink.click();
    // On some environments (e.g. CI) it takes some time for the page to load (and scroll to top).
    await browser.wait(async () => await page.getScrollTop() === 0, 1000);
  });

  it('should scroll to top when navigating to the same page via a link', async () => {
    await scrollAndWait();
    expect(await page.getScrollTop()).not.toBe(0);

    await page.homeLink.click();
    expect(await page.getScrollTop()).toBe(0);
  });

  // TODO: Find a way to accurately emulate clicking the browser back/forward button. Apparently,
  // both `browser.navigate().back()` and `browser.executeScript('history.back()')` cause a full
  // page load, which behaves differently than clicking the browser back button (and triggering a
  // `popstate` event instead of a navigation). Same for `forward()`.
  xit('should retain the scroll position when navigating back/forward', async () => {
    await scrollAndWait(100);
    expect(await page.getScrollTop()).toBeCloseTo(100, -1);

    await page.navigateTo('docs');
    await scrollAndWait(50);
    expect(await page.getScrollTop()).toBeCloseTo(50, -1);

    await page.navigateTo('features');
    await scrollAndWait(75);
    expect(await page.getScrollTop()).toBeCloseTo(75, -1);

    // Go back.
    await browser.navigate().back();
    expect(await page.locationPath()).toBe('/docs');
    expect(await page.getScrollTop()).toBeCloseTo(50, -1);

    // Go back.
    await browser.navigate().back();
    expect(await page.locationPath()).toBe('/');
    expect(await page.getScrollTop()).toBeCloseTo(100, -1);

    // Go forward.
    await browser.navigate().forward();
    expect(await page.locationPath()).toBe('/docs');
    expect(await page.getScrollTop()).toBeCloseTo(50, -1);

    // Go forward.
    await browser.navigate().forward();
    expect(await page.locationPath()).toBe('/features');
    expect(await page.getScrollTop()).toBeCloseTo(75, -1);
  });
});
