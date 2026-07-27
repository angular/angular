/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestPropertyType as CustomElementsManifestPropertyType} from '@angular/compiler';
import ts from 'typescript';

/**
 * Prefix used to parse standalone type text as the right-hand side of a type alias. Consumers
 * that map positions in the parsed source back to the original text subtract its length.
 */
export const TYPE_TEXT_ALIAS_PREFIX = 'type __CustomElementsManifestTypeText = (';

/** Parses standalone type text (CEM type text or a validated check type) for syntax analysis. */
export function parseTypeText(typeText: string): ts.SourceFile {
  return ts.createSourceFile(
    'custom-elements-manifest-type-text.ts',
    `${TYPE_TEXT_ALIAS_PREFIX}${typeText});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
}

/** Coarse type information derived syntactically from type text. */
export interface TypeTextInfo {
  /** Serialization category of the type, or `'object'` when mixed or unrecognized. */
  type: CustomElementsManifestPropertyType;

  /**
   * The string literal values when the type is a pure union of string literals (nullish members
   * are permitted), otherwise `null`.
   */
  stringLiteralValues: string[] | null;
}

/**
 * Resolves an `import("<specifier>").<Name>` type query encountered in type text to the type
 * information of the referenced declaration, or `undefined` when it is not resolvable.
 */
export type ImportTypeResolver = (specifier: string, name: string) => TypeTextInfo | undefined;

/**
 * Syntactically derives coarse type information from type text: the serialization category
 * (mirroring the type tags used by the `DomElementSchemaRegistry`) and, for pure string-literal
 * unions, the literal values.
 *
 * The analysis is conservative: anything unrecognized falls into the `'object'` category, and
 * text that does not parse as exactly one type yields `'object'` with no literal values.
 * `import()` type queries are categorized through `resolveImportType` when provided; otherwise
 * (or when unresolvable) they are treated as `'object'`.
 */
export function analyzeTypeText(
  typeText: string,
  resolveImportType?: ImportTypeResolver,
): TypeTextInfo {
  const source = parseTypeText(typeText);
  const declaration = source.statements[0];
  if (declaration === undefined || !ts.isTypeAliasDeclaration(declaration)) {
    return {type: 'object', stringLiteralValues: null};
  }
  const categories = new Set<CustomElementsManifestPropertyType>();
  const values: string[] = [];
  let isStringLiteralUnion = true;
  const collect = (node: ts.TypeNode): void => {
    if (ts.isParenthesizedTypeNode(node)) {
      collect(node.type);
    } else if (ts.isUnionTypeNode(node)) {
      for (const member of node.types) {
        collect(member);
      }
    } else if (ts.isIntersectionTypeNode(node)) {
      isStringLiteralUnion = false;
      for (const member of node.types) {
        collect(member);
      }
    } else if (node.kind === ts.SyntaxKind.StringKeyword) {
      categories.add('string');
      isStringLiteralUnion = false;
    } else if (node.kind === ts.SyntaxKind.NumberKeyword) {
      categories.add('number');
      isStringLiteralUnion = false;
    } else if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      categories.add('boolean');
      isStringLiteralUnion = false;
    } else if (ts.isLiteralTypeNode(node)) {
      if (ts.isStringLiteral(node.literal)) {
        categories.add('string');
        values.push(node.literal.text);
      } else if (
        ts.isNumericLiteral(node.literal) ||
        (ts.isPrefixUnaryExpression(node.literal) && ts.isNumericLiteral(node.literal.operand))
      ) {
        categories.add('number');
        isStringLiteralUnion = false;
      } else if (
        node.literal.kind === ts.SyntaxKind.TrueKeyword ||
        node.literal.kind === ts.SyntaxKind.FalseKeyword
      ) {
        categories.add('boolean');
        isStringLiteralUnion = false;
      } else if (node.literal.kind !== ts.SyntaxKind.NullKeyword) {
        categories.add('object');
        isStringLiteralUnion = false;
      }
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal) &&
      node.qualifier !== undefined &&
      ts.isIdentifier(node.qualifier)
    ) {
      const resolved = resolveImportType?.(node.argument.literal.text, node.qualifier.text);
      if (resolved === undefined) {
        categories.add('object');
        isStringLiteralUnion = false;
      } else {
        categories.add(resolved.type);
        if (resolved.stringLiteralValues === null) {
          isStringLiteralUnion = false;
        } else {
          values.push(...resolved.stringLiteralValues);
        }
      }
    } else if (
      node.kind !== ts.SyntaxKind.UndefinedKeyword &&
      node.kind !== ts.SyntaxKind.NeverKeyword &&
      node.kind !== ts.SyntaxKind.VoidKeyword
    ) {
      categories.add('object');
      isStringLiteralUnion = false;
    }
  };
  collect(declaration.type);
  const type = categories.size === 1 ? categories.values().next().value! : 'object';
  return {
    type,
    stringLiteralValues:
      type === 'string' && isStringLiteralUnion && values.length > 0
        ? Array.from(new Set(values))
        : null,
  };
}
