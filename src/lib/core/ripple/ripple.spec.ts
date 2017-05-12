import {TestBed, ComponentFixture, fakeAsync, tick, inject} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {ViewportRuler} from '../overlay/position/viewport-ruler';
import {RIPPLE_FADE_OUT_DURATION, RIPPLE_FADE_IN_DURATION} from './ripple-renderer';
import {dispatchMouseEvent} from '../testing/dispatch-events';
import {
  MdRipple, MdRippleModule, MD_RIPPLE_GLOBAL_OPTIONS, RippleState, RippleGlobalOptions
} from './index';

/** Extracts the numeric value of a pixel size string like '123px'.  */
const pxStringToFloat = (s: string) => {
  return parseFloat(s.replace('px', ''));
};

describe('MdRipple', () => {
  let fixture: ComponentFixture<any>;
  let rippleTarget: HTMLElement;
  let originalBodyMargin: string;
  let viewportRuler: ViewportRuler;

  const startingWindowWidth = window.innerWidth;
  const startingWindowHeight = window.innerHeight;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MdRippleModule],
      declarations: [
        BasicRippleContainer,
        RippleContainerWithInputBindings,
        RippleContainerWithoutBindings,
        RippleContainerWithNgIf,
      ],
    });
  });

  beforeEach(inject([ViewportRuler], (ruler: ViewportRuler) => {
    viewportRuler = ruler;

    // Set body margin to 0 during tests so it doesn't mess up position calculations.
    originalBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
  }));

  afterEach(() => {
    document.body.style.margin = originalBodyMargin;
  });

  describe('basic ripple', () => {
    let rippleDirective: MdRipple;

    const TARGET_HEIGHT = 200;
    const TARGET_WIDTH = 300;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('[mat-ripple]');
      rippleDirective = fixture.componentInstance.ripple;
    });

    it('sizes ripple to cover element', () => {
      // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
      // body causes karma's iframe for the test to stretch to fit that content once we attempt to
      // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
      // successfully constrain its size. As such, skip assertions in environments where the
      // window size has changed since the start of the test.
      if (window.innerWidth > startingWindowWidth || window.innerHeight > startingWindowHeight) {
        return;
      }

      let elementRect = rippleTarget.getBoundingClientRect();

      // Dispatch a ripple at the following relative coordinates (X: 50| Y: 75)
      dispatchMouseEvent(rippleTarget, 'mousedown', 50, 75);
      dispatchMouseEvent(rippleTarget, 'mouseup');

      // Calculate distance from the click to farthest edge of the ripple target.
      let maxDistanceX = TARGET_WIDTH - 50;
      let maxDistanceY = TARGET_HEIGHT - 75;

      // At this point the foreground ripple should be created with a div centered at the click
      // location, and large enough to reach the furthest corner, which is 250px to the right
      // and 125px down relative to the click position.
      let expectedRadius = Math.sqrt(maxDistanceX * maxDistanceX + maxDistanceY * maxDistanceY);
      let expectedLeft = elementRect.left + 50 - expectedRadius;
      let expectedTop = elementRect.top + 75 - expectedRadius;

      let ripple = rippleTarget.querySelector('.mat-ripple-element') as HTMLElement;

      // Note: getBoundingClientRect won't work because there's a transform applied to make the
      // ripple start out tiny.
      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
    });

    it('creates ripple on mousedown', () => {
      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(2);
    });

    it('removes ripple after timeout', fakeAsync(() => {
      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the duration for fading-in and fading-out the ripple.
      tick(RIPPLE_FADE_IN_DURATION + RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should remove ripples after mouseup', fakeAsync(() => {
      dispatchMouseEvent(rippleTarget, 'mousedown');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Fakes the duration of fading-in and fading-out normal ripples.
      // The fade-out duration has been added to ensure that didn't start fading out.
      tick(RIPPLE_FADE_IN_DURATION + RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchMouseEvent(rippleTarget, 'mouseup');
      tick(RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should not hide ripples while animating.', fakeAsync(() => {
      // Calculates the duration for fading-in and fading-out the ripple.
      let hideDuration = RIPPLE_FADE_IN_DURATION + RIPPLE_FADE_OUT_DURATION;

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(hideDuration - 10);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(10);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('creates ripples when manually triggered', () => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      rippleDirective.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('creates manual ripples with the default ripple config', () => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      // Calculate the diagonal distance and divide it by two for the center radius.
      let radius = Math.sqrt(TARGET_HEIGHT * TARGET_HEIGHT + TARGET_WIDTH * TARGET_WIDTH) / 2;

      rippleDirective.centered = true;
      rippleDirective.launch(0, 0);

      let rippleElement = rippleTarget.querySelector('.mat-ripple-element') as HTMLElement;

      expect(rippleElement).toBeTruthy();
      expect(parseFloat(rippleElement.style.left)).toBeCloseTo(TARGET_WIDTH / 2 - radius, 1);
      expect(parseFloat(rippleElement.style.top)).toBeCloseTo(TARGET_HEIGHT / 2 - radius, 1);
    });

    it('cleans up the event handlers when the container gets destroyed', () => {
      fixture = TestBed.createComponent(RippleContainerWithNgIf);
      fixture.detectChanges();

      rippleTarget = fixture.debugElement.nativeElement.querySelector('[mat-ripple]');

      fixture.componentInstance.isDestroyed = true;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    it('does not run events inside the NgZone', () => {
      const spy = jasmine.createSpy('zone unstable callback');
      const subscription = fixture.ngZone.onUnstable.subscribe(spy);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    describe('when page is scrolled', () => {
      let veryLargeElement: HTMLDivElement = document.createElement('div');
      let pageScrollTop = 500;
      let pageScrollLeft = 500;

      beforeEach(() => {
        // Add a very large element to make the page scroll
        veryLargeElement.style.width = '4000px';
        veryLargeElement.style.height = '4000px';

        document.body.appendChild(veryLargeElement);
        document.body.scrollTop = pageScrollTop;
        document.body.scrollLeft = pageScrollLeft;

        // Firefox
        document.documentElement.scrollLeft = pageScrollLeft;
        document.documentElement.scrollTop = pageScrollTop;

        // Mobile safari
        window.scrollTo(pageScrollLeft, pageScrollTop);
        // Force an update of the cached viewport geometries because IE11 emits the
        // scroll event later.
        viewportRuler._cacheViewportGeometry();
      });

      afterEach(() => {
        document.body.removeChild(veryLargeElement);
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;

        // Firefox
        document.documentElement.scrollLeft = 0;
        document.documentElement.scrollTop = 0;

        // Mobile safari
        window.scrollTo(0, 0);
        // Force an update of the cached viewport geometries because IE11 emits the
        // scroll event later.
        viewportRuler._cacheViewportGeometry();
      });

      it('create ripple with correct position', () => {
        let elementTop = 600;
        let elementLeft = 750;
        let left = 50;
        let top = 75;

        rippleTarget.style.left = `${elementLeft}px`;
        rippleTarget.style.top = `${elementTop}px`;

        // Simulate a keyboard-triggered click by setting event coordinates to 0.
        dispatchMouseEvent(rippleTarget, 'mousedown',
          left + elementLeft - pageScrollLeft,
          top + elementTop - pageScrollTop
        );

        let expectedRadius = Math.sqrt(250 * 250 + 125 * 125);
        let expectedLeft = left - expectedRadius;
        let expectedTop = top - expectedRadius;

        let ripple = rippleTarget.querySelector('.mat-ripple-element') as HTMLElement;

        // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
        // body causes karma's iframe for the test to stretch to fit that content once we attempt to
        // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
        // successfully constrain its size. As such, skip assertions in environments where the
        // window size has changed since the start of the test.
        if (window.innerWidth > startingWindowWidth || window.innerHeight > startingWindowHeight) {
          return;
        }

        expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
        expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
        expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
        expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
      });
    });

  });

  describe('manual ripples', () => {
    let rippleDirective: MdRipple;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('[mat-ripple]');
      rippleDirective = fixture.componentInstance.ripple;
    });

    it('should allow persistent ripple elements', fakeAsync(() => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      let rippleRef = rippleDirective.launch(0, 0, { persistent: true });

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the duration for fading-in and fading-out the ripple. Also adds some
      // extra time to demonstrate that the ripples are persistent.
      tick(RIPPLE_FADE_IN_DURATION + RIPPLE_FADE_OUT_DURATION + 5000);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      rippleRef.fadeOut();

      tick(RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

   it('should remove ripples that are not done fading-in', fakeAsync(() => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      rippleDirective.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(RIPPLE_FADE_IN_DURATION / 2);

      rippleDirective.fadeOutAll();

      tick(RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to be active after calling fadeOutAll.');
    }));

   it('should properly set ripple states', fakeAsync(() => {
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

     let rippleRef = rippleDirective.launch(0, 0, { persistent: true });

     expect(rippleRef.state).toBe(RippleState.FADING_IN);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(RIPPLE_FADE_IN_DURATION);

     expect(rippleRef.state).toBe(RippleState.VISIBLE);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     rippleRef.fadeOut();

     expect(rippleRef.state).toBe(RippleState.FADING_OUT);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(RIPPLE_FADE_OUT_DURATION);

     expect(rippleRef.state).toBe(RippleState.HIDDEN);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
   }));

  });

  describe('global ripple options', () => {
    let rippleDirective: MdRipple;

    function createTestComponent(rippleConfig: RippleGlobalOptions,
                                 testComponent: any = BasicRippleContainer) {
      // Reset the previously configured testing module to be able set new providers.
      // The testing module has been initialized in the root describe group for the ripples.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MdRippleModule],
        declarations: [testComponent],
        providers: [{ provide: MD_RIPPLE_GLOBAL_OPTIONS, useValue: rippleConfig }]
      });

      fixture = TestBed.createComponent(testComponent);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('[mat-ripple]');
      rippleDirective = fixture.componentInstance.ripple;
    }

    it('should work without having any binding set', () => {
      createTestComponent({ disabled: true }, RippleContainerWithoutBindings);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    it('when disabled should not show any ripples on mousedown', () => {
      createTestComponent({ disabled: true });

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    it('when disabled should still allow manual ripples', () => {
      createTestComponent({ disabled: true });

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      rippleDirective.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('should support changing the baseSpeedFactor', fakeAsync(() => {
      createTestComponent({ baseSpeedFactor: 0.5 });

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the speedFactor for the duration. Those factors needs to be inverted, because
      // a lower speed factor, will make the duration longer. For example: 0.5 => 2x duration.
      let fadeInFactor = 1 / 0.5;

      // Calculates the duration for fading-in and fading-out the ripple.
      tick(RIPPLE_FADE_IN_DURATION * fadeInFactor + RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should combine individual speed factor with baseSpeedFactor', fakeAsync(() => {
      createTestComponent({ baseSpeedFactor: 0.5 });

      rippleDirective.launch(0, 0, { speedFactor: 1.5 });

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the speedFactor for the duration. Those factors needs to be inverted, because
      // a lower speed factor, will make the duration longer. For example: 0.5 => 2x duration.
      let fadeInFactor = 1 / (0.5 * 1.5);

      // Calculates the duration for fading-in and fading-out the ripple.
      tick(RIPPLE_FADE_IN_DURATION * fadeInFactor + RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

  });

  describe('configuring behavior', () => {
    let controller: RippleContainerWithInputBindings;
    let rippleComponent: MdRipple;

    beforeEach(() => {
      fixture = TestBed.createComponent(RippleContainerWithInputBindings);
      fixture.detectChanges();

      controller = fixture.debugElement.componentInstance;
      rippleComponent = controller.ripple;
      rippleTarget = fixture.debugElement.nativeElement.querySelector('[mat-ripple]');
    });

    it('sets ripple color', () => {
      let backgroundColor = 'rgba(12, 34, 56, 0.8)';

      controller.color = backgroundColor;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      let ripple = rippleTarget.querySelector('.mat-ripple-element');
      expect(window.getComputedStyle(ripple).backgroundColor).toBe(backgroundColor);
    });

    it('does not respond to events when disabled input is set', () => {
      controller.disabled = true;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      controller.disabled = false;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('allows specifying custom trigger element', () => {
      let alternateTrigger = fixture.debugElement.nativeElement
        .querySelector('.alternateTrigger') as HTMLElement;

      dispatchMouseEvent(alternateTrigger, 'mousedown');
      dispatchMouseEvent(alternateTrigger, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      // Set the trigger element, and now events should create ripples.
      controller.trigger = alternateTrigger;
      fixture.detectChanges();

      dispatchMouseEvent(alternateTrigger, 'mousedown');
      dispatchMouseEvent(alternateTrigger, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('expands ripple from center if centered input is set', () => {
      controller.centered = true;
      fixture.detectChanges();

      let elementRect = rippleTarget.getBoundingClientRect();

      // Click the ripple element 50 px to the right and 75px down from its upper left.
      dispatchMouseEvent(rippleTarget, 'mousedown', 50, 75);
      dispatchMouseEvent(rippleTarget, 'mouseup');

      // Because the centered input is true, the center of the ripple should be the midpoint of the
      // bounding rect. The ripple should expand to cover the rect corners, which are 150px
      // horizontally and 100px vertically from the midpoint.
      let expectedRadius = Math.sqrt(150 * 150 + 100 * 100);
      let expectedLeft = elementRect.left + (elementRect.width / 2) - expectedRadius;
      let expectedTop = elementRect.top + (elementRect.height / 2) - expectedRadius;

      let ripple = rippleTarget.querySelector('.mat-ripple-element') as HTMLElement;

      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
    });

    it('uses custom radius if set', () => {
      let customRadius = 42;

      controller.radius = customRadius;
      fixture.detectChanges();

      let elementRect = rippleTarget.getBoundingClientRect();

      // Click the ripple element 50 px to the right and 75px down from its upper left.
      dispatchMouseEvent(rippleTarget, 'mousedown', 50, 75);
      dispatchMouseEvent(rippleTarget, 'mouseup');

      let expectedLeft = elementRect.left + 50 - customRadius;
      let expectedTop = elementRect.top + 75 - customRadius;

      let ripple = rippleTarget.querySelector('.mat-ripple-element') as HTMLElement;

      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * customRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * customRadius, 1);
    });
  });

});

@Component({
  template: `
    <div id="container" #ripple="mdRipple" mat-ripple [mdRippleSpeedFactor]="0"
         style="position: relative; width:300px; height:200px;">
    </div>
  `,
})
class BasicRippleContainer {
  @ViewChild('ripple') ripple: MdRipple;
}

@Component({
  template: `
    <div id="container" style="position: relative; width:300px; height:200px;"
      mat-ripple
      [mdRippleSpeedFactor]="0"
      [mdRippleTrigger]="trigger"
      [mdRippleCentered]="centered"
      [mdRippleRadius]="radius"
      [mdRippleDisabled]="disabled"
      [mdRippleColor]="color">
    </div>
    <div class="alternateTrigger"></div>
  `,
})
class RippleContainerWithInputBindings {
  trigger: HTMLElement = null;
  centered = false;
  disabled = false;
  radius = 0;
  color = '';
  @ViewChild(MdRipple) ripple: MdRipple;
}

@Component({
  template: `<div id="container" #ripple="mdRipple" mat-ripple></div>`,
})
class RippleContainerWithoutBindings {}

@Component({ template: `<div id="container" mat-ripple [mdRippleSpeedFactor]="0"
                             *ngIf="!isDestroyed"></div>` })
class RippleContainerWithNgIf {
  @ViewChild(MdRipple) ripple: MdRipple;
  isDestroyed = false;
}
