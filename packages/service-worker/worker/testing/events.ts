/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class MockEvent implements Event {
  readonly AT_TARGET = -1;
  readonly BUBBLING_PHASE = -1;
  readonly CAPTURING_PHASE = -1;
  readonly NONE = -1;

  readonly bubbles = false;
  cancelBubble = false;
  readonly cancelable = false;
  readonly composed = false;
  readonly currentTarget = null;
  readonly defaultPrevented = false;
  readonly eventPhase = -1;
  readonly isTrusted = false;
  returnValue = false;
  readonly srcElement = null;
  readonly target = null;
  readonly timeStamp = Date.now();

  constructor(readonly type: string) {}

  composedPath(): EventTarget[] {
    this.notImplemented();
  }
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
    this.notImplemented();
  }
  preventDefault(): void {
    this.notImplemented();
  }
  stopImmediatePropagation(): void {
    this.notImplemented();
  }
  stopPropagation(): void {
    this.notImplemented();
  }

  private notImplemented(): never {
    throw new Error('Method not implemented in `MockEvent`.');
  }
}

export class MockExtendableEvent extends MockEvent implements ExtendableEvent {
  private queue: Promise<void>[] = [];

  get ready(): Promise<void> {
    return (async () => {
      while (this.queue.length > 0) {
        await this.queue.shift();
      }
    })();
  }

  waitUntil(promise: Promise<void>): void {
    this.queue.push(promise);
  }
}

export class MockActivateEvent extends MockExtendableEvent {
  constructor() {
    super('activate');
  }
}

export class MockFetchEvent extends MockExtendableEvent {
  response: Promise<Response|undefined> = Promise.resolve(undefined);

  constructor(
      readonly request: Request, readonly clientId: string, readonly resultingClientId: string) {
    super('fetch');
  }

  respondWith(promise: Promise<Response>): Promise<Response> {
    this.response = promise;
    return promise;
  }
}

export class MockInstallEvent extends MockExtendableEvent {
  constructor() {
    super('install');
  }
}

export class MockMessageEvent extends MockExtendableEvent {
  constructor(readonly data: Object, readonly source: MockClient|null) {
    super('message');
  }
}

export class MockNotificationEvent extends MockExtendableEvent {
  readonly notification = {
    ...this._notification,
    close: () => undefined,
  };

  constructor(private _notification: any, readonly action?: string) {
    super('notification');
  }
}

export class MockPushEvent extends MockExtendableEvent {
  data = {
    json: () => this._data,
  };

  constructor(private _data: object) {
    super('push');
  }
}
