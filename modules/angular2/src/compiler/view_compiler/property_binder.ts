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

function createBindFieldExpr(exprIndex: number): o.ReadPropExpr {
  return o.THIS_EXPR.prop(`_expr_${exprIndex}`);
}

function bind(view: CompileView, fieldExpr: o.ReadPropExpr,
              parsedExpression: cdAst.AST, context: o.Expression, actions: o.Statement[],
              method: CompileMethod) {

  var checkExpression = convertCdExpressionToIr(view, context, parsedExpression, DetectChangesVars.valUnwrapper);
  if (isBlank(checkExpression.expression)) {
    // e.g. an empty expression was given
    return;
  }

  view.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
  view.createMethod.addStmt(
      o.THIS_EXPR.prop(fieldExpr.name).set(o.importExpr(Identifiers.uninitialized)).toStmt());

  if (checkExpression.needsValueUnwrapper) {
    var initValueUnwrapperStmt =
        DetectChangesVars.valUnwrapper.callMethod('reset', []).toStmt();
    method.addStmt(initValueUnwrapperStmt);
  }
  method.addStmt(DetectChangesVars.currVal.set(checkExpression.expression).toStmt());

  var condition: o.Expression =
      o.importExpr(Identifiers.checkBinding).callFn([DetectChangesVars.throwOnChange, fieldExpr, DetectChangesVars.currVal]);
  if (checkExpression.needsValueUnwrapper) {
    condition = DetectChangesVars.valUnwrapper.prop('hasWrappedValue').or(condition);
  }
  method.addStmt(new o.IfStmt(
      condition,
      actions.concat([<o.Statement>o.THIS_EXPR.prop(fieldExpr.name).set(DetectChangesVars.currVal).toStmt()])));
}

export function bindRenderText(boundText: BoundTextAst, compileNode: CompileNode,
                               view: CompileView) {
  var bindingIndex = view.bindings.length;
  view.bindings.push(new CompileBinding(compileNode, boundText));
  var valueField = createBindFieldExpr(bindingIndex);
  view.detectChangesInInputsMethod.resetDebugInfo(compileNode.nodeIndex, boundText);

  bind(view, valueField, boundText.value, o.THIS_EXPR.prop('context'),
       [
         o.THIS_EXPR.prop('renderer')
             .callMethod('setText', [compileNode.renderNode, DetectChangesVars.currVal])
             .toStmt()
       ],
       view.detectChangesInInputsMethod);
}

function bindAndWriteToRenderer(boundProps: BoundElementPropertyAst[], context: o.Expression,
                                compileElement: CompileElement) {
  var view = compileElement.view;
  var renderNode = compileElement.renderNode;
  boundProps.forEach((boundProp) => {
    var bindingIndex = view.bindings.length;
    view.bindings.push(new CompileBinding(compileElement, boundProp));
    view.detectChangesHostPropertiesMethod.resetDebugInfo(compileElement.nodeIndex,boundProp);
    var valueField = createBindFieldExpr(bindingIndex);
    var renderMethod: string;
    var renderValue: o.Expression = DetectChangesVars.currVal;
    var updateStmts = [];
    switch (boundProp.type) {
      case PropertyBindingType.Property:
        renderMethod = 'setElementProperty';
        if (view.genConfig.logBindingUpdate) {
          updateStmts.push(logBindingUpdateStmt(renderNode, boundProp.name, DetectChangesVars.currVal));
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

    bind(view, valueField, boundProp.value, context, updateStmts,
         view.detectChangesHostPropertiesMethod);
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
    var valueField = createBindFieldExpr(bindingIndex);
    var statements: o.Statement[] =
        [directiveInstance.prop(input.directiveName).set(DetectChangesVars.currVal).toStmt()];
    if (calcChangesMap) {
      statements.push(new o.IfStmt(DetectChangesVars.changes.identical(o.NULL_EXPR),
                                   [DetectChangesVars.changes.set(o.literalMap([])).toStmt()]));
      statements.push(
          DetectChangesVars.changes.key(o.literal(input.directiveName))
              .set(o.importExpr(Identifiers.SimpleChange).instantiate([valueField, DetectChangesVars.currVal]))
              .toStmt());
    }
    if (isOnPushComp) {
      statements.push(DetectChangesVars.changed.set(o.literal(true)).toStmt());
    }
    if (view.genConfig.logBindingUpdate) {
      statements.push(
          logBindingUpdateStmt(compileElement.renderNode, input.directiveName, DetectChangesVars.currVal));
    }
    bind(view, valueField, input.value, o.THIS_EXPR.prop('context'), statements,
         detectChangesInInputsMethod);
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
