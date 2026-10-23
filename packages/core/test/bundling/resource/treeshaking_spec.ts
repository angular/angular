/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

describe('resource tree shaking', () => {
  it('should not read or store debug names in production', () => {
    const content = fs.readFileSync(path.resolve('./bundles/main.js'), 'utf-8');
    const source = ts.createSourceFile('main.js', content, ts.ScriptTarget.Latest, true);
    const implementations = new Map<string, ts.Node>();

    ts.forEachChild(source, (node) => {
      if (ts.isFunctionDeclaration(node) && node.name) {
        implementations.set(node.name.text, node);
      } else if (ts.isVariableStatement(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            implementations.set(declaration.name.text, declaration);
          }
        }
      }
    });

    for (const name of ['resource', 'makeHttpResourceFn', 'ResourceImpl']) {
      const implementation = implementations.get(name);
      if (!implementation) {
        throw new Error(`Missing resource implementation: ${name}`);
      }

      const debugNameAccesses: string[] = [];
      const visit = (node: ts.Node): void => {
        if (
          ((ts.isPropertyAccessExpression(node) || ts.isPropertyDeclaration(node)) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'debugName') ||
          (ts.isElementAccessExpression(node) &&
            ts.isStringLiteral(node.argumentExpression) &&
            node.argumentExpression.text === 'debugName')
        ) {
          debugNameAccesses.push(node.getText(source));
        }
        ts.forEachChild(node, visit);
      };
      visit(implementation);

      expect(debugNameAccesses).withContext(name).toEqual([]);
    }

    expect(content).not.toContain('createDebugNameObject');
  });
});
