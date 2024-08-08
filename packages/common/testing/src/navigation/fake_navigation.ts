/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  NavigateEvent,
  Navigation,
  NavigationCurrentEntryChangeEvent,
  NavigationDestination,
  NavigationHistoryEntry,
  NavigationInterceptOptions,
  NavigationNavigateOptions,
  NavigationOptions,
  NavigationReloadOptions,
  NavigationResult,
  NavigationTransition,
  NavigationTypeString,
  NavigationUpdateCurrentEntryOptions,
} from './navigation_types';

/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
export class FakeNavigation implements Navigation {
  /**
   * The fake implementation of an entries array. Only same-document entries
   * allowed.
   */
  private readonly entriesArr: FakeNavigationHistoryEntry[] = [];

  /**
   * The current active entry index into `entriesArr`.
   */
  private currentEntryIndex = 0;

  /**
   * The current navigate event.
   */
  private navigateEvent: InternalFakeNavigateEvent | undefined = undefined;

  /**
   * A Map of pending traversals, so that traversals to the same entry can be
   * re-used.
   */
  private readonly traversalQueue = new Map<string, InternalNavigationResult>();

  /**
   * A Promise that resolves when the previous traversals have finished. Used to
   * simulate the cross-process communication necessary for traversals.
   */
  private nextTraversal = Promise.resolve();

  /**
   * A prospective current active entry index, which includes unresolved
   * traversals. Used by `go` to determine where navigations are intended to go.
   */
  private prospectiveEntryIndex = 0;

  /**
   * A test-only option to make traversals synchronous, rather than emulate
   * cross-process communication.
   */
  private synchronousTraversals = false;

  /** Whether to allow a call to setInitialEntryForTesting. */
  private canSetInitialEntry = true;

  /** `EventTarget` to dispatch events. */
  private eventTarget: EventTarget;

  /** The next unique id for created entries. Replace recreates this id. */
  private nextId = 0;

  /** The next unique key for created entries. Replace inherits this id. */
  private nextKey = 0;

  /** Whether this fake is disposed. */
  private disposed = false;

  /** Equivalent to `navigation.currentEntry`. */
  get currentEntry(): FakeNavigationHistoryEntry {
    return this.entriesArr[this.currentEntryIndex];
  }

  get canGoBack(): boolean {
    return this.currentEntryIndex > 0;
  }

  get canGoForward(): boolean {
    return this.currentEntryIndex < this.entriesArr.length - 1;
  }

  constructor(
    private readonly window: Window,
    startURL: `http${string}`,
  ) {
    this.eventTarget = this.window.document.createElement('div');
    // First entry.
    this.setInitialEntryForTesting(startURL);
  }

  /**
   * Sets the initial entry.
   */
  private setInitialEntryForTesting(
    url: `http${string}`,
    options: {historyState: unknown; state?: unknown} = {historyState: null},
  ) {
    if (!this.canSetInitialEntry) {
      throw new Error(
        'setInitialEntryForTesting can only be called before any ' + 'navigation has occurred',
      );
    }
    const currentInitialEntry = this.entriesArr[0];
    this.entriesArr[0] = new FakeNavigationHistoryEntry(new URL(url).toString(), {
      index: 0,
      key: currentInitialEntry?.key ?? String(this.nextKey++),
      id: currentInitialEntry?.id ?? String(this.nextId++),
      sameDocument: true,
      historyState: options?.historyState,
      state: options.state,
    });
  }

  /** Returns whether the initial entry is still eligible to be set. */
  canSetInitialEntryForTesting(): boolean {
    return this.canSetInitialEntry;
  }

  /**
   * Sets whether to emulate traversals as synchronous rather than
   * asynchronous.
   */
  setSynchronousTraversalsForTesting(synchronousTraversals: boolean) {
    this.synchronousTraversals = synchronousTraversals;
  }

  /** Equivalent to `navigation.entries()`. */
  entries(): FakeNavigationHistoryEntry[] {
    return this.entriesArr.slice();
  }

  /** Equivalent to `navigation.navigate()`. */
  navigate(url: string, options?: NavigationNavigateOptions): FakeNavigationResult {
    const fromUrl = new URL(this.currentEntry.url!);
    const toUrl = new URL(url, this.currentEntry.url!);

    let navigationType: NavigationTypeString;
    if (!options?.history || options.history === 'auto') {
      // Auto defaults to push, but if the URLs are the same, is a replace.
      if (fromUrl.toString() === toUrl.toString()) {
        navigationType = 'replace';
      } else {
        navigationType = 'push';
      }
    } else {
      navigationType = options.history;
    }

    const hashChange = isHashChange(fromUrl, toUrl);

    const destination = new FakeNavigationDestination({
      url: toUrl.toString(),
      state: options?.state,
      sameDocument: hashChange,
      historyState: null,
    });
    const result = new InternalNavigationResult();

    this.userAgentNavigate(destination, result, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for navigate().
      userInitiated: false,
      hashChange,
      info: options?.info,
    });

