/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import assert from 'assert';
import {KnownInputs} from '../input_detection/known_inputs';
import {InheritanceGraph} from '../utils/inheritance_graph';
import {checkInheritanceOfKnownFields} from './problematic_patterns/check_inheritance';

/**
 * Phase that propagates incompatibilities to derived classes or
 * base classes. For example, consider:
 *
 * ```ts
 * class Base {
 *   bla = true;
 * }
 *
 * class Derived extends Base {
 *   @Input() bla = false;
 * }
 * ```
 *
 * Whenever we migrate `Derived`, the inheritance would fail
 * and result in a build breakage because `Base#bla` is not an Angular input.
 *
 * The logic here detects such cases and marks `bla` as incompatible. If `Derived`
 * would then have other derived classes as well, it would propagate the status.
 */
export function pass4__checkInheritanceOfInputs(
  inheritanceGraph: InheritanceGraph,
  metaRegistry: MetadataReader | null,
  knownInputs: KnownInputs,
) {
  checkInheritanceOfKnownFields(inheritanceGraph, metaRegistry, knownInputs, {
    isClassWithKnownFields: (clazz) => knownInputs.isInputContainingClass(clazz),
    getFieldsForClass: (clazz) => {
      const directiveInfo = knownInputs.getDirectiveInfoForClass(clazz);
      assert(directiveInfo !== undefined, 'Expected directive info to exist for input.');
      return Array.from(directiveInfo.inputFields.values()).map((i) => i.descriptor);
    },
  });
}
