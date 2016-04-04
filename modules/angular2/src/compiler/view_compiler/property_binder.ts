import * as cdAst from '../expression_parser/ast';
import * as o from '../output/output_ast';
import {Identifiers} from '../identifiers';
import {DetectChangesVars} from './constants';

import {
  BoundTextAst,
  BoundElementPropertyAst,
  DirectiveAst,
  PropertyBindingType,
  TemplateAst
} from '../template_ast';

import {isBlank, isPresent, isArray, CONST_EXPR} from 'angular2/src/facade/lang';

import {CompileView} from './compile_view';
import {CompileElement, CompileNode} from './compile_element';
import {CompileMethod} from './compile_method';

import {LifecycleHooks} from 'angular2/src/core/metadata/lifecycle_hooks';
import {isDefaultChangeDetectionStrategy} from 'angular2/src/core/change_detection/constants';
import {camelCaseToDashCase} from '../util';

import {convertCdExpressionToIr} from './expression_converter';

import {bindDirectiveDetectChangesLifecycleCallbacks} from './lifecycle_binder';
import {CompileBinding} from './compile_binding';

function createBindCurrValueExpr(exprIndex: number): o.ReadVarExpr {
  return o.variable(`curr_expr_${exprIndex}`);
}

function createBindFieldExpr(exprIndex: number): o.ReadPropExpr {
  return o.THIS_EXPR.prop(`_expr_${exprIndex}`);
}

function bind(view: CompileView, currValueExpr: o.ReadVarExpr, fieldExpr: o.ReadPropExpr,
              parsedExpression: cdAst.AST, context: o.Expression, actions: o.Statement[],
              method: CompileMethod, checkNoChangesMethod: CompileMethod) {
  var valueUnwrapperVar = o.variable(`${currValueExpr.name}_unwrapper`);

  var checkExpression = convertCdExpressionToIr(view, context, parsedExpression, valueUnwrapperVar);
  if (isBlank(checkExpression.expression)) {
    // e.g. an empty expression was given
    return;
  }

  view.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
  view.constructorMethod.addStmt(
      o.THIS_EXPR.prop(fieldExpr.name).set(o.importExpr(Identifiers.uninitialized)).toStmt());

  if (checkExpression.needsValueUnwrapper) {
    var initValueUnwrapperStmt =
        valueUnwrapperVar.set(o.importExpr(Identifiers.ValueUnwrapper).instantiate([]))
            .toDeclStmt(null, [o.StmtModifier.Final]);
    method.addStmt(initValueUnwrapperStmt);
    checkNoChangesMethod.addStmt(initValueUnwrapperStmt);
  }
  method.addStmt(currValueExpr.set(checkExpression.expression).toDeclStmt());
  checkNoChangesMethod.addStmt(currValueExpr.set(checkExpression.expression).toDeclStmt());

  var condition: o.Expression =
      o.not(o.importExpr(Identifiers.looseIdentical).callFn([fieldExpr, currValueExpr]));
  var notChangedCondition: o.Expression =
      o.not(o.importExpr(Identifiers.devModeEqual).callFn([fieldExpr, currValueExpr]));
  if (checkExpression.needsValueUnwrapper) {
    condition = valueUnwrapperVar.prop('hasWrappedValue').or(condition);
    notChangedCondition = valueUnwrapperVar.prop('hasWrappedValue').or(notChangedCondition);
  }
  method.addStmt(new o.IfStmt(
      condition,
      actions.concat([<o.Statement>o.THIS_EXPR.prop(fieldExpr.name).set(currValueExpr).toStmt()])));
  checkNoChangesMethod.addStmt(new o.IfStmt(notChangedCondition, [
    o.THIS_EXPR.callMethod('throwOnChangeError',
                           [fieldExpr, currValueExpr])
        .toStmt()
  ]));
}

export function bindRenderText(boundText: BoundTextAst, compileNode: CompileNode,
                               view: CompileView) {
  var bindingIndex = view.bindings.length;
  view.bindings.push(new CompileBinding(compileNode, boundText));
  var valueField = createBindFieldExpr(bindingIndex);
  var currValueVar = createBindCurrValueExpr(bindingIndex);
  view.detectChangesInInputsMethod.resetDebugInfo(compileNode.nodeIndex, boundText);
  view.checkNoChangesMethod.resetDebugInfo(compileNode.nodeIndex, boundText);

  bind(view, currValueVar, valueField, boundText.value, o.THIS_EXPR.prop('context'),
       [
         o.THIS_EXPR.prop('renderer')
             .callMethod('setText', [compileNode.renderNode, currValueVar])
             .toStmt()
       ],
       view.detectChangesInInputsMethod, view.checkNoChangesMethod);
}