    return {
      committed: result.committed,
      finished: result.finished,
    };
  }

  /** Equivalent to `history.pushState()`. */
  pushState(data: unknown, title: string, url?: string): void {
    this.pushOrReplaceState('push', data, title, url);
  }

  /** Equivalent to `history.replaceState()`. */
  replaceState(data: unknown, title: string, url?: string): void {
    this.pushOrReplaceState('replace', data, title, url);
  }

  private pushOrReplaceState(
    navigationType: NavigationTypeString,
    data: unknown,
    _title: string,
    url?: string,
  ): void {
    const fromUrl = new URL(this.currentEntry.url!);
    const toUrl = url ? new URL(url, this.currentEntry.url!) : fromUrl;

    const hashChange = isHashChange(fromUrl, toUrl);

    const destination = new FakeNavigationDestination({
      url: toUrl.toString(),
      sameDocument: true,
      historyState: data,
    });
    const result = new InternalNavigationResult();

    this.userAgentNavigate(destination, result, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for pushState() or replaceState().
      userInitiated: false,
      hashChange,
      skipPopState: true,
    });
  }

  /** Equivalent to `navigation.traverseTo()`. */
  traverseTo(key: string, options?: NavigationOptions): FakeNavigationResult {
    const fromUrl = new URL(this.currentEntry.url!);
    const entry = this.findEntry(key);
    if (!entry) {
      const domException = new DOMException('Invalid key', 'InvalidStateError');
      const committed = Promise.reject(domException);
      const finished = Promise.reject(domException);
      committed.catch(() => {});
      finished.catch(() => {});
      return {
        committed,
        finished,
      };
    }
    if (entry === this.currentEntry) {
      return {
        committed: Promise.resolve(this.currentEntry),
        finished: Promise.resolve(this.currentEntry),
      };
    }
    if (this.traversalQueue.has(entry.key)) {
      const existingResult = this.traversalQueue.get(entry.key)!;
      return {
        committed: existingResult.committed,
        finished: existingResult.finished,
      };
    }

    const hashChange = isHashChange(fromUrl, new URL(entry.url!, this.currentEntry.url!));
    const destination = new FakeNavigationDestination({
      url: entry.url!,
      state: entry.getState(),
      historyState: entry.getHistoryState(),
      key: entry.key,
      id: entry.id,
      index: entry.index,
      sameDocument: entry.sameDocument,
    });
    this.prospectiveEntryIndex = entry.index;
    const result = new InternalNavigationResult();
    this.traversalQueue.set(entry.key, result);
    this.runTraversal(() => {
      this.traversalQueue.delete(entry.key);
      this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for traverseTo().
        userInitiated: false,
        hashChange,
        info: options?.info,
      });
    });
    return {
      committed: result.committed,
      finished: result.finished,
    };
  }

  /** Equivalent to `navigation.back()`. */
  back(options?: NavigationOptions): FakeNavigationResult {
    if (this.currentEntryIndex === 0) {
      const domException = new DOMException('Cannot go back', 'InvalidStateError');
      const committed = Promise.reject(domException);
      const finished = Promise.reject(domException);
      committed.catch(() => {});
      finished.catch(() => {});
      return {
        committed,
        finished,
      };
    }
    const entry = this.entriesArr[this.currentEntryIndex - 1];
    return this.traverseTo(entry.key, options);
  }

  /** Equivalent to `navigation.forward()`. */
  forward(options?: NavigationOptions): FakeNavigationResult {
    if (this.currentEntryIndex === this.entriesArr.length - 1) {
      const domException = new DOMException('Cannot go forward', 'InvalidStateError');
      const committed = Promise.reject(domException);
      const finished = Promise.reject(domException);
      committed.catch(() => {});
      finished.catch(() => {});
      return {
        committed,
        finished,
      };
    }
    const entry = this.entriesArr[this.currentEntryIndex + 1];
    return this.traverseTo(entry.key, options);
  }

  /**
   * Equivalent to `history.go()`.
   * Note that this method does not actually work precisely to how Chrome
   * does, instead choosing a simpler model with less unexpected behavior.
   * Chrome has a few edge case optimizations, for instance with repeated
   * `back(); forward()` chains it collapses certain traversals.
   */
  go(direction: number): void {
    const targetIndex = this.prospectiveEntryIndex + direction;
    if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
      return;
    }
    this.prospectiveEntryIndex = targetIndex;
    this.runTraversal(() => {
      // Check again that destination is in the entries array.
      if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
        return;
      }
      const fromUrl = new URL(this.currentEntry.url!);
      const entry = this.entriesArr[targetIndex];
      const hashChange = isHashChange(fromUrl, new URL(entry.url!, this.currentEntry.url!));
      const destination = new FakeNavigationDestination({
        url: entry.url!,
        state: entry.getState(),
        historyState: entry.getHistoryState(),
        key: entry.key,
        id: entry.id,
        index: entry.index,
        sameDocument: entry.sameDocument,
      });
      const result = new InternalNavigationResult();
      this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for go().
        userInitiated: false,
        hashChange,
      });
    });
  }

  /** Runs a traversal synchronously or asynchronously */
  private runTraversal(traversal: () => void) {
    if (this.synchronousTraversals) {
      traversal();
      return;
    }

    // Each traversal occupies a single timeout resolution.
    // This means that Promises added to commit and finish should resolve
    // before the next traversal.
    this.nextTraversal = this.nextTraversal.then(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
          traversal();
        });
      });
    });
  }

  /** Equivalent to `navigation.addEventListener()`. */
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ) {
    this.eventTarget.addEventListener(type, callback, options);
  }

  /** Equivalent to `navigation.removeEventListener()`. */
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean,
  ) {
    this.eventTarget.removeEventListener(type, callback, options);
  }

  /** Equivalent to `navigation.dispatchEvent()` */
  dispatchEvent(event: Event): boolean {
    return this.eventTarget.dispatchEvent(event);
  }

  /** Cleans up resources. */
  dispose() {
    // Recreate eventTarget to release current listeners.
    // `document.createElement` because NodeJS `EventTarget` is incompatible with Domino's `Event`.
    this.eventTarget = this.window.document.createElement('div');
    this.disposed = true;
  }

  /** Returns whether this fake is disposed. */
  isDisposed() {
    return this.disposed;
  }

  /** Implementation for all navigations and traversals. */
  private userAgentNavigate(
    destination: FakeNavigationDestination,
    result: InternalNavigationResult,
    options: InternalNavigateOptions,
  ) {
    // The first navigation should disallow any future calls to set the initial
    // entry.
    this.canSetInitialEntry = false;
    if (this.navigateEvent) {
      this.navigateEvent.cancel(new DOMException('Navigation was aborted', 'AbortError'));
      this.navigateEvent = undefined;
    }

    const navigateEvent = createFakeNavigateEvent({
      navigationType: options.navigationType,
      cancelable: options.cancelable,
      canIntercept: options.canIntercept,
      userInitiated: options.userInitiated,
      hashChange: options.hashChange,
      signal: result.signal,
      destination,
      info: options.info,
      sameDocument: destination.sameDocument,
      skipPopState: options.skipPopState,
      result,
      userAgentCommit: () => {
        this.userAgentCommit();
      },
    });

    this.navigateEvent = navigateEvent;
    this.eventTarget.dispatchEvent(navigateEvent);
    navigateEvent.dispatchedNavigateEvent();
    if (navigateEvent.commitOption === 'immediate') {
      navigateEvent.commit(/* internal= */ true);
    }
  }

  /** Implementation to commit a navigation. */
  private userAgentCommit() {
    if (!this.navigateEvent) {
      return;
    }
    const from = this.currentEntry;
    if (!this.navigateEvent.sameDocument) {
      const error = new Error('Cannot navigate to a non-same-document URL.');
      this.navigateEvent.cancel(error);
      throw error;
    }
    if (
      this.navigateEvent.navigationType === 'push' ||
      this.navigateEvent.navigationType === 'replace'
    ) {
      this.userAgentPushOrReplace(this.navigateEvent.destination, {
        navigationType: this.navigateEvent.navigationType,
      });
    } else if (this.navigateEvent.navigationType === 'traverse') {
      this.userAgentTraverse(this.navigateEvent.destination);
    }
    this.navigateEvent.userAgentNavigated(this.currentEntry);
    const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({
      from,
      navigationType: this.navigateEvent.navigationType,
    });
    this.eventTarget.dispatchEvent(currentEntryChangeEvent);
    if (!this.navigateEvent.skipPopState) {
      const popStateEvent = createPopStateEvent({
        state: this.navigateEvent.destination.getHistoryState(),
      });
      this.window.dispatchEvent(popStateEvent);
    }
  }

  /** Implementation for a push or replace navigation. */
  private userAgentPushOrReplace(
    destination: FakeNavigationDestination,
    {navigationType}: {navigationType: NavigationTypeString},
  ) {
    if (navigationType === 'push') {
      this.currentEntryIndex++;
      this.prospectiveEntryIndex = this.currentEntryIndex;
    }
    const index = this.currentEntryIndex;
    const key = navigationType === 'push' ? String(this.nextKey++) : this.currentEntry.key;
    const entry = new FakeNavigationHistoryEntry(destination.url, {
      id: String(this.nextId++),
      key,
      index,
      sameDocument: true,
      state: destination.getState(),
      historyState: destination.getHistoryState(),
    });
    if (navigationType === 'push') {
      this.entriesArr.splice(index, Infinity, entry);
    } else {
      this.entriesArr[index] = entry;
    }
  }

  /** Implementation for a traverse navigation. */
  private userAgentTraverse(destination: FakeNavigationDestination) {
    this.currentEntryIndex = destination.index;
  }

  /** Utility method for finding entries with the given `key`. */
  private findEntry(key: string) {
    for (const entry of this.entriesArr) {
      if (entry.key === key) return entry;
    }
    return undefined;
  }

  set onnavigate(_handler: ((this: Navigation, ev: NavigateEvent) => any) | null) {
    throw new Error('unimplemented');
  }

  get onnavigate(): ((this: Navigation, ev: NavigateEvent) => any) | null {
    throw new Error('unimplemented');
  }

  set oncurrententrychange(
    _handler: ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null,
  ) {
    throw new Error('unimplemented');
  }

  get oncurrententrychange():
    | ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any)
    | null {
    throw new Error('unimplemented');
  }

  set onnavigatesuccess(_handler: ((this: Navigation, ev: Event) => any) | null) {
    throw new Error('unimplemented');
  }

  get onnavigatesuccess(): ((this: Navigation, ev: Event) => any) | null {
    throw new Error('unimplemented');
  }

  set onnavigateerror(_handler: ((this: Navigation, ev: ErrorEvent) => any) | null) {
    throw new Error('unimplemented');
  }

  get onnavigateerror(): ((this: Navigation, ev: ErrorEvent) => any) | null {
    throw new Error('unimplemented');
  }

  get transition(): NavigationTransition | null {
    throw new Error('unimplemented');
  }

  updateCurrentEntry(_options: NavigationUpdateCurrentEntryOptions): void {
    throw new Error('unimplemented');
  }

  reload(_options?: NavigationReloadOptions): NavigationResult {
    throw new Error('unimplemented');
  }
}

