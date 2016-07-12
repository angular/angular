import {
  inject,
  fakeAsync,
  flushMicrotasks,
} from '@angular/core/testing';
import {GlobalPositionStrategy} from './global-position-strategy';


describe('GlobalPositonStrategy', () => {
  let element: HTMLElement;
  let strategy: GlobalPositionStrategy;

  beforeEach(() => {
    element = document.createElement('div');
    strategy = new GlobalPositionStrategy();
  });

  it('should set explicit (top, left) position to the element', fakeAsyncTest(() => {
    strategy.top('10px').left('40%').apply(element);

    flushMicrotasks();

    expect(element.style.top).toBe('10px');
    expect(element.style.left).toBe('40%');
    expect(element.style.bottom).toBe('');
    expect(element.style.right).toBe('');
  }));

  it('should set explicit (bottom, right) position to the element', fakeAsyncTest(() => {
    strategy.bottom('70px').right('15em').apply(element);

    flushMicrotasks();

    expect(element.style.top).toBe('');
    expect(element.style.left).toBe('');
    expect(element.style.bottom).toBe('70px');
    expect(element.style.right).toBe('15em');
  }));

  it('should overwrite previously applied positioning', fakeAsyncTest(() => {
    strategy.centerHorizontally().centerVertically().apply(element);
    flushMicrotasks();

    strategy.top('10px').left('40%').apply(element);
    flushMicrotasks();

    expect(element.style.top).toBe('10px');
    expect(element.style.left).toBe('40%');
    expect(element.style.bottom).toBe('');
    expect(element.style.right).toBe('');
    expect(element.style.transform).not.toContain('translate');

    strategy.bottom('70px').right('15em').apply(element);

    flushMicrotasks();

    expect(element.style.top).toBe('');
    expect(element.style.left).toBe('');
    expect(element.style.bottom).toBe('70px');
    expect(element.style.right).toBe('15em');
    expect(element.style.transform).not.toContain('translate');
  }));

  it('should center the element', fakeAsyncTest(() => {
    strategy.centerHorizontally().centerVertically().apply(element);

    flushMicrotasks();

    expect(element.style.top).toBe('50%');
    expect(element.style.left).toBe('50%');
    expect(element.style.transform).toContain('translateX(-50%)');
    expect(element.style.transform).toContain('translateY(-50%)');
  }));

  it('should center the element with an offset', fakeAsyncTest(() => {
    strategy.centerHorizontally('10px').centerVertically('15px').apply(element);

    flushMicrotasks();

    expect(element.style.top).toBe('50%');
    expect(element.style.left).toBe('50%');
    expect(element.style.transform).toContain('translateX(-50%)');
    expect(element.style.transform).toContain('translateX(10px)');
    expect(element.style.transform).toContain('translateY(-50%)');
    expect(element.style.transform).toContain('translateY(15px)');
  }));

  it('should default the element to position: absolute', fakeAsyncTest(() => {
    strategy.apply(element);

    flushMicrotasks();

    expect(element.style.position).toBe('absolute');
  }));

  it('should make the element position: fixed', fakeAsyncTest(() => {
    strategy.fixed().apply(element);

    flushMicrotasks();

    expect(element.style.position).toBe('fixed');
  }));
});

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}
