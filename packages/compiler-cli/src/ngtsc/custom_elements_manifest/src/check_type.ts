/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {isObject, MAX_TYPE_TEXT_LENGTH, parseTypeText, TYPE_TEXT_ALIAS_PREFIX} from './type_text';

/** An `import("<specifier>").<Name>` type query within a check type. */
export interface CheckTypeImport {
  specifier: string;
  name: string;
  /** Start of the module specifier contents, excluding quotes, within the check type. */
  start: number;
  /** End of the module specifier contents, excluding quotes, within the check type. */
  end: number;
}

/** Named types referenced by a validated check type. */
export interface CheckTypeAnalysis {
  /** `import()` type queries substituted for package-local type references. */
  imports: CheckTypeImport[];
  /** Global type names, from `global:` references. */
  globals: string[];
}

/** A validated check type and the references the loader must resolve. */
export interface ValidatedCheckType extends CheckTypeAnalysis {
  /**
   * Validated TypeScript type text. The compiler emits this text verbatim into type-check blocks.
   * See `computeCheckType` for the validation rules.
   */
  checkType: string;
}

export type CheckTypeFailure =
  | 'missingTypeText'
  | 'emptyTypeText'
  | 'typeTextTooLong'
  | 'unsupportedTypeText'
  | 'unusableTypeReference';

export type CheckTypeResult = ValidatedCheckType | {checkType: null; failure: CheckTypeFailure};

/**
 * Converts a CEM type object to a TypeScript check type, or returns the reason it cannot be used.
 * The compiler emits the result verbatim into type-check blocks. All characters and identifiers
 * must pass validation. Relaxing these rules requires a security review.
 *
 * Built-in type keywords, literals, and object property names need no references. Other type
 * names require a `type.references` entry that covers the identifier. References within compound
 * types require exact `start` and `end` offsets. A reference without offsets must name the entire
 * type string. Package references become `import("<package>").<Name>` types. Global references
 * keep their names and appear in `globals`.
 *
 * Unsupported syntax or missing references prevent value checking. The property remains known
 * to the schema checker.
 */
export function computeCheckType(
  cemType: unknown,
  owningPackage: string | null,
  containingModule: string | null = null,
): CheckTypeResult {
  if (!isObject(cemType) || typeof cemType['text'] !== 'string') {
    return {checkType: null, failure: 'missingTypeText'};
  }
  const text = cemType['text'];
  if (text.trim().length === 0) {
    return {checkType: null, failure: 'emptyTypeText'};
  }
  if (text.length > MAX_TYPE_TEXT_LENGTH) {
    return {checkType: null, failure: 'typeTextTooLong'};
  }

  const scannedIdentifiers = scanTypeText(text);
  if (scannedIdentifiers === null) {
    return {checkType: null, failure: 'unsupportedTypeText'};
  }

  const propertyNameSpans = findPropertySignatureNameSpans(text);
  if (propertyNameSpans === null) {
    return {checkType: null, failure: 'unsupportedTypeText'};
  }
  // Collect the identifier occurrences that are not built-in keywords.
  const namedIdentifiers = scannedIdentifiers.filter(
    (id) =>
      !ALLOWED_IDENTIFIERS.has(id.text) &&
      !propertyNameSpans.has(identifierOccurrenceKey(id.start, id.end)),
  );

  // Each named type requires a reference that covers the identifier's full span.
  const references = Array.isArray(cemType['references']) ? cemType['references'] : [];
  const substitutions: Array<IdentifierOccurrence & {specifier: string | null}> = [];
  for (const identifier of namedIdentifiers) {
    const replacement = findCoveringReferenceReplacement(
      references,
      identifier,
      text,
      owningPackage,
      containingModule,
    );
    if (replacement === undefined) {
      return {checkType: null, failure: 'unusableTypeReference'};
    }
    substitutions.push({...identifier, specifier: replacement});
  }

  // Apply substitutions in source order and record the resulting import specifier spans.
  substitutions.sort((a, b) => a.start - b.start);
  const imports: CheckTypeImport[] = [];
  const globals = new Set<string>();
  let result = '';
  let cursor = 0;
  for (const {start, end, text: name, specifier} of substitutions) {
    result += text.slice(cursor, start);
    if (specifier === null) {
      globals.add(name);
      result += name;
    } else {
      const specifierStart = result.length + 'import("'.length;
      imports.push({
        specifier,
        name,
        start: specifierStart,
        end: specifierStart + specifier.length,
      });
      result += `import("${specifier}").${name}`;
    }
    cursor = end;
  }
  result += text.slice(cursor);
  const leadingWhitespace = result.length - result.trimStart().length;
  result = result.trim();
  for (const reference of imports) {
    reference.start -= leadingWhitespace;
    reference.end -= leadingWhitespace;
  }

  return isSyntacticallyValidType(result)
    ? {checkType: result, imports, globals: Array.from(globals)}
    : {checkType: null, failure: 'unsupportedTypeText'};
}

/** TypeScript built-in type keywords permitted in check types. */
const ALLOWED_IDENTIFIERS = new Set<string>([
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
]);

