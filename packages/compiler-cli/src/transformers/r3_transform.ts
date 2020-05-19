/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PartialModule, Statement, StaticSymbol} from '@angular/compiler';
import * as ts from 'typescript';

import {updateSourceFile} from './node_emitter';

export type Transformer = (sourceFile: ts.SourceFile) => ts.SourceFile;
export type TransformerFactory = (context: ts.TransformationContext) => Transformer;

/**
 * Returns a transformer that adds the requested static methods specified by modules.
 */
export function getAngularClassTransformerFactory(
    modules: PartialModule[], annotateForClosureCompiler: boolean): TransformerFactory {
  if (modules.length === 0) {
    // If no modules are specified, just return an identity transform.
    return () => sf => sf;
  }
  const moduleMap = new Map(modules.map<[string, PartialModule]>(m => [m.fileName, m]));
  return function(context: ts.TransformationContext) {
    return function(sourceFile: ts.SourceFile): ts.SourceFile {
      const module = moduleMap.get(sourceFile.fileName);
      if (module && module.statements.length > 0) {
        const [newSourceFile] = updateSourceFile(sourceFile, module, annotateForClosureCompiler);
        return newSourceFile;
      }
      return sourceFile;
    };
  };
}
