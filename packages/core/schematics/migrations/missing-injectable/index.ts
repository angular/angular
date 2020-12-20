/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {NgDefinitionCollector} from './definition_collector';
import {MissingInjectableTransform} from './transform';
import {UpdateRecorder} from './update_recorder';

/** Entry point for the V9 "missing @Injectable" schematic. */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const failures: string[] = [];

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot add the "@Injectable" decorator to providers ' +
          'which don\'t have that decorator set.');
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      failures.push(...runMissingInjectableMigration(tree, tsconfigPath, basePath));
    }

    if (failures.length) {
      ctx.logger.info('Could not migrate all providers automatically. Please');
      ctx.logger.info('manually migrate the following instances:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    }
  };
}

function runMissingInjectableMigration(
    tree: Tree, tsconfigPath: string, basePath: string): string[] {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const failures: string[] = [];
  const typeChecker = program.getTypeChecker();
  const definitionCollector = new NgDefinitionCollector(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting all modules, directives and components.
  sourceFiles.forEach(sourceFile => definitionCollector.visitNode(sourceFile));

  const {resolvedModules, resolvedDirectives} = definitionCollector;
  const transformer = new MissingInjectableTransform(typeChecker, getUpdateRecorder);
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();

  [...transformer.migrateModules(resolvedModules),
   ...transformer.migrateDirectives(resolvedDirectives),
  ].forEach(({message, node}) => {
    const nodeSourceFile = node.getSourceFile();
    const relativeFilePath = relative(basePath, nodeSourceFile.fileName);
    const {line, character} =
        ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: ${message}`);
  });

  // Record the changes collected in the import manager and transformer.
  transformer.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shift character offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  return failures;

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      addClassDecorator(node: ts.ClassDeclaration, text: string) {
        // New imports should be inserted at the left while decorators should be inserted
        // at the right in order to ensure that imports are inserted before the decorator
        // if the start position of import and decorator is the source file start.
        treeRecorder.insertRight(node.getStart(), `${text}\n`);
      },
      replaceDecorator(decorator: ts.Decorator, newText: string) {
        treeRecorder.remove(decorator.getStart(), decorator.getWidth());
        treeRecorder.insertRight(decorator.getStart(), newText);
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
      updateObjectLiteral(node: ts.ObjectLiteralExpression, newText: string) {
        treeRecorder.remove(node.getStart(), node.getWidth());
        treeRecorder.insertRight(node.getStart(), newText);
      },
      commitUpdate() {
        tree.commitUpdate(treeRecorder);
      }
    };
    updateRecorders.set(sourceFile, recorder);
    return recorder;
  }
}
