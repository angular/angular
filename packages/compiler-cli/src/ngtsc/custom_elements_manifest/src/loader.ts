/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵCustomElementsManifestAttribute as CustomElementsManifestAttribute,
  ɵCustomElementsManifestIndex as CustomElementsManifestIndex,
  ɵCustomElementsManifestSchema as CustomElementsManifestSchema,
} from '@angular/compiler';
import ts from 'typescript';

import {CustomElementsManifestCache, NgCompilerAdapter} from '../../core/api';
import {ErrorCode, makeConfigDiagnostic} from '../../diagnostics';
import {
  absoluteFrom,
  absoluteFromSourceFile,
  AbsoluteFsPath,
  dirname,
  join,
  relative,
} from '../../file_system';
import {resolveModuleName} from '../../util/src/typescript';

import {CheckTypeAnalysis, CheckTypeImport} from './check_type';
import {ManifestWarning, parseCustomElementsManifest} from './manifest_parser';
import {findOwningPackageJson, resolveCustomElementsManifest} from './manifest_resolver';
import {analyzeTypeText} from './type_text';

/** Matches TypeScript source and declaration file names, including `.mts`/`.cts` variants. */
const TYPESCRIPT_FILE = /\.(?:d\.)?[cm]?tsx?$/;
/** Matches module specifiers with TypeScript source extensions. */
const TYPESCRIPT_SPECIFIER = /\.[mc]?tsx?$/;

/**
 * Controls manifest warnings. The default, `'summary'`, groups warnings of the same kind per
 * manifest with a count and examples. `'verbose'` reports each declaration or reference.
 */
export type CustomElementsManifestsDiagnosticsMode = 'summary' | 'verbose';

/** Result of loading the manifests configured via the `customElementsManifests` compiler option. */
export interface CustomElementsManifestLoadResult {
  /**
   * Custom elements declared across all loaded manifests, or `null` if no manifest yielded any.
   */
  index: CustomElementsManifestIndex | null;

  /** Diagnostics for manifests that could not be resolved or parsed. */
  diagnostics: ts.Diagnostic[];

  /** Paths whose changes can alter manifest resolution or contents. */
  resolutionPaths: Set<AbsoluteFsPath>;
}

/** Per-load inputs shared by the resolution and check-type validation steps. */
interface ManifestLoadContext {
  basePath: AbsoluteFsPath;
  options: ts.CompilerOptions;
  adapter: NgCompilerAdapter;
  moduleResolutionCache: ts.ModuleResolutionCache | null;
  typeChecker: ts.TypeChecker;
  programTypeEnvironment: ProgramTypeEnvironment;
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode;
  diagnostics: ts.Diagnostic[];
  /** Absolute paths of the manifest files that were successfully resolved. */
  manifestPaths: Set<AbsoluteFsPath>;
  /** Files consulted while validating check types, snapshotted by the cross-compiler cache. */
  cacheDependencyPaths: Set<AbsoluteFsPath>;
  /** Global type names referenced by check types and whether the program declares them. */
  globalTypeAvailability: Map<string, boolean>;
}

/**
 * Loads the configured manifests and combines their element schemas. The first declaration of a
 * tag wins. Later declarations produce a warning and are skipped.
 */
