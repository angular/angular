/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ts from 'typescript';
import type * as vscode from 'vscode';

const ANGULAR_PROPERTY_ASSIGNMENTS = new Set([
  'template',
  'templateUrl',
  'styles',
  'styleUrls',
  'styleUrl',
  'host',
]);

export type AngularDecoratorField =
  | 'template'
  | 'templateUrl'
  | 'styles'
  | 'styleUrls'
  | 'styleUrl'
  | 'host';

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
  return getSupportedDecoratorFieldAtPosition(document, position) !== null;
}

export function getSupportedDecoratorFieldAtPosition(
  document: vscode.TextDocument,
  position: vscode.Position,
): AngularDecoratorField | null {
  if (document.languageId !== 'typescript') {
    return null;
  }
  return getPropertyAssignmentNameAtStringOffset(
    document.getText(),
    document.offsetAt(position),
    ANGULAR_PROPERTY_ASSIGNMENTS,
  );
}

/**
 * Builds virtual HTML content for inline `template` strings by preserving text offsets.
 */
export function getInlineTemplateVirtualContent(documentText: string): string {
  const sf = ts.createSourceFile('temp.ts', documentText, ts.ScriptTarget.ESNext, true);
  return getVirtualContent(sf, isInlineTemplateNode);
}

/**
 * Builds virtual style content for inline `styles` strings by preserving text offsets.
 */
export function getInlineStylesVirtualContent(documentText: string): string {
  const sf = ts.createSourceFile('temp.ts', documentText, ts.ScriptTarget.ESNext, true);
  return getVirtualContent(sf, isInlineStyleNode);
}

/**
 * Builds virtual style contents per inline `styles` entry by preserving text offsets.
 * Each returned entry contains exactly one inline style block while all other text is whitespace.
 */
export function getInlineStylesVirtualContents(documentText: string): string[] {
  const sf = ts.createSourceFile('temp.ts', documentText, ts.ScriptTarget.ESNext, true);
  const styleNodes = findAllMatchingNodes(sf, isInlineStyleNode).sort(
    (a, b) => a.getStart(sf) - b.getStart(sf),
  );
  return styleNodes.map((node) => getVirtualContentFromNodes(sf, [node]));
}

/**
 * Builds virtual style content for the inline style block containing the given offset.
 * Returns null when the offset is not inside any inline `styles` string.
 */
export function getInlineStylesVirtualContentAtOffset(
  documentText: string,
  offset: number,
): string | null {
  const result = getInlineStylesVirtualContentWithKeyAtOffset(documentText, offset);
  return result?.content ?? null;
}

export function getInlineStylesVirtualContentWithKeyAtOffset(
  documentText: string,
  offset: number,
): {key: string; content: string} | null {
  const sf = ts.createSourceFile('temp.ts', documentText, ts.ScriptTarget.ESNext, true);
  const styleNodes = findAllMatchingNodes(sf, isInlineStyleNode).sort(
    (a, b) => a.getStart(sf) - b.getStart(sf),
  );
  const containingNode = styleNodes.find(
    (node) => node.getStart(sf) <= offset && offset < node.getEnd(),
  );
  if (!containingNode) {
    return null;
  }
  return {
    key: `${containingNode.getStart(sf)}:${containingNode.getEnd()}`,
    content: getVirtualContentFromNodes(sf, [containingNode]),
  };
}

/**
 * Returns the inline style language guess for virtual style documents.
 *
 * We intentionally default to SCSS to mirror the current grammar injection
 * (`inline-styles.json` -> `source.css.scss`).
 */
export function getInlineStyleLanguage(_fileName: string, _workspaceRoot: string | null): 'scss' {
  return 'scss';
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
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, true /* skipTrivia */);
  scanner.setText(document.getText());

  let token: ts.SyntaxKind = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getTokenStart() < offset) {
    const isStringToken =
      token === ts.SyntaxKind.StringLiteral ||
      token === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    const isCursorInToken = scanner.getTokenStart() <= offset && scanner.getTokenEnd() > offset;
    if (isCursorInToken && isStringToken) {
      return true;
    }
    token = scanner.scan();
  }
  return false;
}

/**
 * Scanner-based fast-path to detect whether an offset is inside a supported
 * decorator property string/template literal.
 *
 * This is intentionally heuristic and may produce false positives for objects
 * that are not Angular component metadata. The language server remains the
 * source of truth; this helper only reduces unnecessary requests.
 */
