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
