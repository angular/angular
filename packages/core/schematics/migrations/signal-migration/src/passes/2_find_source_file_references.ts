/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';
import {KnownInputs} from '../input_detection/known_inputs';
import {MigrationResult} from '../result';
import {ProgramInfo} from '../../../../utils/tsurge';
import {GroupedTsAstVisitor} from '../utils/grouped_ts_ast_visitor';
import {createFindAllSourceFileReferencesVisitor} from './reference_resolution';

/**
 * Phase where problematic patterns are detected and advise
 * the migration to skip certain inputs.
 *
 * For example, detects classes that are instantiated manually. Those
 * cannot be migrated as `input()` requires an injection context.
 *
 * In addition, spying onto an input may be problematic- so we skip migrating
 * such.
 */
export function pass2_IdentifySourceFileReferences(
  programInfo: ProgramInfo,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  resourceLoader: ResourceLoader | null,
  evaluator: PartialEvaluator,
  templateTypeChecker: TemplateTypeChecker | null,
  groupedTsAstVisitor: GroupedTsAstVisitor,
  knownInputs: KnownInputs,
  result: MigrationResult,
  fieldNamesToConsiderForReferenceLookup: Set<string> | null,
) {
  groupedTsAstVisitor.register(
    createFindAllSourceFileReferencesVisitor(
      programInfo,
      checker,
      reflector,
      resourceLoader,
      evaluator,
      templateTypeChecker,
      knownInputs,
      fieldNamesToConsiderForReferenceLookup,
      result,
    ).visitor,
  );
}
