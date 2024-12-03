/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {MetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import assert from 'assert';
import ts from 'typescript';
import {getMemberName} from '../../utils/class_member_names';
import {InheritanceGraph} from '../../utils/inheritance_graph';
import {ClassFieldDescriptor, KnownFields} from '../reference_resolution/known_fields';

export interface InheritanceTracker<D extends ClassFieldDescriptor> {
  captureKnownFieldInheritanceRelationship(derived: D, parent: D): void;
  captureUnknownDerivedField(field: D): void;
  captureUnknownParentField(field: D): void;
}

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
export function checkInheritanceOfKnownFields<D extends ClassFieldDescriptor>(
  inheritanceGraph: InheritanceGraph,
  metaRegistry: MetadataReader | null,
  fields: KnownFields<D> & InheritanceTracker<D>,
  opts: {
    getFieldsForClass: (node: ts.ClassDeclaration) => D[];
    isClassWithKnownFields: (node: ts.ClassDeclaration) => boolean;
  },
) {
  const allInputClasses = Array.from(inheritanceGraph.allClassesInInheritance).filter(
    (t) => ts.isClassDeclaration(t) && opts.isClassWithKnownFields(t),
  );

  for (const inputClass of allInputClasses) {
    // Note: Class parents of `inputClass` were already checked by
    // the previous iterations (given the reverse topological sort)—
    // hence it's safe to assume that incompatibility of parent classes will
    // not change again, at a later time.

    assert(ts.isClassDeclaration(inputClass), 'Expected input graph node to be always a class.');
    const classFields = opts.getFieldsForClass(inputClass);
    const inputFieldNamesFromMetadataArray = new Set<string>();

    // Iterate through derived class chains and determine all inputs that are overridden
    // via class metadata fields. e.g `@Component#inputs`. This is later used to mark a
    // potential similar class input as incompatible— because those cannot be migrated.
    if (metaRegistry !== null) {
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
        fields.captureUnknownDerivedField(fieldDescr);
      }

      for (const derived of derivedMembers) {
        const derivedInput = fields.attemptRetrieveDescriptorFromSymbol(derived);
        if (derivedInput !== null) {
          // Note: We always track dependencies from the child to the parent,
          // so skip here for now.
          continue;
        }

        // If we discover a derived, non-input member, then it will cause
        // conflicts, and we mark the current input as incompatible.
        fields.captureUnknownDerivedField(fieldDescr);
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
        fields.captureUnknownParentField(fieldDescr);
        continue;
      }
      fields.captureKnownFieldInheritanceRelationship(fieldDescr, inheritedMemberInput);
    }
  }
}
