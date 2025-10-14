/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {outputAst as o} from '@angular/compiler';
import {getProjectRelativePath} from '../../util/src/path';
import {extractHmrDependencies} from './extract_dependencies';
import ts from 'typescript';
/**
 * Extracts the HMR metadata for a class declaration.
 * @param clazz Class being analyzed.
 * @param reflection Reflection host.
 * @param compilerHost Compiler host to use when resolving file names.
 * @param rootDirs Root directories configured by the user.
 * @param definition Analyzed component definition.
 * @param factory Analyzed component factory.
 * @param deferBlockMetadata Metadata about the defer blocks in the component.
 * @param classMetadata Analyzed `setClassMetadata` expression, if any.
 * @param debugInfo Analyzed `setClassDebugInfo` expression, if any.
 */
export function extractHmrMetatadata(
  clazz,
  reflection,
  evaluator,
  compilerHost,
  rootDirs,
  definition,
  factory,
  deferBlockMetadata,
  classMetadata,
  debugInfo,
) {
  if (!reflection.isClass(clazz)) {
    return null;
  }
  const sourceFile = ts.getOriginalNode(clazz).getSourceFile();
  const filePath =
    getProjectRelativePath(sourceFile.fileName, rootDirs, compilerHost) ||
    compilerHost.getCanonicalFileName(sourceFile.fileName);
  const dependencies = extractHmrDependencies(
    clazz,
    definition,
    factory,
    deferBlockMetadata,
    classMetadata,
    debugInfo,
    reflection,
    evaluator,
  );
  if (dependencies === null) {
    return null;
  }
  const meta = {
    type: new o.WrappedNodeExpr(clazz.name),
    className: clazz.name.text,
    filePath,
    localDependencies: dependencies.local,
    namespaceDependencies: dependencies.external,
  };
  return meta;
}
//# sourceMappingURL=metadata.js.map
