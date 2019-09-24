/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {createMigrationCompilerHost} from '../../utils/typescript/compiler_host';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';

import {identifyDynamicQueryNodes, removeOptionsParameter, removeStaticFlag} from './util';



/**
 * Runs the dynamic queries migration for all TypeScript projects in the current CLI workspace.
 */
export default function(): Rule {
  return (tree: Tree, ctx: SchematicContext) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    ctx.logger.info('------ Dynamic queries migration ------');

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate dynamic queries.');
    }

    for (const tsconfigPath of allPaths) {
      runDynamicQueryMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runDynamicQueryMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = createMigrationCompilerHost(tree, parsed.options, basePath);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));
  const printer = ts.createPrinter();

  sourceFiles.forEach(sourceFile => {
    const result = identifyDynamicQueryNodes(typeChecker, sourceFile);

    if (result.removeProperty.length || result.removeParameter.length) {
      const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

      result.removeProperty.forEach(node => {
        update.remove(node.getStart(), node.getWidth());
        update.insertRight(
            node.getStart(),
            printer.printNode(ts.EmitHint.Unspecified, removeStaticFlag(node), sourceFile));
      });

      result.removeParameter.forEach(node => {
        update.remove(node.getStart(), node.getWidth());
        update.insertRight(
            node.getStart(),
            printer.printNode(ts.EmitHint.Unspecified, removeOptionsParameter(node), sourceFile));
      });

      tree.commitUpdate(update);
    }
  });
}
