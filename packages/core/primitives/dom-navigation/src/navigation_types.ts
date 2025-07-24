/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// TODO: Figure out how to use the types from NPM in the public API

export interface NavigationEventMap {
  navigate: NavigateEvent;
  navigatesuccess: Event;
  navigateerror: ErrorEvent;
  currententrychange: NavigationCurrentEntryChangeEvent;
}

export interface NavigationResult {
  committed: Promise<NavigationHistoryEntry>;
  finished: Promise<NavigationHistoryEntry>;
}

export declare class Navigation extends EventTarget {
  entries(): NavigationHistoryEntry[];
  readonly currentEntry: NavigationHistoryEntry | null;
  updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
  readonly transition: NavigationTransition | null;

  readonly canGoBack: boolean;
  readonly canGoForward: boolean;

  navigate(url: string, options?: NavigationNavigateOptions): NavigationResult;
  reload(options?: NavigationReloadOptions): NavigationResult;

  traverseTo(key: string, options?: NavigationOptions): NavigationResult;
  back(options?: NavigationOptions): NavigationResult;
  forward(options?: NavigationOptions): NavigationResult;

  onnavigate: ((this: Navigation, ev: NavigateEvent) => any) | null;
  onnavigatesuccess: ((this: Navigation, ev: Event) => any) | null;
  onnavigateerror: ((this: Navigation, ev: ErrorEvent) => any) | null;
  oncurrententrychange: ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null;

  addEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (this: Navigation, ev: NavigationEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (this: Navigation, ev: NavigationEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export declare class NavigationTransition {
  readonly navigationType: NavigationTypeString;
  readonly from: NavigationHistoryEntry;
  readonly finished: Promise<void>;
  readonly committed: Promise<void>;
}

export interface NavigationHistoryEntryEventMap {
  dispose: Event;
}

export declare class NavigationHistoryEntry extends EventTarget {
  readonly key: string;
  readonly id: string;
  readonly url: string | null;
  readonly index: number;
  readonly sameDocument: boolean;

  getState(): unknown;

  ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null;

  addEventListener<K extends keyof NavigationHistoryEntryEventMap>(
    type: K,
    listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof NavigationHistoryEntryEventMap>(
    type: K,
    listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export type NavigationTypeString = 'reload' | 'push' | 'replace' | 'traverse';

export interface NavigationUpdateCurrentEntryOptions {
  state: unknown;
}

export interface NavigationOptions {
  info?: unknown;
}

export interface NavigationNavigateOptions extends NavigationOptions {
  state?: unknown;
  history?: 'auto' | 'push' | 'replace';
}

export interface NavigationReloadOptions extends NavigationOptions {
  state?: unknown;
}

export declare class NavigationCurrentEntryChangeEvent extends Event {
  constructor(type: string, eventInit?: NavigationCurrentEntryChangeEventInit);

  readonly navigationType: NavigationTypeString | null;
  readonly from: NavigationHistoryEntry;
}

export interface NavigationCurrentEntryChangeEventInit extends EventInit {
  navigationType?: NavigationTypeString | null;
  from: NavigationHistoryEntry;
}

export declare class NavigateEvent extends Event {
  constructor(type: string, eventInit?: NavigateEventInit);

  readonly navigationType: NavigationTypeString;
  readonly canIntercept: boolean;
  readonly userInitiated: boolean;
  readonly hashChange: boolean;
  readonly destination: NavigationDestination;
  readonly signal: AbortSignal;
  readonly formData: FormData | null;
  readonly downloadRequest: string | null;
  readonly info?: unknown;

  intercept(options?: NavigationInterceptOptions): void;
  scroll(): void;
}

export interface NavigateEventInit extends EventInit {
  navigationType?: NavigationTypeString;
  canIntercept?: boolean;
  userInitiated?: boolean;
  hashChange?: boolean;
  destination: NavigationDestination;
  signal: AbortSignal;
  formData?: FormData | null;
  downloadRequest?: string | null;
  info?: unknown;
}

export interface NavigationInterceptOptions {
  handler?: () => Promise<void>;
  focusReset?: 'after-transition' | 'manual';
  scroll?: 'after-transition' | 'manual';
}

export declare class NavigationDestination {
  readonly url: string;
  readonly key: string | null;
  readonly id: string | null;
  readonly index: number;
  readonly sameDocument: boolean;

  getState(): unknown;
}
