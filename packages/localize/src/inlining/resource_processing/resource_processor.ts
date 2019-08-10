/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import {relative} from 'path';

import {TranslationBundle} from '../translation_files/translation_bundle';

import {OutputPathFn} from './output_path';
import {ResourceHandler} from './resource_handler';

/**
 * Process each resource (e.g. source file or static asset) using the given `ResourceHandlers`.
 * The resource will be processed by the first handler that returns true for `canHandle()`.
 */
export class ResourceProcessor {
  constructor(private resourceHandlers: ResourceHandler[]) {}

  processResources(
      inputPaths: string[], rootPath: string, outputPathFn: OutputPathFn,
      translations: TranslationBundle[]): void {
    inputPaths.forEach(inputPath => {
      const contents = fs.readFileSync(inputPath);
      const relativePath = relative(rootPath, inputPath);
      for (const resourceHandler of this.resourceHandlers) {
        if (resourceHandler.canHandle(relativePath, contents)) {
          return resourceHandler.handle(
              rootPath, relativePath, contents, outputPathFn, translations);
        }
      }
      throw new Error(`Unable to handle resource file: ${inputPath}`);
    });
  }
}