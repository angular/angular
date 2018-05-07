/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import {CompileShallowModuleMetadata, identifierName} from '../compile_metadata';
import {InjectableCompiler} from '../injectable_compiler';
import {mapLiteral} from '../output/map_util';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

import {Identifiers as R3} from './r3_identifiers';

function convertMetaToOutput(meta: any, ctx: OutputContext): o.Expression {
  if (Array.isArray(meta)) {
    return o.literalArr(meta.map(entry => convertMetaToOutput(entry, ctx)));
  }
  if (meta instanceof StaticSymbol) {
    return ctx.importExpr(meta);
  }
  if (meta == null) {
    return o.literal(meta);
  }

  throw new Error(`Internal error: Unsupported or unknown metadata: ${meta}`);
}

export function compileNgModule(
    ctx: OutputContext, ngModule: CompileShallowModuleMetadata,
    injectableCompiler: InjectableCompiler): void {
  const className = identifierName(ngModule.type) !;

  const rawImports = ngModule.rawImports ? [ngModule.rawImports] : [];
  const rawExports = ngModule.rawExports ? [ngModule.rawExports] : [];

  const injectorDefArg = mapLiteral({
    'factory':
        injectableCompiler.factoryFor({type: ngModule.type, symbol: ngModule.type.reference}, ctx),
    'providers': convertMetaToOutput(ngModule.rawProviders, ctx),
    'imports': convertMetaToOutput([...rawImports, ...rawExports], ctx),
  });

  const injectorDef = o.importExpr(R3.defineInjector).callFn([injectorDefArg]);

  ctx.statements.push(new o.ClassStmt(
      /* name */ className,
      /* parent */ null,
      /* fields */[new o.ClassField(
          /* name */ 'ngInjectorDef',
          /* type */ o.INFERRED_TYPE,
          /* modifiers */[o.StmtModifier.Static],
          /* initializer */ injectorDef, )],
      /* getters */[],
      /* constructorMethod */ new o.ClassMethod(null, [], []),
      /* methods */[]));
}