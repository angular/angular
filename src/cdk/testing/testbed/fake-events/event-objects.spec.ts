import {createKeyboardEvent, createMouseEvent} from './event-objects';

describe('event objects', () => {
  let testElement: HTMLElement;

  beforeEach(() => (testElement = document.createElement('div')));

  describe('synthetic mouse event', () => {
    it('should be possible to call `preventDefault` multiple times', () => {
      const preventDefaultSpy = jasmine
        .createSpy('preventDefault')
        .and.callFake((event: Event) => event.preventDefault());

      // Register event listeners twice, where both prevent prevent the default behavior.
      testElement.addEventListener('click', (event: Event) => preventDefaultSpy(event));
      testElement.addEventListener('click', (event: Event) => preventDefaultSpy(event));

      expect(() => {
        // Dispatch a synthetic mouse click event on the test element.
        testElement.dispatchEvent(createMouseEvent('click'));
      }).not.toThrow();
      expect(preventDefaultSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('synthetic keyboard event', () => {
    it('should be possible to call `preventDefault` multiple times', () => {
      const preventDefaultSpy = jasmine
        .createSpy('preventDefault')
        .and.callFake((event: Event) => event.preventDefault());

      // Register event listeners twice, where both prevent prevent the default behavior.
      testElement.addEventListener('keydown', (event: Event) => preventDefaultSpy(event));
      testElement.addEventListener('keydown', (event: Event) => preventDefaultSpy(event));

      expect(() => {
        // Dispatch a synthetic keyboard down event on the test element.
        testElement.dispatchEvent(createKeyboardEvent('keydown'));
      }).not.toThrow();
      expect(preventDefaultSpy).toHaveBeenCalledTimes(2);
    });
  });
});