/**
 * Fake equivalent of the `NavigationResult` interface with
 * `FakeNavigationHistoryEntry`.
 */
interface FakeNavigationResult extends NavigationResult {
  readonly committed: Promise<FakeNavigationHistoryEntry>;
  readonly finished: Promise<FakeNavigationHistoryEntry>;
}

/**
 * Fake equivalent of `NavigationHistoryEntry`.
 */
export class FakeNavigationHistoryEntry implements NavigationHistoryEntry {
  readonly sameDocument;

  readonly id: string;
  readonly key: string;
  readonly index: number;
  private readonly state: unknown;
  private readonly historyState: unknown;

  // tslint:disable-next-line:no-any
  ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null = null;

  constructor(
    readonly url: string | null,
    {
      id,
      key,
      index,
      sameDocument,
      state,
      historyState,
    }: {
      id: string;
      key: string;
      index: number;
      sameDocument: boolean;
      historyState: unknown;
      state?: unknown;
    },
  ) {
    this.id = id;
    this.key = key;
    this.index = index;
    this.sameDocument = sameDocument;
    this.state = state;
    this.historyState = historyState;
  }

  getState(): unknown {
    // Budget copy.
    return this.state ? JSON.parse(JSON.stringify(this.state)) : this.state;
  }

  getHistoryState(): unknown {
    // Budget copy.
    return this.historyState ? JSON.parse(JSON.stringify(this.historyState)) : this.historyState;
  }

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ) {
    throw new Error('unimplemented');
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean,
  ) {
    throw new Error('unimplemented');
  }

  dispatchEvent(event: Event): boolean {
    throw new Error('unimplemented');
  }
}

