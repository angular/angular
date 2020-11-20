/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {Collector} from './collector';
import {AnalysisFailure, ModuleWithProvidersTransform} from './transform';


/**
 * Runs the ModuleWithProviders migration for all TypeScript projects in the current CLI workspace.
 */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];
    const failures: string[] = [];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate ModuleWithProviders.');
    }

    for (const tsconfigPath of allPaths) {
      failures.push(...runModuleWithProvidersMigration(tree, tsconfigPath, basePath));
    }

    if (failures.length) {
      ctx.logger.info('Could not migrate all instances of ModuleWithProviders');
      ctx.logger.info('Please manually fix the following failures:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    }
  };
}

function runModuleWithProvidersMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const failures: string[] = [];
  const typeChecker = program.getTypeChecker();
  const collector = new Collector(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting all modules.
  sourceFiles.forEach(sourceFile => collector.visitNode(sourceFile));

  const {resolvedModules, resolvedNonGenerics} = collector;
  const transformer = new ModuleWithProvidersTransform(typeChecker, getUpdateRecorder);
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();

  [...resolvedModules.reduce(
       (failures, m) => failures.concat(transformer.migrateModule(m)), [] as AnalysisFailure[]),
   ...resolvedNonGenerics.reduce(
       (failures, t) => failures.concat(transformer.migrateType(t)), [] as AnalysisFailure[])]
      .forEach(({message, node}) => {
        const nodeSourceFile = node.getSourceFile();
        const relativeFilePath = relative(basePath, nodeSourceFile.fileName);
        const {line, character} =
            ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
        failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: ${message}`);
      });

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shift character offsets.
  updateRecorders.forEach(recorder => tree.commitUpdate(recorder));

  return failures;

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const recorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    updateRecorders.set(sourceFile, recorder);
    return recorder;
  }
}
