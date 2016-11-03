/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventHandlerVars, convertActionBinding} from '../compiler_util/expression_converter';
import {createInlineArray} from '../compiler_util/identifier_util';
import {DirectiveWrapperExpressions} from '../directive_wrapper_compiler';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {BoundEventAst, DirectiveAst} from '../template_parser/template_ast';

import {CompileElement} from './compile_element';
import {CompileMethod} from './compile_method';
import {ViewProperties} from './constants';
import {getHandleEventMethodName} from './util';

export function bindOutputs(
    boundEvents: BoundEventAst[], directives: DirectiveAst[], compileElement: CompileElement,
    bindToRenderer: boolean): boolean {
  const usedEvents = collectEvents(boundEvents, directives);
  if (!usedEvents.size) {
    return false;
  }
  if (bindToRenderer) {
    subscribeToRenderEvents(usedEvents, compileElement);
  }
  subscribeToDirectiveEvents(usedEvents, directives, compileElement);
  generateHandleEventMethod(boundEvents, directives, compileElement);
  return true;
}

function collectEvents(
    boundEvents: BoundEventAst[], directives: DirectiveAst[]): Map<string, EventSummary> {
  const usedEvents = new Map<string, EventSummary>();
  boundEvents.forEach((event) => { usedEvents.set(event.fullName, event); });
  directives.forEach((dirAst) => {
    dirAst.hostEvents.forEach((event) => { usedEvents.set(event.fullName, event); });
  });
  return usedEvents;
}

function subscribeToRenderEvents(
    usedEvents: Map<string, EventSummary>, compileElement: CompileElement) {
  const eventAndTargetExprs: o.Expression[] = [];
  usedEvents.forEach((event) => {
    if (!event.phase) {
      eventAndTargetExprs.push(o.literal(event.name), o.literal(event.target));
    }
  });
  if (eventAndTargetExprs.length) {
    const disposableVar = o.variable(`disposable_${compileElement.view.disposables.length}`);
    compileElement.view.disposables.push(disposableVar);
    compileElement.view.createMethod.addStmt(
        disposableVar
            .set(o.importExpr(resolveIdentifier(Identifiers.subscribeToRenderElement)).callFn([
              o.THIS_EXPR, compileElement.renderNode, createInlineArray(eventAndTargetExprs),
              handleEventExpr(compileElement)
            ]))
            .toDeclStmt(o.FUNCTION_TYPE, [o.StmtModifier.Private]));
  }
}

function subscribeToDirectiveEvents(
    usedEvents: Map<string, EventSummary>, directives: DirectiveAst[],
    compileElement: CompileElement) {
  const usedEventNames = Array.from(usedEvents.keys());
  directives.forEach((dirAst) => {
    const dirWrapper = compileElement.directiveWrapperInstance.get(dirAst.directive.type.reference);
    compileElement.view.createMethod.addStmts(DirectiveWrapperExpressions.subscribe(
        dirAst.directive, dirAst.hostProperties, usedEventNames, dirWrapper, o.THIS_EXPR,
        handleEventExpr(compileElement)));
  });
}

function generateHandleEventMethod(
    boundEvents: BoundEventAst[], directives: DirectiveAst[], compileElement: CompileElement) {
  const hasComponentHostListener =
      directives.some((dirAst) => dirAst.hostEvents.some((event) => dirAst.directive.isComponent));

  const markPathToRootStart = hasComponentHostListener ? compileElement.compViewExpr : o.THIS_EXPR;
  const handleEventStmts = new CompileMethod(compileElement.view);
  handleEventStmts.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
  handleEventStmts.push(markPathToRootStart.callMethod('markPathToRootAsCheckOnce', []).toStmt());
  const eventNameVar = o.variable('eventName');
  const resultVar = o.variable('result');
  handleEventStmts.push(resultVar.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));

  directives.forEach((dirAst, dirIdx) => {
    const dirWrapper = compileElement.directiveWrapperInstance.get(dirAst.directive.type.reference);
    if (dirAst.hostEvents.length > 0) {
      handleEventStmts.push(
          resultVar
              .set(DirectiveWrapperExpressions
                       .handleEvent(
                           dirAst.hostEvents, dirWrapper, eventNameVar, EventHandlerVars.event)
                       .and(resultVar))
              .toStmt());
    }
  });
  boundEvents.forEach((renderEvent, renderEventIdx) => {
    const evalResult = convertActionBinding(
        compileElement.view, compileElement.view, compileElement.view.componentContext,
        renderEvent.handler, `sub_${renderEventIdx}`);
    const trueStmts = evalResult.stmts;
    if (evalResult.preventDefault) {
      trueStmts.push(resultVar.set(evalResult.preventDefault.and(resultVar)).toStmt());
    }
    // TODO(tbosch): convert this into a `switch` once our OutputAst supports it.
    handleEventStmts.push(
        new o.IfStmt(eventNameVar.equals(o.literal(renderEvent.fullName)), trueStmts));
  });

  handleEventStmts.push(new o.ReturnStatement(resultVar));
  compileElement.view.methods.push(new o.ClassMethod(
      getHandleEventMethodName(compileElement.nodeIndex),
      [
        new o.FnParam(eventNameVar.name, o.STRING_TYPE),
        new o.FnParam(EventHandlerVars.event.name, o.DYNAMIC_TYPE)
      ],
      handleEventStmts.finish(), o.BOOL_TYPE));
}

function handleEventExpr(compileElement: CompileElement) {
  const handleEventMethodName = getHandleEventMethodName(compileElement.nodeIndex);
  return o.THIS_EXPR.callMethod('eventHandler', [o.THIS_EXPR.prop(handleEventMethodName)]);
}

type EventSummary = {
  name: string,
  target: string,
  phase: string
}