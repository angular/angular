/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from 'canonical-path';

import {AbsoluteFsPath, PathSegment} from '../../src/ngtsc/path';

import {checkMarker, writeMarker} from './packages/build_marker';
import {DependencyHost} from './packages/dependency_host';
import {DependencyResolver} from './packages/dependency_resolver';
import {EntryPointFormat, EntryPointJsonProperty, SUPPORTED_FORMAT_PROPERTIES, getEntryPointFormat} from './packages/entry_point';
import {makeEntryPointBundle} from './packages/entry_point_bundle';
import {EntryPointFinder} from './packages/entry_point_finder';
import {Transformer} from './packages/transformer';


/**
 * The options to configure the ngcc compiler.
 */
export interface NgccOptions {
  /** The absolute path to the `node_modules` folder that contains the packages to process. */
  basePath: string;
  /**
   * The path, relative to `basePath` to the primary package to be processed.
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
}

const SUPPORTED_FORMATS: EntryPointFormat[] = ['esm5', 'esm2015'];

/**
 * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
 *
 * You can call this function to process one or more npm packages, to ensure
 * that they are compatible with the ivy compiler (ngtsc).
 *
 * @param options The options telling ngcc what to compile and how.
 */
export function mainNgcc({basePath, targetEntryPointPath,
                          propertiesToConsider = SUPPORTED_FORMAT_PROPERTIES,
                          compileAllFormats = true}: NgccOptions): void {
  const transformer = new Transformer(basePath, basePath);
  const host = new DependencyHost();
  const resolver = new DependencyResolver(host);
  const finder = new EntryPointFinder(resolver);

  const absoluteTargetEntryPointPath = targetEntryPointPath ?
      AbsoluteFsPath.from(resolve(basePath, targetEntryPointPath)) :
      undefined;
  const {entryPoints} =
      finder.findEntryPoints(AbsoluteFsPath.from(basePath), absoluteTargetEntryPointPath);
  entryPoints.forEach(entryPoint => {

    // Are we compiling the Angular core?
    const isCore = entryPoint.name === '@angular/core';

    const compiledFormats = new Set<string>();

    for (let i = 0; i < propertiesToConsider.length; i++) {
      const property = propertiesToConsider[i] as EntryPointJsonProperty;
      const formatPath = entryPoint.packageJson[property];
      const format = getEntryPointFormat(property);

      // No format then this property is not supposed to be compiled.
      if (!formatPath || !format || SUPPORTED_FORMATS.indexOf(format) === -1) continue;

      if (checkMarker(entryPoint, property)) {
        compiledFormats.add(formatPath);
        console.warn(`Skipping ${entryPoint.name} : ${property} (already compiled).`);
        continue;
      }

      // We don't break if this if statement fails because we still want to mark
      // the property as processed even if its underlying format has been built already.
      if (!compiledFormats.has(formatPath) && (compileAllFormats || compiledFormats.size === 0)) {
        const bundle = makeEntryPointBundle(
            entryPoint.path, formatPath, entryPoint.typings, isCore, format,
            compiledFormats.size === 0);
        if (bundle) {
          console.warn(`Compiling ${entryPoint.name} : ${property} as ${format}`);
          transformer.transform(bundle);
          compiledFormats.add(formatPath);
        } else {
          console.warn(
              `Skipping ${entryPoint.name} : ${format} (no valid entry point file for this format).`);
        }
      } else if (!compileAllFormats) {
        console.warn(`Skipping ${entryPoint.name} : ${property} (already compiled).`);
      }

      // Either this format was just compiled or its underlying format was compiled because of a
      // previous property.
      if (compiledFormats.has(formatPath)) {
        writeMarker(entryPoint, property);
      }
    }

    if (compiledFormats.size === 0) {
      throw new Error(
          `Failed to compile any formats for entry-point at (${entryPoint.path}). Tried ${propertiesToConsider}.`);
    }
  });
}
