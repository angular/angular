/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {checkMarkerFile, writeMarkerFile} from './packages/build_marker';
import {DependencyHost} from './packages/dependency_host';
import {DependencyResolver} from './packages/dependency_resolver';
import {EntryPointFormat} from './packages/entry_point';
import {makeEntryPointBundle} from './packages/entry_point_bundle';
import {EntryPointFinder} from './packages/entry_point_finder';
import {Transformer} from './packages/transformer';

/**
 * The options to configure the ngcc compiler.
 */
export interface NgccOptions {
  /** The path to the node_modules folder that contains the packages to compile. */
  baseSourcePath: string;
  /** A list of JavaScript bundle formats that should be compiled. */
  formats: EntryPointFormat[];
  /** The path to the node_modules folder where modified files should be written. */
  baseTargetPath?: string;
  /**
   * The path, relative to `baseSourcePath` of the primary package to be compiled.
   * All its dependencies will need to be compiled too.
   */
  targetEntryPointPath?: string;
}

/**
 * This is the main entry-point into ngcc (aNGular Compatibility Compiler).
 *
 * You can call this function to process one or more npm packages, to ensure
 * that they are compatible with the ivy compiler (ngtsc).
 *
 * @param options The options telling ngcc what to compile and how.
 */
export function mainNgcc({baseSourcePath, formats, baseTargetPath = baseSourcePath,
                          targetEntryPointPath}: NgccOptions): void {
  const transformer = new Transformer(baseSourcePath, baseTargetPath);
  const host = new DependencyHost();
  const resolver = new DependencyResolver(host);
  const finder = new EntryPointFinder(resolver);

  const {entryPoints} = finder.findEntryPoints(baseSourcePath, targetEntryPointPath);
  entryPoints.forEach(entryPoint => {

    // Are we compiling the Angular core?
    const isCore = entryPoint.name === '@angular/core';

    // We transform the d.ts typings files while transforming one of the formats.
    // This variable decides with which of the available formats to do this transform.
    // It is marginally faster to process via the flat file if available.
    const dtsTransformFormat: EntryPointFormat = entryPoint.fesm2015 ? 'fesm2015' : 'esm2015';

    formats.forEach(format => {
      if (checkMarkerFile(entryPoint, format)) {
        console.warn(`Skipping ${entryPoint.name} : ${format} (already built).`);
        return;
      }

      const bundle =
          makeEntryPointBundle(entryPoint, isCore, format, format === dtsTransformFormat);
      if (bundle === null) {
        console.warn(
            `Skipping ${entryPoint.name} : ${format} (no entry point file for this format).`);
      } else {
        transformer.transform(entryPoint, isCore, bundle);
      }

      // Write the built-with-ngcc marker
      writeMarkerFile(entryPoint, format);
    });
  });
}
