/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {OpaqueViewState} from '../interfaces/view';
import {getLView} from '../state';

/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @codeGenApi
 */
export function ɵɵgetCurrentView(): OpaqueViewState {
  return getLView() as any as OpaqueViewState;
}
