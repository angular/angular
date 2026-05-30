/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EarlyEventContract,
  EarlyJsactionData,
  EarlyJsactionDataContainer,
} from '../src/earlyeventcontract';
import {
  EventContractContainer,
  EventContractContainerManager,
} from '../src/event_contract_container';
import {EventInfoWrapper} from '../src/event_info';
import {EventType} from '../src/event_type';
import {Dispatcher, EventContract} from '../src/eventcontract';
import {Restriction} from '../src/restriction';

import {safeElement, testonlyHtml} from './html';

declare global {
  interface Window extends EarlyJsactionDataContainer {}
}

const domContent = `
<div id="container"></div>

<div id="click-container">
  <div id="click-action-element" jsaction="handleClick">
    <div id="click-target-element"></div>
  </div>
</div>

<div id="animationend-container">
  <div id="animationend-action-element" jsaction="animationend:handleAnimationEnd">
    <div id="animationend-target-element"></div>
  </div>
</div>

<div id="anchor-click-container">
  <a id="anchor-click-action-element" href="javascript:void(0);" jsaction="handleClick">
    <span id="anchor-click-target-element"></span>
  </a>
</div>

<div id="nested-outer-container">
  <div id="nested-outer-action-element" jsaction="outerHandleClick">
    <div id="nested-outer-target-element">
      <div id="nested-inner-container">
        <div id="nested-inner-action-element" jsaction="innerHandleClick">
          <div id="nested-inner-target-element"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="mouseleave-container">
  <div id="mouseleave-action-element" jsaction="mouseleave:handleMouseLeave">
    <div id="mouseleave-target-element"></div>
  </div>
</div>

<div id="focus-container">
  <div id="focus-action-element" jsaction="focus:handleFocus">
    <button id="focus-target-element">Focus Button</button>
  </div>
</div>
`;

function getRequiredElementById(id: string) {
  const element = document.getElementById(id);
  expect(element).not.toBeNull();
  return element!;
}

function createEventContract({
  eventContractContainerManager,
  eventTypes,
  dispatcher,
}: {
  eventContractContainerManager: EventContractContainerManager;
  eventTypes: Array<string | [string, string]>;
  dispatcher?: jasmine.Spy<Dispatcher>;
}): EventContract {
  const eventContract = new EventContract(eventContractContainerManager);
  for (const eventType of eventTypes) {
    if (typeof eventType === 'string') {
      eventContract.addEvent(eventType);
    } else {
      const [aliasedEventType, aliasEventType] = eventType;
      eventContract.addEvent(aliasedEventType, aliasEventType);
    }
  }
  if (dispatcher) {
    eventContract.registerDispatcher(dispatcher, Restriction.I_AM_THE_JSACTION_FRAMEWORK);
  }
  return eventContract;
}

function createDispatcherSpy() {
  return jasmine.createSpy<Dispatcher>('dispatcher');
}

function getLastDispatchedEventInfoWrapper(dispatcher: jasmine.Spy<Dispatcher>): EventInfoWrapper {
  return new EventInfoWrapper(dispatcher.calls.mostRecent().args[0]);
}

function dispatchMouseEvent(
  target: Element,
  {
    type = 'click',
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
    relatedTarget = null,
  }: {
    type?: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
    relatedTarget?: Element | null;
  } = {},
) {
  // createEvent/initMouseEvent is used to support IE11
  const event = document.createEvent('MouseEvent');
  event.initMouseEvent(
    type,
    true,
    true,
    window,
    0,
    0,
    0,
    0,
    0,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey,
    0,
    relatedTarget,
  );
  // tslint:enable:deprecation
  spyOn(event, 'preventDefault').and.callThrough();
  target.dispatchEvent(event);
  return event;
}

