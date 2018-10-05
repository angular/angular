import {TestBed, ComponentFixture, fakeAsync, tick, inject} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {
  dispatchEvent,
  createTouchEvent,
  dispatchMouseEvent,
  dispatchTouchEvent,
  createMouseEvent,
} from '@angular/cdk/testing';
import {defaultRippleAnimationConfig, RippleAnimationConfig} from './ripple-renderer';
import {
  MatRipple, MatRippleModule, MAT_RIPPLE_GLOBAL_OPTIONS, RippleState, RippleGlobalOptions
} from './index';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

/** Shorthands for the enter and exit duration of ripples. */
const {enterDuration, exitDuration} = defaultRippleAnimationConfig;

describe('MatRipple', () => {
  let fixture: ComponentFixture<any>;
  let rippleTarget: HTMLElement;
  let originalBodyMargin: string | null;
  let platform: Platform;

  /** Extracts the numeric value of a pixel size string like '123px'. */
  const pxStringToFloat = (s: string | null) => s ? parseFloat(s) : 0;
  const startingWindowWidth = window.innerWidth;
  const startingWindowHeight = window.innerHeight;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatRippleModule],
      declarations: [
        BasicRippleContainer,
        RippleContainerWithInputBindings,
        RippleContainerWithoutBindings,
        RippleContainerWithNgIf,
      ],
    });
  });

  beforeEach(inject([Platform], (p: Platform) => {
    platform = p;

    // Set body margin to 0 during tests so it doesn't mess up position calculations.
    originalBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
  }));

  afterEach(() => {
    document.body.style.margin = originalBodyMargin;
  });

  describe('basic ripple', () => {
    let rippleDirective: MatRipple;

    const TARGET_HEIGHT = 200;
    const TARGET_WIDTH = 300;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('.mat-ripple');
      rippleDirective = fixture.componentInstance.ripple;
    });

    it('sizes ripple to cover element', () => {
      // This test is consistently flaky on iOS (vs. Safari on desktop and all other browsers).
      // Temporarily skip this test on iOS until we can determine the source of the flakiness.
      // TODO(jelbourn): determine the source of flakiness here
      if (platform.IOS) {
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

    it('should launch ripples on touchstart', fakeAsync(() => {
      dispatchTouchEvent(rippleTarget, 'touchstart');
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(enterDuration);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchTouchEvent(rippleTarget, 'touchend');

      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should clear ripples if the touch sequence is cancelled', fakeAsync(() => {
      dispatchTouchEvent(rippleTarget, 'touchstart');
      tick(enterDuration);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchTouchEvent(rippleTarget, 'touchcancel');
      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should launch multiple ripples for multi-touch', fakeAsync(() => {
      const touchEvent = createTouchEvent('touchstart');

      Object.defineProperties(touchEvent, {
        changedTouches: {
          value: [
            {pageX: 0, pageY: 0},
            {pageX: 10, pageY: 10},
            {pageX: 20, pageY: 20}
          ]
        }
      });

      dispatchEvent(rippleTarget, touchEvent);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(3);

      tick(enterDuration);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(3);

      dispatchTouchEvent(rippleTarget, 'touchend');

      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should ignore synthetic mouse events after touchstart', () => fakeAsync(() => {
      dispatchTouchEvent(rippleTarget, 'touchstart');
      dispatchTouchEvent(rippleTarget, 'mousedown');

      tick(enterDuration);
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchTouchEvent(rippleTarget, 'touchend');

      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should ignore fake mouse events from screen readers', fakeAsync(() => {
      const event = createMouseEvent('mousedown');
      Object.defineProperty(event, 'buttons', {get: () => 0});

      dispatchEvent(rippleTarget, event);
      tick(enterDuration);
      expect(rippleTarget.querySelector('.mat-ripple-element')).toBeFalsy();
    }));

    it('removes ripple after timeout', fakeAsync(() => {
      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the duration for fading-in and fading-out the ripple.
      tick(enterDuration + exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should remove ripples after mouseup', fakeAsync(() => {
      dispatchMouseEvent(rippleTarget, 'mousedown');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Fakes the duration of fading-in and fading-out normal ripples.
      // The fade-out duration has been added to ensure that didn't start fading out.
      tick(enterDuration + exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchMouseEvent(rippleTarget, 'mouseup');
      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should not hide ripples while animating.', fakeAsync(() => {
      // Calculates the duration for fading-in and fading-out the ripple.
      let hideDuration = enterDuration + exitDuration;

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
      expect(parseFloat(rippleElement.style.left as string))
          .toBeCloseTo(TARGET_WIDTH / 2 - radius, 1);
      expect(parseFloat(rippleElement.style.top as string))
          .toBeCloseTo(TARGET_HEIGHT / 2 - radius, 1);
    });

    it('cleans up the event handlers when the container gets destroyed', () => {
      fixture = TestBed.createComponent(RippleContainerWithNgIf);
      fixture.detectChanges();

      rippleTarget = fixture.debugElement.nativeElement.querySelector('.mat-ripple');

      fixture.componentInstance.isDestroyed = true;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    it('does not run events inside the NgZone', () => {
      const spy = jasmine.createSpy('zone unstable callback');
      const subscription = fixture.ngZone!.onUnstable.subscribe(spy);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should only persist the latest ripple on pointer down', fakeAsync(() => {
      dispatchMouseEvent(rippleTarget, 'mousedown');
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchMouseEvent(rippleTarget, 'mousedown');
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(2);

      tick(enterDuration + exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    }));

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
        document.documentElement!.scrollLeft = pageScrollLeft;
        document.documentElement!.scrollTop = pageScrollTop;

        // Mobile safari
        window.scrollTo(pageScrollLeft, pageScrollTop);
      });

      afterEach(() => {
        document.body.removeChild(veryLargeElement);
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;

        // Firefox
        document.documentElement!.scrollLeft = 0;
        document.documentElement!.scrollTop = 0;

        // Mobile safari
        window.scrollTo(0, 0);
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
    let rippleDirective: MatRipple;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('.mat-ripple');
      rippleDirective = fixture.componentInstance.ripple;
    });

    it('should allow persistent ripple elements', fakeAsync(() => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      let rippleRef = rippleDirective.launch(0, 0, { persistent: true });

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Calculates the duration for fading-in and fading-out the ripple. Also adds some
      // extra time to demonstrate that the ripples are persistent.
      tick(enterDuration + exitDuration + 5000);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      rippleRef.fadeOut();

      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

   it('should remove ripples that are not done fading-in', fakeAsync(() => {
      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      rippleDirective.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(enterDuration / 2);

      rippleDirective.fadeOutAll();

      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length)
        .toBe(0, 'Expected no ripples to be active after calling fadeOutAll.');
    }));

   it('should properly set ripple states', fakeAsync(() => {
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

     let rippleRef = rippleDirective.launch(0, 0, { persistent: true });

     expect(rippleRef.state).toBe(RippleState.FADING_IN);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(enterDuration);

     expect(rippleRef.state).toBe(RippleState.VISIBLE);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     rippleRef.fadeOut();

     expect(rippleRef.state).toBe(RippleState.FADING_OUT);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(exitDuration);

     expect(rippleRef.state).toBe(RippleState.HIDDEN);
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
   }));

   it('should allow setting a specific animation config for a ripple', fakeAsync(() => {
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

     rippleDirective.launch(0, 0, {
       animation: {enterDuration: 120, exitDuration: 0}
     });

     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(120);

     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
   }));

   it('should allow passing only a configuration', fakeAsync(() => {
     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

     const rippleRef = rippleDirective.launch({persistent: true});

     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     tick(enterDuration + exitDuration);

     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

     rippleRef.fadeOut();

     tick(exitDuration);

     expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
   }));
  });

  describe('global ripple options', () => {
    let rippleDirective: MatRipple;

    function createTestComponent(rippleConfig: RippleGlobalOptions,
                                 testComponent: any = BasicRippleContainer) {
      // Reset the previously configured testing module to be able set new providers.
      // The testing module has been initialized in the root describe group for the ripples.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MatRippleModule],
        declarations: [testComponent],
        providers: [{ provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: rippleConfig }]
      });

      fixture = TestBed.createComponent(testComponent);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('.mat-ripple');
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

    it('should support changing the animation duration', fakeAsync(() => {
      createTestComponent({
        animation: {enterDuration: 100, exitDuration: 100}
      });

      rippleDirective.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Wait the 200ms of the enter duration and exit duration.
      tick(100 + 100);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('should allow ripples to fade out immediately on pointer up', fakeAsync(() => {
      createTestComponent({
        terminateOnPointerUp: true
      });

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Ignore the enter duration, because we immediately fired the mouseup after the mousedown.
      // This means that the ripple should just fade out, and there shouldn't be an enter animation.
      tick(exitDuration);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      // Since the enter duration is bigger than the exit duration, the enter duration timer
      // will still exist. To properly finish all timers, we just wait the remaining time.
      tick(enterDuration - exitDuration);
    }));
  });

  describe('with disabled animations', () => {
    let rippleDirective: MatRipple;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, MatRippleModule],
        declarations: [BasicRippleContainer],
      });

      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.nativeElement.querySelector('.mat-ripple');
      rippleDirective = fixture.componentInstance.ripple;
    });

    it('should set the animation durations to zero', () => {
      expect(rippleDirective.rippleConfig.animation!.enterDuration).toBe(0);
      expect(rippleDirective.rippleConfig.animation!.exitDuration).toBe(0);
    });
  });

  describe('configuring behavior', () => {
    let controller: RippleContainerWithInputBindings;

    beforeEach(() => {
      fixture = TestBed.createComponent(RippleContainerWithInputBindings);
      fixture.detectChanges();

      controller = fixture.debugElement.componentInstance;
      rippleTarget = fixture.debugElement.nativeElement.querySelector('.mat-ripple');
    });

    it('sets ripple color', () => {
      const backgroundColor = 'rgba(12, 34, 56, 0.8)';

      controller.color = backgroundColor;
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      let ripple = rippleTarget.querySelector('.mat-ripple-element')!;
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

    it('should be able to specify animation config through binding', fakeAsync(() => {
      controller.animationConfig = {enterDuration: 150, exitDuration: 150};
      fixture.detectChanges();

      dispatchMouseEvent(rippleTarget, 'mousedown');
      dispatchMouseEvent(rippleTarget, 'mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      tick(150 + 150);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));
  });

});

@Component({
  template: `
    <div id="container" #ripple="matRipple" matRipple
         style="position: relative; width:300px; height:200px;">
    </div>
  `,
})
class BasicRippleContainer {
  @ViewChild('ripple') ripple: MatRipple;
}

@Component({
  template: `
    <div id="container" style="position: relative; width:300px; height:200px;"
      matRipple
      [matRippleTrigger]="trigger"
      [matRippleCentered]="centered"
      [matRippleRadius]="radius"
      [matRippleDisabled]="disabled"
      [matRippleAnimation]="animationConfig"
      [matRippleColor]="color">
    </div>
    <div class="alternateTrigger"></div>
  `,
})
class RippleContainerWithInputBindings {
  animationConfig: RippleAnimationConfig;
  trigger: HTMLElement;
  centered = false;
  disabled = false;
  radius = 0;
  color = '';
  @ViewChild(MatRipple) ripple: MatRipple;
}

@Component({
  template: `<div id="container" #ripple="matRipple" matRipple></div>`,
})
class RippleContainerWithoutBindings {}

@Component({ template: `<div id="container" matRipple
                             *ngIf="!isDestroyed"></div>` })
class RippleContainerWithNgIf {
  @ViewChild(MatRipple) ripple: MatRipple;
  isDestroyed = false;
}