function getPropertyAssignmentNameAtStringOffset(
  documentText: string,
  offset: number,
  propertyAssignmentNames: Set<string>,
): AngularDecoratorField | null {
  const scanner = ts.createScanner(ts.ScriptTarget.ESNext, true /* skipTrivia */);
  scanner.setText(documentText);

  let token: ts.SyntaxKind = scanner.scan();
  let lastToken: ts.SyntaxKind | undefined;
  let lastTokenText: string | undefined;
  let unclosedBraces = 0;
  let unclosedBrackets = 0;
  let propertyAssignmentContext: AngularDecoratorField | null = null;
  while (token !== ts.SyntaxKind.EndOfFileToken && scanner.getTokenStart() < offset) {
    if (
      lastToken === ts.SyntaxKind.Identifier &&
      lastTokenText !== undefined &&
      token === ts.SyntaxKind.ColonToken &&
      propertyAssignmentNames.has(lastTokenText)
    ) {
      propertyAssignmentContext = lastTokenText as AngularDecoratorField;
      token = scanner.scan();
      continue;
    }
    if (unclosedBraces === 0 && unclosedBrackets === 0 && isPropertyAssignmentTerminator(token)) {
      propertyAssignmentContext = null;
    }

    if (token === ts.SyntaxKind.OpenBracketToken) {
      unclosedBrackets++;
    } else if (token === ts.SyntaxKind.OpenBraceToken) {
      unclosedBraces++;
    } else if (token === ts.SyntaxKind.CloseBracketToken) {
      unclosedBrackets--;
    } else if (token === ts.SyntaxKind.CloseBraceToken) {
      unclosedBraces--;
    }

    const isStringToken =
      token === ts.SyntaxKind.StringLiteral ||
      token === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
    const isCursorInToken = scanner.getTokenStart() <= offset && scanner.getTokenEnd() > offset;
    if (propertyAssignmentContext && isCursorInToken && isStringToken) {
      return propertyAssignmentContext;
    }

    lastTokenText = scanner.getTokenText();
    lastToken = token;
    token = scanner.scan();
  }

  return null;
}

function getVirtualContent(sf: ts.SourceFile, predicate: (node: ts.Node) => boolean): string {
  const matches = findAllMatchingNodes(sf, predicate);
  return getVirtualContentFromNodes(sf, matches);
}

function getVirtualContentFromNodes(sf: ts.SourceFile, matches: ts.Node[]): string {
  const documentText = sf.text;

  let content = documentText
    .split('\n')
    .map((line) => ' '.repeat(line.length))
    .join('\n');

  for (const region of matches) {
    content =
      content.slice(0, region.getStart(sf) + 1) +
      documentText.slice(region.getStart(sf) + 1, region.getEnd() - 1) +
      content.slice(region.getEnd() - 1);
  }

  return content;
}

function isInlineTemplateNode(node: ts.Node): boolean {
  return ts.isStringLiteralLike(node) ? isAssignmentToPropertyWithName(node, 'template') : false;
}

function isInlineStyleNode(node: ts.Node): boolean {
  if (!ts.isStringLiteralLike(node)) {
    return false;
  }

  if (isAssignmentToPropertyWithName(node, 'styles')) {
    return true;
  }

  if (
    node.parent &&
    ts.isArrayLiteralExpression(node.parent) &&
    isAssignmentToPropertyWithName(node.parent, 'styles')
  ) {
    return true;
  }

  return false;
}

function isAssignmentToPropertyWithName(
  node: ts.Node,
  propertyName: 'styles' | 'template',
): boolean {
  const assignment = getPropertyAssignmentFromValue(node, propertyName);
  return assignment !== null && getClassDeclFromDecoratorProp(assignment) !== null;
}

function getPropertyAssignmentFromValue(value: ts.Node, key: string): ts.PropertyAssignment | null {
  const propAssignment = value.parent;
  if (
    !propAssignment ||
    !ts.isPropertyAssignment(propAssignment) ||
    propAssignment.name.getText() !== key
  ) {
    return null;
  }
  return propAssignment;
}

function getClassDeclFromDecoratorProp(
  propAsgnNode: ts.PropertyAssignment,
): ts.ClassDeclaration | undefined {
  if (!propAsgnNode.parent || !ts.isObjectLiteralExpression(propAsgnNode.parent)) {
    return;
  }
  const objLitExprNode = propAsgnNode.parent;
  if (!objLitExprNode.parent || !ts.isCallExpression(objLitExprNode.parent)) {
    return;
  }
  const callExprNode = objLitExprNode.parent;
  if (!callExprNode.parent || !ts.isDecorator(callExprNode.parent)) {
    return;
  }
  const decorator = callExprNode.parent;
  if (!decorator.parent || !ts.isClassDeclaration(decorator.parent)) {
    return;
  }
  return decorator.parent;
}

function findAllMatchingNodes(sf: ts.SourceFile, filter: (node: ts.Node) => boolean): ts.Node[] {
  const results: ts.Node[] = [];
  const stack: ts.Node[] = [sf];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (filter(node)) {
      results.push(node);
    } else {
      stack.push(...node.getChildren());
    }
  }

  return results;
}

function isPropertyAssignmentTerminator(token: ts.SyntaxKind) {
  return (
    token === ts.SyntaxKind.EndOfFileToken ||
    token === ts.SyntaxKind.CommaToken ||
    token === ts.SyntaxKind.SemicolonToken ||
    token === ts.SyntaxKind.CloseBraceToken
  );
}