describe('EventContract', () => {
  beforeEach(() => {
    safeElement.setInnerHtml(document.body, testonlyHtml(domContent));
    EventContract.MOUSE_SPECIAL_SUPPORT = false;

    // Normalize timestamp.
    spyOn(Date, 'now').and.returnValue(0);
  });

  it('adds event listener to added containers', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractContainer(container);
    const eventContract = createEventContract({eventContractContainerManager, eventTypes: []});

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    eventContract.addEvent('click');

    const registeredEventTypes = addEventListenerSpy.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes).toEqual(['click']);
  });

  it('adds event listener for aliased event', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractContainer(container);
    const eventContract = createEventContract({eventContractContainerManager, eventTypes: []});
    eventContract.addEvent('animationend', 'webkitanimationend');

    const registeredEventTypes = addEventListenerSpy.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes).toEqual(['webkitanimationend']);
  });

  it('adds event listener without passive option', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractContainer(container);
    const eventContract = createEventContract({eventContractContainerManager, eventTypes: []});
    eventContract.addEvent('touchstart');

    expect(addEventListenerSpy).toHaveBeenCalledOnceWith(
      'touchstart',
      jasmine.any(Function),
      false,
    );
  });

  it('adds event listener for passive:false event', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractContainer(container);
    const eventContract = createEventContract({eventContractContainerManager, eventTypes: []});
    eventContract.addEvent('touchstart', '', false);

    expect(addEventListenerSpy).toHaveBeenCalledOnceWith('touchstart', jasmine.any(Function), {
      capture: false,
      passive: false,
    });
  });

  it('adds event listener for passive:true event', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractContainer(container);
    const eventContract = createEventContract({eventContractContainerManager, eventTypes: []});
    eventContract.addEvent('touchstart', '', true);

    expect(addEventListenerSpy).toHaveBeenCalledOnceWith('touchstart', jasmine.any(Function), {
      capture: false,
      passive: true,
    });
  });

  it('queues events until dispatcher is registered', () => {
    const container = getRequiredElementById('click-container');
    const targetElement = getRequiredElementById('click-target-element');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    const dispatcher = createDispatcherSpy();
    eventContract.registerDispatcher(dispatcher, Restriction.I_AM_THE_JSACTION_FRAMEWORK);

    expect(dispatcher).toHaveBeenCalledTimes(1);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe(EventType.CLICK);
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()).toBeUndefined();
    expect(eventInfoWrapper.getIsReplay()).toBe(true);
  });

  it('dispatches event', () => {
    const container = getRequiredElementById('click-container');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = createDispatcherSpy();
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe(EventType.CLICK);
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()).toBeUndefined();
  });

  it('dispatches event for `webkitanimationend` alias event type', () => {
    if (!window.onwebkitanimationend) {
      // Only test this in browsers that have support for it.
      return;
    }
    const container = getRequiredElementById('animationend-container');
    const targetElement = getRequiredElementById('animationend-target-element');

    const dispatcher = createDispatcherSpy();
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: [['animationend', 'webkitanimationend']],
      dispatcher,
    });

    // createEvent/initEvent is used to support IE11
    const animationEndEvent = document.createEvent('AnimationEvent');
    animationEndEvent.initEvent('webkitanimationend', true, true);
    // tslint:enable:deprecation
    targetElement.dispatchEvent(animationEndEvent);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('animationend');
    expect(eventInfoWrapper.getEvent()).toBe(animationEndEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()).toBeUndefined();
  });

  it('cleanUp removes all event listeners and containers', () => {
    const container = getRequiredElementById('click-container');
    const removeEventListenerSpy = spyOn(container, 'removeEventListener').and.callThrough();
    const actionElement = getRequiredElementById('click-action-element');

    const dispatcher = createDispatcherSpy();
    const eventContractContainerManager = new EventContractContainer(container);
    const cleanUpSpy = spyOn(eventContractContainerManager, 'cleanUp').and.callThrough();
    const eventContract = createEventContract({
      eventContractContainerManager,
      eventTypes: ['click'],
      dispatcher,
    });

    eventContract.cleanUp();
    // Should not add the click listener back.
    eventContract.addEvent('click');

    actionElement.click();

    expect(dispatcher).toHaveBeenCalledTimes(0);
    expect(eventContract.handler('click')).toBeUndefined();
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(cleanUpSpy).toHaveBeenCalledTimes(1);
  });

  it('exposes event handlers with `handler()`', () => {
    const container = getRequiredElementById('click-container');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = createDispatcherSpy();
    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);
    // Clear normal dispatcher calls.
    dispatcher.calls.reset();

    const clickHandler = eventContract.handler(EventType.CLICK)!;
    expect(clickHandler).toBeDefined();

    clickHandler('click', clickEvent, container);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe(EventType.CLICK);
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()).toBeUndefined();
  });

  it('has no event handlers with `handler()` for unregistered event type', () => {
    const container = getRequiredElementById('click-container');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: [],
    });

    expect(eventContract.handler(EventType.CLICK)).toBeUndefined();
  });

  it('does not prevent default for click on anchor without dispatcher', () => {
    const container = getRequiredElementById('anchor-click-container');
    const targetElement = getRequiredElementById('anchor-click-target-element');

    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(clickEvent.preventDefault).not.toHaveBeenCalled();
  });

  describe('early events', () => {
    it('early events are dispatched', () => {
      const container = getRequiredElementById('click-container');
      const targetElement = getRequiredElementById('click-target-element');

      const removeEventListenerSpy = spyOn(
        window.document.documentElement,
        'removeEventListener',
      ).and.callThrough();
      const earlyEventContract = new EarlyEventContract();
      earlyEventContract.addEvents(['click']);

      const clickEvent = dispatchMouseEvent(targetElement);

      const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
      expect(earlyJsactionData).toBeDefined();
      expect(earlyJsactionData!.q.length).toBe(1);
      expect(earlyJsactionData!.q[0].event).toBe(clickEvent);

      const dispatcher = createDispatcherSpy();
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
        dispatcher,
      });

      eventContract.replayEarlyEvents();

      expect(window._ejsa).toBeUndefined();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()).toBeUndefined();
    });

    it('early capture events are dispatched', () => {
      const container = getRequiredElementById('focus-container');
      const targetElement = getRequiredElementById('focus-target-element');
      const replaySink = {_ejsa: undefined};
      const removeEventListenerSpy = spyOn(container, 'removeEventListener').and.callThrough();

      const earlyEventContract = new EarlyEventContract(replaySink, container);
      earlyEventContract.addEvents(['focus'], true);

      targetElement.focus();

      const earlyJsactionData: EarlyJsactionData | undefined = replaySink._ejsa;
      expect(earlyJsactionData).toBeDefined();
      expect(earlyJsactionData!.q.length).toBe(1);
      expect(earlyJsactionData!.q[0].event.type).toBe('focus');

      const dispatcher = createDispatcherSpy();
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['focus'],
        dispatcher,
      });

      eventContract.replayEarlyEvents(replaySink._ejsa);

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('focus');
      expect(eventInfoWrapper.getEvent().type).toBe('focus');
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()).toBeUndefined();
    });

    it('early events are dispatched when target is cleared', () => {
      const container = getRequiredElementById('click-container');
      const targetElement = getRequiredElementById('click-target-element');

      const removeEventListenerSpy = spyOn(
        window.document.documentElement,
        'removeEventListener',
      ).and.callThrough();
      const earlyEventContract = new EarlyEventContract();
      earlyEventContract.addEvents(['click']);

      const clickEvent = dispatchMouseEvent(targetElement);

      const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
      expect(earlyJsactionData).toBeDefined();
      expect(earlyJsactionData!.q.length).toBe(1);
      expect(earlyJsactionData!.q[0].event).toBe(clickEvent);

      // Emulating browser behavior of clearing target after dispatch.
      Object.defineProperty(clickEvent, 'target', {value: null});

      const dispatcher = createDispatcherSpy();
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
        dispatcher,
      });

      eventContract.replayEarlyEvents();

      expect(window._ejsa).toBeUndefined();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()).toBeUndefined();
    });

    describe('non-bubbling mouse events', () => {
      beforeEach(() => {
        EventContract.MOUSE_SPECIAL_SUPPORT = true;
      });
      afterEach(() => {
        EventContract.MOUSE_SPECIAL_SUPPORT = false;
      });

      it('early mouseout dispatched as mouseleave and mouseout', () => {
        const container = getRequiredElementById('mouseleave-container');
        const targetElement = getRequiredElementById('mouseleave-target-element');

        const removeEventListenerSpy = spyOn(
          window.document.documentElement,
          'removeEventListener',
        ).and.callThrough();
        const early = new EarlyEventContract();
        early.addEvents(['mouseout']);

        const mouseOutEvent = dispatchMouseEvent(targetElement, {
          type: 'mouseout',
          // Indicates that the mouse entered the container and exited the
          // target element.
          relatedTarget: container,
        });

        const earlyJsactionData: EarlyJsactionData | undefined = (
          window as EarlyJsactionDataContainer
        )._ejsa;
        expect(earlyJsactionData).toBeDefined();
        expect(earlyJsactionData!.q.length).toBe(1);
        expect(earlyJsactionData!.q[0].event).toBe(mouseOutEvent);

        const dispatcher = createDispatcherSpy();
        const eventContract = createEventContract({
          eventContractContainerManager: new EventContractContainer(container),
          eventTypes: ['mouseout', 'mouseleave'],
          dispatcher,
        });

        eventContract.replayEarlyEvents();

        expect((window as EarlyJsactionDataContainer)._ejsa).toBeUndefined();
        expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(2);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('mouseleave');
        const syntheticMouseEvent = eventInfoWrapper.getEvent();
        expect(syntheticMouseEvent.type).toBe('mouseout');
        expect(syntheticMouseEvent.target).toBe(targetElement);
        expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
        expect(eventInfoWrapper.getAction()).toBeUndefined();
      });

      it('early mouseout dispatched as only mouseleave', () => {
        const container = getRequiredElementById('mouseleave-container');
        const targetElement = getRequiredElementById('mouseleave-target-element');

        const removeEventListenerSpy = spyOn(
          window.document.documentElement,
          'removeEventListener',
        ).and.callThrough();
        const early = new EarlyEventContract();
        early.addEvents(['mouseout']);

        const mouseOutEvent = dispatchMouseEvent(targetElement, {
          type: 'mouseout',
          // Indicates that the mouse entered the container and exited the
          // target element.
          relatedTarget: container,
        });

        const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
        expect(earlyJsactionData).toBeDefined();
        expect(earlyJsactionData!.q.length).toBe(1);
        expect(earlyJsactionData!.q[0].event).toBe(mouseOutEvent);

        const dispatcher = createDispatcherSpy();
        const eventContract = createEventContract({
          eventContractContainerManager: new EventContractContainer(container),
          eventTypes: ['mouseleave'],
          dispatcher,
        });

        eventContract.replayEarlyEvents();

        expect(window._ejsa).toBeUndefined();
        expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
        expect(dispatcher).toHaveBeenCalledTimes(1);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('mouseleave');
        const syntheticMouseEvent = eventInfoWrapper.getEvent();
        expect(syntheticMouseEvent.type).toBe('mouseout');
        expect(syntheticMouseEvent.target).toBe(targetElement);
        expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
        expect(eventInfoWrapper.getAction()).toBeUndefined();
      });
    });
  });
});
