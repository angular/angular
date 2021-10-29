/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';

import {PathMatchTypeTransform} from './transform';
import {UpdateRecorder} from './update_recorder';


/** Migration that adds explicit type to `Route`/`Routes` which use `patchMatch` */
export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot perform pathMatch migration.');
    }

    for (const tsconfigPath of allPaths) {
      runMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runMigration(tree: Tree, tsconfigPath: string, basePath: string): void {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();
  const transform = new PathMatchTypeTransform(getUpdateRecorder);

  // Migrate all source files in the project.
  transform.migrate(sourceFiles);
  // Record the changes collected in the import manager.
  transform.recordChanges();

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shifted character offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const printer = ts.createPrinter();
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      updateNode(oldExpr: ts.VariableDeclaration, newExpr: ts.VariableDeclaration) {
        treeRecorder.insertRight(
            oldExpr.name.getEnd(),
            ': ' + printer.printNode(ts.EmitHint.Unspecified, newExpr.type!, sourceFile));
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