/** `NavigationInterceptOptions` with experimental commit option. */
export interface ExperimentalNavigationInterceptOptions extends NavigationInterceptOptions {
  commit?: 'immediate' | 'after-transition';
}

/** `NavigateEvent` with experimental commit function. */
export interface ExperimentalNavigateEvent extends NavigateEvent {
  intercept(options?: ExperimentalNavigationInterceptOptions): void;

  commit(): void;
}

/**
 * Fake equivalent of `NavigateEvent`.
 */
export interface FakeNavigateEvent extends ExperimentalNavigateEvent {
  readonly destination: FakeNavigationDestination;
}

interface InternalFakeNavigateEvent extends FakeNavigateEvent {
  readonly sameDocument: boolean;
  readonly skipPopState?: boolean;
  readonly commitOption: 'after-transition' | 'immediate';
  readonly result: InternalNavigationResult;

  commit(internal?: boolean): void;
  cancel(reason: Error): void;
  dispatchedNavigateEvent(): void;
  userAgentNavigated(entry: FakeNavigationHistoryEntry): void;
}

/**
 * Create a fake equivalent of `NavigateEvent`. This is not a class because ES5
 * transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigateEvent({
  cancelable,
  canIntercept,
  userInitiated,
  hashChange,
  navigationType,
  signal,
  destination,
  info,
  sameDocument,
  skipPopState,
  result,
  userAgentCommit,
}: {
  cancelable: boolean;
  canIntercept: boolean;
  userInitiated: boolean;
  hashChange: boolean;
  navigationType: NavigationTypeString;
  signal: AbortSignal;
  destination: FakeNavigationDestination;
  info: unknown;
  sameDocument: boolean;
  skipPopState?: boolean;
  result: InternalNavigationResult;
  userAgentCommit: () => void;
}) {
  const event = new Event('navigate', {bubbles: false, cancelable}) as {
    -readonly [P in keyof InternalFakeNavigateEvent]: InternalFakeNavigateEvent[P];
  };
  event.canIntercept = canIntercept;
  event.userInitiated = userInitiated;
  event.hashChange = hashChange;
  event.navigationType = navigationType;
  event.signal = signal;
  event.destination = destination;
  event.info = info;
  event.downloadRequest = null;
  event.formData = null;

  event.sameDocument = sameDocument;
  event.skipPopState = skipPopState;
  event.commitOption = 'immediate';

  let handlerFinished: Promise<void> | undefined = undefined;
  let interceptCalled = false;
  let dispatchedNavigateEvent = false;
  let commitCalled = false;

  event.intercept = function (
    this: InternalFakeNavigateEvent,
    options?: ExperimentalNavigationInterceptOptions,
  ): void {
    interceptCalled = true;
    event.sameDocument = true;
    const handler = options?.handler;
    if (handler) {
      handlerFinished = handler();
    }
    if (options?.commit) {
      event.commitOption = options.commit;
    }
    if (options?.focusReset !== undefined || options?.scroll !== undefined) {
      throw new Error('unimplemented');
    }
  };

  event.scroll = function (this: InternalFakeNavigateEvent): void {
    throw new Error('unimplemented');
  };

  event.commit = function (this: InternalFakeNavigateEvent, internal = false) {
    if (!internal && !interceptCalled) {
      throw new DOMException(
        `Failed to execute 'commit' on 'NavigateEvent': intercept() must be ` +
          `called before commit().`,
        'InvalidStateError',
      );
    }
    if (!dispatchedNavigateEvent) {
      throw new DOMException(
        `Failed to execute 'commit' on 'NavigateEvent': commit() may not be ` +
          `called during event dispatch.`,
        'InvalidStateError',
      );
    }
    if (commitCalled) {
      throw new DOMException(
        `Failed to execute 'commit' on 'NavigateEvent': commit() already ` + `called.`,
        'InvalidStateError',
      );
    }
    commitCalled = true;

    userAgentCommit();
  };

  // Internal only.
  event.cancel = function (this: InternalFakeNavigateEvent, reason: Error) {
    result.committedReject(reason);
    result.finishedReject(reason);
  };

  // Internal only.
  event.dispatchedNavigateEvent = function (this: InternalFakeNavigateEvent) {
    dispatchedNavigateEvent = true;
    if (event.commitOption === 'after-transition') {
      // If handler finishes before commit, call commit.
      handlerFinished?.then(
        () => {
          if (!commitCalled) {
            event.commit(/* internal */ true);
          }
        },
        () => {},
      );
    }
    Promise.all([result.committed, handlerFinished]).then(
      ([entry]) => {
        result.finishedResolve(entry);
      },
      (reason) => {
        result.finishedReject(reason);
      },
    );
  };

  // Internal only.
  event.userAgentNavigated = function (
    this: InternalFakeNavigateEvent,
    entry: FakeNavigationHistoryEntry,
  ) {
    result.committedResolve(entry);
  };

  return event as InternalFakeNavigateEvent;
}

