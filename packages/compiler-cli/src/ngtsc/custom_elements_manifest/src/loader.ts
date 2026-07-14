/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵCustomElementsManifestAttribute as CustomElementsManifestAttribute,
  ɵCustomElementsManifestPropertyType as CustomElementsManifestPropertyType,
  ɵCustomElementsManifestSchema as CustomElementsManifestSchema,
} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerAdapter} from '../../core/api';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {AbsoluteFsPath, dirname, join, relative} from '../../file_system';
import {resolveModuleName} from '../../util/src/typescript';

import {ManifestWarning, parseCustomElementsManifest} from './manifest_parser';
import {resolveCustomElementsManifest} from './manifest_resolver';

/** Result of loading the manifests configured via the `customElementsManifests` compiler option. */
export interface CustomElementsManifestLoadResult {
  /**
   * Custom element schemas merged across all loaded manifests, or `null` if no manifest
   * yielded any.
   */
  schemas: CustomElementsManifestSchema[] | null;

  /** Diagnostics for manifests that could not be resolved or parsed. */
  diagnostics: ts.Diagnostic[];

  /** Absolute paths of the manifest files that were successfully resolved. */
  manifestPaths: Set<AbsoluteFsPath>;

  /** Paths whose changes can alter manifest resolution or contents. */
  resolutionPaths: Set<AbsoluteFsPath>;
}

/**
 * Resolves, reads and parses the Custom Elements Manifests named by the `customElementsManifests`
 * compiler option, combining their declarations into a single set of `CustomElementsManifestSchema`s.
 *
 * Mirroring runtime `customElements.define` semantics, a tag can only be declared once: when
 * multiple manifests declare the same tag, the first manifest's declaration wins and later
 * ones are skipped with a warning diagnostic.
 */
export function loadCustomElementsManifests(
  entries: readonly string[],
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  typeChecker: ts.TypeChecker,
): CustomElementsManifestLoadResult {
  const diagnostics: ts.Diagnostic[] = [];
  const manifestPaths = new Set<AbsoluteFsPath>();
  const resolutionPaths = new Set<AbsoluteFsPath>();
  const byTag = new Map<string, CustomElementsManifestSchema>();

  for (const entry of entries) {
    const resolution = resolveCustomElementsManifest(
      entry,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
    );
    for (const path of resolution.resolutionPaths) {
      resolutionPaths.add(path);
    }
    if (resolution.kind === 'failure') {
      diagnostics.push(
        makeManifestDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          `Angular compiler option "customElementsManifests" contains an entry '${entry}' that could not ` +
            `be resolved to a Custom Elements Manifest file: ${resolution.reason}`,
        ),
      );
      continue;
    }

    manifestPaths.add(resolution.path);

    // Prefer `readResource` when it's synchronous: in the language service this registers the
    // file with the project so that edits to it are picked up.
    let content: string | undefined = undefined;
    if (adapter.readResource !== undefined) {
      const result = adapter.readResource(resolution.path);
      if (typeof result === 'string') {
        content = result;
      }
    }
    content ??= adapter.readFile(resolution.path);
    if (content === undefined) {
      diagnostics.push(
        makeManifestDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          `Angular compiler option "customElementsManifests": the Custom Elements Manifest ` +
            `'${resolution.path}' could not be read.`,
        ),
      );
      continue;
    }

    const parsed = parseCustomElementsManifest(content, resolution.path, resolution.packageName);
    for (const error of parsed.errors) {
      diagnostics.push(
        makeManifestDiagnostic(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID, error),
      );
    }
    stripUnresolvableCheckTypes(
      parsed.schemas,
      resolution.path,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
      typeChecker,
      resolution.packageName,
      diagnostics,
    );
    for (const warning of parsed.warnings) {
      diagnostics.push(
        makeManifestDiagnostic(
          warningErrorCode(warning),
          warning.message,
          ts.DiagnosticCategory.Warning,
        ),
      );
    }

    for (const schema of parsed.schemas) {
      const existing = byTag.get(schema.tagName);
      if (existing !== undefined) {
        diagnostics.push(
          makeManifestDiagnostic(
            ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG,
            `The custom element tag '${schema.tagName}' declared in '${resolution.path}' was ` +
              `already declared by an earlier manifest in the "customElementsManifests" compiler option. ` +
              `A tag can only be registered once, so the earlier declaration is used and this ` +
              `one is ignored.`,
            ts.DiagnosticCategory.Warning,
          ),
        );
        continue;
      }
      byTag.set(schema.tagName, schema);
    }
  }

  const schemas = byTag.size > 0 ? Array.from(byTag.values()) : null;
  return {schemas, diagnostics, manifestPaths, resolutionPaths};
}

