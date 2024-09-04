/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
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
import {GroupedTsAstVisitor} from '../utils/grouped_ts_ast_visitor';
import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';

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
  host: MigrationHost,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  resourceLoader: ResourceLoader,
  evaluator: PartialEvaluator,
  templateTypeChecker: TemplateTypeChecker,
  groupedTsAstVisitor: GroupedTsAstVisitor,
  knownInputs: KnownInputs,
  result: MigrationResult,
) {
  const debugElComponentInstanceTracker = new DebugElementComponentInstance(checker);
  const partialDirectiveCatalystTracker = new PartialDirectiveTypeInCatalystTests(
    checker,
    knownInputs,
  );

  // List of input field names that will be migrated.
  const migratedInputFieldNames = new Set<string>(
    Array.from(knownInputs.knownInputIds.values())
      .filter((v) => host.config.shouldMigrateInput?.(v) ?? true)
      .map((v) => v.descriptor.node.name.text),
  );

  const perfCounters = {
    template: 0,
    hostBindings: 0,
    tsReferences: 0,
    tsTypes: 0,
  };

  const visitor = (node: ts.Node) => {
    let lastTime = performance.now();

    if (ts.isClassDeclaration(node)) {
      identifyTemplateReferences(
        node,
        host,
        reflector,
        checker,
        evaluator,
        templateTypeChecker,
        resourceLoader,
        host.compilerOptions,
        result,
        knownInputs,
      );
      perfCounters.template += (performance.now() - lastTime) / 1000;
      lastTime = performance.now();

      identifyHostBindingReferences(node, host, checker, reflector, result, knownInputs);

      perfCounters.hostBindings += (performance.now() - lastTime) / 1000;
      lastTime = performance.now();
    }

    lastTime = performance.now();

    // find references, but do not capture input declarations itself.
    if (
      ts.isIdentifier(node) &&
      !(isInputContainerNode(node.parent) && node.parent.name === node)
    ) {
      identifyPotentialTypeScriptReference(
        node,
        host,
        checker,
        knownInputs,
        result,
        migratedInputFieldNames,
        {
          debugElComponentInstanceTracker,
        },
      );
    }

    perfCounters.tsReferences += (performance.now() - lastTime) / 1000;
    lastTime = performance.now();
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

    perfCounters.tsTypes += (performance.now() - lastTime) / 1000;
  };

  groupedTsAstVisitor.register(visitor, () => {
    if (process.env['DEBUG'] === '1') {
      console.info('Source file analysis performance', perfCounters);
    }
  });
}
