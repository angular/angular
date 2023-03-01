/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getImportOfIdentifier, getImportSpecifier, removeSymbolFromNamedImports} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

export const routerLink = 'RouterLink';
export const routerLinkWithHref = 'RouterLinkWithHref';
export const routerModule = '@angular/router';

export interface RewriteEntity {
  startPos: number;
  width: number;
  replacement: string;
}

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker, rewrite: RewriteFn) {
  const routerLinkWithHrefSpec = getImportSpecifier(sourceFile, routerModule, routerLinkWithHref);

  // No `RouterLinkWithHref` found, nothing to migrate, exit early.
  if (routerLinkWithHrefSpec === null) return;

  let rewrites = findUsages(sourceFile, typeChecker);

  // There are some usages of the `RouterLinkWithHref` symbol, which need to
  // be rewritten to `RouterLink` instead. Let's check if the `RouterLink` is
  // already imported.
  const routerLinkSpec = getImportSpecifier(sourceFile, routerModule, routerLink);

  if (routerLinkSpec) {
    // The `RouterLink` symbol is already imported, just drop the `RouterLinkWithHref` one.
    const routerLinkNamedImports =
        routerLinkWithHrefSpec ? closestNode(routerLinkWithHrefSpec, ts.isNamedImports) : null;
    if (routerLinkNamedImports !== null) {
      // Given an original import like this one:
      // ```
      // import {RouterModule, RouterLinkWithHref, RouterLink} from '@angular/router';
      // ```
      // The code below removes the `RouterLinkWithHref` from the named imports section
      // (i.e. `{RouterModule, RouterLinkWithHref, RouterLink}`) and prints an updated
      // version (`{RouterModule, RouterLink}`) to a string, which is used as a
      // replacement.
      const rewrittenNamedImports =
          removeSymbolFromNamedImports(routerLinkNamedImports, routerLinkWithHrefSpec);
      const printer = ts.createPrinter();
      const replacement =
          printer.printNode(ts.EmitHint.Unspecified, rewrittenNamedImports, sourceFile);
      rewrites.push({
        startPos: routerLinkNamedImports.getStart(),
        width: routerLinkNamedImports.getWidth(),
        replacement: replacement,
      });
    }
  } else {
    // The `RouterLink` symbol is not imported, but the `RouterLinkWithHref` is imported,
    // so rewrite `RouterLinkWithHref` -> `RouterLink`.
    rewrites.push({
      startPos: routerLinkWithHrefSpec.getStart(),
      width: routerLinkWithHrefSpec.getWidth(),
      replacement: routerLink,
    });
  }

  // Process rewrites last-to-first (based on start pos) to avoid offset shifts during rewrites.
  rewrites = sortByStartPosDescending(rewrites);
  for (const usage of rewrites) {
    rewrite(usage.startPos, usage.width, usage.replacement);
  }
}

function findUsages(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): RewriteEntity[] {
  const usages: RewriteEntity[] = [];
  const visitNode = (node: ts.Node) => {
    if (ts.isImportSpecifier(node)) {
      // Skip this node and all of its children; imports are a special case.
      return;
    }
    if (ts.isIdentifier(node)) {
      const importIdentifier = getImportOfIdentifier(typeChecker, node);
      if (importIdentifier?.importModule === routerModule &&
          importIdentifier.name === routerLinkWithHref) {
        usages.push({
          startPos: node.getStart(),
          width: node.getWidth(),
          replacement: routerLink,
        });
      }
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return usages;
}

/**
 * Sort all found usages based on their start positions in the source file in descending order (i.e.
 * last usage goes first on the list, etc). This is needed to avoid shifting offsets in the source
 * file (in case there are multiple usages) as we rewrite symbols.
 */
function sortByStartPosDescending(rewrites: RewriteEntity[]): RewriteEntity[] {
  return rewrites.sort((entityA, entityB) => entityB.startPos - entityA.startPos);
}
