/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  BindingType,
  Interpolation,
  PropertyRead,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic, SymbolKind, TypeCheckableDirectiveMeta} from '../../../api';
import {isSignalReference} from '../../../src/symbol_util';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

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
class InterpolatedSignalCheck extends TemplateCheckWithVisitor<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED> {
  override code = ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>[] {
    // interpolations like `{{ mySignal }}`
    if (node instanceof Interpolation) {
      return node.expressions
        .filter((item): item is PropertyRead => item instanceof PropertyRead)
        .flatMap((item) => buildDiagnosticForSignal(ctx, item, component));
    }
    // check bound inputs like `[prop]="mySignal"` on an element or inline template
    else if (node instanceof TmplAstElement && node.inputs.length > 0) {
      const directivesOfElement = ctx.templateTypeChecker.getDirectivesOfNode(component, node);
      return node.inputs.flatMap((input) =>
        checkBoundAttribute(ctx, component, directivesOfElement, input),
      );
    } else if (node instanceof TmplAstTemplate && node.tagName === 'ng-template') {
      const directivesOfElement = ctx.templateTypeChecker.getDirectivesOfNode(component, node);
      const inputDiagnostics = node.inputs.flatMap((input) => {
        return checkBoundAttribute(ctx, component, directivesOfElement, input);
      });
      const templateAttrDiagnostics = node.templateAttrs.flatMap((attr) => {
        if (!(attr instanceof TmplAstBoundAttribute)) {
          return [];
        }
        return checkBoundAttribute(ctx, component, directivesOfElement, attr);
      });
      return inputDiagnostics.concat(templateAttrDiagnostics);
    }
    return [];
  }
}

function checkBoundAttribute(
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  component: ts.ClassDeclaration,
  directivesOfElement: Array<TypeCheckableDirectiveMeta> | null,
  node: TmplAstBoundAttribute,
): Array<NgTemplateDiagnostic<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>> {
  // we skip the check if the node is an input binding
  if (
    directivesOfElement !== null &&
    directivesOfElement.some((dir) => dir.inputs.getByBindingPropertyName(node.name) !== null)
  ) {
    return [];
  }
  // otherwise, we check if the node is
  if (
    (node.type === BindingType.Property ||
      // or a class binding like `[class.myClass]="mySignal"`
      node.type === BindingType.Class ||
      // or a style binding like `[style.width]="mySignal"`
      node.type === BindingType.Style ||
      // or an attribute binding like `[attr.role]="mySignal"`
      node.type === BindingType.Attribute ||
      // or an animation binding like `[@myAnimation]="mySignal"`
      node.type === BindingType.Animation) &&
    node.value instanceof ASTWithSource &&
    node.value.ast instanceof PropertyRead
  ) {
    return buildDiagnosticForSignal(ctx, node.value.ast, component);
  }

  return [];
}

function isFunctionInstanceProperty(name: string): boolean {
  return FUNCTION_INSTANCE_PROPERTIES.has(name);
}

function isSignalInstanceProperty(name: string): boolean {
  return SIGNAL_INSTANCE_PROPERTIES.has(name);
}

function buildDiagnosticForSignal(
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  node: PropertyRead,
  component: ts.ClassDeclaration,
): Array<NgTemplateDiagnostic<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>> {
  // check for `{{ mySignal }}`
  const symbol = ctx.templateTypeChecker.getSymbolOfNode(node, component);
  if (symbol !== null && symbol.kind === SymbolKind.Expression && isSignalReference(symbol)) {
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(
      symbol.tcbLocation,
    )!;
    const errorString = `${node.name} is a function and should be invoked: ${node.name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }

  // check for `{{ mySignal.name }}` or `{{ mySignal.length }}` or `{{ mySignal.prototype }}`
  // as these are the names of instance properties of Function, the compiler does _not_ throw an
  // error.
  // We also check for `{{ mySignal.set }}` or `{{ mySignal.update }}` or
  // `{{ mySignal.asReadonly }}` as these are the names of instance properties of Signal
  if (!isFunctionInstanceProperty(node.name) && !isSignalInstanceProperty(node.name)) {
    return [];
  }
  const symbolOfReceiver = ctx.templateTypeChecker.getSymbolOfNode(node.receiver, component);
  if (
    symbolOfReceiver !== null &&
    symbolOfReceiver.kind === SymbolKind.Expression &&
    isSignalReference(symbolOfReceiver)
  ) {
    const templateMapping = ctx.templateTypeChecker.getTemplateMappingAtTcbLocation(
      symbolOfReceiver.tcbLocation,
    )!;

    const errorString = `${
      (node.receiver as PropertyRead).name
    } is a function and should be invoked: ${(node.receiver as PropertyRead).name}()`;
    const diagnostic = ctx.makeTemplateDiagnostic(templateMapping.span, errorString);
    return [diagnostic];
  }

  return [];
}

export const factory: TemplateCheckFactory<
  ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED
> = {
  code: ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  name: ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED,
  create: () => new InterpolatedSignalCheck(),
};
