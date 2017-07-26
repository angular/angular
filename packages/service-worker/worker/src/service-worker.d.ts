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

// CacheStorage API

interface Cache {
  add(request: Request): Promise<void>;
  addAll(requestArray: Array<Request>): Promise<void>;
  'delete'(request: Request, options?: CacheStorageOptions): Promise<boolean>;
  keys(request?: Request, options?: CacheStorageOptions): Promise<Array<string>>;
  match(request: Request, options?: CacheStorageOptions): Promise<Response|undefined>;
  matchAll(request: Request, options?: CacheStorageOptions): Promise<Array<Response>>;
  put(request: Request|string, response: Response): Promise<void>;
}

interface CacheStorage {
  'delete'(cacheName: string): Promise<boolean>;
  has(cacheName: string): Promise<boolean>;
  keys(): Promise<Array<string>>;
  match(request: Request, options?: CacheStorageOptions): Promise<Response|undefined>;
  open(cacheName: string): Promise<Cache>;
}

interface CacheStorageOptions {
  cacheName?: string;
  ignoreMethod?: boolean;
  ignoreSearch?: boolean;
  ignoreVary?: boolean;
}

// Client API

declare class Client {
  frameType: ClientFrameType;
  id: string;
  url: string;
  postMessage(message: any): void;
}

interface Clients {
  claim(): Promise<any>;
  get(id: string): Promise<Client>;
  matchAll(options?: ClientMatchOptions): Promise<Array<Client>>;
}

interface ClientMatchOptions {
  includeUncontrolled?: boolean;
  type?: ClientMatchTypes;
}

interface WindowClient {
  focused: boolean;
  visibilityState: WindowClientState;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient>;
}

type ClientFrameType = 'auxiliary' | 'top-level' | 'nested' | 'none';
type ClientMatchTypes = 'window' | 'worker' | 'sharedworker' | 'all';
type WindowClientState = 'hidden' | 'visible' | 'prerender' | 'unloaded';

// Fetch API

interface FetchEvent extends ExtendableEvent {
  clientId: string|null;
  request: Request;
  respondWith(response: Promise<Response>|Response): Promise<Response>;
}

interface InstallEvent extends ExtendableEvent {
  activeWorker: ServiceWorker;
}

interface ActivateEvent extends ExtendableEvent {}

// Notification API

interface NotificationEvent {
  action: string;
  notification: Notification;
}

// Push API

interface PushEvent extends ExtendableEvent {
  data: PushMessageData;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}

// Sync API

interface SyncEvent extends ExtendableEvent {
  lastChance: boolean;
  tag: string;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  data: any;
  source: Client|Object;
}

// ServiceWorkerGlobalScope

interface ServiceWorkerGlobalScope {
  caches: CacheStorage;
  clients: Clients;
  registration: ServiceWorkerRegistration;

  addEventListener(event: 'activate', fn: (event?: ExtendableEvent) => any): void;
  addEventListener(event: 'message', fn: (event?: ExtendableMessageEvent) => any): void;
  addEventListener(event: 'fetch', fn: (event?: FetchEvent) => any): void;
  addEventListener(event: 'install', fn: (event?: ExtendableEvent) => any): void;
  addEventListener(event: 'push', fn: (event?: PushEvent) => any): void;
  addEventListener(event: 'sync', fn: (event?: SyncEvent) => any): void;

  fetch(request: Request|string): Promise<Response>;
  skipWaiting(): Promise<void>;
}