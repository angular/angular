/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CustomElementsManifestIndex, CustomElementsManifestSchema} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerAdapter} from '../../core/api';
import {ErrorCode} from '../../diagnostics';
import {AbsoluteFsPath, dirname} from '../../file_system';
import {ManifestResolutionKind, resolveCustomElementsManifest} from './manifest_resolver';
import {parseCustomElementsManifest} from './manifest_parser';
import {ManifestTypeInput, resolveManifestSchemas} from './type_resolver';
import {
  ManifestLoadContext,
  ProgramTypeEnvironment,
  CustomElementsManifestsDiagnosticsMode,
  globalTypeIsAvailable,
  getTypeEnvironmentFiles,
  libraryTypeIsAvailable,
} from './load_context';
import {
  declarationWarningDiagnostics,
  manifestDiagnostic,
  manifestMessage,
} from './manifest_diagnostics';
import {getResourceResolutionHost} from './module_resolution';

/** Explains why a later manifest's declaration of a tag is ignored. */
const OVERRIDE_NOTE = `This is expected when you list your own manifest first to override a library's tags.`;

/** Matches the path of a file that a dependency publishes, rather than the application. */
const IN_NODE_MODULES = /[\\/]node_modules[\\/]/;

/** Matches TypeScript source and declaration file names, including `.mts`/`.cts` variants. */
const TYPESCRIPT_FILE = /\.(?:d\.)?[cm]?tsx?$/;

/**
 * Storage for the last load result. An `NgCompiler` passes its storage on to the compiler of the
 * next incremental build, so that a rebuild reuses the result when no file it depends on changed.
 * The loader owns the entry.
 */
export interface CustomElementsManifestCache {
  entry: unknown;
}

/** Result of loading the manifests in the `customElementsManifests` compiler option. */
export interface CustomElementsManifestLoadResult {
  /** Custom elements from all loaded manifests, or `null` if there are none. */
  index: CustomElementsManifestIndex | null;

  /** Errors and warnings from resolving, parsing, and validating the manifests. */
  diagnostics: ts.Diagnostic[];

  /** Files whose changes can change which manifests resolve or what they contain. */
  resolutionPaths: Set<AbsoluteFsPath>;
}

/**
 * Loads the configured manifests and combines their element schemas. The first declaration of a
 * tag wins; later ones produce a warning. Validates the types of all manifests in one TypeScript
 * program.
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
  // A custom resolver doesn't report the files it consulted, so its results can't be cached safely.
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
  const cached = readValidCacheEntry(cache, cacheKey, adapter, program);
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
      knownContents: new Map(),
      missingDirectories: new Set(),
      globalTypeAvailability: new Map(),
      libraryTypeAvailability: new Map(),
    },
  };
  const resolutionPaths = new Set<AbsoluteFsPath>();
  /** Diagnostics of each configured entry, reported in configuration order. */
  const entryDiagnostics: ts.Diagnostic[][] = [];
  /** Parsed manifests whose types are validated together. */
  const parsedManifests: Array<{input: ManifestTypeInput; diagnostics: ts.Diagnostic[]}> = [];

  for (const entry of entries) {
    const diagnostics: ts.Diagnostic[] = [];
    entryDiagnostics.push(diagnostics);
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
    if (resolution.kind === ManifestResolutionKind.Failed) {
      diagnostics.push(
        manifestDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          `Angular compiler option "customElementsManifests": cannot load the entry '${entry}'. ` +
            resolution.reason,
        ),
      );
      continue;
    }

    load.dependencies.manifestPaths.add(resolution.path);
    adapter.recordResourceDependency?.(resolution.path);

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
        manifestDiagnostic(
          ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND,
          manifestMessage(manifestLabel, `the file cannot be read.`),
        ),
      );
      continue;
    }

    const parsed = parseCustomElementsManifest(content, manifestLabel, resolution.packageName);
    for (const error of parsed.errors) {
      diagnostics.push(
        manifestDiagnostic(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID, error),
      );
    }
    parsedManifests.push({
      input: {
        parsed,
        manifest: {
          path: resolution.path,
          label: manifestLabel,
          packageName: resolution.packageName,
        },
      },
      diagnostics,
    });
  }

  const resolvedManifests = resolveManifestSchemas(
    parsedManifests.map(({input}) => input),
    load,
  );
  /** The first declaration of each tag and its manifest label for duplicate warnings. */
  const byTag = new Map<string, {schema: CustomElementsManifestSchema; manifestLabel: string}>();
  parsedManifests.forEach(({input: {parsed, manifest}, diagnostics}, index) => {
    const manifestLabel = manifest.label;
    const resolved = resolvedManifests[index];
    const warnings = [...parsed.warnings, ...resolved.warnings];
    for (const schema of resolved.schemas) {
      const winner = byTag.get(schema.tagName);
      if (winner === undefined) {
        byTag.set(schema.tagName, {schema, manifestLabel});
        continue;
      }
      warnings.push({
        code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG,
        subject: schema.tagName,
        message: manifestMessage(
          manifestLabel,
          `the tag '${schema.tagName}' is already declared by the earlier entry ` +
            `${winner.manifestLabel}. Angular uses the earlier declaration and ignores this one. ` +
            OVERRIDE_NOTE,
        ),
        note: OVERRIDE_NOTE,
      });
    }
    diagnostics.push(
      ...declarationWarningDiagnostics(
        manifestLabel,
        warnings,
        diagnosticsMode,
        IN_NODE_MODULES.test(manifest.path),
      ),
    );
  });
  const diagnostics = entryDiagnostics.flat();

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
 * A cached load result and the inputs it depends on. `fileContents` covers resolution lookups,
 * manifests, and the declarations that type validation read, with `null` for missing files.
 * Contents are read the same way as during loading, so unsaved editor changes count. The
 * availability of global and library types is rechecked against each new program.
 */
