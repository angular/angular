/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  NavigationInterceptOptions,
  NavigationPrecommitController,
} from '../../src/navigation_types';
import {
  FakeNavigateEvent,
  FakeNavigation,
  FakeNavigationCurrentEntryChangeEvent,
} from '../fake_navigation';
import {ensureDocument, timeout} from '@angular/private/testing';

ensureDocument();

interface Locals {
  navigation: FakeNavigation;
  navigateEvents: FakeNavigateEvent[];
  navigationCurrentEntryChangeEvents: FakeNavigationCurrentEntryChangeEvent[];
  popStateEvents: PopStateEvent[];
  pendingInterceptOptions: NavigationInterceptOptions[];
  nextNavigateEvent: () => Promise<FakeNavigateEvent>;
  setExtraNavigateCallback: (callback: (event: FakeNavigateEvent) => void) => void;
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

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
    const pendingInterceptOptions: NavigationInterceptOptions[] = [];
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
            key: '',
            id: '',
            index: -1,
            sameDocument: false,
          }),
        }),
      );
      expect(navigateEvent.hasUAVisualTransition).toBe(false);
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
            key: '',
            id: '',
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

    it('precommitHandler rejects', async () => {
      const error = new Error('precommitHandler rejected');
      locals.pendingInterceptOptions.push({
        precommitHandler: () => Promise.reject(error),
      });
      const {committed, finished} = locals.navigation.navigate('/test-precommit-reject');
      await expectAsync(committed).toBeRejectedWith(error);
      await expectAsync(finished).toBeRejectedWith(error);
      expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/test-precommit-reject');
      expect(locals.navigateEvents.length).toBe(1); // navigate event still fires
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0); // No commit
    });

    it('precommitHandler throws', async () => {
      const error = new Error('precommitHandler threw');
      locals.pendingInterceptOptions.push({
        precommitHandler: () => {
          throw error;
        },
      });
      const {committed, finished} = locals.navigation.navigate('/test-precommit-throw');
      await expectAsync(committed).toBeRejectedWith(error);
      await expectAsync(finished).toBeRejectedWith(error);
      expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/test-precommit-throw');
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
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

    describe('precommitHandler with history API', () => {
      it('is invoked when pushState triggers a navigation', async () => {
        let precommitHandlerCalled = false;
        locals.pendingInterceptOptions.push({
          precommitHandler: async () => {
            precommitHandlerCalled = true;
          },
        });
        locals.navigation.pushState(null, '', '/pushed');
        await timeout();
        expect(precommitHandlerCalled).toBeTrue();
        expect(locals.navigation.currentEntry.url).toBe('https://test.com/pushed');
      });

      it('precommitHandler rejects during pushState', async () => {
        let precommitHandlerCalled = false;
        locals.pendingInterceptOptions.push({
          precommitHandler: () => {
            precommitHandlerCalled = true;
            return Promise.reject(new Error());
          },
        });

        const nextEvent = locals.nextNavigateEvent();
        locals.navigation.pushState(null, '', '/pushed-throw');
        await new Promise(async (resolve) => {
          (await nextEvent).signal.onabort = resolve;
        });

        expect(precommitHandlerCalled).toBeTrue();
        expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/pushed-reject');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      });

      it('precommitHandler throws during pushState', async () => {
        locals.pendingInterceptOptions.push({
          precommitHandler: () => {
            throw new Error();
          },
        });

        locals.navigation.pushState(null, '', '/pushed-throw');
        await timeout();
        expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/pushed-throw');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      });

      it('is invoked when replaceState triggers a navigation', async () => {
        let precommitHandlerCalled = false;
        locals.pendingInterceptOptions.push({
          precommitHandler: async () => {
            precommitHandlerCalled = true;
          },
        });
        locals.navigation.replaceState(null, '', '/replaced');
        await timeout();
        expect(precommitHandlerCalled).toBeTrue();
        expect(locals.navigation.currentEntry.url).toBe('https://test.com/replaced');
      });

      it('precommitHandler rejects during replaceState', async () => {
        const error = new Error('precommitHandler rejected for replaceState');
        let precommitHandlerCalled = false;
        locals.pendingInterceptOptions.push({
          precommitHandler: () => {
            precommitHandlerCalled = true;
            return Promise.reject(error);
          },
        });

        locals.navigation.replaceState(null, '', '/replaced-reject');
        await timeout();
        expect(precommitHandlerCalled).toBeTrue();
        const navigateEvent = locals.navigateEvents[locals.navigateEvents.length - 1];
        expect(navigateEvent.signal.aborted).toBeTrue();
        expect(navigateEvent.signal.reason).toBe(error);
        expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/replaced-reject');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      });

      it('precommitHandler throws during replaceState', async () => {
        const error = new Error('precommitHandler threw for replaceState');
        let precommitHandlerCalled = false;
        locals.pendingInterceptOptions.push({
          precommitHandler: () => {
            precommitHandlerCalled = true;
            throw error;
          },
        });

        locals.navigation.replaceState(null, '', '/replaced-throw');
        await timeout();
        expect(precommitHandlerCalled).toBeTrue();
        const navigateEvent = locals.navigateEvents[locals.navigateEvents.length - 1];
        expect(navigateEvent.signal.aborted).toBeTrue();
        expect(locals.navigation.currentEntry.url).not.toBe('https://test.com/replaced-throw');
        expect(locals.navigationCurrentEntryChangeEvents.length).toBe(0);
      });

      describe('redirect from precommitHandler during pushState', () => {
        it('correctly changes URL and replaces history entry by default', async () => {
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-push');
          await timeout();
          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-from-push', {history: 'push'});
            },
          });
          const originalNumEntries = locals.navigation.entries().length;
          locals.navigation.pushState(null, '', '/pushed');
          await timeout();

          expect(locals.navigation.currentEntry.url).toBe('https://test.com/redirected-from-push');
          expect(locals.navigation.entries().length).toBe(originalNumEntries + 1);
        });

        it('correctly changes URL and replaces history entry when history: "replace"', async () => {
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-push');
          await timeout();
          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-from-push', {history: 'replace'});
            },
          });
          const originalNumEntries = locals.navigation.entries().length;
          locals.navigation.pushState(null, '', '/pushed');
          await timeout();

          expect(locals.navigation.currentEntry.url).toBe('https://test.com/redirected-from-push');
          // pushState (becomes entry) + redirect with replace (replaces that entry)
          expect(locals.navigation.entries().length).toBe(originalNumEntries);
        });

        it('correctly updates info during redirect', async () => {
          const redirectInfo = {isRedirected: true};
          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-info', {info: redirectInfo});
            },
          });
          const nextEvent = locals.nextNavigateEvent();
          locals.navigation.pushState(null, '', '/pushed-for-info');
          const e = await nextEvent;
          await timeout();
          expect(e.info).toEqual(redirectInfo);
        });

        it('correctly updates state during redirect', async () => {
          const redirectState = {isRedirected: true};
          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-state', {state: redirectState});
            },
          });
          locals.navigation.pushState(null, '', '/pushed-for-state');
          await timeout();

          expect(locals.navigation.currentEntry.getState()).toEqual(redirectState);
        });
      });

      describe('redirect from precommitHandler during replaceState', () => {
        it('correctly changes URL and replaces history entry by default', async () => {
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-push');
          await timeout();
          locals.navigateEvents.length = 0;

          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-from-replace-push', {history: 'push'});
            },
          });
          const originalNumEntries = locals.navigation.entries().length;
          locals.navigation.replaceState(null, '', '/replaced-for-push');
          await timeout();

          expect(locals.navigation.currentEntry.url).toBe(
            'https://test.com/redirected-from-replace-push',
          );
          // replaceState (modifies current) + redirect with push (adds new one)
          expect(locals.navigation.entries().length).toBe(originalNumEntries + 1);
        });

        it('correctly changes URL and replaces history entry when history: "replace"', async () => {
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-replace');
          await timeout();
          locals.navigateEvents.length = 0;

          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-from-replace-replace', {history: 'replace'});
            },
          });
          const originalNumEntries = locals.navigation.entries().length;
          locals.navigation.replaceState(null, '', '/replaced-for-replace');
          await timeout();

          expect(locals.navigation.currentEntry.url).toBe(
            'https://test.com/redirected-from-replace-replace',
          );
          // replaceState (modifies current) + redirect with replace (modifies current again)
          expect(locals.navigation.entries().length).toBe(originalNumEntries);
        });

        it('correctly updates info during redirect', async () => {
          const redirectInfo = {isRedirectedReplace: true};
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-info');
          await timeout();
          locals.navigateEvents.length = 0;

          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-replace-info', {info: redirectInfo});
            },
          });
          const redirectedEvent = locals.nextNavigateEvent(); // Redirected navigation
          locals.navigation.replaceState(null, '', '/replaced-for-info');
          const e = await redirectedEvent;
          await timeout();

          expect(e.info).toEqual(redirectInfo);
        });

        it('correctly updates state during redirect', async () => {
          const redirectState = {isRedirectedReplace: true};
          // First, push a state
          locals.navigation.pushState(null, '', '/initial-for-replace-state');
          await timeout();

          locals.pendingInterceptOptions.push({
            precommitHandler: async (event) => {
              event.redirect('/redirected-replace-state', {state: redirectState});
            },
          });
          locals.navigation.replaceState(null, '', '/replaced-for-state');
          await timeout();

          expect(locals.navigation.currentEntry.getState()).toEqual(redirectState);
        });
      });
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
      expect(popStateEvent.hasUAVisualTransition).toBe(false);
      expect(locals.navigation.canGoBack).toBeTrue();
      expect(locals.navigation.canGoForward).toBeTrue();
      const finishedEntry = await finished;
      expect(finishedEntry).toBe(firstPageEntry);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);
      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.popStateEvents.length).toBe(1);
    });

    it('propagates a UA visual transition to the popstate event', async () => {
      await setUpEntries();
      locals.setExtraNavigateCallback((event) => {
        Object.defineProperty(event, 'hasUAVisualTransition', {value: true});
      });

      await locals.navigation.back().finished;

      expect(locals.navigateEvents[0].hasUAVisualTransition).toBeTrue();
      expect(locals.popStateEvents[0].hasUAVisualTransition).toBeTrue();
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

    it('subsequent traversal works after cancelled traversal', async () => {
      const [firstPageEntry, secondPageEntry, thirdPageEntry] = await setUpEntries();
      // Go back to the first page so we have room to traverse forward
      await locals.navigation.traverseTo(firstPageEntry.key).finished;
      locals.navigateEvents.length = 0;
      locals.navigationCurrentEntryChangeEvents.length = 0;
      locals.popStateEvents.length = 0;

      // Try to traverse to the second page but cancel it
      locals.pendingInterceptOptions.push({
        precommitHandler: () => Promise.reject(new Error('cancelled')),
      });
      const {committed, finished} = locals.navigation.traverseTo(secondPageEntry.key);
      await expectAsync(committed).toBeRejectedWithError(Error, /cancelled/);
      await expectAsync(finished).toBeRejectedWithError(Error, /cancelled/);
      expect(locals.navigation.currentEntry).toBe(firstPageEntry);

      // Verify that we can still traverse to the third page correctly
      // Using go(2) ensures that the prospective index was reset correctly
      // (index 0 -> index 2 relative to current)
      locals.navigation.go(2);
      // We need to wait for the traversal to happen. go() is void, but we can check the next event.
      const navigateEvent = await locals.nextNavigateEvent();
      expect(navigateEvent.destination.key).toBe(thirdPageEntry.key);
      // Determine if we need to await committed/finished for go() or if nextNavigateEvent is enough.
      // go() uses internal mechanism, but eventually updates currentEntry.
      // We can wait for the loop to settle.
      await timeout();
      expect(locals.navigation.currentEntry.key).toBe(thirdPageEntry.key);
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
              key: '',
              id: '',
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
              key: '',
              id: '',
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

  describe('redirect', () => {
    it('correctly changes the destination URL', async () => {
      locals.pendingInterceptOptions.push({
        precommitHandler: async (event) => {
          event.redirect('/redirected');
        },
      });
      const {committed} = locals.navigation.navigate('/initial');
      const committedEntry = await committed;
      expect(committedEntry.url).toBe('https://test.com/redirected');
    });

    it('works with history: "push" option', async () => {
      locals.pendingInterceptOptions.push({
        precommitHandler: async (event) => {
          event.redirect('/redirected', {history: 'push'});
        },
      });
      const {committed} = locals.navigation.navigate('/initial');
      const committedEntry = await committed;
      expect(committedEntry.url).toBe('https://test.com/redirected');
      expect(locals.navigation.entries().length).toBe(2); // Initial and redirected
    });

    it('works with history: "replace" option', async () => {
      locals.pendingInterceptOptions.push({
        precommitHandler: async (event) => {
          event.redirect('/redirected', {history: 'replace'});
        },
      });
      const {committed} = locals.navigation.navigate('/initial');
      const committedEntry = await committed;
      expect(committedEntry.url).toBe('https://test.com/redirected');
      expect(locals.navigation.entries().length).toBe(1); // Original entry replaced
    });

    it('correctly updates state if provided', async () => {
      const state = {redirectState: 'test'};
      locals.pendingInterceptOptions.push({
        precommitHandler: async (event) => {
          event.redirect('/redirected', {state});
        },
      });
      const {committed} = locals.navigation.navigate('/initial');
      const committedEntry = await committed;
      expect(committedEntry.getState()).toEqual(state);
    });

    it('throws InvalidStateError if navigationType is "traverse"', async () => {
      await setUpEntries();
      let caughtError: any = null;
      locals.pendingInterceptOptions.push({
        precommitHandler: async (event) => {
          try {
            event.redirect('/redirected');
          } catch (e: any) {
            caughtError = e;
          }
        },
      });
      // Use back() to trigger a 'traverse' navigation
      await locals.navigation.back().finished;
      expect(caughtError).not.toBeNull();
      expect(caughtError?.name).toBe('InvalidStateError');
      expect(caughtError?.message).toContain(
        "cannot redirect when navigationType is not 'push' or 'replace'",
      );
      // Check that a navigate event occurred (it should, even if redirect fails)
      expect(locals.navigateEvents.length).toBe(1);
    });

    it('throws SecurityError when redirecting to a cross-origin URL', async () => {
      let caughtError: any = null;
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          try {
            controller.redirect('https://evil.com');
          } catch (e: any) {
            caughtError = e;
          }
        },
      });

      await locals.navigation.navigate('/page').finished;
      expect(caughtError).not.toBeNull();
      expect(caughtError?.name).toBe('SecurityError');
    });

    it('throws SecurityError when redirecting to a script URL', async () => {
      let caughtError: any = null;
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          try {
            controller.redirect('javascript:alert(1)');
          } catch (e: any) {
            caughtError = e;
          }
        },
      });

      await locals.navigation.navigate('/page').finished;
      expect(caughtError).not.toBeNull();
      expect(caughtError?.name).toBe('SecurityError');
    });

    it('throws SyntaxError when redirecting to an unparseable URL', async () => {
      let caughtError: any = null;
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          try {
            controller.redirect('http://:invalid-url');
          } catch (e: any) {
            caughtError = e;
          }
        },
      });

      await locals.navigation.navigate('/page').finished;
      expect(caughtError).not.toBeNull();
      expect(caughtError?.name).toBe('SyntaxError');
    });

    it('synchronously clones state passed to redirect', async () => {
      const redirectState = {count: 10};
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          controller.redirect('/redirected', {state: redirectState});
          redirectState.count = 99;
        },
      });
      await locals.navigation.navigate('/page').finished;
      expect((locals.navigation.currentEntry.getState() as any).count).toBe(10);
    });
  });

  describe('addHandler', () => {
    it('executes post-commit handlers registered during precommit', async () => {
      const order: string[] = [];
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          order.push('precommit');
          controller.addHandler(() => {
            order.push('postcommit-from-precommit');
          });
        },
        handler: () => {
          order.push('postcommit');
        },
      });

      await locals.navigation.navigate('/test').finished;
      expect(order).toEqual(['precommit', 'postcommit', 'postcommit-from-precommit']);
    });

    it('waits for async handlers added via addHandler before finished resolves', async () => {
      let resolveHandler!: () => void;
      const handlerPromise = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          controller.addHandler(() => handlerPromise);
        },
      });

      const {finished} = locals.navigation.navigate('/test');
      await expectAsync(finished).toBePending();
      resolveHandler();
      await expectAsync(finished).toBeResolved();
    });

    it('throws InvalidStateError when addHandler is called outside intercepted state', async () => {
      let controller!: NavigationPrecommitController;
      locals.pendingInterceptOptions.push({
        precommitHandler: (c) => {
          controller = c;
        },
      });

      await locals.navigation.navigate('/test').finished;
      expect(() => controller.addHandler(() => {})).toThrowMatching(
        (e: any) => e.name === 'InvalidStateError',
      );
    });
  });

  describe('updateCurrentEntry', () => {
    it('updates currentEntry state and dispatches currententrychange with null navigationType', () => {
      const initialEntry = locals.navigation.currentEntry;
      expect(initialEntry.getState()).toBeUndefined();

      locals.navigation.updateCurrentEntry({state: {updated: 123}});

      expect(locals.navigation.currentEntry).toBe(initialEntry);
      expect(locals.navigation.currentEntry.getState()).toEqual({updated: 123});
      expect(locals.navigationCurrentEntryChangeEvents.length).toBe(1);
      expect(locals.navigationCurrentEntryChangeEvents[0].from).toBe(initialEntry);
      expect(locals.navigationCurrentEntryChangeEvents[0].navigationType).toBeNull();
    });

    it('clones state so modifications do not affect entry state', () => {
      const state = {count: 1};
      locals.navigation.updateCurrentEntry({state});
      state.count = 2;
      expect(locals.navigation.currentEntry.getState()).toEqual({count: 1});

      const returnedState = locals.navigation.currentEntry.getState() as {count: number};
      returnedState.count = 3;
      expect(locals.navigation.currentEntry.getState()).toEqual({count: 1});
    });
  });

  describe('reload', () => {
    it('reloads the current URL and dispatches navigate event with reload type', async () => {
      const initialEntry = locals.navigation.currentEntry;
      const result = locals.navigation.reload({info: 'reloadInfo'});

      expect(locals.navigateEvents.length).toBe(1);
      expect(locals.navigateEvents[0].navigationType).toBe('reload');
      expect(locals.navigateEvents[0].info).toBe('reloadInfo');
      expect(locals.navigateEvents[0].destination.url).toBe(initialEntry.url!);
      expect(locals.navigateEvents[0].destination.key).toBe('');
      expect(locals.navigateEvents[0].destination.id).toBe('');
      expect(locals.navigateEvents[0].destination.index).toBe(-1);

      const reloadedEntry = await result.finished;
      expect(reloadedEntry).toBe(initialEntry);
      expect(reloadedEntry.url).toBe(initialEntry.url!);
      expect(reloadedEntry.key).toBe(initialEntry.key);
      expect(reloadedEntry.id).toBe(initialEntry.id);
    });

    it('allows intercepting reload', async () => {
      let intercepted = false;
      locals.pendingInterceptOptions.push({
        handler: () => {
          intercepted = true;
        },
      });

      await locals.navigation.reload().finished;
      expect(intercepted).toBeTrue();
      expect(locals.navigateEvents[0].navigationType).toBe('reload');
    });

    it('reloads with custom state when provided', async () => {
      const result = locals.navigation.reload({state: {reloaded: true}});
      const entry = await result.finished;
      expect(entry.getState()).toEqual({reloaded: true});
    });

    it('preserves existing state when state option is omitted', async () => {
      locals.navigation.updateCurrentEntry({state: {preserved: 'yes'}});
      const result = locals.navigation.reload();
      const entry = await result.finished;
      expect(entry.getState()).toEqual({preserved: 'yes'});
    });

    it('resets state when explicitly passed state: undefined', async () => {
      locals.navigation.updateCurrentEntry({state: {toReset: true}});
      const result = locals.navigation.reload({state: undefined});
      const entry = await result.finished;
      expect(entry.getState()).toBeUndefined();
    });

    it('does not dispose the current entry on reload', async () => {
      const initialEntry = locals.navigation.currentEntry;
      let disposed = false;
      initialEntry.ondispose = () => {
        disposed = true;
      };

      await locals.navigation.reload().finished;
      expect(disposed).toBeFalse();
    });
  });

  describe('NavigateEvent properties', () => {
    it('has default hasUAVisualTransition and sourceElement values', async () => {
      await locals.navigation.navigate('/page').finished;
      const event = locals.navigateEvents[0];
      expect(event.hasUAVisualTransition).toBe(false);
      expect(event.sourceElement).toBeNull();
    });
  });

  describe('NavigationHistoryEntry dispose event', () => {
    it('fires "dispose" event and triggers ondispose when entry is replaced', async () => {
      const firstEntry = locals.navigation.currentEntry;
      let disposeEventFired = false;
      let ondisposeFired = false;

      firstEntry.addEventListener('dispose', () => {
        disposeEventFired = true;
      });
      firstEntry.ondispose = () => {
        ondisposeFired = true;
      };

      await locals.navigation.navigate('/replaced', {history: 'replace'}).finished;

      expect(disposeEventFired).toBeTrue();
      expect(ondisposeFired).toBeTrue();
    });

    it('allows removing ondispose handler by setting it to null', async () => {
      const firstEntry = locals.navigation.currentEntry;
      let ondisposeFired = false;
      firstEntry.ondispose = () => {
        ondisposeFired = true;
      };
      firstEntry.ondispose = null;

      await locals.navigation.navigate('/replaced', {history: 'replace'}).finished;
      expect(ondisposeFired).toBeFalse();
    });
  });

  describe('Navigation event handlers (on*)', () => {
    it('handles onnavigate, onnavigatesuccess, and oncurrententrychange properties', async () => {
      let onNavigateCalled = false;
      let onNavigateSuccessCalled = false;
      let onCurrentEntryChangeCalled = false;

      locals.navigation.onnavigate = () => {
        onNavigateCalled = true;
      };
      locals.navigation.onnavigatesuccess = () => {
        onNavigateSuccessCalled = true;
      };
      locals.navigation.oncurrententrychange = () => {
        onCurrentEntryChangeCalled = true;
      };

      await locals.navigation.navigate('/test').finished;

      expect(onNavigateCalled).toBeTrue();
      expect(onNavigateSuccessCalled).toBeTrue();
      expect(onCurrentEntryChangeCalled).toBeTrue();
    });

    it('handles onnavigateerror property when navigation fails', async () => {
      let errorEvent: ErrorEvent | undefined;
      const expectedError = new Error('handler failure');

      locals.navigation.onnavigate = (event) => {
        event.intercept({
          handler: () => {
            throw expectedError;
          },
        });
      };
      locals.navigation.onnavigateerror = (event) => {
        errorEvent = event;
      };

      await expectAsync(locals.navigation.navigate('/test').finished).toBeRejectedWith(
        expectedError,
      );
      expect(errorEvent).toBeDefined();
      expect(errorEvent?.error).toBe(expectedError);
    });

    it('removes event listener when handler property is set to null', async () => {
      let onNavigateCalled = false;
      locals.navigation.onnavigate = () => {
        onNavigateCalled = true;
      };
      locals.navigation.onnavigate = null;

      await locals.navigation.navigate('/test').finished;
      expect(onNavigateCalled).toBeFalse();
    });
  });

  describe('superseded navigation race condition in commit()', () => {
    it('prevents a superseded navigation from committing after asynchronous precommit handlers resolve', async () => {
      let resolveNav1: () => void;
      const nav1Deferred = new Promise<void>((res) => (resolveNav1 = res));

      locals.pendingInterceptOptions.push({
        precommitHandler: () => nav1Deferred,
      });

      const nav1 = locals.navigation.navigate('/page1');
      const nav2 = locals.navigation.navigate('/page2');

      // Finish nav1 after nav2 has already started
      resolveNav1!();

      await expectAsync(nav1.committed).toBeRejected();
      await nav2.committed;

      expect(locals.navigation.currentEntry?.url).toContain('/page2');
      expect(locals.navigation.entries().length).toBe(2); // Initial and page2
    });
  });

  describe('isolated history entry EventTarget and disposal', () => {
    it('isolates dispose events so entries only receive their own disposal event', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry1 = locals.navigation.currentEntry!;
      let entry1DisposedCount = 0;
      entry1.ondispose = () => entry1DisposedCount++;

      await locals.navigation.navigate('/page2').finished;
      const entry2 = locals.navigation.currentEntry!;
      let entry2DisposedCount = 0;
      entry2.ondispose = () => entry2DisposedCount++;

      // Replace entry 2; entry 1 must NOT receive a dispose event
      await locals.navigation.navigate('/page3', {history: 'replace'}).finished;

      expect(entry2DisposedCount).toBe(1);
      expect(entry1DisposedCount).toBe(0);
    });

    it('does not throw when removing listeners or setting ondispose on a disposed entry', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry = locals.navigation.currentEntry!;
      const listener = () => {};
      entry.addEventListener('dispose', listener);
      entry.ondispose = () => {};

      await locals.navigation.navigate('/page2', {history: 'replace'}).finished;

      expect(() => {
        entry.removeEventListener('dispose', listener);
        entry.ondispose = null;
      }).not.toThrow();
    });
  });

  describe('hasUAVisualTransition and sourceElement propagation', () => {
    it('propagates hasUAVisualTransition: true to NavigateEvent and PopStateEvent on back()', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;

      await locals.navigation.back({hasUAVisualTransition: true}).finished;

      const navEvent = locals.navigateEvents[locals.navigateEvents.length - 1];
      expect(navEvent.hasUAVisualTransition).toBe(true);
      const popEvent = locals.popStateEvents[locals.popStateEvents.length - 1];
      expect(popEvent.hasUAVisualTransition).toBe(true);
    });

    it('propagates hasUAVisualTransition: true on forward()', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;
      await locals.navigation.back().finished;

      await locals.navigation.forward({hasUAVisualTransition: true}).finished;

      expect(locals.navigateEvents[locals.navigateEvents.length - 1].hasUAVisualTransition).toBe(
        true,
      );
      expect(locals.popStateEvents[locals.popStateEvents.length - 1].hasUAVisualTransition).toBe(
        true,
      );
    });

    it('propagates hasUAVisualTransition: true on traverseTo()', async () => {
      await locals.navigation.navigate('/page1').finished;
      const target = locals.navigation.currentEntry;
      await locals.navigation.navigate('/page2').finished;

      await locals.navigation.traverseTo(target.key, {hasUAVisualTransition: true}).finished;

      expect(locals.navigateEvents[locals.navigateEvents.length - 1].hasUAVisualTransition).toBe(
        true,
      );
    });

    it('defaults hasUAVisualTransition to false for a traversal without the option', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;

      await locals.navigation.back().finished;

      expect(locals.navigateEvents[locals.navigateEvents.length - 1].hasUAVisualTransition).toBe(
        false,
      );
      expect(locals.popStateEvents[locals.popStateEvents.length - 1].hasUAVisualTransition).toBe(
        false,
      );
    });

    it('propagates sourceElement to NavigateEvent via navigateForTesting()', async () => {
      const button = document.createElement('button');
      await locals.navigation.navigateForTesting('/page', {sourceElement: button}).finished;
      const navEvent = locals.navigateEvents[locals.navigateEvents.length - 1];
      expect(navEvent.sourceElement).toBe(button);
    });
  });

  describe('NavigateEvent.intercept() state validation and check order', () => {
    it('throws InvalidStateError when called outside of the navigate event dispatch', async () => {
      let eventRef: FakeNavigateEvent | null = null;
      locals.setExtraNavigateCallback((event) => {
        eventRef = event;
      });

      // A navigation that is never intercepted, so its interceptionState stays 'none'. The only
      // thing making a later intercept() invalid is the unset dispatch flag.
      await locals.navigation.navigate('/page').finished;
      expect(eventRef).not.toBeNull();
      expect((eventRef as any).interceptionState).toBe('none');

      expect(() => {
        eventRef!.intercept({});
      }).toThrowMatching((e: any) => e.name === 'InvalidStateError');

      // The rejected call must not have mutated the event.
      expect((eventRef as any).interceptionState).toBe('none');
      expect((eventRef as any).sameDocument).toBe(false);
    });

    it('throws InvalidStateError when called after an intercepted navigation finished', async () => {
      let eventRef: FakeNavigateEvent | null = null;
      locals.pendingInterceptOptions.push({handler: () => {}});
      locals.setExtraNavigateCallback((event) => {
        eventRef = event;
      });

      await locals.navigation.navigate('/page').finished;

      expect(() => {
        eventRef!.intercept({});
      }).toThrowMatching((e: any) => e.name === 'InvalidStateError');
    });

    it('rejects a precommitHandler on a non-cancelable event without mutating the event', async () => {
      let caughtError: any = null;
      let eventRef: FakeNavigateEvent | null = null;
      // Checked during dispatch, which is the only point at which intercept() is valid.
      locals.setExtraNavigateCallback((event) => {
        eventRef = event;
        try {
          event.intercept({precommitHandler: () => {}});
        } catch (e) {
          caughtError = e;
        }
      });

      await locals.navigation.navigateForTesting('/page', {cancelable: false}).finished;

      expect(caughtError?.name).toBe('InvalidStateError');
      // The cancelable check runs before any state is written, so the navigation stayed
      // un-intercepted.
      expect((eventRef as any).interceptionState).toBe('none');
      expect((eventRef as any).sameDocument).toBe(false);
    });

    it('throws SecurityError when canIntercept is false, before the dispatch flag check', async () => {
      // `canIntercept` is checked ahead of the dispatch flag, so a stale non-interceptable event
      // reports SecurityError rather than InvalidStateError.
      let eventRef: FakeNavigateEvent | null = null;
      locals.setExtraNavigateCallback((event) => {
        eventRef = event;
      });
      await locals.navigation.navigate('/page').finished;
      (eventRef as any).canIntercept = false;

      expect(() => {
        eventRef!.intercept({});
      }).toThrowMatching((e: any) => e.name === 'SecurityError');
    });

    it('throws InvalidStateError from intercept() once the event was canceled mid-dispatch', async () => {
      let caughtError: any = null;
      locals.setExtraNavigateCallback((event) => {
        // Aborting while the event is still dispatching sets the spec's "canceled flag", which is
        // what a nested navigation started from a `navigate` listener does.
        (event as any).abort(new DOMException('superseded', 'AbortError'));
        try {
          event.intercept({});
        } catch (e) {
          caughtError = e;
        }
      });

      await expectAsync(locals.navigation.navigate('/page').finished).toBeRejected();
      expect(caughtError?.name).toBe('InvalidStateError');
    });
  });

  describe('structuredClone state serialization', () => {
    it('supports Date, Map, and Set objects in navigation state', async () => {
      const testDate = new Date(2026, 0, 1);
      const testMap = new Map([['key', 'val']]);
      const testSet = new Set([1, 2, 3]);

      await locals.navigation.navigate('/page', {
        state: {testDate, testMap, testSet},
      }).finished;

      const state = locals.navigation.currentEntry.getState() as any;
      expect(state.testDate instanceof Date).toBeTrue();
      expect(state.testDate.getTime()).toBe(testDate.getTime());
      expect(state.testMap instanceof Map).toBeTrue();
      expect(state.testMap.get('key')).toBe('val');
      expect(state.testSet instanceof Set).toBeTrue();
      expect(state.testSet.has(2)).toBeTrue();
    });

    it('synchronously clones state upon navigate() call', async () => {
      const mutableState = {counter: 1};
      const navPromise = locals.navigation.navigate('/page', {state: mutableState});
      mutableState.counter = 2; // Mutate immediately after navigate() call

      await navPromise.finished;
      const state = locals.navigation.currentEntry.getState() as any;
      expect(state.counter).toBe(1);
    });

    it('clones state returned by destination.getState() and entry.getState()', async () => {
      locals.setExtraNavigateCallback((event) => {
        const destState = event.destination.getState() as any;
        destState.mutated = true;
        expect((event.destination.getState() as any).mutated).toBeUndefined();
      });

      await locals.navigation.navigate('/page', {state: {initial: true}}).finished;
      const entryState = locals.navigation.currentEntry.getState() as any;
      entryState.mutated = true;
      expect((locals.navigation.currentEntry.getState() as any).mutated).toBeUndefined();
    });

    it('rejects with DataCloneError when non-cloneable objects are passed to navigate()', async () => {
      const unclonable = {fn: () => {}};
      const result = locals.navigation.navigate('/page', {state: unclonable});
      await expectAsync(result.committed).toBeRejectedWith(
        jasmine.objectContaining({name: 'DataCloneError'}),
      );
      await expectAsync(result.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'DataCloneError'}),
      );
    });

    it('throws DataCloneError when non-cloneable objects are passed to updateCurrentEntry()', () => {
      const unclonable = {fn: () => {}};
      expect(() => {
        locals.navigation.updateCurrentEntry({state: unclonable});
      }).toThrowMatching((e: any) => e.name === 'DataCloneError');
    });
  });

  describe('IDL event handler attribute this binding', () => {
    it('binds "this" to Navigation in IDL event handlers', async () => {
      let onnavigateThis: any;
      let oncurrententrychangeThis: any;
      let onnavigatesuccessThis: any;

      locals.navigation.onnavigate = function () {
        onnavigateThis = this;
      };
      locals.navigation.oncurrententrychange = function () {
        oncurrententrychangeThis = this;
      };
      locals.navigation.onnavigatesuccess = function () {
        onnavigatesuccessThis = this;
      };

      await locals.navigation.navigate('/page').finished;

      expect(onnavigateThis).toBe(locals.navigation);
      expect(oncurrententrychangeThis).toBe(locals.navigation);
      expect(onnavigatesuccessThis).toBe(locals.navigation);
    });

    it('binds "this" to Navigation in onnavigateerror', async () => {
      let onnavigateerrorThis: any;
      locals.navigation.onnavigate = (e) => {
        e.intercept({
          handler: () => {
            throw new Error('boom');
          },
        });
      };
      locals.navigation.onnavigateerror = function () {
        onnavigateerrorThis = this;
      };

      await expectAsync(locals.navigation.navigate('/page').finished).toBeRejected();
      expect(onnavigateerrorThis).toBe(locals.navigation);
    });

    it('binds "this" to NavigationHistoryEntry in ondispose', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry1 = locals.navigation.currentEntry!;
      let ondisposeThis: any;
      entry1.ondispose = function () {
        ondisposeThis = this;
      };

      await locals.navigation.navigate('/page2', {history: 'replace'}).finished;
      expect(ondisposeThis).toBe(entry1);
    });
  });

  describe('navigateEvent cleanup', () => {
    it('clears navigateEvent after unintercepted navigation completes', async () => {
      await locals.navigation.navigate('/page').finished;
      expect((locals.navigation as any).navigateEvent).toBeNull();
    });

    it('clears navigateEvent after unintercepted traversal completes', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;
      await locals.navigation.back().finished;
      expect((locals.navigation as any).navigateEvent).toBeNull();
    });
  });

  describe('post-commit handlers error handling', () => {
    it('handles multiple rejecting post-commit handlers without unhandled rejections', async () => {
      locals.pendingInterceptOptions.push({
        handler: () => {
          throw new Error('first post-commit failure');
        },
      });
      locals.navigation.addEventListener('navigate', (e: Event) => {
        (e as FakeNavigateEvent).intercept({
          handler: () => Promise.reject(new Error('second post-commit failure')),
        });
      });

      await expectAsync(locals.navigation.navigate('/page').finished).toBeRejected();
    });
  });

  describe('FakeNavigation.prototype.dispose()', () => {
    it('cleans up navigation state and event handlers', () => {
      locals.navigation.onnavigate = () => {};
      locals.navigation.oncurrententrychange = () => {};
      locals.navigation.onnavigatesuccess = () => {};
      locals.navigation.onnavigateerror = () => {};

      locals.navigation.dispose();

      expect(locals.navigation.isDisposed()).toBeTrue();
      expect((locals.navigation as any).navigateEvent).toBeNull();
      expect(locals.navigation.transition).toBeNull();
      expect(locals.navigation.onnavigate).toBeNull();
      expect(locals.navigation.oncurrententrychange).toBeNull();
      expect(locals.navigation.onnavigatesuccess).toBeNull();
      expect(locals.navigation.onnavigateerror).toBeNull();
    });

    it('settles the in-flight navigation promises', async () => {
      let releaseHandler!: () => void;
      locals.pendingInterceptOptions.push({
        handler: () => new Promise<void>((resolve) => (releaseHandler = resolve)),
      });
      const result = locals.navigation.navigate('/page');
      await result.committed;

      locals.navigation.dispose();

      // Without this, `finished` would stay pending forever and hang teardown.
      await expectAsync(result.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'AbortError'}),
      );
      releaseHandler();
    });

    it('settles queued traversal promises', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;
      // `back()` queues the traversal behind a timeout, so it is still pending here.
      const traversal = locals.navigation.back();

      locals.navigation.dispose();

      await expectAsync(traversal.committed).toBeRejectedWith(
        jasmine.objectContaining({name: 'AbortError'}),
      );
      await expectAsync(traversal.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'AbortError'}),
      );
    });

    it('does not run a queued traversal after disposal', async () => {
      await locals.navigation.navigate('/page1').finished;
      await locals.navigation.navigate('/page2').finished;
      const urlBeforeDispose = locals.navigation.currentEntry.url;
      const traversal = locals.navigation.back();
      traversal.finished.catch(() => {});

      locals.navigation.dispose();
      // Give the queued timeout a chance to fire.
      await timeout(10);

      expect(locals.navigation.currentEntry.url).toBe(urlBeforeDispose);
      expect(locals.popStateEvents.length).toBe(0);
    });
  });

  describe('navigate() URL validation', () => {
    it('rejects with SyntaxError for an unparseable URL', async () => {
      const result = locals.navigation.navigate('http://:invalid-url');

      await expectAsync(result.committed).toBeRejectedWith(
        jasmine.objectContaining({name: 'SyntaxError'}),
      );
      await expectAsync(result.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'SyntaxError'}),
      );
      expect(locals.navigateEvents.length).toBe(0);
    });

    it('rejects with NotSupportedError for a javascript: URL', async () => {
      const result = locals.navigation.navigate('javascript:alert(1)');

      await expectAsync(result.committed).toBeRejectedWith(
        jasmine.objectContaining({name: 'NotSupportedError'}),
      );
      await expectAsync(result.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'NotSupportedError'}),
      );
      expect(locals.navigateEvents.length).toBe(0);
    });
  });

  describe('reload() state serialization', () => {
    it('rejects with DataCloneError for non-cloneable state', async () => {
      const result = locals.navigation.reload({state: {fn: () => {}}});

      await expectAsync(result.committed).toBeRejectedWith(
        jasmine.objectContaining({name: 'DataCloneError'}),
      );
      await expectAsync(result.finished).toBeRejectedWith(
        jasmine.objectContaining({name: 'DataCloneError'}),
      );
    });

    it('clones state synchronously', async () => {
      const state = {counter: 1};
      const result = locals.navigation.reload({state});
      state.counter = 2;

      await result.finished;
      expect((locals.navigation.currentEntry.getState() as any).counter).toBe(1);
    });
  });

  describe('redirect() history option', () => {
    /** Redirects the next navigation and resolves with the resulting navigationType. */
    const redirectNextNavigation = async (
      from: string,
      options?: Parameters<NavigationPrecommitController['redirect']>[1],
    ) => {
      let navigationTypeAfterRedirect: string | undefined;
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          controller.redirect('/redirected', options);
          navigationTypeAfterRedirect =
            locals.navigateEvents[locals.navigateEvents.length - 1].navigationType;
        },
      });
      await locals.navigation.navigate(from).finished;
      return navigationTypeAfterRedirect;
    };

    it("leaves navigationType unchanged for history: 'auto'", async () => {
      // The spec only reassigns navigationType for 'push' and 'replace'; 'auto' (the WebIDL
      // default) must not turn a push into a replace.
      expect(await redirectNextNavigation('/page', {history: 'auto'})).toBe('push');
      expect(locals.navigation.entries().length).toBe(2);
    });

    it('leaves navigationType unchanged when history is omitted', async () => {
      expect(await redirectNextNavigation('/page')).toBe('push');
      expect(locals.navigation.entries().length).toBe(2);
    });

    it("sets navigationType to 'replace' for history: 'replace'", async () => {
      expect(await redirectNextNavigation('/page', {history: 'replace'})).toBe('replace');
      expect(locals.navigation.entries().length).toBe(1);
    });

    it("keeps navigationType 'push' for history: 'push'", async () => {
      expect(await redirectNextNavigation('/page', {history: 'push'})).toBe('push');
      expect(locals.navigation.entries().length).toBe(2);
    });
  });

  describe('redirect() URL rewrite check', () => {
    /** Runs `redirect(url)` during a navigation and returns the thrown error, if any. */
    const redirectTo = async (url: string) => {
      let caughtError: any = null;
      locals.pendingInterceptOptions.push({
        precommitHandler: (controller) => {
          try {
            controller.redirect(url);
          } catch (e) {
            caughtError = e;
          }
        },
      });
      await locals.navigation.navigate('/page').finished;
      return caughtError;
    };

    it('resolves a relative URL against the current entry', async () => {
      expect(await redirectTo('/redirected?a=1#frag')).toBeNull();
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/redirected?a=1#frag');
    });

    it('allows a same-origin URL with a different path and query', async () => {
      expect(await redirectTo('https://test.com/elsewhere?q=2')).toBeNull();
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/elsewhere?q=2');
    });

    it('throws SecurityError for a different host', async () => {
      expect((await redirectTo('https://evil.com/'))?.name).toBe('SecurityError');
    });

    it('throws SecurityError for a different port', async () => {
      expect((await redirectTo('https://test.com:8443/page'))?.name).toBe('SecurityError');
    });

    it('throws SecurityError for a different scheme', async () => {
      expect((await redirectTo('http://test.com/page'))?.name).toBe('SecurityError');
    });

    it('throws SecurityError for a javascript: URL', async () => {
      expect((await redirectTo('javascript:alert(1)'))?.name).toBe('SecurityError');
    });

    it('throws SecurityError when credentials are added', async () => {
      expect((await redirectTo('https://user:pass@test.com/page'))?.name).toBe('SecurityError');
    });

    it('throws SyntaxError for an unparseable URL', async () => {
      expect((await redirectTo('http://:invalid-url'))?.name).toBe('SyntaxError');
    });
  });

  describe('pushState()/replaceState() validation', () => {
    it('throws DataCloneError synchronously for non-cloneable data', () => {
      expect(() => {
        locals.navigation.pushState({fn: () => {}}, '', '/page');
      }).toThrowMatching((e: any) => e.name === 'DataCloneError');
      expect(() => {
        locals.navigation.replaceState({fn: () => {}}, '', '/page');
      }).toThrowMatching((e: any) => e.name === 'DataCloneError');
      // The failed calls must not have navigated.
      expect(locals.navigateEvents.length).toBe(0);
    });

    it('serializes data before parsing the URL', () => {
      // Both arguments are invalid; the spec serializes first, so DataCloneError wins.
      expect(() => {
        locals.navigation.pushState({fn: () => {}}, '', 'http://:invalid-url');
      }).toThrowMatching((e: any) => e.name === 'DataCloneError');
    });

    it('throws SecurityError for an unparseable URL', () => {
      expect(() => {
        locals.navigation.pushState(null, '', 'http://:invalid-url');
      }).toThrowMatching((e: any) => e.name === 'SecurityError');
    });

    it('throws SecurityError for a cross-origin URL', () => {
      expect(() => {
        locals.navigation.pushState(null, '', 'https://evil.com/');
      }).toThrowMatching((e: any) => e.name === 'SecurityError');
      expect(() => {
        locals.navigation.replaceState(null, '', 'https://evil.com/');
      }).toThrowMatching((e: any) => e.name === 'SecurityError');
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/');
    });

    it('allows a same-origin URL with a different path', () => {
      locals.navigation.pushState({a: 1}, '', '/elsewhere');
      expect(locals.navigation.currentEntry.url).toBe('https://test.com/elsewhere');
    });

    it('clones data synchronously', () => {
      const data = {counter: 1};
      locals.navigation.pushState(data, '', '/page');
      data.counter = 2;
      expect((locals.navigation.currentEntry.getHistoryState() as any).counter).toBe(1);
    });
  });

  describe('history.state identity', () => {
    it('returns the same object from repeated getHistoryState() reads', () => {
      locals.navigation.pushState({a: 1}, '', '/page');
      const entry = locals.navigation.currentEntry;

      // `history.state` is deserialized once per navigation, so its identity is stable.
      expect(entry.getHistoryState()).toBe(entry.getHistoryState());
    });

    it('gives popstate the same state object as the current entry', async () => {
      locals.navigation.pushState({a: 1}, '', '/page1');
      locals.navigation.pushState({b: 2}, '', '/page2');
      locals.popStateEvents.length = 0;

      await locals.navigation.back().finished;

      expect(locals.popStateEvents.length).toBe(1);
      expect(locals.popStateEvents[0].state).toBe(locals.navigation.currentEntry.getHistoryState());
      expect(locals.popStateEvents[0].state).toEqual({a: 1});
    });

    it('still returns a fresh object from repeated getState() reads', async () => {
      await locals.navigation.navigate('/page', {state: {a: 1}}).finished;
      const entry = locals.navigation.currentEntry;

      // Unlike `history.state`, `getState()` is defined as a StructuredDeserialize per call.
      expect(entry.getState()).not.toBe(entry.getState());
      expect(entry.getState()).toEqual({a: 1});
    });
  });

  describe('setInitialEntryForTesting()', () => {
    it('clones the provided state', () => {
      const navigation = new FakeNavigation(document, 'https://test.com');
      const historyState = {a: 1};
      const state = {b: 2};

      navigation.setInitialEntryForTesting('https://test.com', {historyState, state});
      historyState.a = 99;
      state.b = 99;

      expect(navigation.currentEntry.getHistoryState()).toEqual({a: 1});
      expect(navigation.currentEntry.getState()).toEqual({b: 2});
      navigation.dispose();
    });

    it('throws DataCloneError for non-cloneable state', () => {
      const navigation = new FakeNavigation(document, 'https://test.com');
      expect(() => {
        navigation.setInitialEntryForTesting('https://test.com', {
          historyState: null,
          state: {fn: () => {}},
        });
      }).toThrowMatching((e: any) => e.name === 'DataCloneError');
      navigation.dispose();
    });
  });

  describe('IDL event handler attributes', () => {
    it('returns the assigned handler from the getter', () => {
      const handler = () => {};
      locals.navigation.onnavigate = handler;
      expect(locals.navigation.onnavigate).toBe(handler);

      locals.navigation.onnavigate = null;
      expect(locals.navigation.onnavigate).toBeNull();
    });

    it('replaces the previous handler rather than adding a second one', async () => {
      let firstCalls = 0;
      let secondCalls = 0;
      locals.navigation.onnavigate = () => firstCalls++;
      locals.navigation.onnavigate = () => secondCalls++;

      await locals.navigation.navigate('/page').finished;

      expect(firstCalls).toBe(0);
      expect(secondCalls).toBe(1);
    });

    it('removes the listener when set to null', async () => {
      let calls = 0;
      locals.navigation.onnavigate = () => calls++;
      locals.navigation.onnavigate = null;

      await locals.navigation.navigate('/page').finished;

      expect(calls).toBe(0);
    });

    it('does not affect listeners added with addEventListener', async () => {
      let attributeCalls = 0;
      let listenerCalls = 0;
      locals.navigation.addEventListener('navigate', () => listenerCalls++);
      locals.navigation.onnavigate = () => attributeCalls++;
      locals.navigation.onnavigate = null;

      await locals.navigation.navigate('/page').finished;

      expect(attributeCalls).toBe(0);
      expect(listenerCalls).toBe(1);
    });
  });

  describe('FakeNavigationHistoryEntry disposal', () => {
    it('releases listeners registered before disposal', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry = locals.navigation.currentEntry;
      let disposeCalls = 0;
      entry.addEventListener('dispose', () => disposeCalls++);

      await locals.navigation.navigate('/page2', {history: 'replace'}).finished;
      expect(disposeCalls).toBe(1);

      // The listener was released, so a second dispatch must not reach it.
      entry.dispatchEvent(new Event('dispose'));
      expect(disposeCalls).toBe(1);
    });

    it('can still dispatch events after disposal', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry = locals.navigation.currentEntry;

      await locals.navigation.navigate('/page2', {history: 'replace'}).finished;

      // The replacement EventTarget must be built the same way as the original, otherwise
      // dispatching a document-created Event throws in Domino based environments.
      expect(() => entry.dispatchEvent(new Event('dispose'))).not.toThrow();
      let calls = 0;
      entry.addEventListener('dispose', () => calls++);
      entry.dispatchEvent(new Event('dispose'));
      expect(calls).toBe(1);
    });

    it('keeps ondispose readable after disposal', async () => {
      await locals.navigation.navigate('/page1').finished;
      const entry = locals.navigation.currentEntry;
      const handler = () => {};
      entry.ondispose = handler;

      await locals.navigation.navigate('/page2', {history: 'replace'}).finished;

      // A browser does not reset the IDL attribute when the entry is disposed.
      expect(entry.ondispose).toBe(handler);
      expect(() => (entry.ondispose = null)).not.toThrow();
    });
  });
});
