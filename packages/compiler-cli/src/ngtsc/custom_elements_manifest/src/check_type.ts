/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {isObject, MAX_TYPE_TEXT_LENGTH, parseTypeText, TYPE_TEXT_ALIAS_PREFIX} from './type_text';

/** An `import("<specifier>").<Name>` type within a check type. */
export interface CheckTypeImport {
  specifier: string;
  name: string;
  /** Start of the module specifier contents, excluding quotes, within the check type. */
  start: number;
  /** End of the module specifier contents, excluding quotes, within the check type. */
  end: number;
}

/**
 * Type text that passed the checks in `computeCheckType`, with the references that the loader
 * still has to resolve against TypeScript declarations.
 */
export interface ValidatedCheckType {
  checkType: string;
  /** `import()` types that replaced package type references. */
  imports: CheckTypeImport[];
  /** Global type names, from `global:` references. */
  globals: string[];
  /**
   * Names that no reference mentions. The type is usable only if TypeScript's default library
   * declares each of them as a global type, such as `CustomEvent` or `Date`.
   */
  libraryTypes: string[];
}

export enum CheckTypeFailure {
  MissingTypeText,
  EmptyTypeText,
  TypeTextTooLong,
  UnsupportedTypeText,
  UnusableTypeReference,
}

export type CheckTypeResult = ValidatedCheckType | {checkType: null; failure: CheckTypeFailure};

/**
 * Converts a CEM type object to TypeScript type text for template type checking, or returns why it
 * can't be used. Type-checking code includes the result verbatim, so every character and name is
 * validated. Get a security review before relaxing these rules.
 *
 * Type keywords, literals, and object property names need no reference. A `type.references`
 * entry covers a name with exact `start` and `end` offsets, or covers every occurrence of its name
 * without offsets. Package references become `import("<package>").<Name>`. `global:` references
 * become `globalThis.<Name>` and are listed in `globals`. A name that no reference mentions also
 * becomes `globalThis.<Name>` and is listed in `libraryTypes`, for the loader to accept only if
 * TypeScript's default library declares it. The allowed syntax has no construct that declares a
 * name, so every occurrence of a name in a type means the same declaration.
 *
 * On failure, the member stays known to schema checks, but its values aren't checked.
 *
 * `parsedTypes` keeps the type text that earlier calls parsed, because a manifest repeats types.
 */
