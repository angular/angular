/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags} from './core';
import * as o from './output/output_ast';
import {Identifiers} from './render3/r3_identifiers';


type MapEntry = {
  key: string; quoted: boolean; value: o.Expression;
};

function mapToMapExpression(map: {[key: string]: o.Expression}): o.LiteralMapExpr {
  const result = Object.keys(map).map(key => ({key, value: map[key], quoted: false}));
  return o.literalMap(result);
}

export interface InjectableDef {
  expression: o.Expression;
  type: o.Type;
}

export interface IvyInjectableDep {
  token: o.Expression;
  optional: boolean;
  self: boolean;
  skipSelf: boolean;
  attribute: boolean;
}

export interface IvyInjectableMetadata {
  name: string;
  type: o.Expression;
  providedIn: o.Expression;
  useType?: IvyInjectableDep[];
  useClass?: o.Expression;
  useFactory?: {factory: o.Expression; deps: IvyInjectableDep[];};
  useExisting?: o.Expression;
  useValue?: o.Expression;
}

export function compileIvyInjectable(meta: IvyInjectableMetadata): InjectableDef {
  let ret: o.Expression = o.NULL_EXPR;
  if (meta.useType !== undefined) {
    const args = meta.useType.map(dep => injectDep(dep));
    ret = new o.InstantiateExpr(meta.type, args);
  } else if (meta.useClass !== undefined) {
    const factory =
        new o.ReadPropExpr(new o.ReadPropExpr(meta.useClass, 'ngInjectableDef'), 'factory');
    ret = new o.InvokeFunctionExpr(factory, []);
  } else if (meta.useValue !== undefined) {
    ret = meta.useValue;
  } else if (meta.useExisting !== undefined) {
    ret = o.importExpr(Identifiers.inject).callFn([meta.useExisting]);
  } else if (meta.useFactory !== undefined) {
    const args = meta.useFactory.deps.map(dep => injectDep(dep));
    ret = new o.InvokeFunctionExpr(meta.useFactory.factory, args);
  } else {
    throw new Error('No instructions for injectable compiler!');
  }

  const token = meta.type;
  const providedIn = meta.providedIn;
  const factory =
      o.fn([], [new o.ReturnStatement(ret)], undefined, undefined, `${meta.name}_Factory`);

  const expression = o.importExpr({
                        moduleName: '@angular/core',
                        name: 'defineInjectable',
                      }).callFn([mapToMapExpression({token, factory, providedIn})]);
  const type = new o.ExpressionType(o.importExpr(
      {
        moduleName: '@angular/core',
        name: 'InjectableDef',
      },
      [new o.ExpressionType(meta.type)]));

  return {
      expression, type,
  };
}

function injectDep(dep: IvyInjectableDep): o.Expression {
  const defaultValue = dep.optional ? o.NULL_EXPR : o.literal(undefined);
  const flags = o.literal(
      InjectFlags.Default | (dep.self && InjectFlags.Self || 0) |
      (dep.skipSelf && InjectFlags.SkipSelf || 0));
  if (!dep.optional && !dep.skipSelf && !dep.self) {
    return o.importExpr(Identifiers.inject).callFn([dep.token]);
  } else {
    return o.importExpr(Identifiers.inject).callFn([
      dep.token,
      defaultValue,
      flags,
    ]);
  }
}
