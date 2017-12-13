import {TestBed, inject} from '@angular/core/testing';
import {OverlayModule, Overlay, OverlayRef, GlobalPositionStrategy} from '../index';


describe('GlobalPositonStrategy', () => {
  let element: HTMLElement;
  let strategy: GlobalPositionStrategy;
  let hasOverlayAttached: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [OverlayModule]});

    inject([Overlay], (overlay: Overlay) => {
      strategy = overlay.position().global();
    })();

    element = document.createElement('div');
    document.body.appendChild(element);
    hasOverlayAttached = true;
    strategy.attach({
      overlayElement: element,
      hasAttached: () => hasOverlayAttached
    } as OverlayRef);
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }

    strategy.dispose();
  });

  it('should position the element to the (top, left) with an offset', () => {
    strategy.top('10px').left('40px').apply();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40px');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');
  });

  it('should position the element to the (bottom, right) with an offset', () => {
    strategy.bottom('70px').right('15em').apply();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('');
    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginBottom).toBe('70px');
    expect(elementStyle.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  });

  it('should overwrite previously applied positioning', () => {
    strategy.centerHorizontally().centerVertically().apply();
    strategy.top('10px').left('40%').apply();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40%');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');

    strategy.bottom('70px').right('15em').apply();

    expect(element.style.marginTop).toBe('');
    expect(element.style.marginLeft).toBe('');
    expect(element.style.marginBottom).toBe('70px');
    expect(element.style.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  });

  it('should center the element', () => {
    strategy.centerHorizontally().centerVertically().apply();

    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should center the element with an offset', () => {
    strategy.centerHorizontally('10px').centerVertically('15px').apply();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('10px');
    expect(elementStyle.marginTop).toBe('15px');

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  });

  it('should make the element position: static', () => {
    strategy.apply();

    expect(element.style.position).toBe('static');
  });

  it('should wrap the element in a `cdk-global-overlay-wrapper`', () => {
    strategy.apply();

    let parent = element.parentNode as HTMLElement;

    expect(parent.classList.contains('cdk-global-overlay-wrapper')).toBe(true);
  });


  it('should remove the parent wrapper from the DOM', () => {
    strategy.apply();

    expect(document.body.contains(element.parentNode!)).toBe(true);

    strategy.dispose();

    expect(document.body.contains(element.parentNode!)).toBe(false);
  });

  it('should set the element width', () => {
    strategy.width('100px').apply();

    expect(element.style.width).toBe('100px');
  });

  it('should set the element height', () => {
    strategy.height('100px').apply();

    expect(element.style.height).toBe('100px');
  });

  it('should reset the horizontal position and offset when the width is 100%', () => {
    strategy.centerHorizontally().width('100%').apply();

    expect(element.style.marginLeft).toBe('0px');
    expect((element.parentNode as HTMLElement).style.justifyContent).toBe('flex-start');
  });

  it('should reset the vertical position and offset when the height is 100%', () => {
    strategy.centerVertically().height('100%').apply();

    expect(element.style.marginTop).toBe('0px');
    expect((element.parentNode as HTMLElement).style.alignItems).toBe('flex-start');
  });

  it('should not throw when attempting to apply after the overlay has been disposed', () => {
    strategy.dispose();
    element.parentNode!.removeChild(element);
    hasOverlayAttached = false;

    expect(() => strategy.apply()).not.toThrow();
  });
});
