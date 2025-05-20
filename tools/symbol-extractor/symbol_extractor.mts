/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="jasmine" />

import ts from 'typescript';

export class SymbolExtractor {
  public actual: string[];

  static parse(path: string, contents: string): string[] {
    const symbols: string[] = [];
    const source: ts.SourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true);
    let fnRecurseDepth = 0;
    function visitor(child: ts.Node) {
      // Left for easier debugging.
      // console.log('>>>', ts.SyntaxKind[child.kind]);
      switch (child.kind) {
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.FunctionExpression:
          fnRecurseDepth++;
          // Handles IIFE function/arrow expressions.
          if (fnRecurseDepth <= 1) {
            ts.forEachChild(child, visitor);
          }
          fnRecurseDepth--;
          break;
        case ts.SyntaxKind.SourceFile:
        case ts.SyntaxKind.VariableStatement:
        case ts.SyntaxKind.VariableDeclarationList:
        case ts.SyntaxKind.ExpressionStatement:
        case ts.SyntaxKind.CallExpression:
        case ts.SyntaxKind.ParenthesizedExpression:
        case ts.SyntaxKind.Block:
        case ts.SyntaxKind.PrefixUnaryExpression:
          ts.forEachChild(child, visitor);
          break;
        case ts.SyntaxKind.VariableDeclaration:
          const varDecl = child as ts.VariableDeclaration;
          // Terser optimizes variable declarations with `undefined` as initializer
          // by omitting the initializer completely. We capture such declarations as well.
          // https://github.com/terser/terser/blob/86ea74d5c12ae51b64468/CHANGELOG.md#v540.
          if (fnRecurseDepth !== 0) {
            if (!isEsmInitFunction(varDecl)) {
              symbols.push(stripSuffix(varDecl.name.getText()));
            }
          }
          break;
        case ts.SyntaxKind.FunctionDeclaration:
          const funcDecl = child as ts.FunctionDeclaration;
          funcDecl.name && symbols.push(stripSuffix(funcDecl.name.getText()));
          break;
        case ts.SyntaxKind.ClassDeclaration:
          const classDecl = child as ts.ClassDeclaration;
          classDecl.name && symbols.push(stripSuffix(classDecl.name.getText()));
          break;
        default:
        // Left for easier debugging.
        // console.log('###', ts.SyntaxKind[child.kind], child.getText());
      }
    }
    visitor(source);
    symbols.sort();
    return symbols;
  }

  static diff(actual: string[], expected: string | string[]): {[name: string]: number} {
    if (typeof expected == 'string') {
      expected = JSON.parse(expected) as string[];
    }
    const diff: {[name: string]: number} = {};

    // All symbols in the golden file start out with a count corresponding to the number of symbols
    // with that name. Once they are matched with symbols in the actual output, the count should
    // even out to 0.
    expected.forEach((symbolName) => {
      diff[symbolName] = (diff[symbolName] || 0) + 1;
    });

    actual.forEach((s) => {
      if (diff[s] === 1) {
        delete diff[s];
      } else {
        diff[s] = (diff[s] || 0) - 1;
      }
    });
    return diff;
  }

  constructor(
    private path: string,
    private contents: string,
  ) {
    this.actual = SymbolExtractor.parse(path, contents);
  }

  expect(expectedSymbols: string[]) {
    expect(SymbolExtractor.diff(this.actual, expectedSymbols)).toEqual({});
  }

  compareAndPrintError(expected: string | string[]): boolean {
    let passed = true;
    const diff = SymbolExtractor.diff(this.actual, expected);
    Object.keys(diff).forEach((key) => {
      if (passed) {
        console.error(`Expected symbols in '${this.path}' did not match gold file.`);
        passed = false;
      }
      const missingOrExtra = diff[key] > 0 ? 'extra' : 'missing';
      const count = Math.abs(diff[key]);
      console.error(`   Symbol: ${key} => ${count} ${missingOrExtra} in golden file.`);
    });

    return passed;
  }
}

function stripSuffix(text: string): string {
  const index = text.lastIndexOf('$');
  return index > -1 ? text.substring(0, index) : text;
}

/**
 * This function detects a specific pattern that represents ESM modules
 * in the generated code. Those symbols are not really needed for the purposes
 * of symbol checking, since they only represent a module graph and all
 * nested symbols are being captured by the logic already. The pattern that
 * this function detects looks like this:
 * ```
 * var init_testability = __esm({
 *   "packages/core/src/testability/testability.mjs"() {
 *     // ...
 *   }
 * });
 * ```
 */
function isEsmInitFunction(varDecl: ts.VariableDeclaration) {
  return (
    varDecl.name.getText().startsWith('init_') &&
    varDecl.initializer &&
    ts.isCallExpression(varDecl.initializer) &&
    (varDecl.initializer.expression as ts.Identifier).escapedText === '___esm'
  );
}
