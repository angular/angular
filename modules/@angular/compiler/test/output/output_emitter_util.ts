/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileIdentifierMetadata} from '@angular/compiler/src/compile_metadata';
import * as o from '@angular/compiler/src/output/output_ast';
import {ImportGenerator} from '@angular/compiler/src/output/path_util';
import {assetUrl} from '@angular/compiler/src/util';
import {EventEmitter} from '@angular/core';
import {BaseError} from '@angular/core/src/facade/errors';
import {ViewType} from '@angular/core/src/linker/view_type';

export class ExternalClass {
  changeable: any;
  constructor(public data: any) { this.changeable = data; }
  someMethod(a: any /** TODO #9100 */) { return {'param': a, 'data': this.data}; }
}

var testDataIdentifier = new CompileIdentifierMetadata({
  name: 'ExternalClass',
  moduleUrl: `asset:@angular/lib/compiler/test/output/output_emitter_util`,
  reference: ExternalClass
});

var eventEmitterIdentifier = new CompileIdentifierMetadata(
    {name: 'EventEmitter', moduleUrl: assetUrl('core'), reference: EventEmitter});

var enumIdentifier = new CompileIdentifierMetadata({
  name: 'ViewType.HOST',
  moduleUrl: assetUrl('core', 'linker/view_type'),
  reference: ViewType.HOST
});

var baseErrorIdentifier = new CompileIdentifierMetadata(
    {name: 'BaseError', moduleUrl: assetUrl('core', 'facade/errors'), reference: BaseError});

export var codegenExportsVars = [
  'getExpressions',
];


var _getExpressionsStmts: o.Statement[] = [
  o.variable('readVar').set(o.literal('someValue')).toDeclStmt(),

  o.variable('changedVar').set(o.literal('initialValue')).toDeclStmt(),
  o.variable('changedVar').set(o.literal('changedValue')).toStmt(),

  o.variable('map')
      .set(o.literalMap([
        ['someKey', o.literal('someValue')],
        ['changeable', o.literal('initialValue')],
      ]))
      .toDeclStmt(),
  o.variable('map').key(o.literal('changeable')).set(o.literal('changedValue')).toStmt(),

  o.variable('externalInstance')
      .set(o.importExpr(testDataIdentifier).instantiate([o.literal('someValue')]))
      .toDeclStmt(),
  o.variable('externalInstance').prop('changeable').set(o.literal('changedValue')).toStmt(),

  o.variable('fn')
      .set(o.fn(
          [new o.FnParam('param')],
          [new o.ReturnStatement(o.literalMap([['param', o.variable('param')]]))], o.DYNAMIC_TYPE))
      .toDeclStmt(),

  o.variable('throwError')
      .set(o.fn([], [new o.ThrowStmt(
                        o.importExpr(baseErrorIdentifier).instantiate([o.literal('someError')]))]))
      .toDeclStmt(),

  o.variable('catchError')
      .set(o.fn(
          [new o.FnParam('runCb')],
          [new o.TryCatchStmt(
              [o.variable('runCb').callFn([]).toStmt()],
              [new o.ReturnStatement(o.literalArr([o.CATCH_ERROR_VAR, o.CATCH_STACK_VAR]))])],
          o.DYNAMIC_TYPE))
      .toDeclStmt(),

  o.variable('dynamicInstance')
      .set(o.variable('DynamicClass').instantiate([
        o.literal('someValue'), o.literal('dynamicValue')
      ]))
      .toDeclStmt(),
  o.variable('dynamicInstance').prop('dynamicChangeable').set(o.literal('changedValue')).toStmt(),

  new o.ReturnStatement(o.literalMap([
    ['stringLiteral', o.literal('Hello World!')],
    ['intLiteral', o.literal(42)],
    ['boolLiteral', o.literal(true)],
    ['arrayLiteral', o.literalArr([o.literal(0)])],
    ['mapLiteral', o.literalMap([['key0', o.literal(0)]])],

    ['readVar', o.variable('readVar')],
    ['changedVar', o.variable('changedVar')],
    ['readKey', o.variable('map').key(o.literal('someKey'))],
    ['changedKey', o.variable('map').key(o.literal('changeable'))],
    ['readPropExternalInstance', o.variable('externalInstance').prop('data')],
    ['readPropDynamicInstance', o.variable('dynamicInstance').prop('dynamicProp')],
    ['readGetterDynamicInstance', o.variable('dynamicInstance').prop('dynamicGetter')],
    ['changedPropExternalInstance', o.variable('externalInstance').prop('changeable')],
    ['changedPropDynamicInstance', o.variable('dynamicInstance').prop('dynamicChangeable')],

    [
      'invokeMethodExternalInstance',
      o.variable('externalInstance').callMethod('someMethod', [o.literal('someParam')])
    ],
    [
      'invokeMethodExternalInstanceViaBind',
      o.variable('externalInstance')
          .prop('someMethod')
          .callMethod(o.BuiltinMethod.Bind, [o.variable('externalInstance')])
          .callFn([o.literal('someParam')])
    ],
    [
      'invokeMethodDynamicInstance',
      o.variable('dynamicInstance').callMethod('dynamicMethod', [o.literal('someParam')])
    ],
    [
      'invokeMethodDynamicInstanceViaBind',
      o.variable('dynamicInstance')
          .prop('dynamicMethod')
          .callMethod(o.BuiltinMethod.Bind, [o.variable('dynamicInstance')])
          .callFn([o.literal('someParam')])
    ],
    [
      'concatedArray', o.literalArr([o.literal(0)])
                           .callMethod(o.BuiltinMethod.ConcatArray, [o.literalArr([o.literal(1)])])
    ],

    ['fn', o.variable('fn')],
    ['closureInDynamicInstance', o.variable('dynamicInstance').prop('closure')],
    ['invokeFn', o.variable('fn').callFn([o.literal('someParam')])],

    [
      'conditionalTrue', o.literal('')
                             .prop('length')
                             .equals(o.literal(0))
                             .conditional(o.literal('true'), o.literal('false'))
    ],
    [
      'conditionalFalse', o.literal('')
                              .prop('length')
                              .notEquals(o.literal(0))
                              .conditional(o.literal('true'), o.literal('false'))
    ],

    ['not', o.not(o.literal(false))],

    ['externalTestIdentifier', o.importExpr(testDataIdentifier)],
    ['externalSrcIdentifier', o.importExpr(eventEmitterIdentifier)],
    ['externalEnumIdentifier', o.importExpr(enumIdentifier)],

    ['externalInstance', o.variable('externalInstance')],
    ['dynamicInstance', o.variable('dynamicInstance')],

    ['throwError', o.variable('throwError')],
    ['catchError', o.variable('catchError')],

    [
      'operators', o.literalMap([
        ['==', createOperatorFn(o.BinaryOperator.Equals)],
        ['!=', createOperatorFn(o.BinaryOperator.NotEquals)],
        ['===', createOperatorFn(o.BinaryOperator.Identical)],
        ['!==', createOperatorFn(o.BinaryOperator.NotIdentical)],
        ['-', createOperatorFn(o.BinaryOperator.Minus)],
        ['+', createOperatorFn(o.BinaryOperator.Plus)],
        ['/', createOperatorFn(o.BinaryOperator.Divide)],
        ['*', createOperatorFn(o.BinaryOperator.Multiply)],
        ['%', createOperatorFn(o.BinaryOperator.Modulo)],
        ['&&', createOperatorFn(o.BinaryOperator.And)],
        ['||', createOperatorFn(o.BinaryOperator.Or)],
        ['<', createOperatorFn(o.BinaryOperator.Lower)],
        ['<=', createOperatorFn(o.BinaryOperator.LowerEquals)],
        ['>', createOperatorFn(o.BinaryOperator.Bigger)],
        ['>=', createOperatorFn(o.BinaryOperator.BiggerEquals)]
      ])
    ],
  ]))
];

