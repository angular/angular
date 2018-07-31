/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {devModeEqual} from '../change_detection/change_detection_util';
import {assertLessThan} from './assert';
import {LElementNode} from './interfaces/node';
import {HEADER_OFFSET, LViewData} from './interfaces/view';

/**
 * Returns wether the values are different from a change detection stand point.
 *
 * Constraints are relaxed in checkNoChanges mode. See `devModeEqual` for details.
 */
export function isDifferent(a: any, b: any, checkNoChangesMode: boolean): boolean {
  if (ngDevMode && checkNoChangesMode) {
    return !devModeEqual(a, b);
  }
  // NaN is the only value that is not equal to itself so the first
  // test checks if both a and b are not NaN
  return !(a !== a && b !== b) && a !== b;
}

export function stringify(value: any): string {
  if (typeof value == 'function') return value.name || value;
  if (typeof value == 'string') return value;
  if (value == null) return '';
  return '' + value;
}

/**
 *  Function that throws a "not implemented" error so it's clear certain
 *  behaviors/methods aren't yet ready.
 *
 * @returns Not implemented error
 */
export function notImplemented(): Error {
  return new Error('NotImplemented');
}

/**
 * Flattens an array in non-recursive way. Input arrays are not modified.
 */
export function flatten(list: any[]): any[] {
  const result: any[] = [];
  let i = 0;

  while (i < list.length) {
    const item = list[i];
    if (Array.isArray(item)) {
      if (item.length > 0) {
        list = item.concat(list.slice(i + 1));
        i = 0;
      } else {
        i++;
      }
    } else {
      result.push(item);
      i++;
    }
  }

  return result;
}

/** Retrieves a value from any `LViewData`. */
export function loadInternal<T>(index: number, arr: LViewData): T {
  ngDevMode && assertDataInRangeInternal(index + HEADER_OFFSET, arr);
  return arr[index + HEADER_OFFSET];
}

export function assertDataInRangeInternal(index: number, arr: any[]) {
  assertLessThan(index, arr ? arr.length : 0, 'index expected to be a valid data index');
}

/** Retrieves an element value from the provided `viewData`.
  *
  * Elements that are read may be wrapped in a style context,
  * therefore reading the value may involve unwrapping that.
  */
export function loadElementInternal(index: number, arr: LViewData): LElementNode {
  const value = loadInternal<LElementNode>(index, arr);
  return readElementValue(value);
}

export function readElementValue(value: LElementNode | any[]): LElementNode {
  return (Array.isArray(value) ? (value as any as any[])[0] : value) as LElementNode;
}
