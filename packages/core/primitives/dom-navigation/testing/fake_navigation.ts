/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  NavigationNavigateOptions,
  NavigationTypeString,
  NavigationOptions,
  NavigateEvent,
  NavigationCurrentEntryChangeEvent,
  NavigationTransition,
  NavigationUpdateCurrentEntryOptions,
  NavigationReloadOptions,
  NavigationResult,
  NavigationHistoryEntry,
  NavigationInterceptOptions,
  NavigationDestination,
  Navigation,
} from '../src/navigation_types';

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
   * @internal
   */
  navigateEvent: InternalFakeNavigateEvent | null = null;

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

  /**
   * `EventTarget` to dispatch events.
   * @internal
   */
  eventTarget: EventTarget;

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
  setInitialEntryForTesting(
    url: `http${string}`,
    options: {historyState: unknown; state?: unknown} = {historyState: null},
  ): void {
    if (!this.canSetInitialEntry) {
      throw new Error(
        'setInitialEntryForTesting can only be called before any ' + 'navigation has occurred',
      );
    }
    const currentInitialEntry = this.entriesArr[0];
    this.entriesArr[0] = new FakeNavigationHistoryEntry(
      this.window.document.createElement('div'),
      new URL(url).toString(),
      {
        index: 0,
        key: currentInitialEntry?.key ?? String(this.nextKey++),
        id: currentInitialEntry?.id ?? String(this.nextId++),
        sameDocument: true,
        historyState: options?.historyState,
        state: options.state,
      },
    );
  }

  /** Returns whether the initial entry is still eligible to be set. */
  canSetInitialEntryForTesting(): boolean {
    return this.canSetInitialEntry;
  }

  /**
   * Sets whether to emulate traversals as synchronous rather than
   * asynchronous.
   */
  setSynchronousTraversalsForTesting(synchronousTraversals: boolean): void {
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
    const result = new InternalNavigationResult(this);

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
    const result = new InternalNavigationResult(this);

    this.userAgentNavigate(destination, result, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for pushState() or replaceState().
      userInitiated: false,
      hashChange,
      triggeredByHistoryApi: true,
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
    const result = new InternalNavigationResult(this);
    this.traversalQueue.set(entry.key, result);
    this.runTraversal(() => {
      this.traversalQueue.delete(entry.key);
      const event = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for traverseTo().
        userInitiated: false,
        hashChange,
        info: options?.info,
      });
      // Note this does not pay attention at all to the commit status of the event (and thus, does not support deferred commit for traversals)
      this.userAgentTraverse(event);
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
      const result = new InternalNavigationResult(this);
      const event = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for go().
        userInitiated: false,
        hashChange,
      });
      // Note this does not pay attention at all to the commit status of the event (and thus, does not support deferred commit for traversals)
      this.userAgentTraverse(event);
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
  ): void {
    this.eventTarget.addEventListener(type, callback, options);
  }

  /** Equivalent to `navigation.removeEventListener()`. */
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean,
  ): void {
    this.eventTarget.removeEventListener(type, callback, options);
  }

  /** Equivalent to `navigation.dispatchEvent()` */
  dispatchEvent(event: Event): boolean {
    return this.eventTarget.dispatchEvent(event);
  }

  /** Cleans up resources. */
  dispose(): void {
    // Recreate eventTarget to release current listeners.
    // `document.createElement` because NodeJS `EventTarget` is incompatible with Domino's `Event`.
    this.eventTarget = this.window.document.createElement('div');
    this.disposed = true;
  }

  /** Returns whether this fake is disposed. */
  isDisposed(): boolean {
    return this.disposed;
  }

  /** Implementation for all navigations and traversals. */
  private userAgentNavigate(
    destination: FakeNavigationDestination,
    result: InternalNavigationResult,
    options: InternalNavigateOptions,
  ): InternalFakeNavigateEvent {
    // The first navigation should disallow any future calls to set the initial
    // entry.
    this.canSetInitialEntry = false;
    if (this.navigateEvent) {
      this.navigateEvent.cancel(new DOMException('Navigation was aborted', 'AbortError'));
      this.navigateEvent = null;
    }

    return dispatchNavigateEvent({
      navigationType: options.navigationType,
      cancelable: options.cancelable,
      canIntercept: options.canIntercept,
      userInitiated: options.userInitiated,
      hashChange: options.hashChange,
      signal: result.signal,
      destination,
      info: options.info,
      sameDocument: destination.sameDocument,
      triggeredByHistoryApi: options.triggeredByHistoryApi,
      result,
    });
  }

  /**
   * Implementation to commit a navigation.
   * https://whatpr.org/html/10919/nav-history-apis.html#navigateevent-commit
   * @internal
   */
  commitNavigateEvent(navigateEvent: InternalFakeNavigateEvent) {
    navigateEvent.interceptionState = 'committed';
    const from = this.currentEntry;
    if (!from) {
      throw new Error('cannot commit navigation when current entry is null');
    }
    if (!navigateEvent.sameDocument) {
      const error = new Error('Cannot navigate to a non-same-document URL.');
      navigateEvent.cancel(error);
      throw error;
    }
    // "If navigationType is "push" or "replace", then run the URL and history update steps given document and event's destination's URL, with serialiedData set to event's classic history API state and historyHandling set to navigationType."
    if (navigateEvent.navigationType === 'push' || navigateEvent.navigationType === 'replace') {
      // TODO(atscott): The spec doesn't have this branch and only does urlAndHistoryUpdateSteps
      // but I cannot find where popstate
      if (navigateEvent.triggeredByHistoryApi) {
        this.urlAndHistoryUpdateSteps(navigateEvent);
      } else {
        this.updateDocumentForHistoryStepApplication(navigateEvent);
      }
    } else if (navigateEvent.navigationType === 'reload') {
      this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
    } else if (navigateEvent.navigationType === 'traverse') {
      // "If navigationType is "traverse", then this event firing is happening as part of the traversal process, and that process will take care of performing the appropriate session history entry updates."
    }
  }

  /**
   * https://html.spec.whatwg.org/multipage/browsing-the-web.html#update-document-for-history-step-application
   * @param navigateEvent
   */
  private updateDocumentForHistoryStepApplication(navigateEvent: InternalFakeNavigateEvent) {
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
    // Happens as part of "updating the document" steps https://whatpr.org/html/10919/browsing-the-web.html#updating-the-document
    const popStateEvent = createPopStateEvent({
      state: navigateEvent.destination.getHistoryState(),
    });
    this.window.dispatchEvent(popStateEvent);
    // TODO(atscott): If oldURL's fragment is not equal to entry's URL's fragment, then queue a global task to fire an event named hashchange
  }

  /**
   * Implementation for a push or replace navigation.
   * https://whatpr.org/html/10919/browsing-the-web.html#url-and-history-update-steps
   * https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   */
  private urlAndHistoryUpdateSteps(navigateEvent: InternalFakeNavigateEvent) {
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
  }

  /**
   * Implementation for a traverse navigation.
   *
   * https://whatpr.org/html/10919/browsing-the-web.html#apply-the-traverse-history-step
   * ...
   * > Let updateDocument be an algorithm step which performs update document for history step application given targetEntry's document, targetEntry, changingNavigableContinuation's update-only, scriptHistoryLength, scriptHistoryIndex, navigationType, entriesForNavigationAPI, and previousEntry.
   * > If targetEntry's document is equal to displayedDocument, then perform updateDocument.
   * https://whatpr.org/html/10919/browsing-the-web.html#update-document-for-history-step-application
   * which then goes to https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   */
  private userAgentTraverse(navigateEvent: InternalFakeNavigateEvent) {
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
    // Happens as part of "updating the document" steps https://whatpr.org/html/10919/browsing-the-web.html#updating-the-document
    const popStateEvent = createPopStateEvent({
      state: navigateEvent.destination.getHistoryState(),
    });
    this.window.dispatchEvent(popStateEvent);
  }

  /** https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation */
  private updateNavigationEntriesForSameDocumentNavigation({
    destination,
    navigationType,
    result,
  }: InternalFakeNavigateEvent) {
    const oldCurrentNHE = this.currentEntry;
    const disposedNHEs = [];
    if (navigationType === 'traverse') {
      this.currentEntryIndex = destination.index;
      if (this.currentEntryIndex === -1) {
        throw new Error('unexpected current entry index');
      }
    } else if (navigationType === 'push') {
      this.currentEntryIndex++;
      this.prospectiveEntryIndex = this.currentEntryIndex; // prospectiveEntryIndex isn't in the spec but is an implementation detail
      disposedNHEs.push(...this.entriesArr.splice(this.currentEntryIndex));
    } else if (navigationType === 'replace') {
      disposedNHEs.push(oldCurrentNHE);
    }
    if (navigationType === 'push' || navigationType === 'replace') {
      const index = this.currentEntryIndex;
      const key = navigationType === 'push' ? String(this.nextKey++) : this.currentEntry.key;
      const newNHE = new FakeNavigationHistoryEntry(
        this.window.document.createElement('div'),
        destination.url,
        {
          id: String(this.nextId++),
          key,
          index,
          sameDocument: true,
          state: destination.getState(),
          historyState: destination.getHistoryState(),
        },
      );
      this.entriesArr[this.currentEntryIndex] = newNHE;
    }
    result.committedResolve(this.currentEntry);
    const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({
      from: oldCurrentNHE,
      navigationType: navigationType,
    });
    this.eventTarget.dispatchEvent(currentEntryChangeEvent);
    for (const disposedNHE of disposedNHEs) {
      disposedNHE.dispose();
    }
  }

  /** Utility method for finding entries with the given `key`. */
  private findEntry(key: string) {
    for (const entry of this.entriesArr) {
      if (entry.key === key) return entry;
    }
    return undefined;
  }

  set onnavigate(
    // tslint:disable-next-line:no-any
    _handler: ((this: Navigation, ev: NavigateEvent) => any) | null,
  ) {
    throw new Error('unimplemented');
  }

  // tslint:disable-next-line:no-any
  get onnavigate(): ((this: Navigation, ev: NavigateEvent) => any) | null {
    throw new Error('unimplemented');
  }

  set oncurrententrychange(
    _handler: // tslint:disable-next-line:no-any
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null,
  ) {
    throw new Error('unimplemented');
  }

  get oncurrententrychange(): // tslint:disable-next-line:no-any
  ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null {
    throw new Error('unimplemented');
  }

  set onnavigatesuccess(
    // tslint:disable-next-line:no-any
    _handler: ((this: Navigation, ev: Event) => any) | null,
  ) {
    throw new Error('unimplemented');
  }

  // tslint:disable-next-line:no-any
  get onnavigatesuccess(): ((this: Navigation, ev: Event) => any) | null {
    throw new Error('unimplemented');
  }

  set onnavigateerror(
    // tslint:disable-next-line:no-any
    _handler: ((this: Navigation, ev: ErrorEvent) => any) | null,
  ) {
    throw new Error('unimplemented');
  }

  // tslint:disable-next-line:no-any
  get onnavigateerror(): ((this: Navigation, ev: ErrorEvent) => any) | null {
    throw new Error('unimplemented');
  }

  private _transition: NavigationTransition | null = null;
  /** @internal */
  set transition(t: NavigationTransition | null) {
    this._transition = t;
  }
  get transition(): NavigationTransition | null {
    return this._transition;
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
  readonly sameDocument: boolean;

  readonly id: string;
  readonly key: string;
  readonly index: number;
  private readonly state: unknown;
  private readonly historyState: unknown;

  // tslint:disable-next-line:no-any
  ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null = null;

  constructor(
    private eventTarget: EventTarget,
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
    return this.state ? (JSON.parse(JSON.stringify(this.state)) as unknown) : this.state;
  }

  getHistoryState(): unknown {
    // Budget copy.
    return this.historyState
      ? (JSON.parse(JSON.stringify(this.historyState)) as unknown)
      : this.historyState;
  }

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): void {
    this.eventTarget.addEventListener(type, callback, options);
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean,
  ): void {
    this.eventTarget.removeEventListener(type, callback, options);
  }

  dispatchEvent(event: Event): boolean {
    return this.eventTarget.dispatchEvent(event);
  }

  /** internal */
  dispose() {
    const disposeEvent = new Event('disposed');
    this.dispatchEvent(disposeEvent);
    // release current listeners
    this.eventTarget = null!;
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
  readonly triggeredByHistoryApi?: boolean;
  readonly commitOption: 'after-transition' | 'immediate';
  readonly result: InternalNavigationResult;
  interceptionState: 'none' | 'intercepted' | 'committed' | 'scrolled' | 'finished';
  scrollBehavior: 'after-transition' | 'manual' | null;
  focusResetBehavior: 'after-transition' | 'manual' | null;

  commit(internal?: boolean): void;
  cancel(reason: Error): void;
}

