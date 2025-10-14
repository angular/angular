/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
export class FakeNavigation {
  /** Equivalent to `navigation.currentEntry`. */
  get currentEntry() {
    return this.entriesArr[this.currentEntryIndex];
  }
  get canGoBack() {
    return this.currentEntryIndex > 0;
  }
  get canGoForward() {
    return this.currentEntryIndex < this.entriesArr.length - 1;
  }
  get window() {
    return this._window;
  }
  constructor(doc, startURL) {
    /**
     * The fake implementation of an entries array. Only same-document entries
     * allowed.
     */
    this.entriesArr = [];
    /**
     * The current active entry index into `entriesArr`.
     */
    this.currentEntryIndex = 0;
    /**
     * The current navigate event.
     * @internal
     */
    this.navigateEvent = null;
    /**
     * A Map of pending traversals, so that traversals to the same entry can be
     * re-used.
     */
    this.traversalQueue = new Map();
    /**
     * A Promise that resolves when the previous traversals have finished. Used to
     * simulate the cross-process communication necessary for traversals.
     */
    this.nextTraversal = Promise.resolve();
    /**
     * A prospective current active entry index, which includes unresolved
     * traversals. Used by `go` to determine where navigations are intended to go.
     */
    this.prospectiveEntryIndex = 0;
    /**
     * A test-only option to make traversals synchronous, rather than emulate
     * cross-process communication.
     */
    this.synchronousTraversals = false;
    /** Whether to allow a call to setInitialEntryForTesting. */
    this.canSetInitialEntry = true;
    /** The next unique id for created entries. Replace recreates this id. */
    this.nextId = 0;
    /** The next unique key for created entries. Replace inherits this id. */
    this.nextKey = 0;
    /** Whether this fake is disposed. */
    this.disposed = false;
    this._transition = null;
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
    this._window = document.defaultView ?? this.createEventTarget();
    this.eventTarget = this.createEventTarget();
    // First entry.
    this.setInitialEntryForTesting(startURL);
  }
  /**
   * Sets the initial entry.
   */
  setInitialEntryForTesting(url, options = {historyState: null}) {
    if (!this.canSetInitialEntry) {
      throw new Error(
        'setInitialEntryForTesting can only be called before any ' + 'navigation has occurred',
      );
    }
    const currentInitialEntry = this.entriesArr[0];
    this.entriesArr[0] = new FakeNavigationHistoryEntry(this.eventTarget, new URL(url).toString(), {
      index: 0,
      key: currentInitialEntry?.key ?? String(this.nextKey++),
      id: currentInitialEntry?.id ?? String(this.nextId++),
      sameDocument: true,
      historyState: options?.historyState,
      state: options.state,
    });
  }
  /** Returns whether the initial entry is still eligible to be set. */
  canSetInitialEntryForTesting() {
    return this.canSetInitialEntry;
  }
  /**
   * Sets whether to emulate traversals as synchronous rather than
   * asynchronous.
   */
  setSynchronousTraversalsForTesting(synchronousTraversals) {
    this.synchronousTraversals = synchronousTraversals;
  }
  /** Equivalent to `navigation.entries()`. */
  entries() {
    return this.entriesArr.slice();
  }
  /** Equivalent to `navigation.navigate()`. */
  navigate(url, options) {
    const fromUrl = new URL(this.currentEntry.url);
    const toUrl = new URL(url, this.currentEntry.url);
    let navigationType;
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
    const intercepted = this.userAgentNavigate(destination, result, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for navigate().
      userInitiated: false,
      hashChange,
      info: options?.info,
    });
    if (!intercepted) {
      this.updateNavigationEntriesForSameDocumentNavigation(this.navigateEvent);
    }
    return {
      committed: result.committed,
      finished: result.finished,
    };
  }
  /** Equivalent to `history.pushState()`. */
  pushState(data, title, url) {
    this.pushOrReplaceState('push', data, title, url);
  }
  /** Equivalent to `history.replaceState()`. */
  replaceState(data, title, url) {
    this.pushOrReplaceState('replace', data, title, url);
  }
  pushOrReplaceState(navigationType, data, _title, url) {
    const fromUrl = new URL(this.currentEntry.url);
    const toUrl = url ? new URL(url, this.currentEntry.url) : fromUrl;
    const hashChange = isHashChange(fromUrl, toUrl);
    const destination = new FakeNavigationDestination({
      url: toUrl.toString(),
      sameDocument: true, // history.pushState/replaceState are always same-document
      historyState: data,
      state: undefined, // No Navigation API state directly from history.pushState
    });
    const result = new InternalNavigationResult(this);
    const intercepted = this.userAgentNavigate(destination, result, {
      navigationType,
      cancelable: true,
      canIntercept: true,
      // Always false for pushState() or replaceState().
      userInitiated: false,
      hashChange,
    });
    if (intercepted) {
      return;
    }
    this.updateNavigationEntriesForSameDocumentNavigation(this.navigateEvent);
  }
  /** Equivalent to `navigation.traverseTo()`. */
  traverseTo(key, options) {
    const fromUrl = new URL(this.currentEntry.url);
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
      const existingResult = this.traversalQueue.get(entry.key);
      return {
        committed: existingResult.committed,
        finished: existingResult.finished,
      };
    }
    const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
    const destination = new FakeNavigationDestination({
      url: entry.url,
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
      const intercepted = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for traverseTo().
        userInitiated: false,
        hashChange,
        info: options?.info,
      });
      if (!intercepted) {
        this.userAgentTraverse(this.navigateEvent);
      }
    });
    return {
      committed: result.committed,
      finished: result.finished,
    };
  }
  /** Equivalent to `navigation.back()`. */
  back(options) {
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
  forward(options) {
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
  go(direction) {
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
      const fromUrl = new URL(this.currentEntry.url);
      const entry = this.entriesArr[targetIndex];
      const hashChange = isHashChange(fromUrl, new URL(entry.url, this.currentEntry.url));
      const destination = new FakeNavigationDestination({
        url: entry.url,
        state: entry.getState(),
        historyState: entry.getHistoryState(),
        key: entry.key,
        id: entry.id,
        index: entry.index,
        sameDocument: entry.sameDocument,
      });
      const result = new InternalNavigationResult(this);
      const intercepted = this.userAgentNavigate(destination, result, {
        navigationType: 'traverse',
        cancelable: true,
        canIntercept: true,
        // Always false for go().
        userInitiated: false,
        hashChange,
      });
      if (!intercepted) {
        this.userAgentTraverse(this.navigateEvent);
      }
    });
  }
  /** Runs a traversal synchronously or asynchronously */
  runTraversal(traversal) {
    if (this.synchronousTraversals) {
      traversal();
      return;
    }
    // Each traversal occupies a single timeout resolution.
    // This means that Promises added to commit and finish should resolve
    // before the next traversal.
    this.nextTraversal = this.nextTraversal.then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          traversal();
        });
      });
    });
  }
  /** Equivalent to `navigation.addEventListener()`. */
  addEventListener(type, callback, options) {
    this.eventTarget.addEventListener(type, callback, options);
  }
  /** Equivalent to `navigation.removeEventListener()`. */
  removeEventListener(type, callback, options) {
    this.eventTarget.removeEventListener(type, callback, options);
  }
  /** Equivalent to `navigation.dispatchEvent()` */
  dispatchEvent(event) {
    return this.eventTarget.dispatchEvent(event);
  }
  /** Cleans up resources. */
  dispose() {
    // Recreate eventTarget to release current listeners.
    this.eventTarget = this.createEventTarget();
    this.disposed = true;
  }
  /** Returns whether this fake is disposed. */
  isDisposed() {
    return this.disposed;
  }
  abortOngoingNavigation(eventToAbort, reason) {
    if (this.navigateEvent !== eventToAbort) {
      return;
    }
    if (this.navigateEvent.abortController.signal.aborted) {
      return;
    }
    const abortReason = reason ?? new DOMException('Navigation aborted', 'AbortError');
    this.navigateEvent.cancel(abortReason);
  }
  /**
   * Implementation for all navigations and traversals.
   * @returns true if the event was intercepted, otherwise false
   */
  userAgentNavigate(destination, result, options) {
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
      sameDocument: destination.sameDocument,
      result,
    });
    return !dispatchResultIsTrueIfNoInterception;
  }
  /**
   * Implementation for a push or replace navigation.
   * https://whatpr.org/html/10919/browsing-the-web.html#url-and-history-update-steps
   * https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   * @internal
   */
  urlAndHistoryUpdateSteps(navigateEvent) {
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
   * @internal
   */
  userAgentTraverse(navigateEvent) {
    const oldUrl = this.currentEntry.url;
    this.updateNavigationEntriesForSameDocumentNavigation(navigateEvent);
    // Happens as part of "updating the document" steps https://whatpr.org/html/10919/browsing-the-web.html#updating-the-document
    const popStateEvent = createPopStateEvent({
      state: navigateEvent.destination.getHistoryState(),
    });
    this._window.dispatchEvent(popStateEvent);
    if (navigateEvent.hashChange) {
      const hashchangeEvent = createHashChangeEvent(oldUrl, this.currentEntry.url);
      this._window.dispatchEvent(hashchangeEvent);
    }
  }
  /**
   * https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
   * @internal
   */
  updateNavigationEntriesForSameDocumentNavigation({destination, navigationType, result}) {
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
      const key =
        navigationType === 'push'
          ? String(this.nextKey++)
          : (oldCurrentNHE?.key ?? String(this.nextKey++));
      const newNHE = new FakeNavigationHistoryEntry(this.eventTarget, destination.url, {
        id: String(this.nextId++),
        key,
        index,
        sameDocument: true,
        state: destination.getState(),
        historyState: destination.getHistoryState(),
      });
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
  findEntry(key) {
    for (const entry of this.entriesArr) {
      if (entry.key === key) return entry;
    }
    return undefined;
  }
  set onnavigate(
    // tslint:disable-next-line:no-any
    _handler,
  ) {
    throw new Error('unimplemented');
  }
  // tslint:disable-next-line:no-any
  get onnavigate() {
    throw new Error('unimplemented');
  }
  set oncurrententrychange(_handler) {
    throw new Error('unimplemented');
  }
  get oncurrententrychange() {
    throw new Error('unimplemented');
  }
  set onnavigatesuccess(
    // tslint:disable-next-line:no-any
    _handler,
  ) {
    throw new Error('unimplemented');
  }
  // tslint:disable-next-line:no-any
  get onnavigatesuccess() {
    throw new Error('unimplemented');
  }
  set onnavigateerror(
    // tslint:disable-next-line:no-any
    _handler,
  ) {
    throw new Error('unimplemented');
  }
  // tslint:disable-next-line:no-any
  get onnavigateerror() {
    throw new Error('unimplemented');
  }
  /** @internal */
  set transition(t) {
    this._transition = t;
  }
  get transition() {
    return this._transition;
  }
  updateCurrentEntry(_options) {
    throw new Error('unimplemented');
  }
  reload(_options) {
    throw new Error('unimplemented');
  }
}
/**
 * Fake equivalent of `NavigationHistoryEntry`.
 */
export class FakeNavigationHistoryEntry {
  constructor(eventTarget, url, {id, key, index, sameDocument, state, historyState}) {
    this.eventTarget = eventTarget;
    this.url = url;
    // tslint:disable-next-line:no-any
    this.ondispose = null;
    this.id = id;
    this.key = key;
    this.index = index;
    this.sameDocument = sameDocument;
    this.state = state;
    this.historyState = historyState;
  }
  getState() {
    // Budget copy.
    return this.state ? JSON.parse(JSON.stringify(this.state)) : this.state;
  }
  getHistoryState() {
    // Budget copy.
    return this.historyState ? JSON.parse(JSON.stringify(this.historyState)) : this.historyState;
  }
  addEventListener(type, callback, options) {
    this.eventTarget.addEventListener(type, callback, options);
  }
  removeEventListener(type, callback, options) {
    this.eventTarget.removeEventListener(type, callback, options);
  }
  dispatchEvent(event) {
    return this.eventTarget.dispatchEvent(event);
  }
  /** internal */
  dispose() {
    const disposeEvent = new Event('disposed');
    this.dispatchEvent(disposeEvent);
    // release current listeners
    this.eventTarget = null;
  }
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
  destination,
  info,
  sameDocument,
  result,
}) {
  const {navigation} = result;
  const eventAbortController = new AbortController();
  const event = new Event('navigate', {bubbles: false, cancelable});
  event.navigationType = navigationType;
  event.destination = destination;
  event.canIntercept = canIntercept;
  event.userInitiated = userInitiated;
  event.hashChange = hashChange;
  event.signal = eventAbortController.signal;
  event.abortController = eventAbortController;
  event.info = info;
  event.focusResetBehavior = null;
  event.scrollBehavior = null;
  event.interceptionState = 'none';
  event.downloadRequest = null;
  event.formData = null;
  event.result = result;
  event.sameDocument = sameDocument;
  let precommitHandlers = [];
  let handlers = [];
  // https://whatpr.org/html/10919/nav-history-apis.html#dom-navigateevent-intercept
  event.intercept = function (options) {
    if (!this.canIntercept) {
      throw new DOMException(`Cannot intercept when canIntercept is 'false'`, 'SecurityError');
    }
    this.interceptionState = 'intercepted';
    event.sameDocument = true;
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
    if (event.interceptionState !== 'none' && event.interceptionState !== 'intercepted') {
      throw new Error('Event interceptionState should be "none" or "intercepted"');
    }
    event.interceptionState = 'intercepted';
    const handler = options?.handler;
    if (handler) {
      handlers.push(handler);
    }
    // override old options with new ones. UA _may_ report a console warning if new options differ from previous
    event.focusResetBehavior = options?.focusReset ?? event.focusResetBehavior;
    event.scrollBehavior = options?.scroll ?? event.scrollBehavior;
  };
  // https://whatpr.org/html/10919/nav-history-apis.html#dom-navigateevent-scroll
  event.scroll = function () {
    if (event.interceptionState !== 'committed') {
      throw new DOMException(
        `Failed to execute 'scroll' on 'NavigateEvent': scroll() must be ` +
          `called after commit() and interception options must specify manual scroll.`,
        'InvalidStateError',
      );
    }
    processScrollBehavior(event);
  };
  // https://whatpr.org/html/10919/nav-history-apis.html#dom-navigationprecommitcontroller-redirect
  function redirect(url, options = {}) {
    if (event.interceptionState === 'none') {
      throw new Error('cannot redirect when event is not intercepted');
    }
    if (event.interceptionState !== 'intercepted') {
      throw new DOMException(
        `cannot redirect when event is not in 'intercepted' state`,
        'InvalidStateError',
      );
    }
    if (event.navigationType !== 'push' && event.navigationType !== 'replace') {
      throw new DOMException(
        `cannot redirect when navigationType is not 'push' or 'replace`,
        'InvalidStateError',
      );
    }
    const destinationUrl = new URL(url, navigation.currentEntry.url);
    if (options.history === 'push' || options.history === 'replace') {
      event.navigationType = options.history;
    }
    if (options.hasOwnProperty('state')) {
      event.destination.state = options.state;
    }
    event.destination.url = destinationUrl.href;
    if (options.hasOwnProperty('info')) {
      event.info = options.info;
    }
  }
  // https://whatpr.org/html/10919/nav-history-apis.html#inner-navigate-event-firing-algorithm
  // "Let commit be the following steps:"
  function commit() {
    if (result.signal.aborted) {
      return;
    }
    navigation.transition?.committedResolve();
    if (event.interceptionState === 'intercepted') {
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
    const promisesList = handlers.map((handler) => handler());
    if (promisesList.length === 0) {
      promisesList.push(Promise.resolve());
    }
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
        navigation.transition?.finishedResolve();
        navigation.transition = null;
      })
      .catch((reason) => {
        if (!event.abortController.signal.aborted) {
          event.cancel(reason);
        }
      });
  }
  // Internal only.
  // https://whatpr.org/html/10919/nav-history-apis.html#inner-navigate-event-firing-algorithm
  // "Let cancel be the following steps given reason"
  event.cancel = function (reason) {
    if (result.signal.aborted) {
      return;
    }
    this.abortController.abort(reason);
    const isCurrentGlobalNavigationEvent = this === navigation.navigateEvent;
    if (isCurrentGlobalNavigationEvent) {
      navigation.navigateEvent = null;
    }
    if (this.interceptionState !== 'intercepted' && this.interceptionState !== 'finished') {
      finishNavigationEvent(this, false);
    } else if (this.interceptionState === 'intercepted') {
      this.interceptionState = 'finished';
    }
    result.committedReject(reason);
    result.finishedReject(reason);
    const navigateerrorEvent = new Event('navigateerror', {
      bubbles: false,
      cancelable,
    });
    navigateerrorEvent.error = reason;
    navigation.eventTarget.dispatchEvent(navigateerrorEvent);
    const transition = navigation.transition;
    transition?.committedReject(reason);
    transition?.finishedReject(reason);
    navigation.transition = null;
  };
  function dispatch() {
    navigation.navigateEvent = event;
    const dispatchResult = navigation.eventTarget.dispatchEvent(event);
    if (event.interceptionState === 'intercepted') {
      if (!navigation.currentEntry) {
        event.cancel(
          new DOMException(
            'Cannot create transition without a currentEntry for intercepted navigation.',
            'InvalidStateError',
          ),
        );
        return;
      }
      const transition = new InternalNavigationTransition(navigation.currentEntry, navigationType);
      navigation.transition = transition;
      // Mark transition.finished as handled (Spec Step 33.4)
      transition.finished.catch(() => {});
      transition.committed.catch(() => {});
    }
    if (!dispatchResult && event.cancelable) {
      if (!event.abortController.signal.aborted) {
        event.cancel(
          new DOMException('Navigation prevented by event.preventDefault()', 'AbortError'),
        );
      }
    } else {
      if (precommitHandlers.length === 0) {
        commit();
      } else {
        const precommitController = {redirect};
        const precommitPromisesList = precommitHandlers.map((handler) => {
          let p;
          try {
            p = handler(precommitController);
          } catch (e) {
            p = Promise.reject(e);
          }
          p.catch(() => {});
          return p;
        });
        Promise.all(precommitPromisesList)
          .then(() => commit())
          .catch((reason) => {
            if (event.abortController.signal.aborted) {
              return;
            }
            if (navigation.transition) {
              navigation.transition.committedReject(reason);
            }
            event.cancel(reason);
          });
      }
    }
  }
  dispatch();
  return event.interceptionState === 'none';
}
/** https://whatpr.org/html/10919/nav-history-apis.html#navigateevent-finish */
function finishNavigationEvent(event, didFulfill) {
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
/** https://whatpr.org/html/10919/nav-history-apis.html#potentially-reset-the-focus */
function potentiallyResetFocus(event) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset focus if navigation event is not committed or scrolled');
  }
  if (event.focusResetBehavior === 'manual') {
    return;
  }
  // TODO(atscott): the rest of the steps
}
function potentiallyResetScroll(event) {
  if (event.interceptionState !== 'committed' && event.interceptionState !== 'scrolled') {
    throw new Error('cannot reset scroll if navigation event is not committed or scrolled');
  }
  if (event.interceptionState === 'scrolled' || event.scrollBehavior === 'manual') {
    return;
  }
  processScrollBehavior(event);
}
/* https://whatpr.org/html/10919/nav-history-apis.html#process-scroll-behavior */
function processScrollBehavior(event) {
  if (event.interceptionState !== 'committed') {
    throw new Error('invalid event interception state when processing scroll behavior');
  }
  event.interceptionState = 'scrolled';
  // TODO(atscott): the rest of the steps
}
/**
 * Create a fake equivalent of `NavigationCurrentEntryChange`. This does not use
 * a class because ES5 transpiled JavaScript cannot extend native Event.
 */