/** Fake equivalent of `NavigationCurrentEntryChangeEvent`. */
export interface FakeNavigationCurrentEntryChangeEvent extends NavigationCurrentEntryChangeEvent {
  readonly from: FakeNavigationHistoryEntry;
}

/**
 * Create a fake equivalent of `NavigationCurrentEntryChange`. This does not use
 * a class because ES5 transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigationCurrentEntryChangeEvent({
  from,
  navigationType,
}: {
  from: FakeNavigationHistoryEntry;
  navigationType: NavigationTypeString;
}) {
  const event = new Event('currententrychange', {
    bubbles: false,
    cancelable: false,
  }) as {
    -readonly [P in keyof NavigationCurrentEntryChangeEvent]: NavigationCurrentEntryChangeEvent[P];
  };
  event.from = from;
  event.navigationType = navigationType;
  return event as FakeNavigationCurrentEntryChangeEvent;
}

/**
 * Create a fake equivalent of `PopStateEvent`. This does not use a class
 * because ES5 transpiled JavaScript cannot extend native Event.
 */
function createPopStateEvent({state}: {state: unknown}) {
  const event = new Event('popstate', {
    bubbles: false,
    cancelable: false,
  }) as {-readonly [P in keyof PopStateEvent]: PopStateEvent[P]};
  event.state = state;
  return event as PopStateEvent;
}

