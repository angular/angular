/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ASTWithSource,
  BindingType,
  Interpolation,
  PrefixNot,
  PropertyRead,
  TmplAstBoundAttribute,
  TmplAstIfBlock,
  TmplAstSwitchBlock,
} from '@angular/compiler';
import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {SymbolKind} from '../../../api';
import {isSignalReference} from '../../../src/symbol_util';
import {TemplateCheckWithVisitor} from '../../api';
/** Names of known signal instance properties. */
const SIGNAL_INSTANCE_PROPERTIES = new Set(['set', 'update', 'asReadonly']);
/**
 * Names of known function instance properties.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#instance_properties
 */
const FUNCTION_INSTANCE_PROPERTIES = new Set(['name', 'length', 'prototype']);
/**
 * Ensures Signals are invoked when used in template interpolations.
 */
class InterpolatedSignalCheck extends TemplateCheckWithVisitor {
  code = ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED;
  visitNode(ctx, component, node) {
    // interpolations like `{{ mySignal }}`
    if (node instanceof Interpolation) {
      return node.expressions
        .map((item) => (item instanceof PrefixNot ? item.expression : item))
        .filter((item) => item instanceof PropertyRead)
        .flatMap((item) => buildDiagnosticForSignal(ctx, item, component));
    }
    // bound properties like `[prop]="mySignal"`
    else if (node instanceof TmplAstBoundAttribute) {
      const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
      if (
        symbol?.kind === SymbolKind.Input &&
        symbol.bindings.length > 0 &&
        symbol.bindings.some((binding) => binding.target.kind === SymbolKind.Directive)
      ) {
        return [];
      }
      // otherwise, we check if the node is
      const nodeAst = isPropertyReadNodeAst(node);
      if (
        // a bound property like `[prop]="mySignal"`
        (node.type === BindingType.Property ||
          // or a class binding like `[class.myClass]="mySignal"`
          node.type === BindingType.Class ||
          // or a style binding like `[style.width]="mySignal"`
          node.type === BindingType.Style ||
          // or an attribute binding like `[attr.role]="mySignal"`
          node.type === BindingType.Attribute ||
          // or an animation binding like `[animate.enter]="mySignal"`
          node.type === BindingType.Animation ||
          // or an animation binding like `[@myAnimation]="mySignal"`
          node.type === BindingType.LegacyAnimation) &&
        nodeAst
      ) {
        return buildDiagnosticForSignal(ctx, nodeAst, component);
      }
    }
    // if blocks like `@if(mySignal) { ... }`
    else if (node instanceof TmplAstIfBlock) {
      return node.branches
        .map((branch) => branch.expression)
        .filter((expr) => expr instanceof ASTWithSource)
        .map((expr) => {
          const ast = expr.ast;
          return ast instanceof PrefixNot ? ast.expression : ast;
        })
        .filter((ast) => ast instanceof PropertyRead)
        .flatMap((item) => buildDiagnosticForSignal(ctx, item, component));
    }
    // switch blocks like `@switch(mySignal) { ... }`
    else if (node instanceof TmplAstSwitchBlock && node.expression instanceof ASTWithSource) {
      const expression =
        node.expression.ast instanceof PrefixNot
          ? node.expression.ast.expression
          : node.expression.ast;
      if (expression instanceof PropertyRead) {
        return buildDiagnosticForSignal(ctx, expression, component);
      }
    }
    return [];
  }
}
function isPropertyReadNodeAst(node) {
  if (node.value instanceof ASTWithSource === false) {
    return undefined;
  }
  if (node.value.ast instanceof PrefixNot && node.value.ast.expression instanceof PropertyRead) {
    return node.value.ast.expression;
  }
  if (node.value.ast instanceof PropertyRead) {
    return node.value.ast;
  }
  return undefined;
}
function isFunctionInstanceProperty(name) {
  return FUNCTION_INSTANCE_PROPERTIES.has(name);
}
function isSignalInstanceProperty(name) {
  return SIGNAL_INSTANCE_PROPERTIES.has(name);
}
function buildDiagnosticForSignal(ctx, node, component) {
  // check for `{{ mySignal }}`
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
  if (symbol !== null && symbol.kind === SymbolKind.Expression && isSignalReference(symbol)) {
    const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
      symbol.tcbLocation,
    );
    const errorString = `${node.name} is a function and should be invoked: ${node.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }
  // check for `{{ mySignal.name }}` or `{{ mySignal.length }}` or `{{ mySignal.prototype }}`
  // as these are the names of instance properties of Function, the compiler does _not_ throw an
  // error.
  // We also check for `{{ mySignal.set }}` or `{{ mySignal.update }}` or
  // `{{ mySignal.asReadonly }}` as these are the names of instance properties of Signal
  const symbolOfReceiver = ctx.templateTypeChecker.getSymbolOfNode(node.receiver, component);
  if (
    (isFunctionInstanceProperty(node.name) || isSignalInstanceProperty(node.name)) &&
    symbolOfReceiver !== null &&
    symbolOfReceiver.kind === SymbolKind.Expression &&
    isSignalReference(symbolOfReceiver)
  ) {
    const templateMapping = ctx.templateTypeChecker.getSourceMappingAtTcbLocation(
      symbolOfReceiver.tcbLocation,
    );
    const errorString = `${node.receiver.name} is a function and should be invoked: ${node.receiver.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }
  return [];
}
export const factory = {
  code: ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  name: ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED,
  create: () => new InterpolatedSignalCheck(),
};
//# sourceMappingURL=index.js.map
