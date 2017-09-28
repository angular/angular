/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs/Subject';

export class MockServiceWorkerContainer {
  private onControllerChange: Function[] = [];
  private registration: MockServiceWorkerRegistration|null = null;
  controller: MockServiceWorker|null = null;

  messages = new Subject();

  addEventListener(event: 'controllerchange', handler: Function) {
    this.onControllerChange.push(handler);
  }

  removeEventListener(event: 'controllerchange', handler: Function) {
    this.onControllerChange = this.onControllerChange.filter(h => h !== handler);
  }

  async register(url: string): Promise<void> { return; }

  async getRegistration(): Promise<ServiceWorkerRegistration> { return this.registration as any; }

  setupSw(url: string = '/ngsw-worker.js'): void {
    this.registration = new MockServiceWorkerRegistration();
    this.controller = new MockServiceWorker(this, url);
    this.onControllerChange.forEach(onChange => onChange(this.controller));
  }

  get mockRegistration(): Promise<MockServiceWorkerRegistration> {
    return Promise.resolve(this.registration !);
  }
}

export class MockServiceWorker {
  constructor(private mock: MockServiceWorkerContainer, readonly scriptURL: string) {}

  postMessage(value: Object) { this.mock.messages.next(value); }
}

export class MockServiceWorkerRegistration {
  private onMessage: Function[] = [];
  messages: Object[] = [];

  constructor() {}

  addEventListener(event: 'message', handler: Function) { this.onMessage.push(handler); }

  removeEventListener(event: 'message', handler: Function) {
    this.onMessage = this.onMessage.filter(h => h !== handler);
  }

  sendMessage(value: Object): void {
    this.onMessage.forEach(onMessage => onMessage({
                             data: value,
                           }));
  }
}