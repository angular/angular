/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports} from '../test-util';

describe('element', function () {
  let button: HTMLButtonElement;

  beforeEach(function () {
    button = document.createElement('button');
    document.body.appendChild(button);
  });

  afterEach(function () {
    document.body.removeChild(button);
  });

  // https://github.com/angular/zone.js/issues/190
  it('should work when addEventListener / removeEventListener are called in the global context', function () {
    const clickEvent = document.createEvent('Event');
    let callCount = 0;

    clickEvent.initEvent('click', true, true);

    const listener = function (event: Event) {
      callCount++;
      expect(event).toBe(clickEvent);
    };

    // `this` would be null inside the method when `addEventListener` is called from strict mode
    // it would be `window`:
    // - when called from non strict-mode,
    // - when `window.addEventListener` is called explicitly.
    addEventListener('click', listener);

    button.dispatchEvent(clickEvent);
    expect(callCount).toEqual(1);

    removeEventListener('click', listener);
    button.dispatchEvent(clickEvent);
    expect(callCount).toEqual(1);
  });

  it('should work with addEventListener when called with a function listener', function () {
    const clickEvent = document.createEvent('Event');
    clickEvent.initEvent('click', true, true);

    button.addEventListener('click', function (event) {
      expect(event).toBe(clickEvent as any);
    });

    button.dispatchEvent(clickEvent);
  });

  it('should not call microtasks early when an event is invoked', function (done) {
    let log = '';
    button.addEventListener('click', () => {
      Zone.current.scheduleMicroTask('test', () => (log += 'microtask;'));
      log += 'click;';
    });
    button.click();

    expect(log).toEqual('click;');
    done();
  });

  it('should call microtasks early when an event is invoked', function (done) {
    /*
     * In this test we escape the Zone using unpatched setTimeout.
     * This way the eventTask invoked from click will think it is the top most
     * task and eagerly drain the microtask queue.
     *
     * THIS IS THE WRONG BEHAVIOR!
     *
     * But there is no easy way for the task to know if it is the top most task.
     *
     * Given that this can only arise when someone is emulating clicks on DOM in a synchronous
     * fashion we have few choices:
     * 1. Ignore as this is unlikely to be a problem outside of tests.
     * 2. Monkey patch the event methods to increment the _numberOfNestedTaskFrames and prevent
     *    eager drainage.
     * 3. Pay the cost of throwing an exception in event tasks and verifying that we are the
     *    top most frame.
     *
     * For now we are choosing to ignore it and assume that this arises in tests only.
     * As an added measure we make sure that all jasmine tests always run in a task. See: jasmine.ts
     */
    (window as any)[(Zone as any).__symbol__('setTimeout')](() => {
      let log = '';
      button.addEventListener('click', () => {
        Zone.current.scheduleMicroTask('test', () => (log += 'microtask;'));
        log += 'click;';
      });
      button.click();

      expect(log).toEqual('click;microtask;');
      done();
    });
  });

  it('should work with addEventListener when called with an EventListener-implementing listener', function () {
    const eventListener = {
      x: 5,
      handleEvent: function (event: Event) {
        // Test that context is preserved
        expect(this.x).toBe(5);

        expect(event).toBe(clickEvent);
      },
    };

    const clickEvent = document.createEvent('Event');
    clickEvent.initEvent('click', true, true);

    button.addEventListener('click', eventListener);

    button.dispatchEvent(clickEvent);
  });

  it('should respect removeEventListener when called with a function listener', function () {
    let log = '';
    const logFunction = function logFunction() {
      log += 'a';
    };

    button.addEventListener('click', logFunction);
    button.addEventListener('focus', logFunction);
    button.click();
    expect(log).toEqual('a');
    const focusEvent = document.createEvent('Event');
    focusEvent.initEvent('focus', true, true);
    button.dispatchEvent(focusEvent);
    expect(log).toEqual('aa');

    button.removeEventListener('click', logFunction);
    button.click();
    expect(log).toEqual('aa');
  });

  it('should respect removeEventListener with an EventListener-implementing listener', function () {
    const eventListener = {x: 5, handleEvent: jasmine.createSpy('handleEvent')};

    button.addEventListener('click', eventListener);
    button.removeEventListener('click', eventListener);

    button.click();

    expect(eventListener.handleEvent).not.toHaveBeenCalled();
  });

  it('should have no effect while calling addEventListener without listener', function () {
    const onAddEventListenerSpy = jasmine.createSpy('addEventListener');
    const eventListenerZone = Zone.current.fork({
      name: 'eventListenerZone',
      onScheduleTask: onAddEventListenerSpy,
    });
    expect(function () {
      eventListenerZone.run(function () {
        button.addEventListener('click', null as any);
        button.addEventListener('click', undefined as any);
      });
    }).not.toThrowError();
    expect(onAddEventListenerSpy).not.toHaveBeenCalledWith();
  });

  it('should have no effect while calling removeEventListener without listener', function () {
    const onAddEventListenerSpy = jasmine.createSpy('removeEventListener');
    const eventListenerZone = Zone.current.fork({
      name: 'eventListenerZone',
      onScheduleTask: onAddEventListenerSpy,
    });
    expect(function () {
      eventListenerZone.run(function () {
        button.removeEventListener('click', null as any);
        button.removeEventListener('click', undefined as any);
      });
    }).not.toThrowError();
    expect(onAddEventListenerSpy).not.toHaveBeenCalledWith();
  });

  it('should only add a listener once for a given set of arguments', function () {
    const log: string[] = [];
    const clickEvent = document.createEvent('Event');

    function listener() {
      log.push('listener');
    }

    clickEvent.initEvent('click', true, true);

    button.addEventListener('click', listener);
    button.addEventListener('click', listener);
    button.addEventListener('click', listener);

    button.dispatchEvent(clickEvent);
    expect(log).toEqual(['listener']);

    button.removeEventListener('click', listener);

    button.dispatchEvent(clickEvent);
    expect(log).toEqual(['listener']);
  });

  it('should correctly handler capturing versus nonCapturing eventListeners', function () {
    const log: string[] = [];
    const clickEvent = document.createEvent('Event');

    function capturingListener() {
      log.push('capturingListener');
    }

    function bubblingListener() {
      log.push('bubblingListener');
    }

    clickEvent.initEvent('click', true, true);

    document.body.addEventListener('click', capturingListener, true);
    document.body.addEventListener('click', bubblingListener);

    button.dispatchEvent(clickEvent);

    expect(log).toEqual(['capturingListener', 'bubblingListener']);
  });

  it('should correctly handler a listener that is both capturing and nonCapturing', function () {
    const log: string[] = [];
    const clickEvent = document.createEvent('Event');

    function listener() {
      log.push('listener');
    }

    clickEvent.initEvent('click', true, true);

    document.body.addEventListener('click', listener, true);
    document.body.addEventListener('click', listener);

    button.dispatchEvent(clickEvent);

    document.body.removeEventListener('click', listener, true);
    document.body.removeEventListener('click', listener);

    button.dispatchEvent(clickEvent);

    expect(log).toEqual(['listener', 'listener']);
  });

  describe('onclick', function () {
    function supportsOnClick() {
      const div = document.createElement('div');
      const clickPropDesc = Object.getOwnPropertyDescriptor(div, 'onclick');
      return !(
        EventTarget &&
        div instanceof EventTarget &&
        clickPropDesc &&
        clickPropDesc.value === null
      );
    }
    (<any>supportsOnClick).message = 'Supports Element#onclick patching';

    ifEnvSupports(supportsOnClick, function () {
      it('should spawn new child zones', function () {
        let run = false;
        button.onclick = function () {
          run = true;
        };

        button.click();
        expect(run).toBeTruthy();
      });
    });

    it('should only allow one onclick handler', function () {
      let log = '';
      button.onclick = function () {
        log += 'a';
      };
      button.onclick = function () {
        log += 'b';
      };

      button.click();
      expect(log).toEqual('b');
    });

    it('should handler removing onclick', function () {
      let log = '';
      button.onclick = function () {
        log += 'a';
      };
      button.onclick = null as any;

      button.click();
      expect(log).toEqual('');
    });

    it('should be able to deregister the same event twice', function () {
      const listener = (event: Event) => {};
      document.body.addEventListener('click', listener, false);
      document.body.removeEventListener('click', listener, false);
      document.body.removeEventListener('click', listener, false);
    });
  });

  describe('onEvent default behavior', function () {
    let checkbox: HTMLInputElement;
    beforeEach(function () {
      checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      document.body.appendChild(checkbox);
    });

    afterEach(function () {
      document.body.removeChild(checkbox);
    });

    it('should be possible to prevent default behavior by returning false', function () {
      checkbox.onclick = function () {
        return false;
      };

      checkbox.click();
      expect(checkbox.checked).toBe(false);
    });

    it('should have no effect on default behavior when not returning anything', function () {
      checkbox.onclick = function () {};

      checkbox.click();
      expect(checkbox.checked).toBe(true);
    });
  });
});