export function loadCustomElementsManifests(
  entries: readonly string[],
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  program: ts.Program,
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode = 'summary',
  cache: CustomElementsManifestCache | null = null,
): CustomElementsManifestLoadResult {
  // Custom resolvers do not expose all resolution dependencies, so their results cannot be cached.
  cache = adapter.resolveModuleNames === undefined ? cache : null;
  const typeChecker = program.getTypeChecker();
  const programTypeEnvironment = inspectProgramTypeEnvironment(program);
  const cacheKey = computeCacheKey(
    entries,
    basePath,
    options,
    diagnosticsMode,
    programTypeEnvironment,
  );
  const cached = readValidCacheEntry(cache, cacheKey, adapter, typeChecker);
  if (cached !== null) {
    return cached;
  }

  const load: ManifestLoadContext = {
    basePath,
    options,
    adapter,
    moduleResolutionCache,
    typeChecker,
    programTypeEnvironment,
    diagnosticsMode,
    diagnostics: [],
    manifestPaths: new Set(),
    cacheDependencyPaths: new Set(),
    globalTypeAvailability: new Map(),
  };
  const {diagnostics} = load;
  const resolutionPaths = new Set<AbsoluteFsPath>();
  /** The first declaration of each tag and its manifest label for duplicate diagnostics. */
  const byTag = new Map<string, {schema: CustomElementsManifestSchema; manifestLabel: string}>();

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
        makeConfigDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          `Angular compiler option "customElementsManifests" contains an entry '${entry}' that could not ` +
            `be resolved to a Custom Elements Manifest file: ${resolution.reason}`,
        ),
      );
      continue;
    }

    load.manifestPaths.add(resolution.path);

    // Include the configured entry in diagnostics so users can find it in their tsconfig.
    const manifestLabel =
      entry === resolution.path ? `'${resolution.path}'` : `'${entry}' ('${resolution.path}')`;

    // A synchronous `readResource` also registers the file for language-service updates.
    let content: string | undefined = undefined;
    if (adapter.readResource !== undefined) {
      const result = adapter.readResource(resolution.path);
      if (typeof result === 'string') {
        content = result;
      }
    }
    content ??= adapter.readFile(resolution.path);
    // The manifest may be deleted between resolution and reading. Language-service hosts return
    // an empty string for missing resources. Report NG4007 for a missing file and NG4008 for an
    // existing empty file.
    if (content === '' && !adapter.fileExists(resolution.path)) {
      content = undefined;
    }
    if (content === undefined) {
      diagnostics.push(
        makeConfigDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          `Angular compiler option "customElementsManifests": the Custom Elements Manifest ` +
            `${manifestLabel} could not be read.`,
        ),
      );
      continue;
    }

    const parsed = parseCustomElementsManifest(content, manifestLabel, resolution.packageName);
    for (const error of parsed.errors) {
      diagnostics.push(
        makeConfigDiagnostic(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID, error),
      );
    }
    stripUnresolvableCheckTypes(
      parsed.schemas,
      parsed.checkTypeAnalyses,
      resolution.path,
      manifestLabel,
      resolution.packageName,
      load,
    );
    emitDeclarationWarnings(manifestLabel, parsed.warnings, load);

    const crossManifestDuplicates: Array<{tagName: string; winnerManifestLabel: string}> = [];
    for (const schema of parsed.schemas) {
      const winner = byTag.get(schema.tagName);
      if (winner !== undefined) {
        crossManifestDuplicates.push({
          tagName: schema.tagName,
          winnerManifestLabel: winner.manifestLabel,
        });
        continue;
      }
      byTag.set(schema.tagName, {schema, manifestLabel});
    }
    if (diagnosticsMode === 'verbose' || crossManifestDuplicates.length === 1) {
      for (const {tagName, winnerManifestLabel} of crossManifestDuplicates) {
        diagnostics.push(
          makeConfigDiagnostic(
            ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG,
            `The custom element tag '${tagName}' declared in ${manifestLabel} was ` +
              `already declared by ${winnerManifestLabel}, an earlier configured entry in the ` +
              `"customElementsManifests" compiler option. A tag can only be registered once, ` +
              `so the declaration from ${winnerManifestLabel} is retained and the declaration ` +
              `from ${manifestLabel} is ignored.`,
            ts.DiagnosticCategory.Warning,
          ),
        );
      }
    } else if (crossManifestDuplicates.length > 1) {
      const example = crossManifestDuplicates[0];
      diagnostics.push(
        makeConfigDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG,
          `${crossManifestDuplicates.length} custom element tags declared in ${manifestLabel} ` +
            `(e.g. '${example.tagName}', retained from ${example.winnerManifestLabel}) were ` +
            `already declared by earlier configured entries in the "customElementsManifests" ` +
            `compiler option. A tag can only be registered once, so the earlier declarations ` +
            `are retained and the declarations from ${manifestLabel} are ignored. ` +
            VERBOSE_HINT,
          ts.DiagnosticCategory.Warning,
        ),
      );
    }
  }

  const result: CustomElementsManifestLoadResult = {
    index:
      byTag.size > 0
        ? new CustomElementsManifestIndex(Array.from(byTag.values(), ({schema}) => schema))
        : null,
    diagnostics,
    resolutionPaths,
  };
  storeCacheEntry(cache, cacheKey, result, load);
  return result;
}

