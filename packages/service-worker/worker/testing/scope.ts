/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';

import {Adapter, Context} from '../src/adapter';
import {AssetGroupConfig, Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';

import {MockCacheStorage} from './cache';
import {MockHeaders, MockRequest, MockResponse} from './fetch';
import {MockServerState, MockServerStateBuilder} from './mock';

const EMPTY_SERVER_STATE = new MockServerStateBuilder().build();

const MOCK_ORIGIN = 'http://localhost/';

export class MockClient {
  queue = new Subject<Object>();

  constructor(readonly id: string) {}

  readonly messages: Object[] = [];

  postMessage(message: Object): void {
    this.messages.push(message);
    this.queue.next(message);
  }
}

export class SwTestHarnessBuilder {
  private server = EMPTY_SERVER_STATE;
  private caches = new MockCacheStorage(MOCK_ORIGIN);

  withCacheState(cache: string): SwTestHarnessBuilder {
    this.caches = new MockCacheStorage(MOCK_ORIGIN, cache);
    return this;
  }

  withServerState(state: MockServerState): SwTestHarnessBuilder {
    this.server = state;
    return this;
  }

  build(): SwTestHarness { return new SwTestHarness(this.server, this.caches); }
}

export class MockClients implements Clients {
  private clients = new Map<string, MockClient>();

  add(clientId: string): void {
    if (this.clients.has(clientId)) {
      return;
    }
    this.clients.set(clientId, new MockClient(clientId));
  }

  remove(clientId: string): void { this.clients.delete(clientId); }

  async get(id: string): Promise<Client> { return this.clients.get(id) !as any as Client; }

  getMock(id: string): MockClient|undefined { return this.clients.get(id); }

  async matchAll(): Promise<Client[]> {
    return Array.from(this.clients.values()) as any[] as Client[];
  }

  async claim(): Promise<any> {}
}

export class SwTestHarness implements ServiceWorkerGlobalScope, Adapter, Context {
  readonly clients = new MockClients();
  private eventHandlers = new Map<string, Function>();
  private skippedWaiting = true;

  private selfMessageQueue: any[] = [];
  autoAdvanceTime = false;
  // TODO(issue/24571): remove '!'.
  unregistered !: boolean;
  readonly notifications: {title: string, options: Object}[] = [];
  readonly registration: ServiceWorkerRegistration = {
    active: {
      postMessage: (msg: any) => { this.selfMessageQueue.push(msg); },
    },
    scope: MOCK_ORIGIN,
    showNotification: (title: string, options: Object) => {
      this.notifications.push({title, options});
    },
    unregister: () => { this.unregistered = true; },
  } as any;

  static envIsSupported(): boolean {
    return (typeof URL === 'function') ||
        (typeof require === 'function' && typeof require('url')['parse'] === 'function');
  }

  time: number;

  private timers: {
    at: number,
    duration: number,
    fn: Function,
    fired: boolean,
  }[] = [];

  constructor(private server: MockServerState, readonly caches: MockCacheStorage) {
    this.time = Date.now();
  }

  async resolveSelfMessages(): Promise<void> {
    while (this.selfMessageQueue.length > 0) {
      const queue = this.selfMessageQueue;
      this.selfMessageQueue = [];
      await queue.reduce(async(previous, msg) => {
        await previous;
        await this.handleMessage(msg, null);
      }, Promise.resolve());
    }
  }

  async startup(firstTime: boolean = false): Promise<boolean|null> {
    if (!firstTime) {
      return null;
    }
    let skippedWaiting: boolean = false;
    if (this.eventHandlers.has('install')) {
      const installEvent = new MockInstallEvent();
      this.eventHandlers.get('install') !(installEvent);
      await installEvent.ready;
      skippedWaiting = this.skippedWaiting;
    }
    if (this.eventHandlers.has('activate')) {
      const activateEvent = new MockActivateEvent();
      this.eventHandlers.get('activate') !(activateEvent);
      await activateEvent.ready;
    }
    return skippedWaiting;
  }
  updateServerState(server?: MockServerState): void { this.server = server || EMPTY_SERVER_STATE; }

  fetch(req: string|Request): Promise<Response> {
    if (typeof req === 'string') {
      if (req.startsWith(MOCK_ORIGIN)) {
        req = '/' + req.substr(MOCK_ORIGIN.length);
      }
      return this.server.fetch(new MockRequest(req));
    } else {
      const mockReq = req.clone() as MockRequest;
      if (mockReq.url.startsWith(MOCK_ORIGIN)) {
        mockReq.url = '/' + mockReq.url.substr(MOCK_ORIGIN.length);
      }
      return this.server.fetch(mockReq);
    }
  }

  addEventListener(event: string, handler: Function): void {
    this.eventHandlers.set(event, handler);
  }

  removeEventListener(event: string, handler?: Function): void { this.eventHandlers.delete(event); }

  newRequest(url: string, init: Object = {}): Request { return new MockRequest(url, init); }

  newResponse(body: string, init: Object = {}): Response { return new MockResponse(body, init); }

  newHeaders(headers: {[name: string]: string}): Headers {
    return Object.keys(headers).reduce((mock, name) => {
      mock.set(name, headers[name]);
      return mock;
    }, new MockHeaders());
  }

  parseUrl(url: string, relativeTo: string): {origin: string, path: string} {
    if (typeof URL === 'function') {
      const obj = new URL(url, relativeTo);
      return {origin: obj.origin, path: obj.pathname};
    } else {
      const obj = require('url').parse(url);
      return {origin: obj.origin, path: obj.pathname};
    }
  }

  async skipWaiting(): Promise<void> { this.skippedWaiting = true; }

  waitUntil(promise: Promise<void>): void {}

  handleFetch(req: Request, clientId: string|null = null):
      [Promise<Response|undefined>, Promise<void>] {
    if (!this.eventHandlers.has('fetch')) {
      throw new Error('No fetch handler registered');
    }
    const event = new MockFetchEvent(req, clientId);
    this.eventHandlers.get('fetch') !.call(this, event);

    if (clientId) {
      this.clients.add(clientId);
    }

    return [event.response, event.ready];
  }

  handleMessage(data: Object, clientId: string|null): Promise<void> {
    if (!this.eventHandlers.has('message')) {
      throw new Error('No message handler registered');
    }
    let event: MockMessageEvent;
    if (clientId === null) {
      event = new MockMessageEvent(data, null);
    } else {
      this.clients.add(clientId);
      event = new MockMessageEvent(data, this.clients.getMock(clientId) || null);
    }
    this.eventHandlers.get('message') !.call(this, event);
    return event.ready;
  }

  handlePush(data: Object): Promise<void> {
    if (!this.eventHandlers.has('push')) {
      throw new Error('No push handler registered');
    }
    const event = new MockPushEvent(data);
    this.eventHandlers.get('push') !.call(this, event);
    return event.ready;
  }

  handleClick(notification: Object, action?: string): Promise<void> {
    if (!this.eventHandlers.has('notificationclick')) {
      throw new Error('No notificationclick handler registered');
    }
    const event = new MockNotificationEvent(notification, action);
    this.eventHandlers.get('notificationclick') !.call(this, event);
    return event.ready;
  }

  timeout(ms: number): Promise<void> {
    const promise = new Promise<void>(resolve => {
      this.timers.push({
        at: this.time + ms,
        duration: ms,
        fn: resolve,
        fired: false,
      });
    });

    if (this.autoAdvanceTime) {
      this.advance(ms);
    }

    return promise;
  }

  advance(by: number): void {
    this.time += by;
    this.timers.filter(timer => !timer.fired)
        .filter(timer => timer.at <= this.time)
        .forEach(timer => {
          timer.fired = true;
          timer.fn();
        });
  }

  isClient(obj: any): obj is Client { return obj instanceof MockClient; }
}

interface StaticFile {
  url: string;
  contents: string;
  hash?: string;
}

export class AssetGroupBuilder {
  constructor(private up: ConfigBuilder, readonly name: string) {}

  private files: StaticFile[] = [];

  addFile(url: string, contents: string, hashed: boolean = true): AssetGroupBuilder {
    const file: StaticFile = {url, contents, hash: undefined};
    if (hashed) {
      file.hash = sha1(contents);
    }
    this.files.push(file);
    return this;
  }

  finish(): ConfigBuilder { return this.up; }

  toManifestGroup(): AssetGroupConfig { return null !; }
}

export class ConfigBuilder {
  assetGroups = new Map<string, AssetGroupBuilder>();

  addAssetGroup(name: string): ConfigBuilder {
    const builder = new AssetGroupBuilder(this, name);
    this.assetGroups.set(name, builder);
    return this;
  }

  finish(): Manifest {
    const assetGroups = Array.from(this.assetGroups.values()).map(group => group.toManifestGroup());
    const hashTable = {};
    return {
      configVersion: 1,
      index: '/index.html', assetGroups,
      navigationUrls: [], hashTable,
    };
  }
}

class OneTimeContext implements Context {
  private queue: Promise<void>[] = [];

  waitUntil(promise: Promise<void>): void { this.queue.push(promise); }

  get ready(): Promise<void> {
    return (async() => {
      while (this.queue.length > 0) {
        await this.queue.shift();
      }
    })();
  }
}

class MockExtendableEvent extends OneTimeContext {}

class MockFetchEvent extends MockExtendableEvent {
  response: Promise<Response|undefined> = Promise.resolve(undefined);

  constructor(readonly request: Request, readonly clientId: string|null) { super(); }

  respondWith(promise: Promise<Response>): Promise<Response> {
    this.response = promise;
    return promise;
  }
}

class MockMessageEvent extends MockExtendableEvent {
  constructor(readonly data: Object, readonly source: MockClient|null) { super(); }
}

class MockPushEvent extends MockExtendableEvent {
  constructor(private _data: Object) { super(); }
  data = {
    json: () => this._data,
  };
}
class MockNotificationEvent extends MockExtendableEvent {
  constructor(private _notification: any, readonly action?: string) { super(); }
  readonly notification = {...this._notification, close: () => undefined};
}

class MockInstallEvent extends MockExtendableEvent {}


class MockActivateEvent extends MockExtendableEvent {}
