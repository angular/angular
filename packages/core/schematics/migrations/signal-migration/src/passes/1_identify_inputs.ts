/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'assert';
import ts from 'typescript';
import {ReferenceEmitter} from '@angular/compiler-cli/src/ngtsc/imports';
import {DtsMetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {extractDecoratorInput} from '../input_detection/input_decorator';
import {isInputContainerNode} from '../input_detection/input_node';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationHost} from '../migration_host';
import {MigrationResult} from '../result';
import {getInputDescriptor} from '../utils/input_id';
import {prepareAndCheckForConversion} from '../convert-input/prepare_and_check';
import {isFieldIncompatibility} from './problematic_patterns/incompatibility';

/**
 * Phase where we iterate through all source files of the program (including `.d.ts`)
 * and keep track of all `@Input`'s we discover.
 */
export function pass1__IdentifySourceFileAndDeclarationInputs(
  sf: ts.SourceFile,
  host: MigrationHost,
  checker: ts.TypeChecker,
  reflector: TypeScriptReflectionHost,
  dtsMetadataReader: DtsMetadataReader,
  evaluator: PartialEvaluator,
  knownDecoratorInputs: KnownInputs,
  result: MigrationResult,
) {
  const visitor = (node: ts.Node) => {
    const decoratorInput = extractDecoratorInput(
      node,
      host,
      reflector,
      dtsMetadataReader,
      evaluator,
    );
    if (decoratorInput !== null) {
      assert(isInputContainerNode(node), 'Expected input to be declared on accessor or property.');
      const inputDescr = getInputDescriptor(host, node);

      // track all inputs, even from declarations for reference resolution.
      knownDecoratorInputs.register({descriptor: inputDescr, metadata: decoratorInput, node});

      // track source file inputs in the result of this target.
      // these are then later migrated in the migration phase.
      if (decoratorInput.inSourceFile && host.isSourceFileForCurrentMigration(sf)) {
        const conversionPreparation = prepareAndCheckForConversion(
          node,
          decoratorInput,
          checker,
          host.compilerOptions,
        );

        if (isFieldIncompatibility(conversionPreparation)) {
          knownDecoratorInputs.markFieldIncompatible(inputDescr, conversionPreparation);
          result.sourceInputs.set(inputDescr, null);
        } else {
          result.sourceInputs.set(inputDescr, conversionPreparation);
        }
      }
    }

    // track all imports to `Input` or `input`.
    let importName: string | null = null;
    if (
      ts.isImportSpecifier(node) &&
      ((importName = (node.propertyName ?? node.name).text) === 'Input' ||
        importName === 'input') &&
      ts.isStringLiteral(node.parent.parent.parent.moduleSpecifier) &&
      (host.isMigratingCore || node.parent.parent.parent.moduleSpecifier.text === '@angular/core')
    ) {
      if (!result.inputDecoratorSpecifiers.has(sf)) {
        result.inputDecoratorSpecifiers.set(sf, []);
      }
      result.inputDecoratorSpecifiers.get(sf)!.push({
        kind: importName === 'input' ? 'signal-input-import' : 'decorator-input-import',
        node,
      });
    }

    ts.forEachChild(node, visitor);
  };
  ts.forEachChild(sf, visitor);
}