/**
 * Cached load result and its file dependencies. `fileContents` stores `null` for missing files
 * and includes resolution lookups and transitive declarations. Manifest and TypeScript reads
 * include unsaved editor changes. Each new program rechecks global type availability.
 * Only the loader mutates schemas, so compiler instances can share the cached result.
 */
interface ManifestCacheEntry {
  key: string;
  fileContents: Map<AbsoluteFsPath, string | null>;
  /** Manifest files among `fileContents`, which are re-read through `readResource`. */
  manifestPaths: Set<AbsoluteFsPath>;
  globalTypeAvailability: Map<string, boolean>;
  result: CustomElementsManifestLoadResult;
}

/**
 * Configuration used in the cache key. Entry order determines which duplicate tag wins.
 * Includes the diagnostics mode and options that affect module resolution or global types.
 */
// Keep this aligned with TypeScript's module-resolution-affecting option declarations. The final
// entries also affect source selection or the consuming program's global type scope.
const CACHE_RELEVANT_COMPILER_OPTIONS = [
  'target',
  'module',
  'checkJs',
  'jsx',
  'moduleResolution',
  'baseUrl',
  'paths',
  'rootDirs',
  'typeRoots',
  'moduleSuffixes',
  'resolvePackageJsonExports',
  'resolvePackageJsonImports',
  'customConditions',
  'jsxImportSource',
  'resolveJsonModule',
  'noResolve',
  'forceConsistentCasingInFileNames',
  'maxNodeModuleJsDepth',
  'moduleDetection',
  'preserveSymlinks',
  'allowArbitraryExtensions',
  'allowJs',
  'lib',
  'types',
  'noLib',
] as const satisfies ReadonlyArray<keyof ts.CompilerOptions>;

function computeCacheKey(
  entries: readonly string[],
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode,
  programTypeEnvironment: ProgramTypeEnvironment,
): string {
  return JSON.stringify([
    entries,
    basePath,
    diagnosticsMode,
    programTypeEnvironment,
    CACHE_RELEVANT_COMPILER_OPTIONS.map((name) => [name, options[name] ?? null]),
  ]);
}

function readValidCacheEntry(
  cache: CustomElementsManifestCache | null,
  cacheKey: string,
  adapter: NgCompilerAdapter,
  typeChecker: ts.TypeChecker,
): CustomElementsManifestLoadResult | null {
  const entry = cache?.entry as ManifestCacheEntry | null | undefined;
  if (entry == null || entry.key !== cacheKey) {
    return null;
  }
  for (const [path, cachedContent] of entry.fileContents) {
    if (readCurrentContent(adapter, path, entry.manifestPaths.has(path)) !== cachedContent) {
      return null;
    }
  }
  for (const [name, wasAvailable] of entry.globalTypeAvailability) {
    if (globalTypeIsAvailable(typeChecker, name) !== wasAvailable) {
      return null;
    }
  }
  return entry.result;
}

function storeCacheEntry(
  cache: CustomElementsManifestCache | null,
  cacheKey: string,
  result: CustomElementsManifestLoadResult,
  {adapter, manifestPaths, cacheDependencyPaths, globalTypeAvailability}: ManifestLoadContext,
): void {
  if (cache === null) {
    return;
  }
  const fileContents = new Map<AbsoluteFsPath, string | null>();
  for (const path of result.resolutionPaths) {
    fileContents.set(path, readCurrentContent(adapter, path, manifestPaths.has(path)));
  }
  for (const path of cacheDependencyPaths) {
    if (!fileContents.has(path)) {
      fileContents.set(path, readCurrentContent(adapter, path, /* isManifest */ false));
    }
  }
  cache.entry = {
    key: cacheKey,
    fileContents,
    manifestPaths,
    globalTypeAvailability,
    result,
  } satisfies ManifestCacheEntry;
}

