import {ElementRef} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';
import {ConnectedPositionStrategy} from './connected-position-strategy';
import {ViewportRuler, VIEWPORT_RULER_PROVIDER} from '@angular/cdk/scrolling';
import {OverlayPositionBuilder} from './overlay-position-builder';
import {ConnectedOverlayPositionChange} from './connected-position';
import {Scrollable} from '@angular/cdk/scrolling';
import {Subscription} from 'rxjs/Subscription';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';
import {OverlayRef} from '../overlay-ref';


// Default width and height of the overlay and origin panels throughout these tests.
const DEFAULT_HEIGHT = 30;
const DEFAULT_WIDTH = 60;

// For all tests, we assume the browser window is 1024x786 (outerWidth x outerHeight).
// The karma config has been set to this for local tests, and it is the default size
// for tests on CI (both SauceLabs and Browserstack).

describe('ConnectedPositionStrategy', () => {

  let viewportRuler: ViewportRuler;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ScrollDispatchModule],
    providers: [VIEWPORT_RULER_PROVIDER]
  }));

  beforeEach(inject([ViewportRuler], (_ruler: ViewportRuler) => {
    viewportRuler = _ruler;
  }));

  describe('with origin on document body', () => {
    const ORIGIN_HEIGHT = DEFAULT_HEIGHT;
    const ORIGIN_WIDTH = DEFAULT_WIDTH;
    const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
    const OVERLAY_WIDTH = DEFAULT_WIDTH;

    let originElement: HTMLElement;
    let overlayElement: HTMLElement;
    let overlayContainerElement: HTMLElement;
    let strategy: ConnectedPositionStrategy;
    let fakeElementRef: ElementRef;
    let positionBuilder: OverlayPositionBuilder;

    let originRect: ClientRect | null;
    let originCenterX: number | null;
    let originCenterY: number | null;

    beforeEach(() => {
      // The origin and overlay elements need to be in the document body in order to have geometry.
      originElement = createPositionedBlockElement();
      overlayContainerElement = createOverlayContainer();
      overlayElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      document.body.appendChild(overlayContainerElement);
      overlayContainerElement.appendChild(overlayElement);

      fakeElementRef = new FakeElementRef(originElement);
      positionBuilder = new OverlayPositionBuilder(viewportRuler);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
      document.body.removeChild(overlayContainerElement);

      // Reset the origin geometry after each test so we don't accidently keep state between tests.
      originRect = null;
      originCenterX = null;
      originCenterY = null;
    });

    describe('when not near viewport edge, not scrolled', () => {
      // Place the original element close to the center of the window.
      // (1024 / 2, 768 / 2). It's not exact, since outerWidth/Height includes browser
      // chrome, but it doesn't really matter for these tests.
      const ORIGIN_LEFT = 500;
      const ORIGIN_TOP = 350;

      beforeEach(() => {
        originElement.style.left = `${ORIGIN_LEFT}px`;
        originElement.style.top = `${ORIGIN_TOP}px`;

        originRect = originElement.getBoundingClientRect();
        originCenterX = originRect.left + (ORIGIN_WIDTH / 2);
        originCenterY = originRect.top + (ORIGIN_HEIGHT / 2);
      });

      // Preconditions are set, now just run the full set of simple position tests.
      runSimplePositionTests();
    });

    describe('when scrolled', () => {
      // Place the original element decently far outside the unscrolled document (1024x768).
      const ORIGIN_LEFT = 2500;
      const ORIGIN_TOP = 2500;

      // Create a very large element that will make the page scrollable.
      let veryLargeElement: HTMLElement = document.createElement('div');
      veryLargeElement.style.width = '4000px';
      veryLargeElement.style.height = '4000px';

      beforeEach(() => {
        // Scroll the page such that the origin element is roughly in the
        // center of the visible viewport (2500 - 1024/2, 2500 - 768/2).
        document.body.appendChild(veryLargeElement);
        document.body.scrollTop = 2100;
        document.body.scrollLeft = 2100;

        originElement.style.top = `${ORIGIN_TOP}px`;
        originElement.style.left = `${ORIGIN_LEFT}px`;

        originRect = originElement.getBoundingClientRect();
        originCenterX = originRect.left + (ORIGIN_WIDTH / 2);
        originCenterY = originRect.top + (ORIGIN_HEIGHT / 2);
      });

      afterEach(() => {
        document.body.removeChild(veryLargeElement);
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      });

      // Preconditions are set, now just run the full set of simple position tests.
      runSimplePositionTests();
    });

    describe('when near viewport edge', () => {
      it('should reposition the overlay if it would go off the top of the screen', () => {
        // We can use the real ViewportRuler in this test since we know that zero is
        // always the top of the viewport.

        originElement.style.top = '5px';
        originElement.style.left = '200px';
        originRect = originElement.getBoundingClientRect();

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'bottom'})
            .withFallbackPosition(
                {originX: 'start', originY: 'bottom'},
                {overlayX: 'start', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should reposition the overlay if it would go off the left of the screen', () => {
        // We can use the real ViewportRuler in this test since we know that zero is
        // always the left edge of the viewport.

        originElement.style.top = '200px';
        originElement.style.left = '5px';
        originRect = originElement.getBoundingClientRect();
        originCenterY = originRect.top + (ORIGIN_HEIGHT / 2);

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'end', originY: 'center'},
                {overlayX: 'start', overlayY: 'center'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the bottom of the screen', () => {
        positionBuilder = new OverlayPositionBuilder(viewportRuler);

        originElement.style.bottom = '25px';
        originElement.style.left = '200px';
        originRect = originElement.getBoundingClientRect();

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'end', originY: 'top'},
                {overlayX: 'end', overlayY: 'bottom'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the right of the screen', () => {
        positionBuilder = new OverlayPositionBuilder(viewportRuler);

        originElement.style.top = '200px';
        originElement.style.right = '25px';
        originRect = originElement.getBoundingClientRect();

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'center'})
            .withFallbackPosition(
                {originX: 'start', originY: 'bottom'},
                {overlayX: 'end', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.left));
      });

      it('should recalculate and set the last position with recalculateLastPosition()', () => {
        positionBuilder = new OverlayPositionBuilder(viewportRuler);

        // Push the trigger down so the overlay doesn't have room to open on the bottom.
        originElement.style.bottom = '25px';
        originRect = originElement.getBoundingClientRect();

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'start', originY: 'top'},
                {overlayX: 'start', overlayY: 'bottom'});

        // This should apply the fallback position, as the original position won't fit.
        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        // Now make the overlay small enough to fit in the first preferred position.
        overlayElement.style.height = '15px';

        // This should only re-align in the last position, even though the first would fit.
        strategy.recalculateLastPosition();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the previous position.');
      });

      it('should default to the initial position, if no positions fit in the viewport', () => {
        positionBuilder = new OverlayPositionBuilder(viewportRuler);

        // Make the origin element taller than the viewport.
        originElement.style.height = '1000px';
        originElement.style.top = '0';
        originRect = originElement.getBoundingClientRect();

        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'bottom'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        strategy.recalculateLastPosition();

        let overlayRect = overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the initial position.');
      });

      it('should position a panel properly when rtl', () => {
        // must make the overlay longer than the origin to properly test attachment
        overlayElement.style.width = `500px`;
        originRect = originElement.getBoundingClientRect();
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withDirection('rtl');

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should position a panel with the x offset provided', () => {
        originRect = originElement.getBoundingClientRect();
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});

        strategy.withOffsetX(10);
        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10));
      });

      it('should position a panel with the y offset provided', () => {
        originRect = originElement.getBoundingClientRect();
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});

        strategy.withOffsetY(50);
        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

    });

    it('should emit onPositionChange event when position changes', () => {
      positionBuilder = new OverlayPositionBuilder(viewportRuler);
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      strategy = positionBuilder.connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'center'},
          {overlayX: 'start', overlayY: 'center'})
          .withFallbackPosition(
              {originX: 'start', originY: 'bottom'},
              {overlayX: 'end', overlayY: 'top'});

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = strategy.onPositionChange.subscribe(positionChangeHandler);

      strategy.attach(fakeOverlayRef(overlayElement));
      strategy.apply();

      const latestCall = positionChangeHandler.calls.mostRecent();

      expect(positionChangeHandler).toHaveBeenCalled();
      expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
          .toBe(true, `Expected strategy to emit an instance of ConnectedOverlayPositionChange.`);

      // If the strategy is re-applied and the initial position would now fit,
      // the position change event should be emitted again.
      originElement.style.top = '200px';
      originElement.style.left = '200px';
      strategy.attach(fakeOverlayRef(overlayElement));
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should emit the onPositionChange event even if none of the positions fit', () => {
      positionBuilder = new OverlayPositionBuilder(viewportRuler);
      originElement.style.bottom = '25px';
      originElement.style.right = '25px';

      strategy = positionBuilder.connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'bottom'},
          {overlayX: 'start', overlayY: 'top'})
          .withFallbackPosition(
              {originX: 'start', originY: 'bottom'},
              {overlayX: 'end', overlayY: 'top'});

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = strategy.onPositionChange.subscribe(positionChangeHandler);

      strategy.attach(fakeOverlayRef(overlayElement));
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should pick the fallback position that shows the largest area of the element', () => {
      positionBuilder = new OverlayPositionBuilder(viewportRuler);

      originElement.style.top = '200px';
      originElement.style.right = '25px';
      originRect = originElement.getBoundingClientRect();

      strategy = positionBuilder.connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'center'},
          {overlayX: 'start', overlayY: 'center'})
          .withFallbackPosition(
              {originX: 'end', originY: 'top'},
              {overlayX: 'start', overlayY: 'bottom'})
          .withFallbackPosition(
              {originX: 'end', originY: 'top'},
              {overlayX: 'end', overlayY: 'top'});

      strategy.attach(fakeOverlayRef(overlayElement));
      strategy.apply();

      let overlayRect = overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
    });

    /**
     * Run all tests for connecting the overlay to the origin such that first preferred
     * position does not go off-screen. We do this because there are several cases where we
     * want to run the exact same tests with different preconditions (e.g., not scroll, scrolled,
     * different element sized, etc.).
     */
    function runSimplePositionTests() {
      it('should position a panel below, left-aligned', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.left));
      });

      it('should position to the right, center aligned vertically', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'center'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY! - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.right));
      });

      it('should position to the left, below', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect!.left));
      });

      it('should position above, right aligned', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'bottom'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.round(overlayRect.bottom)).toBe(Math.round(originRect!.top));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect!.right));
      });

      it('should position below, centered', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'center', originY: 'bottom'},
            {overlayX: 'center', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originCenterX! - (OVERLAY_WIDTH / 2)));
      });

      it('should center the overlay on the origin', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'center', originY: 'center'},
            {overlayX: 'center', overlayY: 'center'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();

        let overlayRect = overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.left));
      });
    }
  });

  describe('onPositionChange with scrollable view properties', () => {
    let overlayElement: HTMLElement;
    let overlayContainerElement: HTMLElement;
    let strategy: ConnectedPositionStrategy;

    let scrollable: HTMLDivElement;
    let positionChangeHandler: jasmine.Spy;
    let onPositionChangeSubscription: Subscription;
    let positionChange: ConnectedOverlayPositionChange;

    beforeEach(() => {
      // Set up the overlay
      overlayContainerElement = createOverlayContainer();
      overlayElement = createPositionedBlockElement();
      document.body.appendChild(overlayContainerElement);
      overlayContainerElement.appendChild(overlayElement);

      // Set up the origin
      let originElement = createBlockElement();
      originElement.style.margin = '0 1000px 1000px 0';  // Added so that the container scrolls

      // Create a scrollable container and put the origin inside
      scrollable = createOverflowContainerElement();
      document.body.appendChild(scrollable);
      scrollable.appendChild(originElement);

      // Create a strategy with knowledge of the scrollable container
      let positionBuilder = new OverlayPositionBuilder(viewportRuler);
      let fakeElementRef = new FakeElementRef(originElement);
      strategy = positionBuilder.connectedTo(
          fakeElementRef,
          {originX: 'start', originY: 'bottom'},
          {overlayX: 'start', overlayY: 'top'});

      strategy.withScrollableContainers([
          new Scrollable(new FakeElementRef(scrollable), null!, null!, null!)]);
      strategy.attach(fakeOverlayRef(overlayElement));
      positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      onPositionChangeSubscription = strategy.onPositionChange.subscribe(positionChangeHandler);
    });

    afterEach(() => {
      onPositionChangeSubscription.unsubscribe();
      document.body.removeChild(scrollable);
      document.body.removeChild(overlayContainerElement);
    });

    it('should not have origin or overlay clipped or out of view without scroll', () => {
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalled();
      positionChange = positionChangeHandler.calls.mostRecent().args[0];
      expect(positionChange.scrollableViewProperties).toEqual({
        isOriginClipped: false,
        isOriginOutsideView: false,
        isOverlayClipped: false,
        isOverlayOutsideView: false
      });
    });

    it('should evaluate if origin is clipped if scrolled slightly down', () => {
      scrollable.scrollTop = 10;  // Clip the origin by 10 pixels
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalled();
      positionChange = positionChangeHandler.calls.mostRecent().args[0];
      expect(positionChange.scrollableViewProperties).toEqual({
        isOriginClipped: true,
        isOriginOutsideView: false,
        isOverlayClipped: false,
        isOverlayOutsideView: false
      });
    });

    it('should evaluate if origin is out of view and overlay is clipped if scrolled enough', () => {
      scrollable.scrollTop = 31;  // Origin is 30 pixels, move out of view and clip the overlay 1px
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalled();
      positionChange = positionChangeHandler.calls.mostRecent().args[0];
      expect(positionChange.scrollableViewProperties).toEqual({
        isOriginClipped: true,
        isOriginOutsideView: true,
        isOverlayClipped: true,
        isOverlayOutsideView: false
      });
    });

    it('should evaluate the overlay and origin are both out of the view', () => {
      scrollable.scrollTop = 61;  // Scroll by overlay height + origin height + 1px buffer
      strategy.apply();

      expect(positionChangeHandler).toHaveBeenCalled();
      positionChange = positionChangeHandler.calls.mostRecent().args[0];
      expect(positionChange.scrollableViewProperties).toEqual({
        isOriginClipped: true,
        isOriginOutsideView: true,
        isOverlayClipped: true,
        isOverlayOutsideView: true
      });
    });
  });

  describe('positioning properties', () => {
    let originElement: HTMLElement;
    let overlayElement: HTMLElement;
    let overlayContainerElement: HTMLElement;
    let strategy: ConnectedPositionStrategy;
    let fakeElementRef: ElementRef;
    let positionBuilder: OverlayPositionBuilder;

    beforeEach(() => {
      // The origin and overlay elements need to be in the document body in order to have geometry.
      originElement = createPositionedBlockElement();
      overlayContainerElement = createOverlayContainer();
      overlayElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      document.body.appendChild(overlayContainerElement);
      overlayContainerElement.appendChild(overlayElement);

      fakeElementRef = new FakeElementRef(originElement);
      positionBuilder = new OverlayPositionBuilder(viewportRuler);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
      document.body.removeChild(overlayContainerElement);
    });

    describe('in ltr', () => {
      it('should use `left` when positioning an element at the start', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.left).toBeTruthy();
        expect(overlayElement.style.right).toBeFalsy();
      });

      it('should use `right` when positioning an element at the end', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'top'});

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.right).toBeTruthy();
        expect(overlayElement.style.left).toBeFalsy();
      });

    });

    describe('in rtl', () => {
      it('should use `right` when positioning an element at the start', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'}
        )
        .withDirection('rtl');

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.right).toBeTruthy();
        expect(overlayElement.style.left).toBeFalsy();
      });

      it('should use `left` when positioning an element at the end', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'top'}
        ).withDirection('rtl');

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.left).toBeTruthy();
        expect(overlayElement.style.right).toBeFalsy();
      });
    });

    describe('vertical', () => {
      it('should use `top` when positioning at element along the top', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'}
        );

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.top).toBeTruthy();
        expect(overlayElement.style.bottom).toBeFalsy();
      });

      it('should use `bottom` when positioning at element along the bottom', () => {
        strategy = positionBuilder.connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'bottom'}
        );

        strategy.attach(fakeOverlayRef(overlayElement));
        strategy.apply();
        expect(overlayElement.style.bottom).toBeTruthy();
        expect(overlayElement.style.top).toBeFalsy();
      });
    });

  });

});

