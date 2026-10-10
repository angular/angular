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
} from '../../util/src/typescript';
import {resolveResourceModule} from './module_resolution';

export enum ManifestResolutionKind {
  Success,
  Failed,
}

/** Result of resolving a `customElementsManifests` option entry to a manifest file. */
export type ManifestResolutionResult =
  | {
      kind: ManifestResolutionKind.Success;
      path: AbsoluteFsPath;
      /**
       * The owning npm package, or `null` for a path entry. Used to resolve type references
       * within the same package.
       */
      packageName: string | null;
      /** Files whose changes can alter this resolution, including the resolved manifest. */
      resolutionPaths: Set<AbsoluteFsPath>;
    }
  | {kind: ManifestResolutionKind.Failed; reason: string; resolutionPaths: Set<AbsoluteFsPath>};

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

/**
 * Appended to a specifier to list the paths where resolution looks for it. See
 * `getFailedModuleLookupLocations`.
 */
const MANIFEST_MARKER = '.$ngcustomelements$';

/**
 * Resolves a `customElementsManifests` entry to an absolute manifest path. An entry is one of:
 *  - A path that starts with `./` or `../`, relative to `basePath`, or an absolute path.
 *  - A `.json` module specifier, such as `@my/lib/custom-elements.json`.
 *  - A package name, such as `@my/lib`, whose `package.json` has a `customElements` field.
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
      return {
        kind: ManifestResolutionKind.Success,
        path,
        packageName: null,
        resolutionPaths: new Set([path]),
      };
    }
    // Inherited entries are not rebased, so name the directory used for relative entries.
    const base = isRooted(entry)
      ? ''
      : ` Relative entries resolve against the project directory '${basePath}', including ` +
        `entries inherited through "extends".`;
    return {
      kind: ManifestResolutionKind.Failed,
      reason: `The file '${path}' does not exist.${base}`,
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
        kind: ManifestResolutionKind.Success,
        path: resolution.path,
        packageName: packageNameOfSpecifier(entry),
        resolutionPaths: resolution.resolutionPaths,
      };
    }
    // Like tsconfig `extends`, a bare entry is a module specifier. Suggest the path form when the
    // user likely meant a project file.
    const projectFile = resolve(basePath, entry);
    const hint = adapter.fileExists(projectFile)
      ? ` Entries that do not start with './' or '../' are module specifiers. To load the ` +
        `project file '${projectFile}', use './${entry}'.`
      : '';
    return {
      kind: ManifestResolutionKind.Failed,
      reason: `The module specifier '${entry}' does not resolve to a file.${hint}`,
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
      kind: ManifestResolutionKind.Failed,
      reason: `The package '${entry}' cannot be resolved from '${basePath}'. Check that it is installed.`,
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
      kind: ManifestResolutionKind.Failed,
      reason: `The file '${packageJsonPath}' is not valid JSON.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }
  if (typeof customElementsField !== 'string') {
    return {
      kind: ManifestResolutionKind.Failed,
      reason:
        `The package.json of '${entry}' ('${packageJsonPath}') has no "customElements" field, so ` +
        `the package does not say where its manifest is. Configure the manifest file instead, ` +
        `such as '${entry}/custom-elements.json'.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }

  const manifestPath = resolve(dirname(packageJsonPath), customElementsField);
  adapter.recordResourceDependency?.(manifestPath);
  packageJsonResolution.resolutionPaths.add(manifestPath);
  if (!adapter.fileExists(manifestPath)) {
    return {
      kind: ManifestResolutionKind.Failed,
      reason:
        `The "customElements" field in '${packageJsonPath}' points to '${manifestPath}', which ` +
        `does not exist.`,
      resolutionPaths: packageJsonResolution.resolutionPaths,
    };
  }
  return {
    kind: ManifestResolutionKind.Success,
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
  const {resolvedModule: resolved} = resolveResourceModule(
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
 * Finds the nearest package.json at or above `startDirectory` whose `name` is `packageName`,
 * skipping invalid JSON. Records every path it checks, so creating or fixing a nearer file
 * invalidates cached results.
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
 * Resolves a `.json` module specifier as TypeScript does with `resolveJsonModule`, including
 * package `exports`: a file that `exports` doesn't expose stays unresolved even if it exists.
 * Records the files that resolution depends on, including missing candidates, so that creating or
 * changing them reloads the manifests.
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

  const {
    resolvedModule: resolved,
    affectingLocations,
    failedLookupLocations,
  } = resolveResourceModule(
    specifier,
    containingFile,
    {...options, resolveJsonModule: true},
    adapter,
    moduleResolutionCache,
  );
  // Record the package.json files that resolution read, so changes to their `exports` reload the
  // manifest.
  for (const path of affectingLocations) {
    resolutionPaths.add(absoluteFrom(path));
    adapter.recordResourceDependency?.(absoluteFrom(path));
  }
  if (resolved !== undefined && resolved.resolvedFileName.endsWith('.json')) {
    const path = absoluteFrom(resolved.resolvedFileName);
    resolutionPaths.add(path);
    return {path, resolutionPaths};
  }

  const candidates = [
    // Failed lookups include paths that package `exports` redirected to.
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
    // Record missing candidates only in existing directories, to avoid watching many paths under
    // `node_modules`. They only detect creation of the file; resolution still honors `exports`.
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
