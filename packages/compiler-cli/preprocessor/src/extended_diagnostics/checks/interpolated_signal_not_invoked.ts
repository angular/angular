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
  Conditional,
  ImplicitReceiver,
  Interpolation,
  isNgTemplate,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  SafePropertyRead,
  TcbDirectiveMetadata,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstIfBlock,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstTemplate,
} from '@angular/compiler';
import {ErrorCode} from '../../error_code.js';
import type {Diagnostic} from '../../diagnostic.js';
import type {TcbTargetInput} from '../../tcb.js';
import {
  formatExtendedError,
  TemplateCheckFactory,
  TemplateCheckWithVisitor,
  TemplateContext,
} from '../api.js';

/** Names of known signal instance properties. */
const SIGNAL_INSTANCE_PROPERTIES = new Set(['set', 'update', 'asReadonly']);

/**
 * Names of known function instance properties.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function#instance_properties
 */
const FUNCTION_INSTANCE_PROPERTIES = new Set(['name', 'length', 'prototype']);

/**
 * Ensures Signals are invoked when used in template interpolations, property bindings, and control
 * flow expressions.
 *
 * Mirrors `InterpolatedSignalCheck` in
 * `ngtsc/typecheck/extended/checks/interpolated_signal_not_invoked/index.ts`.
 */
class InterpolatedSignalCheck extends TemplateCheckWithVisitor<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED> {
  override code = ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED as const;
  private signalMembers = new Set<string>();

  override run(
    ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
    component: TcbTargetInput,
    template: TmplAstNode[],
  ): Diagnostic[] {
    const members = component.classMeta.signalMembers;
    if (!members || members.length === 0) {
      return [];
    }
    this.signalMembers = new Set(members);
    try {
      return super.run(ctx, component, template);
    } finally {
      this.signalMembers = new Set();
    }
  }

  override visitNode(
    ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    // interpolations like `{{ mySignal }}`
    if (node instanceof Interpolation) {
      return node.expressions
        .map((item) => (item instanceof PrefixNot ? item.expression : item))
        .filter((item): item is PropertyRead => item instanceof PropertyRead)
        .flatMap((item) => buildDiagnosticForSignal(ctx, item, this.signalMembers));
    }
    // check bound inputs like `[prop]="mySignal"` on an element or inline template
    if (node instanceof TmplAstElement && node.inputs.length > 0) {
      // Allow signals to be passed directly to foreign components, without invocation.
      if (ctx.boundTarget.getForeignComponent(node) !== null) {
        return [];
      }
      const directivesOfElement = ctx.boundTarget.getDirectivesOfNode(node);
      return node.inputs.flatMap((input) =>
        checkBoundAttribute(ctx, directivesOfElement, input, this.signalMembers),
      );
    }
    if (node instanceof TmplAstTemplate && node.tagName && isNgTemplate(node.tagName)) {
      const directivesOfElement = ctx.boundTarget.getDirectivesOfNode(node);
      const inputDiagnostics = node.inputs.flatMap((input) =>
        checkBoundAttribute(ctx, directivesOfElement, input, this.signalMembers),
      );
      const templateAttrDiagnostics = node.templateAttrs.flatMap((attr) => {
        if (!(attr instanceof TmplAstBoundAttribute)) {
          return [];
        }
        return checkBoundAttribute(ctx, directivesOfElement, attr, this.signalMembers);
      });
      return inputDiagnostics.concat(templateAttrDiagnostics);
    }
    // if blocks like `@if(mySignal) { ... }`
    if (node instanceof TmplAstIfBlock) {
      return node.branches
        .map((branch) => branch.expression)
        .filter((expr): expr is ASTWithSource => expr instanceof ASTWithSource)
        .map((expr) => (expr.ast instanceof PrefixNot ? expr.ast.expression : expr.ast))
        .filter((ast): ast is PropertyRead => ast instanceof PropertyRead)
        .flatMap((item) => buildDiagnosticForSignal(ctx, item, this.signalMembers));
    }
    // switch blocks like `@switch(mySignal) { ... }`
    if (node instanceof TmplAstSwitchBlock && node.expression instanceof ASTWithSource) {
      const expression =
        node.expression.ast instanceof PrefixNot
          ? node.expression.ast.expression
          : node.expression.ast;
      if (expression instanceof PropertyRead) {
        return buildDiagnosticForSignal(ctx, expression, this.signalMembers);
      }
    }

    return [];
  }
}

