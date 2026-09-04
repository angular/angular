/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ts from 'typescript';
import * as vscode from 'vscode';

const ANGULAR_PROPERTY_ASSIGNMENTS = new Set([
  'template',
  'templateUrl',
  'styles',
  'styleUrls',
  'styleUrl',
  'host',
]);

const ANGULAR_HOST_BINDING_DECORATORS = new Set(['HostBinding', 'HostListener']);

/**
 * Determines if the position is inside a decorator
 * property that supports language service features.
 */
export function isNotTypescriptOrSupportedDecoratorField(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  if (document.languageId !== 'typescript') {
    return true;
  }
  return isInsideAngularStringLiteral(
    document.getText(),
    document.offsetAt(position),
    ANGULAR_PROPERTY_ASSIGNMENTS,
    ANGULAR_HOST_BINDING_DECORATORS,
  );
}

/**
 * Determines if a range is eligible for Angular language-service requests.
 *
 * For TypeScript files this is true when either range endpoint is within a
 * supported decorator field. Non-TypeScript documents are always eligible.
 */
export function isNotTypescriptOrSupportedDecoratorRange(
  document: vscode.TextDocument,
  range: vscode.Range,
): boolean {
  if (document.languageId !== 'typescript') {
    return true;
  }
  return (
    isNotTypescriptOrSupportedDecoratorField(document, range.start) ||
    isNotTypescriptOrSupportedDecoratorField(document, range.end)
  );
}

/**
 * Determines if the position is inside a string literal. Returns `true` if the document language is
 * not TypeScript.
 */
export function isInsideStringLiteral(
  document: vscode.TextDocument,
  position: vscode.Position,
): boolean {
  if (document.languageId !== 'typescript') {
    return true;
  }
  const offset = document.offsetAt(position);
  const {scanner, scan} = createTemplateAwareScanner(document.getText());

  let token: ts.SyntaxKind = scan();
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getStartPos() < offset) {
    if (isStringToken(token) && isCursorInToken(scanner, offset)) {
      return true;
    }
    token = scan();
  }
  return false;
}

/**
 * Basic scanner to determine if we're inside a string of a property with one of the given names,
 * or inside a string argument of a decorator with one of the given names.
 *
 * This scanner is not currently robust or perfect but provides us with an accurate answer _most_ of
 * the time.
 *
 * False positives are OK here. Though this will give some false positives for determining if a
 * position is within an Angular context, i.e. an object like `{template: ''}` that is not inside an
 * `@Component` or `{styleUrls: [someFunction('stringL¦iteral')]}`, the @angular/language-service
 * will always give us the correct answer. This helper gives us a quick win for optimizing the
 * number of requests we send to the server.
 *
 * TODO(atscott): tagged templates don't work: #1872 /
 * https://github.com/Microsoft/TypeScript/issues/20055
 */
