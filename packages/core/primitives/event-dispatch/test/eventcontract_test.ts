/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as cache from '../src/cache';
import {stopPropagation} from '../src/legacy_dispatcher';
import {
  EarlyEventContract,
  EarlyJsactionData,
  EarlyJsactionDataContainer,
} from '../src/earlyeventcontract';
import {
  EventContractContainer,
  EventContractContainerManager,
} from '../src/event_contract_container';
import {EventContractMultiContainer} from '../src/event_contract_multi_container';
import {EventInfo, EventInfoWrapper} from '../src/event_info';
import {EventType} from '../src/event_type';
import {addDeferredA11yClickSupport, Dispatcher, EventContract} from '../src/eventcontract';
import {OWNER} from '../src/property';
import {Restriction} from '../src/restriction';

import {safeElement, testonlyHtml} from './html';
import {
  Dispatcher as LateDispatcher,
  registerDispatcher as registerLateDispatcher,
} from '../src/dispatcher';

declare global {
  interface Window extends EarlyJsactionDataContainer {}
}

const domContent = `
<div id="container"></div>

<div id="container2">
</div>

<div id="click-container">
  <div id="click-action-element" jsaction="handleClick">
    <div id="click-target-element"></div>
  </div>
</div>

<div id="keydown-container">
  <div id="keydown-action-element" jsaction="keydown:handleKeydown">
    <div id="keydown-target-element"></div>
  </div>
</div>

<div id="self-click-container">
  <div id="self-click-target-element" jsaction="handleClick"></div>
</div>

<div id="parent-and-child-container">
  <div>
    <div jsaction="parentHandleClick">
      <div id="parent-and-child-action-element" jsaction="childHandleClick">
        <div id="parent-and-child-target-element"></div>
      </div>
    </div>
  </div>
</div>

<div id="owner-click-container">
  <div id="owner-click-action-element" jsaction="ownerHandleClick">
  </div>
  <div id="owner-click-target-element">
  </div>
</div>

<div id="animationend-container">
  <div id="animationend-action-element" jsaction="animationend:handleAnimationEnd">
    <div id="animationend-target-element"></div>
  </div>
</div>

<div id="clickmod-container">
  <div id="clickmod-action-element" jsaction="clickmod:handleClickMod">
    <div id="clickmod-target-element"></div>
  </div>
</div>

<div id="trailing-semicolon-container">
  <div id="trailing-semicolon-action-element" jsaction="handleClick;">
    <div id="trailing-semicolon-target-element"></div>
  </div>
</div>

<div id="no-action-name-container">
  <div id="no-action-name-action-element" jsaction="keydown:;;keyup:">
    <div id="no-action-name-target-element"></div>
  </div>
</div>

<div id="shadow-dom-container">
  <div id="shadow-dom-action-element" jsaction="handleClick">
  </div>
</div>

<div id="anchor-click-container">
  <a id="anchor-click-action-element" href="javascript:void(0);" jsaction="handleClick">
    <span id="anchor-click-target-element"></span>
  </a>
</div>

<div id="anchor-clickmod-container">
  <a id="anchor-clickmod-action-element" href="javascript:void(0);" jsaction="clickmod: handleClickMod">
    <span id="anchor-clickmod-target-element"></span>
  </a>
</div>

<div id="a11y-click-container">
  <div id="a11y-click-action-element" jsaction="handleClick">
    <div id="a11y-click-target-element" tabindex="0"></div>
  </a>
</div>

<div id="a11y-click-keydown-container">
  <div id="a11y-click-keydown-action-element" jsaction="handleClick; keydown: handleKeydown">
    <div id="a11y-click-keydown-target-element" tabindex="0"></div>
  </a>
</div>

<div id="a11y-anchor-click-container">
  <a id="a11y-anchor-click-action-element" href="javascript:void(0);" jsaction="handleClick">
    <span id="a11y-anchor-click-target-element" tabindex="0"></span>
  </a>
</div>

<div id="a11y-clickonly-container">
  <div id="a11y-clickonly-action-element" jsaction="clickonly:handleClickOnly">
    <div id="a11y-clickonly-target-element" tabindex="0"></div>
  </a>
</div>

<div id="a11y-click-clickonly-container">
  <div id="a11y-click-clickonly-action-element" jsaction="clickonly:handleClickOnly;click:handleClick">
    <div id="a11y-click-clickonly-target-element" tabindex="0"></div>
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

<div id="mouseenter-container">
  <div id="mouseenter-action-element" jsaction="mouseenter:handleMouseEnter">
    <div id="mouseenter-target-element"></div>
  </div>
</div>

<div id="mouseleave-container">
  <div id="mouseleave-action-element" jsaction="mouseleave:handleMouseLeave">
    <div id="mouseleave-target-element"></div>
  </div>
</div>

<div id="pointerenter-container">
  <div id="pointerenter-action-element" jsaction="pointerenter:handlePointerEnter">
    <div id="pointerenter-target-element"></div>
  </div>
</div>

<div id="pointerleave-container">
  <div id="pointerleave-action-element" jsaction="pointerleave:handlePointerLeave">
    <div id="pointerleave-target-element"></div>
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

function createEventContractMultiContainer(
  container: Element,
  {stopPropagation = false}: {stopPropagation?: boolean} = {},
) {
  const eventContractContainerManager = new EventContractMultiContainer(stopPropagation);
  eventContractContainerManager.addContainer(container);
  return eventContractContainerManager;
}

function createEventContract({
  eventContractContainerManager,
  exportAddA11yClickSupport = false,
  eventTypes,
  dispatcher,
}: {
  eventContractContainerManager: EventContractContainerManager;
  exportAddA11yClickSupport?: boolean;
  eventTypes: Array<string | [string, string]>;
  dispatcher?: jasmine.Spy<Dispatcher>;
}): EventContract {
  const eventContract = new EventContract(eventContractContainerManager);
  if (exportAddA11yClickSupport) {
    eventContract.exportAddA11yClickSupport();
  }
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
  // tslint:disable:deprecation
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

function dispatchKeyboardEvent(
  target: Element,
  {
    type = 'keydown',
    key = '',
    location = 0,
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
  }: {
    type?: string;
    key?: string;
    location?: number;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  } = {},
) {
  // createEvent/initKeyboardEvent is used to support IE11
  // tslint:disable:deprecation
  const event = document.createEvent('KeyboardEvent');
  event.initKeyboardEvent(
    type,
    true,
    true,
    window,
    key,
    location,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey,
  );
  // tslint:enable:deprecation
  // This is necessary as Chrome does not respect the key parameter in
  // `initKeyboardEvent`.
  Object.defineProperty(event, 'key', {value: key});
  spyOn(event, 'preventDefault').and.callThrough();
  target.dispatchEvent(event);
  return event;
}

describe('EventContract', () => {
  beforeEach(() => {
    safeElement.setInnerHtml(document.body, testonlyHtml(domContent));
    EventContract.A11Y_CLICK_SUPPORT = false;
    EventContract.MOUSE_SPECIAL_SUPPORT = false;

    // Normalize timestamp.
    spyOn(Date, 'now').and.returnValue(0);
  });

  it('adds event listener after adding container', () => {
    const container = getRequiredElementById('container');
    const container2 = getRequiredElementById('container2');
    const addEventListenerSpy = spyOn(container, 'addEventListener');
    const addEventListenerSpy2 = spyOn(container2, 'addEventListener');

    const eventContractContainerManager = new EventContractMultiContainer();
    const eventContract = new EventContract(eventContractContainerManager);
    eventContract.addEvent('click');

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    eventContractContainerManager.addContainer(container);
    eventContractContainerManager.addContainer(container2);

    const registeredEventTypes = addEventListenerSpy.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes).toEqual(['click']);

    const registeredEventTypes2 = addEventListenerSpy2.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes2).toEqual(['click']);
  });

  it('adds event listener to added containers', () => {
    const container = getRequiredElementById('container');
    const container2 = getRequiredElementById('container2');
    const addEventListenerSpy = spyOn(container, 'addEventListener');
    const addEventListenerSpy2 = spyOn(container2, 'addEventListener');

    const eventContractContainerManager = new EventContractMultiContainer();
    const eventContract = new EventContract(eventContractContainerManager);
    eventContractContainerManager.addContainer(container);
    eventContractContainerManager.addContainer(container2);

    expect(addEventListenerSpy).not.toHaveBeenCalled();
    expect(addEventListenerSpy2).not.toHaveBeenCalled();

    eventContract.addEvent('click');

    const registeredEventTypes = addEventListenerSpy.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes).toEqual(['click']);

    const registeredEventTypes2 = addEventListenerSpy2.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes2).toEqual(['click']);
  });

  it('adds event listener for aliased event', () => {
    const container = getRequiredElementById('container');
    const addEventListenerSpy = spyOn(container, 'addEventListener');

    const eventContractContainerManager = new EventContractMultiContainer();
    const eventContract = new EventContract(eventContractContainerManager);
    eventContract.addEvent('animationend', 'webkitanimationend');
    eventContractContainerManager.addContainer(container);

    const registeredEventTypes = addEventListenerSpy.calls
      .allArgs()
      .map(([eventType]) => eventType);
    expect(registeredEventTypes).toEqual(['webkitanimationend']);
  });

  it('queues events until dispatcher is registered', () => {
    const container = getRequiredElementById('click-container');
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    eventContract.registerDispatcher(dispatcher, Restriction.I_AM_THE_JSACTION_FRAMEWORK);

    expect(dispatcher).toHaveBeenCalledTimes(1);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe(EventType.CLICK);
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    expect(eventInfoWrapper.getIsReplay()).toBe(true);
  });

  it('dispatches event', () => {
    const container = getRequiredElementById('click-container');
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('dispatches event when targetElement is actionElement', () => {
    const container = getRequiredElementById('self-click-container');
    const targetElement = getRequiredElementById('self-click-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(targetElement);
  });

  it('dispatch event to child and ignore parent', () => {
    const container = getRequiredElementById('parent-and-child-container');
    const actionElement = getRequiredElementById('parent-and-child-action-element');
    const targetElement = getRequiredElementById('parent-and-child-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('childHandleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('dispatch event through owner', () => {
    const container = getRequiredElementById('owner-click-container');
    const actionElement = getRequiredElementById('owner-click-action-element');
    const targetElement = getRequiredElementById('owner-click-target-element');
    targetElement[OWNER] = actionElement;

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('ownerHandleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('dispatches event for `webkitanimationend` alias event type', () => {
    if (!window.onwebkitanimationend) {
      // Only test this in browsers that have support for it.
      return;
    }
    const container = getRequiredElementById('animationend-container');
    const actionElement = getRequiredElementById('animationend-action-element');
    const targetElement = getRequiredElementById('animationend-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: [['animationend', 'webkitanimationend']],
      dispatcher,
    });

    // createEvent/initEvent is used to support IE11
    // tslint:disable:deprecation
    const animationEndEvent = document.createEvent('AnimationEvent');
    animationEndEvent.initEvent('webkitanimationend', true, true);
    // tslint:enable:deprecation
    targetElement.dispatchEvent(animationEndEvent);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('animationend');
    expect(eventInfoWrapper.getEvent()).toBe(animationEndEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleAnimationEnd');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('dispatches modified click event', () => {
    const container = getRequiredElementById('clickmod-container');
    const actionElement = getRequiredElementById('clickmod-action-element');
    const targetElement = getRequiredElementById('clickmod-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement, {shiftKey: true});

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('clickmod');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClickMod');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('caches jsaction attribute', () => {
    const container = getRequiredElementById('click-container');
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    let clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    let eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

    actionElement.setAttribute('jsaction', 'renamedHandleClick');
    dispatcher.calls.reset();

    clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('re-parses jsaction attribute if the action cache is cleared', () => {
    const container = getRequiredElementById('click-container');
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    let clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    let eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

    actionElement.setAttribute('jsaction', 'renamedHandleClick');
    // Clear attribute cache.
    cache.clear(actionElement);
    dispatcher.calls.reset();

    clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('renamedHandleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('handles trailing semicolon in jsaction attribute', () => {
    const container = getRequiredElementById('trailing-semicolon-container');
    const actionElement = getRequiredElementById('trailing-semicolon-action-element');
    const targetElement = getRequiredElementById('trailing-semicolon-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('handles jsaction attributes without action names, first action', () => {
    const container = getRequiredElementById('no-action-name-container');
    const actionElement = getRequiredElementById('no-action-name-action-element');
    const targetElement = getRequiredElementById('no-action-name-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click', 'keydown', 'keyup'],
      dispatcher,
    });

    const keydownEvent = dispatchKeyboardEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('keydown');
    expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('handles jsaction attributes without action names, last action', () => {
    const container = getRequiredElementById('no-action-name-container');
    const actionElement = getRequiredElementById('no-action-name-action-element');
    const targetElement = getRequiredElementById('no-action-name-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click', 'keydown', 'keyup'],
      dispatcher,
    });

    const keyupEvent = dispatchKeyboardEvent(targetElement, {type: 'keyup'});

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('keyup');
    expect(eventInfoWrapper.getEvent()).toBe(keyupEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('does not handle jsaction attributes without event type or action name', () => {
    const container = getRequiredElementById('no-action-name-container');
    const targetElement = getRequiredElementById('no-action-name-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click', 'keydown', 'keyup'],
      dispatcher,
    });

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()).toBeUndefined();
  });

  it('dispatches event from shadow dom', () => {
    const container = getRequiredElementById('shadow-dom-container');
    const actionElement = getRequiredElementById('shadow-dom-action-element');

    // Not supported in ie11.
    if (!actionElement.attachShadow) {
      return;
    }

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
    createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
      dispatcher,
    });

    const shadow = actionElement.attachShadow({mode: 'open'});
    const shadowChild = document.createElement('div');
    shadow.appendChild(shadowChild);

    shadowChild.click();

    expect(dispatcher).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
    expect(eventInfoWrapper.getEventType()).toBe('click');
    // Target element is set to the host from the event.
    expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('cleanUp removes all event listeners and containers', () => {
    const container = getRequiredElementById('click-container');
    const removeEventListenerSpy = spyOn(container, 'removeEventListener').and.callThrough();
    const actionElement = getRequiredElementById('click-action-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
  });

  it('has no event handlers with `handler()` for unregistered event type', () => {
    const container = getRequiredElementById('click-container');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: [],
    });

    expect(eventContract.handler(EventType.CLICK)).toBeUndefined();
  });

  it('prevents default for click on anchor child', () => {
    const container = getRequiredElementById('anchor-click-container');
    const actionElement = getRequiredElementById('anchor-click-action-element');
    const targetElement = getRequiredElementById('anchor-click-target-element');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
    });
    const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
    const dispatcher = new LateDispatcher(dispatch);
    registerLateDispatcher(eventContract, dispatcher);

    const clickEvent = dispatchMouseEvent(targetElement);

    expect(dispatch).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = dispatch.calls.mostRecent().args[0];
    expect(eventInfoWrapper.getEventType()).toBe('click');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
  });

  it('prevents default for modified click on anchor child', () => {
    const container = getRequiredElementById('anchor-clickmod-container');
    const actionElement = getRequiredElementById('anchor-clickmod-action-element');
    const targetElement = getRequiredElementById('anchor-clickmod-target-element');

    const eventContract = createEventContract({
      eventContractContainerManager: new EventContractContainer(container),
      eventTypes: ['click'],
    });
    const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
    const dispatcher = new LateDispatcher(dispatch);
    registerLateDispatcher(eventContract, dispatcher);

    const clickEvent = dispatchMouseEvent(targetElement, {shiftKey: true});

    expect(dispatch).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = dispatch.calls.mostRecent().args[0];
    expect(eventInfoWrapper.getEventType()).toBe('clickmod');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClickMod');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

    expect(clickEvent.preventDefault).toHaveBeenCalled();
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

  describe('a11y click', () => {
    beforeEach(() => {
      EventContract.A11Y_CLICK_SUPPORT = true;
    });

    it('dispatches keydown as click event', () => {
      const container = getRequiredElementById('a11y-click-container');
      const actionElement = getRequiredElementById('a11y-click-action-element');
      const targetElement = getRequiredElementById('a11y-click-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
        dispatcher,
      });

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'Enter'});

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('dispatches keydown event', () => {
      const container = getRequiredElementById('keydown-container');
      const actionElement = getRequiredElementById('keydown-action-element');
      const targetElement = getRequiredElementById('keydown-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['keydown'],
        dispatcher,
      });

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'a'});

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('keydown');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleKeydown');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('prevents default for enter key on anchor child', () => {
      const container = getRequiredElementById('a11y-anchor-click-container');
      const actionElement = getRequiredElementById('a11y-anchor-click-action-element');
      const targetElement = getRequiredElementById('a11y-anchor-click-target-element');

      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
      });
      const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
      const dispatcher = new LateDispatcher(dispatch);
      registerLateDispatcher(eventContract, dispatcher);

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'Enter'});

      expect(dispatch).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = dispatch.calls.mostRecent().args[0];
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

      expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });

    it('dispatches clickonly event', () => {
      const container = getRequiredElementById('a11y-clickonly-container');
      const actionElement = getRequiredElementById('a11y-clickonly-action-element');
      const targetElement = getRequiredElementById('a11y-clickonly-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
        dispatcher,
      });

      const clickEvent = dispatchMouseEvent(targetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('clickonly');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClickOnly');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('dispatches click event to click handler rather than clickonly', () => {
      const container = getRequiredElementById('a11y-click-clickonly-container');
      const actionElement = getRequiredElementById('a11y-click-clickonly-action-element');
      const targetElement = getRequiredElementById('a11y-click-clickonly-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['click'],
        dispatcher,
      });

      const clickEvent = dispatchMouseEvent(targetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });
  });

  describe('a11y click support deferred', () => {
    it('dispatches keydown as click event', () => {
      const container = getRequiredElementById('a11y-click-container');
      const actionElement = getRequiredElementById('a11y-click-action-element');
      const targetElement = getRequiredElementById('a11y-click-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        exportAddA11yClickSupport: true,
        eventTypes: ['click'],
        dispatcher,
      });
      addDeferredA11yClickSupport(eventContract);

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'Enter'});

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('dispatches keydown event', () => {
      const container = getRequiredElementById('keydown-container');
      const actionElement = getRequiredElementById('keydown-action-element');
      const targetElement = getRequiredElementById('keydown-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        exportAddA11yClickSupport: true,
        eventTypes: ['keydown'],
        dispatcher,
      });
      addDeferredA11yClickSupport(eventContract);

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'a'});

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('keydown');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleKeydown');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('prevents default for enter key on anchor child', () => {
      const container = getRequiredElementById('a11y-anchor-click-container');
      const actionElement = getRequiredElementById('a11y-anchor-click-action-element');
      const targetElement = getRequiredElementById('a11y-anchor-click-target-element');

      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        exportAddA11yClickSupport: true,
        eventTypes: ['click'],
      });
      addDeferredA11yClickSupport(eventContract);
      const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
      const dispatcher = new LateDispatcher(dispatch);
      registerLateDispatcher(eventContract, dispatcher);

      const keydownEvent = dispatchKeyboardEvent(targetElement, {key: 'Enter'});

      expect(dispatch).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = dispatch.calls.mostRecent().args[0];
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(keydownEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

      expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });

    it('dispatches clickonly event', () => {
      const container = getRequiredElementById('a11y-clickonly-container');
      const actionElement = getRequiredElementById('a11y-clickonly-action-element');
      const targetElement = getRequiredElementById('a11y-clickonly-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        exportAddA11yClickSupport: true,
        eventTypes: ['click'],
        dispatcher,
      });
      addDeferredA11yClickSupport(eventContract);

      const clickEvent = dispatchMouseEvent(targetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('clickonly');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClickOnly');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('dispatches click event to click handler rather than clickonly', () => {
      const container = getRequiredElementById('a11y-click-clickonly-container');
      const actionElement = getRequiredElementById('a11y-click-clickonly-action-element');
      const targetElement = getRequiredElementById('a11y-click-clickonly-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        exportAddA11yClickSupport: true,
        eventTypes: ['click'],
        dispatcher,
      });
      addDeferredA11yClickSupport(eventContract);

      const clickEvent = dispatchMouseEvent(targetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });
  });

  describe('nested containers', () => {
    let outerContainer: Element;
    let outerActionElement: Element;
    let outerTargetElement: Element;
    let innerContainer: Element;
    let innerActionElement: Element;
    let innerTargetElement: Element;

    beforeEach(() => {
      outerContainer = getRequiredElementById('nested-outer-container');
      outerActionElement = getRequiredElementById('nested-outer-action-element');
      outerTargetElement = getRequiredElementById('nested-outer-target-element');
      innerContainer = getRequiredElementById('nested-inner-container');
      innerActionElement = getRequiredElementById('nested-inner-action-element');
      innerTargetElement = getRequiredElementById('nested-inner-target-element');
    });

    it('dispatches events in outer container', () => {
      const documentListener = jasmine.createSpy('documentListener');
      window.document.documentElement.addEventListener('click', documentListener);
      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContractContainerManager = createEventContractMultiContainer(outerContainer);
      createEventContract({
        eventContractContainerManager,
        eventTypes: ['click'],
        dispatcher,
      });
      eventContractContainerManager.addContainer(innerContainer);

      const clickEvent = dispatchMouseEvent(outerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(outerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('outerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(outerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);
    });

    it('dispatches events in inner container', () => {
      const documentListener = jasmine.createSpy('documentListener');
      window.document.documentElement.addEventListener('click', documentListener);
      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContractContainerManager = createEventContractMultiContainer(outerContainer);
      createEventContract({
        eventContractContainerManager,
        eventTypes: ['click'],
        dispatcher,
      });
      eventContractContainerManager.addContainer(innerContainer);

      const clickEvent = dispatchMouseEvent(innerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);
    });

    it('dispatches events in outer container, inner registered first', () => {
      const documentListener = jasmine.createSpy('documentListener');
      window.document.documentElement.addEventListener('click', documentListener);
      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContractContainerManager = createEventContractMultiContainer(innerContainer);
      createEventContract({
        eventContractContainerManager,
        eventTypes: ['click'],
        dispatcher,
      });
      eventContractContainerManager.addContainer(outerContainer);

      const clickEvent = dispatchMouseEvent(outerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(outerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('outerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(outerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);
    });

    it('dispatches events in inner container, inner container registered first', () => {
      const documentListener = jasmine.createSpy('documentListener');
      window.document.documentElement.addEventListener('click', documentListener);
      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContractContainerManager = createEventContractMultiContainer(innerContainer);
      createEventContract({
        eventContractContainerManager,
        eventTypes: ['click'],
        dispatcher,
      });
      eventContractContainerManager.addContainer(outerContainer);

      const clickEvent = dispatchMouseEvent(innerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);
    });

    it('dispatches events in inner container, inner container removed', () => {
      const documentListener = jasmine.createSpy('documentListener');
      window.document.documentElement.addEventListener('click', documentListener);
      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContractContainerManager = createEventContractMultiContainer(outerContainer);
      createEventContract({
        eventContractContainerManager,
        eventTypes: ['click'],
        dispatcher,
      });
      const innerEventContractContainer =
        eventContractContainerManager.addContainer(innerContainer);

      let clickEvent = dispatchMouseEvent(innerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      let eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);

      dispatcher.calls.reset();
      documentListener.calls.reset();

      eventContractContainerManager.removeContainer(innerEventContractContainer);

      clickEvent = dispatchMouseEvent(innerTargetElement);

      expect(dispatcher).toHaveBeenCalledTimes(1);
      eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('click');
      expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
      expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

      expect(documentListener).toHaveBeenCalledTimes(1);
    });

    describe('with stop propagation', () => {
      it('dispatches events in outer container', () => {
        const documentListener = jasmine.createSpy('documentListener');
        window.document.documentElement.addEventListener('click', documentListener);
        const dispatcher = jasmine
          .createSpy<Dispatcher>('dispatcher')
          .and.callFake((eventInfo: EventInfo) => {
            stopPropagation(new EventInfoWrapper(eventInfo));
          });
        const eventContractContainerManager = createEventContractMultiContainer(outerContainer, {
          stopPropagation: true,
        });
        createEventContract({
          eventContractContainerManager,
          eventTypes: ['click'],
          dispatcher,
        });
        eventContractContainerManager.addContainer(innerContainer);

        const clickEvent = dispatchMouseEvent(outerTargetElement);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('click');
        expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
        expect(eventInfoWrapper.getTargetElement()).toBe(outerTargetElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('outerHandleClick');
        expect(eventInfoWrapper.getAction()?.element).toBe(outerActionElement);

        expect(documentListener).toHaveBeenCalledTimes(0);
      });

      it('dispatches events in inner container', () => {
        const documentListener = jasmine.createSpy('documentListener');
        window.document.documentElement.addEventListener('click', documentListener);
        const dispatcher = jasmine
          .createSpy<Dispatcher>('dispatcher')
          .and.callFake((eventInfo: EventInfo) => {
            stopPropagation(new EventInfoWrapper(eventInfo));
          });
        const eventContractContainerManager = createEventContractMultiContainer(outerContainer, {
          stopPropagation: true,
        });
        createEventContract({
          eventContractContainerManager,
          eventTypes: ['click'],
          dispatcher,
        });
        eventContractContainerManager.addContainer(innerContainer);

        const clickEvent = dispatchMouseEvent(innerTargetElement);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('click');
        expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
        expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
        expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

        expect(documentListener).toHaveBeenCalledTimes(0);
      });

      it('dispatches events in outer container, inner registered first', () => {
        const documentListener = jasmine.createSpy('documentListener');
        window.document.documentElement.addEventListener('click', documentListener);
        const dispatcher = jasmine
          .createSpy<Dispatcher>('dispatcher')
          .and.callFake((eventInfo: EventInfo) => {
            stopPropagation(new EventInfoWrapper(eventInfo));
          });
        const eventContractContainerManager = createEventContractMultiContainer(innerContainer, {
          stopPropagation: true,
        });
        createEventContract({
          eventContractContainerManager,
          eventTypes: ['click'],
          dispatcher,
        });
        eventContractContainerManager.addContainer(outerContainer);

        const clickEvent = dispatchMouseEvent(outerTargetElement);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('click');
        expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
        expect(eventInfoWrapper.getTargetElement()).toBe(outerTargetElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('outerHandleClick');
        expect(eventInfoWrapper.getAction()?.element).toBe(outerActionElement);

        expect(documentListener).toHaveBeenCalledTimes(0);
      });

      it('dispatches events in inner container, inner registered first', () => {
        const documentListener = jasmine.createSpy('documentListener');
        window.document.documentElement.addEventListener('click', documentListener);
        const dispatcher = jasmine
          .createSpy<Dispatcher>('dispatcher')
          .and.callFake((eventInfo: EventInfo) => {
            stopPropagation(new EventInfoWrapper(eventInfo));
          });
        const eventContractContainerManager = createEventContractMultiContainer(innerContainer, {
          stopPropagation: true,
        });
        createEventContract({
          eventContractContainerManager,
          eventTypes: ['click'],
          dispatcher,
        });
        eventContractContainerManager.addContainer(outerContainer);

        const clickEvent = dispatchMouseEvent(innerTargetElement);

        expect(dispatcher).toHaveBeenCalledTimes(1);
        const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
        expect(eventInfoWrapper.getEventType()).toBe('click');
        expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
        expect(eventInfoWrapper.getTargetElement()).toBe(innerTargetElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('innerHandleClick');
        expect(eventInfoWrapper.getAction()?.element).toBe(innerActionElement);

        expect(documentListener).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('non-bubbling mouse events', () => {
    beforeEach(() => {
      EventContract.MOUSE_SPECIAL_SUPPORT = true;
    });

    it('dispatches matching mouseover as mouseenter event', () => {
      const container = getRequiredElementById('mouseenter-container');
      const actionElement = getRequiredElementById('mouseenter-action-element');
      const targetElement = getRequiredElementById('mouseenter-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['mouseenter'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'mouseover',
        // Indicates that the mouse exited the container and entered the
        // target element.
        relatedTarget: container,
      });

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('mouseenter');
      const syntheticMouseEvent = eventInfoWrapper.getEvent();
      expect(syntheticMouseEvent.type).toBe('mouseenter');
      expect(syntheticMouseEvent.target).toBe(actionElement);
      expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleMouseEnter');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('does not dispatch non-matching mouseover event as mouseenter', () => {
      const container = getRequiredElementById('mouseenter-container');
      const actionElement = getRequiredElementById('mouseenter-action-element');
      const targetElement = getRequiredElementById('mouseenter-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['mouseenter'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'mouseover',
        // Indicates that the mouse exited the action element and entered the
        // target element.
        relatedTarget: actionElement,
      });

      // Global dispatch for the mouseover event still happens.
      expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('dispatches matching mouseout as mouseleave event', () => {
      const container = getRequiredElementById('mouseleave-container');
      const actionElement = getRequiredElementById('mouseleave-action-element');
      const targetElement = getRequiredElementById('mouseleave-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['mouseleave'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'mouseout',
        // Indicates that the mouse entered the container and exited the
        // target element.
        relatedTarget: container,
      });

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('mouseleave');
      const syntheticMouseEvent = eventInfoWrapper.getEvent();
      expect(syntheticMouseEvent.type).toBe('mouseleave');
      expect(syntheticMouseEvent.target).toBe(actionElement);
      expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleMouseLeave');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('does not dispatch non-matching mouseout event as mouseleave', () => {
      const container = getRequiredElementById('mouseleave-container');
      const actionElement = getRequiredElementById('mouseleave-action-element');
      const targetElement = getRequiredElementById('mouseleave-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['mouseleave'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'mouseout',
        // Indicates that the mouse entered the action element and exited the
        // target element.
        relatedTarget: actionElement,
      });

      // Global dispatch for the mouseout event still happens.
      expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('dispatches matching pointerover as pointerenter event', () => {
      const container = getRequiredElementById('pointerenter-container');
      const actionElement = getRequiredElementById('pointerenter-action-element');
      const targetElement = getRequiredElementById('pointerenter-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['pointerenter'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'pointerover',
        // Indicates that the pointer exited the container and entered the
        // target element.
        relatedTarget: container,
      });

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('pointerenter');
      const syntheticMouseEvent = eventInfoWrapper.getEvent();
      expect(syntheticMouseEvent.type).toBe('pointerenter');
      expect(syntheticMouseEvent.target).toBe(actionElement);
      expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handlePointerEnter');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('does not dispatch non-matching pointerover event as pointerenter', () => {
      const container = getRequiredElementById('pointerenter-container');
      const actionElement = getRequiredElementById('pointerenter-action-element');
      const targetElement = getRequiredElementById('pointerenter-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['pointerenter'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'pointerover',
        // Indicates that the pointer exited the action element and entered the
        // target element.
        relatedTarget: actionElement,
      });

      // Global dispatch for the pointerover event still happens.
      expect(dispatcher).toHaveBeenCalledTimes(1);
    });

    it('dispatches matching pointerout as pointerleave event', () => {
      const container = getRequiredElementById('pointerleave-container');
      const actionElement = getRequiredElementById('pointerleave-action-element');
      const targetElement = getRequiredElementById('pointerleave-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['pointerleave'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'pointerout',
        // Indicates that the pointer entered the container and exited the
        // target element.
        relatedTarget: container,
      });

      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('pointerleave');
      const syntheticMouseEvent = eventInfoWrapper.getEvent();
      expect(syntheticMouseEvent.type).toBe('pointerleave');
      expect(syntheticMouseEvent.target).toBe(actionElement);
      expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handlePointerLeave');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('does not dispatch non-matching pointerout event as pointerleave', () => {
      const container = getRequiredElementById('pointerleave-container');
      const actionElement = getRequiredElementById('pointerleave-action-element');
      const targetElement = getRequiredElementById('pointerleave-target-element');

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['pointerleave'],
        dispatcher,
      });

      dispatchMouseEvent(targetElement, {
        type: 'pointerout',
        // Indicates that the pointer entered the action element and exited the
        // target element.
        relatedTarget: actionElement,
      });

      // Global dispatch for the pointerout event still happens.
      expect(dispatcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('early events', () => {
    let removeEventListenerSpy: jasmine.Spy;

    beforeEach(() => {
      removeEventListenerSpy = spyOn(
        window.document.documentElement,
        'removeEventListener',
      ).and.callThrough();
    });

    it('early events are dispatched', () => {
      const container = getRequiredElementById('click-container');
      const actionElement = getRequiredElementById('click-action-element');
      const targetElement = getRequiredElementById('click-target-element');

      const earlyEventContract = new EarlyEventContract();
      earlyEventContract.addEvents(['click']);

      const clickEvent = dispatchMouseEvent(targetElement);

      const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
      expect(earlyJsactionData).toBeDefined();
      expect(earlyJsactionData!.q.length).toBe(1);
      expect(earlyJsactionData!.q[0].event).toBe(clickEvent);

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('early capture events are dispatched', () => {
      const container = getRequiredElementById('focus-container');
      const actionElement = getRequiredElementById('focus-action-element');
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

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
      const eventContract = createEventContract({
        eventContractContainerManager: new EventContractContainer(container),
        eventTypes: ['focus'],
        dispatcher,
      });

      eventContract.replayEarlyEvents(replaySink);

      expect(replaySink._ejsa).toBeUndefined();
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(dispatcher).toHaveBeenCalledTimes(1);
      const eventInfoWrapper = getLastDispatchedEventInfoWrapper(dispatcher);
      expect(eventInfoWrapper.getEventType()).toBe('focus');
      expect(eventInfoWrapper.getEvent().type).toBe('focus');
      expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
      expect(eventInfoWrapper.getAction()?.name).toBe('handleFocus');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    it('early events are dispatched when target is cleared', () => {
      const container = getRequiredElementById('click-container');
      const actionElement = getRequiredElementById('click-action-element');
      const targetElement = getRequiredElementById('click-target-element');

      const earlyEventContract = new EarlyEventContract();
      earlyEventContract.addEvents(['click']);

      const clickEvent = dispatchMouseEvent(targetElement);

      const earlyJsactionData: EarlyJsactionData | undefined = window._ejsa;
      expect(earlyJsactionData).toBeDefined();
      expect(earlyJsactionData!.q.length).toBe(1);
      expect(earlyJsactionData!.q[0].event).toBe(clickEvent);

      // Emulating browser behavior of clearing target after dispatch.
      Object.defineProperty(clickEvent, 'target', {value: null});

      const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
      expect(eventInfoWrapper.getAction()?.name).toBe('handleClick');
      expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
    });

    describe('non-bubbling mouse events', () => {
      beforeEach(() => {
        EventContract.MOUSE_SPECIAL_SUPPORT = true;
      });

      it('early mouseout dispatched as mouseleave and mouseout', () => {
        const container = getRequiredElementById('mouseleave-container');
        const actionElement = getRequiredElementById('mouseleave-action-element');
        const targetElement = getRequiredElementById('mouseleave-target-element');

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

        const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
        expect(syntheticMouseEvent.type).toBe('mouseleave');
        expect(syntheticMouseEvent.target).toBe(actionElement);
        expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('handleMouseLeave');
        expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
      });

      it('early mouseout dispatched as only mouseleave', () => {
        const container = getRequiredElementById('mouseleave-container');
        const actionElement = getRequiredElementById('mouseleave-action-element');
        const targetElement = getRequiredElementById('mouseleave-target-element');

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

        const dispatcher = jasmine.createSpy<Dispatcher>('dispatcher');
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
        expect(syntheticMouseEvent.type).toBe('mouseleave');
        expect(syntheticMouseEvent.target).toBe(actionElement);
        expect(eventInfoWrapper.getTargetElement()).toBe(actionElement);
        expect(eventInfoWrapper.getAction()?.name).toBe('handleMouseLeave');
        expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);
      });
    });
  });
});
