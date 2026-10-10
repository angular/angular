/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {absoluteFrom, join} from '../../file_system';
import {CheckTypeImport} from './check_type';
import {ManifestLoadContext} from './load_context';
import {ManifestCheckType} from './schema';
import {createTypeCheckingProgram} from './type_host';

/** The result of type-checking one check type in the application's type environment. */
export interface ResolvedCheckType {
  checkType: string;
  stringLiteralValues: string[] | null;
  errors: readonly ts.Diagnostic[];
  /**
   * For an element instance type, the type of element variables in template checks, or `null`
   * when the declared type cannot represent an element. Unset for other types.
   */
  elementCheckType?: string | null;
}

/** Suffix of the alias that intersects an element instance type with `HTMLElement`. */
const ELEMENT_ALIAS_SUFFIX = '__element';

/** Type references of one manifest after module resolution. */
export interface ManifestTypeRequest {
  /** Module specifiers that resolve to TypeScript files. */
  resolvedFiles: ReadonlyMap<string, string>;
  /** Type names referenced from each module specifier. */
  referencedNames: ReadonlyMap<string, ReadonlySet<string>>;
  checkTypes: ReadonlySet<ManifestCheckType>;
  /** Check types of element instances, a subset of `checkTypes`. */
  instanceTypes: ReadonlySet<ManifestCheckType>;
  /** Replacements for module specifiers that resolve only from the manifest's directory. */
  replacements: ReadonlyMap<string, string>;
}

/** Validation results for one `ManifestTypeRequest`. */
export interface ManifestTypeInspection {
  missingExports: Map<string, Set<string>>;
  checkedTypes: Array<ResolvedCheckType & {analysis: ManifestCheckType}>;
}

/**
 * Type-checks the check types of all manifests in one program, and finds referenced names that the
 * resolved modules don't export. Returns one result per request, in order.
 */
