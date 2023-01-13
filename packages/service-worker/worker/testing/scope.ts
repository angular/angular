/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from '../src/adapter';
import {AssetGroupConfig, Manifest} from '../src/manifest';
import {sha1} from '../src/sha1';

import {MockCacheStorage} from './cache';
import {MockClient, MockClients} from './clients';
import {MockActivateEvent, MockExtendableMessageEvent, MockFetchEvent, MockInstallEvent, MockNotificationEvent, MockPushEvent} from './events';
import {MockHeaders, MockRequest, MockResponse} from './fetch';
import {MockServerState, MockServerStateBuilder} from './mock';
import {normalizeUrl, parseUrl} from './utils';

const EMPTY_SERVER_STATE = new MockServerStateBuilder().build();

export class SwTestHarnessBuilder {
  private origin = parseUrl(this.scopeUrl).origin;
  private server = EMPTY_SERVER_STATE;
  private caches = new MockCacheStorage(this.origin);

  constructor(private scopeUrl = 'http://localhost/') {}

  withCacheState(cache: string): SwTestHarnessBuilder {
    this.caches = new MockCacheStorage(this.origin, cache);
    return this;
  }

  withServerState(state: MockServerState): SwTestHarnessBuilder {
    this.server = state;
    return this;
  }

  build(): SwTestHarness {
    return new SwTestHarnessImpl(this.server, this.caches, this.scopeUrl) as SwTestHarness;
  }
}

export type SwTestHarness = SwTestHarnessImpl&ServiceWorkerGlobalScope;

export class SwTestHarnessImpl extends Adapter<MockCacheStorage> implements
    Partial<ServiceWorkerGlobalScope> {
  readonly clients = new MockClients();
  private eventHandlers = new Map<string, EventListener>();
  private skippedWaiting = false;

  private selfMessageQueue: any[] = [];
  autoAdvanceTime = false;
  unregistered: boolean = false;
  readonly notifications: {title: string, options: Object}[] = [];
  readonly registration: ServiceWorkerRegistration = {
    active: {
      postMessage: (msg: any) => {
        this.selfMessageQueue.push(msg);
      },
    },
    scope: this.scopeUrl,
    showNotification:
        (title: string, options: Object) => {
          this.notifications.push({title, options});
        },
    unregister:
        () => {
          this.unregistered = true;
        },
  } as any;

  override get time() {
    return this.mockTime;
  }

  private mockTime = Date.now();

  private timers: {
    at: number,
    duration: number,
    fn: Function,
    fired: boolean,
  }[] = [];

  override parseUrl = parseUrl;

  constructor(private server: MockServerState, caches: MockCacheStorage, scopeUrl: string) {
    super(scopeUrl, caches);
  }

  async resolveSelfMessages(): Promise<void> {
    while (this.selfMessageQueue.length > 0) {
      const queue = this.selfMessageQueue;
      this.selfMessageQueue = [];
      await queue.reduce(async (previous, msg) => {
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
      this.eventHandlers.get('install')!(installEvent);
      await installEvent.ready;
      skippedWaiting = this.skippedWaiting;
    }
    if (this.eventHandlers.has('activate')) {
      const activateEvent = new MockActivateEvent();
      this.eventHandlers.get('activate')!(activateEvent);
      await activateEvent.ready;
    }
    return skippedWaiting;
  }

  updateServerState(server?: MockServerState): void {
    this.server = server || EMPTY_SERVER_STATE;
  }

  fetch(req: RequestInfo): Promise<Response> {
    if (typeof req === 'string') {
      return this.server.fetch(new MockRequest(normalizeUrl(req, this.scopeUrl)));
    } else {
      const mockReq = req.clone() as MockRequest;
      mockReq.url = normalizeUrl(mockReq.url, this.scopeUrl);
      return this.server.fetch(mockReq);
    }
  }

  addEventListener(
      type: string, listener: EventListenerOrEventListenerObject,
      options?: boolean|AddEventListenerOptions): void {
    if (options !== undefined) {
      throw new Error('Mock `addEventListener()` does not support `options`.');
    }

    const handler: EventListener =
        (typeof listener === 'function') ? listener : evt => listener.handleEvent(evt);
    this.eventHandlers.set(type, handler);
  }

  removeEventListener(
      type: string, listener: EventListenerOrEventListenerObject,
      options?: boolean|AddEventListenerOptions): void {
    if (options !== undefined) {
      throw new Error('Mock `removeEventListener()` does not support `options`.');
    }

    this.eventHandlers.delete(type);
  }

  override newRequest(url: string, init: Object = {}): Request {
    return new MockRequest(normalizeUrl(url, this.scopeUrl), init);
  }

  override newResponse(body: string, init: Object = {}): Response {
    return new MockResponse(body, init);
  }

  override newHeaders(headers: {[name: string]: string}): Headers {
    return Object.keys(headers).reduce((mock, name) => {
      mock.set(name, headers[name]);
      return mock;
    }, new MockHeaders());
  }

  async skipWaiting(): Promise<void> {
    this.skippedWaiting = true;
  }

  handleFetch(req: Request, clientId = ''): [Promise<Response|undefined>, Promise<void>] {
    if (!this.eventHandlers.has('fetch')) {
      throw new Error('No fetch handler registered');
    }

    const isNavigation = req.mode === 'navigate';

    if (clientId && !this.clients.getMock(clientId)) {
      this.clients.add(clientId, isNavigation ? req.url : this.scopeUrl);
    }

    const event = isNavigation ? new MockFetchEvent(req, '', clientId) :
                                 new MockFetchEvent(req, clientId, '');
    this.eventHandlers.get('fetch')!.call(this, event);

    return [event.response, event.ready];
  }

  handleMessage(data: Object, clientId: string|null): Promise<void> {
    if (!this.eventHandlers.has('message')) {
      throw new Error('No message handler registered');
    }

    if (clientId && !this.clients.getMock(clientId)) {
      this.clients.add(clientId, this.scopeUrl);
    }

    const event =
        new MockExtendableMessageEvent(data, clientId && this.clients.getMock(clientId) || null);
    this.eventHandlers.get('message')!.call(this, event);

    return event.ready;
  }

  handlePush(data: Object): Promise<void> {
    if (!this.eventHandlers.has('push')) {
      throw new Error('No push handler registered');
    }
    const event = new MockPushEvent(data);
    this.eventHandlers.get('push')!.call(this, event);
    return event.ready;
  }

  handleClick(notification: Object, action?: string): Promise<void> {
    if (!this.eventHandlers.has('notificationclick')) {
      throw new Error('No notificationclick handler registered');
    }
    const event = new MockNotificationEvent(notification, action);
    this.eventHandlers.get('notificationclick')!.call(this, event);
    return event.ready;
  }

  override timeout(ms: number): Promise<void> {
    const promise = new Promise<void>(resolve => {
      this.timers.push({
        at: this.mockTime + ms,
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
    this.mockTime += by;
    this.timers.filter(timer => !timer.fired)
        .filter(timer => timer.at <= this.mockTime)
        .forEach(timer => {
          timer.fired = true;
          timer.fn();
        });
  }

  override isClient(obj: any): obj is Client {
    return obj instanceof MockClient;
  }
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

  finish(): ConfigBuilder {
    return this.up;
  }

  toManifestGroup(): AssetGroupConfig {
    return null!;
  }
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
      timestamp: 1234567890123,
      index: '/index.html',
      assetGroups,
      navigationUrls: [],
      navigationRequestStrategy: 'performance',
      hashTable,
    };
  }
}