export function computeCheckType(
  type: unknown,
  owningPackage: string | null,
  containingModule: string | null = null,
  parsedTypes = new Map<string, ts.SourceFile>(),
): CheckTypeResult {
  if (!isObject(type) || typeof type['text'] !== 'string') {
    return {checkType: null, failure: CheckTypeFailure.MissingTypeText};
  }
  const text = type['text'];
  if (text.trim().length === 0) {
    return {checkType: null, failure: CheckTypeFailure.EmptyTypeText};
  }
  if (text.length > MAX_TYPE_TEXT_LENGTH) {
    return {checkType: null, failure: CheckTypeFailure.TypeTextTooLong};
  }

  const scannedIdentifiers = scanTypeText(text);
  if (scannedIdentifiers === null) {
    return {checkType: null, failure: CheckTypeFailure.UnsupportedTypeText};
  }

  const nameSpans = findNameSpans(text, parseTypeText(text, parsedTypes));
  if (nameSpans === null) {
    return {checkType: null, failure: CheckTypeFailure.UnsupportedTypeText};
  }
  // Collect the names to resolve: everything except type keywords and property names.
  const namedIdentifiers = scannedIdentifiers.filter(
    (id) =>
      !ALLOWED_IDENTIFIERS.has(id.text) &&
      !nameSpans.propertyNames.has(identifierOccurrenceKey(id.start, id.end)),
  );

  // Each named type requires a reference that covers the identifier's full span.
  const references = Array.isArray(type['references']) ? type['references'] : [];
  const substitutions: Array<IdentifierOccurrence & {target: ReferenceTarget}> = [];
  for (const identifier of namedIdentifiers) {
    const target = findReferenceTarget(
      references,
      identifier,
      text,
      owningPackage,
      containingModule,
    );
    if (
      target === null ||
      // Only the name of a type can go without a reference. A method name or an index signature
      // parameter can't, which keeps function-like syntax out of check types.
      (target.kind === ReferenceTargetKind.Unreferenced &&
        !nameSpans.typeNames.has(identifierOccurrenceKey(identifier.start, identifier.end)))
    ) {
      return {checkType: null, failure: CheckTypeFailure.UnusableTypeReference};
    }
    substitutions.push({...identifier, target});
  }

  // Apply substitutions in source order and record the resulting import specifier spans.
  substitutions.sort((a, b) => a.start - b.start);
  const imports: CheckTypeImport[] = [];
  const globals = new Set<string>();
  const libraryTypes = new Set<string>();
  // The syntax rules are checked on `unqualified`, which keeps global names as they are.
  // `result` qualifies them with `globalThis`, so that a declaration in a component's file can't
  // replace a global type when Angular writes the type-checking code into that file.
  let unqualified = '';
  let result = '';
  let cursor = 0;
  for (const {start, end, text: name, target} of substitutions) {
    unqualified += text.slice(cursor, start);
    result += text.slice(cursor, start);
    if (target.kind === ReferenceTargetKind.Module) {
      const specifierStart = result.length + 'import("'.length;
      imports.push({
        specifier: target.specifier,
        name,
        start: specifierStart,
        end: specifierStart + target.specifier.length,
      });
      unqualified += `import("${target.specifier}").${name}`;
      result += `import("${target.specifier}").${name}`;
    } else {
      (target.kind === ReferenceTargetKind.Global ? globals : libraryTypes).add(name);
      unqualified += name;
      result += nameSpans.typeNames.has(identifierOccurrenceKey(start, end))
        ? `globalThis.${name}`
        : name;
    }
    cursor = end;
  }
  unqualified += text.slice(cursor);
  result += text.slice(cursor);
  const leadingWhitespace = result.length - result.trimStart().length;
  for (const reference of imports) {
    reference.start -= leadingWhitespace;
    reference.end -= leadingWhitespace;
  }

  return isSyntacticallyValidType(parseTypeText(unqualified.trim(), parsedTypes))
    ? {
        checkType: result.trim(),
        imports,
        globals: Array.from(globals),
        libraryTypes: Array.from(libraryTypes),
      }
    : {checkType: null, failure: CheckTypeFailure.UnsupportedTypeText};
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
 * Returns the spans in `text`, parsed as `source`, of two kinds of identifiers. Names of object
 * property signatures, as in `{value: string}`, need no resolution. Names of type references, as
 * in `Foo[]`, can go without a `type.references` entry when TypeScript's default library declares
 * them. Every other identifier needs a reference, including method names, index signature
 * parameters, and computed property names.
 */
function findNameSpans(
  text: string,
  source: ts.SourceFile,
): {propertyNames: Set<string>; typeNames: Set<string>} | null {
  if (!hasExactlyOneTypeAlias(source)) {
    return null;
  }
  const propertyNames = new Set<string>();
  const typeNames = new Set<string>();
  const add = (spans: Set<string>, name: ts.Identifier): void => {
    const start = name.getStart(source) - TYPE_TEXT_ALIAS_PREFIX.length;
    const end = name.getEnd() - TYPE_TEXT_ALIAS_PREFIX.length;
    if (start >= 0 && end <= text.length) {
      spans.add(identifierOccurrenceKey(start, end));
    }
  };
  const visit = (node: ts.Node): void => {
    if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
      add(propertyNames, node.name);
    } else if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      add(typeNames, node.typeName);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return {propertyNames, typeNames};
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

enum ReferenceTargetKind {
  /** A package reference, which becomes an `import()` type. */
  Module,
  /** A `global:` reference. */
  Global,
  /** No reference mentions the name. */
  Unreferenced,
}

type ReferenceTarget =
  | {kind: ReferenceTargetKind.Module; specifier: string}
  | {kind: ReferenceTargetKind.Global | ReferenceTargetKind.Unreferenced};

/**
 * Finds what `identifier` refers to. Returns `null` if references mention the name but none can
 * be used: their offsets don't match the identifier, their package or module is invalid, or
 * references without offsets disagree about where the name comes from.
 */
function findReferenceTarget(
  references: unknown[],
  identifier: IdentifierOccurrence,
  text: string,
  owningPackage: string | null,
  containingModule: string | null,
): ReferenceTarget | null {
  let isReferenced = false;
  /** Distinct targets of the references without offsets, keyed by specifier or `global:`. */
  const withoutOffsets = new Map<string, ReferenceTarget>();
  for (const reference of references) {
    if (
      !isObject(reference) ||
      typeof reference['name'] !== 'string' ||
      !REFERENCE_NAME.test(reference['name']) ||
      reference['name'] !== identifier.text
    ) {
      continue;
    }
    isReferenced = true;
    const hasOffsets = reference['start'] !== undefined || reference['end'] !== undefined;
    if (hasOffsets) {
      // Match the full identifier span to exclude partial names and text inside string literals.
      if (
        reference['start'] !== identifier.start ||
        reference['end'] !== identifier.end ||
        text.slice(identifier.start, identifier.end) !== reference['name']
      ) {
        continue;
      }
    }
    let target: ReferenceTarget;
    if (reference['package'] === 'global:') {
      target = {kind: ReferenceTargetKind.Global};
    } else {
      const specifier = referenceModuleSpecifier(reference, owningPackage, containingModule);
      if (specifier === null) {
        continue;
      }
      target = {kind: ReferenceTargetKind.Module, specifier};
    }
    if (hasOffsets) {
      // A reference to this exact occurrence takes precedence over references without offsets.
      return target;
    }
    withoutOffsets.set(
      target.kind === ReferenceTargetKind.Module ? target.specifier : 'global:',
      target,
    );
  }
  if (!isReferenced) {
    return {kind: ReferenceTargetKind.Unreferenced};
  }
  return withoutOffsets.size === 1 ? withoutOffsets.values().next().value! : null;
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
 * Whether `specifier` is an npm package name without a subpath. Rejects `.`, `..`, and other
 * relative paths, which would resolve relative to the generated type-checking file.
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

/**
 * Whether the parsed text is exactly one TypeScript type, without qualified names such as
 * `Foo.Bar` or empty type argument lists.
 */
function isSyntacticallyValidType(source: ts.SourceFile): boolean {
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