function bindAndWriteToRenderer(boundProps: BoundElementPropertyAst[], context: o.Expression,
                                compileElement: CompileElement) {
  var view = compileElement.view;
  var renderNode = compileElement.renderNode;
  boundProps.forEach((boundProp) => {
    var bindingIndex = view.bindings.length;
    view.bindings.push(new CompileBinding(compileElement, boundProp));
    view.detectChangesHostPropertiesMethod.resetDebugInfo(compileElement.nodeIndex,boundProp);
    view.checkNoChangesMethod.resetDebugInfo(compileElement.nodeIndex, boundProp);
    var valueField = createBindFieldExpr(bindingIndex);
    var currValueVar = createBindCurrValueExpr(bindingIndex);
    var renderMethod: string;
    var renderValue: o.Expression = currValueVar;
    var updateStmts = [];
    switch (boundProp.type) {
      case PropertyBindingType.Property:
        renderMethod = 'setElementProperty';
        if (view.genConfig.logBindingUpdate) {
          updateStmts.push(logBindingUpdateStmt(renderNode, boundProp.name, currValueVar));
        }
        break;
      case PropertyBindingType.Attribute:
        renderMethod = 'setElementAttribute';
        renderValue =
            renderValue.isBlank().conditional(o.NULL_EXPR, renderValue.callMethod('toString', []));
        break;
      case PropertyBindingType.Class:
        renderMethod = 'setElementClass';
        break;
      case PropertyBindingType.Style:
        renderMethod = 'setElementStyle';
        var strValue: o.Expression = renderValue.callMethod('toString', []);
        if (isPresent(boundProp.unit)) {
          strValue = strValue.plus(o.literal(boundProp.unit));
        }
        renderValue = renderValue.isBlank().conditional(o.NULL_EXPR, strValue);
        break;
    }
    updateStmts.push(
        o.THIS_EXPR.prop('renderer')
            .callMethod(renderMethod, [renderNode, o.literal(boundProp.name), renderValue])
            .toStmt());

    bind(view, currValueVar, valueField, boundProp.value, context, updateStmts,
         view.detectChangesHostPropertiesMethod, view.checkNoChangesMethod);
  });
}

export function bindRenderInputs(boundProps: BoundElementPropertyAst[],
                                 compileElement: CompileElement) {
  return bindAndWriteToRenderer(boundProps, o.THIS_EXPR.prop('context'), compileElement);
}

export function bindDirectiveHostProps(directiveAst: DirectiveAst, directiveInstance: o.Expression,
                                       compileElement: CompileElement) {
  return bindAndWriteToRenderer(directiveAst.hostProperties, directiveInstance, compileElement);
}

export function bindDirectiveInputs(directiveAst: DirectiveAst, directiveInstance: o.Expression,
                                    compileElement: CompileElement) {
  var view = compileElement.view;
  var detectChangesInInputsMethod = view.detectChangesInInputsMethod;
  detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);

  var lifecycleHooks = directiveAst.directive.lifecycleHooks;
  var calcChangesMap = lifecycleHooks.indexOf(LifecycleHooks.OnChanges) !== -1;
  var isOnPushComp = directiveAst.directive.isComponent &&
                     !isDefaultChangeDetectionStrategy(directiveAst.directive.changeDetection);
  if (calcChangesMap) {
    detectChangesInInputsMethod.addStmt(DetectChangesVars.changes.set(o.NULL_EXPR).toStmt());
  }
  if (isOnPushComp) {
    detectChangesInInputsMethod.addStmt(DetectChangesVars.changed.set(o.literal(false)).toStmt());
  }
  directiveAst.inputs.forEach((input) => {
    var bindingIndex = view.bindings.length;
    view.bindings.push(new CompileBinding(compileElement, input));
    detectChangesInInputsMethod.resetDebugInfo(compileElement.nodeIndex, input);
    view.checkNoChangesMethod.resetDebugInfo(compileElement.nodeIndex, input);
    var valueField = createBindFieldExpr(bindingIndex);
    var currValueVar = createBindCurrValueExpr(bindingIndex);
    var statements: o.Statement[] =
        [directiveInstance.prop(input.directiveName).set(currValueVar).toStmt()];
    if (calcChangesMap) {
      statements.push(new o.IfStmt(DetectChangesVars.changes.identical(o.NULL_EXPR),
                                   [DetectChangesVars.changes.set(o.literalMap([])).toStmt()]));
      statements.push(
          DetectChangesVars.changes.key(o.literal(input.directiveName))
              .set(o.importExpr(Identifiers.SimpleChange).instantiate([valueField, currValueVar]))
              .toStmt());
    }
    if (isOnPushComp) {
      statements.push(DetectChangesVars.changed.set(o.literal(true)).toStmt());
    }
    if (view.genConfig.logBindingUpdate) {
      statements.push(
          logBindingUpdateStmt(compileElement.renderNode, input.directiveName, currValueVar));
    }
    bind(view, currValueVar, valueField, input.value, o.THIS_EXPR.prop('context'), statements,
         detectChangesInInputsMethod, view.checkNoChangesMethod);
  });
  bindDirectiveDetectChangesLifecycleCallbacks(directiveAst.directive, directiveInstance,
                                               DetectChangesVars.changes, compileElement);
  if (isOnPushComp) {
    detectChangesInInputsMethod.addStmt(new o.IfStmt(DetectChangesVars.changed, [
      compileElement.getOrCreateAppElement()
          .prop('componentView')
          .callMethod('markAsCheckOnce', [])
          .toStmt()
    ]));
  }
}

function logBindingUpdateStmt(renderNode: o.Expression, propName: string,
                              value: o.Expression): o.Statement {
  return o.THIS_EXPR.prop('renderer')
      .callMethod('setBindingDebugInfo',
                  [
                    renderNode,
                    o.literal(`ng-reflect-${camelCaseToDashCase(propName)}`),
                    value.isBlank().conditional(o.NULL_EXPR, value.callMethod('toString', []))
                  ])
      .toStmt();
}
