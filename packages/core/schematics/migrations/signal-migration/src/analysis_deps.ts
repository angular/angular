/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DtsMetadataReader, MetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';

import {ResourceLoader} from '@angular/compiler-cli/src/ngtsc/annotations';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {ReferenceEmitter} from '@angular/compiler-cli/src/ngtsc/imports';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {ProgramInfo} from '../../../utils/tsurge/program_info';

/**
 * Interface containing the analysis information
 * for an Angular program to be migrated.
 */
export interface AnalysisProgramInfo extends ProgramInfo {
  reflector: TypeScriptReflectionHost;
  typeChecker: ts.TypeChecker;
  dtsMetadataReader: DtsMetadataReader;
  evaluator: PartialEvaluator;

  templateTypeChecker: TemplateTypeChecker | null;
  metaRegistry: MetadataReader | null;
  refEmitter: ReferenceEmitter | null;
  resourceLoader: ResourceLoader | null;
}

/**
 * Prepares migration analysis for the given program.
 *
 * Unlike {@link createAndPrepareAnalysisProgram} this does not create the program,
 * and can be used for integrations with e.g. the language service.
 */
export function prepareAnalysisInfo(
  userProgram: ts.Program,
  compiler: NgCompiler | null,
  programAbsoluteRootPaths?: string[],
) {
  let refEmitter: ReferenceEmitter | null = null;
  let metaReader: MetadataReader | null = null;
  let templateTypeChecker: TemplateTypeChecker | null = null;
  let resourceLoader: ResourceLoader | null = null;

  if (compiler !== null) {
    // Analyze sync and retrieve necessary dependencies.
    // Note: `getTemplateTypeChecker` requires the `enableTemplateTypeChecker` flag, but
    // this has negative effects as it causes optional TCB operations to execute, which may
    // error with unsuccessful reference emits that previously were ignored outside of the migration.
    // The migration is resilient to TCB information missing, so this is fine, and all the information
    // we need is part of required TCB operations anyway.
    const state = compiler['ensureAnalyzed']();

    resourceLoader = compiler['resourceManager'];
    refEmitter = state.refEmitter;
    metaReader = state.metaReader;
    templateTypeChecker = state.templateTypeChecker;

    // Generate all type check blocks.
    state.templateTypeChecker.generateAllTypeCheckBlocks();
  }

  const typeChecker = userProgram.getTypeChecker();

  const reflector = new TypeScriptReflectionHost(typeChecker);
  const evaluator = new PartialEvaluator(reflector, typeChecker, null);
  const dtsMetadataReader = new DtsMetadataReader(typeChecker, reflector);

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
