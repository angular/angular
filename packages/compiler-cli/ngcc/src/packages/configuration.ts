/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as vm from 'vm';
import {AbsoluteFsPath, FileSystem, dirname, join, resolve} from '../../../src/ngtsc/file_system';
import {PackageJsonFormatProperties} from './entry_point';

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
  override?: PackageJsonFormatProperties;
}

const NGCC_CONFIG_FILENAME = 'ngcc.config.js';

export class NgccConfiguration {
  // TODO: change string => ModuleSpecifier when we tighten the path types in #30556
  private cache = new Map<string, NgccPackageConfig>();

  constructor(private fs: FileSystem, baseDir: AbsoluteFsPath) {
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

    const packageConfig = this.loadPackageConfig(packagePath);
    packageConfig.entryPoints = this.processEntryPoints(packagePath, packageConfig.entryPoints);
    this.cache.set(packagePath, packageConfig);
    return packageConfig;
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

  private loadPackageConfig(packagePath: AbsoluteFsPath): NgccPackageConfig {
    const configFilePath = join(packagePath, NGCC_CONFIG_FILENAME);
    if (this.fs.exists(configFilePath)) {
      try {
        return this.evalSrcFile(configFilePath);
      } catch (e) {
        throw new Error(`Invalid package configuration file at "${configFilePath}": ` + e.message);
      }
    } else {
      return {entryPoints: {}};
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