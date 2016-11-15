import {TestBed, ComponentFixture} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {MdRipple, MdRippleModule} from './ripple';


/** Creates a DOM event to indicate that a CSS transition for the given property ended. */
const createTransitionEndEvent = (propertyName: string) => {
  // The "new" TransitionEvent constructor isn't available in anything except Firefox:
  // https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
  // So we just try to create a base event, and IE11 doesn't support that so we have to use
  // the deprecated initTransitionEvent.
  try {
    const event = new Event('transitionend');
    (<any>event).propertyName = propertyName;
    return event;
  } catch (e) {
    const event = document.createEvent('TransitionEvent');
    event.initTransitionEvent('transitionend',
        false, /* canBubble */
        false, /* cancelable */
        propertyName,
        0 /* elapsedTime */);
    return event;
  }
};

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
  let rippleElement: HTMLElement;
  let rippleBackground: Element;
  let originalBodyMargin: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MdRippleModule.forRoot()],
      declarations: [BasicRippleContainer, RippleContainerWithInputBindings],
    });
  });

  beforeEach(() => {
    // Set body margin to 0 during tests so it doesn't mess up position calculations.
    originalBodyMargin = document.body.style.margin;
    document.body.style.margin = '0';
  });

  afterEach(() => {
    document.body.style.margin = originalBodyMargin;
  });

  describe('basic ripple', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(BasicRippleContainer);
      fixture.detectChanges();

      rippleElement = fixture.debugElement.nativeElement.querySelector('[md-ripple]');
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeTruthy();
    });

    it('shows background when parent receives mousedown event', () => {
      expect(rippleBackground.classList).not.toContain('md-ripple-active');
      const mouseDown = createMouseEvent('mousedown');
      // mousedown on the ripple element activates the background ripple.
      rippleElement.dispatchEvent(mouseDown);
      expect(rippleBackground.classList).toContain('md-ripple-active');
      // mouseleave on the container removes the background ripple.
      const mouseLeave = createMouseEvent('mouseleave');
      rippleElement.dispatchEvent(mouseLeave);
      expect(rippleBackground.classList).not.toContain('md-ripple-active');
    });

    it('creates foreground ripples on click', () => {
      rippleElement.click();
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(1);
      // Second click should create another ripple.
      rippleElement.click();
      const ripples = rippleElement.querySelectorAll('.md-ripple-foreground');
      expect(ripples.length).toBe(2);
      expect(ripples[0].classList).toContain('md-ripple-fade-in');
      expect(ripples[1].classList).toContain('md-ripple-fade-in');
      // Signal the end of the first ripple's expansion. The second ripple should be unaffected.
      const opacityTransitionEnd = createTransitionEndEvent('opacity');
      ripples[0].dispatchEvent(opacityTransitionEnd);
      expect(ripples[0].classList).not.toContain('md-ripple-fade-in');
      expect(ripples[0].classList).toContain('md-ripple-fade-out');
      expect(ripples[1].classList).toContain('md-ripple-fade-in');
      expect(ripples[1].classList).not.toContain('md-ripple-fade-out');
      // Signal the end of the first ripple's fade out. The ripple should be removed from the DOM.
      ripples[0].dispatchEvent(opacityTransitionEnd);
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(1);
      expect(rippleElement.querySelectorAll('.md-ripple-foreground')[0]).toBe(ripples[1]);
      // Finish the second ripple.
      ripples[1].dispatchEvent(opacityTransitionEnd);
      expect(ripples[1].classList).not.toContain('md-ripple-fade-in');
      expect(ripples[1].classList).toContain('md-ripple-fade-out');
      ripples[1].dispatchEvent(opacityTransitionEnd);
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(0);
    });

    it('creates ripples when manually triggered', () => {
      const rippleComponent = fixture.debugElement.componentInstance.ripple;
      // start() should show the background, but no foreground ripple yet.
      rippleComponent.start();
      expect(rippleBackground.classList).toContain('md-ripple-active');
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(0);
      // end() should deactivate the background and show the foreground ripple.
      rippleComponent.end(0, 0);
      expect(rippleBackground.classList).not.toContain('md-ripple-active');
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(1);
    });

    it('sizes ripple to cover element', () => {
      // Click the ripple element 50 px to the right and 75px down from its upper left.
      const elementRect = rippleElement.getBoundingClientRect();
      const clickEvent = createMouseEvent('click',
          {clientX: elementRect.left + 50, clientY: elementRect.top + 75});
      rippleElement.dispatchEvent(clickEvent);
      // At this point the foreground ripple should be created with a div centered at the click
      // location, and large enough to reach the furthest corner, which is 250px to the right
      // and 125px down relative to the click position.
      const expectedRadius = Math.sqrt(250 * 250 + 125 * 125);
      const expectedLeft = elementRect.left + 50 - expectedRadius;
      const expectedTop = elementRect.top + 75 - expectedRadius;
      const ripple = <HTMLElement>rippleElement.querySelector('.md-ripple-foreground');
      // Note: getBoundingClientRect won't work because there's a transform applied to make the
      // ripple start out tiny.
      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
    });

    it('expands ripple from center on click event triggered by keyboard', () => {
      const elementRect = rippleElement.getBoundingClientRect();
      // Simulate a keyboard-triggered click by setting event coordinates to 0.
      const clickEvent = createMouseEvent('click',
          {clientX: 0, clientY: 0, screenX: 0, screenY: 0});
      rippleElement.dispatchEvent(clickEvent);
      // The foreground ripple should be centered in the middle of the bounding rect, and large
      // enough to reach the corners, which are all 150px horizontally and 100px vertically away.
      const expectedRadius = Math.sqrt(150 * 150 + 100 * 100);
      const expectedLeft = elementRect.left + (elementRect.width / 2) - expectedRadius;
      const expectedTop = elementRect.top + (elementRect.height / 2) - expectedRadius;
      // Note: getBoundingClientRect won't work because there's a transform applied to make the
      // ripple start out tiny.
      const ripple = <HTMLElement>rippleElement.querySelector('.md-ripple-foreground');
      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
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
      rippleElement = fixture.debugElement.nativeElement.querySelector('[md-ripple]');
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeTruthy();
    });

    it('sets ripple background color', () => {
      // This depends on the exact color format that getComputedStyle returns; for example, alpha
      // values are quantized to increments of 1/255, so 0.1 becomes 0.0980392. 0.2 is ok.
      const color = 'rgba(22, 44, 66, 0.8)';
      controller.backgroundColor = color;
      fixture.detectChanges();
      rippleComponent.start();
      expect(window.getComputedStyle(rippleBackground).backgroundColor).toBe(color);
    });

    it('sets ripple foreground color', () => {
      const color = 'rgba(12, 34, 56, 0.8)';
      controller.color = color;
      fixture.detectChanges();
      rippleElement.click();
      const ripple = rippleElement.querySelector('.md-ripple-foreground');
      expect(window.getComputedStyle(ripple).backgroundColor).toBe(color);
    });

    it('does not respond to events when disabled input is set', () => {
      controller.disabled = true;
      fixture.detectChanges();
      const mouseDown = createMouseEvent('mousedown');
      // The background ripple should not respond to mouseDown, and no foreground ripple should be
      // created on a click.
      rippleElement.dispatchEvent(mouseDown);
      expect(rippleBackground.classList).not.toContain('md-ripple-active');
      rippleElement.click();
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(0);
      // Calling start() and end() should still create a ripple.
      rippleComponent.start();
      expect(rippleBackground.classList).toContain('md-ripple-active');
      rippleComponent.end(0, 0);
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(1);
    });

    it('allows specifying custom trigger element', () => {
      // Events on the other div don't do anything by default.
      const alternateTrigger =
          <HTMLElement>fixture.debugElement.nativeElement.querySelector('.alternateTrigger');
      const mouseDown = createMouseEvent('mousedown');
      alternateTrigger.dispatchEvent(mouseDown);
      expect(rippleBackground.classList).not.toContain('md-ripple-active');
      alternateTrigger.click();
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(0);

      // Reassign the trigger element, and now events should create ripples.
      controller.trigger = alternateTrigger;
      fixture.detectChanges();
      alternateTrigger.dispatchEvent(mouseDown);
      expect(rippleBackground.classList).toContain('md-ripple-active');
      alternateTrigger.click();
      expect(rippleElement.querySelectorAll('.md-ripple-foreground').length).toBe(1);
    });

    it('expands ripple from center if centered input is set', () => {
      controller.centered = true;
      fixture.detectChanges();
      // Click the ripple element 50 px to the right and 75px down from its upper left.
      const elementRect = rippleElement.getBoundingClientRect();
      const clickEvent = createMouseEvent('click',
          {clientX: elementRect.left + 50, clientY: elementRect.top + 75});
      rippleElement.dispatchEvent(clickEvent);
      // Because the centered input is true, the center of the ripple should be the midpoint of the
      // bounding rect. The ripple should expand to cover the rect corners, which are 150px
      // horizontally and 100px vertically from the midpoint.
      const expectedRadius = Math.sqrt(150 * 150 + 100 * 100);
      const expectedLeft = elementRect.left + (elementRect.width / 2) - expectedRadius;
      const expectedTop = elementRect.top + (elementRect.height / 2) - expectedRadius;

      const ripple = <HTMLElement>rippleElement.querySelector('.md-ripple-foreground');
      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * expectedRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * expectedRadius, 1);
    });

    it('uses custom radius if set', () => {
      const customRadius = 42;
      controller.maxRadius = customRadius;
      fixture.detectChanges();
      // Click the ripple element 50 px to the right and 75px down from its upper left.
      const elementRect = rippleElement.getBoundingClientRect();
      const clickEvent = createMouseEvent('click',
          {clientX: elementRect.left + 50, clientY: elementRect.top + 75});
      rippleElement.dispatchEvent(clickEvent);
      const expectedLeft = elementRect.left + 50 - customRadius;
      const expectedTop = elementRect.top + 75 - customRadius;

      const ripple = <HTMLElement>rippleElement.querySelector('.md-ripple-foreground');
      expect(pxStringToFloat(ripple.style.left)).toBeCloseTo(expectedLeft, 1);
      expect(pxStringToFloat(ripple.style.top)).toBeCloseTo(expectedTop, 1);
      expect(pxStringToFloat(ripple.style.width)).toBeCloseTo(2 * customRadius, 1);
      expect(pxStringToFloat(ripple.style.height)).toBeCloseTo(2 * customRadius, 1);
    });
  });

  describe('initially disabled ripple', () => {
    let controller: RippleContainerWithInputBindings;
    let rippleComponent: MdRipple;

    beforeEach(() => {
      fixture = TestBed.createComponent(RippleContainerWithInputBindings);
      controller = fixture.debugElement.componentInstance;
      controller.disabled = true;
      fixture.detectChanges();

      rippleComponent = controller.ripple;
      rippleElement = fixture.debugElement.nativeElement.querySelector('[md-ripple]');
    });

    it('initially does not create background', () => {
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeNull();
    });

    it('creates background when enabled', () => {
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeNull();

      controller.disabled = false;
      fixture.detectChanges();
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeTruthy();
    });

    it('creates background when manually activated', () => {
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeNull();

      rippleComponent.start();
      rippleBackground = rippleElement.querySelector('.md-ripple-background');
      expect(rippleBackground).toBeTruthy();
    });
  });
});

@Component({
  template: `
    <div id="container" md-ripple style="position: relative; width:300px; height:200px;">
    </div>
  `,
})
class BasicRippleContainer {
  @ViewChild(MdRipple) ripple: MdRipple;
}

@Component({
  template: `
    <div id="container" style="position: relative; width:300px; height:200px;"
      md-ripple
      [md-ripple-trigger]="trigger"
      [md-ripple-centered]="centered"
      [md-ripple-max-radius]="maxRadius"
      [md-ripple-disabled]="disabled"
      [md-ripple-color]="color"
      [md-ripple-background-color]="backgroundColor">
    </div>
    <div class="alternateTrigger"></div>
  `,
})
class RippleContainerWithInputBindings {
  trigger: HTMLElement = null;
  centered = false;
  disabled = false;
  maxRadius = 0;
  color = '';
  backgroundColor = '';
  @ViewChild(MdRipple) ripple: MdRipple;
}
