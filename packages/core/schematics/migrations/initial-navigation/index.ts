/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {relative} from 'path';
import * as ts from 'typescript';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {InitialNavigationCollector} from './collector';
import {InitialNavigationTransform} from './transform';
import {UpdateRecorder} from './update_recorder';

/** Entry point for the v10 "initialNavigation RouterModule options" schematic. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();

    if (!buildPaths.length && !testPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot update the "initialNavigation" option for RouterModule');
    }

    for (const tsconfigPath of [...buildPaths, ...testPaths]) {
      runInitialNavigationMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runInitialNavigationMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const initialNavigationCollector = new InitialNavigationCollector(typeChecker);
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  // Analyze source files by detecting all modules.
  sourceFiles.forEach(sourceFile => initialNavigationCollector.visitNode(sourceFile));

  const {assignments} = initialNavigationCollector;
  const transformer = new InitialNavigationTransform(getUpdateRecorder);
  const updateRecorders = new Map<ts.SourceFile, UpdateRecorder>();
  transformer.migrateInitialNavigationAssignments(Array.from(assignments));

  // Walk through each update recorder and commit the update. We need to commit the
  // updates in batches per source file as there can be only one recorder per source
  // file in order to avoid shift character offsets.
  updateRecorders.forEach(recorder => recorder.commitUpdate());

  /** Gets the update recorder for the specified source file. */
  function getUpdateRecorder(sourceFile: ts.SourceFile): UpdateRecorder {
    if (updateRecorders.has(sourceFile)) {
      return updateRecorders.get(sourceFile)!;
    }
    const treeRecorder = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const recorder: UpdateRecorder = {
      updateNode(node: ts.Node, newText: string) {
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
