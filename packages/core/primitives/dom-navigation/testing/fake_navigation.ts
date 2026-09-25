/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// 3p-only-start
import {
  NavigationNavigateOptions,
  NavigationType,
  NavigationOptions,
  NavigateEvent,
  NavigationCurrentEntryChangeEvent,
  NavigationTransition,
  NavigationUpdateCurrentEntryOptions,
  NavigationReloadOptions,
  NavigationResult,
  NavigationHistoryEntry,
  NavigationInterceptOptions,
  NavigationInterceptHandler,
  NavigationPrecommitHandler,
  NavigationDestination,
  Navigation,
  NavigationPrecommitController,
} from '../src/navigation_types';
// 3p-only-end

/**
 * Options for `FakeNavigation.navigateForTesting()`.
 *
 * These model parts of a `NavigateEvent` that `navigation.navigate()` can never produce, because a
 * user agent supplies them when a navigation is initiated by something other than that method (a
 * link click, a form submission, browser UI, ...). They are exposed on a separate method so that
 * `FakeNavigation.navigate()` keeps the exact signature of the real `Navigation.navigate()`.
 */
export interface FakeNavigateForTestingOptions extends NavigationNavigateOptions {
  /**
   * Value for `NavigateEvent.cancelable`. Always `true` for `navigation.navigate()`, but a user
   * agent initiated navigation may be non-cancelable.
   */
  cancelable?: boolean;
  /** Value for `NavigateEvent.sourceElement`, i.e. the element that initiated the navigation. */
  sourceElement?: Element | null;
}

/**
 * Options for the traversal methods: `traverseTo()`, `back()` and `forward()`.
 *
 * `hasUAVisualTransition` is a test-only extension. A real user agent sets it when it performed a
 * visual transition for the traversal, which only happens for user agent driven traversals, so
 * there is no way for a test to produce one otherwise.
 */