/**
 * Reads cache dependencies from the same sources used during loading. Uses `readResource` for
 * manifests, the current program for TypeScript files, and `readFile` for other files.
 */
function readCurrentContent(
  adapter: NgCompilerAdapter,
  path: AbsoluteFsPath,
  isManifest: boolean,
): string | null {
  if (isManifest && adapter.readResource !== undefined) {
    const result = adapter.readResource(path);
    if (typeof result === 'string') {
      // Distinguish a missing file from an empty file so the cache preserves NG4007/NG4008 diagnostics.
      return result === '' && !adapter.fileExists(path) ? null : result;
    }
  }
  if (TYPESCRIPT_FILE.test(path)) {
    const sourceFile = adapter.getSourceFile(path, ts.ScriptTarget.Latest);
    if (sourceFile !== undefined) {
      return sourceFile.text;
    }
  }
  return adapter.fileExists(path) ? (adapter.readFile(path) ?? null) : null;
}

function globalTypeIsAvailable(typeChecker: ts.TypeChecker, name: string): boolean {
  return typeChecker.resolveName(name, undefined, ts.SymbolFlags.Type, false) !== undefined;
}

interface ProgramTypeEnvironment {
  /** Whether TypeScript loaded at least one of the program's configured default library files. */
  hasDefaultLibrary: boolean;

  /** Whether the program is a project-references root with no source files of its own. */
  isSolutionStyleRoot: boolean;
}

/**
 * Checks program structure to explain missing global types. A program without default libraries
 * and a solution-style root can lack the same symbols but need different diagnostic guidance.
 */
function inspectProgramTypeEnvironment(program: ts.Program): ProgramTypeEnvironment {
  return {
    hasDefaultLibrary: program
      .getSourceFiles()
      .some((sourceFile) => program.isSourceFileDefaultLibrary(sourceFile)),
    isSolutionStyleRoot:
      program.getRootFileNames().length === 0 && (program.getProjectReferences()?.length ?? 0) > 0,
  };
}

/**
 * Per module specifier and exported name: the string literal values of the resolved type, or
 * `null` when it is not a string literal union.
 */
type ResolvedTypeReferences = Map<string, Map<string, string[] | null>>;

/** A schema entry and the check-type field the loader may rewrite or remove. */
interface CheckTypeOwner {
  holder: {checkType?: string; instanceCheckType?: string};
  key: 'checkType' | 'instanceCheckType';
  checkType: string;
  /** The attribute that receives resolved literal values, or `null` for other schema entries. */
  attribute: CustomElementsManifestAttribute | null;
}

function collectCheckTypeOwners(
  schemas: readonly CustomElementsManifestSchema[],
): CheckTypeOwner[] {
  const owners: CheckTypeOwner[] = [];
  for (const schema of schemas) {
    for (const member of [...schema.properties, ...schema.events]) {
      if (member.checkType !== undefined) {
        owners.push({
          holder: member,
          key: 'checkType',
          checkType: member.checkType,
          attribute: null,
        });
      }
    }
    for (const attribute of schema.attributes) {
      if (attribute.checkType !== undefined) {
        owners.push({
          holder: attribute,
          key: 'checkType',
          checkType: attribute.checkType,
          attribute,
        });
      }
    }
    if (schema.instanceCheckType !== undefined) {
      owners.push({
        holder: schema,
        key: 'instanceCheckType',
        checkType: schema.instanceCheckType,
        attribute: null,
      });
    }
  }
  return owners;
}

/**
 * Validates imported types against exported TypeScript declarations and global types against the
 * consuming program. Removes check types with unresolved references and reports a configuration
 * warning. This prevents generated imports from causing errors on template bindings.
 * Affected bindings retain schema checks. Affected element references use `HTMLElement`.
 */
