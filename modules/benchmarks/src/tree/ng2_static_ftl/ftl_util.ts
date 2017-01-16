/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {devModeEqual, looseIdentical} from '@angular/core/src/change_detection/change_detection_util';
import {ExpressionChangedAfterItHasBeenCheckedError} from '@angular/core/src/linker/errors';

export function createElementAndAppend(parent: any, name: string) {
  const el = document.createElement(name);
  parent.appendChild(el);
  return el;
}

export function createTextAndAppend(parent: any) {
  const txt = document.createTextNode('');
  parent.appendChild(txt);
  return txt;
}

export function createAnchorAndAppend(parent: any) {
  const txt = document.createComment('');
  parent.appendChild(txt);
  return txt;
}

export function checkBinding(throwOnChange: boolean, oldValue: any, newValue: any): boolean {
  if (throwOnChange) {
    if (!devModeEqual(oldValue, newValue)) {
      throw new ExpressionChangedAfterItHasBeenCheckedError(oldValue, newValue, false);
    }
    return false;
  } else {
    return !looseIdentical(oldValue, newValue);
  }
}