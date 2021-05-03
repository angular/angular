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

import {getHelper, HelperFunction} from './helpers';
import {migrateExpression} from './migration';
import {findRendererReferences} from './util';

const MODULE_AUGMENTATION_FILENAME = 'ɵɵRENDERER_MIGRATION_CORE_AUGMENTATION.d.ts';

/**
 * Migration that switches from `Renderer` to `Renderer2`. More information on how it works:
 * https://hackmd.angular.io/UTzUZTnPRA-cSa_4mHyfYw
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
  // Technically we can get away with using `MODULE_AUGMENTATION_FILENAME` as the path, but as of
  // TS 4.2, the module resolution caching seems to be more aggressive which causes the file to be
  // retained between test runs. We can avoid it by using the full path.
  const augmentedFilePath = join(basePath, MODULE_AUGMENTATION_FILENAME);
  const {program} = createMigrationProgram(tree, tsconfigPath, basePath, fileName => {
    // In case the module augmentation file has been requested, we return a source file that
    // augments "@angular/core" to include a named export called "Renderer". This ensures that
    // we can rely on the type checker for this migration in v9 where "Renderer" has been removed.
    if (basename(fileName) === MODULE_AUGMENTATION_FILENAME) {
      return `
        import '@angular/core';
        declare module "@angular/core" {
          class Renderer {}
        }
      `;
    }
    return undefined;
  }, [augmentedFilePath]);
  const typeChecker = program.getTypeChecker();
  const printer = ts.createPrinter();
  const sourceFiles =
      program.getSourceFiles().filter(sourceFile => canMigrateFile(basePath, sourceFile, program));

  sourceFiles.forEach(sourceFile => {
    const rendererImportSpecifier = getImportSpecifier(sourceFile, '@angular/core', 'Renderer');
    const rendererImport = rendererImportSpecifier ?
        closestNode<ts.NamedImports>(rendererImportSpecifier, ts.SyntaxKind.NamedImports) :
        null;

    // If there are no imports for the `Renderer`, we can exit early.
    if (!rendererImportSpecifier || !rendererImport) {
      return;
    }

    const {typedNodes, methodCalls, forwardRefs} =
        findRendererReferences(sourceFile, typeChecker, rendererImportSpecifier);
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

    // Change all identifiers inside `forwardRef` referring to the `Renderer`.
    forwardRefs.forEach(identifier => {
      update.remove(identifier.getStart(), identifier.getWidth());
      update.insertRight(identifier.getStart(), 'Renderer2');
    });

    // Migrate all of the method calls.
    methodCalls.forEach(call => {
      const {node, requiredHelpers} = migrateExpression(call, typeChecker);

      if (node) {
        // If we migrated the node to a new expression, replace only the call expression.
        update.remove(call.getStart(), call.getWidth());
        update.insertRight(
            call.getStart(), printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
      } else if (call.parent && ts.isExpressionStatement(call.parent)) {
        // Otherwise if the call is inside an expression statement, drop the entire statement.
        // This takes care of any trailing semicolons. We only need to drop nodes for cases like
        // `setBindingDebugInfo` which have been noop for a while so they can be removed safely.
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
