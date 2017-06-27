declare interface ServiceWorkerGlobalScope {
  fetch(url: string|Request);
  caches: CacheStorage;
  clients: Clients;
  addEventListener(type: string, listener: Function, useCapture?: boolean): void;
  removeEventListener(type: string, listener: Function, last?: any): void;
  registration: ServiceWorkerRegistration;
  importScripts(scripts: string): void;
  skipWaiting(): Promise<void>;
}

declare class BroadcastChannel extends EventTarget {
  readonly name: string;
  constructor(name: string);
  postMessage(value: Object): void;
}

declare interface InstallEvent extends ExtendableEvent {}

declare interface ActivateEvent extends ExtendableEvent {}

declare interface FetchEvent extends ExtendableEvent {
  request: Request;
  isReload: boolean;
  clientId: string;
  respondWith(response: Promise<Response>);
}

declare interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): Object;
  text(): string;
}

declare interface PushEvent extends ExtendableEvent { data: PushMessageData; }

declare interface CacheOptions {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
  cacheName?: string;
}

declare interface ExtendableEvent { waitUntil(promise: Promise<any>); }

declare interface Client {
  postMessage(message: any, transfer?: any[]): void;
  readonly id: string;
  readonly url: string;
  readonly frameType: 'auxiliary'|'top-level'|'nested'|'none';
}

declare interface Clients {
  get(id: string): Promise<Client>;
  matchAll(options?: ClientsMatchAllOptions): Promise<Client[]>;
  openWindow(url: string): Promise<Client>;
  claim(): Promise<void>;
}

declare interface ClientsMatchAllOptions {
  includeUncontrolled?: boolean;
  type?: 'window'|'worker'|'sharedworker'|'all';
}