function createFakeNavigationCurrentEntryChangeEvent({from, navigationType}) {
  const event = new Event('currententrychange', {
    bubbles: false,
    cancelable: false,
  });
  event.from = from;
  event.navigationType = navigationType;
  return event;
}
/**
 * Create a fake equivalent of `PopStateEvent`. This does not use a class
 * because ES5 transpiled JavaScript cannot extend native Event.
 */
function createPopStateEvent({state}) {
  const event = new Event('popstate', {
    bubbles: false,
    cancelable: false,
  });
  event.state = state;
  return event;
}
function createHashChangeEvent(newURL, oldURL) {
  const event = new Event('hashchange', {
    bubbles: false,
    cancelable: false,
  });
  event.newURL = newURL;
  event.oldURL = oldURL;
  return event;
}
/**
 * Fake equivalent of `NavigationDestination`.
 */
export class FakeNavigationDestination {
  constructor({url, sameDocument, historyState, state, key = null, id = null, index = -1}) {
    this.url = url;
    this.sameDocument = sameDocument;
    this.state = state;
    this.historyState = historyState;
    this.key = key;
    this.id = id;
    this.index = index;
  }
  getState() {
    return this.state;
  }
  getHistoryState() {
    return this.historyState;
  }
}
/** Utility function to determine whether two UrlLike have the same hash. */
function isHashChange(from, to) {
  return (
    to.hash !== from.hash &&
    to.hostname === from.hostname &&
    to.pathname === from.pathname &&
    to.search === from.search
  );
}
class InternalNavigationTransition {
  constructor(from, navigationType) {
    this.from = from;
    this.navigationType = navigationType;
    this.finished = new Promise((resolve, reject) => {
      this.finishedReject = reject;
      this.finishedResolve = resolve;
    });
    this.committed = new Promise((resolve, reject) => {
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
  get signal() {
    return this.abortController.signal;
  }
  constructor(navigation) {
    this.navigation = navigation;
    this.committedTo = null;
    this.abortController = new AbortController();
    this.committed = new Promise((resolve, reject) => {
      this.committedResolve = (entry) => {
        this.committedTo = entry;
        resolve(entry);
      };
      this.committedReject = reject;
    });
    this.finished = new Promise((resolve, reject) => {
      this.finishedResolve = () => {
        if (this.committedTo === null) {
          throw new Error(
            'NavigateEvent should have been committed before resolving finished promise.',
          );
        }
        resolve(this.committedTo);
      };
      this.finishedReject = (reason) => {
        reject(reason);
        this.abortController.abort(reason);
      };
    });
    // All rejections are handled.
    this.committed.catch(() => {});
    this.finished.catch(() => {});
  }
}
//# sourceMappingURL=fake_navigation.js.map
