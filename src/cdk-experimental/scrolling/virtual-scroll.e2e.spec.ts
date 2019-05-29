import {browser, by, element, ElementFinder} from 'protractor';
import {ILocation, ISize} from 'selenium-webdriver';

declare var window: any;


describe('autosize cdk-virtual-scroll', () => {
  let viewport: ElementFinder;

  describe('with uniform items', () => {
    beforeEach(async () => {
      await browser.get('/virtual-scroll');
      viewport = element(by.css('.demo-virtual-scroll-uniform-size cdk-virtual-scroll-viewport'));
    });

    it('should scroll down slowly', async () => {
      await browser.executeAsyncScript(smoothScrollViewportTo, viewport, 2000);
      const offScreen = element(by.css('.demo-virtual-scroll-uniform-size [data-index="39"]'));
      const onScreen = element(by.css('.demo-virtual-scroll-uniform-size [data-index="40"]'));
      expect(await isVisibleInViewport(offScreen, viewport)).toBe(false);
      expect(await isVisibleInViewport(onScreen, viewport)).toBe(true);
    });

    it('should jump scroll position down and slowly scroll back up', async () => {
      // The estimate of the total content size is exactly correct, so we wind up scrolled to the
      // same place as if we slowly scrolled down.
      await browser.executeAsyncScript(scrollViewportTo, viewport, 2000);
      const offScreen = element(by.css('.demo-virtual-scroll-uniform-size [data-index="39"]'));
      const onScreen = element(by.css('.demo-virtual-scroll-uniform-size [data-index="40"]'));
      expect(await isVisibleInViewport(offScreen, viewport)).toBe(false);
      expect(await isVisibleInViewport(onScreen, viewport)).toBe(true);

      // As we slowly scroll back up we should wind up back at the start of the content.
      await browser.executeAsyncScript(smoothScrollViewportTo, viewport, 0);
      const first = element(by.css('.demo-virtual-scroll-uniform-size [data-index="0"]'));
      expect(await isVisibleInViewport(first, viewport)).toBe(true);
    });
  });

  describe('with variable size', () => {
    beforeEach(async () => {
      await browser.get('/virtual-scroll');
      viewport = element(by.css('.demo-virtual-scroll-variable-size cdk-virtual-scroll-viewport'));
    });

    it('should scroll down slowly', async () => {
      await browser.executeAsyncScript(smoothScrollViewportTo, viewport, 2000);
      const offScreen = element(by.css('.demo-virtual-scroll-variable-size [data-index="19"]'));
      const onScreen = element(by.css('.demo-virtual-scroll-variable-size [data-index="20"]'));
      expect(await isVisibleInViewport(offScreen, viewport)).toBe(false);
      expect(await isVisibleInViewport(onScreen, viewport)).toBe(true);
    });

    it('should jump scroll position down and slowly scroll back up', async () => {
      // The estimate of the total content size is slightly different than the actual, so we don't
      // wind up in the same spot as if we scrolled slowly down.
      await browser.executeAsyncScript(scrollViewportTo, viewport, 2000);
      const offScreen = element(by.css('.demo-virtual-scroll-variable-size [data-index="18"]'));
      const onScreen = element(by.css('.demo-virtual-scroll-variable-size [data-index="19"]'));
      expect(await isVisibleInViewport(offScreen, viewport)).toBe(false);
      expect(await isVisibleInViewport(onScreen, viewport)).toBe(true);

      // As we slowly scroll back up we should wind up back at the start of the content. As we
      // scroll the error from when we jumped the scroll position should be slowly corrected.
      await browser.executeAsyncScript(smoothScrollViewportTo, viewport, 0);
      const first = element(by.css('.demo-virtual-scroll-variable-size [data-index="0"]'));
      expect(await isVisibleInViewport(first, viewport)).toBe(true);
    });
  });
});


/** Checks if the given element is visible in the given viewport. */
async function isVisibleInViewport(el: ElementFinder, viewport: ElementFinder): Promise<boolean> {
  if (!await el.isPresent() || !await el.isDisplayed() || !await viewport.isPresent() ||
      !await viewport.isDisplayed()) {
    return false;
  }
  const viewportRect = getRect(await viewport.getLocation(), await viewport.getSize());
  const elRect = getRect(await el.getLocation(), await el.getSize());
  return elRect.left < viewportRect.right && elRect.right > viewportRect.left &&
      elRect.top < viewportRect.bottom && elRect.bottom > viewportRect.top;
}


/** Gets the rect for an element given its location ans size. */
function getRect(location: ILocation, size: ISize):
    {top: number, left: number, bottom: number, right: number} {
  return {
    top: location.y,
    left: location.x,
    bottom: location.y + size.height,
    right: location.x + size.width
  };
}


/** Immediately scrolls the viewport to the given offset. */
function scrollViewportTo(viewportEl: any, offset: number, done: () => void) {
  viewportEl.scrollTop = offset;
  window.requestAnimationFrame(() => done());
}


/** Smoothly scrolls the viewport to the given offset, 25px at a time. */
function smoothScrollViewportTo(viewportEl: any, offset: number, done: () => void) {
  let promise = Promise.resolve();
  let curOffset = viewportEl.scrollTop;
  do {
    const co = curOffset += Math.min(25, Math.max(-25, offset - curOffset));
    promise = promise.then(() => new Promise<void>(resolve => {
      viewportEl.scrollTop = co;
      window.requestAnimationFrame(() => resolve());
    }));
  } while (curOffset != offset);
  promise.then(() => done());
}
