/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {NgCompilerAdapter} from '../../core/api';
import {AbsoluteFsPath, absoluteFrom, dirname, isRooted, join, resolve} from '../../file_system';
import {
  createLookupResolutionHost,
  getFailedModuleLookupLocations,
  resolveModuleName,
} from '../../util/src/typescript';

/** Result of resolving a `customElementsManifests` option entry to a manifest file. */
export type ManifestResolutionResult =
  | {
      kind: 'success';
      path: AbsoluteFsPath;
      /**
       * The owning npm package, or `null` for a path entry. Used to resolve type references
       * within the same package.
       */
      packageName: string | null;
      /** Files whose changes can alter this resolution, including the resolved manifest. */
      resolutionPaths: Set<AbsoluteFsPath>;
    }
  | {kind: 'failure'; reason: string; resolutionPaths: Set<AbsoluteFsPath>};

/**
 * Extracts the package name from a module specifier, such as `@my/lib/custom-elements.json`.
 * Returns `null` if the specifier does not start with a valid package name.
 */
function packageNameOfSpecifier(specifier: string): string | null {
  const segments = specifier.split('/');
  const packageName = specifier.startsWith('@')
    ? segments.length >= 2
      ? `${segments[0]}/${segments[1]}`
      : null
    : (segments[0] ?? null);
  return packageName !== null && packageName.length > 0 ? packageName : null;
}

const MANIFEST_MARKER = '.$ngcustomelements$';

/**
 * Resolves a `customElementsManifests` entry to an absolute manifest path.
 *
 * Three forms are supported:
 *  - Paths relative to the tsconfig directory, such as `./custom-elements.json`, or absolute paths.
 *  - JSON module specifiers, such as `@my/lib/custom-elements.json`, resolved through the project.
 *  - Package names, such as `@my/lib`, whose `package.json` has a `customElements` field.
 */
