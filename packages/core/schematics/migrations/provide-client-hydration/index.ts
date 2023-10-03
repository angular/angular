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
import {getImportSpecifier} from '../../utils/typescript/imports';

export default function(): Rule {
  return async (tree: Tree) => {
    const {buildPaths, testPaths} = await getProjectTsConfigPaths(tree);
    const basePath = process.cwd();
    const allPaths = [...buildPaths, ...testPaths];

    if (!allPaths.length) {
      throw new SchematicsException(
          'Could not find any tsconfig file. Cannot run the provideClientHydration migration.',
      );
    }

    for (const tsconfigPath of allPaths) {
      runProvideClientHydrationMigration(tree, tsconfigPath, basePath);
    }
  };
}

function runProvideClientHydrationMigration(tree: Tree, tsconfigPath: string, basePath: string) {
  const program = createMigrationProgram(tree, tsconfigPath, basePath);
  const sourceFiles = program.getSourceFiles().filter(
      (sourceFile) => canMigrateFile(basePath, sourceFile, program));

  for (const sourceFile of sourceFiles) {
    migrate(sourceFile, tree, basePath);
  }
}

export const provideClientHydration = 'provideClientHydration';
export const withNoDomReuse = 'withNoDomReuse';
export const withNoHttpTransferCache = 'withNoHttpTransferCache';
export const platformBrowserModule = '@angular/platform-browser';

/**
 * Analyzes a source file and migrates it if needed.
 */
export function migrate(
    sourceFile: ts.SourceFile,
    tree: Tree,
    basePath: string,
) {
  const provideClientHydrationSpec = getImportSpecifier(
      sourceFile,
      platformBrowserModule,
      provideClientHydration,
  );
  const withNoDomReuseSpec = getImportSpecifier(sourceFile, platformBrowserModule, withNoDomReuse);
  const withNoHttpTransferCacheSpec = getImportSpecifier(
      sourceFile,
      platformBrowserModule,
      withNoHttpTransferCache,
  );

  // No `provideClientHydration` found, nothing to migrate
  // No withNoDomReuse nor withNoHttpTransferCache, nothing to migrate
  if (provideClientHydrationSpec === null ||
      (withNoDomReuseSpec === null && withNoHttpTransferCacheSpec === null))
    return;

  const node = findUsage(sourceFile);

  if (node) {
    const relativePath = relative(basePath, sourceFile.fileName);
    const update = tree.beginUpdate(relativePath);

    // Child at 2 is the Syntax list
    const provideClientHydrationArguments = node.getChildAt(2).getChildren();

    const hasDomReuseFalse = provideClientHydrationArguments.some(
        (c) => c.getText() === 'withNoDomReuse()',
    );
    const hasHttpTransferCacheFalse = provideClientHydrationArguments.some(
        (c) => c.getText() === 'withNoHttpTransferCache()',
    );

    if (!hasDomReuseFalse && !hasHttpTransferCacheFalse) {
      // there is no HydrationFeature to remove
      return;
    }

    // removing the whole call express to reinsert it after.
    update.remove(node.getStart(), node.end - node.getStart());

    const functionArguments = [
      ...(hasDomReuseFalse ? ['domReuse: false'] : []),
      ...(hasHttpTransferCacheFalse ? ['httpTransferCache: false'] : []),
    ].join(', ');

    // The call we are inserting back
    const provideCall = `provideClientHydration({${functionArguments}})`;

    update.insertRight(node.getStart(), provideCall);
    tree.commitUpdate(update);
  }
}

function findUsage(sourceFile: ts.SourceFile): ts.CallExpression|null {
  let provideClientCall: ts.CallExpression|null = null;
  const visitNode = (node: ts.Node) => {
    if (ts.isImportSpecifier(node) || provideClientCall) {
      // Skip this node and all of its children; imports are a special case.
      // or if the import was found
      return;
    }
    if (ts.isCallExpression(node) && node.getText().startsWith('provideClient')) {
      provideClientCall = node;
      return;
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return provideClientCall;
}
