/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ExperimentalNavigationInterceptOptions,
  FakeNavigateEvent,
  FakeNavigation,
  FakeNavigationCurrentEntryChangeEvent,
} from '../fake_navigation';
import {ensureDocument} from '@angular/private/testing';

ensureDocument();

interface Locals {
  navigation: FakeNavigation;
  navigateEvents: FakeNavigateEvent[];
  navigationCurrentEntryChangeEvents: FakeNavigationCurrentEntryChangeEvent[];
  popStateEvents: PopStateEvent[];
  pendingInterceptOptions: ExperimentalNavigationInterceptOptions[];
  nextNavigateEvent: () => Promise<FakeNavigateEvent>;
  setExtraNavigateCallback: (callback: (event: FakeNavigateEvent) => void) => void;
}

describe('navigation', () => {
  let locals: Locals;

  const popStateListener = (event: Event) => {
    const popStateEvent = event as PopStateEvent;
    locals.popStateEvents.push(popStateEvent);
  };

  beforeEach(() => {
    window.addEventListener('popstate', popStateListener);
  });

  afterEach(() => {
    window.removeEventListener('popstate', popStateListener);
  });

  beforeEach(() => {
    const navigation = new FakeNavigation(document, 'https://test.com');
    const navigateEvents: FakeNavigateEvent[] = [];
    let nextNavigateEventResolve!: (value: FakeNavigateEvent) => void;
    let nextNavigateEventPromise = new Promise<FakeNavigateEvent>((resolve) => {
      nextNavigateEventResolve = resolve;
    });
    const navigationCurrentEntryChangeEvents: FakeNavigationCurrentEntryChangeEvent[] = [];
    const popStateEvents: PopStateEvent[] = [];
    const pendingInterceptOptions: ExperimentalNavigationInterceptOptions[] = [];
    let extraNavigateCallback: ((event: FakeNavigateEvent) => void) | undefined = undefined;

    navigation.addEventListener('navigate', (event: Event) => {
      const navigateEvent = event as FakeNavigateEvent;
      nextNavigateEventResolve(navigateEvent);
      nextNavigateEventPromise = new Promise<FakeNavigateEvent>((resolve) => {
        nextNavigateEventResolve = resolve;
      });
      locals.navigateEvents.push(navigateEvent);
      const interceptOptions = pendingInterceptOptions.shift();
      if (interceptOptions) {
        navigateEvent.intercept(interceptOptions);
      }
      extraNavigateCallback?.(navigateEvent);
    });
    navigation.addEventListener('currententrychange', (event: Event) => {
      const currentNavigationEntryChangeEvent = event as FakeNavigationCurrentEntryChangeEvent;
      locals.navigationCurrentEntryChangeEvents.push(currentNavigationEntryChangeEvent);
    });
    locals = {
      navigation,
      navigateEvents,
      navigationCurrentEntryChangeEvents,
      popStateEvents,
      pendingInterceptOptions,
      nextNavigateEvent() {
        return nextNavigateEventPromise;
      },
      setExtraNavigateCallback(callback: (event: FakeNavigateEvent) => void) {
        extraNavigateCallback = callback;
      },
    };
  });

  const setUpEntries = async ({hash = false} = {}) => {
    locals.pendingInterceptOptions.push({});
    const pathPrefix = hash ? '#' : '/';
    const firstPageEntry = await locals.navigation.navigate(`${pathPrefix}page1`, {
      state: {page1: true},
    }).finished;
    locals.pendingInterceptOptions.push({});
    const secondPageEntry = await locals.navigation.navigate(`${pathPrefix}page2`, {
      state: {page2: true},
    }).finished;
    locals.pendingInterceptOptions.push({});
    const thirdPageEntry = await locals.navigation.navigate(`${pathPrefix}page3`, {
      state: {page3: true},
    }).finished;
    locals.navigateEvents.length = 0;
    locals.navigationCurrentEntryChangeEvents.length = 0;
    locals.popStateEvents.length = 0;
    return [firstPageEntry, secondPageEntry, thirdPageEntry];
  };

  const setUpEntriesWithHistory = ({hash = false} = {}) => {
    const pathPrefix = hash ? '#' : '/';
    locals.navigation.pushState({state: {page1: true}}, '', `${pathPrefix}page1`);
    const firstPageEntry = locals.navigation.currentEntry;
    locals.navigation.pushState({state: {page2: true}}, '', `${pathPrefix}page2`);
    const secondPageEntry = locals.navigation.currentEntry;
    locals.navigation.pushState({state: {page3: true}}, '', `${pathPrefix}page3`);
    const thirdPageEntry = locals.navigation.currentEntry;
    locals.navigateEvents.length = 0;
    locals.navigationCurrentEntryChangeEvents.length = 0;
    locals.popStateEvents.length = 0;
    return [firstPageEntry, secondPageEntry, thirdPageEntry];
  };

  it('disposes', async () => {
    expect(locals.navigation.isDisposed()).toBeFalse();
    const navigateEvents: Event[] = [];
    locals.navigation.addEventListener('navigate', (event: Event) => {
      navigateEvents.push(event);
    });
    const navigationCurrentEntryChangeEvents: Event[] = [];
    locals.navigation.addEventListener('currententrychange', (event: Event) => {
      navigationCurrentEntryChangeEvents.push(event);
    });

    await locals.navigation.navigate('#page1').finished;
    expect(navigateEvents.length).toBe(1);
    expect(navigationCurrentEntryChangeEvents.length).toBe(1);
    locals.navigation.dispose();
    // After a dispose, a different singleton.
    expect(locals.navigation.isDisposed()).toBeTrue();
    await locals.navigation.navigate('#page2').finished;
    // Listeners are disposed.
    expect(navigateEvents.length).toBe(1);
    expect(navigationCurrentEntryChangeEvents.length).toBe(1);
  });

  describe('navigate', () => {
    it('push URL', async () => {
      const initialEntry = locals.navigation.currentEntry;
      locals.pendingInterceptOptions.push({});
      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'push',
          userInitiated: false,
          signal: jasmine.any(AbortSignal),
          destination: jasmine.objectContaining({
            url: 'https://test.com/test',
            key: null,
            id: null,
            index: -1,
            sameDocument: false,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toBeUndefined();
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '1',
          id: '1',
          index: 1,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigation.currentEntry).toBe(committedEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'push',
          from: jasmine.objectContaining({
            url: initialEntry.url,
            key: initialEntry.key,
            id: initialEntry.id,
            index: initialEntry.index,
            sameDocument: initialEntry.sameDocument,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toBe(initialEntry.getState());
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
      expect(locals.navigation.currentEntry).toBe(finishedEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('push URL relative', async () => {
      locals.pendingInterceptOptions.push({});
      await locals.navigation.navigate('/a/b/c').finished;
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/a/b/c');
      locals.pendingInterceptOptions.push({
        handler: () => Promise.resolve(),
      });
      await locals.navigation.navigate('../').finished;
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/a/');
    });

    it('replace URL', async () => {
      const initialEntry = locals.navigation.currentEntry;
      locals.pendingInterceptOptions.push({});
      const {committed, finished} = locals.navigation.navigate('/test', {
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'replace',
          userInitiated: false,
          signal: jasmine.any(AbortSignal),
          destination: jasmine.objectContaining({
            url: 'https://test.com/test',
            key: null,
            id: null,
            index: -1,
            sameDocument: false,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toBeUndefined();
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '0',
          id: '1',
          index: 0,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigation.currentEntry).toBe(committedEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'replace',
          from: jasmine.objectContaining({
            url: initialEntry.url,
            key: initialEntry.key,
            id: initialEntry.id,
            index: initialEntry.index,
            sameDocument: initialEntry.sameDocument,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toBe(initialEntry.getState());
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
      expect(locals.navigation.currentEntry).toBe(finishedEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('push URL with state', async () => {
      locals.pendingInterceptOptions.push({});
      const state = {test: true};
      const {committed, finished} = locals.navigation.navigate('/test', {
        state,
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.destination.getState()).toEqual(state);
      const committedEntry = await committed;
      expect(committedEntry.getState()).toEqual(state);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
    });

    it('replace URL with state', async () => {
      locals.pendingInterceptOptions.push({});
      const state = {test: true};
      const {committed, finished} = locals.navigation.navigate('/test', {
        state,
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.destination.getState()).toEqual(state);
      const committedEntry = await committed;
      expect(committedEntry.getState()).toEqual(state);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
    });

    it('push URL with hashchange', async () => {
      const {committed, finished} = locals.navigation.navigate('#test');
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.destination.url).toBe('https://test.com/#test');
      expect(navigateEvent.hashChange).toBeTrue();
      const committedEntry = await committed;
      expect(committedEntry.url).toBe('https://test.com/#test');
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
    });

    it('replace URL with hashchange', async () => {
      const {committed, finished} = locals.navigation.navigate('#test', {
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.destination.url).toBe('https://test.com/#test');
      expect(navigateEvent.hashChange).toBeTrue();
      const committedEntry = await committed;
      expect(committedEntry.url).toBe('https://test.com/#test');
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      const finishedEntry = await finished;
      expect(committedEntry).toBe(finishedEntry);
    });

    it('push URL with info', async () => {
      locals.pendingInterceptOptions.push({});
      const info = {test: true};
      const {finished, committed} = locals.navigation.navigate('/test', {info});
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.info).toBe(info);
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await finished;
    });

    it('replace URL with info', async () => {
      locals.pendingInterceptOptions.push({});
      const info = {test: true};
      const {finished, committed} = locals.navigation.navigate('/test', {
        info,
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      expect(navigateEvent.info).toBe(info);
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await finished;
    });

    it('push URL with handler', async () => {
      let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
      const handlerFinished = new Promise<undefined>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        handler: () => handlerFinished,
      });
      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '1',
          id: '1',
          index: 1,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      handlerFinishedResolve(undefined);
      await expectAsync(finished).toBeResolvedTo(committedEntry);
    });

    it('replace URL with handler', async () => {
      let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
      const handlerFinished = new Promise<undefined>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        handler: () => handlerFinished,
      });
      const {committed, finished} = locals.navigation.navigate('/test', {
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '0',
          id: '1',
          index: 0,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      handlerFinishedResolve(undefined);
      await expectAsync(finished).toBeResolvedTo(committedEntry);
    });

    it('deferred commit', async () => {
      let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
      const handlerFinished = new Promise<undefined>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      let precommitHandlerFinishedResolve!: () => void;
      const precommitHandlerFinished = new Promise<void>((resolve) => {
        precommitHandlerFinishedResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        handler: () => handlerFinished,
        precommitHandler: () => precommitHandlerFinished,
      });
      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      await expectAsync(committed).toBePending();
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/');
      precommitHandlerFinishedResolve();
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '1',
          id: '1',
          index: 1,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      handlerFinishedResolve(undefined);
      await expectAsync(finished).toBeResolvedTo(committedEntry);
    });

    it('deferred commit early resolve', async () => {
      let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
      const handlerFinished = new Promise<undefined>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        precommitHandler: () => handlerFinished,
      });
      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      await expectAsync(committed).toBePending();
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/');
      handlerFinishedResolve(undefined);
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '1',
          id: '1',
          index: 1,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBeResolvedTo(committedEntry);
    });

    it('deferred commit resolves on finished', async () => {
      let handlerFinishedResolve!: () => void;
      let precommitHandlerResolve!: () => void;
      const handlerFinished = new Promise<void>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      const precommitHandlerFinished = new Promise<void>((resolve) => {
        precommitHandlerResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        handler: () => handlerFinished,
        precommitHandler: () => precommitHandlerFinished,
      });
      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      await expectAsync(committed).toBePending();
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/');
      precommitHandlerResolve();
      handlerFinishedResolve();
      const committedEntry = await committed;
      expect(committedEntry).toEqual(
        jasmine.objectContaining({
          url: 'https://test.com/test',
          key: '1',
          id: '1',
          index: 1,
          sameDocument: true,
        }),
      );
      expect(committedEntry.getState()).toBeUndefined();
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBeResolvedTo(committedEntry);
    });

    it('push, finish, push does not result in abort of first', async () => {
      locals.pendingInterceptOptions.push({});

      const {finished} = locals.navigation.navigate('/test');
      const [navigateEvent] = locals.navigateEvents;
      await finished;
      locals.pendingInterceptOptions.push({});
      await locals.navigation.navigate('/other').finished;
      expect(navigateEvent.signal.aborted).toBeFalse();
    });

    it('push with interruption', async () => {
      locals.pendingInterceptOptions.push({
        handler: () => new Promise(() => {}),
      });

      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      locals.pendingInterceptOptions.push({});
      const interruptResult = locals.navigation.navigate('/interrupt');
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(navigateEvent.signal.aborted).toBeTrue();
      await interruptResult.committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
      expect(locals.popStateEvents.length).toBe(0);
      await interruptResult.finished;
    });

    it('replace with interruption', async () => {
      locals.pendingInterceptOptions.push({
        handler: () => new Promise(() => {}),
      });

      const {committed, finished} = locals.navigation.navigate('/test', {
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      locals.pendingInterceptOptions.push({});
      const interruptResult = locals.navigation.navigate('/interrupt');
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(navigateEvent.signal.aborted).toBeTrue();
      await interruptResult.committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
      expect(locals.popStateEvents.length).toBe(0);
      await interruptResult.finished;
    });

    it('push with handler reject', async () => {
      let handlerFinishedReject!: (reason: unknown) => void;
      locals.pendingInterceptOptions.push({
        handler: () =>
          new Promise<undefined>((resolve, reject) => {
            handlerFinishedReject = reject;
          }),
      });

      const {committed, finished} = locals.navigation.navigate('/test');
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      const error = new Error('rejected');
      handlerFinishedReject(error);
      await expectAsync(finished).toBeRejectedWith(error);
      expect(navigateEvent.signal.aborted).toBeTrue();
    });

    it('replace with reject', async () => {
      let handlerFinishedReject!: (reason: unknown) => void;
      locals.pendingInterceptOptions.push({
        handler: () =>
          new Promise<undefined>((resolve, reject) => {
            handlerFinishedReject = reject;
          }),
      });

      const {committed, finished} = locals.navigation.navigate('/test', {
        history: 'replace',
      });
      expect(locals.navigateEvents.length).toBe(1);
      const navigateEvent = locals.navigateEvents[0];
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      await expectAsync(finished).toBePending();
      const error = new Error('rejected');
      handlerFinishedReject(error);
      await expectAsync(finished).toBeRejectedWith(error);
      expect(navigateEvent.signal.aborted).toBeTrue();
    });
  });

  describe('traversal', () => {
    it('traverses back', async () => {
      expect(locals.navigation.canGoBack).toBeFalse();
      expect(locals.navigation.canGoForward).toBeFalse();
      const [firstPageEntry, , thirdPageEntry] = await setUpEntries();

      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeFalse();
      const {committed, finished} = locals.navigation.traverseTo(firstPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'traverse',
          signal: jasmine.any(AbortSignal),
          userInitiated: false,
          destination: jasmine.objectContaining({
            url: firstPageEntry.url!,
            key: firstPageEntry.key,
            id: firstPageEntry.id,
            index: firstPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toEqual(firstPageEntry.getState());
      const committedEntry = await committed;
      expect(committedEntry).toBe(firstPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          from: jasmine.objectContaining({
            url: thirdPageEntry.url!,
            key: thirdPageEntry.key,
            id: thirdPageEntry.id,
            index: thirdPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toEqual(thirdPageEntry.getState());
      expect(locals.popStateEvents.length).toBe(1);
      const popStateEvent = locals.popStateEvents[0];
      expect(popStateEvent.state).toBeNull();
      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeTrue();
      const finishedEntry = await finished;
      expect(finishedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
    });

    it('traverses forward', async () => {
      expect(locals.navigation.canGoBack).toBeFalse();
      expect(locals.navigation.canGoForward).toBeFalse();
      const [firstPageEntry, , thirdPageEntry] = await setUpEntries();
      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeFalse();
      await locals.navigation.traverseTo(firstPageEntry.key).finished;
      locals.navigateEvents.length = 0;
      locals.navigationCurrentEntryChangeEvents.length = 0;
      locals.popStateEvents.length = 0;
      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeTrue();

      const {committed, finished} = locals.navigation.traverseTo(thirdPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'traverse',
          signal: jasmine.any(AbortSignal),
          userInitiated: false,
          destination: jasmine.objectContaining({
            url: thirdPageEntry.url!,
            key: thirdPageEntry.key,
            id: thirdPageEntry.id,
            index: thirdPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toEqual(thirdPageEntry.getState());
      const committedEntry = await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          from: jasmine.objectContaining({
            url: firstPageEntry.url!,
            key: firstPageEntry.key,
            id: firstPageEntry.id,
            index: firstPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toEqual(firstPageEntry.getState());
      expect(locals.popStateEvents.length).toBe(1);
      const popStateEvent = locals.popStateEvents[0];
      expect(popStateEvent.state).toBeNull();
      expect(committedEntry).toBe(thirdPageEntry);
      const finishedEntry = await finished;
      expect(finishedEntry).toBe(thirdPageEntry);
      expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeFalse();
    });

    it('traverses back with hashchange', async () => {
      const [firstPageEntry] = await setUpEntries({hash: true});

      const {finished, committed} = locals.navigation.traverseTo(firstPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.hashChange).toBeTrue();
      await committed;
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await finished;
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
    });

    it('traverses forward with hashchange', async () => {
      const [firstPageEntry, thirdPageEntry] = await setUpEntries({hash: true});
      await locals.navigation.traverseTo(firstPageEntry.key).finished;
      locals.navigateEvents.length = 0;
      locals.navigationCurrentEntryChangeEvents.length = 0;
      locals.popStateEvents.length = 0;

      const {finished, committed} = locals.navigation.traverseTo(thirdPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.hashChange).toBeTrue();
      await committed;
      expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await finished;
      expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
    });

    it('traverses with info', async () => {
      const [firstPageEntry] = await setUpEntries();
      const info = {test: true};
      const {finished, committed} = locals.navigation.traverseTo(firstPageEntry.key, {info});
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.info).toBe(info);
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await finished;
    });

    it('traverses with history state', async () => {
      const [firstPageEntry] = setUpEntriesWithHistory();

      const {finished, committed} = locals.navigation.traverseTo(firstPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.destination.getHistoryState()).toEqual(firstPageEntry.getHistoryState());
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      const popStateEvent = locals.popStateEvents[0];
      expect(popStateEvent.state).toEqual(firstPageEntry.getHistoryState());
      await finished;
    });

    it('traverses with handler', async () => {
      const [firstPageEntry] = await setUpEntries();
      let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
      const handlerFinished = new Promise<undefined>((resolve) => {
        handlerFinishedResolve = resolve;
      });
      locals.pendingInterceptOptions.push({
        handler: () => handlerFinished,
      });
      const {committed, finished} = locals.navigation.traverseTo(firstPageEntry.key);
      const committedEntry = await committed;
      expect(committedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await expectAsync(finished).toBePending();
      handlerFinishedResolve(undefined);
      await expectAsync(finished).toBeResolvedTo(firstPageEntry);
    });

    it('traverses with interruption', async () => {
      const [firstPageEntry] = await setUpEntries();
      locals.pendingInterceptOptions.push({
        handler: () => new Promise(() => {}),
      });
      const {committed, finished} = locals.navigation.traverseTo(firstPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      await committed;
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      expect(navigateEvent.signal.aborted).toBeFalse();
      await expectAsync(finished).toBePending();
      locals.pendingInterceptOptions.push({});
      const interruptResult = locals.navigation.navigate('/interrupt');
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(navigateEvent.signal.aborted).toBeTrue();
      await interruptResult.committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
      expect(locals.popStateEvents.length).toBe(1);
      await interruptResult.finished;
    });

    it('traverses with reject', async () => {
      const [firstPageEntry] = await setUpEntries();
      let handlerFinishedReject!: (reason: unknown) => void;
      locals.pendingInterceptOptions.push({
        handler: () =>
          new Promise<undefined>((resolve, reject) => {
            handlerFinishedReject = reject;
          }),
      });

      const {committed, finished} = locals.navigation.traverseTo(firstPageEntry.key);
      const navigateEvent = await locals.nextNavigateEvent();
      await committed;
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      expect(navigateEvent.signal.aborted).toBeFalse();
      await expectAsync(finished).toBePending();
      const error = new Error('rejected');
      handlerFinishedReject(error);
      await expectAsync(finished).toBeRejectedWith(error);
      expect(navigateEvent.signal.aborted).toBeTrue();
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
    });

    it('traverses to non-existent', async () => {
      const {committed, finished} = locals.navigation.traverseTo('non-existent');
      await expectAsync(committed).toBeRejectedWithError(DOMException);
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(locals.navigateEvents.length).toBe(0);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('back', async () => {
      const [, secondPageEntry, thirdPageEntry] = await setUpEntries();
      const {committed, finished} = locals.navigation.back();
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'traverse',
          signal: jasmine.any(AbortSignal),
          userInitiated: false,
          destination: jasmine.objectContaining({
            url: secondPageEntry.url!,
            key: secondPageEntry.key,
            id: secondPageEntry.id,
            index: secondPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toEqual(secondPageEntry.getState());
      const committedEntry = await committed;
      expect(committedEntry).toBe(secondPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          from: jasmine.objectContaining({
            url: thirdPageEntry.url!,
            key: thirdPageEntry.key,
            id: thirdPageEntry.id,
            index: thirdPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toEqual(thirdPageEntry.getState());
      expect(locals.popStateEvents.length).toBe(1);
      const popStateEvent = locals.popStateEvents[0];
      expect(popStateEvent.state).toBeNull();
      const finishedEntry = await finished;
      expect(finishedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
    });

    it('back with info', async () => {
      await setUpEntries();
      const info = {test: true};
      const {committed, finished} = locals.navigation.back({info});
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.info).toBe(info);
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await finished;
    });

    it('back out of bounds', async () => {
      const {committed, finished} = locals.navigation.back();
      await expectAsync(committed).toBeRejectedWithError(DOMException);
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(locals.navigateEvents.length).toBe(0);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('forward', async () => {
      const [firstPageEntry, secondPageEntry] = await setUpEntries();
      await locals.navigation.traverseTo(firstPageEntry.key).finished;
      locals.navigateEvents.length = 0;
      locals.navigationCurrentEntryChangeEvents.length = 0;
      locals.popStateEvents.length = 0;

      const {committed, finished} = locals.navigation.forward();
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent).toEqual(
        jasmine.objectContaining({
          canIntercept: true,
          hashChange: false,
          info: undefined,
          navigationType: 'traverse',
          signal: jasmine.any(AbortSignal),
          userInitiated: false,
          destination: jasmine.objectContaining({
            url: secondPageEntry.url!,
            key: secondPageEntry.key,
            id: secondPageEntry.id,
            index: secondPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(navigateEvent.destination.getState()).toEqual(secondPageEntry.getState());
      const committedEntry = await committed;
      expect(committedEntry).toBe(secondPageEntry);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
      expect(currentEntryChangeEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          from: jasmine.objectContaining({
            url: firstPageEntry.url!,
            key: firstPageEntry.key,
            id: firstPageEntry.id,
            index: firstPageEntry.index,
            sameDocument: true,
          }),
        }),
      );
      expect(currentEntryChangeEvent.from.getState()).toEqual(firstPageEntry.getState());
      expect(locals.popStateEvents.length).toBe(1);
      const popStateEvent = locals.popStateEvents[0];
      expect(popStateEvent.state).toBeNull();
      const finishedEntry = await finished;
      expect(finishedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
    });

    it('forward with info', async () => {
      const [firstPageEntry] = await setUpEntries();
      await locals.navigation.traverseTo(firstPageEntry.key).finished;
      locals.navigateEvents.length = 0;
      locals.navigationCurrentEntryChangeEvents.length = 0;
      locals.popStateEvents.length = 0;

      const info = {test: true};
      const {committed, finished} = locals.navigation.forward({info});
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.info).toBe(info);
      await committed;
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await finished;
    });

    it('forward out of bounds', async () => {
      const {committed, finished} = locals.navigation.forward();
      await expectAsync(committed).toBeRejectedWithError(DOMException);
      await expectAsync(finished).toBeRejectedWithError(DOMException);
      expect(locals.navigateEvents.length).toBe(0);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('traverse synchronously', async () => {
      const [, secondPageEntry] = await setUpEntries();
      locals.navigation.setSynchronousTraversalsForTesting(true);

      const {committed, finished} = locals.navigation.back();
      // Synchronously navigates.
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
      await expectAsync(committed).toBeResolvedTo(secondPageEntry);
      await expectAsync(finished).toBeResolvedTo(secondPageEntry);
    });

    it('traversal current entry', async () => {
      const {committed, finished} = locals.navigation.traverseTo(
        locals.navigation.currentEntry.key,
      );
      await expectAsync(committed).toBeResolvedTo(locals.navigation.currentEntry);
      await expectAsync(finished).toBeResolvedTo(locals.navigation.currentEntry);
      expect(locals.navigateEvents.length).toBe(0);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      expect(locals.popStateEvents.length).toBe(0);
    });

    it('second traversal to same entry', async () => {
      const [firstPageEntry] = await setUpEntries();
      const traverseResult = locals.navigation.traverseTo(firstPageEntry.key);
      const duplicateTraverseResult = locals.navigation.traverseTo(firstPageEntry.key);
      expect(traverseResult.committed).toBe(duplicateTraverseResult.committed);
      expect(traverseResult.finished).toBe(duplicateTraverseResult.finished);
      await Promise.all([traverseResult.committed, duplicateTraverseResult.committed]);
      // Only one NavigationCurrentEntryChangeEvent for duplicate traversals
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      await Promise.all([traverseResult.finished, duplicateTraverseResult.finished]);
      // Only one NavigateEvent for duplicate traversals.
      expect(locals.navigateEvents.length).toBe(1);
    });

    it('queues traverses', async () => {
      const [firstPageEntry, secondPageEntry] = await setUpEntries();

      const firstTraverseResult = locals.navigation.traverseTo(firstPageEntry.key);
      const secondTraverseResult = locals.navigation.traverseTo(secondPageEntry.key);

      const firstTraverseCommittedEntry = await firstTraverseResult.committed;
      expect(firstTraverseCommittedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigateEvents.length).toBe(1);
      const firstNavigateEvent = locals.navigateEvents[0];
      expect(firstNavigateEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          destination: jasmine.objectContaining({
            key: firstPageEntry.key,
          }),
        }),
      );
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
      const firstTraverseFinishedEntry = await firstTraverseResult.finished;
      expect(firstTraverseFinishedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);

      const secondTraverseCommittedEntry = await secondTraverseResult.committed;
      expect(secondTraverseCommittedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
      expect(locals.navigateEvents.length).toBe(2);
      const secondNavigateEvent = locals.navigateEvents[1];
      expect(secondNavigateEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          destination: jasmine.objectContaining({
            key: secondPageEntry.key,
          }),
        }),
      );
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
      expect(locals.popStateEvents.length).toBe(2);
      const secondTraverseFinishedEntry = await secondTraverseResult.finished;
      expect(secondTraverseFinishedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
    });
  });

  describe('integration', () => {
    it('queues traverses after navigate', async () => {
      const [firstPageEntry, secondPageEntry] = await setUpEntries();

      const firstTraverseResult = locals.navigation.traverseTo(firstPageEntry.key);
      const secondTraverseResult = locals.navigation.traverseTo(secondPageEntry.key);
      locals.pendingInterceptOptions.push({});
      const navigateResult = locals.navigation.navigate('/page4', {
        state: {page4: true},
      });

      const navigateResultCommittedEntry = await navigateResult.committed;
      expect(navigateResultCommittedEntry.url).toBe('https://test.com/page4');
      expect(locals.navigation.currentEntry).toBe(navigateResultCommittedEntry);
      expect(locals.navigateEvents.length).toBe(1);
      const firstNavigateEvent = locals.navigateEvents[0];
      expect(firstNavigateEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'push',
          destination: jasmine.objectContaining({
            url: 'https://test.com/page4',
          }),
        }),
      );
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(0);
      const navigateResultFinishedEntry = await navigateResult.finished;
      expect(navigateResultFinishedEntry).toBe(navigateResultCommittedEntry);
      expect(locals.navigation.currentEntry).toBe(navigateResultCommittedEntry);

      const firstTraverseCommittedEntry = await firstTraverseResult.committed;
      expect(firstTraverseCommittedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigateEvents.length).toBe(2);
      const secondNavigateEvent = locals.navigateEvents[1];
      expect(secondNavigateEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          destination: jasmine.objectContaining({
            key: firstPageEntry.key,
          }),
        }),
      );
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
      expect(locals.popStateEvents.length).toBe(1);
      const firstTraverseFinishedEntry = await firstTraverseResult.finished;
      expect(firstTraverseFinishedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);

      const secondTraverseCommittedEntry = await secondTraverseResult.committed;
      expect(secondTraverseCommittedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
      expect(locals.navigateEvents.length).toBe(3);
      const thirdNavigateEvent = locals.navigateEvents[2];
      expect(thirdNavigateEvent).toEqual(
        jasmine.objectContaining({
          navigationType: 'traverse',
          destination: jasmine.objectContaining({
            key: secondPageEntry.key,
          }),
        }),
      );
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(3);
      expect(locals.popStateEvents.length).toBe(2);
      const secondTraverseFinishedEntry = await secondTraverseResult.finished;
      expect(secondTraverseFinishedEntry).toBe(secondPageEntry);
      expect(locals.navigation.currentEntry).toBe(secondPageEntry);
    });
  });

  describe('history API', () => {
    describe('push and replace', () => {
      it('push URL', async () => {
        const initialEntry = locals.navigation.currentEntry;

        locals.navigation.pushState(undefined, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent).toEqual(
          jasmine.objectContaining({
            canIntercept: true,
            hashChange: false,
            info: undefined,
            navigationType: 'push',
            userInitiated: false,
            signal: jasmine.any(AbortSignal),
            destination: jasmine.objectContaining({
              url: 'https://test.com/test',
              key: null,
              id: null,
              index: -1,
              sameDocument: true,
            }),
          }),
        );
        expect(navigateEvent.destination.getState()).toBeUndefined();
        expect(navigateEvent.destination.getHistoryState()).toBeUndefined();
        const currentEntry = locals.navigation.currentEntry;
        expect(currentEntry).toEqual(
          jasmine.objectContaining({
            url: 'https://test.com/test',
            key: '1',
            id: '1',
            index: 1,
            sameDocument: true,
          }),
        );
        expect(currentEntry.getState()).toBeUndefined();
        expect(currentEntry.getHistoryState()).toBeUndefined();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
        expect(currentEntryChangeEvent).toEqual(
          jasmine.objectContaining({
            navigationType: 'push',
            from: jasmine.objectContaining({
              url: initialEntry.url,
              key: initialEntry.key,
              id: initialEntry.id,
              index: initialEntry.index,
              sameDocument: initialEntry.sameDocument,
            }),
          }),
        );
        expect(currentEntryChangeEvent.from.getState()).toBe(initialEntry.getState());
        expect(currentEntryChangeEvent.from.getHistoryState()).toBeNull();
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('replace URL', async () => {
        const initialEntry = locals.navigation.currentEntry;

        locals.navigation.replaceState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent).toEqual(
          jasmine.objectContaining({
            canIntercept: true,
            hashChange: false,
            info: undefined,
            navigationType: 'replace',
            userInitiated: false,
            signal: jasmine.any(AbortSignal),
            destination: jasmine.objectContaining({
              url: 'https://test.com/test',
              key: null,
              id: null,
              index: -1,
              sameDocument: true,
            }),
          }),
        );
        expect(navigateEvent.destination.getState()).toBeUndefined();
        expect(navigateEvent.destination.getHistoryState()).toBeNull();
        const currentEntry = locals.navigation.currentEntry;
        expect(currentEntry).toEqual(
          jasmine.objectContaining({
            url: 'https://test.com/test',
            key: '0',
            id: '1',
            index: 0,
            sameDocument: true,
          }),
        );
        expect(currentEntry.getState()).toBeUndefined();
        expect(currentEntry.getHistoryState()).toBeNull();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
        expect(currentEntryChangeEvent).toEqual(
          jasmine.objectContaining({
            navigationType: 'replace',
            from: jasmine.objectContaining({
              url: initialEntry.url,
              key: initialEntry.key,
              id: initialEntry.id,
              index: initialEntry.index,
              sameDocument: initialEntry.sameDocument,
            }),
          }),
        );
        expect(currentEntryChangeEvent.from.getState()).toBe(initialEntry.getState());
        expect(currentEntryChangeEvent.from.getHistoryState()).toBeNull();
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('push URL with history state', async () => {
        locals.pendingInterceptOptions.push({});
        const state = {test: true};
        locals.navigation.pushState(state, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent.destination.getHistoryState()).toEqual(state);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.navigation.currentEntry.getHistoryState()).toEqual(state);
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('replace URL with history state', async () => {
        locals.pendingInterceptOptions.push({});
        const state = {test: true};
        locals.navigation.replaceState(state, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent.destination.getHistoryState()).toEqual(state);
        expect(locals.navigation.currentEntry.getHistoryState()).toEqual(state);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('push URL with hashchange', async () => {
        locals.navigation.pushState(null, '', '#test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent.destination.url).toBe('https://test.com/#test');
        expect(navigateEvent.hashChange).toBeTrue();
        expect(locals.navigation.currentEntry.url).toBe('https://test.com/#test');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('replace URL with hashchange', async () => {
        locals.navigation.replaceState(null, '', '#test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(navigateEvent.destination.url).toBe('https://test.com/#test');
        expect(navigateEvent.hashChange).toBeTrue();
        expect(locals.navigation.currentEntry.url).toBe('https://test.com/#test');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
      });

      it('push URL with handler', async () => {
        let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
        const handlerFinished = new Promise<undefined>((resolve) => {
          handlerFinishedResolve = resolve;
        });
        locals.pendingInterceptOptions.push({
          handler: () => handlerFinished,
        });
        locals.navigation.pushState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const currentEntry = locals.navigation.currentEntry;
        expect(currentEntry.url).toBe('https://test.com/test');
        expect(currentEntry.key).toBe('1');
        expect(currentEntry.id).toBe('1');
        expect(currentEntry.index).toBe(1);
        expect(currentEntry.sameDocument).toBeTrue();
        expect(currentEntry.getState()).toBeUndefined();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        handlerFinishedResolve(undefined);
        expect(locals.navigation.currentEntry).toBe(currentEntry);
      });

      it('replace URL with handler', async () => {
        let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
        const handlerFinished = new Promise<undefined>((resolve) => {
          handlerFinishedResolve = resolve;
        });
        locals.pendingInterceptOptions.push({
          handler: () => handlerFinished,
        });
        locals.navigation.replaceState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const currentEntry = locals.navigation.currentEntry;
        expect(currentEntry.url).toBe('https://test.com/test');
        expect(currentEntry.key).toBe('0');
        expect(currentEntry.id).toBe('1');
        expect(currentEntry.index).toBe(0);
        expect(currentEntry.sameDocument).toBeTrue();
        expect(currentEntry.getState()).toBeUndefined();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        handlerFinishedResolve(undefined);
        expect(locals.navigation.currentEntry).toBe(currentEntry);
      });

      it('push with interruption', async () => {
        locals.pendingInterceptOptions.push({
          handler: () => new Promise(() => {}),
        });

        locals.navigation.pushState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        locals.pendingInterceptOptions.push({});
        const interruptResult = locals.navigation.navigate('/interrupt');
        expect(navigateEvent.signal.aborted).toBeTrue();
        await interruptResult.committed;
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(0);
        await interruptResult.finished;
      });

      it('replace with interruption', async () => {
        locals.pendingInterceptOptions.push({
          handler: () => new Promise(() => {}),
        });

        locals.navigation.replaceState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        locals.pendingInterceptOptions.push({});
        const interruptResult = locals.navigation.navigate('/interrupt');
        expect(navigateEvent.signal.aborted).toBeTrue();
        await interruptResult.committed;
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(0);
        await interruptResult.finished;
      });

      it('push with handler reject', async () => {
        let handlerFinishedReject!: (reason: unknown) => void;
        const handlerPromise = new Promise<undefined>((resolve, reject) => {
          handlerFinishedReject = reject;
        });
        locals.pendingInterceptOptions.push({
          handler: () => handlerPromise,
        });

        locals.navigation.pushState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        const error = new Error('rejected');
        handlerFinishedReject(error);
        await expectAsync(handlerPromise).toBeRejectedWith(error);
        expect(navigateEvent.signal.aborted).toBeTrue();
      });

      it('replace with reject', async () => {
        let handlerFinishedReject!: (reason: unknown) => void;
        const handlerPromise = new Promise<undefined>((resolve, reject) => {
          handlerFinishedReject = reject;
        });
        locals.pendingInterceptOptions.push({
          handler: () => handlerPromise,
        });

        locals.navigation.replaceState(null, '', '/test');
        expect(locals.navigateEvents.length).toBe(1);
        const navigateEvent = locals.navigateEvents[0];
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        const error = new Error('rejected');
        handlerFinishedReject(error);
        await expectAsync(handlerPromise).toBeRejectedWith(error);
        expect(navigateEvent.signal.aborted).toBeTrue();
      });
    });

    describe('traversal', () => {
      it('go back', async () => {
        expect(locals.navigation.canGoBack).toBeFalse();
        expect(locals.navigation.canGoForward).toBeFalse();
        const [firstPageEntry, , thirdPageEntry] = await setUpEntries();
        expect(locals.navigation.canGoBack).toBeTrue();
        expect(locals.navigation.canGoForward).toBeFalse();
        locals.navigation.go(-2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(navigateEvent).toEqual(
          jasmine.objectContaining({
            canIntercept: true,
            hashChange: false,
            info: undefined,
            navigationType: 'traverse',
            signal: jasmine.any(AbortSignal),
            userInitiated: false,
            destination: jasmine.objectContaining({
              url: firstPageEntry.url!,
              key: firstPageEntry.key,
              id: firstPageEntry.id,
              index: firstPageEntry.index,
              sameDocument: true,
            }),
          }),
        );
        expect(navigateEvent.destination.getState()).toEqual(firstPageEntry.getState());
        expect(navigateEvent.destination.getHistoryState()).toEqual(
          firstPageEntry.getHistoryState(),
        );
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
        expect(currentEntryChangeEvent).toEqual(
          jasmine.objectContaining({
            navigationType: 'traverse',
            from: jasmine.objectContaining({
              url: thirdPageEntry.url!,
              key: thirdPageEntry.key,
              id: thirdPageEntry.id,
              index: thirdPageEntry.index,
              sameDocument: true,
            }),
          }),
        );
        expect(currentEntryChangeEvent.from.getState()).toEqual(thirdPageEntry.getState());
        expect(currentEntryChangeEvent.from.getHistoryState()).toEqual(
          thirdPageEntry.getHistoryState(),
        );
        expect(locals.popStateEvents.length).toBe(1);
        const popStateEvent = locals.popStateEvents[0];
        expect(popStateEvent.state).toBeNull();
        expect(locals.navigation.canGoBack).toBeTrue();
        expect(locals.navigation.canGoForward).toBeTrue();
      });

      it('go forward', async () => {
        expect(locals.navigation.canGoBack).toBeFalse();
        expect(locals.navigation.canGoForward).toBeFalse();
        const [firstPageEntry, , thirdPageEntry] = await setUpEntries();
        await locals.navigation.traverseTo(firstPageEntry.key).finished;
        locals.navigateEvents.length = 0;
        locals.navigationCurrentEntryChangeEvents.length = 0;
        locals.popStateEvents.length = 0;
        expect(locals.navigation.canGoBack).toBeTrue();
        expect(locals.navigation.canGoForward).toBeTrue();

        locals.navigation.go(2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(navigateEvent).toEqual(
          jasmine.objectContaining({
            canIntercept: true,
            hashChange: false,
            info: undefined,
            navigationType: 'traverse',
            signal: jasmine.any(AbortSignal),
            userInitiated: false,
            destination: jasmine.objectContaining({
              url: thirdPageEntry.url!,
              key: thirdPageEntry.key,
              id: thirdPageEntry.id,
              index: thirdPageEntry.index,
              sameDocument: true,
            }),
          }),
        );
        expect(navigateEvent.destination.getState()).toEqual(thirdPageEntry.getState());
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        const currentEntryChangeEvent = locals.navigationCurrentEntryChangeEvents[0];
        expect(currentEntryChangeEvent).toEqual(
          jasmine.objectContaining({
            navigationType: 'traverse',
            from: jasmine.objectContaining({
              url: firstPageEntry.url!,
              key: firstPageEntry.key,
              id: firstPageEntry.id,
              index: firstPageEntry.index,
              sameDocument: true,
            }),
          }),
        );
        expect(currentEntryChangeEvent.from.getState()).toEqual(firstPageEntry.getState());
        expect(locals.popStateEvents.length).toBe(1);
        const popStateEvent = locals.popStateEvents[0];
        expect(popStateEvent.state).toBeNull();
        expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
        expect(locals.navigateEvents.length).toBe(1);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        expect(locals.navigation.canGoBack).toBeTrue();
        expect(locals.navigation.canGoForward).toBeFalse();
      });

      it('go back with hashchange', async () => {
        await setUpEntries({hash: true});

        locals.navigation.go(-2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(navigateEvent.hashChange).toBeTrue();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
      });

      it('go back with history state', async () => {
        const [firstPageEntry] = setUpEntriesWithHistory();

        locals.navigation.go(-2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(navigateEvent.destination.getHistoryState()).toEqual(
          firstPageEntry.getHistoryState(),
        );
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        const popStateEvent = locals.popStateEvents[0];
        expect(popStateEvent.state).toEqual(firstPageEntry.getHistoryState());
      });

      it('go forward with hashchange', async () => {
        const [firstPageEntry] = await setUpEntries({hash: true});
        await locals.navigation.traverseTo(firstPageEntry.key).finished;
        locals.navigateEvents.length = 0;
        locals.navigationCurrentEntryChangeEvents.length = 0;
        locals.popStateEvents.length = 0;

        locals.navigation.go(2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(navigateEvent.hashChange).toBeTrue();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
      });

      it('go with handler', async () => {
        const [firstPageEntry] = await setUpEntries();
        let handlerFinishedResolve!: (value: Promise<undefined> | undefined) => void;
        const handlerFinished = new Promise<undefined>((resolve) => {
          handlerFinishedResolve = resolve;
        });
        locals.pendingInterceptOptions.push({
          handler: () => handlerFinished,
        });
        locals.navigation.go(-2);
        await locals.nextNavigateEvent();
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        handlerFinishedResolve(undefined);
      });

      it('go with interruption', async () => {
        const [firstPageEntry] = await setUpEntries();
        locals.pendingInterceptOptions.push({
          handler: () => new Promise(() => {}),
        });
        locals.navigation.go(-2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        expect(navigateEvent.signal.aborted).toBeFalse();
        locals.pendingInterceptOptions.push({});
        const interruptResult = locals.navigation.navigate('/interrupt');
        await interruptResult.committed;
        expect(navigateEvent.signal.aborted).toBeTrue();
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(1);
        await interruptResult.finished;
      });

      it('go with reject', async () => {
        const [firstPageEntry] = await setUpEntries();
        let handlerFinishedReject!: (reason: unknown) => void;
        locals.pendingInterceptOptions.push({
          handler: () =>
            new Promise<undefined>((resolve, reject) => {
              handlerFinishedReject = reject;
            }),
        });

        locals.navigation.go(-2);
        const navigateEvent = await locals.nextNavigateEvent();
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        expect(navigateEvent.signal.aborted).toBeFalse();
        const error = new Error('rejected');
        handlerFinishedReject(error);
        await new Promise((resolve) => {
          navigateEvent.signal.addEventListener('abort', resolve);
        });
        expect(navigateEvent.signal.aborted).toBeTrue();
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      });

      it('go synchronously', async () => {
        const [, secondPageEntry] = await setUpEntries();
        locals.navigation.setSynchronousTraversalsForTesting(true);

        locals.navigation.go(-1);
        // Synchronously navigates.
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        await expectAsync(locals.nextNavigateEvent()).toBePending();
      });

      it('go out of bounds', async () => {
        locals.navigation.go(-1);
        await expectAsync(locals.nextNavigateEvent()).toBePending();
        locals.navigation.go(1);
        await expectAsync(locals.nextNavigateEvent()).toBePending();
      });

      it('go queues', async () => {
        const [firstPageEntry, secondPageEntry] = await setUpEntries();

        locals.navigation.go(-1);
        locals.navigation.go(-1);
        const firstNavigateEvent = await locals.nextNavigateEvent();
        expect(firstNavigateEvent.destination.key).toBe(secondPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        const secondNavigateEvent = await locals.nextNavigateEvent();
        expect(secondNavigateEvent.destination.key).toBe(firstPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(2);
      });

      it('go queues both directions', async () => {
        const [firstPageEntry, secondPageEntry] = await setUpEntries();

        locals.navigation.go(-2);
        locals.navigation.go(1);
        const firstNavigateEvent = await locals.nextNavigateEvent();
        expect(firstNavigateEvent.destination.key).toBe(firstPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        const secondNavigateEvent = await locals.nextNavigateEvent();
        expect(secondNavigateEvent.destination.key).toBe(secondPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(2);
      });

      it('go queues with back', async () => {
        const [firstPageEntry, secondPageEntry] = await setUpEntries();

        locals.navigation.back();
        locals.navigation.go(-1);
        const firstNavigateEvent = await locals.nextNavigateEvent();
        expect(firstNavigateEvent.destination.key).toBe(secondPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        const secondNavigateEvent = await locals.nextNavigateEvent();
        expect(secondNavigateEvent.destination.key).toBe(firstPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(firstPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(2);
      });

      it('go queues with forward', async () => {
        const [, secondPageEntry, thirdPageEntry] = await setUpEntries();
        await locals.navigation.back().finished;
        locals.navigateEvents.length = 0;
        locals.navigationCurrentEntryChangeEvents.length = 0;
        locals.popStateEvents.length = 0;

        locals.navigation.forward();
        locals.navigation.go(-1);
        const firstNavigateEvent = await locals.nextNavigateEvent();
        expect(firstNavigateEvent.destination.key).toBe(thirdPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(1);
        const secondNavigateEvent = await locals.nextNavigateEvent();
        expect(secondNavigateEvent.destination.key).toBe(secondPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(2);
      });

      it('go after synchronous navigate', async () => {
        const [, secondPageEntry, thirdPageEntry] = await setUpEntries();

        // Back to /page2
        locals.navigation.go(-1);
        // Push /interrupt on top of current /page3
        locals.pendingInterceptOptions.push({});
        const interruptResult = locals.navigation.navigate('/interrupt');
        // Back from /interrupt to /page3.
        locals.navigation.go(-1);
        const interruptEntry = await interruptResult.finished;
        expect(locals.navigation.currentEntry).toBe(interruptEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
        expect(locals.popStateEvents.length).toBe(0);
        const firstNavigateEvent = await locals.nextNavigateEvent();
        expect(firstNavigateEvent.destination.key).toBe(secondPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(secondPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(2);
        expect(locals.popStateEvents.length).toBe(1);
        const secondNavigateEvent = await locals.nextNavigateEvent();
        expect(secondNavigateEvent.destination.key).toBe(thirdPageEntry.key);
        expect(locals.navigation.currentEntry).toBe(thirdPageEntry);
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(3);
        expect(locals.popStateEvents.length).toBe(2);
      });
    });
  });
});