export function resolveCustomElementsManifest(
  entry: string,
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
): ManifestResolutionResult {
  if (entry.startsWith('./') || entry.startsWith('../') || isRooted(entry)) {
    const path = resolve(basePath, entry);
    adapter.recordResourceDependency?.(path);
    if (adapter.fileExists(path)) {
      return {kind: 'success', path, packageName: null, resolutionPaths: new Set([path])};
    }
    return {
      kind: 'failure',
      reason: `The file '${path}' does not exist.`,
      resolutionPaths: new Set([path]),
    };
  }

  if (entry.endsWith('.json')) {
    const resolution = resolveJsonSpecifier(
      entry,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
    );
    if (resolution.path !== null) {
      resolution.resolutionPaths.add(resolution.path);
      return {
        kind: 'success',
        path: resolution.path,
        packageName: packageNameOfSpecifier(entry),
        resolutionPaths: resolution.resolutionPaths,
      };
    }
    return {
      kind: 'failure',
      reason: `The module specifier '${entry}' could not be resolved to a file.`,
      resolutionPaths: resolution.resolutionPaths,
    };
  }

  // For a package name, read the manifest path from its `customElements` field.
  const packageJsonResolution = resolveJsonSpecifier(
    `${entry}/package.json`,
    basePath,
    options,
    adapter,
    moduleResolutionCache,
  );
  let packageJsonPath = packageJsonResolution.path;
  if (packageJsonPath === null) {
    // If the package does not export package.json, find it through the public entry point.
    packageJsonPath = resolvePackageJsonFromEntrypoint(
      entry,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
      packageJsonResolution.resolutionPaths,
    );
  }
  if (packageJsonPath === null) {
    return {
      kind: 'failure',
      reason: `The package '${entry}' could not be resolved.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }
  packageJsonResolution.resolutionPaths.add(packageJsonPath);

  const packageJsonContent = adapter.readFile(packageJsonPath);
  let customElementsField: unknown;
  try {
    customElementsField =
      packageJsonContent !== undefined
        ? (JSON.parse(packageJsonContent) as {[key: string]: unknown})['customElements']
        : undefined;
  } catch {
    return {
      kind: 'failure',
      reason: `Failed to parse '${packageJsonPath}' as JSON.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }
  if (typeof customElementsField !== 'string') {
    return {
      kind: 'failure',
      reason:
        `The package '${entry}' does not declare a Custom Elements Manifest: its package.json ` +
        `has no "customElements" field. Specify the path to the manifest file directly instead ` +
        `(e.g. '${entry}/custom-elements.json').`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }

  const manifestPath = resolve(dirname(packageJsonPath), customElementsField);
  adapter.recordResourceDependency?.(manifestPath);
  packageJsonResolution.resolutionPaths.add(manifestPath);
  if (!adapter.fileExists(manifestPath)) {
    return {
      kind: 'failure',
      reason:
        `The "customElements" field of the package.json of '${entry}' points to ` +
        `'${manifestPath}', which does not exist.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }
  return {
    kind: 'success',
    path: manifestPath,
    packageName: entry,
    resolutionPaths: packageJsonResolution.resolutionPaths,
  };
}

/** Resolves a package's public entry point and finds the package.json that owns it. */
function resolvePackageJsonFromEntrypoint(
  packageName: string,
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
  candidatePaths: Set<AbsoluteFsPath>,
): AbsoluteFsPath | null {
  const resolved = resolveModuleName(
    packageName,
    join(basePath, 'index.ts'),
    options,
    adapter,
    moduleResolutionCache,
  );
  if (resolved === undefined) {
    return null;
  }
  return findOwningPackageJson(
    dirname(absoluteFrom(resolved.resolvedFileName)),
    packageName,
    adapter,
    candidatePaths,
  );
}

/**
 * Finds the nearest ancestor package.json whose `name` matches `packageName`, skipping invalid
 * JSON. Records every candidate path so creating or correcting a nearer file invalidates the cache.
 */
export function findOwningPackageJson(
  startDirectory: AbsoluteFsPath,
  packageName: string,
  adapter: NgCompilerAdapter,
  candidatePaths: Set<AbsoluteFsPath>,
): AbsoluteFsPath | null {
  let directory = startDirectory;
  while (true) {
    const packageJsonPath = join(directory, 'package.json');
    candidatePaths.add(packageJsonPath);
    const content = adapter.fileExists(packageJsonPath) ? adapter.readFile(packageJsonPath) : null;
    if (typeof content === 'string') {
      try {
        if ((JSON.parse(content) as {[key: string]: unknown})['name'] === packageName) {
          return packageJsonPath;
        }
      } catch {
        // Keep walking.
      }
    }

    const parent = dirname(directory);
    if (parent === directory) {
      return null;
    }
    directory = parent;
  }
}

interface JsonSpecifierResolution {
  path: AbsoluteFsPath | null;
  resolutionPaths: Set<AbsoluteFsPath>;
}

/**
 * Resolves a JSON module specifier with `resolveJsonModule` enabled. Uses the host's
 * `resolveModuleNames` when available and respects package exports.
 * Records resolution dependencies and missing manifest paths so later changes reload the schemas.
 * Files excluded by package exports remain unresolved even if they exist on disk.
 */
function resolveJsonSpecifier(
  specifier: string,
  basePath: AbsoluteFsPath,
  options: ts.CompilerOptions,
  adapter: NgCompilerAdapter,
  moduleResolutionCache: ts.ModuleResolutionCache | null,
): JsonSpecifierResolution {
  const containingFile = join(basePath, 'index.ts');
  const resolutionPaths = new Set<AbsoluteFsPath>();

  const jsonOptions = {...options, resolveJsonModule: true};
  let resolved: ts.ResolvedModule | undefined;
  let failedLookupLocations: readonly string[] = [];
  if (adapter.resolveModuleNames !== undefined) {
    resolved = resolveModuleName(
      specifier,
      containingFile,
      jsonOptions,
      adapter,
      moduleResolutionCache,
    );
  } else {
    const resolution = ts.resolveModuleName(
      specifier,
      containingFile,
      jsonOptions,
      adapter,
      moduleResolutionCache ?? undefined,
    ) as ts.ResolvedModuleWithFailedLookupLocations & {
      readonly affectingLocations?: readonly string[];
      readonly failedLookupLocations?: readonly string[];
    };
    // Package exports can redirect the manifest. Track the metadata for cache and resource updates,
    // including manifests with no type declarations to resolve.
    for (const path of resolution.affectingLocations ?? []) {
      resolutionPaths.add(absoluteFrom(path));
      adapter.recordResourceDependency?.(absoluteFrom(path));
    }
    failedLookupLocations = resolution.failedLookupLocations ?? [];
    resolved = resolution.resolvedModule;
  }
  if (resolved !== undefined && resolved.resolvedFileName.endsWith('.json')) {
    const path = absoluteFrom(resolved.resolvedFileName);
    resolutionPaths.add(path);
    return {path, resolutionPaths};
  }

  const candidates = [
    // Actual failed JSON lookups include paths redirected by package exports.
    ...failedLookupLocations.filter(
      (path) => path.endsWith('.json') && !path.endsWith('/package.json'),
    ),
    ...(
      getFailedModuleLookupLocations(
        specifier,
        containingFile,
        options,
        createLookupResolutionHost(adapter, MANIFEST_MARKER),
        MANIFEST_MARKER,
      ) ?? []
    ).filter((path) => path.endsWith(specifier)),
  ];
  for (const candidate of candidates) {
    const path = absoluteFrom(candidate);
    // Track missing files only in existing directories to limit speculative node_modules watches.
    // These paths detect file creation. They do not bypass package exports during resolution.
    if (
      adapter.directoryExists?.(dirname(path)) ??
      adapter.fileExists(join(dirname(path), 'package.json'))
    ) {
      resolutionPaths.add(path);
      adapter.recordResourceDependency?.(path);
    }
  }
  return {path: null, resolutionPaths};
}
