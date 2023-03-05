/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

export interface RewriteEntity {
  startPos: number;
  width: number;
  replacement: string;
}

export type RewriteFn = (startPos: number, origLength: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  let rewrites: RewriteEntity[] = [];
  const usages = getUsages(sourceFile);
  for (const {start, width} of usages) {
    rewrites.push({
      startPos: start,
      width: width,
      replacement: `ɵDefaultIterableDiffer as DefaultIterableDiffer`,
    });
  }

  for (const rewrite of rewrites) {
    rewriteFn(rewrite.startPos, rewrite.width, rewrite.replacement);
  }
}

function getUsages(sourceFile: ts.SourceFile): {start: number; width: number}[] {
  const usages: {start: number; width: number}[] = [];
  const visitNode = (node: ts.Node) => {
    if (ts.isImportDeclaration(node)) {
      let clauses = node.importClause!;
      let namedImport = clauses.getChildAt(0);

      // module name is returned with quotes
      const isCore = node.moduleSpecifier.getText().replace(/['"]/g, '') === '@angular/core';
      if (!isCore) return;
      if (!ts.isNamedImports(namedImport)) return;
      for (const elt of namedImport.elements) {
        if (elt.getText() == 'DefaultIterableDiffer') {
          usages.push({width: elt.getWidth(), start: elt.getStart()});
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return usages;
}
