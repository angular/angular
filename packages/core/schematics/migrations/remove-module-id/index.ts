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

import {extractAngularClassMetadata} from '../../utils/extract_metadata';
import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {getPropertyNameText} from '../../utils/typescript/property_name';

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the `RemoveModuleId` migration.');
    }

    for (const tsconfigPath of allPaths) {
      runRemoveModuleIdMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runRemoveModuleIdMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const typeChecker = program.getTypeChecker();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    const nodesToRemove = collectUpdatesForFile(typeChecker, sourceFile);
    if (nodesToRemove.length !== 0) {
      const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
      for (const node of nodesToRemove) {
        update.remove(node.getFullStart(), node.getFullWidth());
      }
      tree.commitUpdate(update);
    }
  }
}

function collectUpdatesForFile(typeChecker: ts.TypeChecker, file: ts.SourceFile): ts.Node[] {
  const removeNodes: ts.Node[] = [];
  const attemptMigrateClass = (node: ts.ClassDeclaration) => {
    const metadata = extractAngularClassMetadata(typeChecker, node);
    if (metadata === null) {
      return;
    }

    const syntaxList = metadata.node.getChildren().find(
        ((n): n is ts.SyntaxList => n.kind === ts.SyntaxKind.SyntaxList));
    const tokens = syntaxList?.getChildren();

    if (!tokens) {
      return;
    }

    let removeNextComma = false;
    for (const token of tokens) {
      // Track the comma token if it's requested to be removed.
      if (token.kind === ts.SyntaxKind.CommaToken) {
        if (removeNextComma) {
          removeNodes.push(token);
        }
        removeNextComma = false;
      }

      // Track the `moduleId` property assignment. Note that the AST node does not include a
      // potential followed comma token.
      if (ts.isPropertyAssignment(token) && getPropertyNameText(token.name) === 'moduleId') {
        removeNodes.push(token);
        removeNextComma = true;
      }
    }
  };

  ts.forEachChild(file, function visitNode(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      attemptMigrateClass(node);
    }
    ts.forEachChild(node, visitNode);
  });

  return removeNodes;
}