export function inspectTypes(
  requests: readonly ManifestTypeRequest[],
  {environment, dependencies: {cacheDependencyPaths}}: ManifestLoadContext,
): ManifestTypeInspection[] {
  // Aliases are numbered across manifests. Each manifest's import specifiers are rewritten to
  // resolve from the shared source location.
  const records = new Map<
    string,
    {analysis: ManifestCheckType; checkType: string; requestIndex: number; isInstance: boolean}
  >();
  requests.forEach(({checkTypes, instanceTypes, replacements}, requestIndex) => {
    for (const analysis of checkTypes) {
      records.set(`__CemType${records.size}`, {
        analysis,
        checkType: rewriteImportSpecifiers(analysis.checkType, analysis.imports, replacements),
        requestIndex,
        isInstance: instanceTypes.has(analysis),
      });
    }
  });
  const inspections = requests.map((): ManifestTypeInspection => ({
    missingExports: new Map(),
    checkedTypes: [],
  }));
  if (records.size === 0) {
    return inspections;
  }
  const declarations: string[] = [];
  for (const [name, {checkType, isInstance}] of records) {
    declarations.push(`export type ${name} = (${checkType});`);
    if (isInstance) {
      declarations.push(
        `export type ${name}${ELEMENT_ALIAS_SUFFIX} = (${checkType}) & HTMLElement;`,
      );
    }
  }
  const source = ts.createSourceFile(
    join(environment.basePath, '__ng_custom_elements_manifest_types__.ts'),
    declarations.join('\n'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  // `computeCheckType` requires a reference for every name, so types without references don't
  // need library or global declarations.
  const needsEnvironment = Array.from(records.values()).some(
    ({analysis}) => analysis.imports.length > 0 || analysis.globals.length > 0,
  );
  const rootNames = new Set([
    ...requests.flatMap(({resolvedFiles}) => Array.from(resolvedFiles.values())),
    ...(needsEnvironment ? environment.typeEnvironmentFiles.map((file) => file.fileName) : []),
  ]);
  const program = createTypeCheckingProgram(
    source,
    [...rootNames],
    environment,
    cacheDependencyPaths,
  );
  for (const file of program.getSourceFiles()) {
    if (file !== source) {
      cacheDependencyPaths.add(absoluteFrom(file.fileName));
    }
  }
  const diagnostics = program.getSemanticDiagnostics(source);
  const checker = program.getTypeChecker();
  const hasHTMLElement =
    checker.resolveName('HTMLElement', undefined, ts.SymbolFlags.Type, false) !== undefined;
  /** Element aliases by the name of the record they intersect with `HTMLElement`. */
  const elementAliases = new Map<string, ts.TypeAliasDeclaration>();
  for (const statement of source.statements) {
    if (
      ts.isTypeAliasDeclaration(statement) &&
      statement.name.text.endsWith(ELEMENT_ALIAS_SUFFIX)
    ) {
      elementAliases.set(statement.name.text.slice(0, -ELEMENT_ALIAS_SUFFIX.length), statement);
    }
  }
  const elementAliasStatements = new Set<ts.Statement>(elementAliases.values());
  for (const statement of source.statements) {
    if (elementAliasStatements.has(statement)) {
      continue;
    }
    // Syntax validation guarantees exactly one alias per record; fail on an internal mismatch.
    const record = ts.isTypeAliasDeclaration(statement)
      ? records.get(statement.name.text)
      : undefined;
    if (record === undefined || !ts.isTypeAliasDeclaration(statement)) {
      throw new Error(
        'AssertionError: Unexpected declaration in the manifest type-checking source.',
      );
    }
    const {requestIndex, isInstance, ...checked} = record;
    const type = checker.getTypeFromTypeNode(statement.type);
    const elementAlias = elementAliases.get(statement.name.text);
    inspections[requestIndex].checkedTypes.push({
      ...checked,
      errors: diagnostics.filter(
        (diagnostic) =>
          diagnostic.start !== undefined &&
          diagnostic.start >= statement.pos &&
          diagnostic.start < statement.end,
      ),
      stringLiteralValues: resolvedStringLiteralValues(type),
      ...(isInstance && elementAlias !== undefined
        ? {
            elementCheckType: elementCheckType(
              checker,
              checked.checkType,
              type,
              checker.getTypeFromTypeNode(elementAlias.type),
              hasHTMLElement,
            ),
          }
        : {}),
    });
  }
  requests.forEach(({resolvedFiles, referencedNames}, requestIndex) => {
    inspections[requestIndex].missingExports = findMissingExports(
      program,
      resolvedFiles,
      referencedNames,
    );
  });
  return inspections;
}

/**
 * Template checks call `addEventListener` on element variables for native DOM events. Keeps a
 * declared class that provides it, including an `HTMLElement` subclass whose members differ from
 * the consumer's DOM library. Otherwise uses the class intersected with `HTMLElement`, for
 * typings that omit the class heritage, or `null` if that intersection is unusable.
 */
function elementCheckType(
  checker: ts.TypeChecker,
  checkType: string,
  type: ts.Type,
  elementType: ts.Type,
  hasHTMLElement: boolean,
): string | null {
  // Without DOM declarations, template checks have no `HTMLElement` either.
  if (!hasHTMLElement || hasEventListeners(checker, type)) {
    return checkType;
  }
  // Conflicting members reduce the intersection to `never`, which has no properties.
  return hasEventListeners(checker, elementType) ? `(${checkType}) & HTMLElement` : null;
}

function hasEventListeners(checker: ts.TypeChecker, type: ts.Type): boolean {
  return checker.getPropertyOfType(type, 'addEventListener') !== undefined;
}

/** Finds referenced names that the resolved modules don't export as types. Re-exports count. */
function findMissingExports(
  program: ts.Program,
  resolvedFiles: ReadonlyMap<string, string>,
  referencedNames: ReadonlyMap<string, ReadonlySet<string>>,
): Map<string, Set<string>> {
  const missingExports = new Map<string, Set<string>>();
  const checker = program.getTypeChecker();
  for (const [specifier, resolvedFile] of resolvedFiles) {
    const file = program.getSourceFile(resolvedFile);
    const moduleSymbol = file === undefined ? undefined : checker.getSymbolAtLocation(file);
    const exports = new Map(
      moduleSymbol === undefined
        ? []
        : checker.getExportsOfModule(moduleSymbol).map((symbol) => [symbol.name, symbol]),
    );
    for (const name of referencedNames.get(specifier) ?? []) {
      const exported = exports.get(name);
      const target =
        exported !== undefined && (exported.flags & ts.SymbolFlags.Alias) !== 0
          ? checker.getAliasedSymbol(exported)
          : exported;
      if (target === undefined || (target.flags & ts.SymbolFlags.Type) === 0) {
        let names = missingExports.get(specifier);
        if (names === undefined) {
          names = new Set();
          missingExports.set(specifier, names);
        }
        names.add(name);
      }
    }
  }
  return missingExports;
}

/**
 * Replaces the validated import specifier spans only, leaving string literals in the type alone.
 */
function rewriteImportSpecifiers(
  text: string,
  imports: readonly CheckTypeImport[],
  replacements: ReadonlyMap<string, string>,
): string {
  for (const reference of [...imports].sort((a, b) => b.start - a.start)) {
    const replacement = replacements.get(reference.specifier);
    if (replacement !== undefined) {
      text = text.slice(0, reference.start) + replacement + text.slice(reference.end);
    }
  }
  return text;
}

function resolvedStringLiteralValues(type: ts.Type): string[] | null {
  if (type.isUnion()) {
    const values: string[] = [];
    for (const member of type.types) {
      const memberValues = resolvedStringLiteralValues(member);
      if (memberValues === null) {
        return null;
      }
      values.push(...memberValues);
    }
    return Array.from(new Set(values));
  }
  if (
    (type.flags &
      (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Never | ts.TypeFlags.Void)) !==
    0
  ) {
    return [];
  }
  return type.isStringLiteral() ? [type.value] : null;
}
