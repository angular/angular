/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventDispatcher, EventPhase, SyntheticEvent} from '../src/event_dispatcher';
import {createEventInfo, EventInfoWrapper} from '../src/event_info';
import {safeElement, testonlyHtml} from './html';

const domContent = `
<div id="click-container">
  <div id="click-action-element" jsaction="click:handleClick">
    <div id="click-target-element"></div>
  </div>
</div>

<div id="bubbling-container">
  <div id="bubbling-third-action-element" jsaction="click:thirdHandleClick">
    <div id="bubbling-second-action-element" jsaction="click:secondHandleClick">
      <div id="bubbling-first-action-element" jsaction="click:firstHandleClick">
        <div id="bubbling-target-element"></div>
      </div>
    </div>
  </div>
</div>
`;

function getRequiredElementById(id: string) {
  const element = document.getElementById(id);
  expect(element).not.toBeNull();
  return element!;
}

function createClickEvent() {
  return new MouseEvent('click', {bubbles: true, cancelable: true});
}

function createTestEventInfoWrapper({
  eventType = 'click',
  event = createClickEvent(),
  targetElement = getRequiredElementById('click-target-element'),
  container = getRequiredElementById('click-container'),
  timestamp = 0,
  isReplay,
}: {
  eventType?: string;
  event?: Event;
  targetElement?: Element;
  container?: Element;
  timestamp?: number;
  isReplay?: boolean;
} = {}): EventInfoWrapper {
  return new EventInfoWrapper(
    createEventInfo({
      event,
      eventType,
      targetElement,
      container,
      timestamp,
      isReplay,
    }),
  );
}

function createSpies({
  dispatchDelegate,
}: {
  dispatchDelegate?: (event: Event, actionName: string) => void;
} = {}) {
  const originalEventSpy = jasmine.createSpy<(originalEvent: Event) => void>('originalEvent');
  const currentTargetSpy =
    jasmine.createSpy<(currentTarget: EventTarget | null) => void>('currentTarget');
  const actionNameSpy = jasmine.createSpy<(actionName: string) => void>('actionName');
  const dispatchDelegateSpy = jasmine
    .createSpy<(event: Event, actionName: string) => void>('dispatchDelegate')
    .and.callFake((event, actionName) => {
      originalEventSpy((event as SyntheticEvent).originalEvent);
      currentTargetSpy(event.currentTarget);
      actionNameSpy(actionName);

      dispatchDelegate?.(event, actionName);
    });

  return {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy};
}

describe('EventDispatcher', () => {
  beforeEach(() => {
    safeElement.setInnerHtml(document.body, testonlyHtml(domContent));
  });

  it('dispatches to dispatchDelegate', () => {
    const actionElement = getRequiredElementById('click-action-element');

    const {dispatchDelegateSpy} = createSpies();
    const dispatcher = new EventDispatcher(dispatchDelegateSpy);
    const eventInfoWrapper = createTestEventInfoWrapper();

    dispatcher.dispatch(eventInfoWrapper.eventInfo);

    expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);
    const [event, actionName] = dispatchDelegateSpy.calls.mostRecent().args;
    expect((event as SyntheticEvent).originalEvent).toBe(eventInfoWrapper.getEvent());
    expect(event.currentTarget).toBe(actionElement);
    expect(actionName).toEqual('handleClick');
  });

  it('replays to dispatchDelegate', () => {
    const actionElement = getRequiredElementById('click-action-element');
    const targetElement = getRequiredElementById('click-target-element');

    const {dispatchDelegateSpy} = createSpies();
    const dispatcher = new EventDispatcher(dispatchDelegateSpy);
    const eventInfoWrapper = createTestEventInfoWrapper({isReplay: true});

    dispatcher.dispatch(eventInfoWrapper.eventInfo);

    expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);
    const [event, actionName] = dispatchDelegateSpy.calls.mostRecent().args;
    expect((event as SyntheticEvent).originalEvent).toBe(eventInfoWrapper.getEvent());
    expect(event.currentTarget).toBe(actionElement);
    expect(event.target).toBe(targetElement);
    expect(event.eventPhase).toBe(EventPhase.REPLAY);
    expect(() => {
      event.preventDefault();
    }).toThrow();
    expect(() => {
      event.composedPath();
    }).toThrow();
    expect(actionName).toEqual('handleClick');
  });

  describe('bubbling', () => {
    it('dispatches to multiple elements', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');
      const secondActionElement = getRequiredElementById('bubbling-second-action-element');
      const thirdActionElement = getRequiredElementById('bubbling-third-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} =
        createSpies();
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({container, targetElement});

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(3);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(secondActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('secondHandleClick');

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(thirdActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('thirdHandleClick');
    });

    it('dispatches to multiple elements in replay', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');
      const secondActionElement = getRequiredElementById('bubbling-second-action-element');
      const thirdActionElement = getRequiredElementById('bubbling-third-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} =
        createSpies();
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({
        container,
        targetElement,
        isReplay: true,
      });

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(3);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(secondActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('secondHandleClick');

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(thirdActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('thirdHandleClick');
    });

    it('stops dispatch if `stopPropagation` is called', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} = createSpies({
        dispatchDelegate: (event) => {
          event.stopPropagation();
        },
      });
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({container, targetElement});

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');
    });

    it('stops dispatch if `stopPropagation` is called in replay', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} = createSpies({
        dispatchDelegate: (event) => {
          event.stopPropagation();
        },
      });
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({
        container,
        targetElement,
        isReplay: true,
      });

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');
    });

    it('stops dispatch if `stopImmediatePropagation` is called', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} = createSpies({
        dispatchDelegate: (event) => {
          event.stopImmediatePropagation();
        },
      });
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({container, targetElement});

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');
    });

    it('stops dispatch if `stopImmediatePropagation` is called in replay', () => {
      const container = getRequiredElementById('bubbling-container');
      const targetElement = getRequiredElementById('bubbling-target-element');
      const firstActionElement = getRequiredElementById('bubbling-first-action-element');

      const {dispatchDelegateSpy, originalEventSpy, currentTargetSpy, actionNameSpy} = createSpies({
        dispatchDelegate: (event) => {
          event.stopImmediatePropagation();
        },
      });
      const dispatcher = new EventDispatcher(dispatchDelegateSpy);
      const eventInfoWrapper = createTestEventInfoWrapper({
        container,
        targetElement,
        isReplay: true,
      });

      dispatcher.dispatch(eventInfoWrapper.eventInfo);

      expect(dispatchDelegateSpy).toHaveBeenCalledTimes(1);

      expect(originalEventSpy).toHaveBeenCalledWith(eventInfoWrapper.getEvent());
      expect(currentTargetSpy).toHaveBeenCalledWith(firstActionElement);
      expect(actionNameSpy).toHaveBeenCalledWith('firstHandleClick');
    });
  });
});
