/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  PartialEvaluator,
  ReflectionHost,
  ResourceLoader,
  TemplateTypeChecker,
} from '@angular/compiler-cli';
import ts from 'typescript';
import {ProgramInfo, projectFile} from '../../../../../utils/tsurge';
import {isInputContainerNode} from '../../input_detection/input_node';
import {DebugElementComponentInstance} from '../../pattern_advisors/debug_element_component_instance';
import {PartialDirectiveTypeInCatalystTests} from '../../pattern_advisors/partial_directive_type';
import {identifyHostBindingReferences} from './identify_host_references';
import {identifyTemplateReferences} from './identify_template_references';
import {identifyPotentialTypeScriptReference} from './identify_ts_references';
import {ClassFieldDescriptor, KnownFields} from './known_fields';
import {ReferenceKind} from './reference_kinds';
import {ReferenceResult} from './reference_result';

/**
 * Phase where we iterate through all source file references and
 * detect references to known fields (e.g. commonly inputs).
 *
 * This is useful, for example in the signal input migration whe
 * references need to be migrated to unwrap signals, given that
 * their target properties is no longer holding a raw value, but
 * instead an `InputSignal`.
 *
 * This phase detects references in all types of locations:
 *    - TS source files
 *    - Angular templates (inline or external)
 *    - Host binding expressions.
 */
export function createFindAllSourceFileReferencesVisitor<D extends ClassFieldDescriptor>(
  programInfo: ProgramInfo,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  resourceLoader: ResourceLoader | null,
  evaluator: PartialEvaluator,
  templateTypeChecker: TemplateTypeChecker | null,
  knownFields: KnownFields<D>,
  fieldNamesToConsiderForReferenceLookup: Set<string> | null,
  result: ReferenceResult<D>,
) {
  const debugElComponentInstanceTracker = new DebugElementComponentInstance(checker);
  const partialDirectiveCatalystTracker = new PartialDirectiveTypeInCatalystTests(
    checker,
    knownFields,
  );

  const perfCounters = {
    template: 0,
    hostBindings: 0,
    tsReferences: 0,
    tsTypes: 0,
  };

  // Schematic NodeJS execution may not have `global.performance` defined.
  const currentTimeInMs = () =>
    typeof global.performance !== 'undefined' ? global.performance.now() : Date.now();

  const visitor = (node: ts.Node) => {
    let lastTime = currentTimeInMs();

    // Note: If there is no template type checker and resource loader, we aren't processing
    // an Angular program, and can skip template detection.
    if (ts.isClassDeclaration(node) && templateTypeChecker !== null && resourceLoader !== null) {
      identifyTemplateReferences(
        programInfo,
        node,
        reflector,
        checker,
        evaluator,
        templateTypeChecker,
        resourceLoader,
        programInfo.userOptions,
        result,
        knownFields,
        fieldNamesToConsiderForReferenceLookup,
      );
      perfCounters.template += (currentTimeInMs() - lastTime) / 1000;
      lastTime = currentTimeInMs();

      identifyHostBindingReferences(
        node,
        programInfo,
        checker,
        reflector,
        result,
        knownFields,
        fieldNamesToConsiderForReferenceLookup,
      );

      perfCounters.hostBindings += (currentTimeInMs() - lastTime) / 1000;
      lastTime = currentTimeInMs();
    }

    lastTime = currentTimeInMs();

    // find references, but do not capture input declarations itself.
    if (
      ts.isIdentifier(node) &&
      !(isInputContainerNode(node.parent) && node.parent.name === node)
    ) {
      identifyPotentialTypeScriptReference(
        node,
        programInfo,
        checker,
        knownFields,
        result,
        fieldNamesToConsiderForReferenceLookup,
        {
          debugElComponentInstanceTracker,
        },
      );
    }

    perfCounters.tsReferences += (currentTimeInMs() - lastTime) / 1000;
    lastTime = currentTimeInMs();
    // Detect `Partial<T>` references.
    // Those are relevant to be tracked as they may be updated in Catalyst to
    // unwrap signal inputs. Commonly people use `Partial` in Catalyst to type
    // some "component initial values".
    const partialDirectiveInCatalyst = partialDirectiveCatalystTracker.detect(node);
    if (partialDirectiveInCatalyst !== null) {
      result.references.push({
        kind: ReferenceKind.TsClassTypeReference,
        from: {
          file: projectFile(partialDirectiveInCatalyst.referenceNode.getSourceFile(), programInfo),
          node: partialDirectiveInCatalyst.referenceNode,
        },
        isPartialReference: true,
        isPartOfCatalystFile: true,
        target: partialDirectiveInCatalyst.targetClass,
      });
    }

    perfCounters.tsTypes += (currentTimeInMs() - lastTime) / 1000;
  };

  return {
    visitor,
    debugPrintMetrics: () => {
      console.info('Source file analysis performance', perfCounters);
    },
  };
}
