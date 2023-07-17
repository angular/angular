/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';
import {compileFactoryFunction, FactoryTarget, R3DependencyMetadata, R3FactoryDelegateType, R3FactoryMetadata} from './render3/r3_factory';
import {Identifiers} from './render3/r3_identifiers';
import {convertFromMaybeForwardRefExpression, ForwardRefHandling, generateForwardRef, MaybeForwardRefExpression, R3CompiledExpression, R3Reference, typeWithParameters} from './render3/util';
import {DefinitionMap} from './render3/view/util';

export interface R3InjectableMetadata {
  name: string;
  type: R3Reference;
  typeArgumentCount: number;
  providedIn: MaybeForwardRefExpression;
  useClass?: MaybeForwardRefExpression;
  useFactory?: o.Expression;
  useExisting?: MaybeForwardRefExpression;
  useValue?: MaybeForwardRefExpression;
  deps?: R3DependencyMetadata[];
}

export function compileInjectable(
    meta: R3InjectableMetadata, resolveForwardRefs: boolean): R3CompiledExpression {
  let result: {expression: o.Expression, statements: o.Statement[]}|null = null;

  const factoryMeta: R3FactoryMetadata = {
    name: meta.name,
    type: meta.type,
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

    const useClassOnSelf = meta.useClass.expression.isEquivalent(meta.type.value);
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
          meta.type.value as o.WrappedNodeExpr<any>, meta.type.value as o.WrappedNodeExpr<any>,
          resolveForwardRefs)
    };
  }

  const token = meta.type.value;

  const injectableProps =
      new DefinitionMap<{token: o.Expression, factory: o.Expression, providedIn: o.Expression}>();
  injectableProps.set('token', token);
  injectableProps.set('factory', result.expression);

  // Only generate providedIn property if it has a non-null value
  if ((meta.providedIn.expression as o.LiteralExpr).value !== null) {
    injectableProps.set('providedIn', convertFromMaybeForwardRefExpression(meta.providedIn));
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
    type: o.WrappedNodeExpr<any>, useType: o.WrappedNodeExpr<any>,
    unwrapForwardRefs: boolean): o.Expression {
  if (type.node === useType.node) {
    // The types are the same, so we can simply delegate directly to the type's factory.
    // ```
    // factory: type.ɵfac
    // ```
    return useType.prop('ɵfac');
  }

  if (!unwrapForwardRefs) {
    // The type is not wrapped in a `forwardRef()`, so we create a simple factory function that
    // accepts a sub-type as an argument.
    // ```
    // factory: function(t) { return useType.ɵfac(t); }
    // ```
    return createFactoryFunction(useType);
  }

  // The useType is actually wrapped in a `forwardRef()` so we need to resolve that before
  // calling its factory.
  // ```
  // factory: function(t) { return core.resolveForwardRef(type).ɵfac(t); }
  // ```
  const unwrappedType = o.importExpr(Identifiers.resolveForwardRef).callFn([useType]);
  return createFactoryFunction(unwrappedType);
}

function createFactoryFunction(type: o.Expression): o.FunctionExpr {
  return o.fn(
      [new o.FnParam('t', o.DYNAMIC_TYPE)],
      [new o.ReturnStatement(type.prop('ɵfac').callFn([o.variable('t')]))]);
}
