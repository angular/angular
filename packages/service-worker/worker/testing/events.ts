/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export class MockEvent implements Event {
  readonly AT_TARGET = 2;
  readonly BUBBLING_PHASE = 3;
  readonly CAPTURING_PHASE = 1;
  readonly NONE = 0;

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
  private queue: Promise<unknown>[] = [];

  get ready(): Promise<void> {
    return (async () => {
      while (this.queue.length > 0) {
        await this.queue.shift();
      }
    })();
  }

  waitUntil(promise: Promise<unknown>): void {
    this.queue.push(promise);
  }
}

export class MockActivateEvent extends MockExtendableEvent {
  constructor() {
    super('activate');
  }
}

export class MockFetchEvent extends MockExtendableEvent implements FetchEvent {
  readonly preloadResponse = Promise.resolve();
  handled = Promise.resolve(undefined);
  response: Promise<Response | undefined> = Promise.resolve(undefined);

  constructor(
    readonly request: Request,
    readonly clientId: string,
    readonly resultingClientId: string,
  ) {
    super('fetch');
  }

  respondWith(r: Response | Promise<Response>): void {
    this.response = Promise.resolve(r);
  }
}

export class MockInstallEvent extends MockExtendableEvent {
  constructor() {
    super('install');
  }
}

export class MockExtendableMessageEvent
  extends MockExtendableEvent
  implements ExtendableMessageEvent
{
  readonly lastEventId = '';
  readonly origin = '';
  readonly ports: ReadonlyArray<MessagePort> = [];

  constructor(
    readonly data: any,
    readonly source: Client | MessagePort | ServiceWorker | null,
  ) {
    super('message');
  }
}

export class MockNotificationEvent extends MockExtendableEvent implements NotificationEvent {
  readonly notification: Notification;

  constructor(
    private _notification: Partial<Notification>,
    readonly action = '',
  ) {
    super('notification');
    this.notification = {
      ...this._notification,
      close: () => undefined,
    } as Notification;
  }
}

export class MockPushEvent extends MockExtendableEvent implements PushEvent {
  readonly data = {
    json: () => this._data,
    text: () => JSON.stringify(this._data),
  } as PushMessageData;

  constructor(private _data: object) {
    super('push');
  }
}
