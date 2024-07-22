/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ReflectionHost} from '../../../../../../compiler-cli/src/ngtsc/reflection';
import {TemplateTypeChecker} from '../../../../../../compiler-cli/src/ngtsc/typecheck/api';
import {isInputContainerNode} from '../input_detection/input_node';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {DebugElementComponentInstance} from '../pattern_advisors/debug_element_component_instance';
import {MigrationResult} from '../result';
import {identifyHostBindingReferences} from './references/identify_host_references';
import {identifyTemplateReferences} from './references/identify_template_references';
import {identifyPotentialTypeScriptReference} from './references/identify_ts_references';
import {PartialDirectiveTypeInCatalystTests} from '../pattern_advisors/partial_directive_type';
import {InputReferenceKind} from '../utils/input_reference';

/**
 * Phase where we iterate through all source file references and
 * detect references to inputs.
 *
 * Such references will need to be migrated to unwrap signals,
 * given that the property is no longer a raw container of
 * a value, but rather an `InputSignal`.
 *
 * This phase detects references in all types of locations:
 *    - TS source files
 *    - Angular templates (inline or external)
 *    - Host binding expressions.
 */
export function pass2_IdentifySourceFileReferences(
  sf: ts.SourceFile,
  host: MigrationHost,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  templateTypeChecker: TemplateTypeChecker,
  knownInputs: KnownInputs,
  result: MigrationResult,
) {
  const debugElComponentInstanceTracker = new DebugElementComponentInstance(checker);
  const partialDirectiveCatalystTracker = new PartialDirectiveTypeInCatalystTests(
    checker,
    knownInputs,
  );

  const visitor = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      identifyTemplateReferences(node, host, checker, templateTypeChecker, result, knownInputs);
      identifyHostBindingReferences(node, host, checker, reflector, result, knownInputs);
    }

    // find references, but do not capture:
    //    (1) input declarations.
    //    (2) binding element declarations.
    if (
      ts.isIdentifier(node) &&
      !(
        (isInputContainerNode(node.parent) && node.parent.name === node) ||
        ts.isBindingElement(node.parent)
      )
    ) {
      identifyPotentialTypeScriptReference(node, host, checker, knownInputs, result, {
        debugElComponentInstanceTracker,
      });
    }

    // Detect `Partial<T>` references.
    // Those are relevant to be tracked as they may be updated in Catalyst to
    // unwrap signal inputs. Commonly people use `Partial` in Catalyst to type
    // some "component initial values".
    const partialDirectiveInCatalyst = partialDirectiveCatalystTracker.detect(node);
    if (partialDirectiveInCatalyst !== null) {
      result.references.push({
        kind: InputReferenceKind.TsInputClassTypeReference,
        from: {
          fileId: host.fileToId(partialDirectiveInCatalyst.referenceNode.getSourceFile()),
          node: partialDirectiveInCatalyst.referenceNode,
        },
        isPartialReference: true,
        isPartOfCatalystFile: true,
        target: partialDirectiveInCatalyst.targetClass,
      });
    }

    ts.forEachChild(node, visitor);
  };
  ts.forEachChild(sf, visitor);
}
