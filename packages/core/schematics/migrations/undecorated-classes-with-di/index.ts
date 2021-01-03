/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {logging} from '@angular-devkit/core';
import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {AotCompiler} from '@angular/compiler';
import {Diagnostic as NgDiagnostic} from '@angular/compiler-cli';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationCompilerHost} from '../../utils/typescript/compiler_host';

import {createNgcProgram} from './create_ngc_program';
import {NgDeclarationCollector} from './ng_declaration_collector';
import {UndecoratedClassesTransform} from './transform';
import {UpdateRecorder} from './update_recorder';

const MIGRATION_RERUN_MESSAGE = 'Migration can be rerun with: "ng update @angular/core ' +
    '--migrate-only migration-v9-undecorated-classes-with-di"';

const MIGRATION_AOT_FAILURE = 'This migration uses the Angular compiler internally and ' +
    'therefore projects that no longer build successfully after the update cannot run ' +
    'the migration. Please ensure there are no AOT compilation errors and rerun the migration.';

/** Entry point for the V9 "undecorated-classes-with-di" migration. */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const failures: string[] = [];
    let programError = false;

    if (!buildPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate undecorated derived classes and ' +
          'undecorated base classes which use DI.');
    }

    for (const tsconfigPath of buildPaths) {
      const result = runUndecoratedClassesMigration(tree, tsconfigPath, basePath, ctx.logger);
      failures.push(...result.failures);
      programError = programError || !!result.programError;
    }

    if (programError) {
      ctx.logger.info('Could not migrate all undecorated classes that use dependency');
      ctx.logger.info('injection. Some project targets could not be analyzed due to');
      ctx.logger.info('TypeScript program failures.\n');
      ctx.logger.info(`${MIGRATION_RERUN_MESSAGE}\n`);

      if (failures.length) {
        ctx.logger.info('Please manually fix the following failures and re-run the');
        ctx.logger.info('migration once the TypeScript program failures are resolved.');
        failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
      }
    } else if (failures.length) {
      ctx.logger.info('Could not migrate all undecorated classes that use dependency');
      ctx.logger.info('injection. Please manually fix the following failures:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    }
  };
}

function runUndecoratedClassesMigration(
    tree: Tree, tsconfigPath: string, basePath: string,
    logger: logging.LoggerApi): {failures: string[], programError?: boolean} {
  const failures: string[] = [];
  const programData = gracefullyCreateProgram(tree, basePath, tsconfigPath, logger);

  // Gracefully exit if the program could not be created.
  if (programData === null) {
    return {failures: [], programError: true};
  }

  const {program, compiler} = programData;
  const typeChecker = program.getTypeChecker();
  const partialEvaluator = new PartialEvaluator(
      new TypeScriptReflectionHost(typeChecker), typeChecker, /* dependencyTracker */ null);
  const declarationCollector = new NgDeclarationCollector(typeChecker, partialEvaluator);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting all directives, components and providers.
  sourceFiles.forEach(sourceFile => declarationCollector.visitNode(sourceFile));

  const {decoratedDirectives, decoratedProviders, undecoratedDeclarations} = declarationCollector;
  const transform =
      new UndecoratedClassesTransform(typeChecker, compiler, partialEvaluator, getUpdateRecorder);
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();

  // Run the migrations for decorated providers and both decorated and undecorated
  // directives. The transform failures are collected and converted into human-readable
  // failures which can be printed to the console.
  [...transform.migrateDecoratedDirectives(decoratedDirectives),
   ...transform.migrateDecoratedProviders(decoratedProviders),
   ...transform.migrateUndecoratedDeclarations(Array.from(undecoratedDeclarations))]
      .forEach(({node, message}) => {
        const nodeSourceFile = node.getSourceFile();
        const relativeFilePath = relative(basePath, nodeSourceFile.fileName);
        const {line, character} =
            ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
        failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: ${message}`);
      });

  // Record the changes collected in the import manager and transformer.
  transform.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shifted character offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  return {failures};

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      addClassComment(node: ts.ClassDeclaration, text: string) {
        treeRecorder.insertLeft(node.members.pos, `\n  // ${text}\n`);
      },
      addClassDecorator(node: ts.ClassDeclaration, text: string) {
        // New imports should be inserted at the left while decorators should be inserted
        // at the right in order to ensure that imports are inserted before the decorator
        // if the start position of import and decorator is the source file start.
        treeRecorder.insertRight(node.getStart(), `${text}\n`);
      },
      addNewImport(start: number, importText: string) {
        // New imports should be inserted at the left while decorators should be inserted
        // at the right in order to ensure that imports are inserted before the decorator
        // if the start position of import and decorator is the source file start.
        treeRecorder.insertLeft(start, importText);
      },
      updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string) {
        treeRecorder.remove(namedBindings.getStart(), namedBindings.getWidth());
        treeRecorder.insertRight(namedBindings.getStart(), newNamedBindings);
      },
      commitUpdate() {
        tree.commitUpdate(treeRecorder);
      }
    };
    updateRecorders.set(sourceFile, recorder);
    return recorder;
  }
}

function getErrorDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic|NgDiagnostic>) {
  return <ts.Diagnostic[]>diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
}

function gracefullyCreateProgram(
    tree: Tree, basePath: string, tsconfigPath: string,
    logger: logging.LoggerApi): {compiler: AotCompiler, program: ts.Program}|null {
  try {
    const {ngcProgram, host, program, compiler} = createNgcProgram(
        (options) => createMigrationCompilerHost(tree, options, basePath), tsconfigPath);
    const syntacticDiagnostics = getErrorDiagnostics(ngcProgram.getTsSyntacticDiagnostics());
    const structuralDiagnostics = getErrorDiagnostics(ngcProgram.getNgStructuralDiagnostics());
    const configDiagnostics = getErrorDiagnostics(
        [...program.getOptionsDiagnostics(), ...ngcProgram.getNgOptionDiagnostics()]);

    if (configDiagnostics.length) {
      logger.warn(
          `\nTypeScript project "${tsconfigPath}" has configuration errors. This could cause ` +
          `an incomplete migration. Please fix the following failures and rerun the migration:`);
      logger.error(ts.formatDiagnostics(configDiagnostics, host));
      return null;
    }

    // Syntactic TypeScript errors can throw off the query analysis and therefore we want
    // to notify the developer that we couldn't analyze parts of the project. Developers
    // can just re-run the migration after fixing these failures.
    if (syntacticDiagnostics.length) {
      logger.warn(
          `\nTypeScript project "${tsconfigPath}" has syntactical errors which could cause ` +
          `an incomplete migration. Please fix the following failures and rerun the migration:`);
      logger.error(ts.formatDiagnostics(syntacticDiagnostics, host));
      return null;
    }

    if (structuralDiagnostics.length) {
      throw new Error(ts.formatDiagnostics(<ts.Diagnostic[]>structuralDiagnostics, host));
    }

    return {program, compiler};
  } catch (e) {
    logger.warn(`\n${MIGRATION_AOT_FAILURE} The following project failed: ${tsconfigPath}\n`);
    logger.error(`${e.toString()}\n`);
    return null;
  }
}
