/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Shared size limit for type validation and display text.
 */
export const MAX_TYPE_TEXT_LENGTH = 512;

/** Narrows an untrusted JSON value to a plain object. */
export function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The `text` of a CEM type object, or `undefined` when the value is not a typed CEM record. */
export function typeTextOf(type: unknown): string | undefined {
  return isObject(type) && typeof type['text'] === 'string' ? type['text'] : undefined;
}

/**
 * Prefix used to parse standalone type text as the right-hand side of a type alias. Consumers
 * that map positions in the parsed source back to the original text subtract its length.
 */
export const TYPE_TEXT_ALIAS_PREFIX = 'type __CustomElementsManifestTypeText = (';

/**
 * Caches parsed types for reuse across analyses and manifest members. Parsed files are immutable.
 * Limits the number of entries to bound memory use.
 */
const parsedTypeTexts = new Map<string, ts.SourceFile>();
const MAX_PARSED_TYPE_TEXTS = 2048;

/** Parses CEM type text or a validated check type for syntax analysis. */
export function parseTypeText(typeText: string): ts.SourceFile {
  let source = parsedTypeTexts.get(typeText);
  if (source === undefined) {
    if (parsedTypeTexts.size >= MAX_PARSED_TYPE_TEXTS) {
      parsedTypeTexts.clear();
    }
    source = ts.createSourceFile(
      'custom-elements-manifest-type-text.ts',
      `${TYPE_TEXT_ALIAS_PREFIX}${typeText});`,
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );
    parsedTypeTexts.set(typeText, source);
  }
  return source;
}

/**
 * Resolves an imported type to its string literal values. Returns `null` for other types and
 * `undefined` for unresolved references.
 */
export type ImportTypeResolver = (specifier: string, name: string) => string[] | null | undefined;

/**
 * Extracts string literal values for static attribute completions. Allows nullish union members
 * and returns `null` for other types. Imported types require `resolveImportType` to resolve them.
 */
export function analyzeTypeText(
  typeText: string,
  resolveImportType?: ImportTypeResolver,
): string[] | null {
  const source = parseTypeText(typeText);
  const declaration = source.statements[0];
  if (declaration === undefined || !ts.isTypeAliasDeclaration(declaration)) {
    return null;
  }
  const values: string[] = [];
  let isStringLiteralUnion = true;
  const collect = (node: ts.TypeNode): void => {
    if (ts.isParenthesizedTypeNode(node)) {
      collect(node.type);
    } else if (ts.isUnionTypeNode(node)) {
      for (const member of node.types) {
        collect(member);
      }
    } else if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
      values.push(node.literal.text);
    } else if (ts.isLiteralTypeNode(node) && node.literal.kind === ts.SyntaxKind.NullKeyword) {
      // Nullish members do not disqualify a literal union.
    } else if (ts.isImportTypeNode(node)) {
      const reference = getImportTypeReference(node);
      const resolved =
        reference === null ? undefined : resolveImportType?.(reference.specifier, reference.name);
      if (resolved == null) {
        isStringLiteralUnion = false;
      } else {
        values.push(...resolved);
      }
    } else if (
      node.kind !== ts.SyntaxKind.UndefinedKeyword &&
      node.kind !== ts.SyntaxKind.NeverKeyword &&
      node.kind !== ts.SyntaxKind.VoidKeyword
    ) {
      isStringLiteralUnion = false;
    }
  };
  collect(declaration.type);
  return isStringLiteralUnion && values.length > 0 ? Array.from(new Set(values)) : null;
}

/**
 * Extracts the module specifier and exported name from an `import("<specifier>").<Name>` type.
 * Returns `null` for other import types, which the validator does not emit.
 */
function getImportTypeReference(node: ts.ImportTypeNode): {specifier: string; name: string} | null {
  return ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteral(node.argument.literal) &&
    node.qualifier !== undefined &&
    ts.isIdentifier(node.qualifier)
    ? {
        specifier: node.argument.literal.text,
        name: node.qualifier.text,
      }
    : null;
}