function checkBoundAttribute(
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  directivesOfElement: TcbDirectiveMetadata[] | null,
  node: TmplAstBoundAttribute,
  signalMembers: ReadonlySet<string>,
): Diagnostic[] {
  // Skip the check if the node is an input binding on a matched directive/component.
  if (
    directivesOfElement !== null &&
    directivesOfElement.some((dir) => dir.inputs.getByBindingPropertyName(node.name) !== null)
  ) {
    return [];
  }

  if (!(node.value instanceof ASTWithSource)) {
    return [];
  }
  const propertyReads = getPropertyReads(node.value.ast);
  if (propertyReads.length === 0) {
    return [];
  }

  if (
    node.type === BindingType.Property ||
    node.type === BindingType.Class ||
    node.type === BindingType.Style ||
    node.type === BindingType.Attribute ||
    node.type === BindingType.Animation ||
    node.type === BindingType.LegacyAnimation
  ) {
    return propertyReads.flatMap((nodeAst) =>
      buildDiagnosticForSignal(ctx, nodeAst, signalMembers),
    );
  }

  return [];
}

function getPropertyReads(ast: AST): PropertyRead[] {
  if (ast instanceof PrefixNot) {
    return ast.expression instanceof PropertyRead ? [ast.expression] : [];
  }
  if (ast instanceof PropertyRead) {
    return [ast];
  }
  if (ast instanceof Conditional) {
    return [
      ...getPropertyReads(ast.condition),
      ...getPropertyReads(ast.trueExp),
      ...getPropertyReads(ast.falseExp),
    ];
  }
  if (ast instanceof ParenthesizedExpression) {
    return getPropertyReads(ast.expression);
  }
  if (ast instanceof NonNullAssert) {
    return getPropertyReads(ast.expression);
  }
  return [];
}

function buildDiagnosticForSignal(
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  node: PropertyRead,
  signalMembers: ReadonlySet<string>,
): Diagnostic[] {
  if (isKnownSignalExpression(node, ctx, signalMembers)) {
    const errorString = formatExtendedError(
      ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
      `${node.name} is a function and should be invoked: ${node.name}()}`,
    );
    return [ctx.makeTemplateDiagnostic(node.nameSpan, errorString)];
  }

  if (!FUNCTION_INSTANCE_PROPERTIES.has(node.name) && !SIGNAL_INSTANCE_PROPERTIES.has(node.name)) {
    return [];
  }

  if (!(node.receiver instanceof PropertyRead)) {
    return [];
  }

  if (isKnownSignalExpression(node.receiver, ctx, signalMembers)) {
    const errorString = formatExtendedError(
      ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
      `${node.receiver.name} is a function and should be invoked: ${node.receiver.name}()`,
    );
    return [ctx.makeTemplateDiagnostic(node.receiver.nameSpan, errorString)];
  }

  return [];
}

function isKnownSignalExpression(
  node: PropertyRead,
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  signalMembers: ReadonlySet<string>,
): boolean {
  const path = resolveComponentMemberPath(node, ctx, new Set());
  return path !== null && signalMembers.has(path);
}

function resolveComponentMemberPath(
  ast: AST,
  ctx: TemplateContext<ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED>,
  visited: Set<TmplAstLetDeclaration>,
): string | null {
  while (
    ast instanceof ASTWithSource ||
    ast instanceof ParenthesizedExpression ||
    ast instanceof NonNullAssert
  ) {
    ast = ast instanceof ASTWithSource ? ast.ast : ast.expression;
  }

  if (!(ast instanceof PropertyRead) && !(ast instanceof SafePropertyRead)) {
    return null;
  }

  if (ast.receiver instanceof ThisReceiver) {
    return ast.name;
  }

  if (ast.receiver instanceof ImplicitReceiver) {
    const target = ctx.boundTarget.getExpressionTarget(ast);
    if (target === null) {
      return ast.name;
    }
    if (target instanceof TmplAstLetDeclaration) {
      if (visited.has(target)) {
        return null;
      }
      visited.add(target);
      return resolveComponentMemberPath(target.value, ctx, visited);
    }
    if (target instanceof TmplAstReference) {
      // TODO: Support signal members on referenced directives/components once signalMembers is
      // exposed on directive metadata.
      return null;
    }
    return null;
  }

  const receiverPath = resolveComponentMemberPath(ast.receiver, ctx, visited);
  if (receiverPath === null) {
    return null;
  }
  return `${receiverPath}.${ast.name}`;
}

export const factory: TemplateCheckFactory<
  ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  'interpolatedSignalNotInvoked'
> = {
  code: ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED,
  name: 'interpolatedSignalNotInvoked',
  create: () => new InterpolatedSignalCheck(),
};
