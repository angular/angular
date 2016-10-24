/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';

import {createCheckBindingField, createCheckBindingStmt} from '../compiler_util/binding_util';
import {ConvertPropertyBindingResult, convertPropertyBinding} from '../compiler_util/expression_converter';
import {writeToRenderer} from '../compiler_util/render_util';
import * as cdAst from '../expression_parser/ast';
import {isPresent} from '../facade/lang';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {EMPTY_STATE as EMPTY_ANIMATION_STATE, LifecycleHooks, isDefaultChangeDetectionStrategy} from '../private_import_core';
import {BoundElementPropertyAst, BoundTextAst, DirectiveAst, PropertyBindingType} from '../template_parser/template_ast';
import {camelCaseToDashCase} from '../util';

import {CompileElement, CompileNode} from './compile_element';
import {CompileMethod} from './compile_method';
import {CompileView} from './compile_view';
import {DetectChangesVars, ViewProperties} from './constants';
import {CompileEventListener} from './event_binder';

export function bindRenderText(
    boundText: BoundTextAst, compileNode: CompileNode, view: CompileView): void {
  const valueField = createCheckBindingField(view);
  const evalResult = convertPropertyBinding(
      view, view, view.componentContext, boundText.value, valueField.bindingId);
  if (!evalResult) {
    return null;
  }

  view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileNode.nodeIndex, boundText);
  view.detectChangesRenderPropertiesMethod.addStmts(createCheckBindingStmt(
      evalResult, valueField.expression, DetectChangesVars.throwOnChange,
      [o.THIS_EXPR.prop('renderer')
           .callMethod('setText', [compileNode.renderNode, evalResult.currValExpr])
           .toStmt()]));
}

function bindAndWriteToRenderer(
    boundProps: BoundElementPropertyAst[], context: o.Expression, compileElement: CompileElement,
    isHostProp: boolean, eventListeners: CompileEventListener[]) {
  var view = compileElement.view;
  var renderNode = compileElement.renderNode;
  boundProps.forEach((boundProp) => {
    const bindingField = createCheckBindingField(view);
    view.detectChangesRenderPropertiesMethod.resetDebugInfo(compileElement.nodeIndex, boundProp);
    const evalResult = convertPropertyBinding(
        view, isHostProp ? null : view, context, boundProp.value, bindingField.bindingId);
    var updateStmts: o.Statement[] = [];
    var compileMethod = view.detectChangesRenderPropertiesMethod;
    switch (boundProp.type) {
      case PropertyBindingType.Property:
      case PropertyBindingType.Attribute:
      case PropertyBindingType.Class:
      case PropertyBindingType.Style:
        updateStmts.push(...writeToRenderer(
            o.THIS_EXPR, boundProp, renderNode, evalResult.currValExpr,
            view.genConfig.logBindingUpdate));
        break;
      case PropertyBindingType.Animation:
        compileMethod = view.animationBindingsMethod;
        const detachStmts: o.Statement[] = [];

        const animationName = boundProp.name;
        const targetViewExpr: o.Expression =
            isHostProp ? compileElement.appElement.prop('componentView') : o.THIS_EXPR;

        const animationFnExpr =
            targetViewExpr.prop('componentType').prop('animations').key(o.literal(animationName));

        // it's important to normalize the void value as `void` explicitly
        // so that the styles data can be obtained from the stringmap
        const emptyStateValue = o.literal(EMPTY_ANIMATION_STATE);
        const unitializedValue = o.importExpr(resolveIdentifier(Identifiers.UNINITIALIZED));
        const animationTransitionVar = o.variable('animationTransition_' + animationName);

        updateStmts.push(animationTransitionVar
                             .set(animationFnExpr.callFn([
                               o.THIS_EXPR, renderNode,
                               bindingField.expression.equals(unitializedValue)
                                   .conditional(emptyStateValue, bindingField.expression),
                               evalResult.currValExpr.equals(unitializedValue)
                                   .conditional(emptyStateValue, evalResult.currValExpr)
                             ]))
                             .toDeclStmt());

        detachStmts.push(
            animationTransitionVar
                .set(animationFnExpr.callFn(
                    [o.THIS_EXPR, renderNode, bindingField.expression, emptyStateValue]))
                .toDeclStmt());

        eventListeners.forEach(listener => {
          if (listener.isAnimation && listener.eventName === animationName) {
            let animationStmt = listener.listenToAnimation(animationTransitionVar);
            updateStmts.push(animationStmt);
            detachStmts.push(animationStmt);
          }
        });

        view.detachMethod.addStmts(detachStmts);

        break;
    }
    compileMethod.addStmts(createCheckBindingStmt(
        evalResult, bindingField.expression, DetectChangesVars.throwOnChange, updateStmts));
  });
}

export function bindRenderInputs(
    boundProps: BoundElementPropertyAst[], compileElement: CompileElement,
    eventListeners: CompileEventListener[]): void {
  bindAndWriteToRenderer(
      boundProps, compileElement.view.componentContext, compileElement, false, eventListeners);
}

export function bindDirectiveHostProps(
    directiveAst: DirectiveAst, directiveInstance: o.Expression, compileElement: CompileElement,
    eventListeners: CompileEventListener[]): void {
  bindAndWriteToRenderer(
      directiveAst.hostProperties, directiveInstance, compileElement, true, eventListeners);
}

export function bindDirectiveInputs(
    directiveAst: DirectiveAst, directiveWrapperInstance: o.Expression, dirIndex: number,
    compileElement: CompileElement) {
  var view = compileElement.view;
  var detectChangesInInputsMethod = view.detectChangesInInputsMethod;
  detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);

  directiveAst.inputs.forEach((input, inputIdx) => {
    // Note: We can't use `fields.length` here, as we are not adding a field!
    const bindingId = `${compileElement.nodeIndex}_${dirIndex}_${inputIdx}`;
    detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, input);
    const evalResult =
        convertPropertyBinding(view, view, view.componentContext, input.value, bindingId);
    if (!evalResult) {
      return;
    }
    detectChangesInInputsMethod.addStmts(evalResult.stmts);
    detectChangesInInputsMethod.addStmt(
        directiveWrapperInstance
            .callMethod(
                `check_${input.directiveName}`,
                [
                  evalResult.currValExpr, DetectChangesVars.throwOnChange,
                  evalResult.forceUpdate || o.literal(false)
                ])
            .toStmt());
  });
  var isOnPushComp = directiveAst.directive.isComponent &&
      !isDefaultChangeDetectionStrategy(directiveAst.directive.changeDetection);
  let directiveDetectChangesExpr = directiveWrapperInstance.callMethod(
      'detectChangesInternal',
      [o.THIS_EXPR, compileElement.renderNode, DetectChangesVars.throwOnChange]);
  const directiveDetectChangesStmt = isOnPushComp ?
      new o.IfStmt(directiveDetectChangesExpr, [compileElement.appElement.prop('componentView')
                                                    .callMethod('markAsCheckOnce', [])
                                                    .toStmt()]) :
      directiveDetectChangesExpr.toStmt();
  detectChangesInInputsMethod.addStmt(directiveDetectChangesStmt);
}
