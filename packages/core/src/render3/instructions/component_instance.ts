/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertDefined} from '../../util/assert';
import {CONTEXT, DECLARATION_COMPONENT_VIEW} from '../interfaces/view';
import {getLView} from '../state';

/**
 * Instruction that returns the component instance in which the current instruction is executing.
 * This is a constant-time version of `nextContent` for the case where we know that we need the
 * component instance specifically, rather than the context of a particular template.
 *
 * @codeGenApi
 */
export function ɵɵcomponentInstance(): unknown {
  const instance = getLView()[DECLARATION_COMPONENT_VIEW][CONTEXT];
  ngDevMode && assertDefined(instance, 'Expected component instance to be defined');
  return instance;
}
