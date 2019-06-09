/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {dirname, relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {parseTsconfigFile} from '../../utils/typescript/parse_tsconfig';

import {HelperFunction, getHelper} from './helpers';
import {migrateExpression, replaceImport} from './migration';
import {findRendererImport, findRendererReferences} from './util';


/**
 * Runs a migration over a TypeScript project that changes `Renderer` usages to `Renderer2`.
 */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate Renderer usages to Renderer2.');
    }

    for (const tsconfigPath of allPaths) {
      runRendererToRenderer2Migration(tree, tsconfigPath, basePath);
    }
  };
}

function runRendererToRenderer2Migration(tree: Tree, tsconfigPath: string, basePath: string) {
  const parsed = parseTsconfigFile(tsconfigPath, dirname(tsconfigPath));
  const host = ts.createCompilerHost(parsed.options, true);

  // We need to overwrite the host "readFile" method, as we want the TypeScript
  // program to be based on the file contents in the virtual file tree. Otherwise
  // if we run the migration for multiple tsconfig files which have intersecting
  // source files, it can end up updating query definitions multiple times.
  host.readFile = fileName => {
    const buffer = tree.read(relative(basePath, fileName));
    return buffer ? buffer.toString() : undefined;
  };

  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles = program.getSourceFiles().filter(
      f => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));

  sourceFiles.forEach(sourceFile => {
    const rendererImport = findRendererImport(sourceFile);

    // If there are no imports for the `Renderer`, we can exit early.
    if (!rendererImport) {
      return;
    }

    const {typedNodes, methodCalls} = findRendererReferences(sourceFile, typeChecker);
    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));
    const helpersToAdd = new Set<HelperFunction>();

    // Change the `Renderer` import to `Renderer2`.
    update.remove(rendererImport.getStart(), rendererImport.getWidth());
    update.insertRight(
        rendererImport.getStart(),
        printer.printNode(
            ts.EmitHint.Unspecified, replaceImport(rendererImport, 'Renderer', 'Renderer2'),
            sourceFile));

    // Change the method parameter and property types to `Renderer2`.
    typedNodes.forEach(node => {
      const type = node.type;

      if (type) {
        update.remove(type.getStart(), type.getWidth());
        update.insertRight(type.getStart(), 'Renderer2');
      }
    });

    // Migrate all of the method calls.
    methodCalls.forEach(call => {
      const {node, requiredHelpers} = migrateExpression(call);

      if (node) {
        // If we migrated the node to a new expression, replace only the call expression.
        update.remove(call.getStart(), call.getWidth());
        update.insertRight(
            call.getStart(), printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
      } else if (call.parent && ts.isExpressionStatement(call.parent)) {
        // Otherwise if the call is inside an expression statement, drop the
        // entire statement. This takes care of any trailing semicolons.
        update.remove(call.parent.getStart(), call.parent.getWidth());
      }

      if (requiredHelpers) {
        requiredHelpers.forEach(helperName => helpersToAdd.add(helperName));
      }
    });

    // Some of the methods can't be mapped directly to `Renderer2` and need extra logic around them.
    // The safest way to do so is to declare helper functions similar to the ones emitted by TS
    // which encapsulate the extra "glue" logic. We should only emit these functions once per file.
    helpersToAdd.forEach(helperName => {
      update.insertLeft(
          sourceFile.endOfFileToken.getStart(), getHelper(helperName, sourceFile, printer));
    });

    tree.commitUpdate(update);
  });
}
