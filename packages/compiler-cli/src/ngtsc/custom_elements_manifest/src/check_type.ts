/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

/**
 * Computes the emittable "check type" for a CEM type object, or `null` when the type
 * information is not trustworthy enough to type-check binding values against.
 *
 * SECURITY: the returned string is spliced verbatim into generated type-check code
 * (`var _t1 = null! as (<result>);`). This module is the validation boundary that makes
 * that safe: it only returns text whose every character and identifier has been vetted by
 * the whitelist scanner below. Any relaxation of these rules requires a security review.
 *
 * Two tiers of type text are accepted:
 *
 * 1. *Self-contained* text whose identifiers are all TypeScript built-in type keywords or
 *    universally-available globals (e.g. `boolean`, `'a' | 'b'`, `string[]`,
 *    `Array<number>`). Returned as-is.
 * 2. Text whose named types are located by the manifest's `type.references` entries. Each
 *    reference must exactly cover an identifier occurrence — either via its `start`/`end`
 *    indices or, for index-less references, by the whole type text being exactly the
 *    referenced name — and provide a usable bare package specifier; the covered span is
 *    replaced with an inline `import("<package>").<Name>` type query, producing
 *    self-contained text.
 *
 * Anything else — function types, qualified names, template literal interpolation,
 * uncovered named types, or any suspicious character — yields `null`, and the property
 * falls back to existence-only checking.
 */
export function computeCheckType(
  cemType: unknown,
  owningPackage: string | null,
  containingModule: string | null = null,
): string | null {
  if (!isObject(cemType) || typeof cemType['text'] !== 'string') {
    return null;
  }
  const text = cemType['text'];
  if (text.trim().length === 0 || text.length > MAX_TYPE_TEXT_LENGTH) {
    return null;
  }

  const scan = scanTypeText(text);
  if (scan === null) {
    return null;
  }

  // Collect the identifier occurrences that are not built-in keywords or safe globals.
  const namedIdentifiers = scan.identifiers.filter((id) => !ALLOWED_IDENTIFIERS.has(id.text));
  if (namedIdentifiers.length === 0) {
    // Tier 1: fully self-contained.
    const result = text.trim();
    return isSyntacticallyValidType(result) ? result : null;
  }

  // Tier 2: every named identifier must be exactly covered by a usable reference.
  const references = Array.isArray(cemType['references']) ? cemType['references'] : [];
  const substitutions: {start: number; end: number; replacement: string}[] = [];
  for (const identifier of namedIdentifiers) {
    const replacement = findCoveringReferenceReplacement(
      references,
      identifier,
      text,
      owningPackage,
      containingModule,
    );
    if (replacement === null) {
      return null;
    }
    substitutions.push({
      start: identifier.start,
      end: identifier.end,
      replacement,
    });
  }

  // Apply substitutions back-to-front so earlier offsets stay valid.
  substitutions.sort((a, b) => b.start - a.start);
  let result = text;
  for (const {start, end, replacement} of substitutions) {
    result = result.slice(0, start) + replacement + result.slice(end);
  }
  result = result.trim();
  return isSyntacticallyValidType(result) ? result : null;
}

const MAX_TYPE_TEXT_LENGTH = 512;

/** TypeScript built-in type keywords permitted in check types. */
const TYPE_KEYWORDS = [
  'string',
  'number',
  'boolean',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'any',
  'unknown',
  'never',
  'object',
  'bigint',
  'readonly',
];

/** Globals available in every TypeScript program that are permitted in check types. */
const GLOBAL_TYPES = [
  'Array',
  'ReadonlyArray',
  'Record',
  'Partial',
  'Readonly',
  'Map',
  'Set',
  'Date',
  'Promise',
  'Element',
  'HTMLElement',
  'Node',
  'Event',
  'CustomEvent',
  'File',
  'Blob',
  'FormData',
];

const ALLOWED_IDENTIFIERS = new Set<string>([...TYPE_KEYWORDS, ...GLOBAL_TYPES]);

/**
 * Punctuation permitted outside string literals. Notably absent: `; \ = @ / * ! # % ^ ~ +`,
 * which rules out statements, comments, escapes, arrow function types, and decorators.
 */
const ALLOWED_PUNCTUATION = new Set<string>([
  '[',
  ']',
  '(',
  ')',
  '{',
  '}',
  '<',
  '>',
  '|',
  '&',
  ',',
  '.',
  ':',
  '?',
  '-',
  ' ',
  '\t',
  '\n',
  '\r',
]);