/** Creates an absolutely positioned, display: block element with a default size. */
function createPositionedBlockElement() {
  let element = createBlockElement();
  element.style.position = 'absolute';
  return element;
}

/** Creates a block element with a default size. */
function createBlockElement() {
  let element = document.createElement('div');
  element.style.width = `${DEFAULT_WIDTH}px`;
  element.style.height = `${DEFAULT_HEIGHT}px`;
  element.style.backgroundColor = 'rebeccapurple';
  element.style.zIndex = '100';
  return element;
}

/** Creates the wrapper for all of the overlays. */
function createOverlayContainer() {
  let element = document.createElement('div');
  element.classList.add('cdk-overlay-container');
  return element;
}

/** Creates an overflow container with a set height and width with margin. */
function createOverflowContainerElement() {
  let element = document.createElement('div');
  element.style.position = 'relative';
  element.style.overflow = 'auto';
  element.style.height = '300px';
  element.style.width = '300px';
  element.style.margin = '100px';
  return element;
}


/** Fake implementation of ElementRef that is just a simple container for nativeElement. */
class FakeElementRef implements ElementRef {
  constructor(public nativeElement: HTMLElement) { }
}

function fakeOverlayRef(overlayElement: HTMLElement) {
  return {overlayElement} as OverlayRef;
}
