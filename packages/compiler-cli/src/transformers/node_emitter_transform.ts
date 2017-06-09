/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GeneratedFile} from '@angular/compiler';
import * as ts from 'typescript';

import {TypeScriptNodeEmitter} from './node_emitter';

export function getAngularEmitterTransformFactory(generatedFiles: GeneratedFile[]): () =>
    (sourceFile: ts.SourceFile) => ts.SourceFile {
  return function() {
    const map = new Map(generatedFiles.filter(g => g.stmts && g.stmts.length)
                            .map<[string, GeneratedFile]>(g => [g.genFileUrl, g]));
    const emitter = new TypeScriptNodeEmitter();
    return function(sourceFile: ts.SourceFile): ts.SourceFile {
      const g = map.get(sourceFile.fileName);
      if (g && g.stmts) {
        const [newSourceFile] = emitter.updateSourceFile(sourceFile, g.stmts);
        return newSourceFile;
      }
      return sourceFile;
    };
  };
}