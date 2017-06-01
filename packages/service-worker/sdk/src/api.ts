/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgSwAdapter} from './facade/adapter';
import {NgSwCache} from './facade/cache';
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

/**
 * @experimental
 */
export interface VersionWorker extends StreamController {
  readonly manifest: Manifest;
  readonly cache: NgSwCache;
  readonly adapter: NgSwAdapter;

  refresh(req: Request, cacheBust?: boolean): Promise<Response>;
  fetch(req: Request): Promise<Response>;
  showNotification(title: string, options?: Object): void;
  sendToStream(id: number, message: Object): void;
  closeStream(id: number): void;
}

/**
 * @experimental
 */
export interface StreamController {
  sendToStream(id: number, message: Object): void;
  closeStream(id: number): void;
}

/**
 * @experimental
 */
export interface Plugin<T extends Plugin<T>> {
  setup(operations: Operation[]): void;
  update?(operations: Operation[], previous: T): void;
  fetch?(req: Request): FetchInstruction|null;
  cleanup?(operations: Operation[]): void;
  message?(message: any, id: number): Promise<any>;
  messageClosed?(id: number): void;
  push?(data: any): void;
  validate?(): Promise<boolean>;
}

/**
 * @experimental
 */
export interface PluginFactory<T extends Plugin<T>> { (worker: VersionWorker): Plugin<T>; }