/**
 * Create a fake equivalent of `NavigateEvent`. This is not a class because ES5
 * transpiled JavaScript cannot extend native Event.
 *
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigate-event-firing
 */
function dispatchNavigateEvent({
  cancelable,
  canIntercept,
  userInitiated,
  hashChange,
  navigationType,
  signal,
  destination,
  info,
  sameDocument,
  triggeredByHistoryApi,
  result,
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
  triggeredByHistoryApi?: boolean;
  result: InternalNavigationResult;
}) {
  const {navigation} = result;
  const event = new Event('navigate', {bubbles: false, cancelable}) as {
    -readonly [P in keyof InternalFakeNavigateEvent]: InternalFakeNavigateEvent[P];
  };
  event.focusResetBehavior = null;
  event.scrollBehavior = null;
  event.interceptionState = 'none';
  event.canIntercept = canIntercept;
  event.userInitiated = userInitiated;
  event.hashChange = hashChange;
  event.navigationType = navigationType;
  event.signal = signal;
  event.destination = destination;
  event.info = info;
  event.downloadRequest = null;
  event.formData = null;
  event.result = result;

  event.sameDocument = sameDocument;
  event.triggeredByHistoryApi = triggeredByHistoryApi;
  event.commitOption = 'immediate';

  let handlersFinished = [Promise.resolve()];
  let dispatchedNavigateEvent = false;

  event.intercept = function (
    this: InternalFakeNavigateEvent,
    options?: ExperimentalNavigationInterceptOptions,
  ): void {
    if (!this.canIntercept) {
      throw new DOMException(`Cannot intercept when canIntercept is 'false'`, 'SecurityError');
    }
    this.interceptionState = 'intercepted';
    event.sameDocument = true;
    const handler = options?.handler;
    if (handler) {
      handlersFinished.push(handler());
    }
    // override old options with new ones. UA _may_ report a console warning if new options differ from previous
    event.commitOption = options?.commit ?? event.commitOption;
    event.scrollBehavior = options?.scroll ?? event.scrollBehavior;
    event.focusResetBehavior = options?.focusReset ?? event.focusResetBehavior;
  };

  event.scroll = function (this: InternalFakeNavigateEvent): void {
    if (event.interceptionState !== 'committed') {
      throw new DOMException(
        `Failed to execute 'scroll' on 'NavigateEvent': scroll() must be ` +
          `called after commit() and interception options must specify manual scroll.`,
        'InvalidStateError',
      );
    }
    processScrollBehavior(event);
  };

  event.commit = function (this: InternalFakeNavigateEvent, internal = false) {
    if (!internal && this.interceptionState !== 'intercepted') {
      throw new DOMException(
        `Failed to execute 'commit' on 'NavigateEvent': intercept() must be ` +
          `called before commit() and commit() cannot be already called.`,
        'InvalidStateError',
      );
    }
    if (!internal && event.commitOption !== 'after-transition') {
      throw new DOMException(
        `Failed to execute 'commit' on 'NavigateEvent': commit() may not be ` +
          `called if commit behavior is not "after-transition",.`,
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
    this.interceptionState = 'committed';

    result.navigation.commitNavigateEvent(event);
  };

  // Internal only.
  event.cancel = function (this: InternalFakeNavigateEvent, reason: Error) {
    result.committedReject(reason);
    result.finishedReject(reason);
  };

  function dispatch() {
    navigation.navigateEvent = event;
    navigation.eventTarget.dispatchEvent(event);
    dispatchedNavigateEvent = true;

    if (event.interceptionState !== 'none') {
      navigation.transition = new InternalNavigationTransition(
        navigation.currentEntry,
        navigationType,
      );
      if (event.commitOption !== 'after-transition') {
        event.commit(/** internal */ true);
      }
    } else {
      // In the spec, this isn't really part of the navigate API. Instead, the navigate event firing returns "true" to indicate
      // navigation steps should "continue" (https://whatpr.org/html/10919/browsing-the-web.html#beginning-navigation)
      event.commit(/** internal */ true);
    }
    Promise.all(handlersFinished).then(
      () => {
        // Follows steps outlined under "Wait for all of promisesList, with the following success steps:"
        // in the spec https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigate-event-firing.
        if (result.signal.aborted) {
          return;
        }
        if (event !== navigation.navigateEvent) {
          throw new Error("Navigation's ongoing event not equal to resolved event");
        }
        navigation.navigateEvent = null;
        if (event.interceptionState === 'intercepted') {
          navigation.commitNavigateEvent(event);
        }
        finishNavigationEvent(event, true);
        const navigatesuccessEvent = new Event('navigatesuccess', {bubbles: false, cancelable});
        navigation.eventTarget.dispatchEvent(navigatesuccessEvent);
        result.finishedResolve();
        // TODO(atscott): If navigation's transition is not null, then resolve navigation's transition's finished promise with undefined.
        navigation.transition = null;
      },
      (reason) => {
        if (result.signal.aborted) {
          return;
        }
        if (event !== navigation.navigateEvent) {
          throw new Error("Navigation's ongoing event not equal to resolved event");
        }
        navigation.navigateEvent = null;
        finishNavigationEvent(event, false);
        const navigateerrorEvent = new Event('navigateerror', {bubbles: false, cancelable});
        navigation.eventTarget.dispatchEvent(navigateerrorEvent);
        result.finishedReject(reason);
        // TODO(atscott): If navigation's transition is not null, then resolve navigation's transition's finished promise with undefined.
        navigation.transition = null;
      },
    );
  }
  dispatch();
  return event;
}

/** https://whatpr.org/html/10919/nav-history-apis.html#navigateevent-finish */
function finishNavigationEvent(event: InternalFakeNavigateEvent, didFulfill: boolean) {
  if (event.interceptionState === 'intercepted' || event.interceptionState === 'finished') {
    throw new Error(
      'Attempting to finish navigation event that was incomplete or already finished',
    );
  }
  if (event.interceptionState === 'none') {
    return;
  }
  potentiallyResetFocus(event);
  if (didFulfill) {
    potentiallyResetScroll(event);
  }
  event.interceptionState = 'finished';
}

/** https://whatpr.org/html/10919/nav-history-apis.html#potentially-reset-the-focus */
function potentiallyResetFocus(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset focus if navigation event is not committed or scrolled');
  }
  // TODO(atscott): The rest of the steps
}

function potentiallyResetScroll(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset scroll if navigation event is not committed or scrolled');
  }
  if (event.interceptionState === 'scrolled' || event.scrollBehavior === 'manual') {
    return;
  }
  processScrollBehavior(event);
}

