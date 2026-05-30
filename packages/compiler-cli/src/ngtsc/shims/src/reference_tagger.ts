/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFromSourceFile} from '../../file_system';
import {isNonDeclarationTsPath} from '../../util/src/typescript';

import {isShim, sfExtensionData} from './expando';
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
    this.suffixes = shimExtensions.map((extension) => `.${extension}.ts`);
  }

  /**
   * Tag `sf` with any needed references if it's not a shim itself.
   */
  tag(sf: ts.SourceFile): void {
    if (
      !this.enabled ||
      sf.isDeclarationFile ||
      isShim(sf) ||
      this.tagged.has(sf) ||
      !isNonDeclarationTsPath(sf.fileName)
    ) {
      return;
    }

    const ext = sfExtensionData(sf);

    // If this file has never been tagged before, capture its `referencedFiles` in the extension
    // data.
    if (ext.originalReferencedFiles === null) {
      ext.originalReferencedFiles = sf.referencedFiles;
    }

    const referencedFiles = [...ext.originalReferencedFiles];

    const sfPath = absoluteFromSourceFile(sf);
    for (const suffix of this.suffixes) {
      referencedFiles.push({
        fileName: makeShimFileName(sfPath, suffix),
        pos: 0,
        end: 0,
      });
    }

    ext.taggedReferenceFiles = referencedFiles;
    sf.referencedFiles = referencedFiles;
    this.tagged.add(sf);
  }

  /**
   * Disable the `ShimReferenceTagger` and free memory associated with tracking tagged files.
   */
  finalize(): void {
    this.enabled = false;
    this.tagged.clear();
  }
}
