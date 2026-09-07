/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵCustomElementsManifestIndex as CustomElementsManifestIndex,
  ɵCustomElementsManifestSchema as CustomElementsManifestSchema,
} from '@angular/compiler';
import ts from 'typescript';

import {CustomElementsManifestCache, NgCompilerAdapter} from '../../core/api';
import {ErrorCode, makeConfigDiagnostic} from '../../diagnostics';
import {AbsoluteFsPath} from '../../file_system';
import {resolveCustomElementsManifest} from './manifest_resolver';
import {parseCustomElementsManifest} from './manifest_parser';
import {resolveManifestSchemas} from './type_resolver';
import {
  ManifestLoadContext,
  ProgramTypeEnvironment,
  CustomElementsManifestsDiagnosticsMode,
  globalTypeIsAvailable,
  getTypeEnvironmentFiles,
} from './load_context';
import {declarationWarningDiagnostics, VERBOSE_HINT} from './manifest_diagnostics';
import {getResourceResolutionHost} from './module_resolution';

/** Matches TypeScript source and declaration file names, including `.mts`/`.cts` variants. */
const TYPESCRIPT_FILE = /\.(?:d\.)?[cm]?tsx?$/;

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
  cache = getResourceResolutionHost(adapter).resolveModuleNames === undefined ? cache : null;
  const typeChecker = program.getTypeChecker();
  const programTypeEnvironment = inspectProgramTypeEnvironment(program);
  const typeEnvironmentFiles = getTypeEnvironmentFiles(program, adapter);
  const cacheKey = computeCacheKey(
    entries,
    basePath,
    options,
    diagnosticsMode,
    programTypeEnvironment,
    typeEnvironmentFiles,
  );
  const cached = readValidCacheEntry(cache, cacheKey, adapter, typeChecker);
  if (cached !== null) {
    return cached;
  }

  const load: ManifestLoadContext = {
    environment: {
      basePath,
      options,
      adapter,
      moduleResolutionCache,
      typeModuleResolutionCache: ts.createModuleResolutionCache(
        basePath,
        adapter.getCanonicalFileName.bind(adapter),
        options,
      ),
      program,
      typeEnvironmentFiles,
      programTypeEnvironment,
    },
    dependencies: {
      manifestPaths: new Set(),
      cacheDependencyPaths: new Set(),
      globalTypeAvailability: new Map(),
    },
  };
  const diagnostics: ts.Diagnostic[] = [];
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

    load.dependencies.manifestPaths.add(resolution.path);

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
    const resolved = resolveManifestSchemas(
      parsed,
      {
        path: resolution.path,
        label: manifestLabel,
        packageName: resolution.packageName,
        diagnosticsMode,
      },
      load,
    );
    diagnostics.push(
      ...resolved.diagnostics,
      ...declarationWarningDiagnostics(
        manifestLabel,
        [...parsed.warnings, ...resolved.warnings],
        diagnosticsMode,
      ),
    );
    const schemas = resolved.schemas;

    const crossManifestDuplicates: Array<{tagName: string; winnerManifestLabel: string}> = [];
    for (const schema of schemas) {
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
 * Schemas are constructed after validation and remain unchanged in the cached result.
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
  'strict',
  'strictNullChecks',
  'strictFunctionTypes',
  'strictBindCallApply',
  'strictBuiltinIteratorReturn',
  'exactOptionalPropertyTypes',
  'noUncheckedIndexedAccess',
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
  typeEnvironmentFiles: readonly ts.SourceFile[],
): string {
  return JSON.stringify([
    entries,
    basePath,
    diagnosticsMode,
    programTypeEnvironment,
    typeEnvironmentFiles.map((file) => file.fileName).sort(),
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
  {
    environment: {adapter},
    dependencies: {manifestPaths, cacheDependencyPaths, globalTypeAvailability},
  }: ManifestLoadContext,
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