interface ManifestCacheEntry {
  key: string;
  fileContents: Map<AbsoluteFsPath, string | null>;
  /** Manifest files among `fileContents`, which are re-read through `readResource`. */
  manifestPaths: Set<AbsoluteFsPath>;
  /**
   * Files and directories that type validation looked up and that don't exist. Grouped by
   * `groupMissingPaths` the first time the entry is checked, so that a build that is never
   * followed by another one doesn't pay for it.
   */
  missingPaths: UngroupedMissingPaths | MissingPaths;
  globalTypeAvailability: Map<string, boolean>;
  libraryTypeAvailability: Map<string, boolean>;
  result: CustomElementsManifestLoadResult;
}

/**
 * Compiler options that can change a load result, so they are part of the cache key: strictness
 * options that change type validation, options that affect module resolution (keep these aligned
 * with TypeScript's `affectsModuleResolution` options), and options that change which files are
 * loaded or which global types exist.
 */
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

/**
 * Identifies the inputs of a load other than file contents. Entry order matters because the first
 * declaration of a tag wins.
 */
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
  program: ts.Program,
): CustomElementsManifestLoadResult | null {
  const entry = cache?.entry as ManifestCacheEntry | null | undefined;
  if (entry == null || entry.key !== cacheKey) {
    return null;
  }
  if ('ungrouped' in entry.missingPaths) {
    entry.missingPaths = groupMissingPaths(entry.missingPaths, adapter);
  }
  for (const directory of entry.missingPaths.directories) {
    if (adapter.directoryExists!(directory)) {
      return null;
    }
  }
  for (const path of entry.missingPaths.files) {
    if (adapter.fileExists(path)) {
      return null;
    }
  }
  for (const [path, cachedContent] of entry.fileContents) {
    if (
      readCurrentContent(adapter, program, path, entry.manifestPaths.has(path)) !== cachedContent
    ) {
      return null;
    }
  }
  const typeChecker = program.getTypeChecker();
  for (const [name, wasAvailable] of entry.globalTypeAvailability) {
    if (globalTypeIsAvailable(typeChecker, name) !== wasAvailable) {
      return null;
    }
  }
  for (const [name, wasAvailable] of entry.libraryTypeAvailability) {
    if (libraryTypeIsAvailable(program, typeChecker, name) !== wasAvailable) {
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
    environment: {adapter, program},
    dependencies: {
      manifestPaths,
      cacheDependencyPaths,
      knownContents,
      missingDirectories,
      globalTypeAvailability,
      libraryTypeAvailability,
    },
  }: ManifestLoadContext,
): void {
  if (cache === null) {
    return;
  }
  const fileContents = new Map<AbsoluteFsPath, string | null>();
  for (const path of result.resolutionPaths) {
    fileContents.set(path, readCurrentContent(adapter, program, path, manifestPaths.has(path)));
  }
  const missingFiles = new Set<AbsoluteFsPath>();
  for (const path of cacheDependencyPaths) {
    if (fileContents.has(path)) {
      continue;
    }
    const content = knownContents.has(path)
      ? knownContents.get(path)!
      : readCurrentContent(adapter, program, path, /* isManifest */ false);
    if (content !== null) {
      fileContents.set(path, content);
    } else {
      missingFiles.add(path);
    }
  }
  cache.entry = {
    key: cacheKey,
    fileContents,
    manifestPaths,
    missingPaths: {ungrouped: true, files: missingFiles, directories: missingDirectories},
    globalTypeAvailability,
    libraryTypeAvailability,
    result,
  } satisfies ManifestCacheEntry;
}

/** The missing files and directories that a load recorded. */
interface UngroupedMissingPaths {
  ungrouped: true;
  files: Set<AbsoluteFsPath>;
  directories: Set<AbsoluteFsPath>;
}

/** Missing files and directories, grouped to check as few paths as possible. */
interface MissingPaths {
  /** Missing files in directories that exist. */
  files: Set<AbsoluteFsPath>;
  /**
   * Directories that don't exist and that contain the other missing paths. Module resolution
   * probes many paths in each missing directory, such as a `node_modules` directory in every
   * ancestor, so one check of the directory replaces all of them.
   */
  directories: Set<AbsoluteFsPath>;
}

/**
 * Replaces each missing path by the outermost directory above it that doesn't exist, if there is
 * one. A path that exists by now is kept, so the check that follows finds it.
 */
function groupMissingPaths(paths: UngroupedMissingPaths, adapter: NgCompilerAdapter): MissingPaths {
  if (adapter.directoryExists === undefined) {
    return {files: new Set(paths.files), directories: new Set()};
  }
  const known = new Map<AbsoluteFsPath, boolean>();
  const exists = (directory: AbsoluteFsPath): boolean => {
    let result = known.get(directory);
    if (result === undefined) {
      result = adapter.directoryExists!(directory);
      known.set(directory, result);
    }
    return result;
  };
  const outermostMissing = (directory: AbsoluteFsPath): AbsoluteFsPath => {
    for (let parent = dirname(directory); parent !== directory; parent = dirname(directory)) {
      if (exists(parent)) {
        break;
      }
      directory = parent;
    }
    return directory;
  };
  const files = new Set<AbsoluteFsPath>();
  const directories = new Set<AbsoluteFsPath>();
  for (const path of paths.files) {
    const directory = dirname(path);
    if (exists(directory)) {
      files.add(path);
    } else {
      directories.add(outermostMissing(directory));
    }
  }
  for (const directory of paths.directories) {
    directories.add(exists(directory) ? directory : outermostMissing(directory));
  }
  return {files, directories};
}

/**
 * Reads a cache dependency the same way loading does: `readResource` for manifests, the current
 * program for TypeScript files, and `readFile` for other files.
 */
function readCurrentContent(
  adapter: NgCompilerAdapter,
  program: ts.Program,
  path: AbsoluteFsPath,
  isManifest: boolean,
): string | null {
  if (isManifest && adapter.readResource !== undefined) {
    const result = adapter.readResource(path);
    if (typeof result === 'string') {
      // Tell a missing file (NG4007) from an empty one (NG4008).
      return result === '' && !adapter.fileExists(path) ? null : result;
    }
  }
  if (TYPESCRIPT_FILE.test(path)) {
    // A file of the program costs nothing to read, and most validated declarations are in it.
    const sourceFile =
      program.getSourceFile(path) ?? adapter.getSourceFile(path, ts.ScriptTarget.Latest);
    if (sourceFile !== undefined) {
      return sourceFile.text;
    }
  }
  return adapter.fileExists(path) ? (adapter.readFile(path) ?? null) : null;
}

/**
 * Describes the program so that NG4011 can explain missing global types. A program without default
 * libraries and a solution-style tsconfig without files both lack them, but need different fixes.
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