const CHECK_TYPE_SOURCE_PREFIX = 'type __CustomElementsManifestCheckType = (';

interface CheckTypeImportReference {
  specifier: string;
  name: string;
  /** Start of the module specifier contents, excluding quotes, in the original check type. */
  start: number;
  /** End of the module specifier contents, excluding quotes, in the original check type. */
  end: number;
}

interface CheckTypeAnalysis {
  imports: CheckTypeImportReference[];
  bareTypeReferences: Set<string>;
}

interface ResolvedTypeReference {
  type: CustomElementsManifestPropertyType;
  stringLiteralValues: string[] | null;
}

type ResolvedTypeReferences = Map<string, Map<string, ResolvedTypeReference>>;

/**
 * Validates that every `import("...").Name` used by the schemas' check types resolves to an
 * exported TypeScript declaration, and that every bare named type exists in the consuming
 * program's global type scope. Check types that depend on references that don't resolve are
 * stripped.
 *
 * The check types are spliced into generated type-check code, where an unresolvable specifier
 * would surface as a "Cannot find module" error on every affected template binding or element.
 * Manifests routinely carry module paths that were never published (e.g. `src/…` source
 * paths), and users have no way to fix the library, so such references degrade the affected
 * properties, events, and element instances to existence-only checking with a warning
 * (one per unresolvable specifier per manifest) instead.
 */
