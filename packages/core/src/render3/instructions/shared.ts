/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {assertDataInRange} from '../../util/assert';
import {DirectiveDef} from '../interfaces/definition';
import {PropertyAliasValue} from '../interfaces/node';
import {LView, TVIEW} from '../interfaces/view';

/**
 * Set the inputs of directives at the current node to corresponding value.
 *
 * @param lView the `LView` which contains the directives.
 * @param inputAliases mapping between the public "input" name and privately-known,
 * possibly minified, property names to write to.
 * @param value Value to set.
 */
export function setInputsForProperty(lView: LView, inputs: PropertyAliasValue, value: any): void {
  const tView = lView[TVIEW];
  for (let i = 0; i < inputs.length;) {
    const index = inputs[i++] as number;
    const publicName = inputs[i++] as string;
    const privateName = inputs[i++] as string;
    const instance = lView[index];
    ngDevMode && assertDataInRange(lView, index);
    const def = tView.data[index] as DirectiveDef<any>;
    const setInput = def.setInput;
    if (setInput) {
      def.setInput !(instance, value, publicName, privateName);
    } else {
      instance[privateName] = value;
    }
  }
}