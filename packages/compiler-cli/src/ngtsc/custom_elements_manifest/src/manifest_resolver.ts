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
import {RequiredDelegations, resolveModuleName} from '../../util/src/typescript';

/** Result of resolving a `customElementsManifests` option entry to a manifest file. */
export type ManifestResolutionResult =
  | {
      kind: 'success';
      path: AbsoluteFsPath;
      /**
       * The npm package the manifest belongs to, when the option entry named one (a bare
       * package or a `.json` module specifier), or `null` for path-based entries. Used to
       * resolve same-package type references in the manifest.
       */
      packageName: string | null;
      /** Files whose changes can alter this resolution, including the resolved manifest. */
      resolutionPaths: Set<AbsoluteFsPath>;
    }
  | {kind: 'failure'; reason: string; resolutionPaths: Set<AbsoluteFsPath>};

/**
 * Extracts the package portion of a module specifier (e.g. `@my/lib/custom-elements.json`
 * → `@my/lib`), or `null` if the specifier doesn't start with a valid package name.
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
const MANIFEST_MARKER_TS = MANIFEST_MARKER + '.ts';

/**
 * Resolves a single entry of the `customElementsManifests` compiler option to the absolute path of a
 * Custom Elements Manifest file.
 *
 * Three forms are supported:
 *  - Paths relative to the tsconfig directory (`./custom-elements.json`) or absolute paths.
 *  - Module specifiers of a `.json` file inside a package (`@my/lib/custom-elements.json`),
 *    resolved through the project's module resolution.
 *  - Bare package specifiers (`@my/lib`), resolved to the manifest referenced by the
 *    `customElements` field of the package's `package.json`, per the Custom Elements Manifest
 *    convention.
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

  // A bare package specifier: locate the package's `package.json` and follow its
  // `customElements` field.
  const packageJsonResolution = resolveJsonSpecifier(
    `${entry}/package.json`,
    basePath,
    options,
    adapter,
    moduleResolutionCache,
  );
  let packageJsonPath = packageJsonResolution.path;
  if (packageJsonPath === null) {
    // Package `exports` commonly omit `package.json`, even when the package declares a
    // `customElements` field. Resolve the package's public entry point and walk back to its owning
    // package.json rather than requiring package.json itself to be exported.
    packageJsonPath = resolvePackageJsonFromEntrypoint(
      entry,
      basePath,
      options,
      adapter,
      moduleResolutionCache,
    );
    if (packageJsonPath !== null) {
      packageJsonResolution.resolutionPaths.add(packageJsonPath);
    }
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

  let directory = dirname(absoluteFrom(resolved.resolvedFileName));
  while (true) {
    const packageJsonPath = join(directory, 'package.json');
    const content = adapter.fileExists(packageJsonPath) ? adapter.readFile(packageJsonPath) : null;
    if (typeof content === 'string') {
      try {
        const packageJson = JSON.parse(content) as {[key: string]: unknown};
        if (packageJson['name'] === packageName) {
          return packageJsonPath;
        }
      } catch {
        // Keep walking. A nearer malformed package.json cannot own a successfully resolved entry
        // point whose package name is being searched for.
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
 * Resolves a module specifier that names a `.json` file, e.g. `@my/lib/custom-elements.json`.
 *
 * Resolution first goes through the project's module resolution (which honors a host-provided
 * `resolveModuleNames`, e.g. under Bazel) with `resolveJsonModule` enabled. Because package
 * `exports` maps frequently do not expose `.json` files, a failed resolution falls back to
 * enumerating the locations module resolution *would* have considered — obtained from the
 * `failedLookupLocations` of a resolution that is guaranteed to fail — and probing them for the
 * file. This mirrors the strategy used by `AdapterResourceLoader` for component resources.
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

  const resolved = resolveModuleName(
    specifier,
    containingFile,
    {...options, resolveJsonModule: true},
    adapter,
    moduleResolutionCache,
  );
  if (resolved !== undefined && resolved.resolvedFileName.endsWith('.json')) {
    const path = absoluteFrom(resolved.resolvedFileName);
    resolutionPaths.add(path);
    return {path, resolutionPaths};
  }

  // `failedLookupLocations` is present on ts.ResolvedModuleWithFailedLookupLocations but is
  // marked @internal in TypeScript. See https://github.com/Microsoft/TypeScript/issues/28770.
  type ResolvedModuleWithFailedLookupLocations = ts.ResolvedModuleWithFailedLookupLocations & {
    failedLookupLocations: ReadonlyArray<string>;
  };
  const failedLookup = ts.resolveModuleName(
    specifier + MANIFEST_MARKER,
    containingFile,
    options,
    createLookupResolutionHost(adapter),
  ) as ResolvedModuleWithFailedLookupLocations;
  if (failedLookup.failedLookupLocations === undefined) {
    return {path: null, resolutionPaths};
  }

  for (const candidate of failedLookup.failedLookupLocations) {
    if (!candidate.endsWith(MANIFEST_MARKER_TS)) {
      continue;
    }
    const path = absoluteFrom(candidate.slice(0, -MANIFEST_MARKER_TS.length));
    if (adapter.fileExists(path)) {
      resolutionPaths.add(path);
      return {path, resolutionPaths};
    }
    // Retain a bounded watch target when the containing package/subdirectory already exists. This
    // allows creation of a previously missing manifest to invalidate the project without retaining
    // every speculative node_modules lookup from TypeScript.
    if (path.endsWith(specifier) && adapter.directoryExists?.(dirname(path)) === true) {
      resolutionPaths.add(path);
    }
  }
  return {path: null, resolutionPaths};
}

/**
 * Derives a `ts.ModuleResolutionHost` from the compiler adapter that recognizes the special
 * manifest marker and does not go to the filesystem for these requests, as they are known not
 * to exist.
 */
function createLookupResolutionHost(
  adapter: NgCompilerAdapter,
): RequiredDelegations<ts.ModuleResolutionHost> {
  return {
    directoryExists(directoryName: string): boolean {
      if (directoryName.includes(MANIFEST_MARKER)) {
        return false;
      } else if (adapter.directoryExists !== undefined) {
        return adapter.directoryExists(directoryName);
      } else {
        // TypeScript's module resolution logic assumes that the directory exists when no host
        // implementation is available.
        return true;
      }
    },
    fileExists(fileName: string): boolean {
      if (fileName.includes(MANIFEST_MARKER)) {
        return false;
      } else {
        return adapter.fileExists(fileName);
      }
    },
    readFile: adapter.readFile.bind(adapter),
    getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
    getDirectories: adapter.getDirectories?.bind(adapter),
    realpath: adapter.realpath?.bind(adapter),
    trace: adapter.trace?.bind(adapter),
    useCaseSensitiveFileNames:
      typeof adapter.useCaseSensitiveFileNames === 'function'
        ? adapter.useCaseSensitiveFileNames.bind(adapter)
        : adapter.useCaseSensitiveFileNames,
  };
}
