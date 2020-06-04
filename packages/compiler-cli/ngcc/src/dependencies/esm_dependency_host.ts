/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {DependencyHostBase} from './dependency_host';

/**
 * Helper functions for computing dependencies.
 */
export class EsmDependencyHost extends DependencyHostBase {
  // By skipping trivia here we don't have to account for it in the processing below
  // It has no relevance to capturing imports.
  private scanner = ts.createScanner(ts.ScriptTarget.Latest, /* skipTrivia */ true);

  protected canSkipFile(fileContents: string): boolean {
    return !hasImportOrReexportStatements(fileContents);
  }

  protected extractImports(file: AbsoluteFsPath, fileContents: string): Set<string> {
    const imports = new Set<string>();
    const templateStack: ts.SyntaxKind[] = [];
    let lastToken: ts.SyntaxKind = ts.SyntaxKind.Unknown;
    let currentToken: ts.SyntaxKind = ts.SyntaxKind.Unknown;

    this.scanner.setText(fileContents);

    while ((currentToken = this.scanner.scan()) !== ts.SyntaxKind.EndOfFileToken) {
      switch (currentToken) {
        case ts.SyntaxKind.TemplateHead:
          templateStack.push(currentToken);
          break;
        case ts.SyntaxKind.OpenBraceToken:
          if (templateStack.length > 0) {
            templateStack.push(currentToken);
          }
          break;
        case ts.SyntaxKind.CloseBraceToken:
          if (templateStack.length > 0) {
            const templateToken = templateStack[templateStack.length - 1];
            if (templateToken === ts.SyntaxKind.TemplateHead) {
              currentToken = this.scanner.reScanTemplateToken(/* isTaggedTemplate */ false);
              if (currentToken === ts.SyntaxKind.TemplateTail) {
                templateStack.pop();
              }
            } else {
              templateStack.pop();
            }
          }
          break;
        case ts.SyntaxKind.SlashToken:
        case ts.SyntaxKind.SlashEqualsToken:
          if (canPrecedeARegex(lastToken)) {
            currentToken = this.scanner.reScanSlashToken();
          }
          break;
        case ts.SyntaxKind.ImportKeyword:
          const importPath = this.extractImportPath();
          if (importPath !== null) {
            imports.add(importPath);
          }
          break;
        case ts.SyntaxKind.ExportKeyword:
          const reexportPath = this.extractReexportPath();
          if (reexportPath !== null) {
            imports.add(reexportPath);
          }
          break;
      }
      lastToken = currentToken;
    }

    // Clear the text from the scanner.
    this.scanner.setText('');

    return imports;
  }


  /**
   * We have found an `import` token so now try to identify the import path.
   *
   * This method will use the current state of `this.scanner` to extract a string literal module
   * specifier. It expects that the current state of the scanner is that an `import` token has just
   * been scanned.
   *
   * The following forms of import are matched:
   *
   * * `import "module-specifier";`
   * * `import("module-specifier")`
   * * `import defaultBinding from "module-specifier";`
   * * `import defaultBinding, * as identifier from "module-specifier";`
   * * `import defaultBinding, {...} from "module-specifier";`
   * * `import * as identifier from "module-specifier";`
   * * `import {...} from "module-specifier";`
   *
   * @returns the import path or null if there is no import or it is not a string literal.
   */
  protected extractImportPath(): string|null {
    // Check for side-effect import
    let sideEffectImportPath = this.tryStringLiteral();
    if (sideEffectImportPath !== null) {
      return sideEffectImportPath;
    }

    let kind: ts.SyntaxKind|null = this.scanner.getToken();

    // Check for dynamic import expression
    if (kind === ts.SyntaxKind.OpenParenToken) {
      return this.tryStringLiteral();
    }

    // Check for defaultBinding
    if (kind === ts.SyntaxKind.Identifier) {
      // Skip default binding
      kind = this.scanner.scan();
      if (kind === ts.SyntaxKind.CommaToken) {
        // Skip comma that indicates additional import bindings
        kind = this.scanner.scan();
      }
    }

    // Check for namespace import clause
    if (kind === ts.SyntaxKind.AsteriskToken) {
      kind = this.skipNamespacedClause();
      if (kind === null) {
        return null;
      }
    }
    // Check for named imports clause
    else if (kind === ts.SyntaxKind.OpenBraceToken) {
      kind = this.skipNamedClause();
    }

    // Expect a `from` clause, if not bail out
    if (kind !== ts.SyntaxKind.FromKeyword) {
      return null;
    }

    return this.tryStringLiteral();
  }

