/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActionInfo, createEventInfo, EventInfoWrapper} from '../src/event_info';
import {Dispatcher, registerDispatcher, Replayer} from '../src/dispatcher';
import {addDeferredA11yClickSupport, EventContract} from '../src/eventcontract';
import {EventContractContainer} from '../src/event_contract_container';
import {safeElement, testonlyHtml} from './html';

const domContent = `
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

<div id="clickmod-container">
  <div id="clickmod-action-element" jsaction="clickmod:handleClickMod">
    <div id="clickmod-target-element"></div>
  </div>
</div>

<div id="a11y-anchor-click-container">
  <a id="a11y-anchor-click-action-element" href="javascript:void(0);" jsaction="handleClick">
    <span id="a11y-anchor-click-target-element" tabindex="0"></span>
  </a>
</div>
`;

function getRequiredElementById(id: string) {
  const element = document.getElementById(id);
  expect(element).not.toBeNull();
  return element!;
}

function createEventContract({
  container,
  eventTypes,
  exportAddA11yClickSupport = false,
}: {
  container: Element;
  eventTypes: Array<string | [string, string]>;
  exportAddA11yClickSupport?: boolean;
}): EventContract {
  const eventContract = new EventContract(new EventContractContainer(container));
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
  return eventContract;
}

