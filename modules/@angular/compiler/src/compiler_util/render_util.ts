/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SecurityContext} from '@angular/core';

import {Identifiers, createIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {EMPTY_STATE as EMPTY_ANIMATION_STATE} from '../private_import_core';
import {BoundElementPropertyAst, BoundEventAst, PropertyBindingType} from '../template_parser/template_ast';

import {isFirstViewCheck} from './binding_util';
import {ConvertPropertyBindingResult} from './expression_converter';
import {createEnumExpression} from './identifier_util';

export function createCheckRenderBindingStmt(
    view: o.Expression, renderElement: o.Expression, boundProp: BoundElementPropertyAst,
    oldValue: o.ReadPropExpr, evalResult: ConvertPropertyBindingResult,
    securityContextExpression?: o.Expression): o.Statement[] {
  const checkStmts: o.Statement[] = [...evalResult.stmts];
  const securityContext = calcSecurityContext(boundProp, securityContextExpression);
  switch (boundProp.type) {
    case PropertyBindingType.Property:
      checkStmts.push(o.importExpr(createIdentifier(Identifiers.checkRenderProperty))
                          .callFn([
                            view, renderElement, o.literal(boundProp.name), oldValue,
                            oldValue.set(evalResult.currValExpr),
                            evalResult.forceUpdate || o.literal(false), securityContext
                          ])
                          .toStmt());
      break;
    case PropertyBindingType.Attribute:
      checkStmts.push(o.importExpr(createIdentifier(Identifiers.checkRenderAttribute))
                          .callFn([
                            view, renderElement, o.literal(boundProp.name), oldValue,
                            oldValue.set(evalResult.currValExpr),
                            evalResult.forceUpdate || o.literal(false), securityContext
                          ])
                          .toStmt());
      break;
    case PropertyBindingType.Class:
      checkStmts.push(
          o.importExpr(createIdentifier(Identifiers.checkRenderClass))
              .callFn([
                view, renderElement, o.literal(boundProp.name), oldValue,
                oldValue.set(evalResult.currValExpr), evalResult.forceUpdate || o.literal(false)
              ])
              .toStmt());
      break;
    case PropertyBindingType.Style:
      checkStmts.push(
          o.importExpr(createIdentifier(Identifiers.checkRenderStyle))
              .callFn([
                view, renderElement, o.literal(boundProp.name), o.literal(boundProp.unit), oldValue,
                oldValue.set(evalResult.currValExpr), evalResult.forceUpdate || o.literal(false),
                securityContext
              ])
              .toStmt());
      break;
    case PropertyBindingType.Animation:
      throw new Error('Illegal state: Should not come here!');
  }
  return checkStmts;
}

function calcSecurityContext(
    boundProp: BoundElementPropertyAst, securityContextExpression?: o.Expression): o.Expression {
  if (boundProp.securityContext === SecurityContext.NONE) {
    return o.NULL_EXPR;  // No sanitization needed.
  }
  if (!boundProp.needsRuntimeSecurityContext) {
    securityContextExpression =
        createEnumExpression(Identifiers.SecurityContext, boundProp.securityContext);
  }
  if (!securityContextExpression) {
    throw new Error(`internal error, no SecurityContext given ${boundProp.name}`);
  }
  return securityContextExpression;
}

export function createCheckAnimationBindingStmts(
    view: o.Expression, componentView: o.Expression, boundProp: BoundElementPropertyAst,
    boundOutputs: BoundEventAst[], eventListener: o.Expression, renderElement: o.Expression,
    oldValue: o.ReadPropExpr, evalResult: ConvertPropertyBindingResult) {
  const detachStmts: o.Statement[] = [];
  const updateStmts: o.Statement[] = [];

  const animationName = boundProp.name;

  const animationFnExpr =
      componentView.prop('componentType').prop('animations').key(o.literal(animationName));

  // it's important to normalize the void value as `void` explicitly
  // so that the styles data can be obtained from the stringmap
  const emptyStateValue = o.literal(EMPTY_ANIMATION_STATE);
  const animationTransitionVar = o.variable('animationTransition_' + animationName);

  updateStmts.push(
      animationTransitionVar
          .set(animationFnExpr.callFn([
            view, renderElement, isFirstViewCheck(view).conditional(emptyStateValue, oldValue),
            evalResult.currValExpr
          ]))
          .toDeclStmt());
  updateStmts.push(oldValue.set(evalResult.currValExpr).toStmt());

  detachStmts.push(animationTransitionVar
                       .set(animationFnExpr.callFn(
                           [view, renderElement, evalResult.currValExpr, emptyStateValue]))
                       .toDeclStmt());

  const registerStmts: o.Statement[] = [];
  const animationStartMethodExists = boundOutputs.find(
      event => event.isAnimation && event.name == animationName && event.phase == 'start');
  if (animationStartMethodExists) {
    registerStmts.push(
        animationTransitionVar
            .callMethod(
                'onStart',
                [eventListener.callMethod(
                    o.BuiltinMethod.Bind,
                    [view, o.literal(BoundEventAst.calcFullName(animationName, null, 'start'))])])
            .toStmt());
  }

  const animationDoneMethodExists = boundOutputs.find(
      event => event.isAnimation && event.name == animationName && event.phase == 'done');
  if (animationDoneMethodExists) {
    registerStmts.push(
        animationTransitionVar
            .callMethod(
                'onDone',
                [eventListener.callMethod(
                    o.BuiltinMethod.Bind,
                    [view, o.literal(BoundEventAst.calcFullName(animationName, null, 'done'))])])
            .toStmt());
  }

  updateStmts.push(...registerStmts);
  detachStmts.push(...registerStmts);

  const checkUpdateStmts: o.Statement[] = [
    ...evalResult.stmts,
    new o.IfStmt(
        o.importExpr(createIdentifier(Identifiers.checkBinding)).callFn([
          view, oldValue, evalResult.currValExpr, evalResult.forceUpdate || o.literal(false)
        ]),
        updateStmts)
  ];
  const checkDetachStmts: o.Statement[] = [...evalResult.stmts, ...detachStmts];
  return {checkUpdateStmts, checkDetachStmts};
}
