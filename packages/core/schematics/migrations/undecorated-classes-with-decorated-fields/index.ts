/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree,} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {UndecoratedClassesWithDecoratedFieldsTransform} from './transform';
import {UpdateRecorder} from './update_recorder';

/**
 * Migration that adds an Angular decorator to classes that have Angular field decorators.
 * https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
 */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];
    const failures: string[] = [];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot add an Angular decorator to undecorated classes.');
    }

    for (const tsconfigPath of allPaths) {
      failures.push(...runUndecoratedClassesMigration(tree, tsconfigPath, basePath));
    }

    if (failures.length) {
      ctx.logger.info('Could not migrate all undecorated classes that use Angular features.');
      ctx.logger.info('Please manually fix the following failures:');
      failures.forEach(message => ctx.logger.warn(`⮑   ${message}`));
    }
  };
}

function runUndecoratedClassesMigration(
    tree: Tree, tsconfigPath: string, basePath: string): string[] {
  const failures: string[] = [];
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();
  const transform =
      new UndecoratedClassesWithDecoratedFieldsTransform(typeChecker, getUpdateRecorder);

  // Migrate all source files in the project.
  transform.migrate(sourceFiles).forEach(({node, message}) => {
    const nodeSourceFile = node.getSourceFile();
    const relativeFilePath = relative(basePath, nodeSourceFile.fileName);
    const {line, character} =
        ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    failures.push(`${relativeFilePath}@${line + 1}:${character + 1}: ${message}`);
  });

  // Record the changes collected in the import manager.
  transform.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shifted character offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  return failures;

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      addClassTodo(node: ts.ClassDeclaration, message: string) {
        treeRecorder.insertRight(node.getStart(), `// TODO: ${message}\n`);
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
