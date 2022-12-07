/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createHash} from 'crypto';
import module from 'module';
import semver from 'semver';
import * as vm from 'vm';

import {AbsoluteFsPath, PathManipulation, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';

import {PackageJsonFormatPropertiesMap} from './entry_point';

/**
 * The format of a project level configuration file.
 */
export interface NgccProjectConfig {
  /**
   * The packages that are configured by this project config.
   */
  packages?: {[packagePath: string]: RawNgccPackageConfig|undefined};
  /**
   * Options that control how locking the process is handled.
   */
  locking?: ProcessLockingConfiguration;
  /**
   * Name of hash algorithm used to generate hashes of the configuration.
   *
   * Defaults to `sha256`.
   */
  hashAlgorithm?: string;
}

/**
 * Options that control how locking the process is handled.
 */
export interface ProcessLockingConfiguration {
  /**
   * The number of times the AsyncLocker will attempt to lock the process before failing.
   * Defaults to 500.
   */
  retryAttempts?: number;
  /**
   * The number of milliseconds between attempts to lock the process.
   * Defaults to 500ms.
   * */
  retryDelay?: number;
}

/**
 * The raw format of a package level configuration (as it appears in configuration files).
 */
export interface RawNgccPackageConfig {
  /**
   * The entry-points to configure for this package.
   *
   * In the config file the keys are paths relative to the package path.
   */
  entryPoints?: {[entryPointPath: string]: NgccEntryPointConfig};

  /**
   * A collection of regexes that match deep imports to ignore, for this package, rather than
   * displaying a warning.
   */
  ignorableDeepImportMatchers?: RegExp[];
}

/**
 * Configuration options for an entry-point.
 *
 * The existence of a configuration for a path tells ngcc that this should be considered for
 * processing as an entry-point.
 */
export interface NgccEntryPointConfig {
  /** Do not process (or even acknowledge the existence of) this entry-point, if true. */
  ignore?: boolean;

  /**
   * This property, if provided, holds values that will override equivalent properties in an
   * entry-point's package.json file.
   */
  override?: PackageJsonFormatPropertiesMap;

  /**
   * Normally, ngcc will skip compilation of entrypoints that contain imports that can't be resolved
   * or understood. If this option is specified, ngcc will proceed with compiling the entrypoint
   * even in the face of such missing dependencies.
   */
  ignoreMissingDependencies?: boolean;

  /**
   * Enabling this option for an entrypoint tells ngcc that deep imports might be used for the files
   * it contains, and that it should generate private re-exports alongside the NgModule of all the
   * directives/pipes it makes available in support of those imports.
   */
  generateDeepReexports?: boolean;
}

interface VersionedPackageConfig extends RawNgccPackageConfig {
  versionRange: string;
}

/**
 * The internal representation of a configuration file. Configured packages are transformed into
 * `ProcessedNgccPackageConfig` when a certain version is requested.
 */
export class PartiallyProcessedConfig {
  /**
   * The packages that are configured by this project config, keyed by package name.
   */
  packages = new Map<string, VersionedPackageConfig[]>();
  /**
   * Options that control how locking the process is handled.
   */
  locking: ProcessLockingConfiguration = {};
  /**
   * Name of hash algorithm used to generate hashes of the configuration.
   *
   * Defaults to `sha256`.
   */
  hashAlgorithm = 'sha256';

  constructor(projectConfig: NgccProjectConfig) {
    // locking configuration
    if (projectConfig.locking !== undefined) {
      this.locking = projectConfig.locking;
    }

    // packages configuration
    for (const packageNameAndVersion in projectConfig.packages) {
      const packageConfig = projectConfig.packages[packageNameAndVersion];
      if (packageConfig) {
        const [packageName, versionRange = '*'] = this.splitNameAndVersion(packageNameAndVersion);
        this.addPackageConfig(packageName, {...packageConfig, versionRange});
      }
    }

    // hash algorithm config
    if (projectConfig.hashAlgorithm !== undefined) {
      this.hashAlgorithm = projectConfig.hashAlgorithm;
    }
  }

  private splitNameAndVersion(packageNameAndVersion: string): [string, string|undefined] {
    const versionIndex = packageNameAndVersion.lastIndexOf('@');
    // Note that > 0 is because we don't want to match @ at the start of the line
    // which is what you would have with a namespaced package, e.g. `@angular/common`.
    return versionIndex > 0 ?
        [
          packageNameAndVersion.substring(0, versionIndex),
          packageNameAndVersion.substring(versionIndex + 1),
        ] :
        [packageNameAndVersion, undefined];
  }

  /**
   * Registers the configuration for a particular version of the provided package.
   */
  private addPackageConfig(packageName: string, config: VersionedPackageConfig): void {
    if (!this.packages.has(packageName)) {
      this.packages.set(packageName, []);
    }
    this.packages.get(packageName)!.push(config);
  }

  /**
   * Finds the configuration for a particular version of the provided package.
   */
  findPackageConfig(packageName: string, version: string|null): VersionedPackageConfig|null {
    if (!this.packages.has(packageName)) {
      return null;
    }

    const configs = this.packages.get(packageName)!;
    if (version === null) {
      // The package has no version (!) - perhaps the entry-point was from a deep import, which made
      // it impossible to find the package.json.
      // So just return the first config that matches the package name.
      return configs[0];
    }
    return configs.find(
               config =>
                   semver.satisfies(version, config.versionRange, {includePrerelease: true})) ??
        null;
  }

  /**
   * Converts the configuration into a JSON representation that is used to compute a hash of the
   * configuration.
   */
  toJson(): string {
    return JSON.stringify(this, (key: string, value: unknown) => {
      if (value instanceof Map) {
        const res: Record<string, unknown> = {};
        for (const [k, v] of value) {
          res[k] = v;
        }
        return res;
      } else {
        return value;
      }
    });
  }
}

/**
 * The default configuration for ngcc.
 *
 * This is the ultimate fallback configuration that ngcc will use if there is no configuration
 * for a package at the package level or project level.
 *
 * This configuration is for packages that are "dead" - i.e. no longer maintained and so are
 * unlikely to be fixed to work with ngcc, nor provide a package level config of their own.
 *
 * The fallback process for looking up configuration is:
 *
 * Project -> Package -> Default
 *
 * If a package provides its own configuration then that would override this default one.
 *
 * Also application developers can always provide configuration at their project level which
 * will override everything else.
 *
 * Note that the fallback is package based not entry-point based.
 * For example, if a there is configuration for a package at the project level this will replace all
 * entry-point configurations that may have been provided in the package level or default level
 * configurations, even if the project level configuration does not provide for a given entry-point.
 */
export const DEFAULT_NGCC_CONFIG: NgccProjectConfig = {
  packages: {
    // Add default package configuration here. For example:
    // '@angular/fire@^5.2.0': {
    //   entryPoints: {
    //     './database-deprecated': {ignore: true},
    //   },
    // },

    // The package does not contain any `.metadata.json` files in the root directory but only inside
    // `dist/`. Without this config, ngcc does not realize this is a ViewEngine-built Angular
    // package that needs to be compiled to Ivy.
    'angular2-highcharts': {
      entryPoints: {
        '.': {
          override: {
            main: './index.js',
          },
        },
      },
    },

    // The `dist/` directory has a duplicate `package.json` pointing to the same files, which (under
    // certain configurations) can causes ngcc to try to process the files twice and fail.
    // Ignore the `dist/` entry-point.
    'ng2-dragula': {
      entryPoints: {
        './dist': {ignore: true},
      },
    },
  },
  locking: {
    retryDelay: 500,
    retryAttempts: 500,
  }
};

const NGCC_CONFIG_FILENAME = 'ngcc.config.js';

/**
 * The processed package level configuration as a result of processing a raw package level config.
 */
export class ProcessedNgccPackageConfig implements Omit<RawNgccPackageConfig, 'entryPoints'> {
  /**
   * The absolute path to this instance of the package.
   * Note that there may be multiple instances of a package inside a project in nested
   * `node_modules/`. For example, one at `<project-root>/node_modules/some-package/` and one at
   * `<project-root>/node_modules/other-package/node_modules/some-package/`.
   */
  packagePath: AbsoluteFsPath;

  /**
   * The entry-points to configure for this package.
   *
   * In contrast to `RawNgccPackageConfig`, the paths are absolute and take the path of the specific
   * instance of the package into account.
   */
  entryPoints: Map<AbsoluteFsPath, NgccEntryPointConfig>;

  /**
   * A collection of regexes that match deep imports to ignore, for this package, rather than
   * displaying a warning.
   */
  ignorableDeepImportMatchers: RegExp[];

  constructor(fs: PathManipulation, packagePath: AbsoluteFsPath, {
    entryPoints = {},
    ignorableDeepImportMatchers = [],
  }: RawNgccPackageConfig) {
    const absolutePathEntries: [AbsoluteFsPath, NgccEntryPointConfig][] =
        Object.entries(entryPoints).map(([
                                          relativePath, config
                                        ]) => [fs.resolve(packagePath, relativePath), config]);

    this.packagePath = packagePath;
    this.entryPoints = new Map(absolutePathEntries);
    this.ignorableDeepImportMatchers = ignorableDeepImportMatchers;
  }
}

/**
 * Ngcc has a hierarchical configuration system that lets us "fix up" packages that do not
 * work with ngcc out of the box.
 *
 * There are three levels at which configuration can be declared:
 *
 * * Default level - ngcc comes with built-in configuration for well known cases.
 * * Package level - a library author publishes a configuration with their package to fix known
 *   issues.
 * * Project level - the application developer provides a configuration that fixes issues specific
 *   to the libraries used in their application.
 *
 * Ngcc will match configuration based on the package name but also on its version. This allows
 * configuration to provide different fixes to different version ranges of a package.
 *
 * * Package level configuration is specific to the package version where the configuration is
 *   found.
 * * Default and project level configuration should provide version ranges to ensure that the
 *   configuration is only applied to the appropriate versions of a package.
 *
 * When getting a configuration for a package (via `getConfig()`) the caller should provide the
 * version of the package in question, if available. If it is not provided then the first available
 * configuration for a package is returned.
 */
export class NgccConfiguration {
  private defaultConfig: PartiallyProcessedConfig;
  private projectConfig: PartiallyProcessedConfig;
  private cache = new Map<string, VersionedPackageConfig>();
  readonly hash: string;
  readonly hashAlgorithm: string;

  constructor(private fs: ReadonlyFileSystem, baseDir: AbsoluteFsPath) {
    this.defaultConfig = new PartiallyProcessedConfig(DEFAULT_NGCC_CONFIG);
    this.projectConfig = new PartiallyProcessedConfig(this.loadProjectConfig(baseDir));
    this.hashAlgorithm = this.projectConfig.hashAlgorithm;
    this.hash = this.computeHash();
  }

  /**
   * Get the configuration options for locking the ngcc process.
   */
  getLockingConfig(): Required<ProcessLockingConfiguration> {
    let {retryAttempts, retryDelay} = this.projectConfig.locking;
    if (retryAttempts === undefined) {
      retryAttempts = this.defaultConfig.locking.retryAttempts!;
    }
    if (retryDelay === undefined) {
      retryDelay = this.defaultConfig.locking.retryDelay!;
    }
    return {retryAttempts, retryDelay};
  }

  /**
   * Get a configuration for the given `version` of a package at `packagePath`.
   *
   * @param packageName The name of the package whose config we want.
   * @param packagePath The path to the package whose config we want.
   * @param version The version of the package whose config we want, or `null` if the package's
   * package.json did not exist or was invalid.
   */
  getPackageConfig(packageName: string, packagePath: AbsoluteFsPath, version: string|null):
      ProcessedNgccPackageConfig {
    const rawPackageConfig = this.getRawPackageConfig(packageName, packagePath, version);
    return new ProcessedNgccPackageConfig(this.fs, packagePath, rawPackageConfig);
  }

  private getRawPackageConfig(
      packageName: string, packagePath: AbsoluteFsPath,
      version: string|null): VersionedPackageConfig {
    const cacheKey = packageName + (version !== null ? `@${version}` : '');
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const projectLevelConfig = this.projectConfig.findPackageConfig(packageName, version);
    if (projectLevelConfig !== null) {
      this.cache.set(cacheKey, projectLevelConfig);
      return projectLevelConfig;
    }

    const packageLevelConfig = this.loadPackageConfig(packagePath, version);
    if (packageLevelConfig !== null) {
      this.cache.set(cacheKey, packageLevelConfig);
      return packageLevelConfig;
    }

    const defaultLevelConfig = this.defaultConfig.findPackageConfig(packageName, version);
    if (defaultLevelConfig !== null) {
      this.cache.set(cacheKey, defaultLevelConfig);
      return defaultLevelConfig;
    }

    return {versionRange: '*'};
  }

  private loadProjectConfig(baseDir: AbsoluteFsPath): NgccProjectConfig {
    const configFilePath = this.fs.join(baseDir, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        return this.evalSrcFile(configFilePath);
      } catch (e) {
        throw new Error(
            `Invalid project configuration file at "${configFilePath}": ` + (e as Error).message);
      }
    } else {
      return {packages: {}};
    }
  }

  private loadPackageConfig(packagePath: AbsoluteFsPath, version: string|null):
      VersionedPackageConfig|null {
    const configFilePath = this.fs.join(packagePath, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        const packageConfig = this.evalSrcFile(configFilePath);
        return {
          ...packageConfig,
          versionRange: version || '*',
        };
      } catch (e) {
        throw new Error(
            `Invalid package configuration file at "${configFilePath}": ` + (e as Error).message);
      }
    } else {
      return null;
    }
  }

  private evalSrcFile(srcPath: AbsoluteFsPath): any {
    const requireFn = module.createRequire(import.meta.url);
    const src = this.fs.readFile(srcPath);
    const theExports = {};
    const sandbox = {
      module: {exports: theExports},
      exports: theExports,
      require: requireFn,
      __dirname: this.fs.dirname(srcPath),
      __filename: srcPath
    };
    vm.runInNewContext(src, sandbox, {filename: srcPath});
    return sandbox.module.exports;
  }

  private computeHash(): string {
    return createHash(this.hashAlgorithm).update(this.projectConfig.toJson()).digest('hex');
  }
}
