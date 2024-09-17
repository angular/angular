/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {MetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import assert from 'assert';
import ts from 'typescript';
import {InputIncompatibilityReason} from '../../input_detection/incompatibility';
import {getMemberName} from '../../utils/class_member_names';
import {InheritanceGraph} from '../../utils/inheritance_graph';
import {topologicalSort} from '../../utils/inheritance_sort';
import {ClassFieldDescriptor, KnownFields} from '../reference_resolution/known_fields';
import {ProblematicFieldRegistry} from './problematic_field_registry';

/**
 * Phase that propagates incompatibilities to derived classes or
 * base classes. For example, consider:
 *
 * ```
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
export function checkInheritanceOfKnownFields<D extends ClassFieldDescriptor>(
  inheritanceGraph: InheritanceGraph,
  metaRegistry: MetadataReader,
  fields: KnownFields<D> & ProblematicFieldRegistry<D>,
  opts: {
    getFieldsForClass: (node: ts.ClassDeclaration) => D[];
    isClassWithKnownFields: (node: ts.ClassDeclaration) => boolean;
  },
) {
  // Sort topologically and iterate super classes first, so that we can trivially
  // propagate incompatibility statuses (and other checks) without having to check
  // in both directions (derived classes, or base classes). This simplifies the logic
  // further down in this function significantly.
  const topologicalSortedClasses = topologicalSort(inheritanceGraph)
    .filter((t) => ts.isClassDeclaration(t) && opts.isClassWithKnownFields(t))
    .reverse();

  for (const inputClass of topologicalSortedClasses) {
    // Note: Class parents of `inputClass` were already checked by
    // the previous iterations (given the reverse topological sort)—
    // hence it's safe to assume that incompatibility of parent classes will
    // not change again, at a later time.

    assert(ts.isClassDeclaration(inputClass), 'Expected input graph node to be always a class.');
    const classFields = opts.getFieldsForClass(inputClass);

    // Iterate through derived class chains and determine all inputs that are overridden
    // via class metadata fields. e.g `@Component#inputs`. This is later used to mark a
    // potential similar class input as incompatible— because those cannot be migrated.
    const inputFieldNamesFromMetadataArray = new Set<string>();
    for (const derivedClasses of inheritanceGraph.traceDerivedClasses(inputClass)) {
      const derivedMeta =
        ts.isClassDeclaration(derivedClasses) && derivedClasses.name !== undefined
          ? metaRegistry.getDirectiveMetadata(new Reference(derivedClasses as ClassDeclaration))
          : null;

      if (derivedMeta !== null && derivedMeta.inputFieldNamesFromMetadataArray !== null) {
        derivedMeta.inputFieldNamesFromMetadataArray.forEach((b) =>
          inputFieldNamesFromMetadataArray.add(b),
        );
      }
    }

    // Check inheritance of every input in the given "directive class".
    inputCheck: for (const fieldDescr of classFields) {
      const inputNode = fieldDescr.node;
      const {derivedMembers, inherited} = inheritanceGraph.checkOverlappingMembers(
        inputClass,
        inputNode,
        getMemberName(inputNode)!,
      );

      // If we discover a derived, input re-declared via class metadata, then it
      // will cause conflicts as we cannot migrate it/ nor mark it as signal-based.
      if (
        fieldDescr.node.name !== undefined &&
        (ts.isIdentifier(fieldDescr.node.name) || ts.isStringLiteralLike(fieldDescr.node.name)) &&
        inputFieldNamesFromMetadataArray.has(fieldDescr.node.name.text)
      ) {
        fields.markFieldIncompatible(fieldDescr, {
          context: null,
          reason: InputIncompatibilityReason.RedeclaredViaDerivedClassInputsArray,
        });
      }

      for (const derived of derivedMembers) {
        const derivedInput = fields.attemptRetrieveDescriptorFromSymbol(derived);
        if (derivedInput !== null) {
          continue;
        }

        // If we discover a derived, non-input member, then it will cause
        // conflicts, and we mark the current input as incompatible.
        fields.markFieldIncompatible(fieldDescr, {
          context: derived.valueDeclaration ?? inputNode,
          reason: InputIncompatibilityReason.OverriddenByDerivedClass,
        });

        continue inputCheck;
      }

      // If there is no parent, we are done. Otherwise, check the parent
      // to either inherit or check the incompatibility with the inheritance.
      if (inherited === undefined) {
        continue;
      }
      const inheritedMemberInput = fields.attemptRetrieveDescriptorFromSymbol(inherited);
      // Parent is not an input, and hence will conflict..
      if (inheritedMemberInput === null) {
        fields.markFieldIncompatible(fieldDescr, {
          context: inherited.valueDeclaration ?? inputNode,
          reason: InputIncompatibilityReason.TypeConflictWithBaseClass,
        });
        continue;
      }
      // Parent is incompatible, so this input also needs to be.
      // It cannot be migrated.
      if (fields.isFieldIncompatible(inheritedMemberInput)) {
        fields.markFieldIncompatible(fieldDescr, {
          context: inheritedMemberInput.node,
          reason: InputIncompatibilityReason.ParentIsIncompatible,
        });
        continue;
      }
    }
  }
}
