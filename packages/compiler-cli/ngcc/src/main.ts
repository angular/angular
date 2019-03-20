/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '../../src/ngtsc/path';
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
  baseSourcePath: AbsoluteFsPath;
  /**
   * The path, relative to `baseSourcePath` of the primary package to be compiled.
   * All its dependencies will need to be compiled too.
   */
  targetEntryPointPath?: AbsoluteFsPath;
  /**
   * Which entry-point properties in the package.json to consider when compiling.
   * Each of properties contain a path to particular bundle format for a given entry-point.
   */
  propertiesToConsider?: EntryPointJsonProperty[];
  /**
   * Whether to compile all specified formats or to stop compiling this entry-point at the first
   * matching format. Defaults to `true`.
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
export function mainNgcc({baseSourcePath, targetEntryPointPath, propertiesToConsider,
                          compileAllFormats = true}: NgccOptions): void {
  const transformer = new Transformer(baseSourcePath, baseSourcePath);
  const host = new DependencyHost();
  const resolver = new DependencyResolver(host);
  const finder = new EntryPointFinder(resolver);

  const {entryPoints} = finder.findEntryPoints(baseSourcePath, targetEntryPointPath);
  entryPoints.forEach(entryPoint => {

    // Are we compiling the Angular core?
    const isCore = entryPoint.name === '@angular/core';

    const propertiesToCompile =
        propertiesToConsider || Object.keys(entryPoint.packageJson) as EntryPointJsonProperty[];
    const compiledFormats = new Set<string>();

    for (let i = 0; i < propertiesToCompile.length; i++) {
      const property = propertiesToCompile[i];
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
          `Failed to compile any formats for entry-point at (${entryPoint.path}). Tried ${propertiesToCompile}.`);
    }
  });
}