export interface FakeNavigationTraverseOptions extends NavigationOptions {
  /** Value for `NavigateEvent.hasUAVisualTransition` and `PopStateEvent.hasUAVisualTransition`. */
  hasUAVisualTransition?: boolean;
}

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
  private propsectiveTraversalDestinations: number[] = [];

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

  readonly activation: NavigationActivation | null = null;

  /** The next unique id for created entries. Replace recreates this id. */
  private nextId = 0;

  /** The next unique key for created entries. Replace inherits this id. */
  private nextKey = 0;

  /** Whether this fake is disposed. */
  private disposed = false;

  /**
   * Equivalent to `navigation.currentEntry`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-currententry
   */
  get currentEntry(): FakeNavigationHistoryEntry {
    return this.entriesArr[this.currentEntryIndex];
  }

  /**
   * Equivalent to `navigation.canGoBack`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-cangoback
   */
  get canGoBack(): boolean {
    return this.currentEntryIndex > 0;
  }

  /**
   * Equivalent to `navigation.canGoForward`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-cangoforward
   */
  get canGoForward(): boolean {
    return this.currentEntryIndex < this.entriesArr.length - 1;
  }

  private readonly createEventTarget: () => EventTarget;
  private readonly _window: Pick<
    Window,
    'addEventListener' | 'removeEventListener' | 'dispatchEvent'
  >;
  get window(): Pick<Window, 'addEventListener' | 'removeEventListener'> {
    return this._window;
  }

  constructor(doc: Document, startURL: `http${string}`) {
    this.createEventTarget = () => {
      try {
        // `document.createElement` because NodeJS `EventTarget` is
        // incompatible with Domino's `Event`. That is, attempting to
        // dispatch an event created by Domino's patched `Event` will
        // throw an error since it is not an instance of a real Node
        // `Event`.
        return doc.createElement('div');
      } catch {
        // Fallback to a basic EventTarget if `document.createElement`
        // fails. This can happen with tests that pass in a value for document
        // that is stubbed.
        return new EventTarget();
      }
    };
    this._window = doc.defaultView ?? this.createEventTarget();
    this.eventTarget = this.createEventTarget();
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
        'setInitialEntryForTesting can only be called before any navigation has occurred',
      );
    }
    const currentInitialEntry = this.entriesArr[0];
    this.entriesArr[0] = new FakeNavigationHistoryEntry(
      this.createEventTarget,
      new URL(url).toString(),
      {
        index: 0,
        key: currentInitialEntry?.key ?? String(this.nextKey++),
        id: currentInitialEntry?.id ?? String(this.nextId++),
        sameDocument: true,
        historyState: cloneState(options?.historyState),
        state: cloneState(options.state),
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

  /**
   * Equivalent to `navigation.entries()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-entries
   */
  entries(): FakeNavigationHistoryEntry[] {
    return this.entriesArr.slice();
  }

  /**
   * Equivalent to `navigation.navigate()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-navigate
   */
  navigate(url: string, options?: NavigationNavigateOptions): FakeNavigationResult {
    return this.navigateForTesting(url, options);
  }

  /**
   * Test-only variant of `navigate()` which additionally accepts the parts of a `NavigateEvent`
   * that only a user agent can supply. See `FakeNavigateForTestingOptions`.
   */
  navigateForTesting(url: string, options?: FakeNavigateForTestingOptions): FakeNavigationResult {
    const fromUrl = new URL(this.currentEntry.url!);
    let toUrl: URL;
    try {
      toUrl = new URL(url, this.currentEntry.url!);
    } catch {
      return earlyErrorResult(new DOMException(`Failed to parse URL '${url}'`, 'SyntaxError'));
    }
    // > If urlRecord's scheme is "javascript", then return an early error result for a
    // > "NotSupportedError" DOMException.
    if (toUrl.protocol === 'javascript:') {
      return earlyErrorResult(
        new DOMException(`Cannot navigate to a 'javascript:' URL`, 'NotSupportedError'),
      );
    }

    let navigationType: NavigationType;
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

    let state: unknown;
    try {
      state = cloneState(options?.state);
    } catch (e: unknown) {
      return earlyErrorResult(asDataCloneError(e));
    }

    const destination = new FakeNavigationDestination({
      url: toUrl.toString(),
      state,
      sameDocument: hashChange,
      historyState: null,
    });

    return this.performNonTraverseNavigation(destination, {
      navigationType,
      cancelable: options?.cancelable ?? true,
      canIntercept: true,
      // Always false for navigate().
      userInitiated: false,
      hashChange,
      info: options?.info,
      sourceElement: options?.sourceElement,
    });
  }

  /** Equivalent to `history.pushState()`. */
  pushState(data: unknown, title: string, url?: string): void {
    this.pushOrReplaceState('push', data, title, url);
  }

  /** Equivalent to `history.replaceState()`. */
  replaceState(data: unknown, title: string, url?: string): void {
    this.pushOrReplaceState('replace', data, title, url);
  }

  /**
   * Shared implementation of `history.pushState()` and `history.replaceState()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#shared-history-push/replace-state-steps
   */
  private pushOrReplaceState(
    navigationType: NavigationType,
    data: unknown,
    _title: string,
    url?: string,
  ): void {
    const fromUrl = new URL(this.currentEntry.url!);

    // > Let serializedData be StructuredSerializeForStorage(data). Rethrow any exceptions.
    // This happens before the URL is parsed, so a call with both a non-serializable `data` and an
    // invalid `url` reports the `DataCloneError` rather than the URL failure.
    const historyState = cloneState(data);

    let toUrl = fromUrl;
    if (url) {
      // Unlike `navigation.navigate()`, the classic history API reports URL failures as a
      // `SecurityError` rather than a `SyntaxError`.
      try {
        toUrl = new URL(url, this.currentEntry.url!);
      } catch {
        throw new DOMException(`Failed to parse URL '${url}'`, 'SecurityError');
      }
      // > If document cannot have its URL rewritten to newURL, then throw a "SecurityError"
      // > DOMException.
      if (!canHaveUrlRewrittenTo(fromUrl, toUrl)) {
        throw new DOMException(
          `Cannot rewrite the document URL from '${fromUrl.href}' to '${toUrl.href}'`,
          'SecurityError',
        );
      }
    }

    const hashChange = isHashChange(fromUrl, toUrl);

    const destination = new FakeNavigationDestination({
      url: toUrl.toString(),
      sameDocument: true, // history.pushState/replaceState are always same-document
      historyState,
      state: undefined, // No Navigation API state directly from history.pushState
    });

    this.performNonTraverseNavigation(destination, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for pushState() or replaceState().
      userInitiated: false,
      hashChange,
    });
  }

  /**
   * Equivalent to `navigation.traverseTo()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-traverseto
   */
  traverseTo(key: string, options?: FakeNavigationTraverseOptions): FakeNavigationResult {
    const fromUrl = new URL(this.currentEntry.url!);
    const entry = this.findEntry(key);
    if (!entry) {
      return earlyErrorResult(new DOMException('Invalid key', 'InvalidStateError'));
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
    const destination = this.createDestinationFromEntry(entry);
    this.propsectiveTraversalDestinations.push(entry.index);
    const result = new InternalNavigationResult(this);
    this.traversalQueue.set(entry.key, result);
    this.runTraversal(() => {
      this.traversalQueue.delete(entry.key);
      const intercepted = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for traverseTo().
        userInitiated: false,
        hashChange,
        info: options?.info,
        hasUAVisualTransition: options?.hasUAVisualTransition,
      });
      if (!intercepted && this.navigateEvent) {
        this.userAgentTraverse(this.navigateEvent);
      }
    });
    return {
      committed: result.committed,
      finished: result.finished,
    };
  }

  /**
   * Equivalent to `navigation.back()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-back
   */
  back(options?: FakeNavigationTraverseOptions): FakeNavigationResult {
    if (this.currentEntryIndex === 0) {
      return earlyErrorResult(new DOMException('Cannot go back', 'InvalidStateError'));
    }
    const entry = this.entriesArr[this.currentEntryIndex - 1];
    return this.traverseTo(entry.key, options);
  }

  /**
   * Equivalent to `navigation.forward()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-forward
   */
  forward(options?: FakeNavigationTraverseOptions): FakeNavigationResult {
    if (this.currentEntryIndex === this.entriesArr.length - 1) {
      return earlyErrorResult(new DOMException('Cannot go forward', 'InvalidStateError'));
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
    const targetIndex =
      (this.propsectiveTraversalDestinations[this.propsectiveTraversalDestinations.length - 1] ??
        this.currentEntryIndex) + direction;
    if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
      return;
    }
    this.propsectiveTraversalDestinations.push(targetIndex);
    this.runTraversal(() => {
      // Check again that destination is in the entries array.
      if (targetIndex >= this.entriesArr.length || targetIndex < 0) {
        return;
      }
      const fromUrl = new URL(this.currentEntry.url!);
      const entry = this.entriesArr[targetIndex];
      const hashChange = isHashChange(fromUrl, new URL(entry.url!, this.currentEntry.url!));
      const destination = this.createDestinationFromEntry(entry);
      const result = new InternalNavigationResult(this);
      const intercepted = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for go().
        userInitiated: false,
        hashChange,
      });
      if (!intercepted && this.navigateEvent) {
        this.userAgentTraverse(this.navigateEvent);
      }
    });
  }

  /** Creates a FakeNavigationDestination matching a given history entry. */
  private createDestinationFromEntry(entry: FakeNavigationHistoryEntry): FakeNavigationDestination {
    return new FakeNavigationDestination({
      url: entry.url!,
      state: entry.getState(),
      historyState: entry.getHistoryState(),
      key: entry.key,
      id: entry.id,
      index: entry.index,
      sameDocument: entry.sameDocument,
    });
  }

  /**
   * Implementation of "performing a non-traverse navigation" from the spec.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-navigate
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-reload
   */
  private performNonTraverseNavigation(
    destination: FakeNavigationDestination,
    options: InternalNavigateOptions,
  ): FakeNavigationResult {
    const result = new InternalNavigationResult(this);
    const intercepted = this.userAgentNavigate(destination, result, options);
    // The event may have been aborted during dispatch, e.g. by a `navigate` listener starting
    // another navigation. There is nothing left to commit in that case.
    if (!intercepted && this.navigateEvent) {
      this.updateNavigationEntriesForSameDocumentNavigation(this.navigateEvent);
    }
    return {
      committed: result.committed,
      finished: result.finished,
    };
  }

  /** Runs a traversal synchronously or asynchronously */
  private runTraversal(traversal: () => void) {
    if (this.synchronousTraversals) {
      traversal();
      this.propsectiveTraversalDestinations.shift();
      return;
    }

    // Each traversal occupies a single timeout resolution.
    // This means that Promises added to commit and finish should resolve
    // before the next traversal.
    this.nextTraversal = this.nextTraversal.then(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
          // A traversal queued before `dispose()` must not mutate entries or dispatch events
          // afterwards. `dispose()` has already settled this traversal's promises.
          if (!this.disposed) {
            traversal();
          }
          this.propsectiveTraversalDestinations.shift();
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

  /**
   * Cleans up resources.
   *
   * Any in-flight or queued navigation is aborted so that its `committed`/`finished` promises
   * settle; otherwise awaiting them during teardown would hang forever.
   */
  dispose(): void {
    // Abort the ongoing navigation first, so `navigateerror` is still delivered to the listeners
    // registered before disposal.
    if (this.navigateEvent) {
      this.abortOngoingNavigation(this.navigateEvent, createDisposedAbortError());
    }
    this.navigateEvent = null;
    for (const queuedResult of this.traversalQueue.values()) {
      const reason = createDisposedAbortError();
      queuedResult.abort(reason);
      queuedResult.finishedReject(reason);
    }
    this.traversalQueue.clear();
    this.propsectiveTraversalDestinations = [];
    this._transition = null;
    // Recreate eventTarget to release current listeners.
    this.eventTarget = this.createEventTarget();
    this._onnavigate = null;
    this._oncurrententrychange = null;
    this._onnavigatesuccess = null;
    this._onnavigateerror = null;
    handlerWrappers.get(this)?.clear();
    this.disposed = true;
  }

  /** Returns whether this fake is disposed. */
  isDisposed(): boolean {
    return this.disposed;
  }

  abortOngoingNavigation(eventToAbort: InternalFakeNavigateEvent, reason?: Error) {
    if (this.navigateEvent !== eventToAbort) {
      return;
    }
    if (this.navigateEvent.abortController.signal.aborted) {
      return;
    }
    const abortReason = reason ?? new DOMException('Navigation aborted', 'AbortError');
    this.navigateEvent.abort(abortReason);
  }

  /**
   * Implementation for all navigations and traversals.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigate-event-firing
   * @returns true if the event was intercepted, otherwise false
   */
  private userAgentNavigate(
    destination: FakeNavigationDestination,
    result: InternalNavigationResult,
    options: InternalNavigateOptions,
  ): boolean {
    // The first navigation should disallow any future calls to set the initial
    // entry.
    this.canSetInitialEntry = false;
    if (this.navigateEvent) {
      this.abortOngoingNavigation(
        this.navigateEvent,
        new DOMException('Navigation superseded by a new navigation.', 'AbortError'),
      );
    }
    // TODO(atscott): Disposing doesn't really do much because new requests are still processed
    // if (this.disposed) {
    //   return false;
    // }
    const dispatchResultIsTrueIfNoInterception = dispatchNavigateEvent({
      navigationType: options.navigationType,
      cancelable: options.cancelable,
      canIntercept: options.canIntercept,
      userInitiated: options.userInitiated,
      hashChange: options.hashChange,
      destination,
      info: options.info,
      hasUAVisualTransition: options.hasUAVisualTransition,
      sourceElement: options.sourceElement,
      sameDocument: destination.sameDocument,
      result,
    });
    return !dispatchResultIsTrueIfNoInterception;
  }

  /**
   * Implementation for a push or replace navigation.
   * https://html.spec.whatwg.org/multipage/browsing-the-web.html#url-and-history-update-steps
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   * @internal
   */
  urlAndHistoryUpdateSteps(navigateEvent: InternalFakeNavigateEvent) {
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
  }

  /**
   * Implementation for a traverse navigation.
   *
   * https://html.spec.whatwg.org/multipage/browsing-the-web.html#apply-the-traverse-history-step
   * ...
   * > Let updateDocument be an algorithm step which performs update document for history step application given targetEntry's document, targetEntry, changingNavigableContinuation's update-only, scriptHistoryLength, scriptHistoryIndex, navigationType, entriesForNavigationAPI, and previousEntry.
   * > If targetEntry's document is equal to displayedDocument, then perform updateDocument.
   * https://html.spec.whatwg.org/multipage/browsing-the-web.html#update-document-for-history-step-application
   * which then goes to https://html.spec.whatwg.org/multipage/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   * @internal
   */
  userAgentTraverse(navigateEvent: InternalFakeNavigateEvent) {
    const oldUrl = this.currentEntry.url!;
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
    // Happens as part of "updating the document" steps https://html.spec.whatwg.org/multipage/browsing-the-web.html#updating-the-document
    // The state is read back off the entry that just became current so that `popstate.state` and
    // `history.state` are the same object, as they are in a real user agent.
    const popStateEvent = createPopStateEvent({
      state: this.currentEntry.getHistoryState(),
      hasUAVisualTransition: navigateEvent.hasUAVisualTransition,
    });
    this._window.dispatchEvent(popStateEvent);
    if (navigateEvent.hashChange) {
      const hashchangeEvent = createHashChangeEvent(oldUrl, this.currentEntry.url!);
      this._window.dispatchEvent(hashchangeEvent);
    }
  }

  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   * @internal
   */
  updateNavigationEntriesForSameDocumentNavigation({
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
      this.propsectiveTraversalDestinations = []; // prospectiveEntryIndex isn't in the spec but is an implementation detail
      disposedNHEs.push(...this.entriesArr.splice(this.currentEntryIndex));
    } else if (navigationType === 'replace') {
      disposedNHEs.push(oldCurrentNHE);
    }
    if (navigationType === 'push' || navigationType === 'replace') {
      const index = this.currentEntryIndex;
      const key =
        navigationType === 'push'
          ? String(this.nextKey++)
          : (oldCurrentNHE?.key ?? String(this.nextKey++));
      const newNHE = new FakeNavigationHistoryEntry(this.createEventTarget, destination.url, {
        id: String(this.nextId++),
        key,
        index,
        sameDocument: true,
        state: destination.getState(),
        historyState: destination.getHistoryState(),
      });
      this.entriesArr[this.currentEntryIndex] = newNHE;
    } else if (navigationType === 'reload') {
      oldCurrentNHE.setState(destination.getState());
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

  private _onnavigate: ((this: Navigation, ev: NavigateEvent) => any) | null = null;
  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigate
   */
  // tslint:disable-next-line:no-any
  get onnavigate(): ((this: Navigation, ev: NavigateEvent) => any) | null {
    return this._onnavigate;
  }
  set onnavigate(
    // tslint:disable-next-line:no-any
    handler: ((this: Navigation, ev: NavigateEvent) => any) | null,
  ) {
    this._onnavigate = setEventHandler(this, 'navigate', handler);
  }

  private _oncurrententrychange:
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null = null;
  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-oncurrententrychange
   */
  get oncurrententrychange():
    | // tslint:disable-next-line:no-any
      ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any)
    | null {
    return this._oncurrententrychange;
  }
  set oncurrententrychange(
    handler:
      | // tslint:disable-next-line:no-any
        ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any)
      | null,
  ) {
    this._oncurrententrychange = setEventHandler(this, 'currententrychange', handler);
  }

  private _onnavigatesuccess: ((this: Navigation, ev: Event) => any) | null = null;
  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigatesuccess
   */
  // tslint:disable-next-line:no-any
  get onnavigatesuccess(): ((this: Navigation, ev: Event) => any) | null {
    return this._onnavigatesuccess;
  }
  set onnavigatesuccess(
    // tslint:disable-next-line:no-any
    handler: ((this: Navigation, ev: Event) => any) | null,
  ) {
    this._onnavigatesuccess = setEventHandler(this, 'navigatesuccess', handler);
  }

  private _onnavigateerror: ((this: Navigation, ev: ErrorEvent) => any) | null = null;
  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#handler-navigation-onnavigateerror
   */
  // tslint:disable-next-line:no-any
  get onnavigateerror(): ((this: Navigation, ev: ErrorEvent) => any) | null {
    return this._onnavigateerror;
  }
  set onnavigateerror(
    // tslint:disable-next-line:no-any
    handler: ((this: Navigation, ev: ErrorEvent) => any) | null,
  ) {
    this._onnavigateerror = setEventHandler(this, 'navigateerror', handler);
  }

  private _transition: NavigationTransition | null = null;
  /** @internal */
  set transition(t: NavigationTransition | null) {
    this._transition = t;
  }
  get transition(): NavigationTransition | null {
    return this._transition;
  }

  /**
   * Equivalent to `navigation.updateCurrentEntry()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-updatecurrententry
   */
  updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void {
    const current = this.currentEntry;
    if (!current) {
      throw new DOMException(
        'Cannot update current entry when current is null',
        'InvalidStateError',
      );
    }
    current.setState(cloneState(options.state));
    const currentEntryChangeEvent = createFakeNavigationCurrentEntryChangeEvent({
      from: current,
      navigationType: null,
    });
    this.eventTarget.dispatchEvent(currentEntryChangeEvent);
  }

  /**
   * Equivalent to `navigation.reload()`.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigation-reload
   */
  reload(options?: NavigationReloadOptions): FakeNavigationResult {
    const current = this.currentEntry;
    if (!current) {
      return earlyErrorResult(
        new DOMException('Cannot reload when currentEntry is null', 'InvalidStateError'),
      );
    }

    let state: unknown;
    try {
      state = options && 'state' in options ? cloneState(options.state) : current.getState();
    } catch (e: unknown) {
      return earlyErrorResult(asDataCloneError(e));
    }

    const destination = new FakeNavigationDestination({
      url: current.url!,
      state,
      historyState: current.getHistoryState(),
      key: '',
      id: '',
      index: -1,
      sameDocument: current.sameDocument,
    });

    return this.performNonTraverseNavigation(destination, {
      navigationType: 'reload',
      cancelable: true,
      canIntercept: true,
      userInitiated: false,
      hashChange: false,
      info: options?.info,
    });
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
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationhistoryentry-interface
 */
export class FakeNavigationHistoryEntry implements NavigationHistoryEntry {
  readonly sameDocument: boolean;

  readonly id: string;
  readonly key: string;
  readonly index: number;
  private state: unknown;
  private readonly historyState: unknown;

  private _ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null = null;
  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-ondispose
   */
  // tslint:disable-next-line:no-any
  get ondispose(): ((this: NavigationHistoryEntry, ev: Event) => any) | null {
    return this._ondispose;
  }
  set ondispose(
    // tslint:disable-next-line:no-any
    handler: ((this: NavigationHistoryEntry, ev: Event) => any) | null,
  ) {
    this._ondispose = setEventHandler(this, 'dispose', handler);
  }

  private eventTarget: EventTarget;

  constructor(
    /**
     * Creates the `EventTarget` backing this entry. A factory rather than an instance because
     * `dispose()` swaps in a fresh target, which must be created the same way as the original to
     * stay compatible with the `Event` implementation in use (see `FakeNavigation`'s constructor).
     */
    private readonly createEventTarget: () => EventTarget,
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
    this.eventTarget = createEventTarget();
    this.id = id;
    this.key = key;
    this.index = index;
    this.sameDocument = sameDocument;
    this.state = state;
    this.historyState = historyState;
  }

  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-getstate
   *
   * > Return StructuredDeserialize(this's session history entry's navigation API state).
   *
   * The deserialization happens per call, so each call returns a fresh object.
   */
  getState(): unknown {
    return cloneState(this.state);
  }

  /** @internal */
  setState(state: unknown) {
    this.state = state;
  }

  /**
   * The classic history API state, i.e. what `history.state` returns for this entry.
   *
   * Unlike `getState()`, this is deserialized once when the entry is created and the same value is
   * returned on every read, matching `history.state`'s stable identity.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-history-state
   */
  getHistoryState(): unknown {
    return this.historyState;
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

  /**
   * internal
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationhistoryentry-ondispose
   */
  dispose() {
    const disposeEvent = new Event('dispose');
    this.dispatchEvent(disposeEvent);
    // Swap in a fresh target to release the listeners registered on the old one. The entry stays
    // usable afterwards, matching a real user agent where a disposed entry is still a live object.
    // Note that `ondispose` is deliberately *not* reset: reading the IDL attribute after disposal
    // still returns the handler that was set, as it does in a browser.
    this.eventTarget = this.createEventTarget();
    handlerWrappers.get(this)?.clear();
  }
}

/**
 * Fake equivalent of `NavigateEvent`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigateevent-interface
 */
export interface FakeNavigateEvent extends NavigateEvent {
  readonly destination: FakeNavigationDestination;
}

interface InternalFakeNavigateEvent extends FakeNavigateEvent {
  readonly sameDocument: boolean;
  readonly result: InternalNavigationResult;
  interceptionState: 'none' | 'intercepted' | 'committed' | 'scrolled' | 'finished';
  scrollBehavior: 'after-transition' | 'manual' | null;
  focusResetBehavior: 'after-transition' | 'manual' | null;

  /**
   * The spec's "dispatch flag", set only while the event is being dispatched. `intercept()` may
   * only be called while it is set.
   * https://dom.spec.whatwg.org/#dispatch-flag
   */
  dispatchFlag: boolean;
  /**
   * The spec's "canceled flag", set when the navigation is aborted during dispatch (for example
   * by `preventDefault()`). The "shared checks" reject calls into the event once it is set.
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigateevent-canceled-flag
   */
  canceledFlag: boolean;

  abortController: AbortController;
  abort(reason: Error): void;
}

/** `InternalFakeNavigateEvent` with the `readonly` modifiers stripped, for internal mutation. */
type MutableInternalFakeNavigateEvent = {
  -readonly [P in keyof InternalFakeNavigateEvent]: InternalFakeNavigateEvent[P];
};

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
  hasUAVisualTransition,
  navigationType,
  destination,
  info,
  sourceElement = null,
  sameDocument,
  result,
}: {
  cancelable: boolean;
  canIntercept: boolean;
  userInitiated: boolean;
  hashChange: boolean;
  hasUAVisualTransition?: boolean;
  navigationType: NavigationType;
  destination: FakeNavigationDestination;
  info: unknown;
  sourceElement?: Element | null;
  sameDocument: boolean;
  result: InternalNavigationResult;
}) {
  const {navigation} = result;

  const eventAbortController = new AbortController();
  const event = new Event('navigate', {
    bubbles: false,
    cancelable,
  }) as MutableInternalFakeNavigateEvent;

  event.dispatchFlag = false;
  event.canceledFlag = false;

  event.navigationType = navigationType;
  event.destination = destination;
  event.canIntercept = canIntercept;
  event.userInitiated = userInitiated;
  event.hashChange = hashChange;
  event.hasUAVisualTransition = hasUAVisualTransition ?? false;
  event.signal = eventAbortController.signal;
  event.abortController = eventAbortController;
  event.info = info;
  event.sourceElement = sourceElement;
  event.focusResetBehavior = null;
  event.scrollBehavior = null;
  event.interceptionState = 'none';
  event.downloadRequest = null;
  event.formData = null;
  event.result = result;
  event.sameDocument = sameDocument;

  let precommitHandlers: Array<
    (controller: NavigationPrecommitController) => PromiseLike<void> | void
  > = [];
  let handlers: Array<() => PromiseLike<void> | void> = [];

  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigateevent-shared-checks
   *
   * > 1. If event's relevant global object's associated Document is not fully active, then throw
   * >    an "InvalidStateError" DOMException.
   * > 2. If event's canceled flag is set, then throw an "InvalidStateError" DOMException.
   *
   * The "fully active" check has no analogue in this fake.
   */
  function performSharedChecks() {
    if (event.canceledFlag) {
      throw new DOMException('The navigation was canceled', 'InvalidStateError');
    }
  }

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigateevent-intercept
  event.intercept = function (
    this: MutableInternalFakeNavigateEvent,
    options?: NavigationInterceptOptions,
  ): void {
    performSharedChecks();
    if (!this.canIntercept) {
      throw new DOMException(`Cannot intercept when canIntercept is 'false'`, 'SecurityError');
    }
    // > If this's dispatch flag is unset, then throw an "InvalidStateError" DOMException.
    // i.e. `intercept()` is only valid from within a `navigate` event listener.
    if (!this.dispatchFlag) {
      throw new DOMException(
        `Cannot intercept when the 'navigate' event is not being dispatched`,
        'InvalidStateError',
      );
    }
    const precommitHandler = options?.precommitHandler;
    if (precommitHandler) {
      if (!this.cancelable) {
        throw new DOMException(
          `Cannot use precommitHandler when cancelable is 'false'`,
          'InvalidStateError',
        );
      }
      precommitHandlers.push(precommitHandler);
    }
    // The spec asserts this rather than throwing, because the dispatch flag check above already
    // rules it out. It is kept as a throw so that misuse of the fake surfaces loudly.
    if (this.interceptionState !== 'none' && this.interceptionState !== 'intercepted') {
      throw new DOMException(
        'Event interceptionState should be "none" or "intercepted"',
        'InvalidStateError',
      );
    }
    this.interceptionState = 'intercepted';
    this.sameDocument = true;
    const handler = options?.handler;
    if (handler) {
      handlers.push(handler);
    }
    // override old options with new ones. UA _may_ report a console warning if new options differ from previous
    this.focusResetBehavior = options?.focusReset ?? this.focusResetBehavior;
    this.scrollBehavior = options?.scroll ?? this.scrollBehavior;
  };

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigateevent-scroll
  event.scroll = function (this: MutableInternalFakeNavigateEvent): void {
    performSharedChecks();
    if (this.interceptionState !== 'committed') {
      throw new DOMException(
        `Failed to execute 'scroll' on 'NavigateEvent': scroll() must be ` +
          `called after commit() and interception options must specify manual scroll.`,
        'InvalidStateError',
      );
    }
    processScrollBehavior(this);
  };

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationprecommitcontroller-redirect
  function redirect(url: string, options: NavigationNavigateOptions = {}) {
    performSharedChecks();
    if (event.interceptionState !== 'intercepted') {
      throw new DOMException(
        `cannot redirect when event is not in 'intercepted' state`,
        'InvalidStateError',
      );
    }
    if (event.navigationType !== 'push' && event.navigationType !== 'replace') {
      throw new DOMException(
        `cannot redirect when navigationType is not 'push' or 'replace'`,
        'InvalidStateError',
      );
    }

    // > Let destinationURL be the result of parsing url given document.
    // > If destinationURL is failure, then throw a "SyntaxError" DOMException.
    const currentUrl = new URL(navigation.currentEntry.url!);
    let destinationUrl: URL;
    try {
      destinationUrl = new URL(url, currentUrl);
    } catch {
      throw new DOMException(`Failed to parse URL '${url}'`, 'SyntaxError');
    }

    // > If document cannot have its URL rewritten to destinationURL, then throw a "SecurityError"
    // > DOMException.
    if (!canHaveUrlRewrittenTo(currentUrl, destinationUrl)) {
      throw new DOMException(
        `Cannot rewrite the document URL from '${currentUrl.href}' to '${destinationUrl.href}'`,
        'SecurityError',
      );
    }

    // > If options["history"] is "push" or "replace", then set this's event's navigationType to
    // > options["history"].
    // Note that "history" defaults to "auto", which deliberately leaves navigationType unchanged.
    if (options.history === 'push' || options.history === 'replace') {
      event.navigationType = options.history;
    }
    if (Object.hasOwn(options, 'state')) {
      event.destination.state = cloneState(options.state);
    }
    event.destination.url = destinationUrl.href;
    if (Object.hasOwn(options, 'info')) {
      event.info = options.info;
    }
  }

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationprecommitcontroller-addhandler
  function addHandler(handler: () => PromiseLike<void> | void) {
    performSharedChecks();
    if (event.interceptionState !== 'intercepted') {
      throw new DOMException(
        `cannot addHandler when event is not in 'intercepted' state`,
        'InvalidStateError',
      );
    }
    handlers.push(handler);
  }

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#process-navigate-event-handler-failure
  function processNavigateEventHandlerFailure(reason: any) {
    if (event.abortController.signal.aborted) {
      return;
    }
    if (event !== navigation.navigateEvent) {
      // The event stopped being the ongoing one without having been aborted, which happens when
      // the `Navigation` was disposed. Settle the result so that `finished` does not stay pending
      // forever.
      result.abort(reason);
      result.finishedReject(reason);
      return;
    }
    if (event.interceptionState !== 'intercepted') {
      finishNavigationEvent(event, false);
    }
    event.abort(reason);
  }

  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#commit-a-navigate-event
  // "To commit a navigate event given a NavigateEvent..."
  function commit() {
    // > If event's abort controller's signal is aborted, then return.
    // A navigation superseded by a later one is aborted by `abortOngoingNavigation`, so this also
    // stops a stale navigation from committing entries.
    if (event.abortController.signal.aborted || result.signal.aborted) {
      return;
    }
    if (event.interceptionState !== 'none') {
      event.interceptionState = 'committed';
      switch (event.navigationType) {
        case 'push':
        case 'replace': {
          navigation.urlAndHistoryUpdateSteps(event);
          break;
        }
        case 'reload': {
          navigation.updateNavigationEntriesForSameDocumentNavigation(event);
          break;
        }
        case 'traverse': {
          navigation.userAgentTraverse(event);
          break;
        }
      }
    }
    (navigation.transition as InternalNavigationTransition)?.committedResolve();
    const promisesList: Array<PromiseLike<unknown>> = [];
    for (const handler of handlers) {
      try {
        const handlerResult = handler();
        if (handlerResult) {
          promisesList.push(handlerResult);
        }
      } catch (e) {
        promisesList.push(Promise.reject(e));
      }
    }
    promisesList.push(result.committed);
    Promise.all(promisesList)
      .then(() => {
        // Follows steps outlined under "Wait for all of promisesList, with the following success steps:"
        // in the spec https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigate-event-firing.
        if (result.signal.aborted) {
          return;
        }
        if (event !== navigation.navigateEvent) {
          if (!result.signal.aborted && result.committedTo) {
            result.finishedReject(
              new DOMException('Navigation superseded before handler completion', 'AbortError'),
            );
          }
          return;
        }
        navigation.navigateEvent = null;
        finishNavigationEvent(event, true);
        result.finishedResolve();
        const navigatesuccessEvent = new Event('navigatesuccess', {
          bubbles: false,
          cancelable: false,
        });
        navigation.eventTarget.dispatchEvent(navigatesuccessEvent);
        (navigation.transition as InternalNavigationTransition)?.finishedResolve();
        navigation.transition = null;
      })
      .catch(processNavigateEventHandlerFailure);
  }

  // Internal only.
  // https://html.spec.whatwg.org/multipage/nav-history-apis.html#abort-a-navigateevent
  // "To abort a NavigateEvent event given reason:"
  event.abort = function (this: MutableInternalFakeNavigateEvent, reason: Error) {
    // > If event's dispatch flag is set, then set event's canceled flag to true.
    if (this.dispatchFlag) {
      this.canceledFlag = true;
    }
    this.abortController.abort(reason);
    result.abort(reason);
    // The spec unconditionally clears the ongoing navigate event here because it only ever aborts
    // the ongoing one. This fake can abort a stale event, which must not clear a newer navigation.
    if (navigation.navigateEvent === this) {
      navigation.navigateEvent = null;
    }
    result.finishedReject(reason);
    const navigateerrorEvent = new Event('navigateerror', {
      bubbles: false,
      cancelable,
    }) as ErrorEvent;
    (navigateerrorEvent as unknown as {error: Error}).error = reason;
    navigation.eventTarget.dispatchEvent(navigateerrorEvent);
    const transition = navigation.transition as InternalNavigationTransition | undefined;
    transition?.committedReject(reason);
    transition?.finishedReject(reason);
    navigation.transition = null;
  };

  function dispatch() {
    navigation.navigateEvent = event;
    // `intercept()` is only callable while the event is being dispatched, so the flag is set for
    // exactly the duration of the dispatch.
    event.dispatchFlag = true;
    let dispatchResult: boolean;
    try {
      dispatchResult = navigation.eventTarget.dispatchEvent(event);
    } finally {
      event.dispatchFlag = false;
    }

    if (event.interceptionState === 'intercepted') {
      if (!navigation.currentEntry) {
        event.abort(
          new DOMException(
            'Cannot create transition without a currentEntry for intercepted navigation.',
            'InvalidStateError',
          ),
        );
        return;
      }
      const transition = new InternalNavigationTransition(
        navigation.currentEntry,
        event.destination,
        navigationType,
      );
      navigation.transition = transition;
      // Mark transition.finished as handled (Spec Step 33.4)
      transition.finished.catch(() => {});
      transition.committed.catch(() => {});
    }
    if (!dispatchResult && event.cancelable) {
      if (!event.abortController.signal.aborted) {
        event.abort(
          new DOMException('Navigation prevented by event.preventDefault()', 'AbortError'),
        );
      }
    } else {
      if (precommitHandlers.length === 0) {
        commit();
      } else {
        const precommitController: NavigationPrecommitController = {redirect, addHandler};
        const precommitPromisesList: Array<PromiseLike<unknown>> = [];
        for (const handler of precommitHandlers) {
          try {
            const handlerResult = handler(precommitController);
            if (handlerResult) {
              if (typeof (handlerResult as any).catch === 'function') {
                (handlerResult as any).catch(() => {});
              }
              precommitPromisesList.push(handlerResult);
            }
          } catch (e) {
            const rejected = Promise.reject(e);
            rejected.catch(() => {});
            precommitPromisesList.push(rejected);
          }
        }
        Promise.all(precommitPromisesList)
          .then(() => commit())
          .catch(processNavigateEventHandlerFailure);
      }
    }
  }

  dispatch();
  return event.interceptionState === 'none';
}

/** https://html.spec.whatwg.org/multipage/nav-history-apis.html#navigateevent-finish */
function finishNavigationEvent(event: InternalFakeNavigateEvent, didFulfill: boolean) {
  if (event.interceptionState === 'finished') {
    throw new Error('Attempting to finish navigation event that was already finished');
  }
  if (event.interceptionState === 'intercepted') {
    if (didFulfill === true) {
      throw new Error('didFulfill should be false');
    }
    event.interceptionState = 'finished';
    return;
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

/** https://html.spec.whatwg.org/multipage/nav-history-apis.html#potentially-reset-the-focus */
function potentiallyResetFocus(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset focus if navigation event is not committed or scrolled');
  }
  if (event.focusResetBehavior === 'manual') {
    return;
  }
  // TODO(atscott): the rest of the steps
}

/** https://html.spec.whatwg.org/multipage/nav-history-apis.html#potentially-reset-the-scroll-position */
function potentiallyResetScroll(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset scroll if navigation event is not committed or scrolled');
  }
  if (event.interceptionState === 'scrolled' || event.scrollBehavior === 'manual') {
    return;
  }
  processScrollBehavior(event);
}

/** https://html.spec.whatwg.org/multipage/nav-history-apis.html#process-scroll-behavior */
function processScrollBehavior(event: InternalFakeNavigateEvent) {
  if (event.interceptionState !== 'committed') {
    throw new Error('invalid event interception state when processing scroll behavior');
  }
  event.interceptionState = 'scrolled';
  // TODO(atscott): the rest of the steps
}

/**
 * Fake equivalent of `NavigationCurrentEntryChangeEvent`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationcurrententrychangeevent-interface
 */
export interface FakeNavigationCurrentEntryChangeEvent extends NavigationCurrentEntryChangeEvent {
  readonly from: FakeNavigationHistoryEntry;
}

/**
 * Create a fake equivalent of `NavigationCurrentEntryChange`. This does not use
 * a class because ES5 transpiled JavaScript cannot extend native Event.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationcurrententrychangeevent-interface
 */
function createFakeNavigationCurrentEntryChangeEvent({
  from,
  navigationType,
}: {
  from: FakeNavigationHistoryEntry;
  navigationType: NavigationType | null;
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
function createPopStateEvent({
  state,
  hasUAVisualTransition,
}: {
  state: unknown;
  hasUAVisualTransition?: boolean;
}) {
  const event = new Event('popstate', {
    bubbles: false,
    cancelable: false,
  }) as {-readonly [P in keyof PopStateEvent]: PopStateEvent[P]};
  event.state = state;
  event.hasUAVisualTransition = hasUAVisualTransition ?? false;
  return event as PopStateEvent;
}

function createHashChangeEvent(newURL: string, oldURL: string) {
  const event = new Event('hashchange', {
    bubbles: false,
    cancelable: false,
  }) as {-readonly [P in keyof HashChangeEvent]: HashChangeEvent[P]};
  event.newURL = newURL;
  event.oldURL = oldURL;
  return event as HashChangeEvent;
}

/**
 * Fake equivalent of `NavigationDestination`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationdestination-interface
 */
export class FakeNavigationDestination implements NavigationDestination {
  url: string;
  readonly sameDocument: boolean;
  readonly key: string;
  readonly id: string;
  readonly index: number;

  state?: unknown;
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
    this.key = key ?? '';
    this.id = id ?? '';
    this.index = index;
  }

  /**
   * https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-navigationdestination-getstate
   *
   * > Return StructuredDeserialize(this's state).
   */
  getState(): unknown {
    return cloneState(this.state);
  }

  /**
   * The classic history API state for this destination. Returned by reference, because it seeds
   * the entry's `history.state`, which has a stable identity.
   */
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

/**
 * Implementation of the spec's "can have its URL rewritten" check, shared by
 * `history.pushState()`/`replaceState()` and `NavigationPrecommitController.redirect()`.
 *
 * > 1. Let documentURL be document's URL.
 * > 2. If targetURL and documentURL differ in their scheme, username, password, host, or port
 * >    components, then return false.
 * > 3. If targetURL's scheme is an HTTP(S) scheme, then return true.
 * > 4. If targetURL's scheme is "file", and targetURL and documentURL differ in their path
 * >    component, then return false.
 * > 5. If targetURL and documentURL differ in their path component or query components, then
 * >    return false.
 * > 6. Return true.
 *
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#can-have-its-url-rewritten
 */
function canHaveUrlRewrittenTo(documentUrl: URL, targetUrl: URL): boolean {
  // `URL.host` is the host and, when it is not the default for the scheme, the port. Comparing it
  // alongside the protocol and credentials covers step 2 in full.
  if (
    targetUrl.protocol !== documentUrl.protocol ||
    targetUrl.username !== documentUrl.username ||
    targetUrl.password !== documentUrl.password ||
    targetUrl.host !== documentUrl.host
  ) {
    return false;
  }
  if (targetUrl.protocol === 'http:' || targetUrl.protocol === 'https:') {
    return true;
  }
  if (targetUrl.protocol === 'file:') {
    return targetUrl.pathname === documentUrl.pathname;
  }
  return targetUrl.pathname === documentUrl.pathname && targetUrl.search === documentUrl.search;
}

const handlerWrappers = new WeakMap<object, Map<string, EventListener>>();

/**
 * Sets an IDL event listener attribute, removing the old listener and adding the new one.
 *
 * The listener is wrapped so that `this` inside the handler is the `Navigation` or
 * `NavigationHistoryEntry` the attribute belongs to, rather than the internal `EventTarget` that
 * actually dispatches the event.
 */
function setEventHandler<H extends ((...args: any[]) => any) | null>(
  target: {
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  },
  type: string,
  next: H,
  context: unknown = target,
): H {
  let targetWrappers = handlerWrappers.get(target);
  if (!targetWrappers) {
    targetWrappers = new Map();
    handlerWrappers.set(target, targetWrappers);
  }
  const existingWrapper = targetWrappers.get(type);
  if (existingWrapper) {
    target.removeEventListener(type, existingWrapper);
    targetWrappers.delete(type);
  }
  if (next) {
    const wrapped: EventListener = function (ev: Event) {
      return next.call(context, ev);
    };
    targetWrappers.set(type, wrapped);
    target.addEventListener(type, wrapped);
  }
  return next;
}

/**
 * Structured clone for state objects.
 *
 * The spec serializes navigation state with `StructuredSerializeForStorage`, which is marginally
 * stricter than `structuredClone()` (it additionally rejects values that cannot be persisted, such
 * as `SharedArrayBuffer`). `structuredClone()` is the closest primitive available here, so a value
 * that a real user agent would reject may still clone successfully in this fake.
 *
 * `structuredClone()` throws its own `DataCloneError` `DOMException`, which carries a more useful
 * message than anything synthesized here, so it is deliberately left unwrapped.
 */
function cloneState<T>(state: T): T {
  if (state === undefined || state === null) {
    return state;
  }
  return structuredClone(state);
}

/** Coerces a state cloning failure into the `DataCloneError` the spec surfaces. */
function asDataCloneError(e: unknown): DOMException {
  return e instanceof DOMException
    ? e
    : new DOMException('The object could not be cloned.', 'DataCloneError');
}

/** The reason used to settle navigations that were still in flight when `dispose()` was called. */
function createDisposedAbortError(): DOMException {
  return new DOMException('Navigation aborted because the Navigation was disposed.', 'AbortError');
}

/**
 * Creates a FakeNavigationResult where both committed and finished promises
 * are rejected with the given error and marked as handled.
 */
function earlyErrorResult(error: DOMException): FakeNavigationResult {
  const committed = Promise.reject(error);
  const finished = Promise.reject(error);
  committed.catch(() => {});
  finished.catch(() => {});
  return {
    committed,
    finished,
  };
}

/**
 * Fake equivalent of `NavigationTransition`.
 * https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-navigationtransition-interface
 */
class InternalNavigationTransition implements NavigationTransition {
  readonly finished: Promise<void>;
  readonly committed: Promise<void>;
  finishedResolve!: () => void;
  finishedReject!: (reason: Error) => void;
  committedResolve!: () => void;
  committedReject!: (reason: Error) => void;
  constructor(
    readonly from: NavigationHistoryEntry,
    readonly to: NavigationDestination,
    readonly navigationType: NavigationType,
  ) {
    this.finished = new Promise<void>((resolve, reject) => {
      this.finishedReject = reject;
      this.finishedResolve = resolve;
    });
    this.committed = new Promise<void>((resolve, reject) => {
      this.committedReject = reject;
      this.committedResolve = resolve;
    });
    // All rejections are handled.
    this.finished.catch(() => {});
    this.committed.catch(() => {});
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

  abort(reason?: unknown) {
    this.abortController.abort(reason);
  }

  constructor(readonly navigation: FakeNavigation) {
    this.committed = new Promise<FakeNavigationHistoryEntry>((resolve, reject) => {
      this.committedResolve = (entry) => {
        this.committedTo = entry;
        resolve(entry);
      };
      this.committedReject = reject;
    });

    this.finished = new Promise<FakeNavigationHistoryEntry>((resolve, reject) => {
      this.finishedResolve = () => {
        if (this.committedTo === null) {
          throw new Error(
            'NavigateEvent should have been committed before resolving finished promise.',
          );
        }
        resolve(this.committedTo);
      };
      // https://html.spec.whatwg.org/multipage/nav-history-apis.html#reject-the-finished-promise
      this.finishedReject = (reason: Error) => {
        this.committedReject(reason);
        reject(reason);
      };
    });
    // All rejections are handled.
    this.committed.catch(() => {});
    this.finished.catch(() => {});
  }
}

/** Internal options for performing a navigate. */
interface InternalNavigateOptions {
  navigationType: NavigationType;
  cancelable: boolean;
  canIntercept: boolean;
  userInitiated: boolean;
  hashChange: boolean;
  info?: unknown;
  hasUAVisualTransition?: boolean;
  sourceElement?: Element | null;
}
