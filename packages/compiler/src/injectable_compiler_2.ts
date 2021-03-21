/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';
import {generateForwardRef} from './render3/partial/util';
import {compileFactoryFunction, FactoryTarget, R3DependencyMetadata, R3FactoryDelegateType, R3FactoryMetadata} from './render3/r3_factory';
import {Identifiers} from './render3/r3_identifiers';
import {R3CompiledExpression, R3Reference, typeWithParameters} from './render3/util';
import {DefinitionMap} from './render3/view/util';

export interface R3InjectableMetadata {
  name: string;
  type: R3Reference;
  internalType: o.Expression;
  typeArgumentCount: number;
  providedIn: R3ProviderExpression;
  useClass?: R3ProviderExpression;
  useFactory?: o.Expression;
  useExisting?: R3ProviderExpression;
  useValue?: R3ProviderExpression;
  deps?: R3DependencyMetadata[];
}

/**
 * An expression used when instantiating an injectable.
 *
 * This is the type of the `useClass`, `useExisting` and `useValue` properties of
 * `R3InjectableMetadata` since those can refer to types that may eagerly reference types that have
 * not yet been defined.
 */
export interface R3ProviderExpression<T extends o.Expression = o.Expression> {
  /**
   * The expression that is used to instantiate the Injectable.
   */
  expression: T;
  /**
   * If true, then the `expression` contains a reference to something that has not yet been
   * defined.
   *
   * This means that the expression must not be eagerly evaluated. Instead it must be wrapped in a
   * function closure that will be evaluated lazily to allow the definition of the expression to be
   * evaluated first.
   *
   * In some cases the expression will naturally be placed inside such a function closure, such as
   * in a fully compiled factory function. In those case nothing more needs to be done.
   *
   * But in other cases, such as partial-compilation the expression will be located in top level
   * code so will need to be wrapped in a function that is passed to a `forwardRef()` call.
   */
  isForwardRef: boolean;
}

export function createR3ProviderExpression<T extends o.Expression>(
    expression: T, isForwardRef: boolean): R3ProviderExpression<T> {
  return {expression, isForwardRef};
}

export function compileInjectable(
    meta: R3InjectableMetadata, resolveForwardRefs: boolean): R3CompiledExpression {
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

    const useClassOnSelf = meta.useClass.expression.isEquivalent(meta.internalType);
    let deps: R3DependencyMetadata[]|undefined = undefined;
    if (meta.deps !== undefined) {
      deps = meta.deps;
    }

    if (deps !== undefined) {
      // factory: () => new meta.useClass(...deps)
      result = compileFactoryFunction({
        ...factoryMeta,
        delegate: meta.useClass.expression,
        delegateDeps: deps,
        delegateType: R3FactoryDelegateType.Class,
      });
    } else if (useClassOnSelf) {
      result = compileFactoryFunction(factoryMeta);
    } else {
      result = {
        statements: [],
        expression: delegateToFactory(
            meta.type.value as o.WrappedNodeExpr<any>,
            meta.useClass.expression as o.WrappedNodeExpr<any>, resolveForwardRefs)
      };
    }
  } else if (meta.useFactory !== undefined) {
    if (meta.deps !== undefined) {
      result = compileFactoryFunction({
        ...factoryMeta,
        delegate: meta.useFactory,
        delegateDeps: meta.deps || [],
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
      expression: meta.useValue.expression,
    });
  } else if (meta.useExisting !== undefined) {
    // useExisting is an `inject` call on the existing token.
    result = compileFactoryFunction({
      ...factoryMeta,
      expression: o.importExpr(Identifiers.inject).callFn([meta.useExisting.expression]),
    });
  } else {
    result = {
      statements: [],
      expression: delegateToFactory(
          meta.type.value as o.WrappedNodeExpr<any>, meta.internalType as o.WrappedNodeExpr<any>,
          resolveForwardRefs)
    };
  }

  const token = meta.internalType;

  const injectableProps =
      new DefinitionMap<{token: o.Expression, factory: o.Expression, providedIn: o.Expression}>();
  injectableProps.set('token', token);
  injectableProps.set('factory', result.expression);

  // Only generate providedIn property if it has a non-null value
  if ((meta.providedIn.expression as o.LiteralExpr).value !== null) {
    injectableProps.set(
        'providedIn',
        meta.providedIn.isForwardRef ? generateForwardRef(meta.providedIn.expression) :
                                       meta.providedIn.expression);
  }

  const expression = o.importExpr(Identifiers.ɵɵdefineInjectable)
                         .callFn([injectableProps.toLiteralMap()], undefined, true);
  return {
    expression,
    type: createInjectableType(meta),
    statements: result.statements,
  };
}

export function createInjectableType(meta: R3InjectableMetadata) {
  return new o.ExpressionType(o.importExpr(
      Identifiers.InjectableDeclaration,
      [typeWithParameters(meta.type.type, meta.typeArgumentCount)]));
}

function delegateToFactory(
    type: o.WrappedNodeExpr<any>, internalType: o.WrappedNodeExpr<any>,
    unwrapForwardRefs: boolean): o.Expression {
  if (type.node === internalType.node) {
    // The types are the same, so we can simply delegate directly to the type's factory.
    // ```
    // factory: type.ɵfac
    // ```
    return internalType.prop('ɵfac');
  }

  if (!unwrapForwardRefs) {
    // The type is not wrapped in a `forwardRef()`, so we create a simple factory function that
    // accepts a sub-type as an argument.
    // ```
    // factory: function(t) { return internalType.ɵfac(t); }
    // ```
    return createFactoryFunction(internalType);
  }

  // The internalType is actually wrapped in a `forwardRef()` so we need to resolve that before
  // calling its factory.
  // ```
  // factory: function(t) { return core.resolveForwardRef(type).ɵfac(t); }
  // ```
  const unwrappedType = o.importExpr(Identifiers.resolveForwardRef).callFn([internalType]);
  return createFactoryFunction(unwrappedType);
}

function createFactoryFunction(type: o.Expression): o.FunctionExpr {
  return o.fn(
      [new o.FnParam('t', o.DYNAMIC_TYPE)],
      [new o.ReturnStatement(type.callMethod('ɵfac', [o.variable('t')]))]);
}