const IDENTIFIER_START = /[A-Za-z_$]/;
const IDENTIFIER_PART = /[A-Za-z0-9_$]/;
const REFERENCE_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const PACKAGE_SPECIFIER = /^(@[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+$/;

interface IdentifierOccurrence {
  text: string;
  start: number;
  end: number;
}

interface ScanResult {
  identifiers: IdentifierOccurrence[];
}

/**
 * Scans type text left to right, character by character, validating that every character is
 * on the whitelist and recording identifier occurrences outside of string literals.
 * Returns `null` if anything disallowed is encountered.
 */
function scanTypeText(text: string): ScanResult | null {
  const identifiers: IdentifierOccurrence[] = [];
  const brackets: string[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];

    if (char === "'" || char === '"' || char === '`') {
      const end = scanStringLiteral(text, i);
      if (end === -1) {
        return null;
      }
      i = end;
      continue;
    }

    if (IDENTIFIER_START.test(char)) {
      const start = i;
      while (i < text.length && IDENTIFIER_PART.test(text[i])) {
        i++;
      }
      identifiers.push({text: text.slice(start, i), start, end: i});
      continue;
    }

    if (char >= '0' && char <= '9') {
      i++;
      continue;
    }

    if (!ALLOWED_PUNCTUATION.has(char)) {
      return null;
    }
    if (char === '(' || char === '[' || char === '{' || char === '<') {
      brackets.push(char);
    } else if (char === ')' || char === ']' || char === '}' || char === '>') {
      const open = brackets.pop();
      if (
        (char === ')' && open !== '(') ||
        (char === ']' && open !== '[') ||
        (char === '}' && open !== '{') ||
        (char === '>' && open !== '<')
      ) {
        return null;
      }
    }
    i++;
  }
  if (brackets.length > 0) {
    return null;
  }
  return {identifiers};
}

/**
 * Scans a string literal starting at `start` (which holds the delimiter). Returns the index
 * just past the closing delimiter, or -1 if the literal is unterminated or contains anything
 * disallowed (escapes, template interpolation, control characters, line separators).
 */
function scanStringLiteral(text: string, start: number): number {
  const delimiter = text[start];
  for (let i = start + 1; i < text.length; i++) {
    const char = text[i];
    if (char === delimiter) {
      return i + 1;
    }
    if (char === '\\' || char < ' ' || char === '\u2028' || char === '\u2029') {
      return -1;
    }
    if (delimiter === '`' && char === '$' && text[i + 1] === '{') {
      return -1;
    }
  }
  return -1;
}

/**
 * Finds a CEM reference that exactly covers the given identifier occurrence and returns safe type
 * text for it: either an `import()` type query or the original identifier for a `global:`
 * reference. Returns `null` if no usable reference covers it.
 *
 * Per the CEM specification, `start`/`end` "must both be present or not present. If they are
 * missing, the entire type string is the symbol referenced and the name should match the type
 * string" — so an index-less reference is usable only when the trimmed type text is exactly
 * the referenced identifier.
 */
function findCoveringReferenceReplacement(
  references: unknown[],
  identifier: IdentifierOccurrence,
  text: string,
  owningPackage: string | null,
  containingModule: string | null,
): string | null {
  for (const reference of references) {
    if (
      !isObject(reference) ||
      typeof reference['name'] !== 'string' ||
      !REFERENCE_NAME.test(reference['name'])
    ) {
      continue;
    }
    if (reference['start'] !== undefined || reference['end'] !== undefined) {
      if (!Number.isInteger(reference['start']) || !Number.isInteger(reference['end'])) {
        continue;
      }
      const start = reference['start'] as number;
      const end = reference['end'] as number;
      // The reference must exactly cover this identifier occurrence. Matching against a
      // scanned occurrence guarantees the span lies outside string literals and on full
      // identifier boundaries.
      if (
        start !== identifier.start ||
        end !== identifier.end ||
        reference['name'] !== identifier.text ||
        text.slice(start, end) !== reference['name']
      ) {
        continue;
      }
    } else if (reference['name'] !== identifier.text || text.trim() !== identifier.text) {
      // Index-less reference: only usable when the whole (trimmed) type text is this
      // identifier, which also guarantees the occurrence is unique and spans the full text.
      continue;
    }
    if (reference['package'] === 'global:') {
      return identifier.text;
    }
    const specifier = referenceModuleSpecifier(reference, owningPackage, containingModule);
    if (specifier === null) {
      continue;
    }
    return `import("${specifier}").${identifier.text}`;
  }
  return null;
}

function referenceModuleSpecifier(
  reference: {[key: string]: unknown},
  owningPackage: string | null,
  containingModule: string | null,
): string | null {
  const hasExplicitPackage = typeof reference['package'] === 'string';
  const packageName = hasExplicitPackage ? (reference['package'] as string) : owningPackage;
  if (packageName === null || !PACKAGE_SPECIFIER.test(packageName)) {
    return null;
  }
  if (reference['module'] === undefined) {
    if (hasExplicitPackage || containingModule === null) {
      return packageName;
    }
    return packageModuleSpecifier(packageName, containingModule);
  }
  if (typeof reference['module'] !== 'string') {
    return null;
  }
  const modulePath = reference['module'].replace(/^\.\//, '');
  if (
    modulePath.length === 0 ||
    modulePath.includes('\\') ||
    modulePath
      .split('/')
      .some((segment) => segment.length === 0 || segment === '.' || segment === '..') ||
    !/^[A-Za-z0-9._@/-]+$/.test(modulePath)
  ) {
    return null;
  }
  return packageModuleSpecifier(packageName, modulePath);
}

function packageModuleSpecifier(packageName: string, modulePath: string): string {
  const normalizedModulePath = modulePath.replace(/^\.\//, '');
  return normalizedModulePath === packageName || normalizedModulePath.startsWith(`${packageName}/`)
    ? normalizedModulePath
    : `${packageName}/${normalizedModulePath}`;
}

function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Ensures whitelist-safe text is also exactly one syntactically valid TypeScript type. */
function isSyntacticallyValidType(typeText: string): boolean {
  const source = ts.createSourceFile(
    'custom-elements-manifest-type.ts',
    `type __CustomElementsManifestType = (${typeText});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const parseDiagnostics = (source as ts.SourceFile & {parseDiagnostics?: readonly ts.Diagnostic[]})
    .parseDiagnostics;
  let hasEmptyTypeArgumentList = false;
  let hasQualifiedTypeName = false;
  const visit = (node: ts.Node): void => {
    if (ts.isQualifiedName(node)) {
      hasQualifiedTypeName = true;
      return;
    }
    if (ts.isTypeReferenceNode(node)) {
      if (node.typeArguments?.length === 0) {
        hasEmptyTypeArgumentList = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return (
    (parseDiagnostics === undefined || parseDiagnostics.length === 0) &&
    !hasEmptyTypeArgumentList &&
    !hasQualifiedTypeName &&
    source.statements.length === 1 &&
    ts.isTypeAliasDeclaration(source.statements[0])
  );
}
