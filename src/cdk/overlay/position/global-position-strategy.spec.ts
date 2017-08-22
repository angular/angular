import {fakeAsync, flushMicrotasks, inject} from '@angular/core/testing';
import {GlobalPositionStrategy} from './global-position-strategy';
import {OverlayRef} from '../overlay-ref';


describe('GlobalPositonStrategy', () => {
  let element: HTMLElement;
  let strategy: GlobalPositionStrategy;

  beforeEach(() => {
    element = document.createElement('div');
    strategy = new GlobalPositionStrategy();
    document.body.appendChild(element);
    strategy.attach({overlayElement: element} as OverlayRef);
  });

  afterEach(() => {
    element.parentNode!.removeChild(element);
    strategy.dispose();
  });

  it('should position the element to the (top, left) with an offset', fakeAsyncTest(() => {
    strategy.top('10px').left('40px').apply();

    flushMicrotasks();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40px');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');
  }));

  it('should position the element to the (bottom, right) with an offset', fakeAsyncTest(() => {
    strategy.bottom('70px').right('15em').apply();

    flushMicrotasks();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('');
    expect(elementStyle.marginLeft).toBe('');
    expect(elementStyle.marginBottom).toBe('70px');
    expect(elementStyle.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  }));

  it('should overwrite previously applied positioning', fakeAsyncTest(() => {
    strategy.centerHorizontally().centerVertically().apply();
    flushMicrotasks();

    strategy.top('10px').left('40%').apply();
    flushMicrotasks();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginTop).toBe('10px');
    expect(elementStyle.marginLeft).toBe('40%');
    expect(elementStyle.marginBottom).toBe('');
    expect(elementStyle.marginRight).toBe('');

    expect(parentStyle.justifyContent).toBe('flex-start');
    expect(parentStyle.alignItems).toBe('flex-start');

    strategy.bottom('70px').right('15em').apply();

    flushMicrotasks();

    expect(element.style.marginTop).toBe('');
    expect(element.style.marginLeft).toBe('');
    expect(element.style.marginBottom).toBe('70px');
    expect(element.style.marginRight).toBe('15em');

    expect(parentStyle.justifyContent).toBe('flex-end');
    expect(parentStyle.alignItems).toBe('flex-end');
  }));

  it('should center the element', fakeAsyncTest(() => {
    strategy.centerHorizontally().centerVertically().apply();

    flushMicrotasks();

    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  }));

  it('should center the element with an offset', fakeAsyncTest(() => {
    strategy.centerHorizontally('10px').centerVertically('15px').apply();

    flushMicrotasks();

    let elementStyle = element.style;
    let parentStyle = (element.parentNode as HTMLElement).style;

    expect(elementStyle.marginLeft).toBe('10px');
    expect(elementStyle.marginTop).toBe('15px');

    expect(parentStyle.justifyContent).toBe('center');
    expect(parentStyle.alignItems).toBe('center');
  }));

  it('should make the element position: static', fakeAsyncTest(() => {
    strategy.apply();

    flushMicrotasks();

    expect(element.style.position).toBe('static');
  }));

  it('should wrap the element in a `cdk-global-overlay-wrapper`', fakeAsyncTest(() => {
    strategy.apply();

    flushMicrotasks();

    let parent = element.parentNode as HTMLElement;

    expect(parent.classList.contains('cdk-global-overlay-wrapper')).toBe(true);
  }));


  it('should remove the parent wrapper from the DOM', fakeAsync(() => {
    strategy.apply();

    flushMicrotasks();

    expect(document.body.contains(element.parentNode!)).toBe(true);

    strategy.dispose();

    expect(document.body.contains(element.parentNode!)).toBe(false);
  }));

  it('should set the element width', fakeAsync(() => {
    strategy.width('100px').apply();

    flushMicrotasks();

    expect(element.style.width).toBe('100px');
  }));

  it('should set the element height', fakeAsync(() => {
    strategy.height('100px').apply();

    flushMicrotasks();

    expect(element.style.height).toBe('100px');
  }));

  it('should reset the horizontal position and offset when the width is 100%', fakeAsync(() => {
    strategy.centerHorizontally().width('100%').apply();

    flushMicrotasks();

    expect(element.style.marginLeft).toBe('0px');
    expect((element.parentNode as HTMLElement).style.justifyContent).toBe('flex-start');
  }));

  it('should reset the vertical position and offset when the height is 100%', fakeAsync(() => {
    strategy.centerVertically().height('100%').apply();

    flushMicrotasks();

    expect(element.style.marginTop).toBe('0px');
    expect((element.parentNode as HTMLElement).style.alignItems).toBe('flex-start');
  }));
});

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}