function stripUnresolvableCheckTypes(
  schemas: CustomElementsManifestSchema[],
  manifestPath: AbsoluteFsPath,
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  typeChecker: ts.TypeChecker,
  packageName: string | null,
  diagnostics: ts.Diagnostic[],
): void {
  const containingFile = join(basePath, 'index.ts');
  const owners: Array<{
    checkType: string;
    set: (value: string) => void;
    strip: () => void;
    attribute?: CustomElementsManifestAttribute;
  }> = [];
  for (const schema of schemas) {
    for (const property of schema.properties) {
      if (property.checkType !== undefined) {
        owners.push({
          checkType: property.checkType,
          set: (value) => (property.checkType = value),
          strip: () => delete property.checkType,
        });
      }
    }
    for (const event of schema.events) {
      if (event.checkType !== undefined) {
        owners.push({
          checkType: event.checkType,
          set: (value) => (event.checkType = value),
          strip: () => delete event.checkType,
        });
      }
    }
    for (const attribute of schema.attributes ?? []) {
      if (attribute.checkType !== undefined) {
        owners.push({
          checkType: attribute.checkType,
          set: (value) => (attribute.checkType = value),
          strip: () => delete attribute.checkType,
          attribute,
        });
      }
    }
    if (schema.instanceCheckType !== undefined) {
      owners.push({
        checkType: schema.instanceCheckType,
        set: (value) => (schema.instanceCheckType = value),
        strip: () => delete schema.instanceCheckType,
      });
    }
  }

  const analyzedOwners = owners.map((owner) => ({
    ...owner,
    analysis: analyzeCheckType(owner.checkType),
  }));
  const referencedNames = new Map<string, Set<string>>();
  const referencedGlobals = new Set<string>();
  for (const {analysis} of analyzedOwners) {
    if (analysis === null) {
      continue;
    }
    for (const reference of analysis.imports) {
      let names = referencedNames.get(reference.specifier);
      if (names === undefined) {
        names = new Set();
        referencedNames.set(reference.specifier, names);
      }
      names.add(reference.name);
    }
    for (const name of analysis.bareTypeReferences) {
      referencedGlobals.add(name);
    }
  }

  const resolvedFiles = new Map<string, string>();
  const replacementSpecifiers = new Map<string, string>();
  const unresolvableSpecifiers = new Set<string>();
  for (const specifier of referencedNames.keys()) {
    // TypeScript-suffixed specifiers are deliberately rejected. Even in configurations that
    // permit them for no-emit programs, Angular cannot assume that a library's unpublished source
    // path is a stable public type entrypoint.
    if (/\.[mc]?tsx?$/.test(specifier)) {
      unresolvableSpecifiers.add(specifier);
      continue;
    }
    let resolved = resolveModuleName(
      specifier,
      containingFile,
      options,
      adapter,
      moduleResolutionCache,
    );
    if (resolved === undefined) {
      const manifestRelativeSpecifier = manifestRelativeModuleSpecifier(
        specifier,
        manifestPath,
        packageName,
        adapter,
      );
      if (manifestRelativeSpecifier !== null) {
        resolved = resolveModuleName(
          manifestRelativeSpecifier,
          containingFile,
          options,
          adapter,
          moduleResolutionCache,
        );
        if (resolved !== undefined) {
          replacementSpecifiers.set(specifier, manifestRelativeSpecifier);
        }
      }
    }
    // The generated `import()` type query needs TypeScript declarations; a resolution that only
    // finds JavaScript provides no trustworthy declared type to check against.
    if (resolved === undefined || !/\.(d\.)?[mc]?tsx?$/.test(resolved.resolvedFileName)) {
      unresolvableSpecifiers.add(specifier);
    } else {
      resolvedFiles.set(specifier, resolved.resolvedFileName);
    }
  }

  const {missingExports, resolvedTypeReferences} = findExportInfo(
    resolvedFiles,
    referencedNames,
    options,
    adapter,
  );
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter(
      (name) => typeChecker.resolveName(name, undefined, ts.SymbolFlags.Type, false) === undefined,
    ),
  );
  const referenceResolves = (specifier: string, name: string): boolean =>
    !unresolvableSpecifiers.has(specifier) && !missingExports.get(specifier)?.has(name);

  for (const owner of analyzedOwners) {
    if (owner.analysis === null) {
      // Check types are emitted into generated TypeScript. If an import type cannot be fully
      // accounted for, fail closed by dropping the check type instead of emitting an import that
      // was never resolved and validated.
      owner.strip();
      continue;
    }
    let shouldStrip = false;
    for (const reference of owner.analysis.imports) {
      if (!referenceResolves(reference.specifier, reference.name)) {
        shouldStrip = true;
        break;
      }
    }
    if (Array.from(owner.analysis.bareTypeReferences).some((name) => missingGlobals.has(name))) {
      shouldStrip = true;
    }
    if (shouldStrip) {
      owner.strip();
      continue;
    }
    if (owner.attribute !== undefined) {
      const typeInfo = resolveCheckTypeInfo(owner.checkType, resolvedTypeReferences);
      owner.attribute.type = typeInfo.type;
      if (typeInfo.stringLiteralValues !== null) {
        owner.attribute.stringLiteralValues = typeInfo.stringLiteralValues;
      }
    }
    owner.set(
      rewriteImportSpecifiers(owner.checkType, owner.analysis.imports, replacementSpecifiers),
    );
  }

  for (const specifier of unresolvableSpecifiers) {
    diagnostics.push(
      makeManifestDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest '${manifestPath}' references types in '${specifier}', ` +
          `which does not resolve to TypeScript declarations. Bindings, static attributes, and ` +
          `events that depend on these types are not type-checked, and affected local references fall back ` +
          `to HTMLElement; other checks are unaffected.`,
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  for (const [specifier, names] of missingExports) {
    diagnostics.push(
      makeManifestDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest '${manifestPath}' references ${formatQuotedList(names)} ` +
          `from '${specifier}', but its TypeScript declarations do not export ` +
          `${
            names.size === 1 ? 'a usable type with that name' : 'usable types with those names'
          }. Bindings, static attributes, and events that ` +
          `depend on these types are not type-checked, and affected local references fall back ` +
          `to HTMLElement; other checks are unaffected.`,
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  if (missingGlobals.size > 0) {
    diagnostics.push(
      makeManifestDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest '${manifestPath}' references ${formatQuotedList(
          missingGlobals,
        )} from 'global:', but the consuming TypeScript program does not declare ${
          missingGlobals.size === 1
            ? 'a usable global type with that name'
            : 'usable global types with those names'
        }. Bindings, static attributes, and events that depend on these types are not type-checked; other ` +
          `checks are unaffected.`,
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
}

/**
 * Returns a fallback module specifier for manifests whose module paths are relative to the
 * manifest file rather than the package root. The package-root interpretation remains primary.
 */
function manifestRelativeModuleSpecifier(
  specifier: string,
  manifestPath: AbsoluteFsPath,
  packageName: string | null,
  adapter: NgCompilerAdapter,
): string | null {
  if (
    packageName === null ||
    (specifier !== packageName && !specifier.startsWith(`${packageName}/`))
  ) {
    return null;
  }
  const packageRoot = findOwningPackageRoot(manifestPath, packageName, adapter);
  if (packageRoot === null) {
    return null;
  }
  const manifestDirectory = relative(packageRoot, dirname(manifestPath)).replace(/\\/g, '/');
  if (manifestDirectory.length === 0) {
    return null;
  }
  return `${packageName}/${manifestDirectory}${specifier.slice(packageName.length)}`;
}

function findOwningPackageRoot(
  manifestPath: AbsoluteFsPath,
  packageName: string,
  adapter: NgCompilerAdapter,
): AbsoluteFsPath | null {
  let directory = dirname(manifestPath);
  while (true) {
    const packageJsonPath = join(directory, 'package.json');
    const content = adapter.fileExists(packageJsonPath) ? adapter.readFile(packageJsonPath) : null;
    if (typeof content === 'string') {
      try {
        if ((JSON.parse(content) as {[key: string]: unknown})['name'] === packageName) {
          return directory;
        }
      } catch {
        // Keep walking in case this is a nested package with a malformed package.json.
      }
    }
    const parent = dirname(directory);
    if (parent === directory) {
      return null;
    }
    directory = parent;
  }
}

/**
 * Parses a validated check type and returns only actual import type nodes and unqualified named
 * types. In particular, import-like text inside a string literal must remain documentation data,
 * not become a module-resolution request or a rewrite target.
 */
export function analyzeCheckType(checkType: string): CheckTypeAnalysis | null {
  const source = ts.createSourceFile(
    'custom-elements-manifest-check-type.ts',
    `${CHECK_TYPE_SOURCE_PREFIX}${checkType});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const imports: CheckTypeImportReference[] = [];
  const bareTypeReferences = new Set<string>();
  let hasUnaccountableImport = false;
  const visit = (node: ts.Node): void => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      bareTypeReferences.add(node.typeName.text);
    }
    if (ts.isImportTypeNode(node)) {
      if (
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal) &&
        node.qualifier !== undefined &&
        ts.isIdentifier(node.qualifier)
      ) {
        const literal = node.argument.literal;
        const start = literal.getStart(source) + 1 - CHECK_TYPE_SOURCE_PREFIX.length;
        const end = literal.getEnd() - 1 - CHECK_TYPE_SOURCE_PREFIX.length;
        if (start >= 0 && end <= checkType.length && checkType.slice(start, end) === literal.text) {
          imports.push({specifier: literal.text, name: node.qualifier.text, start, end});
        } else {
          hasUnaccountableImport = true;
        }
      } else {
        hasUnaccountableImport = true;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return hasUnaccountableImport ? null : {imports, bareTypeReferences};
}

/** Rewrites only the module-specifier spans belonging to actual import type nodes. */
function rewriteImportSpecifiers(
  checkType: string,
  imports: readonly CheckTypeImportReference[],
  replacements: Map<string, string>,
): string {
  const edits = imports
    .map((reference) => ({...reference, replacement: replacements.get(reference.specifier)}))
    .filter(
      (reference): reference is CheckTypeImportReference & {replacement: string} =>
        reference.replacement !== undefined,
    )
    .sort((a, b) => b.start - a.start);
  let rewritten = checkType;
  for (const {start, end, replacement} of edits) {
    rewritten = rewritten.slice(0, start) + replacement + rewritten.slice(end);
  }
  return rewritten;
}

/** Validates referenced exports and records primitive/literal information from usable types. */
function findExportInfo(
  resolvedFiles: Map<string, string>,
  referencedNames: Map<string, Set<string>>,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
): {missingExports: Map<string, Set<string>>; resolvedTypeReferences: ResolvedTypeReferences} {
  if (resolvedFiles.size === 0) {
    return {missingExports: new Map(), resolvedTypeReferences: new Map()};
  }
  const programOptions: ts.CompilerOptions = {
    ...options,
    noEmit: true,
    noLib: true,
    skipLibCheck: true,
    types: [],
  };
  const host: ts.CompilerHost = {
    fileExists: adapter.fileExists.bind(adapter),
    readFile: adapter.readFile.bind(adapter),
    getSourceFile: (fileName, languageVersion) => {
      const existing = adapter.getSourceFile(fileName, languageVersion);
      if (existing !== undefined) {
        return existing;
      }
      const content = adapter.readFile(fileName);
      return content === undefined
        ? undefined
        : ts.createSourceFile(fileName, content, languageVersion, true);
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    writeFile: () => undefined,
    getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
    getCanonicalFileName: adapter.getCanonicalFileName.bind(adapter),
    useCaseSensitiveFileNames: () =>
      typeof adapter.useCaseSensitiveFileNames === 'function'
        ? adapter.useCaseSensitiveFileNames()
        : (adapter.useCaseSensitiveFileNames ?? true),
    getNewLine: () => '\n',
    ...(adapter.directoryExists !== undefined
      ? {directoryExists: adapter.directoryExists.bind(adapter)}
      : {}),
    ...(adapter.getDirectories !== undefined
      ? {getDirectories: adapter.getDirectories.bind(adapter)}
      : {}),
    ...(adapter.realpath !== undefined ? {realpath: adapter.realpath.bind(adapter)} : {}),
  };
  if (adapter.resolveModuleNames !== undefined) {
    host.resolveModuleNames = adapter.resolveModuleNames.bind(adapter);
  }
  const program = ts.createProgram({
    rootNames: Array.from(new Set(resolvedFiles.values())),
    options: programOptions,
    host,
  });
  const checker = program.getTypeChecker();
  const missingExports = new Map<string, Set<string>>();
  const resolvedTypeReferences: ResolvedTypeReferences = new Map();
  for (const [specifier, resolvedFile] of resolvedFiles) {
    const sourceFile = program.getSourceFile(resolvedFile);
    const moduleSymbol =
      sourceFile === undefined ? undefined : checker.getSymbolAtLocation(sourceFile);
    const exports = new Map<string, ts.Symbol>();
    if (moduleSymbol !== undefined) {
      for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
        exports.set(symbol.name, symbol);
      }
    }
    for (const name of referencedNames.get(specifier) ?? []) {
      const exportedSymbol = exports.get(name);
      const targetSymbol =
        exportedSymbol !== undefined && (exportedSymbol.flags & ts.SymbolFlags.Alias) !== 0
          ? checker.getAliasedSymbol(exportedSymbol)
          : exportedSymbol;
      if (targetSymbol === undefined || (targetSymbol.flags & ts.SymbolFlags.Type) === 0) {
        let names = missingExports.get(specifier);
        if (names === undefined) {
          names = new Set();
          missingExports.set(specifier, names);
        }
        names.add(name);
        continue;
      }
      let types = resolvedTypeReferences.get(specifier);
      if (types === undefined) {
        types = new Map();
        resolvedTypeReferences.set(specifier, types);
      }
      types.set(name, resolvedTypeReference(checker.getDeclaredTypeOfSymbol(targetSymbol)));
    }
  }
  return {missingExports, resolvedTypeReferences};
}

function resolvedTypeReference(type: ts.Type): ResolvedTypeReference {
  const categories = new Set<CustomElementsManifestPropertyType>();
  collectResolvedTypeCategories(type, categories);
  return {
    type: categories.size === 1 ? categories.values().next().value! : 'object',
    stringLiteralValues: resolvedStringLiteralValues(type),
  };
}

function collectResolvedTypeCategories(
  type: ts.Type,
  categories: Set<CustomElementsManifestPropertyType>,
): void {
  if (type.isUnionOrIntersection()) {
    for (const member of type.types) {
      collectResolvedTypeCategories(member, categories);
    }
  } else if ((type.flags & ts.TypeFlags.StringLike) !== 0) {
    categories.add('string');
  } else if ((type.flags & ts.TypeFlags.NumberLike) !== 0) {
    categories.add('number');
  } else if ((type.flags & ts.TypeFlags.BooleanLike) !== 0) {
    categories.add('boolean');
  } else if (
    (type.flags &
      (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Never | ts.TypeFlags.Void)) ===
    0
  ) {
    categories.add('object');
  }
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

function resolveCheckTypeInfo(
  checkType: string,
  resolvedTypes: ResolvedTypeReferences,
): ResolvedTypeReference {
  const source = ts.createSourceFile(
    'custom-elements-manifest-resolved-type.ts',
    `${CHECK_TYPE_SOURCE_PREFIX}${checkType});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const declaration = source.statements[0];
  if (!ts.isTypeAliasDeclaration(declaration)) {
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
      const resolved = resolvedTypes.get(node.argument.literal.text)?.get(node.qualifier.text);
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

function formatQuotedList(values: Set<string>): string {
  return Array.from(values, (value) => `'${value}'`).join(values.size === 2 ? ' and ' : ', ');
}

function warningErrorCode(warning: ManifestWarning): ErrorCode {
  switch (warning.kind) {
    case 'invalidTagName':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME;
    case 'duplicateTag':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG;
  }
}

function makeManifestDiagnostic(
  code: ErrorCode,
  messageText: string,
  category: ts.DiagnosticCategory = ts.DiagnosticCategory.Error,
): ts.Diagnostic {
  return {
    category,
    code: ngErrorCode(code),
    file: undefined,
    start: undefined,
    length: undefined,
    messageText,
  };
}
