/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';
import {CompileShallowModuleMetadata, identifierName} from '../compile_metadata';
import {CompileMetadataResolver} from '../compiler';
import {InjectableCompiler} from '../injectable_compiler';
import {mapLiteral} from '../output/map_util';
import * as o from '../output/output_ast';
import {OutputContext} from '../util';

import {Identifiers as R3} from './r3_identifiers';
import {BUILD_OPTIMIZER_COLOCATE, BUILD_OPTIMIZER_REMOVE, OutputMode} from './r3_types';
import {collectStaticSymbols, convertMetadataToOutput} from './r3_utils';

const EMPTY_ARRAY = o.literalArr([], o.INFERRED_TYPE);
const INJECTOR_DEF = 'ngInjectorDef';
const MODULE_SCOPE = 'ngModuleScope';

function createSelectorMap(
    module: CompileShallowModuleMetadata, resolver: CompileMetadataResolver,
    ctx: OutputContext): o.Expression {
  const symbols = collectStaticSymbols(module.rawExports);
  const results = symbols
                      .map(symbol => {
                        if (resolver.isDirective(symbol)) {
                          const directiveMetadata = resolver.getDirectiveMetadata(symbol);
                          return {type: symbol, selector: directiveMetadata.selector};
                        }
                        if (resolver.isPipe(symbol)) {
                          const pipeMetadata = resolver.getPipeMetadata(symbol);
                          if (pipeMetadata) {
                            return {type: symbol, name: pipeMetadata.name, isPipe: true};
                          }
                        }
                        if (resolver.isNgModule(symbol)) {
                          return {type: symbol, isModule: true};
                        }
                      })
                      .filter(v => v != null);
  return convertMetadataToOutput(results, ctx);
}

export function compileNgModule(
    ctx: OutputContext, ngModule: CompileShallowModuleMetadata,
    injectableCompiler: InjectableCompiler, resolver: CompileMetadataResolver,
    mode: OutputMode): void {
  const className = identifierName(ngModule.type) !;

  const rawImports = ngModule.rawImports ? [ngModule.rawImports] : [];
  const rawExports = ngModule.rawExports ? [ngModule.rawExports] : [];

  const injectorDefArg = mapLiteral({
    'factory':
        injectableCompiler.factoryFor({type: ngModule.type, symbol: ngModule.type.reference}, ctx),
    'providers': convertMetadataToOutput(ngModule.rawProviders, ctx),
    'imports': convertMetadataToOutput([...rawImports, ...rawExports], ctx),
  });

  const injectorDef = o.importExpr(R3.defineInjector).callFn([injectorDefArg]);

  if (mode === OutputMode.PartialClass) {
    ctx.statements.push(new o.ClassStmt(
        /* name */ className,
        /* parent */ null,
        /* fields */
        [
          new o.ClassField(
              /* name */ INJECTOR_DEF,
              /* type */ o.INFERRED_TYPE,
              /* modifiers */[o.StmtModifier.Static],
              /* initializer */ injectorDef),
          new o.ClassField(
              /* name */ 'ngModuleScope',
              /* type */ o.INFERRED_TYPE,
              /* modifiers */[o.StmtModifier.Static],
              /* initializer */ createSelectorMap(ngModule, resolver, ctx))
        ],
        /* getters */[],
        /* constructorMethod */ new o.ClassMethod(null, [], []),
        /* methods */[]));
  } else {
    const classReference = ctx.importExpr(ngModule.type.reference);
    ctx.statements.push(
        new o.CommentStmt(BUILD_OPTIMIZER_COLOCATE),
        classReference.prop(INJECTOR_DEF).set(injectorDef).toStmt(),
        new o.CommentStmt(BUILD_OPTIMIZER_REMOVE),
        classReference.prop(MODULE_SCOPE).set(createSelectorMap(ngModule, resolver, ctx)).toStmt());
  }
}