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
import {
  absoluteFrom,
  absoluteFromSourceFile,
  AbsoluteFsPath,
  dirname,
  join,
  relative,
} from '../../file_system';
import {resolveModuleName} from '../../util/src/typescript';

import {ManifestWarning, parseCustomElementsManifest} from './manifest_parser';
import {findOwningPackageJson, resolveCustomElementsManifest} from './manifest_resolver';
import {analyzeTypeText, parseTypeText, TYPE_TEXT_ALIAS_PREFIX, TypeTextInfo} from './type_text';

/**
 * How manifest warnings are reported. In `'summary'` mode (the default), warnings of the same
 * kind for one manifest are folded into a single diagnostic with a count and examples; in
 * `'verbose'` mode every affected declaration or reference is reported individually.
 */
export type CustomElementsManifestsDiagnosticsMode = 'summary' | 'verbose';

type CustomElementsManifestCache = NonNullable<NgCompilerAdapter['customElementsManifestCache']>;

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
  program: ts.Program,
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode = 'summary',
  cache: CustomElementsManifestCache | null = null,
): CustomElementsManifestLoadResult {
  // A host-provided resolver does not expose the files and failed lookups that influence its
  // result. Do not reuse a semantic result when its complete dependency set cannot be observed.
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

  const diagnostics: ts.Diagnostic[] = [];
  const manifestPaths = new Set<AbsoluteFsPath>();
  const resolutionPaths = new Set<AbsoluteFsPath>();
  const cacheDependencyPaths = new Set<AbsoluteFsPath>();
  const globalTypeAvailability = new Map<string, boolean>();
  const byTag = new Map<string, CustomElementsManifestSchema>();
  const winningManifestByTag = new Map<string, string>();

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

    // Diagnostics identify the manifest by the option entry the user wrote, with the resolved
    // file in parentheses when they differ, so warnings map directly back to the tsconfig.
    const manifestLabel =
      entry === resolution.path ? `'${resolution.path}'` : `'${entry}' ('${resolution.path}')`;

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
    // Narrow time-of-check/time-of-use race: a manifest deleted after resolution reported it as
    // existing can surface as an empty read (language-service hosts convert an unavailable read
    // to ''). An empty read whose file no longer exists is a failed read (NG4007), not invalid
    // manifest JSON (NG4008); a genuinely empty file on disk still reports NG4008 below.
    if (content === '' && !adapter.fileExists(resolution.path)) {
      content = undefined;
    }
    if (content === undefined) {
      diagnostics.push(
        makeManifestDiagnostic(
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
        makeManifestDiagnostic(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID, error),
      );
    }
    stripUnresolvableCheckTypes(
      parsed.schemas,
      resolution.path,
      manifestLabel,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
      typeChecker,
      programTypeEnvironment,
      resolution.packageName,
      diagnosticsMode,
      diagnostics,
      cacheDependencyPaths,
      globalTypeAvailability,
    );
    emitDeclarationWarnings(manifestLabel, parsed.warnings, diagnosticsMode, diagnostics);

    const crossManifestDuplicates: Array<{tagName: string; winnerManifestLabel: string}> = [];
    for (const schema of parsed.schemas) {
      const existing = byTag.get(schema.tagName);
      if (existing !== undefined) {
        crossManifestDuplicates.push({
          tagName: schema.tagName,
          winnerManifestLabel: winningManifestByTag.get(schema.tagName)!,
        });
        continue;
      }
      byTag.set(schema.tagName, schema);
      winningManifestByTag.set(schema.tagName, manifestLabel);
    }
    if (diagnosticsMode === 'verbose' || crossManifestDuplicates.length === 1) {
      for (const {tagName, winnerManifestLabel} of crossManifestDuplicates) {
        diagnostics.push(
          makeManifestDiagnostic(
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
        makeManifestDiagnostic(
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

  const schemas = byTag.size > 0 ? Array.from(byTag.values()) : null;
  const result: CustomElementsManifestLoadResult = {
    schemas,
    diagnostics,
    manifestPaths,
    resolutionPaths,
  };
  storeCacheEntry(cache, cacheKey, result, adapter, cacheDependencyPaths, globalTypeAvailability);
  return result;
}

/**
 * Cached manifest load state. `fileContents` snapshots every observed file whose change can
 * affect the result (`null` records that the file did not exist), including manifest resolution,
 * declaration programs, and their module-resolution lookups. Manifest and TypeScript source
 * snapshots use their editor-buffer-aware read paths. Global type availability is compared
 * separately against each new program's type checker.
 *
 * The result is safe to share across `NgCompiler` instances because loading (including
 * check-type stripping and specifier rewriting) is the only phase that mutates schemas; every
 * consumer afterwards treats them as read-only.
 */
interface ManifestCacheEntry {
  key: string;
  fileContents: Map<AbsoluteFsPath, string | null>;
  globalTypeAvailability: Map<string, boolean>;
  result: CustomElementsManifestLoadResult;
}

/**
 * Builds the configuration portion of the cache key: the option entries in order (order affects
 * first-wins tag resolution), the diagnostics mode, and the compiler options that influence
 * module resolution or the missing-globals validation.
 */
// Keep this aligned with TypeScript's module-resolution-affecting option declarations. The final
// entries additionally affect source selection or the consuming program's global type scope.
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
    if (readCurrentContent(adapter, path, entry.result.manifestPaths.has(path)) !== cachedContent) {
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
  adapter: NgCompilerAdapter,
  cacheDependencyPaths: Set<AbsoluteFsPath>,
  globalTypeAvailability: Map<string, boolean>,
): void {
  if (cache === null) {
    return;
  }
  const fileContents = new Map<AbsoluteFsPath, string | null>();
  for (const path of result.resolutionPaths) {
    fileContents.set(path, readCurrentContent(adapter, path, result.manifestPaths.has(path)));
  }
  for (const path of cacheDependencyPaths) {
    if (!fileContents.has(path)) {
      fileContents.set(path, readCurrentContent(adapter, path, /* isManifest */ false));
    }
  }
  cache.entry = {
    key: cacheKey,
    fileContents,
    globalTypeAvailability,
    result,
  } satisfies ManifestCacheEntry;
}

/**
 * Reads a file for cache snapshotting/validation with the same source preference as the load
 * path: manifests come from `readResource`, TypeScript files from the current program's source
 * files, and other resolution inputs from `readFile`.
 */
function readCurrentContent(
  adapter: NgCompilerAdapter,
  path: AbsoluteFsPath,
  isManifest: boolean,
): string | null {
  if (isManifest && adapter.readResource !== undefined) {
    const result = adapter.readResource(path);
    if (typeof result === 'string') {
      // Language-service hosts represent an unavailable resource read as an empty string. Keep
      // that state distinct from an existing empty file so deletion and recreation invalidate
      // cached NG4007/NG4008 diagnostics correctly.
      return result === '' && !adapter.fileExists(path) ? null : result;
    }
  }
  if (/\.(?:d\.)?[cm]?tsx?$/.test(path)) {
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
 * Inspects structural program state used to explain missing global types. This avoids inferring
 * configuration from the availability of any particular global symbol: intentionally lib-less
 * programs and solution-style roots can have the same symbol surface for different reasons.
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

type ResolvedTypeReferences = Map<string, Map<string, TypeTextInfo>>;

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
  manifestLabel: string,
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  typeChecker: ts.TypeChecker,
  programTypeEnvironment: ProgramTypeEnvironment,
  packageName: string | null,
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode,
  diagnostics: ts.Diagnostic[],
  resolutionPaths: Set<AbsoluteFsPath>,
  globalTypeAvailability: Map<string, boolean>,
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
    let resolved = resolveTypeReferenceModuleName(
      specifier,
      containingFile,
      options,
      adapter,
      moduleResolutionCache,
      resolutionPaths,
    );
    if (resolved === undefined) {
      const manifestRelativeSpecifier = manifestRelativeModuleSpecifier(
        specifier,
        manifestPath,
        packageName,
        adapter,
        resolutionPaths,
      );
      if (manifestRelativeSpecifier !== null) {
        resolved = resolveTypeReferenceModuleName(
          manifestRelativeSpecifier,
          containingFile,
          options,
          adapter,
          moduleResolutionCache,
          resolutionPaths,
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
    resolutionPaths,
  );
  for (const name of referencedGlobals) {
    globalTypeAvailability.set(name, globalTypeIsAvailable(typeChecker, name));
  }
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter((name) => !globalTypeAvailability.get(name)),
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
      if (typeInfo.stringLiteralValues !== null) {
        owner.attribute.stringLiteralValues = typeInfo.stringLiteralValues;
      }
    }
    owner.set(
      rewriteImportSpecifiers(owner.checkType, owner.analysis.imports, replacementSpecifiers),
    );
  }

  // Each of the three reference problems is one "group": an unresolvable module specifier, a
  // resolvable module missing referenced exports, or the set of undeclared globals. A single
  // group keeps its detailed message even in summary mode; multiple groups fold into one
  // per-manifest summary so large design systems produce one warning instead of dozens.
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
    const examples = [...unresolvableSpecifiers, ...missingExports.keys(), ...missingGlobals].slice(
      0,
      3,
    );
    diagnostics.push(
      makeManifestDiagnostic(
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
      makeManifestDiagnostic(
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
      makeManifestDiagnostic(
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
      makeManifestDiagnostic(
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
          // Global references never contribute to element instance types, so local references
          // are unaffected here.
          checkTypeFallbackEffect(/* affectsLocalReferences */ false),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
}

/**
 * Additional guidance for missing global references based on the consuming program's structure.
 * A solution-style root receives a specific application-tsconfig recommendation; an intentionally
 * or accidentally lib-less program with roots receives neutral configuration guidance.
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

/** Resolves a check-type import and records every observable file lookup that shaped the result. */
function resolveTypeReferenceModuleName(
  moduleName: string,
  containingFile: string,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  resolutionPaths: Set<AbsoluteFsPath>,
): ts.ResolvedModule | undefined {
  if (adapter.resolveModuleNames !== undefined) {
    // Cross-compiler caching is disabled for custom resolvers because they do not expose their
    // dependencies. Preserve their resolution behavior for single-shot loading.
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
    resolutionPaths.add(absoluteFrom(path));
  }
  for (const path of resolution.failedLookupLocations ?? []) {
    resolutionPaths.add(absoluteFrom(path));
  }
  if (resolution.resolvedModule !== undefined) {
    resolutionPaths.add(absoluteFrom(resolution.resolvedModule.resolvedFileName));
  }
  return resolution.resolvedModule;
}

/** Shared consequence sentence of NG4011 diagnostics, kept identical across the messages. */
function checkTypeFallbackEffect(affectsLocalReferences: boolean): string {
  return (
    `Bindings, static attributes, and events that depend on these types are not type-checked` +
    (affectsLocalReferences ? `, and affected local references fall back to HTMLElement` : ``) +
    `; other checks are unaffected.`
  );
}

/** Trailing hint appended to summarized warnings, following the `oob.ts` suppress-hint style. */
const VERBOSE_HINT =
  'This summary can be expanded using the `customElementsManifestsDiagnostics = "verbose"` ' +
  'compiler option.';

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
  diagnosticsMode: CustomElementsManifestsDiagnosticsMode,
  diagnostics: ts.Diagnostic[],
): void {
  for (const kind of [
    'invalidTagName',
    'duplicateTag',
    'unusableType',
    'invalidStructure',
  ] as const) {
    const group = warnings.filter((warning) => warning.kind === kind);
    if (group.length === 0) {
      continue;
    }
    if (diagnosticsMode === 'verbose' || group.length === 1) {
      for (const warning of group) {
        diagnostics.push(
          makeManifestDiagnostic(
            warningErrorCode(warning),
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
      makeManifestDiagnostic(warningErrorCode(group[0]), message, ts.DiagnosticCategory.Warning),
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
  resolutionPaths: Set<AbsoluteFsPath>,
): string | null {
  if (
    packageName === null ||
    (specifier !== packageName && !specifier.startsWith(`${packageName}/`))
  ) {
    return null;
  }
  const packageRoot = findOwningPackageRoot(manifestPath, packageName, adapter, resolutionPaths);
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
  resolutionPaths: Set<AbsoluteFsPath>,
): AbsoluteFsPath | null {
  const packageJsonPath = findOwningPackageJson(
    dirname(manifestPath),
    packageName,
    adapter,
    resolutionPaths,
  );
  return packageJsonPath === null ? null : dirname(packageJsonPath);
}

/**
 * Parses a validated check type and returns only actual import type nodes and unqualified named
 * types. In particular, import-like text inside a string literal must remain documentation data,
 * not become a module-resolution request or a rewrite target.
 */
export function analyzeCheckType(checkType: string): CheckTypeAnalysis | null {
  const source = parseTypeText(checkType);
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
        const start = literal.getStart(source) + 1 - TYPE_TEXT_ALIAS_PREFIX.length;
        const end = literal.getEnd() - 1 - TYPE_TEXT_ALIAS_PREFIX.length;
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
  resolutionPaths: Set<AbsoluteFsPath>,
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

function resolvedTypeReference(type: ts.Type): TypeTextInfo {
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
): TypeTextInfo {
  return analyzeTypeText(checkType, (specifier, name) => resolvedTypes.get(specifier)?.get(name));
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
    case 'unusableType':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE;
    case 'invalidStructure':
      return ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE;
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