export var codegenStmts: o.Statement[] = [
  new o.CommentStmt('This is a comment'),

  new o.ClassStmt(
      'DynamicClass', o.importExpr(testDataIdentifier),
      [
        new o.ClassField('dynamicProp', o.DYNAMIC_TYPE),
        new o.ClassField('dynamicChangeable', o.DYNAMIC_TYPE),
        new o.ClassField('closure', o.FUNCTION_TYPE)
      ],
      [
        new o.ClassGetter('dynamicGetter',
                          [
                            new o.ReturnStatement(o.literalMap([
                              ['data', o.THIS_EXPR.prop('data')],
                              ['dynamicProp', o.THIS_EXPR.prop('dynamicProp')]
                            ]))
                          ],
                          new o.MapType(o.DYNAMIC_TYPE))
      ],
      new o.ClassMethod(null,
                        [
                          new o.FnParam('dataParam', o.DYNAMIC_TYPE),
                          new o.FnParam('dynamicPropParam', o.DYNAMIC_TYPE)
                        ],
                        [
                          o.SUPER_EXPR.callFn([o.variable('dataParam')])
                              .toStmt(),
                          o.THIS_EXPR.prop('dynamicProp')
                              .set(o.variable('dynamicPropParam'))
                              .toStmt(),
                          o.THIS_EXPR.prop('dynamicChangeable')
                              .set(o.variable('dynamicPropParam'))
                              .toStmt(),
                          o.THIS_EXPR.prop('closure')
                              .set(o.fn([new o.FnParam('param', o.DYNAMIC_TYPE)],
                                        [
                                          new o.ReturnStatement(o.literalMap([
                                            ['param', o.variable('param')],
                                            ['data', o.THIS_EXPR.prop('data')],
                                            ['dynamicProp', o.THIS_EXPR.prop('dynamicProp')]
                                          ]))
                                        ],
                                        o.DYNAMIC_TYPE))
                              .toStmt(),
                        ]),
      [
        new o.ClassMethod('dynamicMethod', [new o.FnParam('param', o.DYNAMIC_TYPE)],
                          [
                            new o.ReturnStatement(o.literalMap([
                              ['param', o.variable('param')],
                              ['data', o.THIS_EXPR.prop('data')],
                              ['dynamicProp', o.THIS_EXPR.prop('dynamicProp')]
                            ]))
                          ],
                          o.DYNAMIC_TYPE)
      ]),

  o.fn([], _getExpressionsStmts, o.DYNAMIC_TYPE).toDeclStmt('getExpressions')
];

function createOperatorFn(op: o.BinaryOperator) {
  return o.fn(
      [new o.FnParam('a'), new o.FnParam('b')],
      [new o.ReturnStatement(new o.BinaryOperatorExpr(op, o.variable('a'), o.variable('b')))],
      o.DYNAMIC_TYPE);
}

export class SimpleJsImportGenerator implements ImportGenerator {
  getImportPath(moduleUrlStr: string, importedUrlStr: string): string {
    var importedAssetUrl = ImportGenerator.parseAssetUrl(importedUrlStr);
    if (importedAssetUrl) {
      return `${importedAssetUrl.packageName}/${importedAssetUrl.modulePath}`;
    } else {
      return importedUrlStr;
    }
  }
}
