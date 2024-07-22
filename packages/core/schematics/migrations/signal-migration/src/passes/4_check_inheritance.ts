/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import assert from 'assert';
import {InputIncompatibilityReason} from '../input_detection/incompatibility';
import {KnownInputInfo, KnownInputs} from '../input_detection/known_inputs';
import {attemptRetrieveInputFromSymbol} from '../input_detection/nodes_to_input';
import {MigrationHost} from '../migration_host';
import {InheritanceGraph} from '../utils/inheritance_graph';
import {topologicalSort} from '../utils/inheritance_sort';
import {getMemberName} from '../utils/class_member_names';
import ts from 'typescript';
import {MetadataReader} from '../../../../../../compiler-cli/src/ngtsc/metadata';
import {Reference} from '../../../../../../compiler-cli/src/ngtsc/imports';
import {ClassDeclaration} from '../../../../../../compiler-cli/src/ngtsc/reflection';
import {isInputContainerNode} from '../input_detection/input_node';
import {getInputDescriptor} from '../utils/input_id';

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
export function pass4__checkInheritanceOfInputs(
  host: MigrationHost,
  inheritanceGraph: InheritanceGraph,
  metaRegistry: MetadataReader,
  knownInputs: KnownInputs,
) {
  // Sort topologically and iterate super classes first, so that we can trivially
  // propagate incompatibility statuses (and other checks) without having to check
  // in both directions (derived classes, or base classes). This simplifies the logic
  // further down in this function significantly.
  const topologicalSortedClasses = topologicalSort(inheritanceGraph)
    .filter((t) => ts.isClassDeclaration(t) && knownInputs.isInputContainingClass(t))
    .reverse();

  for (const inputClass of topologicalSortedClasses) {
    // Note: Class parents of `inputClass` were already checked by
    // the previous iterations (given the reverse topological sort)—
    // hence it's safe to assume that incompatibility of parent classes will
    // not change again, at a later time.

    assert(ts.isClassDeclaration(inputClass), 'Expected input graph node to be always a class.');
    const directiveInfo = knownInputs.getDirectiveInfoForClass(inputClass);
    assert(directiveInfo !== undefined, 'Expected directive info to exist for input class.');

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
    inputCheck: for (const info of directiveInfo.inputFields.values()) {
      const inputNode = info.descriptor.node;
      const {derivedMembers, inherited} = inheritanceGraph.checkOverlappingMembers(
        inputClass,
        inputNode,
        getMemberName(inputNode)!,
      );

      // If we discover a derived, input re-declared via class metadata, then it
      // will cause conflicts as we cannot migrate it/ nor mark it as signal-based.
      if (inputFieldNamesFromMetadataArray.has(info.metadata.classPropertyName)) {
        knownInputs.markInputAsIncompatible(info.descriptor, {
          context: null,
          reason: InputIncompatibilityReason.RedeclaredViaDerivedClassInputsArray,
        });
      }

      for (const derived of derivedMembers) {
        const derivedInput = attemptRetrieveInputFromSymbol(host, derived, knownInputs);
        if (derivedInput !== null) {
          continue;
        }

        // If we discover a derived, non-input member, then it will cause
        // conflicts, and we mark the current input as incompatible.
        knownInputs.markInputAsIncompatible(info.descriptor, {
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
      const {inheritedMemberInput} = analyzeInheritanceOfMember(
        inherited,
        inputNode,
        host,
        knownInputs,
      );
      // Parent is not an input, and hence will conflict..
      if (inheritedMemberInput === undefined) {
        knownInputs.markInputAsIncompatible(info.descriptor, {
          context: inherited.valueDeclaration ?? inputNode,
          reason: InputIncompatibilityReason.TypeConflictWithBaseClass,
        });
        continue;
      }
      // Parent is incompatible, so this input also needs to be.
      // It cannot be migrated.
      if (inheritedMemberInput.isIncompatible()) {
        knownInputs.markInputAsIncompatible(info.descriptor, {
          context: inheritedMemberInput.descriptor.node,
          reason: InputIncompatibilityReason.ParentIsIncompatible,
        });
        continue;
      }
    }
  }
}

function analyzeInheritanceOfMember(
  inheritedMember: ts.Symbol,
  member: ts.ClassElement,
  host: MigrationHost,
  knownInputs: KnownInputs,
): {inheritedMemberInput: KnownInputInfo | undefined; memberInput: KnownInputInfo | undefined} {
  // If the member itself is an input that is being migrated, we
  // do not need to check, as overriding would be fine then— like before.
  const memberInputDescr = isInputContainerNode(member) ? getInputDescriptor(host, member) : null;
  const memberInput = memberInputDescr !== null ? knownInputs.get(memberInputDescr) : undefined;

  const inheritedMemberInputId =
    inheritedMember.valueDeclaration !== undefined &&
    isInputContainerNode(inheritedMember.valueDeclaration)
      ? getInputDescriptor(host, inheritedMember.valueDeclaration)
      : null;
  const inheritedMemberInput =
    inheritedMemberInputId !== null ? knownInputs.get(inheritedMemberInputId) : undefined;

  return {
    inheritedMemberInput,
    memberInput,
  };
}
