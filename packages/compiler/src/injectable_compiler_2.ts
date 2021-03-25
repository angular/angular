/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Identifiers} from './identifiers';
import * as o from './output/output_ast';
import {compileFactoryFunction, FactoryTarget, R3DependencyMetadata, R3FactoryDelegateType, R3FactoryMetadata} from './render3/r3_factory';
import {R3Reference, typeWithParameters} from './render3/util';
import {DefinitionMap} from './render3/view/util';

export interface InjectableDef {
  expression: o.Expression;
  type: o.Type;
  statements: o.Statement[];
}

export interface R3InjectableMetadata {
  name: string;
  type: R3Reference;
  internalType: o.Expression;
  typeArgumentCount: number;
  providedIn: o.Expression;
  useClass?: o.Expression;
  useFactory?: o.Expression;
  useExisting?: o.Expression;
  useValue?: o.Expression;
  userDeps?: R3DependencyMetadata[];
}

export function compileInjectable(meta: R3InjectableMetadata): InjectableDef {
  let result: {expression: o.Expression, statements: o.Statement[]}|null = null;

  const factoryMeta: R3FactoryMetadata = {
    name: meta.name,
    type: meta.type,
    internalType: meta.internalType,
    typeArgumentCount: meta.typeArgumentCount,
    deps: [],
    target: FactoryTarget.Injectable,
  };

  if (meta.useClass !== undefined) {
    // meta.useClass has two modes of operation. Either deps are specified, in which case `new` is
    // used to instantiate the class with dependencies injected, or deps are not specified and
    // the factory of the class is used to instantiate it.
    //
    // A special case exists for useClass: Type where Type is the injectable type itself and no
    // deps are specified, in which case 'useClass' is effectively ignored.

    const useClassOnSelf = meta.useClass.isEquivalent(meta.internalType);
    let deps: R3DependencyMetadata[]|undefined = undefined;
    if (meta.userDeps !== undefined) {
      deps = meta.userDeps;
    }

    if (deps !== undefined) {
      // factory: () => new meta.useClass(...deps)
      result = compileFactoryFunction({
        ...factoryMeta,
        delegate: meta.useClass,
        delegateDeps: deps,
        delegateType: R3FactoryDelegateType.Class,
      });
    } else if (useClassOnSelf) {
      result = compileFactoryFunction(factoryMeta);
    } else {
      result = delegateToFactory(
          meta.type.value as o.WrappedNodeExpr<any>, meta.useClass as o.WrappedNodeExpr<any>);
    }
  } else if (meta.useFactory !== undefined) {
    if (meta.userDeps !== undefined) {
      result = compileFactoryFunction({
        ...factoryMeta,
        delegate: meta.useFactory,
        delegateDeps: meta.userDeps || [],
        delegateType: R3FactoryDelegateType.Function,
      });
    } else {
      result = {
        statements: [],
        expression: o.fn([], [new o.ReturnStatement(meta.useFactory.callFn([]))])
      };
    }
  } else if (meta.useValue !== undefined) {
    // Note: it's safe to use `meta.useValue` instead of the `USE_VALUE in meta` check used for
    // client code because meta.useValue is an Expression which will be defined even if the actual
    // value is undefined.
    result = compileFactoryFunction({
      ...factoryMeta,
      expression: meta.useValue,
    });
  } else if (meta.useExisting !== undefined) {
    // useExisting is an `inject` call on the existing token.
    result = compileFactoryFunction({
      ...factoryMeta,
      expression: o.importExpr(Identifiers.inject).callFn([meta.useExisting]),
    });
  } else {
    result = delegateToFactory(
        meta.type.value as o.WrappedNodeExpr<any>, meta.internalType as o.WrappedNodeExpr<any>);
  }

  const token = meta.internalType;

  const injectableProps =
      new DefinitionMap<{token: o.Expression, factory: o.Expression, providedIn: o.Expression}>();
  injectableProps.set('token', token);
  injectableProps.set('factory', result.expression);

  // Only generate providedIn property if it has a non-null value
  if ((meta.providedIn as o.LiteralExpr).value !== null) {
    injectableProps.set('providedIn', meta.providedIn);
  }

  const expression = o.importExpr(Identifiers.ɵɵdefineInjectable)
                         .callFn([injectableProps.toLiteralMap()], undefined, true);
  const type = new o.ExpressionType(o.importExpr(
      Identifiers.InjectableDef, [typeWithParameters(meta.type.type, meta.typeArgumentCount)]));

  return {
    expression,
    type,
    statements: result.statements,
  };
}

function delegateToFactory(type: o.WrappedNodeExpr<any>, internalType: o.WrappedNodeExpr<any>) {
  return {
    statements: [],
    // If types are the same, we can generate `factory: type.ɵfac`
    // If types are different, we have to generate a wrapper function to ensure
    // the internal type has been resolved (`factory: function(t) { return type.ɵfac(t); }`)
    expression: type.node === internalType.node ?
        internalType.prop('ɵfac') :
        o.fn([new o.FnParam('t', o.DYNAMIC_TYPE)], [new o.ReturnStatement(internalType.callMethod(
                                                       'ɵfac', [o.variable('t')]))])
  };
}
