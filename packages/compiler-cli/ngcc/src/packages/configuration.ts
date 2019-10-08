/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as vm from 'vm';
import {AbsoluteFsPath, FileSystem, dirname, join, resolve} from '../../../src/ngtsc/file_system';
import {PackageJsonFormatPropertiesMap} from './entry_point';

/**
 * The format of a project level configuration file.
 */
export interface NgccProjectConfig { packages: {[packagePath: string]: NgccPackageConfig}; }

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

const NGCC_CONFIG_FILENAME = 'ngcc.config.js';

export class NgccConfiguration {
  private defaultConfig: NgccProjectConfig;
  private cache = new Map<string, NgccPackageConfig>();

  constructor(private fs: FileSystem, baseDir: AbsoluteFsPath) {
    this.defaultConfig = this.processDefaultConfig(baseDir);
    const projectConfig = this.loadProjectConfig(baseDir);
    for (const packagePath in projectConfig.packages) {
      const absPackagePath = resolve(baseDir, 'node_modules', packagePath);
      const packageConfig = projectConfig.packages[packagePath];
      packageConfig.entryPoints =
          this.processEntryPoints(absPackagePath, packageConfig.entryPoints);
      this.cache.set(absPackagePath, packageConfig);
    }
  }

  getConfig(packagePath: AbsoluteFsPath): NgccPackageConfig {
    if (this.cache.has(packagePath)) {
      return this.cache.get(packagePath) !;
    }

    const packageConfig = this.loadPackageConfig(packagePath) ||
        this.defaultConfig.packages[packagePath] || {entryPoints: {}};
    this.cache.set(packagePath, packageConfig);
    return packageConfig;
  }

  private processDefaultConfig(baseDir: AbsoluteFsPath): NgccProjectConfig {
    const defaultConfig: NgccProjectConfig = {packages: {}};
    for (const packagePath in DEFAULT_NGCC_CONFIG.packages) {
      const absPackagePath = resolve(baseDir, 'node_modules', packagePath);
      const packageConfig = DEFAULT_NGCC_CONFIG.packages[packagePath];
      if (packageConfig) {
        packageConfig.entryPoints =
            this.processEntryPoints(absPackagePath, packageConfig.entryPoints);
        defaultConfig.packages[absPackagePath] = packageConfig;
      }
    }
    return defaultConfig;
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

  private loadPackageConfig(packagePath: AbsoluteFsPath): NgccPackageConfig|null {
    const configFilePath = join(packagePath, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        const packageConfig = this.evalSrcFile(configFilePath);
        packageConfig.entryPoints = this.processEntryPoints(packagePath, packageConfig.entryPoints);
        return packageConfig;
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

  private processEntryPoints(
      packagePath: AbsoluteFsPath, entryPoints: {[entryPointPath: string]: NgccEntryPointConfig;}):
      {[entryPointPath: string]: NgccEntryPointConfig;} {
    const processedEntryPoints: {[entryPointPath: string]: NgccEntryPointConfig;} = {};
    for (const entryPointPath in entryPoints) {
      // Change the keys to be absolute paths
      processedEntryPoints[resolve(packagePath, entryPointPath)] = entryPoints[entryPointPath];
    }
    return processedEntryPoints;
  }
}