/* https://whatpr.org/html/10919/nav-history-apis.html#process-scroll-behavior */
function processScrollBehavior(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed') {
    throw new Error('invalid event interception state when processing scroll behavior');
  }
  event.interceptionState = 'scrolled';
  // TODO(atscott): the rest of the steps
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

class InternalNavigationTransition implements NavigationTransition {
  readonly finished: Promise<void>;
  finishedResolve!: () => void;
  finishedReject!: () => void;
  constructor(
    readonly from: NavigationHistoryEntry,
    readonly navigationType: NavigationTypeString,
  ) {
    this.finished = new Promise<void>((resolve, reject) => {
      this.finishedReject = reject;
      this.finishedResolve = resolve;
    });
  }
}

/**
 * Internal utility class for representing the result of a navigation.
 * Generally equivalent to the "apiMethodTracker" in the spec.
 */
class InternalNavigationResult {
  committedTo: FakeNavigationHistoryEntry | null = null;
  committedResolve!: (entry: FakeNavigationHistoryEntry) => void;
  committedReject!: (reason: Error) => void;
  finishedResolve!: () => void;
  finishedReject!: (reason: Error) => void;
  readonly committed: Promise<FakeNavigationHistoryEntry>;
  readonly finished: Promise<FakeNavigationHistoryEntry>;
  get signal(): AbortSignal {
    return this.abortController.signal;
  }
  private readonly abortController = new AbortController();

  constructor(readonly navigation: FakeNavigation) {
    this.committed = new Promise<FakeNavigationHistoryEntry>((resolve, reject) => {
      this.committedResolve = (entry) => {
        this.committedTo = entry;
        resolve(entry);
      };
      this.committedReject = reject;
    });

    this.finished = new Promise<FakeNavigationHistoryEntry>(async (resolve, reject) => {
      this.finishedResolve = () => void resolve(this.committedTo!);
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
  triggeredByHistoryApi?: boolean;
}