function stripUnresolvableCheckTypes(
  schemas: CustomElementsManifestSchema[],
  checkTypeAnalyses: ReadonlyMap<string, CheckTypeAnalysis>,
  manifestPath: AbsoluteFsPath,
  manifestLabel: string,
  packageName: string | null,
  load: ManifestLoadContext,
): void {
  const {basePath, adapter, typeChecker, programTypeEnvironment, diagnosticsMode, diagnostics} =
    load;
  const containingFile = join(basePath, 'index.ts');
  const owners = collectCheckTypeOwners(schemas);
  const referencedNames = new Map<string, Set<string>>();
  const referencedGlobals = new Set<string>();
  for (const owner of owners) {
    const analysis = checkTypeAnalyses.get(owner.checkType);
    if (analysis === undefined) {
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
    for (const name of analysis.globals) {
      referencedGlobals.add(name);
    }
  }

  const resolvedFiles = new Map<string, string>();
  const replacementSpecifiers = new Map<string, string>();
  const unresolvableSpecifiers = new Set<string>();
  for (const specifier of referencedNames.keys()) {
    // Reject TypeScript source specifiers because libraries may not publish those files,
    // even when the consuming program allows TypeScript extensions in imports.
    if (TYPESCRIPT_SPECIFIER.test(specifier)) {
      unresolvableSpecifiers.add(specifier);
      continue;
    }
    let resolved = resolveTypeReferenceModuleName(specifier, containingFile, load);
    if (resolved === undefined) {
      const manifestRelativeSpecifier = manifestRelativeModuleSpecifier(
        specifier,
        manifestPath,
        packageName,
        load,
      );
      if (manifestRelativeSpecifier !== null) {
        resolved = resolveTypeReferenceModuleName(manifestRelativeSpecifier, containingFile, load);
        if (resolved !== undefined) {
          replacementSpecifiers.set(specifier, manifestRelativeSpecifier);
        }
      }
    }
    // The generated `import()` type requires TypeScript declarations. JavaScript alone is insufficient.
    if (resolved === undefined || !TYPESCRIPT_FILE.test(resolved.resolvedFileName)) {
      unresolvableSpecifiers.add(specifier);
    } else {
      resolvedFiles.set(specifier, resolved.resolvedFileName);
    }
  }

  const {missingExports, resolvedTypeReferences, requiredTypeParameters} = findExportInfo(
    resolvedFiles,
    referencedNames,
    load,
  );
  for (const name of referencedGlobals) {
    load.globalTypeAvailability.set(name, globalTypeIsAvailable(typeChecker, name));
  }
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter((name) => !load.globalTypeAvailability.get(name)),
  );
  const referenceResolves = (specifier: string, name: string): boolean =>
    !unresolvableSpecifiers.has(specifier) && !missingExports.get(specifier)?.has(name);
  const genericInstanceTypes = new Set<string>();

  for (const owner of owners) {
    // Remove check types unless all references have been validated for generated TypeScript.
    const analysis = checkTypeAnalyses.get(owner.checkType);
    if (
      analysis === undefined ||
      analysis.imports.some(
        (reference) => !referenceResolves(reference.specifier, reference.name),
      ) ||
      analysis.globals.some((name) => missingGlobals.has(name))
    ) {
      delete owner.holder[owner.key];
      continue;
    }
    if (owner.key === 'instanceCheckType') {
      const genericReferences = analysis.imports.filter((reference) =>
        requiredTypeParameters.get(reference.specifier)?.has(reference.name),
      );
      if (genericReferences.length > 0) {
        // A tag provides no class type arguments. Omit the generic instance type and retain member checks.
        delete owner.holder.instanceCheckType;
        for (const {specifier, name} of genericReferences) {
          genericInstanceTypes.add(`import("${specifier}").${name}`);
        }
        continue;
      }
    }
    if (owner.attribute !== null) {
      const stringLiteralValues = analyzeTypeText(owner.checkType, (specifier, name) =>
        resolvedTypeReferences.get(specifier)?.get(name),
      );
      if (stringLiteralValues !== null) {
        owner.attribute.stringLiteralValues = stringLiteralValues;
      }
    }
    owner.holder[owner.key] = rewriteImportSpecifiers(
      owner.checkType,
      analysis.imports,
      replacementSpecifiers,
    );
  }

  if (genericInstanceTypes.size > 0) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references element instance types ` +
          `${formatQuotedList(genericInstanceTypes)} that require type arguments. ` +
          `Affected local references fall back to HTMLElement; other checks are unaffected.`,
        ts.DiagnosticCategory.Warning,
      ),
    );
  }

  // Group problems by unresolved module, module with missing exports, or missing globals.
  // Keep the detailed message for one group. Summarize multiple groups per manifest.
  const groupCount =
    unresolvableSpecifiers.size + missingExports.size + (missingGlobals.size > 0 ? 1 : 0);
  if (diagnosticsMode === 'summary' && groupCount > 1) {
    const parts: string[] = [];
    if (unresolvableSpecifiers.size > 0) {
      parts.push(
        `${unresolvableSpecifiers.size} module specifier${
          unresolvableSpecifiers.size === 1 ? '' : 's'
        } that do not resolve to TypeScript declarations`,
      );
    }
    if (missingExports.size > 0) {
      parts.push(
        `${missingExports.size} module${
          missingExports.size === 1 ? '' : 's'
        } whose declarations are missing referenced types`,
      );
    }
    if (missingGlobals.size > 0) {
      parts.push(
        `${missingGlobals.size} global type name${
          missingGlobals.size === 1 ? '' : 's'
        } not declared by the consuming program`,
      );
    }
    const examples = [...unresolvableSpecifiers, ...missingExports.keys(), ...missingGlobals];
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} has unusable type references: ` +
          `${parts.join(', ')} (e.g. ${formatExamples(examples)}).` +
          missingGlobalProgramHint(missingGlobals, programTypeEnvironment) +
          ` ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true) +
          ` ` +
          VERBOSE_HINT,
        ts.DiagnosticCategory.Warning,
      ),
    );
    return;
  }

  for (const specifier of unresolvableSpecifiers) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references types in '${specifier}', ` +
          `which does not resolve to TypeScript declarations. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  for (const [specifier, names] of missingExports) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references ${formatQuotedList(names)} ` +
          `from '${specifier}', but its TypeScript declarations do not export ` +
          `${
            names.size === 1 ? 'a usable type with that name' : 'usable types with those names'
          }. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  if (missingGlobals.size > 0) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references ${formatQuotedList(
          missingGlobals,
        )} from 'global:', but the consuming TypeScript program does not declare ${
          missingGlobals.size === 1
            ? 'a usable global type with that name'
            : 'usable global types with those names'
        }.` +
          missingGlobalProgramHint(missingGlobals, programTypeEnvironment) +
          ` ` +
          // Global type references do not affect element instance types.
          checkTypeFallbackEffect(/* affectsLocalReferences */ false),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
}

