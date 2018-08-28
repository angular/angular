import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {CdkScrollable, ScrollingModule} from '@angular/cdk/scrolling';
import {MockNgZone} from '@angular/cdk/testing';
import {Component, ElementRef, NgModule, NgZone} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {
  ConnectedOverlayPositionChange,
  ConnectedPositionStrategy,
  ConnectionPositionPair,
  Overlay,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
} from '../index';


// Default width and height of the overlay and origin panels throughout these tests.
const DEFAULT_HEIGHT = 30;
const DEFAULT_WIDTH = 60;

// For all tests, we assume the browser window is 1024x786 (outerWidth x outerHeight).
// The karma config has been set to this for local tests, and it is the default size
// for tests on CI (both SauceLabs and Browserstack).

describe('ConnectedPositionStrategy', () => {
  let overlay: Overlay;
  let overlayContainer: OverlayContainer;
  let zone: MockNgZone;
  let overlayRef: OverlayRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, OverlayModule, OverlayTestModule],
      providers: [{provide: NgZone, useFactory: () => zone = new MockNgZone()}]
    });

    inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
      overlay = o;
      overlayContainer = oc;
    })();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();

    if (overlayRef) {
      overlayRef.dispose();
    }
  });

  function attachOverlay(positionStrategy: ConnectedPositionStrategy) {
    overlayRef = overlay.create({positionStrategy});
    overlayRef.attach(new ComponentPortal(TestOverlay));
    zone.simulateZoneExit();
  }

  describe('with origin on document body', () => {
    const ORIGIN_HEIGHT = DEFAULT_HEIGHT;
    const ORIGIN_WIDTH = DEFAULT_WIDTH;
    const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
    const OVERLAY_WIDTH = DEFAULT_WIDTH;

    let originElement: HTMLElement;
    let positionStrategy: ConnectedPositionStrategy;
    let fakeElementRef: ElementRef<HTMLElement>;

    let originRect: ClientRect | null;
    let originCenterX: number | null;
    let originCenterY: number | null;

    beforeEach(() => {
      // The origin and overlay elements need to be in the document body in order to have geometry.
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      fakeElementRef = new ElementRef<HTMLElement>(originElement);
    });

    afterEach(() => {
      document.body.removeChild(originElement);

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

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'bottom'})
            .withFallbackPosition(
                {originX: 'start', originY: 'bottom'},
                {overlayX: 'start', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
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

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'end', originY: 'center'},
                {overlayX: 'start', overlayY: 'center'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the bottom of the screen', () => {
        originElement.style.bottom = '25px';
        originElement.style.left = '200px';
        originRect = originElement.getBoundingClientRect();

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'end', originY: 'top'},
                {overlayX: 'end', overlayY: 'bottom'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the right of the screen', () => {
        originElement.style.top = '200px';
        originElement.style.right = '25px';
        originRect = originElement.getBoundingClientRect();

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'center'})
            .withFallbackPosition(
                {originX: 'start', originY: 'bottom'},
                {overlayX: 'end', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.left));
      });

      it('should recalculate and set the last position with recalculateLastPosition()', () => {
        // Push the trigger down so the overlay doesn't have room to open on the bottom.
        originElement.style.bottom = '25px';
        originRect = originElement.getBoundingClientRect();

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withFallbackPosition(
                {originX: 'start', originY: 'top'},
                {overlayX: 'start', overlayY: 'bottom'});

        // This should apply the fallback position, as the original position won't fit.
        attachOverlay(positionStrategy);

        // Now make the overlay small enough to fit in the first preferred position.
        overlayRef.overlayElement.style.height = '15px';

        // This should only re-align in the last position, even though the first would fit.
        positionStrategy.recalculateLastPosition();

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the previous position.');
      });

      it('should default to the initial position, if no positions fit in the viewport', () => {
        // Make the origin element taller than the viewport.
        originElement.style.height = '1000px';
        originElement.style.top = '0';
        originRect = originElement.getBoundingClientRect();

        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'bottom'});

        attachOverlay(positionStrategy);
        positionStrategy.recalculateLastPosition();

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the initial position.');
      });

      it('should position a panel properly when rtl', () => {
        // must make the overlay longer than the origin to properly test attachment
        originRect = originElement.getBoundingClientRect();
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'})
            .withDirection('rtl');

        attachOverlay(positionStrategy);
        overlayRef.overlayElement.style.width = `500px`;

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should position a panel with the x offset provided', () => {
        originRect = originElement.getBoundingClientRect();
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});

        positionStrategy.withOffsetX(10);
        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10));
      });

      it('should position a panel with the y offset provided', () => {
        originRect = originElement.getBoundingClientRect();
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});

        positionStrategy.withOffsetY(50);
        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should allow for the fallback positions to specify their own offsets', () => {
        originElement.style.bottom = '0';
        originElement.style.left = '50%';
        originElement.style.position = 'fixed';
        originRect = originElement.getBoundingClientRect();
        positionStrategy = overlay.position()
          .connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'})
          .withFallbackPosition(
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'bottom'},
            -100, -100);

        positionStrategy.withOffsetY(50).withOffsetY(50);
        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top - 100));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left - 100));
      });

    });

    it('should emit onPositionChange event when position changes', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'center'},
          {overlayX: 'start', overlayY: 'center'})
          .withFallbackPosition(
              {originX: 'start', originY: 'bottom'},
              {overlayX: 'end', overlayY: 'top'});

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = positionStrategy.onPositionChange.subscribe(positionChangeHandler);

      attachOverlay(positionStrategy);

      const latestCall = positionChangeHandler.calls.mostRecent();

      expect(positionChangeHandler).toHaveBeenCalled();
      expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
          .toBe(true, `Expected strategy to emit an instance of ConnectedOverlayPositionChange.`);

      // If the strategy is re-applied and the initial position would now fit,
      // the position change event should be emitted again.
      originElement.style.top = '200px';
      originElement.style.left = '200px';

      positionStrategy.apply();

      expect(positionChangeHandler).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should emit the onPositionChange event even if none of the positions fit', () => {
      originElement.style.bottom = '25px';
      originElement.style.right = '25px';

      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'bottom'},
          {overlayX: 'start', overlayY: 'top'})
          .withFallbackPosition(
              {originX: 'start', originY: 'bottom'},
              {overlayX: 'end', overlayY: 'top'});

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = positionStrategy.onPositionChange.subscribe(positionChangeHandler);

      attachOverlay(positionStrategy);

      expect(positionChangeHandler).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should complete the onPositionChange stream on dispose', () => {
      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'bottom'},
          {overlayX: 'start', overlayY: 'top'});

      const completeHandler = jasmine.createSpy('complete handler');

      positionStrategy.onPositionChange.subscribe(undefined, undefined, completeHandler);
      attachOverlay(positionStrategy);
      positionStrategy.dispose();

      expect(completeHandler).toHaveBeenCalled();
    });

    it('should pick the fallback position that shows the largest area of the element', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';
      originRect = originElement.getBoundingClientRect();

      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'center'},
          {overlayX: 'start', overlayY: 'center'})
          .withFallbackPosition(
              {originX: 'end', originY: 'top'},
              {overlayX: 'start', overlayY: 'bottom'})
          .withFallbackPosition(
              {originX: 'end', originY: 'top'},
              {overlayX: 'end', overlayY: 'top'});

      attachOverlay(positionStrategy);

      let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
    });

    it('should re-use the preferred position when re-applying while locked in', () => {
      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'end', originY: 'center'},
          {overlayX: 'start', overlayY: 'center'})
          .withLockedPosition(true)
          .withFallbackPosition(
              {originX: 'start', originY: 'bottom'},
              {overlayX: 'end', overlayY: 'top'});

      const recalcSpy = spyOn(positionStrategy._positionStrategy, 'reapplyLastPosition');

      attachOverlay(positionStrategy);

      expect(recalcSpy).not.toHaveBeenCalled();

      positionStrategy.apply();

      expect(recalcSpy).toHaveBeenCalled();
    });

    /**
     * Run all tests for connecting the overlay to the origin such that first preferred
     * position does not go off-screen. We do this because there are several cases where we
     * want to run the exact same tests with different preconditions (e.g., not scroll, scrolled,
     * different element sized, etc.).
     */
    function runSimplePositionTests() {
      it('should position a panel below, left-aligned', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.left));
      });

      it('should position to the right, center aligned vertically', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'center'},
            {overlayX: 'start', overlayY: 'center'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY! - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.right));
      });

      it('should position to the left, below', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'end', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect!.left));
      });

      it('should position above, right aligned', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'bottom'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.round(overlayRect.bottom)).toBe(Math.round(originRect!.top));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect!.right));
      });

      it('should position below, centered', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'center', originY: 'bottom'},
            {overlayX: 'center', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originCenterX! - (OVERLAY_WIDTH / 2)));
      });

      it('should center the overlay on the origin', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'center', originY: 'center'},
            {overlayX: 'center', overlayY: 'center'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.left));
      });

      it('should allow for the positions to be updated after init', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'top'});

        attachOverlay(positionStrategy);

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect!.left));

        positionStrategy.withPositions([new ConnectionPositionPair(
          {originX: 'start', originY: 'bottom'},
          {overlayX: 'end', overlayY: 'top'}
        )]);

        positionStrategy.apply();

        overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect!.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect!.left));
      });

    }
  });

  describe('onPositionChange with scrollable view properties', () => {
    let scrollable: HTMLDivElement;
    let positionChangeHandler: jasmine.Spy;
    let onPositionChangeSubscription: Subscription;
    let positionChange: ConnectedOverlayPositionChange;
    let fakeElementRef: ElementRef<HTMLElement>;
    let positionStrategy: ConnectedPositionStrategy;

    beforeEach(() => {
      // Set up the origin
      let originElement = createBlockElement();
      originElement.style.margin = '0 1000px 1000px 0';  // Added so that the container scrolls

      // Create a scrollable container and put the origin inside
      scrollable = createOverflowContainerElement();
      document.body.appendChild(scrollable);
      scrollable.appendChild(originElement);

      // Create a strategy with knowledge of the scrollable container
      fakeElementRef = new ElementRef<HTMLElement>(originElement);
      positionStrategy = overlay.position().connectedTo(
          fakeElementRef,
          {originX: 'start', originY: 'bottom'},
          {overlayX: 'start', overlayY: 'top'});

      positionStrategy.withScrollableContainers([
          new CdkScrollable(new ElementRef<HTMLElement>(scrollable), null!, null!)]);
      positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      onPositionChangeSubscription =
          positionStrategy.onPositionChange.subscribe(positionChangeHandler);
      attachOverlay(positionStrategy);
    });

    afterEach(() => {
      onPositionChangeSubscription.unsubscribe();
      document.body.removeChild(scrollable);
    });

    it('should not have origin or overlay clipped or out of view without scroll', () => {
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
      positionStrategy.apply();

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
      positionStrategy.apply();

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
      positionStrategy.apply();

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
    let positionStrategy: ConnectedPositionStrategy;
    let fakeElementRef: ElementRef<HTMLElement>;

    beforeEach(() => {
      // The origin and overlay elements need to be in the document body in order to have geometry.
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      fakeElementRef = new ElementRef<HTMLElement>(originElement);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
    });

    describe('in ltr', () => {
      it('should use `left` when positioning an element at the start', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'});


        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.left).toBeTruthy();
        expect(overlayRef.overlayElement.style.right).toBeFalsy();
      });

      it('should use `right` when positioning an element at the end', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'top'});

        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.right).toBeTruthy();
        expect(overlayRef.overlayElement.style.left).toBeFalsy();
      });

    });

    describe('in rtl', () => {
      it('should use `right` when positioning an element at the start', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'}
        )
        .withDirection('rtl');

        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.right).toBeTruthy();
        expect(overlayRef.overlayElement.style.left).toBeFalsy();
      });

      it('should use `left` when positioning an element at the end', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'end', originY: 'top'},
            {overlayX: 'end', overlayY: 'top'}
        ).withDirection('rtl');

        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.left).toBeTruthy();
        expect(overlayRef.overlayElement.style.right).toBeFalsy();
      });
    });

    describe('vertical', () => {
      it('should use `top` when positioning at element along the top', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'top'},
            {overlayX: 'start', overlayY: 'top'}
        );

        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.top).toBeTruthy();
        expect(overlayRef.overlayElement.style.bottom).toBeFalsy();
      });

      it('should use `bottom` when positioning at element along the bottom', () => {
        positionStrategy = overlay.position().connectedTo(
            fakeElementRef,
            {originX: 'start', originY: 'bottom'},
            {overlayX: 'start', overlayY: 'bottom'}
        );

        attachOverlay(positionStrategy);

        expect(overlayRef.overlayElement.style.bottom).toBeTruthy();
        expect(overlayRef.overlayElement.style.top).toBeFalsy();
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


@Component({
  template: `<div style="width: ${DEFAULT_WIDTH}px; height: ${DEFAULT_HEIGHT}px;"></div>`
})
class TestOverlay { }


@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: [TestOverlay],
  declarations: [TestOverlay],
  entryComponents: [TestOverlay],
})
class OverlayTestModule { }
