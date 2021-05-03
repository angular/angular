/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Rule, SchematicsException, Tree} from '@angular-devkit/schematics';
import {basename, join, relative} from 'path';
import * as ts from 'typescript';

import {getProjectTsConfigPaths} from '../../utils/project_tsconfig_paths';
import {canMigrateFile, createMigrationProgram} from '../../utils/typescript/compiler_host';
import {getImportSpecifier, replaceImport} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

import {findAsyncReferences} from './util';

const MODULE_AUGMENTATION_FILENAME = 'ɵɵASYNC_MIGRATION_CORE_AUGMENTATION.d.ts';

/** Migration that switches from `async` to `waitForAsync`. */
export default function(): Rule {
  return (tree: Tree) => {
    const {buildPaths, testPaths} = getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot migrate async usages to waitForAsync.');
    }

    for (const tsconfigPath of allPaths) {
      runWaitForAsyncMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runWaitForAsyncMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  // Technically we can get away with using `MODULE_AUGMENTATION_FILENAME` as the path, but as of
  // TS 4.2, the module resolution caching seems to be more aggressive which causes the file to be
  // retained between test runs. We can avoid it by using the full path.
  const augmentedFilePath = join(basePath, MODULE_AUGMENTATION_FILENAME);
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath, fileName => {
    // In case the module augmentation file has been requested, we return a source file that
    // augments "@angular/core/testing" to include a named export called "async". This ensures that
    // we can rely on the type checker for this migration after `async` has been removed.
    if (basename(fileName) === MODULE_AUGMENTATION_FILENAME) {
      return `
        import '@angular/core/testing';
        declare module "@angular/core/testing" {
          function async(fn: Function): any;
        }
      `;
    }
    return undefined;
  }, [augmentedFilePath]);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));
  const deprecatedFunction = 'async';
  const newFunction = 'waitForAsync';

  sourceFiles.forEach(sourceFile => {
    const asyncImportSpecifier =
        getImportSpecifier(sourceFile, '@angular/core/testing', deprecatedFunction);
    const asyncImport = asyncImportSpecifier ?
        closestNode<ts.NamedImports>(asyncImportSpecifier, ts.SyntaxKind.NamedImports) :
        null;

    // If there are no imports for `async`, we can exit early.
    if (!asyncImportSpecifier || !asyncImport) {
      return;
    }

    const update = tree.beginUpdate(relative(basePath, sourceFile.fileName));

    // Change the `async` import to `waitForAsync`.
    update.remove(asyncImport.getStart(), asyncImport.getWidth());
    update.insertRight(
        asyncImport.getStart(),
        printer.printNode(
            ts.EmitHint.Unspecified, replaceImport(asyncImport, deprecatedFunction, newFunction),
            sourceFile));

    // Change `async` calls to `waitForAsync`.
    findAsyncReferences(sourceFile, typeChecker, asyncImportSpecifier).forEach(node => {
      update.remove(node.getStart(), node.getWidth());
      update.insertRight(node.getStart(), newFunction);
    });

    tree.commitUpdate(update);
  });
}
