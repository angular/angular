import {TestBed, ComponentFixture, fakeAsync, tick, inject} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {MdRipple, MdRippleModule} from './ripple';
import {ViewportRuler} from '../overlay/position/viewport-ruler';
import {RIPPLE_FADE_OUT_DURATION, RIPPLE_SPEED_PX_PER_SECOND} from './ripple-renderer';


/** Creates a DOM mouse event. */
const createMouseEvent = (eventType: string, dict: any = {}) => {
  // Ideally this would just be "return new MouseEvent(eventType, dict)". But IE11 doesn't support
  // the MouseEvent constructor, and Edge inexplicably divides clientX and clientY by 100 to get
  // pageX and pageY. (Really. After "e = new MouseEvent('click', {clientX: 200, clientY: 300})",
  // e.clientX is 200, e.pageX is 2, e.clientY is 300, and e.pageY is 3.)
  // So instead we use the deprecated createEvent/initMouseEvent API, which works everywhere.
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent(eventType,
      false, /* canBubble */
      false, /* cancelable */
      window, /* view */
      0, /* detail */
      dict.screenX || 0,
      dict.screenY || 0,
      dict.clientX || 0,
      dict.clientY || 0,
      false, /* ctrlKey */
      false, /* altKey */
      false, /* shiftKey */
      false, /* metaKey */
      0, /* button */
      null /* relatedTarget */);
  return event;
};

/** Extracts the numeric value of a pixel size string like '123px'.  */
const pxStringToFloat = (s: string) => {
  return parseFloat(s.replace('px', ''));
};

describe('MdRipple', () => {
  let fixture: ComponentFixture<any>;
  let rippleTarget: HTMLElement;
  let originalBodyMargin: string;
  let viewportRuler: ViewportRuler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MdRippleModule.forRoot()],
      declarations: [
        BasicRippleContainer,
        RippleContainerWithInputBindings,
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

  function dispatchMouseEvent(type: string, offsetX = 0, offsetY = 0) {
    let mouseEvent = createMouseEvent(type, {
      clientX: rippleTarget.clientLeft + offsetX,
      clientY: rippleTarget.clientTop + offsetY
    });

    rippleTarget.dispatchEvent(mouseEvent);
  }

  describe('basic ripple', () => {

    const TARGET_HEIGHT = 200;
    const TARGET_WIDTH = 300;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleTarget = fixture.debugElement.nativeElement.querySelector('[mat-ripple]');
    });

    it('creates ripple on mousedown', () => {
      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(2);
    });

    it('removes ripple after timeout', fakeAsync(() => {
      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);

      // Determines the diagonal distance of the ripple target.
      let diagonal = Math.sqrt(TARGET_HEIGHT * TARGET_HEIGHT + TARGET_WIDTH * TARGET_WIDTH);

      // Calculates the duration for fading in the ripple. Also adds the fade-out duration.
      tick((diagonal / RIPPLE_SPEED_PX_PER_SECOND * 1000) + RIPPLE_FADE_OUT_DURATION);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    }));

    it('creates ripples when manually triggered', () => {
      let rippleComponent = fixture.debugElement.componentInstance.ripple as MdRipple;

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      rippleComponent.launch(0, 0);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('sizes ripple to cover element', () => {
      let elementRect = rippleTarget.getBoundingClientRect();

      // Dispatch a ripple at the following relative coordinates (X: 50| Y: 75)
      dispatchMouseEvent('mousedown', 50, 75);
      dispatchMouseEvent('mouseup');

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


    it('cleans up the event handlers when the container gets destroyed', () => {
      fixture = TestBed.createComponent(RippleContainerWithNgIf);
      fixture.detectChanges();

      rippleTarget = fixture.debugElement.nativeElement.querySelector('[mat-ripple]');

      fixture.componentInstance.isDestroyed = true;
      fixture.detectChanges();

      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);
    });

    describe('when page is scrolled', () => {
      const startingWindowWidth = window.innerWidth;
      const startingWindowHeight = window.innerHeight;

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
        let clickEvent = createMouseEvent('mousedown', {
          clientX: left + elementLeft - pageScrollLeft,
          clientY: top + elementTop - pageScrollTop,
          screenX: left + elementLeft,
          screenY: top + elementTop
        });

        rippleTarget.dispatchEvent(clickEvent);
        dispatchMouseEvent('mouseup');

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

      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      let ripple = rippleTarget.querySelector('.mat-ripple-element');
      expect(window.getComputedStyle(ripple).backgroundColor).toBe(backgroundColor);
    });

    it('does not respond to events when disabled input is set', () => {
      controller.disabled = true;
      fixture.detectChanges();

      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      controller.disabled = false;
      fixture.detectChanges();

      dispatchMouseEvent('mousedown');
      dispatchMouseEvent('mouseup');

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('allows specifying custom trigger element', () => {
      let alternateTrigger = fixture.debugElement.nativeElement
        .querySelector('.alternateTrigger') as HTMLElement;

      let mousedownEvent = createMouseEvent('mousedown');
      let mouseupEvent = createMouseEvent('mouseup');

      alternateTrigger.dispatchEvent(mousedownEvent);
      alternateTrigger.dispatchEvent(mouseupEvent);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(0);

      // Set the trigger element, and now events should create ripples.
      controller.trigger = alternateTrigger;
      fixture.detectChanges();

      alternateTrigger.dispatchEvent(mousedownEvent);
      alternateTrigger.dispatchEvent(mouseupEvent);

      expect(rippleTarget.querySelectorAll('.mat-ripple-element').length).toBe(1);
    });

    it('expands ripple from center if centered input is set', () => {
      controller.centered = true;
      fixture.detectChanges();

      let elementRect = rippleTarget.getBoundingClientRect();

      // Click the ripple element 50 px to the right and 75px down from its upper left.
      dispatchMouseEvent('mousedown', 50, 75);
      dispatchMouseEvent('mouseup');

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
      dispatchMouseEvent('mousedown', 50, 75);
      dispatchMouseEvent('mouseup');

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
    <div id="container" mat-ripple [mdRippleSpeedFactor]="0" 
         style="position: relative; width:300px; height:200px;">
    </div>
  `,
})
class BasicRippleContainer {
  @ViewChild(MdRipple) ripple: MdRipple;
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

@Component({ template: `<div id="container" mat-ripple [mdRippleSpeedFactor]="0" 
                             *ngIf="!isDestroyed"></div>` })
class RippleContainerWithNgIf {
  @ViewChild(MdRipple) ripple: MdRipple;
  isDestroyed = false;
}
