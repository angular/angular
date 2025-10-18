/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Provider} from '@angular/core';

export const TYPESCRIPT_VFS_WORKER = new InjectionToken<Worker>('TYPESCRIPT_VFS_WORKER');

export function createTypescriptVfsWorker(): Worker {
  return new Worker(new URL('./typescript-vfs.worker.ts', import.meta.url), {
    type: 'module',
  });
}

export const TYPESCRIPT_VFS_WORKER_PROVIDER: Provider = {
  provide: TYPESCRIPT_VFS_WORKER,
  useFactory: createTypescriptVfsWorker,
};
