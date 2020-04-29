/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, absoluteFromSourceFile} from '../../file_system';

import {isExtended as isExtendedSf, isShim, NgExtension, sfExtensionData} from './expando';
import {makeShimFileName} from './util';

/**
 * Manipulates the `referencedFiles` property of `ts.SourceFile`s to add references to shim files
 * for each original source file, causing the shims to be loaded into the program as well.
 *
 * `ShimReferenceTagger`s are intended to operate during program creation only.
 */
export class ShimReferenceTagger {
  private suffixes: string[];

  /**
   * Tracks which original files have been processed and had shims generated if necessary.
   *
   * This is used to avoid generating shims twice for the same file.
   */
  private tagged = new Set<ts.SourceFile>();

  /**
   * Whether shim tagging is currently being performed.
   */
  private enabled: boolean = true;

  constructor(shimExtensions: string[]) {
    this.suffixes = shimExtensions.map(extension => `.${extension}.ts`);
  }

  /**
   * Tag `sf` with any needed references if it's not a shim itself.
   */
  tag(sf: ts.SourceFile): void {
    if (!this.enabled || sf.isDeclarationFile || isShim(sf) || this.tagged.has(sf)) {
      return;
    }

    sfExtensionData(sf).originalReferencedFiles = sf.referencedFiles;
    const referencedFiles = [...sf.referencedFiles];

    const sfPath = absoluteFromSourceFile(sf);
    for (const suffix of this.suffixes) {
      referencedFiles.push({
        fileName: makeShimFileName(sfPath, suffix),
        pos: 0,
        end: 0,
      });
    }

    sf.referencedFiles = referencedFiles;
    this.tagged.add(sf);
  }

  /**
   * Restore the original `referencedFiles` values of all tagged `ts.SourceFile`s and disable the
   * `ShimReferenceTagger`.
   */
  finalize(): void {
    this.enabled = false;
    for (const sf of this.tagged) {
      if (!isExtendedSf(sf)) {
        continue;
      }

      const extensionData = sfExtensionData(sf);
      if (extensionData.originalReferencedFiles !== null) {
        sf.referencedFiles = extensionData.originalReferencedFiles! as ts.FileReference[];
      }
    }
    this.tagged.clear();
  }
}
