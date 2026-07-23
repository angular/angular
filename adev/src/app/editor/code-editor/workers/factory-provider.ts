/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Provider} from '@angular/core';

export type TypescriptVfsWorkerFactory = () => Worker;

export const TYPESCRIPT_VFS_WORKER_FACTORY = new InjectionToken<TypescriptVfsWorkerFactory>(
  'TYPESCRIPT_VFS_WORKER_FACTORY',
);

export function createTypescriptVfsWorker(): Worker {
  return new Worker(new URL('./typescript-vfs.worker.ts', import.meta.url), {
    type: 'module',
  });
}

export const TYPESCRIPT_VFS_WORKER_PROVIDER: Provider = {
  provide: TYPESCRIPT_VFS_WORKER_FACTORY,
  useValue: createTypescriptVfsWorker,
};
