/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/** The longest type text, in characters, that is validated or displayed. */
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
 * Wraps type text in a type alias so that it parses as a type. To map a position in the parsed
 * source to the type text, subtract this prefix's length.
 */
export const TYPE_TEXT_ALIAS_PREFIX = 'type __CustomElementsManifestTypeText = (';

/** Parses CEM type text or a validated check type for syntax analysis. */
export function parseTypeText(typeText: string): ts.SourceFile {
  return ts.createSourceFile(
    'custom-elements-manifest-type-text.ts',
    `${TYPE_TEXT_ALIAS_PREFIX}${typeText});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
}
