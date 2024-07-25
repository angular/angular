/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'path';
import ts from 'typescript';

import {NodeJSFileSystem, setFileSystem} from '../../../../../compiler-cli/src/ngtsc/file_system';
import {DtsMetadataReader, MetadataReader} from '../../../../../compiler-cli/src/ngtsc/metadata';
import {PartialEvaluator} from '../../../../../compiler-cli/src/ngtsc/partial_evaluator';
import {NgtscProgram} from '../../../../../compiler-cli/src/ngtsc/program';
import {TypeScriptReflectionHost} from '../../../../../compiler-cli/src/ngtsc/reflection';

import {
  ParsedConfiguration,
  readConfiguration,
} from '../../../../../compiler-cli/src/perform_compile';
import {TemplateTypeChecker} from '../../../../../compiler-cli/src/ngtsc/typecheck/api';
import {ReferenceEmitter} from '../../../../../compiler-cli/src/ngtsc/imports';
import {isShim} from '../../../../../compiler-cli/src/ngtsc/shims';
import {NgCompiler} from '../../../../../compiler-cli/src/ngtsc/core';
import assert from 'assert';

/**
 * Interface containing the analysis information
 * for an Angular program to be migrated.
 */
export interface AnalysisProgramInfo {
  // List of source files in the program.
  sourceFiles: readonly ts.SourceFile[];
  // List of all files in the program, including external `d.ts`.
  programFiles: readonly ts.SourceFile[];
  reflector: TypeScriptReflectionHost;
  typeChecker: ts.TypeChecker;
  templateTypeChecker: TemplateTypeChecker;
  metaRegistry: MetadataReader;
  dtsMetadataReader: DtsMetadataReader;
  evaluator: PartialEvaluator;
  refEmitter: ReferenceEmitter;
}

/** Creates and prepares analysis for the given TypeScript project. */
export function createAndPrepareAnalysisProgram(
  absoluteTsconfigPath: string,
): AnalysisProgramInfo & {
  tsHost: ts.CompilerHost;
  basePath: string;
  tsconfig: ParsedConfiguration;
} {
  setFileSystem(new NodeJSFileSystem());

  const basePath = path.dirname(absoluteTsconfigPath);
  const tsconfig = readConfiguration(absoluteTsconfigPath, {}, new NodeJSFileSystem());

  if (tsconfig.errors.length > 0) {
    throw new Error(
      `Tsconfig could not be parsed or is invalid:\n\n` +
        `${tsconfig.errors.map((e) => e.messageText)}`,
    );
  }

  const tsHost = ts.createCompilerHost(tsconfig.options, true);
  const ngtscProgram = new NgtscProgram(
    tsconfig.rootNames,
    {
      ...tsconfig.options,
      _enableTemplateTypeChecker: true,
      _compilePoisonedComponents: true,
      // We want to migrate non-exported classes too.
      compileNonExportedClasses: true,
      // Avoid checking libraries to speed up the migration.
      skipLibCheck: true,
      skipDefaultLibCheck: true,
      // Always generate as much TCB code as possible.
      // This allows us to check references in templates as much as possible.
      // Note that this may yield more diagnostics, but we are not collecting these anyway.
      strictTemplates: true,
    },
    tsHost,
  );

  const userProgram = ngtscProgram.getTsProgram();

  return {
    ...prepareAnalysisInfo(userProgram, ngtscProgram.compiler, tsconfig),
    tsconfig,
    basePath,
    tsHost,
  };
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
  tsconfig?: ParsedConfiguration,
) {
  // Get template type checker & analyze sync.
  const templateTypeChecker = compiler.getTemplateTypeChecker();

  // Generate all type check blocks.
  templateTypeChecker.generateAllTypeCheckBlocks();

  const {refEmitter, metaReader} = compiler['ensureAnalyzed']();
  const typeChecker = userProgram.getTypeChecker();

  const reflector = new TypeScriptReflectionHost(typeChecker);
  const evaluator = new PartialEvaluator(reflector, typeChecker, null);
  const dtsMetadataReader = new DtsMetadataReader(typeChecker, reflector);

  const limitToRootNamesOnly = process.env['LIMIT_TO_ROOT_NAMES_ONLY'] === '1';
  if (limitToRootNamesOnly) {
    assert(
      tsconfig !== undefined,
      'Expected a tsconfig to be specified when limiting to root names.',
    );
  }

  const programFiles = userProgram.getSourceFiles();
  const sourceFiles = programFiles.filter(
    (f) =>
      !f.isDeclarationFile &&
      // Note `isShim` will work for the initial program, but for TCB programs, the shims are no longer annotated.
      !isShim(f) &&
      !f.fileName.endsWith('.ngtypecheck.ts') &&
      // Optional replacement filter. Allows parallel execution in case
      // some tsconfig's have overlap due to sharing of TS sources.
      // (this is commonly not the case in g3 where deps are `.d.ts` files).
      (!limitToRootNamesOnly || tsconfig!.rootNames.includes(f.fileName)),
  );

  return {
    programFiles,
    sourceFiles,
    metaRegistry: metaReader,
    dtsMetadataReader,
    evaluator,
    reflector,
    typeChecker,
    refEmitter,
    templateTypeChecker,
  };
}
