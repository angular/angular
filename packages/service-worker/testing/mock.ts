/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';

export const patchDecodeBase64 = (proto: {decodeBase64: typeof atob}) => {
  let unpatch: () => void = () => undefined;

  if ((typeof atob === 'undefined') && (typeof Buffer === 'function')) {
    const oldDecodeBase64 = proto.decodeBase64;
    const newDecodeBase64 = (input: string) => Buffer.from(input, 'base64').toString('binary');

    proto.decodeBase64 = newDecodeBase64;
    unpatch = () => {
      proto.decodeBase64 = oldDecodeBase64;
    };
  }

  return unpatch;
};

export class MockServiceWorkerContainer {
  private onControllerChange: Function[] = [];
  private onMessage: Function[] = [];
  mockRegistration: MockServiceWorkerRegistration|null = null;
  controller: MockServiceWorker|null = null;
  messages = new Subject<any>();
  notificationClicks = new Subject<{}>();

  addEventListener(event: 'controllerchange'|'message', handler: Function) {
    if (event === 'controllerchange') {
      this.onControllerChange.push(handler);
    } else if (event === 'message') {
      this.onMessage.push(handler);
    }
  }

  removeEventListener(event: 'controllerchange', handler: Function) {
    if (event === 'controllerchange') {
      this.onControllerChange = this.onControllerChange.filter(h => h !== handler);
    } else if (event === 'message') {
      this.onMessage = this.onMessage.filter(h => h !== handler);
    }
  }

  async register(url: string): Promise<void> {
    return;
  }

  async getRegistration(): Promise<ServiceWorkerRegistration> {
    return this.mockRegistration as any;
  }

  setupSw(url: string = '/ngsw-worker.js'): void {
    this.mockRegistration = new MockServiceWorkerRegistration();
    this.controller = new MockServiceWorker(this, url);
    this.onControllerChange.forEach(onChange => onChange(this.controller));
  }

  sendMessage(value: Object): void {
    this.onMessage.forEach(onMessage => onMessage({
                             data: value,
                           }));
  }
}

export class MockServiceWorker {
  constructor(private mock: MockServiceWorkerContainer, readonly scriptURL: string) {}

  postMessage(value: Object) {
    this.mock.messages.next(value);
  }
}

export class MockServiceWorkerRegistration {
  pushManager: PushManager = new MockPushManager() as any;
}

export class MockPushManager {
  private subscription: PushSubscription|null = null;

  getSubscription(): Promise<PushSubscription|null> {
    return Promise.resolve(this.subscription);
  }

  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription> {
    this.subscription = new MockPushSubscription() as any;
    return Promise.resolve(this.subscription!);
  }
}

export class MockPushSubscription {
  unsubscribe(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