function createClickEvent() {
  return new MouseEvent('click', {bubbles: true, cancelable: true});
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

function createTestActionInfo({
  name = 'handleClick',
  element = document.createElement('div'),
} = {}): ActionInfo {
  return {name, element};
}

function createTestEventInfoWrapper({
  eventType = 'click',
  event = createClickEvent(),
  targetElement = document.createElement('div'),
  container = document.createElement('div'),
  timestamp = 0,
  action = createTestActionInfo(),
  isReplay = undefined,
}: {
  eventType?: string;
  event?: Event;
  targetElement?: Element;
  container?: Element;
  timestamp?: number;
  action?: ActionInfo;
  isReplay?: boolean;
} = {}): EventInfoWrapper {
  return new EventInfoWrapper(
    createEventInfo({
      event,
      eventType,
      targetElement,
      container,
      timestamp,
      action,
      isReplay,
    }),
  );
}

describe('Dispatcher', () => {
  beforeEach(() => {
    safeElement.setInnerHtml(document.body, testonlyHtml(domContent));

    // Normalize timestamp.
    spyOn(Date, 'now').and.returnValue(0);
  });

  it('dispatches to dispatchDelegate', () => {
    const dispatchDelegate =
      jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatchDelegate');
    const dispatcher = new Dispatcher(dispatchDelegate);
    const eventInfoWrapper = createTestEventInfoWrapper();

    dispatcher.dispatch(eventInfoWrapper.eventInfo);

    expect(dispatchDelegate).toHaveBeenCalledWith(eventInfoWrapper);
  });

  it('replays to dispatchDelegate', async () => {
    const dispatchDelegate =
      jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatchDelegate');
    const dispatcher = new Dispatcher(dispatchDelegate);
    const eventInfoWrappers = [
      createTestEventInfoWrapper({isReplay: true}),
      createTestEventInfoWrapper({isReplay: true}),
      createTestEventInfoWrapper({isReplay: true}),
    ];

    for (const eventInfoWrapper of eventInfoWrappers) {
      dispatcher.dispatch(eventInfoWrapper.eventInfo);
    }

    await Promise.resolve();

    expect(dispatchDelegate).toHaveBeenCalledTimes(3);
    for (let i = 0; i < eventInfoWrappers.length; i++) {
      expect(dispatchDelegate.calls.argsFor(i)).toEqual([eventInfoWrappers[i]]);
    }
  });

  it('replays to event replayer', async () => {
    const dispatchDelegate =
      jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatchDelegate');
    const eventReplayer = jasmine.createSpy<Replayer>('eventReplayer');
    const dispatcher = new Dispatcher(dispatchDelegate, {eventReplayer});
    const eventInfoWrappers = [
      createTestEventInfoWrapper({isReplay: true}),
      createTestEventInfoWrapper({isReplay: true}),
      createTestEventInfoWrapper({isReplay: true}),
    ];

    for (const eventInfoWrapper of eventInfoWrappers) {
      dispatcher.dispatch(eventInfoWrapper.eventInfo);
    }

    await Promise.resolve();

    expect(dispatchDelegate).toHaveBeenCalledTimes(0);
    expect(eventReplayer).toHaveBeenCalledWith(eventInfoWrappers);
  });

  it('prevents default for click on anchor child', () => {
    const container = getRequiredElementById('anchor-click-container');
    const actionElement = getRequiredElementById('anchor-click-action-element');
    const targetElement = getRequiredElementById('anchor-click-target-element');

    const eventContract = createEventContract({
      container,
      eventTypes: ['click'],
    });
    const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
    const dispatcher = new Dispatcher(dispatch);
    registerDispatcher(eventContract, dispatcher);

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
      container,
      eventTypes: ['click'],
    });
    const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
    const dispatcher = new Dispatcher(dispatch);
    registerDispatcher(eventContract, dispatcher);

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

  it('does not prevent default for modified click on non-anchor child', () => {
    const container = getRequiredElementById('clickmod-container');
    const actionElement = getRequiredElementById('clickmod-action-element');
    const targetElement = getRequiredElementById('clickmod-target-element');

    const eventContract = createEventContract({
      container,
      eventTypes: ['click'],
    });
    const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
    const dispatcher = new Dispatcher(dispatch);
    registerDispatcher(eventContract, dispatcher);

    const clickEvent = dispatchMouseEvent(targetElement, {shiftKey: true});

    expect(dispatch).toHaveBeenCalledTimes(1);
    const eventInfoWrapper = dispatch.calls.mostRecent().args[0];
    expect(eventInfoWrapper.getEventType()).toBe('clickmod');
    expect(eventInfoWrapper.getEvent()).toBe(clickEvent);
    expect(eventInfoWrapper.getTargetElement()).toBe(targetElement);
    expect(eventInfoWrapper.getAction()?.name).toBe('handleClickMod');
    expect(eventInfoWrapper.getAction()?.element).toBe(actionElement);

    expect(clickEvent.preventDefault).not.toHaveBeenCalled();
  });

  describe('a11y click', () => {
    beforeAll(() => {
      EventContract.A11Y_CLICK_SUPPORT = true;
    });
    afterAll(() => {
      EventContract.A11Y_CLICK_SUPPORT = false;
    });

    it('prevents default for enter key on anchor child', () => {
      const container = getRequiredElementById('a11y-anchor-click-container');
      const actionElement = getRequiredElementById('a11y-anchor-click-action-element');
      const targetElement = getRequiredElementById('a11y-anchor-click-target-element');

      const eventContract = createEventContract({
        container,
        eventTypes: ['click'],
      });
      const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
      const dispatcher = new Dispatcher(dispatch);
      registerDispatcher(eventContract, dispatcher);

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

    it('prevents default for enter key on anchor child', () => {
      const container = getRequiredElementById('a11y-anchor-click-container');
      const actionElement = getRequiredElementById('a11y-anchor-click-action-element');
      const targetElement = getRequiredElementById('a11y-anchor-click-target-element');

      const eventContract = createEventContract({
        container,
        eventTypes: ['click'],
      });
      const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
      const dispatcher = new Dispatcher(dispatch);
      registerDispatcher(eventContract, dispatcher);

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
  });

  describe('a11y click support deferred', () => {
    it('prevents default for enter key on anchor child', () => {
      const container = getRequiredElementById('a11y-anchor-click-container');
      const actionElement = getRequiredElementById('a11y-anchor-click-action-element');
      const targetElement = getRequiredElementById('a11y-anchor-click-target-element');

      const eventContract = createEventContract({
        container,
        exportAddA11yClickSupport: true,
        eventTypes: ['click'],
      });
      addDeferredA11yClickSupport(eventContract);
      const dispatch = jasmine.createSpy<(eventInfoWrapper: EventInfoWrapper) => void>('dispatch');
      const dispatcher = new Dispatcher(dispatch);
      registerDispatcher(eventContract, dispatcher);

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
  });
});
