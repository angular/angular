/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  R3CompiledExpression,
  R3ComponentDeferMetadata,
  R3HmrMetadata,
  outputAst as o,
} from '@angular/compiler';
import {DeclarationNode, ReflectionHost} from '../../reflection';
import {getProjectRelativePath} from '../../util/src/path';
import {CompileResult} from '../../transform';
import {extractHmrDependencies} from './extract_dependencies';
import ts from 'typescript';
import {PartialEvaluator} from '../../partial_evaluator';

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
  clazz: DeclarationNode,
  reflection: ReflectionHost,
  evaluator: PartialEvaluator,
  compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
  rootDirs: readonly string[],
  definition: R3CompiledExpression,
  factory: CompileResult,
  deferBlockMetadata: R3ComponentDeferMetadata,
  classMetadata: o.Statement | null,
  debugInfo: o.Statement | null,
): R3HmrMetadata | null {
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

  const meta: R3HmrMetadata = {
    type: new o.WrappedNodeExpr(clazz.name),
    className: clazz.name.text,
    filePath,
    localDependencies: dependencies.local,
    namespaceDependencies: dependencies.external,
  };

  return meta;
}
