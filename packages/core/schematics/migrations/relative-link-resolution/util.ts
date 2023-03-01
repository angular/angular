/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

const relativeLinkResolution = 'relativeLinkResolution';
const knownConfigValues = new Set([`'legacy'`, `'corrected'`]);

export interface RewriteEntity {
  startPos: number;
  width: number;
  replacement: string;
}

export interface MigratableNode {
  objectLiteral: ts.ObjectLiteralExpression;
  property: ts.ObjectLiteralElementLike;
}

export type RewriteFn = (startPos: number, origLength: number, text: string) => void;

export function migrateFile(sourceFile: ts.SourceFile, rewriteFn: RewriteFn) {
  let rewrites: RewriteEntity[] = [];
  const usages = getUsages(sourceFile);
  for (const {objectLiteral, property} of usages) {
    const replacementNode = ts.factory.updateObjectLiteralExpression(
        objectLiteral, objectLiteral.properties.filter(prop => prop !== property));
    const printer = ts.createPrinter();
    const replacementText = printer.printNode(ts.EmitHint.Unspecified, replacementNode, sourceFile);
    rewrites.push({
      startPos: objectLiteral.getStart(),
      width: objectLiteral.getWidth(),
      replacement: replacementText,
    });
  }

  // Process rewrites last-to-first (based on start pos) to avoid offset shifts during rewrites.
  rewrites = sortByStartPosDescending(rewrites);
  for (const rewrite of rewrites) {
    rewriteFn(rewrite.startPos, rewrite.width, rewrite.replacement);
  }
}

function getUsages(sourceFile: ts.SourceFile): MigratableNode[] {
  const usages: MigratableNode[] = [];
  const visitNode = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      // Look for patterns like the following:
      // ```
      // { ... relativeLinkResolution: 'legacy', ... }
      // ```
      // or:
      // ```
      // { ... relativeLinkResolution: 'corrected', ... }
      // ```
      // If the value is unknown (i.e. not 'legacy' or 'corrected'),
      // do not attempt to rewrite (this might be an application-specific
      // configuration, not a part of Router).
      const property = node.properties.find(
          prop => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) &&
              prop.name.text === relativeLinkResolution &&
              knownConfigValues.has(prop.initializer.getText()));
      if (property) {
        usages.push({objectLiteral: node, property});
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
