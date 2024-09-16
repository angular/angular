/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DtsMetadataReader, MetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';

import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {ReferenceEmitter} from '@angular/compiler-cli/src/ngtsc/imports';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import assert from 'assert';
import {ProgramInfo} from '../../../utils/tsurge/program_info';

/**
 * Interface containing the analysis information
 * for an Angular program to be migrated.
 */
export interface AnalysisProgramInfo extends ProgramInfo {
  reflector: TypeScriptReflectionHost;
  typeChecker: ts.TypeChecker;
  templateTypeChecker: TemplateTypeChecker;
  metaRegistry: MetadataReader;
  dtsMetadataReader: DtsMetadataReader;
  evaluator: PartialEvaluator;
  refEmitter: ReferenceEmitter;
  resourceLoader: ResourceLoader;
}

/**
 * Prepares migration analysis for the given program.
 *
 * Unlike {@link createAndPrepareAnalysisProgram} this does not create the program,
 * and can be used for integrations with e.g. the language service.
 */
export function prepareAnalysisInfo(
  userProgram: ts.Program,
  compiler: NgCompiler,
  programAbsoluteRootPaths?: string[],
) {
  // Analyze sync and retrieve necessary dependencies.
  // Note: `getTemplateTypeChecker` requires the `enableTemplateTypeChecker` flag, but
  // this has negative effects as it causes optional TCB operations to execute, which may
  // error with unsuccessful reference emits that previously were ignored outside of the migration.
  // The migration is resilient to TCB information missing, so this is fine, and all the information
  // we need is part of required TCB operations anyway.
  const {refEmitter, metaReader, templateTypeChecker} = compiler['ensureAnalyzed']();

  // Generate all type check blocks.
  templateTypeChecker.generateAllTypeCheckBlocks();

  const typeChecker = userProgram.getTypeChecker();

  const reflector = new TypeScriptReflectionHost(typeChecker);
  const evaluator = new PartialEvaluator(reflector, typeChecker, null);
  const dtsMetadataReader = new DtsMetadataReader(typeChecker, reflector);
  const resourceLoader = compiler['resourceManager'];

  // Optional filter for testing. Allows for simulation of parallel execution
  // even if some tsconfig's have overlap due to sharing of TS sources.
  // (this is commonly not the case in g3 where deps are `.d.ts` files).
  const limitToRootNamesOnly = process.env['LIMIT_TO_ROOT_NAMES_ONLY'] === '1';
  if (limitToRootNamesOnly) {
    assert(
      programAbsoluteRootPaths !== undefined,
      'Expected absolute root paths when limiting to root names.',
    );
  }

  return {
    metaRegistry: metaReader,
    dtsMetadataReader,
    evaluator,
    reflector,
    typeChecker,
    refEmitter,
    templateTypeChecker,
    resourceLoader,
  };
}
