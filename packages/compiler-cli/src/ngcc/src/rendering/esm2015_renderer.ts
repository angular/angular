/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {relative, resolve} from 'canonical-path';
import {readFileSync} from 'fs';
import * as ts from 'typescript';

import {DtsFileTransformer} from '../../../ngtsc/transform';
import {DecorationAnalysis} from '../analysis/decoration_analyzer';
import {SwitchMarkerAnalysis} from '../analysis/switch_marker_analyzer';
import {IMPORT_PREFIX} from '../constants';
import {DtsMapper} from '../host/dts_mapper';
import {NgccReflectionHost} from '../host/ngcc_host';

import {Fesm2015Renderer} from './fesm2015_renderer';
import {FileInfo} from './renderer';

export class Esm2015Renderer extends Fesm2015Renderer {
  constructor(
      protected host: NgccReflectionHost, protected isCore: boolean,
      protected rewriteCoreImportsTo: ts.SourceFile|null, protected sourcePath: string,
      protected targetPath: string, protected dtsMapper: DtsMapper) {
    super(host, isCore, rewriteCoreImportsTo, sourcePath, targetPath);
  }

  renderFile(
      sourceFile: ts.SourceFile, decorationAnalysis: DecorationAnalysis|undefined,
      switchMarkerAnalysis: SwitchMarkerAnalysis|undefined, targetPath: string): FileInfo[] {
    const renderedFiles =
        super.renderFile(sourceFile, decorationAnalysis, switchMarkerAnalysis, targetPath);

    // Transform the `.d.ts` files.
    // TODO(gkalpak): What about `.d.ts` source maps? (See
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-9.html#new---declarationmap.)
    if (decorationAnalysis) {
      // Create a `DtsFileTransformer` for the source file and record the generated fields, which
      // will allow the corresponding `.d.ts` file to be transformed later.
      const dtsTransformer = new DtsFileTransformer(this.rewriteCoreImportsTo, IMPORT_PREFIX);
      decorationAnalysis.analyzedClasses.forEach(
          analyzedClass =>
              dtsTransformer.recordStaticField(analyzedClass.name, analyzedClass.compilation));

      // Find the corresponding `.d.ts` file.
      const sourceFileName = sourceFile.fileName;
      const originalDtsFileName = this.dtsMapper.getDtsFileNameFor(sourceFileName);
      const originalDtsContents = readFileSync(originalDtsFileName, 'utf8');

      // Transform the `.d.ts` file based on the recorded source file changes.
      const transformedDtsFileName =
          resolve(this.targetPath, relative(this.sourcePath, originalDtsFileName));
      const transformedDtsContents = dtsTransformer.transform(originalDtsContents, sourceFileName);

      // Add the transformed `.d.ts` file to the list of output files.
      renderedFiles.push({path: transformedDtsFileName, contents: transformedDtsContents});
    }

    return renderedFiles;
  }
}
