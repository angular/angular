/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Subject} from 'rxjs';


export class MockClient {
  queue = new Subject<Object>();

  constructor(readonly id: string) {}

  readonly messages: Object[] = [];

  postMessage(message: Object): void {
    this.messages.push(message);
    this.queue.next(message);
  }
}

export class WindowClientImpl extends MockClient implements WindowClient {
  readonly ancestorOrigins: ReadonlyArray<string> = [];
  readonly focused: boolean = false;
  readonly visibilityState: VisibilityState = 'hidden';
  frameType: ClientFrameType = 'top-level';
  url = 'http://localhost/unique';

  constructor(readonly id: string) {
    super(id);
  }

  async focus(): Promise<WindowClient> {
    return this;
  }

  async navigate(url: string): Promise<WindowClient|null> {
    return this;
  }
}

export class MockClients implements Clients {
  private clients = new Map<string, MockClient>();

  add(clientId: string): void {
    if (this.clients.has(clientId)) {
      return;
    }
    this.clients.set(clientId, new MockClient(clientId));
  }

  remove(clientId: string): void {
    this.clients.delete(clientId);
  }

  async get(id: string): Promise<Client> {
    return this.clients.get(id)! as any as Client;
  }

  getMock(id: string): MockClient|undefined {
    return this.clients.get(id);
  }

  async matchAll<T extends ClientQueryOptions>(options?: T):
      Promise<ReadonlyArray<T['type'] extends 'window'? WindowClient : Client>> {
    return Array.from(this.clients.values()) as any[];
  }

  async openWindow(url: string): Promise<WindowClient|null> {
    return null;
  }

  async claim(): Promise<any> {}
}
