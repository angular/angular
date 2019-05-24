/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileNgModuleMetadata, CompileTypeMetadata, identifierName} from '../compile_metadata';
import {CompileMetadataResolver} from '../metadata_resolver';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

import {Identifiers as R3} from './r3_identifiers';

/**
 * Write a Renderer2 compatibility module factory to the output context.
 */
export function compileModuleFactory(
    outputCtx: OutputContext, module: CompileNgModuleMetadata,
    backPatchReferenceOf: (module: CompileTypeMetadata) => o.Expression,
    resolver: CompileMetadataResolver) {
  const ngModuleFactoryVar = `${identifierName(module.type)}NgFactory`;

  const parentInjector = 'parentInjector';
  const createFunction = o.fn(
      [new o.FnParam(parentInjector, o.DYNAMIC_TYPE)],
      [new o.IfStmt(
          o.THIS_EXPR.prop(R3.PATCH_DEPS).notIdentical(o.literal(true, o.INFERRED_TYPE)),
          [
            o.THIS_EXPR.prop(R3.PATCH_DEPS).set(o.literal(true, o.INFERRED_TYPE)).toStmt(),
            backPatchReferenceOf(module.type).callFn([]).toStmt()
          ])],
      o.INFERRED_TYPE, null, `${ngModuleFactoryVar}_Create`);

  const moduleFactoryLiteral = o.literalMap([
    {key: 'moduleType', value: outputCtx.importExpr(module.type.reference), quoted: false},
    {key: 'create', value: createFunction, quoted: false}
  ]);

  outputCtx.statements.push(
      o.variable(ngModuleFactoryVar).set(moduleFactoryLiteral).toDeclStmt(o.DYNAMIC_TYPE, [
        o.StmtModifier.Exported, o.StmtModifier.Final
      ]));
}
