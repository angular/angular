/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {checkMarker, writeMarker} from './packages/build_marker';
import {DependencyHost} from './packages/dependency_host';
import {DependencyResolver} from './packages/dependency_resolver';
import {EntryPointFormat, EntryPointJsonProperty, getEntryPointFormat} from './packages/entry_point';
import {makeEntryPointBundle} from './packages/entry_point_bundle';
import {EntryPointFinder} from './packages/entry_point_finder';
import {Transformer} from './packages/transformer';

/**
 * The options to configure the ngcc compiler.
 */
export interface NgccOptions {
  /** The path to the node_modules folder that contains the packages to compile. */
  baseSourcePath: string;
  /** The path to the node_modules folder where modified files should be written. */
  baseTargetPath?: string;
  /**
   * The path, relative to `baseSourcePath` of the primary package to be compiled.
   * All its dependencies will need to be compiled too.
   */
  targetEntryPointPath?: string;
  /**
   * Which entry-point properties in the package.json to consider when compiling.
   * Each of properties contain a path to particular bundle format for a given entry-point.
   */
  propertiesToConsider?: EntryPointJsonProperty[];
}

const SUPPORTED_FORMATS: EntryPointFormat[] = ['esm5', 'esm2015', 'fesm5', 'fesm2015'];

/**
 * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
 *
 * You can call this function to process one or more npm packages, to ensure
 * that they are compatible with the ivy compiler (ngtsc).
 *
 * @param options The options telling ngcc what to compile and how.
 */
export function mainNgcc({baseSourcePath, baseTargetPath = baseSourcePath, targetEntryPointPath,
                          propertiesToConsider}: NgccOptions): void {
  const transformer = new Transformer(baseSourcePath, baseTargetPath);
  const host = new DependencyHost();
  const resolver = new DependencyResolver(host);
  const finder = new EntryPointFinder(resolver);

  const {entryPoints} = finder.findEntryPoints(baseSourcePath, targetEntryPointPath);
  entryPoints.forEach(entryPoint => {

    // Are we compiling the Angular core?
    const isCore = entryPoint.name === '@angular/core';

    let dtsTransformFormat: EntryPointFormat|undefined;

    const propertiesToCompile =
        propertiesToConsider || Object.keys(entryPoint.packageJson) as EntryPointJsonProperty[];
    const compiledFormats = new Set<EntryPointFormat>();

    for (let i = 0; i < propertiesToCompile.length; i++) {
      const property = propertiesToCompile[i];
      const format = getEntryPointFormat(entryPoint.packageJson, property);

      // No format then this property is not supposed to be compiled.
      if (!format || SUPPORTED_FORMATS.indexOf(format) === -1) continue;

      // We don't want to compile a format more than once.
      // This could happen if there are multiple properties that map to the same format...
      // E.g. `fesm5` and `module` both can point to the flat ESM5 format.
      if (!compiledFormats.has(format)) {
        compiledFormats.add(format);

        // Use the first format found for typings transformation.
        dtsTransformFormat = dtsTransformFormat || format;


        if (checkMarker(entryPoint, property)) {
          const bundle =
              makeEntryPointBundle(entryPoint, isCore, format, format === dtsTransformFormat);
          if (bundle) {
            transformer.transform(entryPoint, isCore, bundle);
          } else {
            console.warn(
                `Skipping ${entryPoint.name} : ${format} (no entry point file for this format).`);
          }
        } else {
          console.warn(`Skipping ${entryPoint.name} : ${property} (already compiled).`);
        }
      }
      // Write the built-with-ngcc marker.
      writeMarker(entryPoint, property);
    }

    if (!dtsTransformFormat) {
      throw new Error(
          `Failed to compile any formats for entry-point at (${entryPoint.path}). Tried ${propertiesToCompile}.`);
    }
  });
}

export {NGCC_VERSION} from './packages/build_marker';