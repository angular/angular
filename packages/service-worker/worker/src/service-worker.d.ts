// tslint:disable:file-header
/**
 * Copyright (c) 2016, Tiernan Cridland
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without
 * fee is hereby
 * granted, provided that the above copyright notice and this permission notice appear in all
 * copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
 * SOFTWARE INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR
 * PROFITS, WHETHER
 * IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 *
 * Typings for Service Worker
 * @author Tiernan Cridland
 * @email tiernanc@gmail.com
 * @license: ISC
 */
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

// Client API

declare class Client {
    readonly frameType: FrameType;
    readonly id: string;
    readonly type: ClientTypes;
    readonly url: string;
    postMessage(message: any): void;
}

interface Clients {
  claim(): Promise<void>;
  get(id: string): Promise<Client | undefined>;
  matchAll<T extends ClientMatchOptions>(
    options?: T
  ): Promise<ReadonlyArray<T['type'] extends 'window' ? WindowClient : Client>>;
  openWindow(url: string): Promise<WindowClient | null>;
}

interface ClientMatchOptions {
  includeUncontrolled?: boolean;
  type?: ClientTypes;
}

interface WindowClient extends Client {
  readonly focused: boolean;
  readonly visibilityState: VisibilityState;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient | null>;
}

type FrameType = 'auxiliary'|'top-level'|'nested'|'none';
type ClientTypes = 'window'|'worker'|'sharedworker'|'all';
type VisibilityState = 'hidden'|'visible';

// Fetch API

interface FetchEvent extends ExtendableEvent {
  readonly clientId: string;
  readonly preloadResponse: Promise<any>;
  readonly request: Request;
  readonly resultingClientId: string;
  respondWith(r: Response|Promise<Response>): void;
}

// Notification API

interface NotificationEvent extends ExtendableEvent {
  readonly action: string;
  readonly notification: Notification;
}

// Push API

interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData|null;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}

// Sync API

interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: any;
  readonly lastEventId: string;
  readonly origin: string;
  readonly ports: ReadonlyArray<MessagePort>;
  readonly source: Client|ServiceWorker|MessagePort|null;
}

// WorkerGlobalScope

// Explicitly omit the `caches` property to disallow accessing `CacheStorage` APIs directly. All
// interactions with `CacheStorage` should go through a `NamedCacheStorage` instance (exposed by the
// `Adapter`).
interface WorkerGlobalScope extends EventTarget, Omit<WindowOrWorkerGlobalScope, 'caches'> {
  readonly location: WorkerLocation;
  readonly navigator: WorkerNavigator;
  readonly self: WorkerGlobalScope & typeof globalThis;

  importScripts(...urls: string[]): void;
  addEventListener<K extends keyof WorkerGlobalScopeEventMap>(type: K, listener: (this: WorkerGlobalScope, ev: WorkerGlobalScopeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof WorkerGlobalScopeEventMap>(type: K, listener: (this: WorkerGlobalScope, ev: WorkerGlobalScopeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface WorkerGlobalScopeEventMap {
  error: ErrorEvent;
  languagechange: Event;
  offline: Event;
  online: Event;
  rejectionhandled: PromiseRejectionEvent;
  unhandledrejection: PromiseRejectionEvent;
}

// ServiceWorkerGlobalScope

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  readonly clients: Clients;
  readonly registration: ServiceWorkerRegistration;
  readonly serviceWorker: ServiceWorker;

  skipWaiting(): Promise<void>;
  addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(type: K, listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(type: K, listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface ServiceWorkerGlobalScopeEventMap extends WorkerGlobalScopeEventMap {
  activate: ExtendableEvent;
  fetch: FetchEvent;
  install: ExtendableEvent;
  message: ExtendableMessageEvent;
  messageerror: MessageEvent;
  notificationclick: NotificationEvent;
  notificationclose: NotificationEvent;
  push: PushEvent;
  sync: SyncEvent;
}
