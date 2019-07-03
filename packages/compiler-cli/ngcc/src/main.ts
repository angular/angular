/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, absoluteFrom, dirname, getFileSystem, resolve} from '../../src/ngtsc/file_system';
import {CommonJsDependencyHost} from './dependencies/commonjs_dependency_host';
import {DependencyResolver} from './dependencies/dependency_resolver';
import {EsmDependencyHost} from './dependencies/esm_dependency_host';
import {ModuleResolver} from './dependencies/module_resolver';
import {UmdDependencyHost} from './dependencies/umd_dependency_host';
import {ConsoleLogger, LogLevel} from './logging/console_logger';
import {Logger} from './logging/logger';
import {hasBeenProcessed, markAsProcessed} from './packages/build_marker';
import {NgccConfiguration} from './packages/configuration';
import {EntryPointFormat, EntryPointJsonProperty, SUPPORTED_FORMAT_PROPERTIES, getEntryPointFormat} from './packages/entry_point';
import {makeEntryPointBundle} from './packages/entry_point_bundle';
import {EntryPointFinder} from './packages/entry_point_finder';
import {Transformer} from './packages/transformer';
import {PathMappings} from './utils';
import {FileWriter} from './writing/file_writer';
import {InPlaceFileWriter} from './writing/in_place_file_writer';
import {NewEntryPointFileWriter} from './writing/new_entry_point_file_writer';

/**
 * The options to configure the ngcc compiler.
 */
export interface NgccOptions {
  /** The absolute path to the `node_modules` folder that contains the packages to process. */
  basePath: string;
  /**
   * The path to the primary package to be processed. If not absolute then it must be relative to
   * `basePath`.
   *
   * All its dependencies will need to be processed too.
   */
  targetEntryPointPath?: string;
  /**
   * Which entry-point properties in the package.json to consider when processing an entry-point.
   * Each property should hold a path to the particular bundle format for the entry-point.
   * Defaults to all the properties in the package.json.
   */
  propertiesToConsider?: string[];
  /**
   * Whether to process all formats specified by (`propertiesToConsider`)  or to stop processing
   * this entry-point at the first matching format. Defaults to `true`.
   */
  compileAllFormats?: boolean;
  /**
   * Whether to create new entry-points bundles rather than overwriting the original files.
   */
  createNewEntryPointFormats?: boolean;
  /**
   * Provide a logger that will be called with log messages.
   */
  logger?: Logger;
  /**
   * Paths mapping configuration (`paths` and `baseUrl`), as found in `ts.CompilerOptions`.
   * These are used to resolve paths to locally built Angular libraries.
   */
  pathMappings?: PathMappings;
  /**
   * Provide a file-system service that will be used by ngcc for all file interactions.
   */
  fileSystem?: FileSystem;
}

const SUPPORTED_FORMATS: EntryPointFormat[] = ['esm5', 'esm2015', 'umd', 'commonjs'];

/**
 * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
 *
 * You can call this function to process one or more npm packages, to ensure
 * that they are compatible with the ivy compiler (ngtsc).
 *
 * @param options The options telling ngcc what to compile and how.
 */
