/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as ts from 'typescript';


export interface Symbol { name: string; }

export class SymbolExtractor {
  public actual: Symbol[];

  static symbolSort(a: Symbol, b: Symbol): number {
    return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
  }

  static parse(path: string, contents: string): Symbol[] {
    const symbols: Symbol[] = [];
    const source: ts.SourceFile = ts.createSourceFile(path, contents, ts.ScriptTarget.Latest, true);
    let fnRecurseDepth = 0;
    function visitor(child: ts.Node) {
      // Left for easier debugging.
      // console.log('>>>', ts.SyntaxKind[child.kind]);
      switch (child.kind) {
        case ts.SyntaxKind.FunctionExpression:
          fnRecurseDepth++;
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
          if (varDecl.initializer && fnRecurseDepth !== 0) {
            symbols.push({name: varDecl.name.getText()});
          }
          if (fnRecurseDepth == 0 && isRollupExportSymbol(varDecl)) {
            ts.forEachChild(child, visitor);
          }
          break;
        case ts.SyntaxKind.FunctionDeclaration:
          const funcDecl = child as ts.FunctionDeclaration;
          funcDecl.name && symbols.push({name: funcDecl.name.getText()});
          break;
        default:
          // Left for easier debugging.
          // console.log('###', ts.SyntaxKind[child.kind], child.getText());
      }
    }
    visitor(source);
    symbols.sort(SymbolExtractor.symbolSort);
    return symbols;
  }

  static diff(actual: Symbol[], expected: string|((Symbol | string)[])): {[name: string]: string} {
    if (typeof expected == 'string') {
      expected = JSON.parse(expected);
    }
    const diff: {[name: string]: ('missing' | 'extra')} = {};
    (expected as(Symbol | string)[]).forEach((nameOrSymbol) => {
      diff[typeof nameOrSymbol == 'string' ? nameOrSymbol : nameOrSymbol.name] = 'missing';
    });

    actual.forEach((s) => {
      if (diff[s.name] === 'missing') {
        delete diff[s.name];
      } else {
        diff[s.name] = 'extra';
      }
    });
    return diff;
  }

  constructor(private path: string, private contents: string) {
    this.actual = SymbolExtractor.parse(path, contents);
  }

  expect(expectedSymbols: (string|Symbol)[]) {
    expect(SymbolExtractor.diff(this.actual, expectedSymbols)).toEqual({});
  }

  compareAndPrintError(goldenFilePath: string, expected: string|((Symbol | string)[])): boolean {
    let passed = true;
    const diff = SymbolExtractor.diff(this.actual, expected);
    Object.keys(diff).forEach((key) => {
      if (passed) {
        console.error(`Expected symbols in '${this.path}' did not match gold file.`);
        passed = false;
      }
      console.error(`   Symbol: ${key} => ${diff[key]}`);
    });

    return passed;
  }
}

function toSymbol(v: string | Symbol): Symbol {
  return typeof v == 'string' ? {'name': v} : v as Symbol;
}

function toName(symbol: Symbol): string {
  return symbol.name;
}

/**
 * Detects if VariableDeclarationList is format `var ..., bundle = function(){}()`;
 *
 * Rollup produces this format when it wants to export symbols from a bundle.
 * @param child
 */
function isRollupExportSymbol(decl: ts.VariableDeclaration): boolean {
  return !!(decl.initializer && decl.initializer.kind == ts.SyntaxKind.CallExpression) &&
      ts.isIdentifier(decl.name) && decl.name.text === 'bundle';
}