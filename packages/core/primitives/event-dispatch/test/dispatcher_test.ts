/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Dispatcher, Replayer} from '../src/dispatcher';
import {ActionInfo, createEventInfo, EventInfo, EventInfoWrapper} from '../src/event_info';

function createClickEvent() {
  return new MouseEvent('click', {bubbles: true, cancelable: true});
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

describe('dispatcher test.ts', () => {
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
});
