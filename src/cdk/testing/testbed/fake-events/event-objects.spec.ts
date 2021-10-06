import {
  dispatchMouseEvent,
  dispatchKeyboardEvent,
  dispatchPointerEvent,
  dispatchFakeEvent,
} from './dispatch-events';
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

  describe('shadow DOM', () => {
    it('should allow dispatched mouse events to propagate through the shadow root', () => {
      if (!testElement.attachShadow) {
        return;
      }

      const spy = jasmine.createSpy('listener');
      const shadowRoot = testElement.attachShadow({mode: 'open'});
      const child = document.createElement('div');
      shadowRoot.appendChild(child);

      testElement.addEventListener('mousedown', spy);
      dispatchMouseEvent(child, 'mousedown');

      expect(spy).toHaveBeenCalled();
    });

    it('should allow dispatched keyboard events to propagate through the shadow root', () => {
      if (!testElement.attachShadow) {
        return;
      }

      const spy = jasmine.createSpy('listener');
      const shadowRoot = testElement.attachShadow({mode: 'open'});
      const child = document.createElement('div');
      shadowRoot.appendChild(child);

      testElement.addEventListener('keydown', spy);
      dispatchKeyboardEvent(child, 'keydown');

      expect(spy).toHaveBeenCalled();
    });

    it('should allow dispatched pointer events to propagate through the shadow root', () => {
      if (!testElement.attachShadow) {
        return;
      }

      const spy = jasmine.createSpy('listener');
      const shadowRoot = testElement.attachShadow({mode: 'open'});
      const child = document.createElement('div');
      shadowRoot.appendChild(child);

      testElement.addEventListener('pointerdown', spy);
      dispatchPointerEvent(child, 'pointerdown');

      expect(spy).toHaveBeenCalled();
    });

    it('should allow dispatched fake events to propagate through the shadow root', () => {
      if (!testElement.attachShadow) {
        return;
      }

      const spy = jasmine.createSpy('listener');
      const shadowRoot = testElement.attachShadow({mode: 'open'});
      const child = document.createElement('div');
      shadowRoot.appendChild(child);

      testElement.addEventListener('fake', spy);
      dispatchFakeEvent(child, 'fake');

      expect(spy).toHaveBeenCalled();
    });
  });
});