  /**
   * We have found an `export` token so now try to identify a re-export path.
   *
   * This method will use the current state of `this.scanner` to extract a string literal module
   * specifier. It expects that the current state of the scanner is that an `export` token has
   * just been scanned.
   *
   * There are three forms of re-export that are matched:
   *
   * * `export * from '...';
   * * `export * as alias from '...';
   * * `export {...} from '...';
   */
  protected extractReexportPath(): string|null {
    // Skip the `export` keyword
    let token: ts.SyntaxKind|null = this.scanner.scan();
    if (token === ts.SyntaxKind.AsteriskToken) {
      token = this.skipNamespacedClause();
      if (token === null) {
        return null;
      }
    } else if (token === ts.SyntaxKind.OpenBraceToken) {
      token = this.skipNamedClause();
    }
    // Expect a `from` clause, if not bail out
    if (token !== ts.SyntaxKind.FromKeyword) {
      return null;
    }
    return this.tryStringLiteral();
  }

  protected skipNamespacedClause(): ts.SyntaxKind|null {
    // Skip past the `*`
    let token = this.scanner.scan();
    // Check for a `* as identifier` alias clause
    if (token === ts.SyntaxKind.AsKeyword) {
      // Skip past the `as` keyword
      token = this.scanner.scan();
      // Expect an identifier, if not bail out
      if (token !== ts.SyntaxKind.Identifier) {
        return null;
      }
      // Skip past the identifier
      token = this.scanner.scan();
    }
    return token;
  }

  protected skipNamedClause(): ts.SyntaxKind {
    let braceCount = 1;
    // Skip past the initial opening brace `{`
    let token = this.scanner.scan();
    // Search for the matching closing brace `}`
    while (braceCount > 0 && token !== ts.SyntaxKind.EndOfFileToken) {
      if (token === ts.SyntaxKind.OpenBraceToken) {
        braceCount++;
      } else if (token === ts.SyntaxKind.CloseBraceToken) {
        braceCount--;
      }
      token = this.scanner.scan();
    }
    return token;
  }

  protected tryStringLiteral(): string|null {
    return this.scanner.scan() === ts.SyntaxKind.StringLiteral ? this.scanner.getTokenValue() :
                                                                 null;
  }
}

/**
 * Check whether a source file needs to be parsed for imports.
 * This is a performance short-circuit, which saves us from creating
 * a TypeScript AST unnecessarily.
 *
 * @param source The content of the source file to check.
 *
 * @returns false if there are definitely no import or re-export statements
 * in this file, true otherwise.
 */
export function hasImportOrReexportStatements(source: string): boolean {
  return /(?:import|export)[\s\S]+?(["'])(?:(?:\\\1|.)*?)\1/.test(source);
}


/**
 * Check whether the given statement is an import with a string literal module specifier.
 * @param stmt the statement node to check.
 * @returns true if the statement is an import with a string literal module specifier.
 */
export function isStringImportOrReexport(stmt: ts.Statement): stmt is ts.ImportDeclaration&
    {moduleSpecifier: ts.StringLiteral} {
  return ts.isImportDeclaration(stmt) ||
      ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier);
}


function canPrecedeARegex(kind: ts.SyntaxKind): boolean {
  switch (kind) {
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.BigIntLiteral:
    case ts.SyntaxKind.RegularExpressionLiteral:
    case ts.SyntaxKind.ThisKeyword:
    case ts.SyntaxKind.PlusPlusToken:
    case ts.SyntaxKind.MinusMinusToken:
    case ts.SyntaxKind.CloseParenToken:
    case ts.SyntaxKind.CloseBracketToken:
    case ts.SyntaxKind.CloseBraceToken:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return false;
    default:
      return true;
  }
}