export function mainNgcc(
    {basePath, targetEntryPointPath, propertiesToConsider = SUPPORTED_FORMAT_PROPERTIES,
     compileAllFormats = true, createNewEntryPointFormats = false,
     logger = new ConsoleLogger(LogLevel.info), pathMappings}: NgccOptions): void {
  const fileSystem = getFileSystem();
  const transformer = new Transformer(fileSystem, logger);
  const moduleResolver = new ModuleResolver(fileSystem, pathMappings);
  const esmDependencyHost = new EsmDependencyHost(fileSystem, moduleResolver);
  const umdDependencyHost = new UmdDependencyHost(fileSystem, moduleResolver);
  const commonJsDependencyHost = new CommonJsDependencyHost(fileSystem, moduleResolver);
  const resolver = new DependencyResolver(fileSystem, logger, {
    esm5: esmDependencyHost,
    esm2015: esmDependencyHost,
    umd: umdDependencyHost,
    commonjs: commonJsDependencyHost
  });
  const config = new NgccConfiguration(fileSystem, dirname(absoluteFrom(basePath)));
  const finder = new EntryPointFinder(fileSystem, config, logger, resolver);
  const fileWriter = getFileWriter(fileSystem, createNewEntryPointFormats);

  const absoluteTargetEntryPointPath =
      targetEntryPointPath ? resolve(basePath, targetEntryPointPath) : undefined;

  if (absoluteTargetEntryPointPath &&
      hasProcessedTargetEntryPoint(
          fileSystem, absoluteTargetEntryPointPath, propertiesToConsider, compileAllFormats)) {
    logger.debug('The target entry-point has already been processed');
    return;
  }

  const {entryPoints, invalidEntryPoints} =
      finder.findEntryPoints(absoluteFrom(basePath), absoluteTargetEntryPointPath, pathMappings);

  invalidEntryPoints.forEach(invalidEntryPoint => {
    logger.debug(
        `Invalid entry-point ${invalidEntryPoint.entryPoint.path}.`,
        `It is missing required dependencies:\n` +
            invalidEntryPoint.missingDependencies.map(dep => ` - ${dep}`).join('\n'));
  });

  if (absoluteTargetEntryPointPath && entryPoints.length === 0) {
    markNonAngularPackageAsProcessed(
        fileSystem, absoluteTargetEntryPointPath, propertiesToConsider);
    return;
  }

  for (const entryPoint of entryPoints) {
    // Are we compiling the Angular core?
    const isCore = entryPoint.name === '@angular/core';

    const compiledFormats = new Set<string>();
    const entryPointPackageJson = entryPoint.packageJson;
    const entryPointPackageJsonPath = fileSystem.resolve(entryPoint.path, 'package.json');

    const hasProcessedDts = hasBeenProcessed(entryPointPackageJson, 'typings');

    for (let i = 0; i < propertiesToConsider.length; i++) {
      const property = propertiesToConsider[i] as EntryPointJsonProperty;
      const formatPath = entryPointPackageJson[property];
      const format = getEntryPointFormat(fileSystem, entryPoint, property);

      // No format then this property is not supposed to be compiled.
      if (!formatPath || !format || SUPPORTED_FORMATS.indexOf(format) === -1) continue;

      if (hasBeenProcessed(entryPointPackageJson, property)) {
        compiledFormats.add(formatPath);
        logger.debug(`Skipping ${entryPoint.name} : ${property} (already compiled).`);
        continue;
      }

      const isFirstFormat = compiledFormats.size === 0;
      const processDts = !hasProcessedDts && isFirstFormat;

      // We don't break if this if statement fails because we still want to mark
      // the property as processed even if its underlying format has been built already.
      if (!compiledFormats.has(formatPath) && (compileAllFormats || isFirstFormat)) {
        const bundle = makeEntryPointBundle(
            fileSystem, entryPoint, formatPath, isCore, property, format, processDts, pathMappings,
            true);
        if (bundle) {
          logger.info(`Compiling ${entryPoint.name} : ${property} as ${format}`);
          const transformedFiles = transformer.transform(bundle);
          fileWriter.writeBundle(entryPoint, bundle, transformedFiles);
          compiledFormats.add(formatPath);
        } else {
          logger.warn(
              `Skipping ${entryPoint.name} : ${format} (no valid entry point file for this format).`);
        }
      } else if (!compileAllFormats) {
        logger.debug(`Skipping ${entryPoint.name} : ${property} (already compiled).`);
      }

      // Either this format was just compiled or its underlying format was compiled because of a
      // previous property.
      if (compiledFormats.has(formatPath)) {
        markAsProcessed(fileSystem, entryPointPackageJson, entryPointPackageJsonPath, property);
        if (processDts) {
          markAsProcessed(fileSystem, entryPointPackageJson, entryPointPackageJsonPath, 'typings');
        }
      }
    }

    if (compiledFormats.size === 0) {
      throw new Error(
          `Failed to compile any formats for entry-point at (${entryPoint.path}). Tried ${propertiesToConsider}.`);
    }
  }
}

function getFileWriter(fs: FileSystem, createNewEntryPointFormats: boolean): FileWriter {
  return createNewEntryPointFormats ? new NewEntryPointFileWriter(fs) : new InPlaceFileWriter(fs);
}

function hasProcessedTargetEntryPoint(
    fs: FileSystem, targetPath: AbsoluteFsPath, propertiesToConsider: string[],
    compileAllFormats: boolean) {
  const packageJsonPath = resolve(targetPath, 'package.json');
  // It might be that this target is configured in which case its package.json might not exist.
  if (!fs.exists(packageJsonPath)) {
    return false;
  }
  const packageJson = JSON.parse(fs.readFile(packageJsonPath));

  for (const property of propertiesToConsider) {
    if (packageJson[property]) {
      // Here is a property that should be processed
      if (hasBeenProcessed(packageJson, property as EntryPointJsonProperty)) {
        if (!compileAllFormats) {
          // It has been processed and we only need one, so we are done.
          return true;
        }
      } else {
        // It has not been processed but we need all of them, so we are done.
        return false;
      }
    }
  }
  // Either all formats need to be compiled and there were none that were unprocessed,
  // Or only the one matching format needs to be compiled but there was at least one matching
  // property before the first processed format that was unprocessed.
  return true;
}

/**
 * If we get here, then the requested entry-point did not contain anything compiled by
 * the old Angular compiler. Therefore there is nothing for ngcc to do.
 * So mark all formats in this entry-point as processed so that clients of ngcc can avoid
 * triggering ngcc for this entry-point in the future.
 */
function markNonAngularPackageAsProcessed(
    fs: FileSystem, path: AbsoluteFsPath, propertiesToConsider: string[]) {
  const packageJsonPath = resolve(path, 'package.json');
  const packageJson = JSON.parse(fs.readFile(packageJsonPath));
  propertiesToConsider.forEach(formatProperty => {
    if (packageJson[formatProperty])
      markAsProcessed(fs, packageJson, packageJsonPath, formatProperty as EntryPointJsonProperty);
  });
}
