/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { NavigationNavigateOptions, NavigationOptions, NavigateEvent, NavigationCurrentEntryChangeEvent, NavigationTransition, NavigationUpdateCurrentEntryOptions, NavigationReloadOptions, NavigationResult, NavigationHistoryEntry, NavigationInterceptOptions, NavigationDestination, Navigation } from '../src/navigation_types';
/**
 * Fake implementation of user agent history and navigation behavior. This is a
 * high-fidelity implementation of browser behavior that attempts to emulate
 * things like traversal delay.
 */
export declare class FakeNavigation implements Navigation {
    /**
     * The fake implementation of an entries array. Only same-document entries
     * allowed.
     */
    private readonly entriesArr;
    /**
     * The current active entry index into `entriesArr`.
     */
    private currentEntryIndex;
    /**
     * The current navigate event.
     * @internal
     */
    navigateEvent: InternalFakeNavigateEvent | null;
    /**
     * A Map of pending traversals, so that traversals to the same entry can be
     * re-used.
     */
    private readonly traversalQueue;
    /**
     * A Promise that resolves when the previous traversals have finished. Used to
     * simulate the cross-process communication necessary for traversals.
     */
    private nextTraversal;
    /**
     * A prospective current active entry index, which includes unresolved
     * traversals. Used by `go` to determine where navigations are intended to go.
     */
    private prospectiveEntryIndex;
    /**
     * A test-only option to make traversals synchronous, rather than emulate
     * cross-process communication.
     */
    private synchronousTraversals;
    /** Whether to allow a call to setInitialEntryForTesting. */
    private canSetInitialEntry;
    /**
     * `EventTarget` to dispatch events.
     * @internal
     */
    eventTarget: EventTarget;
    /** The next unique id for created entries. Replace recreates this id. */
    private nextId;
    /** The next unique key for created entries. Replace inherits this id. */
    private nextKey;
    /** Whether this fake is disposed. */
    private disposed;
    /** Equivalent to `navigation.currentEntry`. */
    get currentEntry(): FakeNavigationHistoryEntry;
    get canGoBack(): boolean;
    get canGoForward(): boolean;
    private readonly createEventTarget;
    private readonly _window;
    get window(): Pick<Window, 'addEventListener' | 'removeEventListener'>;
    constructor(doc: Document, startURL: `http${string}`);
    /**
     * Sets the initial entry.
     */
    setInitialEntryForTesting(url: `http${string}`, options?: {
        historyState: unknown;
        state?: unknown;
    }): void;
    /** Returns whether the initial entry is still eligible to be set. */
    canSetInitialEntryForTesting(): boolean;
    /**
     * Sets whether to emulate traversals as synchronous rather than
     * asynchronous.
     */
    setSynchronousTraversalsForTesting(synchronousTraversals: boolean): void;
    /** Equivalent to `navigation.entries()`. */
    entries(): FakeNavigationHistoryEntry[];
    /** Equivalent to `navigation.navigate()`. */
    navigate(url: string, options?: NavigationNavigateOptions): FakeNavigationResult;
    /** Equivalent to `history.pushState()`. */
    pushState(data: unknown, title: string, url?: string): void;
    /** Equivalent to `history.replaceState()`. */
    replaceState(data: unknown, title: string, url?: string): void;
    private pushOrReplaceState;
    /** Equivalent to `navigation.traverseTo()`. */
    traverseTo(key: string, options?: NavigationOptions): FakeNavigationResult;
    /** Equivalent to `navigation.back()`. */
    back(options?: NavigationOptions): FakeNavigationResult;
    /** Equivalent to `navigation.forward()`. */
    forward(options?: NavigationOptions): FakeNavigationResult;
    /**
     * Equivalent to `history.go()`.
     * Note that this method does not actually work precisely to how Chrome
     * does, instead choosing a simpler model with less unexpected behavior.
     * Chrome has a few edge case optimizations, for instance with repeated
     * `back(); forward()` chains it collapses certain traversals.
     */
    go(direction: number): void;
    /** Runs a traversal synchronously or asynchronously */
    private runTraversal;
    /** Equivalent to `navigation.addEventListener()`. */
    addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
    /** Equivalent to `navigation.removeEventListener()`. */
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
    /** Equivalent to `navigation.dispatchEvent()` */
    dispatchEvent(event: Event): boolean;
    /** Cleans up resources. */
    dispose(): void;
    /** Returns whether this fake is disposed. */
    isDisposed(): boolean;
    abortOngoingNavigation(eventToAbort: InternalFakeNavigateEvent, reason?: Error): void;
    /**
     * Implementation for all navigations and traversals.
     * @returns true if the event was intercepted, otherwise false
     */
    private userAgentNavigate;
    /**
     * Implementation for a push or replace navigation.
     * https://whatpr.org/html/10919/browsing-the-web.html#url-and-history-update-steps
     * https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
     * @internal
     */
    urlAndHistoryUpdateSteps(navigateEvent: InternalFakeNavigateEvent): void;
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
    userAgentTraverse(navigateEvent: InternalFakeNavigateEvent): void;
    /**
     * https://whatpr.org/html/10919/nav-history-apis.html#update-the-navigation-api-entries-for-a-same-document-navigation
     * @internal
     */
    updateNavigationEntriesForSameDocumentNavigation({ destination, navigationType, result, }: InternalFakeNavigateEvent): void;
    /** Utility method for finding entries with the given `key`. */
    private findEntry;
    set onnavigate(_handler: ((this: Navigation, ev: NavigateEvent) => any) | null);
    get onnavigate(): ((this: Navigation, ev: NavigateEvent) => any) | null;
    set oncurrententrychange(_handler: // tslint:disable-next-line:no-any
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null);
    get oncurrententrychange(): // tslint:disable-next-line:no-any
    ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null;
    set onnavigatesuccess(_handler: ((this: Navigation, ev: Event) => any) | null);
    get onnavigatesuccess(): ((this: Navigation, ev: Event) => any) | null;
    set onnavigateerror(_handler: ((this: Navigation, ev: ErrorEvent) => any) | null);
    get onnavigateerror(): ((this: Navigation, ev: ErrorEvent) => any) | null;
    private _transition;
    /** @internal */
    set transition(t: NavigationTransition | null);
    get transition(): NavigationTransition | null;
    updateCurrentEntry(_options: NavigationUpdateCurrentEntryOptions): void;
    reload(_options?: NavigationReloadOptions): NavigationResult;
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
export declare class FakeNavigationHistoryEntry implements NavigationHistoryEntry {
    private eventTarget;
    readonly url: string | null;
    readonly sameDocument: boolean;
    readonly id: string;
    readonly key: string;
    readonly index: number;
    private readonly state;
    private readonly historyState;
    ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null;
    constructor(eventTarget: EventTarget, url: string | null, { id, key, index, sameDocument, state, historyState, }: {
        id: string;
        key: string;
        index: number;
        sameDocument: boolean;
        historyState: unknown;
        state?: unknown;
    });
    getState(): unknown;
    getHistoryState(): unknown;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void;
    dispatchEvent(event: Event): boolean;
    /** internal */
    dispose(): void;
}
/** `NavigationInterceptOptions` with experimental commit option. */
export interface ExperimentalNavigationInterceptOptions extends NavigationInterceptOptions {
    precommitHandler?: (controller: NavigationPrecommitController) => Promise<void>;
}
export interface NavigationPrecommitController {
    redirect: (url: string, options?: NavigationNavigateOptions) => void;
}
export interface ExperimentalNavigateEvent extends NavigateEvent {
    intercept(options?: ExperimentalNavigationInterceptOptions): void;
    precommitHandler?: () => Promise<void>;
}
/**
 * Fake equivalent of `NavigateEvent`.
 */
export interface FakeNavigateEvent extends ExperimentalNavigateEvent {
    readonly destination: FakeNavigationDestination;
}
interface InternalFakeNavigateEvent extends FakeNavigateEvent {
    readonly sameDocument: boolean;
    readonly result: InternalNavigationResult;
    interceptionState: 'none' | 'intercepted' | 'committed' | 'scrolled' | 'finished';
    scrollBehavior: 'after-transition' | 'manual' | null;
    focusResetBehavior: 'after-transition' | 'manual' | null;
    abortController: AbortController;
    cancel(reason: Error): void;
}
/** Fake equivalent of `NavigationCurrentEntryChangeEvent`. */
export interface FakeNavigationCurrentEntryChangeEvent extends NavigationCurrentEntryChangeEvent {
    readonly from: FakeNavigationHistoryEntry;
}
/**
 * Fake equivalent of `NavigationDestination`.
 */
export declare class FakeNavigationDestination implements NavigationDestination {
    url: string;
    readonly sameDocument: boolean;
    readonly key: string | null;
    readonly id: string | null;
    readonly index: number;
    state?: unknown;
    private readonly historyState;
    constructor({ url, sameDocument, historyState, state, key, id, index, }: {
        url: string;
        sameDocument: boolean;
        historyState: unknown;
        state?: unknown;
        key?: string | null;
        id?: string | null;
        index?: number;
    });
    getState(): unknown;
    getHistoryState(): unknown;
}
/**
 * Internal utility class for representing the result of a navigation.
 * Generally equivalent to the "apiMethodTracker" in the spec.
 */
declare class InternalNavigationResult {
    readonly navigation: FakeNavigation;
    committedTo: FakeNavigationHistoryEntry | null;
    committedResolve: (entry: FakeNavigationHistoryEntry) => void;
    committedReject: (reason: Error) => void;
    finishedResolve: () => void;
    finishedReject: (reason: Error) => void;
    readonly committed: Promise<FakeNavigationHistoryEntry>;
    readonly finished: Promise<FakeNavigationHistoryEntry>;
    get signal(): AbortSignal;
    private readonly abortController;
    constructor(navigation: FakeNavigation);
}
export {};
