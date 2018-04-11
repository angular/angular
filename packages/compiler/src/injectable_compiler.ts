/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from './aot/static_symbol';
import {CompileInjectableMetadata, CompileNgModuleMetadata, CompileProviderMetadata, identifierName} from './compile_metadata';
import {CompileReflector} from './compile_reflector';
import {InjectFlags, NodeFlags} from './core';
import {Identifiers} from './identifiers';
import * as o from './output/output_ast';
import {convertValueToOutputAst} from './output/value_util';
import {typeSourceSpan} from './parse_util';
import {NgModuleProviderAnalyzer} from './provider_analyzer';
import {OutputContext} from './util';
import {componentFactoryResolverProviderDef, depDef, providerDef} from './view_compiler/provider_compiler';

type MapEntry = {
  key: string,
  quoted: boolean,
  value: o.Expression
};
type MapLiteral = MapEntry[];

function mapEntry(key: string, value: o.Expression): MapEntry {
  return {key, value, quoted: false};
}

export class InjectableCompiler {
  private tokenInjector: StaticSymbol;
  constructor(private reflector: CompileReflector, private alwaysGenerateDef: boolean) {
    this.tokenInjector = reflector.resolveExternalReference(Identifiers.Injector);
  }

  private depsArray(deps: any[], ctx: OutputContext): o.Expression[] {
    return deps.map(dep => {
      let token = dep;
      let defaultValue = undefined;
      let args = [token];
      let flags: InjectFlags = InjectFlags.Default;
      if (Array.isArray(dep)) {
        for (let i = 0; i < dep.length; i++) {
          const v = dep[i];
          if (v) {
            if (v.ngMetadataName === 'Optional') {
              defaultValue = null;
            } else if (v.ngMetadataName === 'SkipSelf') {
              flags |= InjectFlags.SkipSelf;
            } else if (v.ngMetadataName === 'Self') {
              flags |= InjectFlags.Self;
            } else if (v.ngMetadataName === 'Inject') {
              token = v.token;
            } else {
              token = v;
            }
          }
        }
      }

      let tokenExpr: o.Expression;
      if (typeof token === 'string') {
        tokenExpr = o.literal(token);
      } else if (token === this.tokenInjector) {
        tokenExpr = o.importExpr(Identifiers.INJECTOR);
      } else {
        // The InjectableCompiler never runs against an NgFactory file, so it should never use
        // summary imports. The implication of this is that if an @Injectable attempts to useClass
        // a class that's not in the same compilation unit, the Bazel/Blaze rule that builds the
        // @Injectable must have a direct dependency on all of the dependencies of the useClass.
        //
        // In Ivy, every @Injectable will have ngInjectableDef, so useClass won't result in:
        //    factory: () => new UseClass(inject(Dep1), inject(Dep2))
        // but in:
        //    factory: () => UseClass.ngInjectableDef.factory()
        tokenExpr = ctx.importExpr(token, undefined, false);
      }

      if (flags !== InjectFlags.Default || defaultValue !== undefined) {
        args = [tokenExpr, o.literal(defaultValue), o.literal(flags)];
      } else {
        args = [tokenExpr];
      }
      return o.importExpr(Identifiers.inject).callFn(args);
    });
  }

  factoryFor(injectable: CompileInjectableMetadata, ctx: OutputContext): o.Expression {
    let retValue: o.Expression;
    if (injectable.useExisting) {
      retValue = o.importExpr(Identifiers.inject).callFn([ctx.importExpr(injectable.useExisting)]);
    } else if (injectable.useFactory) {
      const deps = injectable.deps || [];
      if (deps.length > 0) {
        retValue = ctx.importExpr(injectable.useFactory).callFn(this.depsArray(deps, ctx));
      } else {
        return ctx.importExpr(injectable.useFactory);
      }
    } else if (injectable.useValue) {
      retValue = convertValueToOutputAst(ctx, injectable.useValue);
    } else {
      const clazz = injectable.useClass || injectable.symbol;
      const depArgs = this.depsArray(this.reflector.parameters(clazz), ctx);
      retValue = new o.InstantiateExpr(ctx.importExpr(clazz), depArgs);
    }
    return o.fn(
        [], [new o.ReturnStatement(retValue)], undefined, undefined,
        injectable.symbol.name + '_Factory');
  }

  injectableDef(injectable: CompileInjectableMetadata, ctx: OutputContext): o.Expression {
    let providedIn: o.Expression = o.NULL_EXPR;
    if (injectable.providedIn !== undefined) {
      if (injectable.providedIn === null) {
        providedIn = o.NULL_EXPR;
      } else if (typeof injectable.providedIn === 'string') {
        providedIn = o.literal(injectable.providedIn);
      } else {
        providedIn = ctx.importExpr(injectable.providedIn);
      }
    }
    const def: MapLiteral = [
      mapEntry('factory', this.factoryFor(injectable, ctx)),
      mapEntry('token', ctx.importExpr(injectable.type.reference)),
      mapEntry('providedIn', providedIn),
    ];
    return o.importExpr(Identifiers.defineInjectable).callFn([o.literalMap(def)]);
  }

  compile(injectable: CompileInjectableMetadata, ctx: OutputContext): void {
    if (this.alwaysGenerateDef || injectable.providedIn !== undefined) {
      const className = identifierName(injectable.type) !;
      const clazz = new o.ClassStmt(
          className, null,
          [
            new o.ClassField(
                'ngInjectableDef', o.INFERRED_TYPE, [o.StmtModifier.Static],
                this.injectableDef(injectable, ctx)),
          ],
          [], new o.ClassMethod(null, [], []), []);
      ctx.statements.push(clazz);
    }
  }
}
