/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Clock, NgSwAdapter, NgSwCache, NgSwCacheImpl, NgSwEvents, NgSwFetch} from '@angular/service-worker/sdk';

import {MockCacheStorage, MockRequest, MockResponse} from './cache';

export class TestAdapter implements NgSwAdapter {
  newRequest(req: string|Request, options = {}): Request { return new MockRequest(req, options); }

  newResponse(body: string|Blob, init = {}): Response { return new MockResponse(body, init); }

  get scope(): string { return 'http://localhost'; }
}

export class MockClient implements Client {
  constructor(public id: string, public url: string) {}

  get frameType(): 'auxiliary'|'top-level'|'nested'|'none' { return 'top-level'; }

  postMessage(message: any, transfer?: any[]): void { throw 'Not implemented'; }
}

export class MockClients implements Clients {
  clients: {[id: string]: Client} = {};
  index: number = 0;

  clear(): void { this.clients = {}; }

  add(): string {
    const id = `client-${this.index++}`;
    this.clients[id] = new MockClient(id, '/');
    return id;
  }

  get(id: string): Promise<Client> { return Promise.resolve(this.clients[id]); }

  matchAll(options?: ClientsMatchAllOptions): Promise<Client[]> {
    return Promise.resolve(Object.keys(this.clients).map(id => this.clients[id]));
  }

  openWindow(url: string): Promise<Client> { return Promise.reject('not implemented'); }

  claim(): Promise<void> { return Promise.resolve(); }
}

export class TestWorkerScope implements ServiceWorkerGlobalScope {
  constructor(public caches: CacheStorage, public clients: MockClients) {}

  installListener: Function = () => null;
  activateListener: Function = () => null;
  fetchListener: Function = () => null;

  mockResponses: {[key: string]: {response: MockResponse, exact: boolean}} = {};

  mockFetch(url: string, response: string|MockResponse, exact: boolean) {
    if (typeof response == 'string') {
      response = new MockResponse(<string>response);
    }
    this.mockResponses[url] = {response, exact};
  }

  unmockFetch(url: string): void { delete this.mockResponses[url]; }

  unmockAll(): void { this.mockResponses = {}; }

  get registration(): ServiceWorkerRegistration { return null !; }

  importScripts(scripts: string): void { require(scripts); }

  fetch(req: string|Request): Promise<Response> {
    const fullUrl: string = (typeof req == 'string') ? <string>req : (<Request>req).url;
    const url = fullUrl.split('?')[0];
    if (this.mockResponses.hasOwnProperty(url)) {
      const mock = this.mockResponses[url];
      if (mock.exact && url !== fullUrl) {
        return Promise.reject(new Error(`${url} != ${fullUrl} but exact match required`));
      }
      return Promise.resolve(mock.response.clone());
    }
    var resp = new MockResponse('');
    resp.ok = false;
    resp.status = 404;
    resp.statusText = 'File Not Found';
    return Promise.resolve(resp);
  }

  addEventListener(type: string, listener: Function): void {
    switch (type) {
      case 'install':
        this.installListener = listener;
        break;
      case 'activate':
        this.activateListener = listener;
        break;
      case 'fetch':
        this.fetchListener = listener;
        break;
      case 'message':
      case 'push':
        // Ignore.
        break;
      default:
        throw `Registering listener for unknown event: ${type}`;
    }
  }

  removeEventListener(type: string, listener: Function): void { throw 'Remove unsupported!'; }

  skipWaiting(): Promise<void> { return Promise.resolve(); }
}

interface TestExtendableEvent extends ExtendableEvent {
  done: Promise<any>;
}

interface TestInstallEvent extends TestExtendableEvent, InstallEvent {}
interface TestActivateEvent extends TestExtendableEvent, ActivateEvent {}
interface TestFetchEvent extends TestExtendableEvent, FetchEvent {}

export interface TestWorkerCreationFn {
  (scope: ServiceWorkerGlobalScope, adapter: NgSwAdapter, cache: NgSwCache, fetch: NgSwFetch,
   events: NgSwEvents, clock: Clock): any;
}

export class TestWorkerDriver {
  instance: any;
  scope: TestWorkerScope;
  caches: MockCacheStorage = new MockCacheStorage();
  clients: MockClients = new MockClients();
  lifecycle: Promise<any> = Promise.resolve(null);
  clock: Clock = new MockClock();

  constructor(private createWorker: TestWorkerCreationFn) {
    this.scope = new TestWorkerScope(this.caches, this.clients);
  }

  waitForReady(): Promise<void> { return this.instance.ready; }

  forceStartup(): Promise<void> {
    if (!this.instance.init) {
      this.instance.startup();
    }
    return this.waitForReady();
  }

  waitForUpdatePending(): Promise<void> { return this.instance.updatePending; }

  waitForUpdate(): Promise<void> {
    return this.instance.updatePending.then(() => this.waitForReady);
  }

  emptyCaches(): void { this.caches.caches = {}; }

  mockUrl(url: string, response: string|MockResponse, exact: boolean = false): void {
    this.scope.mockFetch(url, response, exact);
  }

  unmockUrl(url: string): void { this.scope.unmockFetch(url); }

  unmockAll(): void { this.scope.unmockAll(); }

  refresh(): void {
    this.scope = new TestWorkerScope(this.caches, this.clients);
    this.startup();
  }

  startup(): void {
    let workerAdapter = new TestAdapter();
    let cache = new NgSwCacheImpl(this.caches, workerAdapter);
    let fetch = new NgSwFetch(this.scope, workerAdapter);
    let events = new NgSwEvents(this.scope);
    this.instance = this.createWorker(this.scope, workerAdapter, cache, fetch, events, this.clock);
  }

  triggerInstall(): Promise<any> {
    if (!this.instance) {
      this.startup();
    }
    return new Promise((resolve, reject) => {
      this.lifecycle = this.lifecycle.then(() => {
        let event: TestInstallEvent = this._makeExtendableEvent();
        this.scope.installListener(event);
        return event.done.then(resolve, reject);
      });
    });
  }

  triggerActivate(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.lifecycle = this.lifecycle.then(() => {
        let event: TestActivateEvent = this._makeExtendableEvent();
        this.scope.activateListener(event);
        return event.done.then(resolve, reject);
      });
    });
  }

  triggerFetch(req: MockRequest, isReload: boolean = false, clientId?: string):
      Promise<MockResponse> {
    return new Promise((resolve, reject) => {
      this.lifecycle = this.lifecycle.then(() => {
        let event: TestFetchEvent = <TestFetchEvent>this._makeExtendableEvent();
        event.request = req;
        event.isReload = isReload;
        event.clientId = clientId !;
        event.respondWith = (p: Promise<any>) => p.then(resolve, reject);
        this.scope.fetchListener(event);
      });
    });
  }

  private _makeExtendableEvent(): TestExtendableEvent {
    let event: TestExtendableEvent;
    event = {waitUntil: (p: Promise<any>) => { event.done = p; }, done: Promise.resolve(null)};
    return event;
  }
}

export class MockClock implements Clock {
  private time: number = 0;
  private delays: {fn: Function, triggerAt: number}[] = [];

  reset(): void { this.time = 0; }

  dateNow(): number { return this.time; }

  setTimeout(fn: Function, delay: number) {
    const triggerAt = delay + this.time;
    this.delays.push({fn, triggerAt});
  }

  advance(millis: number): void {
    this.time += millis;
    this.delays.filter(delay => delay.triggerAt <= this.time).forEach(delay => delay.fn());
    this.delays = this.delays.filter(delay => delay.triggerAt > this.time);
  }
}