/**
 * Explains missing globals using the program structure. Recommends an application tsconfig for
 * solution-style roots and checking library options for programs without default libraries.
 */
function missingGlobalProgramHint(
  missingGlobals: ReadonlySet<string>,
  environment: ProgramTypeEnvironment,
): string {
  if (missingGlobals.size === 0) {
    return '';
  }
  if (environment.isSolutionStyleRoot) {
    return SOLUTION_STYLE_PROGRAM_HINT;
  }
  if (!environment.hasDefaultLibrary) {
    return NO_DEFAULT_LIBRARY_PROGRAM_HINT;
  }
  return '';
}

const SOLUTION_STYLE_PROGRAM_HINT =
  ` The compiler is analyzing a solution-style tsconfig with no root files. Build with the ` +
  `application tsconfig (for example tsconfig.app.json, as 'ng build' does) instead.`;

const NO_DEFAULT_LIBRARY_PROGRAM_HINT =
  ` No TypeScript default library files are loaded in this program. Verify that its "lib" and ` +
  `"noLib" compiler options are intentional.`;

type ResolvedModuleWithDependencies = ts.ResolvedModuleWithFailedLookupLocations & {
  readonly affectingLocations?: readonly string[];
  readonly failedLookupLocations?: readonly string[];
};

/** Resolves a check-type import and records the file lookups that affect resolution. */
function resolveTypeReferenceModuleName(
  moduleName: string,
  containingFile: string,
  {adapter, options, moduleResolutionCache, cacheDependencyPaths}: ManifestLoadContext,
): ts.ResolvedModule | undefined {
  if (adapter.resolveModuleNames !== undefined) {
    // Custom resolvers do not expose dependencies. Their results are not cached across compilers.
    return resolveModuleName(moduleName, containingFile, options, adapter, moduleResolutionCache);
  }
  const resolution = ts.resolveModuleName(
    moduleName,
    containingFile,
    options,
    adapter,
    moduleResolutionCache ?? undefined,
  ) as ResolvedModuleWithDependencies;
  for (const path of resolution.affectingLocations ?? []) {
    cacheDependencyPaths.add(absoluteFrom(path));
  }
  for (const path of resolution.failedLookupLocations ?? []) {
    cacheDependencyPaths.add(absoluteFrom(path));
  }
  if (resolution.resolvedModule !== undefined) {
    cacheDependencyPaths.add(absoluteFrom(resolution.resolvedModule.resolvedFileName));
  }
  return resolution.resolvedModule;
}

