import {TestBed, inject} from '@angular/core/testing';
import {ScrollDispatchModule} from './public-api';
import {ViewportRuler, VIEWPORT_RULER_PROVIDER} from './viewport-ruler';


// For all tests, we assume the browser window is 1024x786 (outerWidth x outerHeight).
// The karma config has been set to this for local tests, and it is the default size
// for tests on CI (both SauceLabs and Browserstack).

// While we know the *outer* window width/height, the innerWidth and innerHeight depend on the
// the size of the individual browser's chrome, so we have to use window.innerWidth and
// window.innerHeight in the unit test instead of hard-coded values.

describe('ViewportRuler', () => {
  let ruler: ViewportRuler;

  let startingWindowWidth = window.innerWidth;
  let startingWindowHeight = window.innerHeight;

  // Create a very large element that will make the page scrollable.
  let veryLargeElement: HTMLElement = document.createElement('div');
  veryLargeElement.style.width = '6000px';
  veryLargeElement.style.height = '6000px';

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ScrollDispatchModule],
    providers: [VIEWPORT_RULER_PROVIDER]
  }));

  beforeEach(inject([ViewportRuler], (viewportRuler: ViewportRuler) => {
    ruler = viewportRuler;
    scrollTo(0, 0);
  }));

  it('should get the viewport bounds when the page is not scrolled', () => {
    let bounds = ruler.getViewportRect();
    expect(bounds.top).toBe(0);
    expect(bounds.left).toBe(0);
    expect(bounds.bottom).toBe(window.innerHeight);
    expect(bounds.right).toBe(window.innerWidth);
  });

  it('should get the viewport bounds when the page is scrolled', () => {
    document.body.appendChild(veryLargeElement);

    scrollTo(1500, 2000);
    // Force an update of the cached viewport geometries because IE11 emits the scroll event later.
    ruler._cacheViewportGeometry();

    let bounds = ruler.getViewportRect();

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerWidth > startingWindowWidth || window.innerHeight > startingWindowHeight) {
      document.body.removeChild(veryLargeElement);
      return;
    }

    expect(bounds.top).toBe(2000);
    expect(bounds.left).toBe(1500);
    expect(bounds.bottom).toBe(2000 + window.innerHeight);
    expect(bounds.right).toBe(1500 + window.innerWidth);

    document.body.removeChild(veryLargeElement);
  });

  it('should get the bounds based on client coordinates when the page is pinch-zoomed', () => {
    // There is no API to make the browser pinch-zoom, so there's no real way to automate
    // tests for this behavior. Leaving this test here as documentation for the behavior.
  });

  it('should get the scroll position when the page is not scrolled', () => {
    let scrollPos = ruler.getViewportScrollPosition();
    expect(scrollPos.top).toBe(0);
    expect(scrollPos.left).toBe(0);
  });

  it('should get the scroll position when the page is scrolled', () => {
    document.body.appendChild(veryLargeElement);

    scrollTo(1500, 2000);
    // Force an update of the cached viewport geometries because IE11 emits the scroll event later.
    ruler._cacheViewportGeometry();

    // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
    // body causes karma's iframe for the test to stretch to fit that content once we attempt to
    // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
    // successfully constrain its size. As such, skip assertions in environments where the
    // window size has changed since the start of the test.
    if (window.innerWidth > startingWindowWidth || window.innerHeight > startingWindowHeight) {
      document.body.removeChild(veryLargeElement);
      return;
    }

    let scrollPos = ruler.getViewportScrollPosition();
    expect(scrollPos.top).toBe(2000);
    expect(scrollPos.left).toBe(1500);

    document.body.removeChild(veryLargeElement);
  });
});