/**
 * Fake equivalent of `NavigationDestination`.
 */
export class FakeNavigationDestination implements NavigationDestination {
  readonly url: string;
  readonly sameDocument: boolean;
  readonly key: string | null;
  readonly id: string | null;
  readonly index: number;

  private readonly state?: unknown;
  private readonly historyState: unknown;

  constructor({
    url,
    sameDocument,
    historyState,
    state,
    key = null,
    id = null,
    index = -1,
  }: {
    url: string;
    sameDocument: boolean;
    historyState: unknown;
    state?: unknown;
    key?: string | null;
    id?: string | null;
    index?: number;
  }) {
    this.url = url;
    this.sameDocument = sameDocument;
    this.state = state;
    this.historyState = historyState;
    this.key = key;
    this.id = id;
    this.index = index;
  }

  getState(): unknown {
    return this.state;
  }

  getHistoryState(): unknown {
    return this.historyState;
  }
}

/** Utility function to determine whether two UrlLike have the same hash. */
function isHashChange(from: URL, to: URL): boolean {
  return (
    to.hash !== from.hash &&
    to.hostname === from.hostname &&
    to.pathname === from.pathname &&
    to.search === from.search
  );
}

/** Internal utility class for representing the result of a navigation.  */
class InternalNavigationResult {
  committedResolve!: (entry: FakeNavigationHistoryEntry) => void;
  committedReject!: (reason: Error) => void;
  finishedResolve!: (entry: FakeNavigationHistoryEntry) => void;
  finishedReject!: (reason: Error) => void;
  readonly committed: Promise<FakeNavigationHistoryEntry>;
  readonly finished: Promise<FakeNavigationHistoryEntry>;
  get signal(): AbortSignal {
    return this.abortController.signal;
  }
  private readonly abortController = new AbortController();

  constructor() {
    this.committed = new Promise<FakeNavigationHistoryEntry>((resolve, reject) => {
      this.committedResolve = resolve;
      this.committedReject = reject;
    });

    this.finished = new Promise<FakeNavigationHistoryEntry>(async (resolve, reject) => {
      this.finishedResolve = resolve;
      this.finishedReject = (reason: Error) => {
        reject(reason);
        this.abortController.abort(reason);
      };
    });
    // All rejections are handled.
    this.committed.catch(() => {});
    this.finished.catch(() => {});
  }
}

/** Internal options for performing a navigate. */
interface InternalNavigateOptions {
  navigationType: NavigationTypeString;
  cancelable: boolean;
  canIntercept: boolean;
  userInitiated: boolean;
  hashChange: boolean;
  info?: unknown;
  skipPopState?: boolean;
}
