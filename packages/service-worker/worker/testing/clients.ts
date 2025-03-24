/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Subject} from 'rxjs';

export class MockClient implements Client {
  readonly messages: any[] = [];
  readonly queue = new Subject<any>();
  lastFocusedAt = 0;

  constructor(
    readonly id: string,
    readonly url: string,
    readonly type: ClientTypes = 'all',
    readonly frameType: FrameType = 'top-level',
  ) {}

  postMessage(message: any): void {
    this.messages.push(message);
    this.queue.next(message);
  }
}

export class MockWindowClient extends MockClient implements WindowClient {
  readonly focused: boolean = false;
  readonly visibilityState: DocumentVisibilityState = 'visible';

  constructor(id: string, url: string, frameType: FrameType = 'top-level') {
    super(id, url, 'window', frameType);
  }

  async focus(): Promise<WindowClient> {
    // This is only used for relatively ordering clients based on focus order, so we don't need to
    // use `Adapter#time`.
    this.lastFocusedAt = Date.now();
    (this.focused as boolean) = true;
    return this;
  }

  async navigate(url: string): Promise<WindowClient | null> {
    (this.url as string) = url;
    return this;
  }
}

export class MockClients implements Clients {
  private clients = new Map<string, MockClient>();

  add(clientId: string, url: string, type: ClientTypes = 'window'): void {
    if (this.clients.has(clientId)) {
      const existingClient = this.clients.get(clientId)!;
      if (existingClient.url === url) {
        return;
      }
      throw new Error(
        `Trying to add mock client with same ID (${existingClient.id}) and different URL ` +
          `(${existingClient.url} --> ${url})`,
      );
    }

    const client =
      type === 'window' ? new MockWindowClient(clientId, url) : new MockClient(clientId, url, type);
    this.clients.set(clientId, client);
  }

  remove(clientId: string): void {
    this.clients.delete(clientId);
  }

  async get(id: string): Promise<Client> {
    return this.clients.get(id)!;
  }

  getMock(id: string): MockClient | undefined {
    return this.clients.get(id);
  }

  async matchAll<T extends ClientQueryOptions>(
    options?: T,
  ): Promise<ReadonlyArray<T['type'] extends 'window' ? WindowClient : Client>> {
    const type = options?.type ?? 'window';
    const allClients = Array.from(this.clients.values());
    const matchedClients =
      type === 'all' ? allClients : allClients.filter((client) => client.type === type);

    // Order clients according to the [spec](https://w3c.github.io/ServiceWorker/#clients-matchall):
    // In most recently focused then most recently created order, with windows clients before other
    // clients.
    return (
      matchedClients
        // Sort in most recently created order.
        .reverse()
        // Sort in most recently focused order.
        .sort((a, b) => b.lastFocusedAt - a.lastFocusedAt)
        // Sort windows clients before other clients (otherwise leave existing order).
        .sort((a, b) => {
          const aScore = a.type === 'window' ? 1 : 0;
          const bScore = b.type === 'window' ? 1 : 0;
          return bScore - aScore;
        }) as any
    );
  }

  async openWindow(url: string): Promise<WindowClient | null> {
    return null;
  }

  async claim(): Promise<any> {}
}
