/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgSwAdapter} from './facade/adapter';
import {NgSwCache} from './facade/cache';
import {BroadcastFsa, FsaBroadcastMessage, makeBroadcastFsa} from './fsa';
import {Manifest} from './manifest';


/**
 * @experimental
 */
export type FetchDelegate = () => Promise<Response>;

/**
 * @experimental
 */
export interface FetchInstruction {
  (next: FetchDelegate): Promise<Response>;
  desc?: Object;
}

/**
 * @experimental
 */
export interface Operation {
  (): Promise<any>;
  desc?: Object;
}

export interface IDriver { broadcast(message: FsaBroadcastMessage<Object>): void; }

/**
 * @experimental
 */
export interface VersionWorker {
  readonly driver: IDriver;
  readonly manifest: Manifest;
  readonly cache: NgSwCache;
  readonly adapter: NgSwAdapter;

  refresh(req: Request, cacheBust?: boolean): Promise<Response>;
  fetch(req: Request): Promise<Response>;
  showNotification(title: string, options?: Object): void;
}

/**
 * @experimental
 */
export interface Plugin<T extends Plugin<T>> {
  setup(operations: Operation[]): void;
  update?(operations: Operation[], previous: T): void;
  fetch?(req: Request): FetchInstruction|null;
  cleanup?(operations: Operation[]): void;
  message?(message: any): Promise<any>;
  push?(data: any): Promise<any>;
  validate?(): Promise<boolean>;
}

/**
 * @experimental
 */
export interface PluginFactory<T extends Plugin<T>> { (worker: VersionWorker): Plugin<T>; }