/**
 * Punctuation allowed outside string literals. Excludes `; \ = @ / * ! # % ^ ~ +` to reject
 * statements, comments, escapes, arrow function types, and decorators.
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
const PACKAGE_NAME_CHARACTERS = /^[A-Za-z0-9._-]+$/;

interface IdentifierOccurrence {
  text: string;
  start: number;
  end: number;
}

/**
 * Returns the source spans of identifier names in object property signatures. These names need
 * no type reference, as in `{value: string}`. Other identifiers still require references,
 * including method names, index signature parameters, and computed property names.
 */
function findPropertySignatureNameSpans(text: string): Set<string> | null {
  const source = parseTypeText(text);
  if (!hasExactlyOneTypeAlias(source)) {
    return null;
  }
  const spans = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
      const start = node.name.getStart(source) - TYPE_TEXT_ALIAS_PREFIX.length;
      const end = node.name.getEnd() - TYPE_TEXT_ALIAS_PREFIX.length;
      if (start >= 0 && end <= text.length) {
        spans.add(identifierOccurrenceKey(start, end));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return spans;
}

function identifierOccurrenceKey(start: number, end: number): string {
  return `${start}:${end}`;
}

/**
 * Checks type text against the allowed characters and records identifiers outside string
 * literals. Returns `null` for disallowed text.
 */
function scanTypeText(text: string): IdentifierOccurrence[] | null {
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
  return identifiers;
}

/**
 * Scans a string literal from its opening delimiter at `start`. Returns the index after the
 * closing delimiter, or -1 for an unterminated literal, escapes, template interpolation,
 * control characters, or line separators.
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
 * Finds the reference for an identifier and returns its import specifier. Returns `null` for a
 * global reference, which keeps the identifier, or `undefined` when no usable reference exists.
 * CEM references require both `start` and `end` offsets unless the name matches the entire type
 * string. References to names within compound types must include both offsets.
 */
function findCoveringReferenceReplacement(
  references: unknown[],
  identifier: IdentifierOccurrence,
  text: string,
  owningPackage: string | null,
  containingModule: string | null,
): string | null | undefined {
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
      // Match the full identifier span to exclude partial names and text inside string literals.
      if (
        start !== identifier.start ||
        end !== identifier.end ||
        reference['name'] !== identifier.text ||
        text.slice(start, end) !== reference['name']
      ) {
        continue;
      }
    } else if (reference['name'] !== identifier.text || text.trim() !== identifier.text) {
      // A reference without offsets must name the entire type string.
      continue;
    }
    if (reference['package'] === 'global:') {
      return null;
    }
    const specifier = referenceModuleSpecifier(reference, owningPackage, containingModule);
    if (specifier === null) {
      continue;
    }
    return specifier;
  }
  return undefined;
}

function referenceModuleSpecifier(
  reference: {[key: string]: unknown},
  owningPackage: string | null,
  containingModule: string | null,
): string | null {
  const hasExplicitPackage = typeof reference['package'] === 'string';
  const packageName = hasExplicitPackage ? (reference['package'] as string) : owningPackage;
  if (packageName === null || !isBarePackageSpecifier(packageName)) {
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

/**
 * Checks whether a specifier names an npm package. Rejects relative paths and package subpaths,
 * including `.` and `..`, which TypeScript would interpret as relative imports in a TCB.
 */
function isBarePackageSpecifier(specifier: string): boolean {
  if (specifier.startsWith('@')) {
    const segments = specifier.slice(1).split('/');
    return segments.length === 2 && segments.every(isPackageNameSegment);
  }
  return !specifier.includes('/') && isPackageNameSegment(specifier);
}

function isPackageNameSegment(segment: string): boolean {
  return (
    PACKAGE_NAME_CHARACTERS.test(segment) &&
    !segment.startsWith('.') &&
    !segment.startsWith('_') &&
    !segment.endsWith('.') &&
    /[A-Za-z0-9]/.test(segment)
  );
}

function packageModuleSpecifier(packageName: string, modulePath: string): string {
  const normalizedModulePath = modulePath.replace(/^\.\//, '');
  return normalizedModulePath === packageName || normalizedModulePath.startsWith(`${packageName}/`)
    ? normalizedModulePath
    : `${packageName}/${normalizedModulePath}`;
}

/** Checks that the allowed text parses as exactly one TypeScript type. */
function isSyntacticallyValidType(typeText: string): boolean {
  const source = parseTypeText(typeText);
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
  return !hasEmptyTypeArgumentList && !hasQualifiedTypeName && hasExactlyOneTypeAlias(source);
}

function hasExactlyOneTypeAlias(source: ts.SourceFile): boolean {
  const parseDiagnostics = (source as ts.SourceFile & {parseDiagnostics?: readonly ts.Diagnostic[]})
    .parseDiagnostics;
  return (
    (parseDiagnostics === undefined || parseDiagnostics.length === 0) &&
    source.statements.length === 1 &&
    ts.isTypeAliasDeclaration(source.statements[0])
  );
}
