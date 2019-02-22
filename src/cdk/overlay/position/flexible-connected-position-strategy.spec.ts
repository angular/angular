import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {CdkScrollable, ScrollingModule, ViewportRuler} from '@angular/cdk/scrolling';
import {MockNgZone} from '@angular/cdk/testing';
import {Component, ElementRef, NgModule, NgZone} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  ConnectedOverlayPositionChange,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
} from '../index';


// Default width and height of the overlay and origin panels throughout these tests.
const DEFAULT_HEIGHT = 30;
const DEFAULT_WIDTH = 60;

describe('FlexibleConnectedPositionStrategy', () => {
  let overlay: Overlay;
  let overlayContainer: OverlayContainer;
  let zone: MockNgZone;
  let overlayRef: OverlayRef;
  let viewport: ViewportRuler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScrollingModule, OverlayModule, OverlayTestModule],
      providers: [{provide: NgZone, useFactory: () => zone = new MockNgZone()}]
    });

    inject([Overlay, OverlayContainer, ViewportRuler],
      (o: Overlay, oc: OverlayContainer, v: ViewportRuler) => {
        overlay = o;
        overlayContainer = oc;
        viewport = v;
      })();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();

    if (overlayRef) {
      overlayRef.dispose();
    }
  });

  function attachOverlay(config: OverlayConfig) {
    overlayRef = overlay.create(config);
    overlayRef.attach(new ComponentPortal(TestOverlay));
    zone.simulateZoneExit();
  }

  it('should throw when attempting to attach to multiple different overlays', () => {
    const origin = document.createElement('div');
    const positionStrategy = overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([{
          overlayX: 'start',
          overlayY: 'top',
          originX: 'start',
          originY: 'bottom'
        }]);

    // Needs to be in the DOM for IE not to throw an "Unspecified error".
    document.body.appendChild(origin);
    attachOverlay({positionStrategy});

    expect(() => attachOverlay({positionStrategy})).toThrow();

    document.body.removeChild(origin);
  });

  it('should not throw when trying to apply after being disposed', () => {
    const origin = document.createElement('div');
    const positionStrategy = overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([{
          overlayX: 'start',
          overlayY: 'top',
          originX: 'start',
          originY: 'bottom'
        }]);

    // Needs to be in the DOM for IE not to throw an "Unspecified error".
    document.body.appendChild(origin);
    attachOverlay({positionStrategy});
    overlayRef.dispose();

    expect(() => positionStrategy.apply()).not.toThrow();

    document.body.removeChild(origin);
  });

  it('should not throw when trying to re-apply the last position after being disposed', () => {
    const origin = document.createElement('div');
    const positionStrategy = overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([{
          overlayX: 'start',
          overlayY: 'top',
          originX: 'start',
          originY: 'bottom'
        }]);

    // Needs to be in the DOM for IE not to throw an "Unspecified error".
    document.body.appendChild(origin);
    attachOverlay({positionStrategy});
    overlayRef.dispose();

    expect(() => positionStrategy.reapplyLastPosition()).not.toThrow();

    document.body.removeChild(origin);
  });

  it('should for the virtual keyboard offset when positioning the overlay', () => {
    const originElement = createPositionedBlockElement();
    document.body.appendChild(originElement);

    // Position the element so it would have enough space to fit.
    originElement.style.top = '200px';
    originElement.style.left = '70px';

    // Pull the element up ourselves to simulate what a mobile
    // browser would do when the virtual keyboard is being shown.
    overlayContainer.getContainerElement().style.top = '-100px';

    attachOverlay({
      positionStrategy: overlay.position()
        .flexibleConnectedTo(originElement)
        .withFlexibleDimensions(false)
        .withPush(false)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }])
    });

    const originRect = originElement.getBoundingClientRect();
    const overlayRect = overlayRef.overlayElement.getBoundingClientRect();

    expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));

    document.body.removeChild(originElement);
  });

  it('should clean up after itself when disposed', () => {
    const origin = document.createElement('div');
    const positionStrategy = overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([{
          overlayX: 'start',
          overlayY: 'top',
          originX: 'start',
          originY: 'bottom',
          offsetX: 10,
          offsetY: 20
        }]);

    // Needs to be in the DOM for IE not to throw an "Unspecified error".
    document.body.appendChild(origin);
    attachOverlay({positionStrategy});

    const boundingBox = overlayRef.hostElement;
    const pane = overlayRef.overlayElement;

    positionStrategy.dispose();

    expect(boundingBox.style.top).toBeFalsy();
    expect(boundingBox.style.bottom).toBeFalsy();
    expect(boundingBox.style.left).toBeFalsy();
    expect(boundingBox.style.right).toBeFalsy();
    expect(boundingBox.style.width).toBeFalsy();
    expect(boundingBox.style.height).toBeFalsy();
    expect(boundingBox.style.alignItems).toBeFalsy();
    expect(boundingBox.style.justifyContent).toBeFalsy();
    expect(boundingBox.classList).not.toContain('cdk-overlay-connected-position-bounding-box');

    expect(pane.style.top).toBeFalsy();
    expect(pane.style.bottom).toBeFalsy();
    expect(pane.style.left).toBeFalsy();
    expect(pane.style.right).toBeFalsy();
    expect(pane.style.position).toBeFalsy();
    expect(pane.style.transform).toBeFalsy();

    overlayRef.dispose();
    document.body.removeChild(origin);
  });

  describe('without flexible dimensions and pushing', () => {
    const ORIGIN_HEIGHT = DEFAULT_HEIGHT;
    const ORIGIN_WIDTH = DEFAULT_WIDTH;
    const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
    const OVERLAY_WIDTH = DEFAULT_WIDTH;

    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      // The origin and overlay elements need to be in the document body in order to have geometry.
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position()
          .flexibleConnectedTo(originElement)
          .withFlexibleDimensions(false)
          .withPush(false);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
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
        window.scroll(2100, 2100);

        originElement.style.top = `${ORIGIN_TOP}px`;
        originElement.style.left = `${ORIGIN_LEFT}px`;
      });

      afterEach(() => {
        window.scroll(0, 0);
        document.body.removeChild(veryLargeElement);
      });

      // Preconditions are set, now just run the full set of simple position tests.
      runSimplePositionTests();
    });

    describe('when near viewport edge', () => {
      it('should reposition the overlay if it would go off the top of the screen', () => {
        originElement.style.top = '5px';
        originElement.style.left = '200px';
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          }
        ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should reposition the overlay if it would go off the left of the screen', () => {
        originElement.style.top = '200px';
        originElement.style.left = '5px';

        const originRect = originElement.getBoundingClientRect();
        const originCenterY = originRect.top + (ORIGIN_HEIGHT / 2);

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          }
        ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the bottom of the screen', () => {
        originElement.style.bottom = '25px';
        originElement.style.left = '200px';

        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'bottom'
          }
        ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should reposition the overlay if it would go off the right of the screen', () => {
        originElement.style.top = '200px';
        originElement.style.right = '25px';

        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          },
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          }
        ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.left));
      });

      it('should recalculate and set the last position with recalculateLastPosition()', () => {
        // Push the trigger down so the overlay doesn't have room to open on the bottom.
        originElement.style.bottom = '25px';

        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
          }
        ]);

        // This should apply the fallback position, as the original position won't fit.
        attachOverlay({positionStrategy});

        // Now make the overlay small enough to fit in the first preferred position.
        overlayRef.overlayElement.style.height = '15px';

        // This should only re-align in the last position, even though the first would fit.
        positionStrategy.reapplyLastPosition();

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the previous position.');
      });

      it('should default to the initial position, if no positions fit in the viewport', () => {
        // Make the origin element taller than the viewport.
        originElement.style.height = '1000px';
        originElement.style.top = '0';

        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        }]);

        attachOverlay({positionStrategy});
        positionStrategy.reapplyLastPosition();

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top),
            'Expected overlay to be re-aligned to the trigger in the initial position.');
      });

      it('should position a panel properly when rtl', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({
          positionStrategy,
          direction: 'rtl'
        });

        // must make the overlay longer than the origin to properly test attachment
        overlayRef.overlayElement.style.width = `500px`;

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
      });

      it('should position a panel with the x offset provided', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 10
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10));
      });

      it('should be able to set the default x offset', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withDefaultOffsetX(20).withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 20));
      });

      it('should have the position offset x take precedence over the default offset x', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withDefaultOffsetX(20).withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 10
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10));
      });

      it('should position a panel with the y offset provided', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 50
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should be able to set the default y offset', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withDefaultOffsetY(60).withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 60));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should have the position offset y take precedence over the default offset y', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withDefaultOffsetY(60).withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 50
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should allow for the fallback positions to specify their own offsets', () => {
        originElement.style.bottom = '0';
        originElement.style.left = '50%';
        originElement.style.position = 'fixed';

        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top',
            offsetX: 50,
            offsetY: 50
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetX: -100,
            offsetY: -100
          }
        ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top - 100));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left - 100));
      });

    });

    describe('with transform origin', () => {
      it('should set the proper transform-origin when aligning to start/bottom', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('left top');
      });

      it('should set the proper transform-origin when aligning to end/bottom', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('right top');
      });

      it('should set the proper transform-origin when centering vertically', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'start',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        }]);

        attachOverlay({positionStrategy});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('left center');
      });

      it('should set the proper transform-origin when centering horizontally', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('center top');
      });

      it('should set the proper transform-origin when aligning to start/top', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        }]);

        attachOverlay({positionStrategy});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('left bottom');
      });

      it('should set the proper transform-origin when aligning to start/bottom in rtl', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy, direction: 'rtl'});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('right top');
      });

      it('should set the proper transform-origin when aligning to end/bottom in rtl', () => {
        positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy, direction: 'rtl'});

        const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement;

        expect(target.style.transformOrigin).toContain('left top');
      });

    });

    describe('with origin set to a point', () => {
      it('should be able to render at the primary position', () => {
        positionStrategy
          .setOrigin({x: 50, y: 100})
          .withPositions([{
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(100);
        expect(Math.floor(overlayRect.left)).toBe(50);
      });

      it('should be able to render at a fallback position', () => {
        const viewportHeight = viewport.getViewportRect().height;

        positionStrategy
          .setOrigin({x: 50, y: viewportHeight})
          .withPositions([
              {
                originX: 'start',
                originY: 'bottom',
                overlayX: 'start',
                overlayY: 'top'
              },
              {
                originX: 'start',
                originY: 'top',
                overlayX: 'start',
                overlayY: 'bottom'
              }
          ]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.bottom)).toBe(viewportHeight);
        expect(Math.floor(overlayRect.left)).toBe(50);
      });

    });

    it('should account for the `offsetX` pushing the overlay out of the screen', () => {
      // Position the element so it would have enough space to fit.
      originElement.style.top = '200px';
      originElement.style.left = '70px';

      const originRect = originElement.getBoundingClientRect();

      positionStrategy.withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: -20 // Add enough of an offset to pull the element out of the viewport.
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }
      ]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
    });

    it('should account for the `offsetY` pushing the overlay out of the screen', () => {
      // Position the overlay so it would normally have enough space to fit.
      originElement.style.bottom = '40px';
      originElement.style.left = '200px';

      const originRect = originElement.getBoundingClientRect();

      positionStrategy.withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 20 // Add enough of an offset for it to go off-screen.
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom'
        }
      ]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
    });

    it('should emit onPositionChange event when the position changes', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }
      ]);

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = positionStrategy.positionChanges.subscribe(positionChangeHandler);

      attachOverlay({positionStrategy});

      const latestCall = positionChangeHandler.calls.mostRecent();

      expect(positionChangeHandler).toHaveBeenCalled();
      expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
          .toBe(true, `Expected strategy to emit an instance of ConnectedOverlayPositionChange.`);

      // If the strategy is re-applied and the initial position would now fit,
      // the position change event should be emitted again.
      originElement.style.top = '200px';
      originElement.style.left = '200px';

      overlayRef.updatePosition();

      expect(positionChangeHandler).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    });

    it('should emit the onPositionChange event even if none of the positions fit', () => {
      originElement.style.bottom = '25px';
      originElement.style.right = '25px';

      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }
      ]);

      const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
      const subscription = positionStrategy.positionChanges.subscribe(positionChangeHandler);

      attachOverlay({positionStrategy});

      expect(positionChangeHandler).toHaveBeenCalled();

      subscription.unsubscribe();
    });

    it('should pick the fallback position that shows the largest area of the element', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      const originRect = originElement.getBoundingClientRect();

      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top'
        }
      ]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
    });

    it('should re-use the preferred position when re-applying while locked in', () => {
      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }
      ])
      .withLockedPosition();

      const recalcSpy = spyOn(positionStrategy, 'reapplyLastPosition');

      attachOverlay({positionStrategy});

      expect(recalcSpy).not.toHaveBeenCalled();

      positionStrategy.apply();

      expect(recalcSpy).toHaveBeenCalled();
    });

    it('should not retain the last preferred position when overriding the positions', () => {
      originElement.style.top = '100px';
      originElement.style.left = '100px';

      const originRect = originElement.getBoundingClientRect();

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 10,
        offsetY: 20
      }]);

      attachOverlay({positionStrategy});

      let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top) + 20);
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left) + 10);

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 20,
        offsetY: 40
      }]);

      positionStrategy.reapplyLastPosition();

      overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top) + 40);
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left) + 20);
    });

    /**
     * Run all tests for connecting the overlay to the origin such that first preferred
     * position does not go off-screen. We do this because there are several cases where we
     * want to run the exact same tests with different preconditions (e.g., not scroll, scrolled,
     * different element sized, etc.).
     */
    function runSimplePositionTests() {
      it('should position a panel below, left-aligned', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

      it('should position to the right, center aligned vertically', () => {
        const originRect = originElement.getBoundingClientRect();
        const originCenterY = originRect.top + (ORIGIN_HEIGHT / 2);

        positionStrategy.withPositions([{
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originCenterY - (OVERLAY_HEIGHT / 2)));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
      });

      it('should position to the left, below', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect.left));
      });

      it('should position above, right aligned', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.round(overlayRect.bottom)).toBe(Math.round(originRect.top));
        expect(Math.round(overlayRect.right)).toBe(Math.round(originRect.right));
      });

      it('should position below, centered', () => {
        const originRect = originElement.getBoundingClientRect();
        const originCenterX = originRect.left + (ORIGIN_WIDTH / 2);

        positionStrategy.withPositions([{
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originCenterX - (OVERLAY_WIDTH / 2)));
      });

      it('should center the overlay on the origin', () => {
        const originRect = originElement.getBoundingClientRect();

        positionStrategy.withPositions([{
          originX: 'center',
          originY: 'center',
          overlayX: 'center',
          overlayY: 'center'
        }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });
    }
  });

  describe('with pushing', () => {
    const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
    const OVERLAY_WIDTH = DEFAULT_WIDTH;

    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position()
          .flexibleConnectedTo(originElement)
          .withFlexibleDimensions(false)
          .withPush();
    });

    afterEach(() => {
      document.body.removeChild(originElement);
    });

    it('should be able to push an overlay into the viewport when it goes out on the right', () => {
      originElement.style.top = '200px';
      originElement.style.right = `${-OVERLAY_WIDTH / 2}px`;

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.right)).toBe(viewport.getViewportSize().width);
    });

    it('should be able to push an overlay into the viewport when it goes out on the left', () => {
      originElement.style.top = '200px';
      originElement.style.left = `${-OVERLAY_WIDTH / 2}px`;

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.left)).toBe(0);
    });

    it('should be able to push an overlay into the viewport when it goes out on the top', () => {
      originElement.style.top = `${-OVERLAY_HEIGHT * 2}px`;
      originElement.style.left = '200px';

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.top)).toBe(0);
    });

    it('should be able to push an overlay into the viewport when it goes out on the bottom', () => {
      originElement.style.bottom = `${-OVERLAY_HEIGHT / 2}px`;
      originElement.style.left = '200px';

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.bottom)).toBe(viewport.getViewportSize().height);
    });

    it('should set a margin when pushing the overlay into the viewport horizontally', () => {
      originElement.style.top = '200px';
      originElement.style.left = `${-OVERLAY_WIDTH / 2}px`;

      positionStrategy
        .withViewportMargin(15)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.left)).toBe(15);
    });

    it('should set a margin when pushing the overlay into the viewport vertically', () => {
      positionStrategy.withViewportMargin(15);

      originElement.style.top = `${-OVERLAY_HEIGHT * 2}px`;
      originElement.style.left = '200px';

      positionStrategy
        .withViewportMargin(15)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.top)).toBe(15);
    });

    it('should not mess with the left offset when pushing from the top', () => {
      originElement.style.top = `${-OVERLAY_HEIGHT * 2}px`;
      originElement.style.left = '200px';

      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
      }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.left)).toBe(200);
    });

    it('should align to the trigger if the overlay is wider than the viewport, but the trigger ' +
      'is still within the viewport', () => {
        originElement.style.top = '200px';
        originElement.style.left = '150px';

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          }
        ]);

        attachOverlay({
          // Set a large max-width to override the one that comes from the
          // overlay structural styles. Otherwise the `width` will stop at the viewport width.
          maxWidth: '200vw',
          width: viewport.getViewportRect().width + 100,
          positionStrategy
        });

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        const originRect = originElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
      });

    it('should push into the viewport if the overlay is wider than the viewport and the trigger' +
      'out of the viewport', () => {
        originElement.style.top = '200px';
        originElement.style.left = `-${DEFAULT_WIDTH / 2}px`;

        positionStrategy.withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          }
        ]);

        attachOverlay({
          // Set a large max-width to override the one that comes from the
          // overlay structural styles. Otherwise the `width` will stop at the viewport width.
          maxWidth: '200vw',
          width: viewport.getViewportRect().width + 100,
          positionStrategy
        });

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.left)).toBe(0);
      });

    it('should keep the element inside the viewport as the user is scrolling, ' +
      'with position locking disabled', () => {
        const veryLargeElement = document.createElement('div');

        originElement.style.top = `${-OVERLAY_HEIGHT * 2}px`;
        originElement.style.left = '200px';

        veryLargeElement.style.width = '100%';
        veryLargeElement.style.height = '2000px';
        document.body.appendChild(veryLargeElement);

        positionStrategy
          .withLockedPosition(false)
          .withViewportMargin(0)
          .withPositions([{
            overlayY: 'top',
            overlayX: 'start',
            originY: 'top',
            originX: 'start'
          }]);

        attachOverlay({positionStrategy});

        let overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top))
            .toBe(0, 'Expected overlay to be in the viewport initially.');

        window.scroll(0, 100);
        overlayRef.updatePosition();
        zone.simulateZoneExit();

        overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        expect(Math.floor(overlayRect.top))
            .toBe(0, 'Expected overlay to stay in the viewport after scrolling.');

        window.scroll(0, 0);
        document.body.removeChild(veryLargeElement);
      });

      it('should not continue pushing the overlay as the user scrolls, if position ' +
        'locking is enabled', () => {
        const veryLargeElement = document.createElement('div');

        originElement.style.top = `${-OVERLAY_HEIGHT * 2}px`;
        originElement.style.left = '200px';

        veryLargeElement.style.width = '100%';
        veryLargeElement.style.height = '2000px';
        document.body.appendChild(veryLargeElement);

        positionStrategy
          .withLockedPosition()
          .withViewportMargin(0)
          .withPositions([{
            overlayY: 'top',
            overlayX: 'start',
            originY: 'top',
            originX: 'start'
          }]);

        attachOverlay({positionStrategy});

        const scrollBy = 100;
        let initialOverlayTop = Math.floor(overlayRef.overlayElement.getBoundingClientRect().top);

        expect(initialOverlayTop).toBe(0, 'Expected overlay to be inside the viewport initially.');

        window.scroll(0, scrollBy);
        overlayRef.updatePosition();
        zone.simulateZoneExit();

        let currentOverlayTop = Math.floor(overlayRef.overlayElement.getBoundingClientRect().top);

        expect(currentOverlayTop).toBeLessThan(0,
            'Expected overlay to no longer be completely inside the viewport.');
        expect(currentOverlayTop).toBe(initialOverlayTop - scrollBy,
            'Expected overlay to maintain its previous position.');

        window.scroll(0, 0);
        document.body.removeChild(veryLargeElement);
      });

  });

  describe('with flexible dimensions', () => {
    const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
    const OVERLAY_WIDTH = DEFAULT_WIDTH;

    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position().flexibleConnectedTo(originElement);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
    });

    it('should align the overlay to `flex-start` when the content is flowing to the right', () => {
      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      expect(overlayRef.hostElement.style.alignItems).toBe('flex-start');
    });

    it('should align the overlay to `flex-end` when the content is flowing to the left', () => {
      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'end',
          originY: 'bottom',
          originX: 'end'
        }]);

      attachOverlay({positionStrategy});

      expect(overlayRef.hostElement.style.alignItems).toBe('flex-end');
    });

    it('should align the overlay to `center` when the content is centered', () => {
      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'center',
          originY: 'bottom',
          originX: 'center'
        }]);

      attachOverlay({positionStrategy});

      expect(overlayRef.hostElement.style.alignItems).toBe('center');
    });

    it('should support offsets when centering', () => {
      originElement.style.top = '200px';
      originElement.style.left = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'center',
          overlayX: 'center',
          originY: 'center',
          originX: 'center',
          offsetY: 20,
          offsetX: -15
        }]);

      attachOverlay({positionStrategy});

      const originRect = originElement.getBoundingClientRect();
      const originCenterX = originRect.left + (DEFAULT_WIDTH / 2);
      const originCenterY = originRect.top + (DEFAULT_HEIGHT / 2);

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      const overlayCenterY = overlayRect.top + (OVERLAY_HEIGHT / 2);
      const overlayCenterX = overlayRect.left + (OVERLAY_WIDTH / 2);

      expect(overlayRef.overlayElement.style.transform)
              .toBe('translateX(-15px) translateY(20px)');
      expect(Math.floor(overlayCenterY)).toBe(Math.floor(originCenterY) + 20);
      expect(Math.floor(overlayCenterX)).toBe(Math.floor(originCenterX) - 15);
    });

    it('should become scrollable when it hits the viewport edge with a flexible height', () => {
      originElement.style.left = '200px';
      originElement.style.bottom = `${OVERLAY_HEIGHT - 10}px`;

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT - 10);
      expect(Math.floor(overlayRect.bottom)).toBe(viewport.getViewportSize().height);
    });

    it('should become scrollable when it hits the viewport edge with a flexible width', () => {
      originElement.style.top = '200px';
      originElement.style.right = '-20px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.width)).toBe(OVERLAY_WIDTH - 20);
      expect(Math.floor(overlayRect.right)).toBe(viewport.getViewportSize().width);
    });

    it('should not collapse the height if the size is less than the minHeight', () => {
      originElement.style.left = '200px';
      originElement.style.bottom = `${OVERLAY_HEIGHT - 10}px`;

      positionStrategy
        .withFlexibleDimensions()
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({
        positionStrategy,
        minHeight: OVERLAY_HEIGHT - 5
      });

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT);
    });

    it('should not collapse the width if the size is less than the minWidth', () => {
      originElement.style.top = '200px';
      originElement.style.right = '-20px';

      positionStrategy
        .withFlexibleDimensions()
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({
        minWidth: OVERLAY_WIDTH - 10,
        positionStrategy
      });

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      expect(Math.floor(overlayRect.width)).toBe(OVERLAY_WIDTH);
    });

    it('should take `weight` into account when determining which position to pick', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([
          {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            weight: 3
          },
          {
            originX: 'end',
            originY: 'center',
            overlayX: 'start',
            overlayY: 'center'
          }
        ]);

      attachOverlay({positionStrategy});

      const originRect = originElement.getBoundingClientRect();
      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.right));
    });

    it('should be able to opt-in to having the overlay grow after it was opened', () => {
      originElement.style.left = '200px';
      originElement.style.bottom = `${OVERLAY_HEIGHT - 10}px`;

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withGrowAfterOpen()
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      // The overlay should be scrollable, because it hit the viewport edge.
      expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT - 10);

      originElement.style.bottom = '200px';
      overlayRef.updatePosition();
      overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      // The overlay should be back to full height.
      expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT);
    });

    it('should calculate the `bottom` value correctly with upward-flowing content ' +
      'and a scrolled page', () => {
        const veryLargeElement = document.createElement('div');

        originElement.style.left = '200px';
        originElement.style.top = `200px`;

        veryLargeElement.style.width = '100%';
        veryLargeElement.style.height = '2000px';
        document.body.appendChild(veryLargeElement);
        window.scroll(0, 50);

        positionStrategy
          .withFlexibleDimensions()
          .withPush(false)
          .withPositions([{
            overlayY: 'bottom',
            overlayX: 'start',
            originY: 'bottom',
            originX: 'start'
          }]);

        attachOverlay({positionStrategy});

        const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
        const originRect = originElement.getBoundingClientRect();

        expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.bottom));

        window.scroll(0, 0);
        document.body.removeChild(veryLargeElement);
      });

    it('should set the proper styles when the `bottom` value is exactly zero', () => {
      originElement.style.position = 'fixed';
      originElement.style.bottom = '0';
      originElement.style.left = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'bottom',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const boundingBox = overlayContainer
        .getContainerElement()
        .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

      // Ensure that `0px` is set explicitly, rather than the
      // property being left blank due to zero being falsy.
      expect(boundingBox.style.bottom).toBe('0px');
    });

    it('should set the proper styles when the `top` value is exactly zero', () => {
      originElement.style.position = 'fixed';
      originElement.style.top = '0';
      originElement.style.left = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'top',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const boundingBox = overlayContainer
        .getContainerElement()
        .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

      // Ensure that `0px` is set explicitly, rather than the
      // property being left blank due to zero being falsy.
      expect(boundingBox.style.top).toBe('0px');
    });

    it('should set the proper styles when the `left` value is exactly zero', () => {
      originElement.style.position = 'fixed';
      originElement.style.left = '0';
      originElement.style.top = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'top',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const boundingBox = overlayContainer
        .getContainerElement()
        .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

      // Ensure that `0px` is set explicitly, rather than the
      // property being left blank due to zero being falsy.
      expect(boundingBox.style.left).toBe('0px');
    });

    it('should set the proper styles when the `right` value is exactly zero', () => {
      originElement.style.position = 'fixed';
      originElement.style.right = '0';
      originElement.style.top = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'end',
          originY: 'top',
          originX: 'end'
        }]);

      attachOverlay({positionStrategy});

      const boundingBox = overlayContainer
        .getContainerElement()
        .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

      // Ensure that `0px` is set explicitly, rather than the
      // property being left blank due to zero being falsy.
      expect(boundingBox.style.right).toBe('0px');
    });

    it('should calculate the bottom offset correctly with a viewport margin', () => {
      const viewportMargin = 5;

      originElement.style.top = `${OVERLAY_HEIGHT / 2}px`;
      originElement.style.right = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withViewportMargin(viewportMargin)
        .withPositions([
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom'
          }
        ]);

      attachOverlay({positionStrategy});

      const originRect = originElement.getBoundingClientRect();
      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.top));
      expect(Math.floor(overlayRect.top)).toBe(viewportMargin);
    });

    it('should center flexible overlay with push on a scrolled page', () => {
      const veryLargeElement = document.createElement('div');

      originElement.style.left = '200px';
      originElement.style.top = '200px';

      veryLargeElement.style.width = '100%';
      veryLargeElement.style.height = '2000px';
      document.body.appendChild(veryLargeElement);
      window.scroll(0, 250);

      positionStrategy
        .withFlexibleDimensions()
        .withPush(true)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'center',
          originY: 'bottom',
          originX: 'center'
        }]);

      attachOverlay({positionStrategy});

      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
      const originRect = originElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.left - overlayRect.width / 2))
          .toBe(Math.floor(originRect.left - originRect.width / 2));

      window.scroll(0, 0);
      document.body.removeChild(veryLargeElement);
    });

    it('should size the bounding box correctly when opening downwards on a scrolled page', () => {
      const viewportMargin = 10;
      const veryLargeElement: HTMLElement = document.createElement('div');
      veryLargeElement.style.width = '4000px';
      veryLargeElement.style.height = '4000px';
      document.body.appendChild(veryLargeElement);
      window.scroll(2100, 2100);

      originElement.style.position = 'fixed';
      originElement.style.top = '100px';
      originElement.style.left = '200px';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(false)
        .withViewportMargin(viewportMargin)
        .withPositions([{
          overlayY: 'top',
          overlayX: 'start',
          originY: 'bottom',
          originX: 'start'
        }]);

      attachOverlay({positionStrategy});

      const boundingBox = overlayContainer
        .getContainerElement()
        .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

      // Use the `documentElement` here to determine the viewport
      // height since it's what is used by the overlay.
      const viewportHeight = document.documentElement!.clientHeight - (2 * viewportMargin);
      const originRect = originElement.getBoundingClientRect();
      const boundingBoxRect = boundingBox.getBoundingClientRect();

      expect(Math.floor(boundingBoxRect.height))
          .toBe(Math.floor(viewportHeight - originRect.bottom + viewportMargin));

      window.scroll(0, 0);
      document.body.removeChild(veryLargeElement);
    });

    it('should not push the overlay if it is exactly as wide as the viewport', () => {
      originElement.style.position = 'fixed';
      originElement.style.top = '100px';
      originElement.style.right = '0';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(true)
        .withPositions([{
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        }]);

      attachOverlay({
        width: viewport.getViewportRect().width,
        positionStrategy
      });

      const originRect = originElement.getBoundingClientRect();
      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.right)).toBe(Math.floor(originRect.right));
    });

    it('should not push the overlay if it is exactly as tall as the viewport', () => {
      originElement.style.position = 'fixed';
      originElement.style.left = '100px';
      originElement.style.bottom = '0';

      positionStrategy
        .withFlexibleDimensions()
        .withPush(true)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom',
        }]);

      attachOverlay({
        width: viewport.getViewportRect().height,
        positionStrategy
      });

      const originRect = originElement.getBoundingClientRect();
      const overlayRect = overlayRef.overlayElement.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom)).toBe(Math.floor(originRect.bottom));
    });

  });

  describe('onPositionChange with scrollable view properties', () => {
    let scrollable: HTMLDivElement;
    let positionChangeHandler: jasmine.Spy;
    let onPositionChangeSubscription: Subscription;

    beforeEach(() => {
      // Set up the origin
      const originElement = createBlockElement();
      originElement.style.margin = '0 1000px 1000px 0';  // Added so that the container scrolls

      // Create a scrollable container and put the origin inside
      scrollable = createOverflowContainerElement();
      document.body.appendChild(scrollable);
      scrollable.appendChild(originElement);

      // Create a strategy with knowledge of the scrollable container
      const strategy = overlay.position()
        .flexibleConnectedTo(originElement)
        .withPush(false)
        .withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        }]);

      strategy.withScrollableContainers([
        new CdkScrollable(new ElementRef<HTMLElement>(scrollable), null!, null!)
      ]);

      positionChangeHandler = jasmine.createSpy('positionChange handler');
      onPositionChangeSubscription = strategy.positionChanges
        .pipe(map(event => event.scrollableViewProperties))
        .subscribe(positionChangeHandler);

      attachOverlay({positionStrategy: strategy});
    });

    afterEach(() => {
      onPositionChangeSubscription.unsubscribe();
      document.body.removeChild(scrollable);
    });

    it('should not have origin or overlay clipped or out of view without scroll', () => {
      expect(positionChangeHandler).toHaveBeenCalledWith(jasmine.objectContaining({
        isOriginClipped: false,
        isOriginOutsideView: false,
        isOverlayClipped: false,
        isOverlayOutsideView: false
      }));
    });

    it('should evaluate if origin is clipped if scrolled slightly down', () => {
      scrollable.scrollTop = 10;  // Clip the origin by 10 pixels
      overlayRef.updatePosition();

      expect(positionChangeHandler).toHaveBeenCalledWith(jasmine.objectContaining({
        isOriginClipped: true,
        isOriginOutsideView: false,
        isOverlayClipped: false,
        isOverlayOutsideView: false
      }));
    });

    it('should evaluate if origin is out of view and overlay is clipped if scrolled enough', () => {
      scrollable.scrollTop = 31;  // Origin is 30 pixels, move out of view and clip the overlay 1px
      overlayRef.updatePosition();

      expect(positionChangeHandler).toHaveBeenCalledWith(jasmine.objectContaining({
        isOriginClipped: true,
        isOriginOutsideView: true,
        isOverlayClipped: true,
        isOverlayOutsideView: false
      }));
    });

    it('should evaluate the overlay and origin are both out of the view', () => {
      scrollable.scrollTop = 61;  // Scroll by overlay height + origin height + 1px
      overlayRef.updatePosition();

      expect(positionChangeHandler).toHaveBeenCalledWith(jasmine.objectContaining({
        isOriginClipped: true,
        isOriginOutsideView: true,
        isOverlayClipped: true,
        isOverlayOutsideView: true
      }));
    });
  });

  describe('positioning properties', () => {
    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position().flexibleConnectedTo(originElement);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
    });

    describe('in ltr', () => {
      it('should use `left` when positioning an element at the start', () => {
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        expect(overlayRef.hostElement.style.left).toBeTruthy();
        expect(overlayRef.hostElement.style.right).toBeFalsy();
      });

      it('should use `right` when positioning an element at the end', () => {
        positionStrategy.withPositions([{
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        expect(overlayRef.hostElement.style.right).toBeTruthy();
        expect(overlayRef.hostElement.style.left).toBeFalsy();
      });

    });

    describe('in rtl', () => {
      it('should use `right` when positioning an element at the start', () => {
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({
          positionStrategy,
          direction: 'rtl'
        });

        expect(overlayRef.hostElement.style.right).toBeTruthy();
        expect(overlayRef.hostElement.style.left).toBeFalsy();
      });

      it('should use `left` when positioning an element at the end', () => {
        positionStrategy.withPositions([{
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy, direction: 'rtl'});

        expect(overlayRef.hostElement.style.left).toBeTruthy();
        expect(overlayRef.hostElement.style.right).toBeFalsy();
      });
    });

    describe('vertical', () => {
      it('should use `top` when positioning at element along the top', () => {
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        }]);

        attachOverlay({positionStrategy});

        expect(overlayRef.hostElement.style.top).toBeTruthy();
        expect(overlayRef.hostElement.style.bottom).toBeFalsy();
      });

      it('should use `bottom` when positioning at element along the bottom', () => {
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'bottom'
        }]);

        attachOverlay({positionStrategy});

        expect(overlayRef.hostElement.style.bottom).toBeTruthy();
        expect(overlayRef.hostElement.style.top).toBeFalsy();
      });
    });

  });

  describe('validations', () => {
    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position().flexibleConnectedTo(originElement);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
      positionStrategy.dispose();
    });

    it('should throw when attaching without any positions', () => {
      expect(() => positionStrategy.withPositions([])).toThrow();
    });

    it('should throw when passing in something that is missing a connection point', () => {
      expect(() => {
        positionStrategy.withPositions([{
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        } as any]);
      }).toThrow();
    });

    it('should throw when passing in something that has an invalid X position', () => {
      expect(() => {
        positionStrategy.withPositions([{
          originX: 'left',
          originY: 'top',
          overlayX: 'left',
          overlayY: 'top'
        } as any]);
      }).toThrow();
    });

    it('should throw when passing in something that has an invalid Y position', () => {
      expect(() => {
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'middle',
          overlayX: 'start',
          overlayY: 'middle'
        } as any]);
      }).toThrow();
    });
  });

  describe('panel classes', () => {
    let originElement: HTMLElement;
    let positionStrategy: FlexibleConnectedPositionStrategy;

    beforeEach(() => {
      originElement = createPositionedBlockElement();
      document.body.appendChild(originElement);
      positionStrategy = overlay.position()
          .flexibleConnectedTo(originElement)
          .withFlexibleDimensions(false)
          .withPush(false);
    });

    afterEach(() => {
      document.body.removeChild(originElement);
    });

    it('should be able to apply a class based on the position', () => {
      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        panelClass: 'is-below'
      }]);

      attachOverlay({positionStrategy});

      expect(overlayRef.overlayElement.classList).toContain('is-below');
    });

    it('should be able to apply multiple classes based on the position', () => {
      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        panelClass: ['is-below', 'is-under']
      }]);

      attachOverlay({positionStrategy});

      expect(overlayRef.overlayElement.classList).toContain('is-below');
      expect(overlayRef.overlayElement.classList).toContain('is-under');
    });

    it('should not throw if an empty string is passed in as a panel class', () => {
      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        panelClass: ['is-below', '']
      }]);

      expect(() => attachOverlay({positionStrategy})).not.toThrow();
      expect(overlayRef.overlayElement.classList).toContain('is-below');
    });

    it('should remove the panel class when detaching', () => {
      positionStrategy.withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        panelClass: 'is-below'
      }]);

      attachOverlay({positionStrategy});
      expect(overlayRef.overlayElement.classList).toContain('is-below');

      overlayRef.detach();
      expect(overlayRef.overlayElement.classList).not.toContain('is-below');
    });

    it('should clear the previous classes when the position changes', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          panelClass: ['is-center', 'is-in-the-middle']
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          panelClass: 'is-below'
        }
      ]);

      attachOverlay({positionStrategy});

      const overlayClassList = overlayRef.overlayElement.classList;

      expect(overlayClassList).not.toContain('is-center');
      expect(overlayClassList).not.toContain('is-in-the-middle');
      expect(overlayClassList).toContain('is-below');

      // Move the element so another position is applied.
      originElement.style.top = '200px';
      originElement.style.left = '200px';

      overlayRef.updatePosition();

      expect(overlayClassList).toContain('is-center');
      expect(overlayClassList).toContain('is-in-the-middle');
      expect(overlayClassList).not.toContain('is-below');
    });

    it('should not clear the existing `panelClass` from the `OverlayRef`', () => {
      originElement.style.top = '200px';
      originElement.style.right = '25px';

      positionStrategy.withPositions([
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          panelClass: ['is-center', 'is-in-the-middle']
        },
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          panelClass: 'is-below'
        }
      ]);

      attachOverlay({
        panelClass: 'custom-panel-class',
        positionStrategy
      });

      const overlayClassList = overlayRef.overlayElement.classList;

      expect(overlayClassList).toContain('custom-panel-class');

      // Move the element so another position is applied.
      originElement.style.top = '200px';
      originElement.style.left = '200px';

      overlayRef.updatePosition();

      expect(overlayClassList).toContain('custom-panel-class');
    });

  });

});

/** Creates an absolutely positioned, display: block element with a default size. */
function createPositionedBlockElement() {
  const element = createBlockElement();
  element.style.position = 'absolute';
  return element;
}

/** Creates a block element with a default size. */
function createBlockElement() {
  const element = document.createElement('div');
  element.style.width = `${DEFAULT_WIDTH}px`;
  element.style.height = `${DEFAULT_HEIGHT}px`;
  element.style.backgroundColor = 'rebeccapurple';
  element.style.zIndex = '100';
  return element;
}

/** Creates an overflow container with a set height and width with margin. */
function createOverflowContainerElement() {
  const element = document.createElement('div');
  element.style.position = 'relative';
  element.style.overflow = 'auto';
  element.style.height = '300px';
  element.style.width = '300px';
  element.style.margin = '100px';
  return element;
}


@Component({
  template: `
    <div
      class="transform-origin"
      style="width: ${DEFAULT_WIDTH}px; height: ${DEFAULT_HEIGHT}px;"></div>
  `
})
class TestOverlay { }


@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: [TestOverlay],
  declarations: [TestOverlay],
  entryComponents: [TestOverlay],
})
class OverlayTestModule { }
