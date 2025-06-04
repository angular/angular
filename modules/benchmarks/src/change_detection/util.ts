/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getIntParameter} from '../util';

export const numViews: number = getIntParameter('viewCount');

export function newArray<T = any>(size: number): T[];
export function newArray<T>(size: number, value: T): T[];
export function newArray<T>(size: number, value?: T): T[] {
  const list: T[] = [];
  for (let i = 0; i < size; i++) {
    list.push(value!);
  }
  return list;
}