/** Describes the checks disabled by an NG4011 warning. */
function checkTypeFallbackEffect(affectsLocalReferences: boolean): string {
  return (
    `Bindings, static attributes, and events that depend on these types are not type-checked` +
    (affectsLocalReferences ? `, and affected local references fall back to HTMLElement` : ``) +
    `; other checks are unaffected.`
  );
}

/** Explains how to expand summarized warnings. */
const VERBOSE_HINT =
  'This summary can be expanded using the `customElementsManifestsDiagnostics = "verbose"` ' +
  'compiler option.';

/** Quotes up to three example values for a summarized diagnostic. */
function formatExamples(values: readonly string[]): string {
  return values
    .slice(0, 3)
    .map((value) => `'${value}'`)
    .join(', ');
}

/**
 * Reports the parser's per-declaration warnings, folding same-kind warnings for one manifest
 * into a single summary diagnostic unless verbose reporting was requested.
 */
function emitDeclarationWarnings(
  manifestLabel: string,
  warnings: readonly ManifestWarning[],
  {diagnosticsMode, diagnostics}: ManifestLoadContext,
): void {
  const groups = new Map<ManifestWarning['kind'], ManifestWarning[]>();
  for (const warning of warnings) {
    let group = groups.get(warning.kind);
    if (group === undefined) {
      group = [];
      groups.set(warning.kind, group);
    }
    group.push(warning);
  }
  for (const [kind, group] of groups) {
    if (diagnosticsMode === 'verbose' || group.length === 1) {
      for (const warning of group) {
        diagnostics.push(
          makeConfigDiagnostic(
            warningErrorCode(kind),
            warning.message,
            ts.DiagnosticCategory.Warning,
          ),
        );
      }
      continue;
    }
    const examples = formatExamples(group.map((warning) => warning.subject));
    let message: string;
    switch (kind) {
      case 'invalidTagName':
        message =
          `${manifestLabel} declares ${group.length} custom elements whose tag names are not ` +
          `valid custom element names (e.g. ${examples}). These declarations are ignored. ` +
          VERBOSE_HINT;
        break;
      case 'duplicateTag':
        message =
          `${manifestLabel} declares ${group.length} custom element tags more than once ` +
          `(e.g. ${examples}). A tag can only be registered once, so the first declaration of ` +
          `each is used and the others are ignored. ` +
          VERBOSE_HINT;
        break;
      case 'unusableType':
        message =
          `${manifestLabel} contains ${group.length} distinct type-metadata problems Angular ` +
          `cannot safely use (e.g. ${examples}). The count describes reported metadata problems, ` +
          `not necessarily every declaration that depends on them. Affected declarations remain available, but ` +
          `template checks that depend on these types use safe fallbacks; other checks are unaffected. ` +
          VERBOSE_HINT;
        break;
      case 'invalidStructure':
        message =
          `${manifestLabel} contains ${group.length} structurally inconsistent manifest ` +
          `entries (e.g. ${examples}). Angular retains unrelated valid metadata and applies the ` +
          `narrow fallback described by each entry. ` +
          VERBOSE_HINT;
        break;
    }
    diagnostics.push(
      makeConfigDiagnostic(warningErrorCode(kind), message, ts.DiagnosticCategory.Warning),
    );
  }
}

/**
 * Resolves module paths relative to the manifest directory after resolution from the package
 * root has failed.
 */
