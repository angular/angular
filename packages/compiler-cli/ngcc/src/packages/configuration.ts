/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {satisfies} from 'semver';
import * as vm from 'vm';
import {AbsoluteFsPath, FileSystem, dirname, join, resolve} from '../../../src/ngtsc/file_system';
import {PackageJsonFormatPropertiesMap} from './entry_point';

/**
 * The format of a project level configuration file.
 */
export interface NgccProjectConfig<T = NgccPackageConfig> { packages: {[packagePath: string]: T}; }

/**
 * The format of a package level configuration file.
 */
export interface NgccPackageConfig {
  /**
   * The entry-points to configure for this package.
   *
   * In the config file the keys can be paths relative to the package path;
   * but when being read back from the `NgccConfiguration` service, these paths
   * will be absolute.
   */
  entryPoints: {[entryPointPath: string]: NgccEntryPointConfig;};
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
      //     './database-deprecated': {
      //       ignore: true,
      //     },
      //   },
      // },
  }
};

interface VersionedPackageConfig extends NgccPackageConfig {
  versionRange: string;
}

const NGCC_CONFIG_FILENAME = 'ngcc.config.js';

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
  private defaultConfig: NgccProjectConfig<VersionedPackageConfig[]>;
  private projectConfig: NgccProjectConfig<VersionedPackageConfig[]>;
  private cache = new Map<string, VersionedPackageConfig>();

  constructor(private fs: FileSystem, baseDir: AbsoluteFsPath) {
    this.defaultConfig = this.processProjectConfig(baseDir, DEFAULT_NGCC_CONFIG);
    this.projectConfig = this.processProjectConfig(baseDir, this.loadProjectConfig(baseDir));
  }

  /**
   * Get a configuration for the given `version` of a package at `packagePath`.
   *
   * @param packagePath The path to the package whose config we want.
   * @param version The version of the package whose config we want, or `null` if the package's
   * package.json did not exist or was invalid.
   */
  getConfig(packagePath: AbsoluteFsPath, version: string|null): VersionedPackageConfig {
    const cacheKey = packagePath + (version !== null ? `@${version}` : '');
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) !;
    }

    const projectLevelConfig =
        findSatisfactoryVersion(this.projectConfig.packages[packagePath], version);
    if (projectLevelConfig !== null) {
      this.cache.set(cacheKey, projectLevelConfig);
      return projectLevelConfig;
    }

    const packageLevelConfig = this.loadPackageConfig(packagePath, version);
    if (packageLevelConfig !== null) {
      this.cache.set(cacheKey, packageLevelConfig);
      return packageLevelConfig;
    }

    const defaultLevelConfig =
        findSatisfactoryVersion(this.defaultConfig.packages[packagePath], version);
    if (defaultLevelConfig !== null) {
      this.cache.set(cacheKey, defaultLevelConfig);
      return defaultLevelConfig;
    }

    return {versionRange: '*', entryPoints: {}};
  }

  private processProjectConfig(baseDir: AbsoluteFsPath, projectConfig: NgccProjectConfig):
      NgccProjectConfig<VersionedPackageConfig[]> {
    const processedConfig: NgccProjectConfig<VersionedPackageConfig[]> = {packages: {}};
    for (const packagePathAndVersion in projectConfig.packages) {
      const packageConfig = projectConfig.packages[packagePathAndVersion];
      if (packageConfig) {
        const [packagePath, versionRange = '*'] = this.splitPathAndVersion(packagePathAndVersion);
        const absPackagePath = resolve(baseDir, 'node_modules', packagePath);
        const entryPoints = this.processEntryPoints(absPackagePath, packageConfig);
        processedConfig.packages[absPackagePath] = processedConfig.packages[absPackagePath] || [];
        processedConfig.packages[absPackagePath].push({versionRange, entryPoints});
      }
    }
    return processedConfig;
  }

  private loadProjectConfig(baseDir: AbsoluteFsPath): NgccProjectConfig {
    const configFilePath = join(baseDir, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        return this.evalSrcFile(configFilePath);
      } catch (e) {
        throw new Error(`Invalid project configuration file at "${configFilePath}": ` + e.message);
      }
    } else {
      return {packages: {}};
    }
  }

  private loadPackageConfig(packagePath: AbsoluteFsPath, version: string|null):
      VersionedPackageConfig|null {
    const configFilePath = join(packagePath, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        return {
          versionRange: version || '*',
          entryPoints: this.processEntryPoints(packagePath, this.evalSrcFile(configFilePath)),
        };
      } catch (e) {
        throw new Error(`Invalid package configuration file at "${configFilePath}": ` + e.message);
      }
    } else {
      return null;
    }
  }

  private evalSrcFile(srcPath: AbsoluteFsPath): any {
    const src = this.fs.readFile(srcPath);
    const theExports = {};
    const sandbox = {
      module: {exports: theExports},
      exports: theExports, require,
      __dirname: dirname(srcPath),
      __filename: srcPath
    };
    vm.runInNewContext(src, sandbox, {filename: srcPath});
    return sandbox.module.exports;
  }

  private processEntryPoints(packagePath: AbsoluteFsPath, packageConfig: NgccPackageConfig):
      {[entryPointPath: string]: NgccEntryPointConfig;} {
    const processedEntryPoints: {[entryPointPath: string]: NgccEntryPointConfig;} = {};
    for (const entryPointPath in packageConfig.entryPoints) {
      // Change the keys to be absolute paths
      processedEntryPoints[resolve(packagePath, entryPointPath)] =
          packageConfig.entryPoints[entryPointPath];
    }
    return processedEntryPoints;
  }

  private splitPathAndVersion(packagePathAndVersion: string): [string, string|undefined] {
    const versionIndex = packagePathAndVersion.lastIndexOf('@');
    // Note that > 0 is because we don't want to match @ at the start of the line
    // which is what you would have with a namespaced package, e.g. `@angular/common`.
    return versionIndex > 0 ?
        [
          packagePathAndVersion.substring(0, versionIndex),
          packagePathAndVersion.substring(versionIndex + 1)
        ] :
        [packagePathAndVersion, undefined];
  }
}

function findSatisfactoryVersion(
    configs: VersionedPackageConfig[] | undefined, version: string | null): VersionedPackageConfig|
    null {
  if (configs === undefined) {
    return null;
  }
  if (version === null) {
    // The package has no version (!) - perhaps the entry-point was from a deep import, which made
    // it impossible to find the package.json.
    // So just return the first config that matches the package name.
    return configs[0];
  }
  return configs.find(config => satisfies(version, config.versionRange)) || null;
}
