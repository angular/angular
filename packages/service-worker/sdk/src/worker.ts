/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FetchDelegate, FetchInstruction, Operation, Plugin, StreamController, VersionWorker} from './api';
import {ScopedCache} from './cache';
import {fetchFromNetworkInstruction} from './common';
import {Clock, NgSwAdapter} from './facade/adapter';
import {NgSwFetch} from './facade/fetch';
import {Manifest} from './manifest';

/**
 * @experimental
 */
export class VersionWorkerImpl implements VersionWorker {
  constructor(
      public streamController: StreamController, public scope: ServiceWorkerGlobalScope,
      public manifest: Manifest, public adapter: NgSwAdapter, public cache: ScopedCache,
      public clock: Clock, private fetcher: NgSwFetch, private plugins: Plugin<any>[]) {}

  refresh(req: Request, cacheBust: boolean = true): Promise<Response> {
    if (cacheBust) {
      return this.fetcher.refresh(req);
    } else {
      return this.fetcher.request(req);
    }
  }

  fetch(req: Request): Promise<Response> {
    const fromNetwork = fetchFromNetworkInstruction(this, req, false);
    return this.plugins.filter(plugin => !!plugin.fetch)
        .map(plugin => plugin.fetch !(req))
        .filter(instruction => !!instruction)
        .reduceRight<FetchDelegate>(
            (delegate: FetchDelegate, curr: FetchInstruction) => () => curr(delegate),
            () => this.fetcher.request(req, true))();
  }

  validate(): Promise<boolean> {
    return Promise
        .all(this.plugins.filter(plugin => !!plugin.validate).map(plugin => plugin.validate !()))
        .then(results => results.every(v => v));
  }

  setup(previous: VersionWorkerImpl): Promise<any> {
    let operations: Operation[] = [];
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin: Plugin<any> = this.plugins[i];
      if (plugin.update && previous) {
        plugin.update(operations, previous.plugins[i]);
      } else {
        plugin.setup(operations);
      }
    }
    return operations.reduce<Promise<any>>(
        (prev, curr) => prev.then(() => curr()), Promise.resolve(null), );
  }

  cleanup(): Operation[] {
    return this.plugins.reduce((ops, plugin) => {
      if (plugin.cleanup) {
        plugin.cleanup(ops);
      }
      return ops;
    }, []);
  }

  message(message: any, id: number): Promise<any> {
    return Promise.all(this.plugins.filter(plugin => !!plugin.message)
                           .map(plugin => plugin.message !(message, id)));
  }

  messageClosed(id: number): void {
    this.plugins.filter(plugin => !!plugin.messageClosed)
        .forEach(plugin => plugin.messageClosed !(id));
  }

  sendToStream(id: number, message: Object): void {
    this.streamController.sendToStream(id, message);
  }

  closeStream(id: number): void { this.streamController.closeStream(id); }

  push(data: any): Promise<any> {
    return Promise.all(
        this.plugins.filter(plugin => !!plugin.push).map(plugin => plugin.push !(data)));
  }

  showNotification(title: string, options?: Object): void {
    this.scope.registration.showNotification(title, options);
  }
}