function manifestRelativeModuleSpecifier(
  specifier: string,
  manifestPath: AbsoluteFsPath,
  packageName: string | null,
  {adapter, cacheDependencyPaths}: ManifestLoadContext,
): string | null {
  if (
    packageName === null ||
    (specifier !== packageName && !specifier.startsWith(`${packageName}/`))
  ) {
    return null;
  }
  const packageJsonPath = findOwningPackageJson(
    dirname(manifestPath),
    packageName,
    adapter,
    cacheDependencyPaths,
  );
  if (packageJsonPath === null) {
    return null;
  }
  const manifestDirectory = relative(dirname(packageJsonPath), dirname(manifestPath));
  if (manifestDirectory.length === 0) {
    return null;
  }
  return `${packageName}/${manifestDirectory}${specifier.slice(packageName.length)}`;
}

/** Rewrites only the module-specifier spans belonging to actual import type nodes. */
function rewriteImportSpecifiers(
  checkType: string,
  imports: readonly CheckTypeImport[],
  replacements: Map<string, string>,
): string {
  const edits = imports
    .map((reference) => ({...reference, replacement: replacements.get(reference.specifier)}))
    .filter(
      (reference): reference is CheckTypeImport & {replacement: string} =>
        reference.replacement !== undefined,
    )
    .sort((a, b) => b.start - a.start);
  let rewritten = checkType;
  for (const {start, end, replacement} of edits) {
    rewritten = rewritten.slice(0, start) + replacement + rewritten.slice(end);
  }
  return rewritten;
}

/** Validates type exports and records string literal values and required type parameters. */
function findExportInfo(
  resolvedFiles: Map<string, string>,
  referencedNames: Map<string, Set<string>>,
  {options, adapter, cacheDependencyPaths: resolutionPaths}: ManifestLoadContext,
): {
  missingExports: Map<string, Set<string>>;
  resolvedTypeReferences: ResolvedTypeReferences;
  requiredTypeParameters: Map<string, Set<string>>;
} {
  if (resolvedFiles.size === 0) {
    return {
      missingExports: new Map(),
      resolvedTypeReferences: new Map(),
      requiredTypeParameters: new Map(),
    };
  }
  const programOptions: ts.CompilerOptions = {
    ...options,
    noEmit: true,
    noLib: true,
    skipLibCheck: true,
    types: [],
  };
  const host: ts.CompilerHost = {
    fileExists: (fileName) => {
      resolutionPaths.add(absoluteFrom(fileName));
      return adapter.fileExists(fileName);
    },
    readFile: (fileName) => {
      resolutionPaths.add(absoluteFrom(fileName));
      return adapter.readFile(fileName);
    },
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
  for (const sourceFile of program.getSourceFiles()) {
    resolutionPaths.add(absoluteFromSourceFile(sourceFile));
  }
  const checker = program.getTypeChecker();
  const missingExports = new Map<string, Set<string>>();
  const resolvedTypeReferences: ResolvedTypeReferences = new Map();
  const requiredTypeParameters = new Map<string, Set<string>>();
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
      types.set(name, resolvedStringLiteralValues(checker.getDeclaredTypeOfSymbol(targetSymbol)));
      if (
        targetSymbol.declarations?.some(
          (declaration) =>
            (ts.isClassDeclaration(declaration) ||
              ts.isInterfaceDeclaration(declaration) ||
              ts.isTypeAliasDeclaration(declaration)) &&
            declaration.typeParameters?.some((parameter) => parameter.default === undefined),
        )
      ) {
        let names = requiredTypeParameters.get(specifier);
        if (names === undefined) {
          names = new Set();
          requiredTypeParameters.set(specifier, names);
        }
        names.add(name);
      }
    }
  }
  return {missingExports, resolvedTypeReferences, requiredTypeParameters};
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

function formatQuotedList(values: Set<string>): string {
  return Array.from(values, (value) => `'${value}'`).join(values.size === 2 ? ' and ' : ', ');
}

function warningErrorCode(kind: ManifestWarning['kind']): ErrorCode {
  switch (kind) {
    case 'invalidTagName':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME;
    case 'duplicateTag':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG;
    case 'unusableType':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE;
    case 'invalidStructure':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE;
  }
}
