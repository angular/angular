/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '../../event_emitter';

export function output<T>(opts?: {alias?: string, isAsync?: boolean}): EventEmitter<T> {
  return new EventEmitter(opts?.isAsync);
}