function isInsideAngularStringLiteral(
  documentText: string,
  offset: number,
  propertyAssignmentNames: Set<string>,
  decoratorNames: Set<string>,
): boolean {
  const {scanner, scan} = createTemplateAwareScanner(documentText);

  let token: ts.SyntaxKind = scan();
  let lastToken: ts.SyntaxKind | undefined;
  let lastTokenText: string | undefined;
  let secondLastToken: ts.SyntaxKind | undefined;
  let unclosedBraces = 0;
  let unclosedBrackets = 0;
  let unclosedParens = 0;
  let propertyAssignmentContext = false;
  // Nesting depth at which the current property assignment context was entered. The context ends
  // at the first terminator found at that same depth, i.e. the one that ends the assignment's
  // initializer rather than one nested inside of it.
  let contextBraces = 0;
  let contextBrackets = 0;
  let decoratorContext = false;
  // Parenthesis depth at which the current decorator context was entered. The context ends at the
  // closing parenthesis of the decorator call.
  let contextParens = 0;
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getStartPos() < offset) {
    if (
      lastToken === ts.SyntaxKind.Identifier &&
      lastTokenText !== undefined &&
      token === ts.SyntaxKind.ColonToken &&
      propertyAssignmentNames.has(lastTokenText)
    ) {
      propertyAssignmentContext = true;
      contextBraces = unclosedBraces;
      contextBrackets = unclosedBrackets;
      token = scan();
      continue;
    }
    if (
      propertyAssignmentContext &&
      unclosedBraces === contextBraces &&
      unclosedBrackets === contextBrackets &&
      isPropertyAssignmentTerminator(token)
    ) {
      propertyAssignmentContext = false;
    }

    if (
      secondLastToken === ts.SyntaxKind.AtToken &&
      lastToken === ts.SyntaxKind.Identifier &&
      lastTokenText !== undefined &&
      token === ts.SyntaxKind.OpenParenToken &&
      decoratorNames.has(lastTokenText)
    ) {
      decoratorContext = true;
      contextParens = unclosedParens;
    }
    if (
      decoratorContext &&
      token === ts.SyntaxKind.CloseParenToken &&
      unclosedParens === contextParens + 1
    ) {
      decoratorContext = false;
    }

    if (token === ts.SyntaxKind.OpenBracketToken) {
      unclosedBrackets++;
    } else if (token === ts.SyntaxKind.OpenBraceToken) {
      unclosedBraces++;
    } else if (token === ts.SyntaxKind.OpenParenToken) {
      unclosedParens++;
    } else if (token === ts.SyntaxKind.CloseBracketToken) {
      unclosedBrackets--;
    } else if (token === ts.SyntaxKind.CloseBraceToken) {
      unclosedBraces--;
    } else if (token === ts.SyntaxKind.CloseParenToken) {
      unclosedParens--;
    }

    if (
      (propertyAssignmentContext || decoratorContext) &&
      isStringToken(token) &&
      isCursorInToken(scanner, offset)
    ) {
      return true;
    }

    lastTokenText = scanner.getTokenText();
    secondLastToken = lastToken;
    lastToken = token;
    token = scan();
  }

  return false;
}

function isPropertyAssignmentTerminator(token: ts.SyntaxKind) {
  return (
    token === ts.SyntaxKind.EndOfFileToken ||
    token === ts.SyntaxKind.CommaToken ||
    token === ts.SyntaxKind.SemicolonToken ||
    token === ts.SyntaxKind.CloseBraceToken
  );
}

function isStringToken(token: ts.SyntaxKind): boolean {
  return (
    token === ts.SyntaxKind.StringLiteral || token === ts.SyntaxKind.NoSubstitutionTemplateLiteral
  );
}

function isCursorInToken(scanner: ts.Scanner, offset: number): boolean {
  return (
    scanner.getStartPos() <= offset &&
    scanner.getStartPos() + scanner.getTokenText().length >= offset
  );
}

/**
 * Creates a `ts.Scanner` for the given text along with a `scan` function that, unlike
 * `ts.Scanner#scan`, handles template literals with substitutions correctly.
 *
 * The scanner has no notion of template substitutions on its own: it reports the `}` closing a
 * `${...}` substitution as a plain `CloseBraceToken` and then treats the remainder of the template
 * literal as the beginning of a new one, mis-scanning everything that follows it (see #65494). Just
 * like the TypeScript parser, the returned `scan` function re-scans such braces as template
 * continuations (`TemplateMiddle`/`TemplateTail`) instead.
 */
function createTemplateAwareScanner(text: string): {
  scanner: ts.Scanner;
  scan: () => ts.SyntaxKind;
} {
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, true /* skipTrivia */);
  scanner.setText(text);

  // Brace depth at which each currently open template substitution started, innermost last.
  const substitutionDepths: number[] = [];
  let braceDepth = 0;

  const scan = (): ts.SyntaxKind => {
    let token = scanner.scan();
    if (token === ts.SyntaxKind.OpenBraceToken) {
      braceDepth++;
    } else if (token === ts.SyntaxKind.CloseBraceToken) {
      if (
        substitutionDepths.length > 0 &&
        braceDepth === substitutionDepths[substitutionDepths.length - 1]
      ) {
        // This brace closes a template substitution rather than a block or object literal.
        substitutionDepths.pop();
        token = scanner.reScanTemplateToken(false /* isTaggedTemplate */);
      } else {
        braceDepth--;
      }
    }
    if (token === ts.SyntaxKind.TemplateHead || token === ts.SyntaxKind.TemplateMiddle) {
      substitutionDepths.push(braceDepth);
    }
    return token;
  };

  return {scanner, scan};
}
