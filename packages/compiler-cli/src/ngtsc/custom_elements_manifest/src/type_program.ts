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

/** Result of checking one complete type expression in the consumer's type environment. */
export interface ResolvedCheckType {
  checkType: string;
  stringLiteralValues: string[] | null;
  errors: readonly ts.Diagnostic[];
}

/** Validates exports and complete type expressions before generating public schemas. */
export function inspectTypes(
  resolvedFiles: ReadonlyMap<string, string>,
  referencedNames: ReadonlyMap<string, ReadonlySet<string>>,
  checkTypes: ReadonlySet<ManifestCheckType>,
  replacements: ReadonlyMap<string, string>,
  {environment, dependencies: {cacheDependencyPaths}}: ManifestLoadContext,
): {
  missingExports: Map<string, Set<string>>;
  checkedTypes: Array<ResolvedCheckType & {analysis: ManifestCheckType}>;
} {
  if (checkTypes.size === 0) {
    return {missingExports: new Map(), checkedTypes: []};
  }
  const records = new Map(
    Array.from(checkTypes, (analysis, index) => [
      `__CemType${index}`,
      {
        analysis,
        checkType: rewriteImportSpecifiers(analysis.checkType, analysis.imports, replacements),
      },
    ]),
  );
  const source = ts.createSourceFile(
    join(environment.basePath, '__ng_custom_elements_manifest_types__.ts'),
    Array.from(records, ([name, {checkType}]) => `export type ${name} = (${checkType});`).join(
      '\n',
    ),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  // Every non-keyword identifier requires a reference in computeCheckType. Types without
  // references therefore need no library or ambient declarations for semantic validation.
  const needsEnvironment = Array.from(checkTypes).some(
    (type) => type.imports.length > 0 || type.globals.length > 0,
  );
  const rootNames = new Set([
    ...resolvedFiles.values(),
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
  const checkedTypes: Array<ResolvedCheckType & {analysis: ManifestCheckType}> = [];
  for (const statement of source.statements) {
    // Syntax validation guarantees exactly one alias per record; fail on an internal mismatch.
    const record = ts.isTypeAliasDeclaration(statement)
      ? records.get(statement.name.text)
      : undefined;
    if (record === undefined || !ts.isTypeAliasDeclaration(statement)) {
      throw new Error('Unexpected declaration in the manifest type-checking source.');
    }
    checkedTypes.push({
      ...record,
      errors: diagnostics.filter(
        (diagnostic) =>
          diagnostic.start !== undefined &&
          diagnostic.start >= statement.pos &&
          diagnostic.start < statement.end,
      ),
      stringLiteralValues: resolvedStringLiteralValues(checker.getTypeFromTypeNode(statement.type)),
    });
  }
  return {
    missingExports: findMissingExports(program, resolvedFiles, referencedNames),
    checkedTypes,
  };
}

/** Confirms exact exported type names, including re-exports. */
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

/** Rewrite only validated import specifier spans, leaving literal type contents unchanged. */
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
