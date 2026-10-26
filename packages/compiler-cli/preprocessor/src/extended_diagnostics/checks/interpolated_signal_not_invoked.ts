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
  Interpolation,
  isNgTemplate,
  NonNullAssert,
  ParenthesizedExpression,
  PrefixNot,
  PropertyRead,
  TcbDirectiveMetadata,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstIfBlock,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstTemplate,
} from '@angular/compiler';
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
 * Ensures Signals are invoked when used in template interpolations, DOM/style/class/attribute
 * bindings, and `@if` / `@switch` control flow expressions.
 *
 * Mirrors `InterpolatedSignalCheck` in
 * `ngtsc/typecheck/extended/checks/interpolated_signal_not_invoked/index.ts`.
 */
class InterpolatedSignalCheck extends TemplateCheckWithVisitor<8109> {
  override code = 8109 as const;

  override visitNode(
    ctx: TemplateContext<8109>,
    _component: TcbTargetInput,
    node: TmplAstNode | AST,
  ): Diagnostic[] {
    if (node instanceof Interpolation) {
      for (const expr of node.expressions) {
        const unwrapped = expr instanceof PrefixNot ? expr.expression : expr;
        if (unwrapped instanceof PropertyRead) {
          registerSignalCandidates(ctx, unwrapped);
        }
      }
      return [];
    }

    if (node instanceof TmplAstElement && node.inputs.length > 0) {
      if (ctx.boundTarget.getForeignComponent(node) !== null) {
        return [];
      }
      const directivesOfElement = ctx.boundTarget.getDirectivesOfNode(node);
      for (const input of node.inputs) {
        checkBoundAttribute(ctx, directivesOfElement, input);
      }
      return [];
    }

    if (node instanceof TmplAstTemplate && node.tagName && isNgTemplate(node.tagName)) {
      const directivesOfElement = ctx.boundTarget.getDirectivesOfNode(node);
      for (const input of node.inputs) {
        checkBoundAttribute(ctx, directivesOfElement, input);
      }
      for (const attr of node.templateAttrs) {
        if (attr instanceof TmplAstBoundAttribute) {
          checkBoundAttribute(ctx, directivesOfElement, attr);
        }
      }
      return [];
    }

    if (node instanceof TmplAstIfBlock) {
      for (const branch of node.branches) {
        if (!(branch.expression instanceof ASTWithSource)) {
          continue;
        }
        const ast =
          branch.expression.ast instanceof PrefixNot
            ? branch.expression.ast.expression
            : branch.expression.ast;
        if (ast instanceof PropertyRead) {
          registerSignalCandidates(ctx, ast);
        }
      }
      return [];
    }

    if (node instanceof TmplAstSwitchBlock && node.expression instanceof ASTWithSource) {
      const expression =
        node.expression.ast instanceof PrefixNot
          ? node.expression.ast.expression
          : node.expression.ast;
      if (expression instanceof PropertyRead) {
        registerSignalCandidates(ctx, expression);
      }
      return [];
    }

    return [];
  }
}

function checkBoundAttribute(
  ctx: TemplateContext<8109>,
  directivesOfElement: TcbDirectiveMetadata[] | null,
  node: TmplAstBoundAttribute,
): void {
  if (
    directivesOfElement !== null &&
    directivesOfElement.some((dir) => dir.inputs.getByBindingPropertyName(node.name) !== null)
  ) {
    return;
  }

  if (!(node.value instanceof ASTWithSource)) {
    return;
  }

  const propertyReads = getPropertyReads(node.value.ast);
  if (
    (node.type === BindingType.Property ||
      node.type === BindingType.Class ||
      node.type === BindingType.Style ||
      node.type === BindingType.Attribute ||
      node.type === BindingType.Animation ||
      node.type === BindingType.LegacyAnimation) &&
    propertyReads.length > 0
  ) {
    for (const propRead of propertyReads) {
      registerSignalCandidates(ctx, propRead);
    }
  }
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

function registerSignalCandidates(ctx: TemplateContext<8109>, node: PropertyRead): void {
  const target = ctx.boundTarget.getExpressionTarget(node);
  const directCandidate =
    target instanceof TmplAstReference
      ? undefined
      : ctx.addExtendedCheckCandidate?.({
          kind: 'notSignal',
          expr: node,
          sourceSpan: node.nameSpan,
          message: formatExtendedError(
            8109,
            `${node.name} is a function and should be invoked: ${node.name}()`,
          ),
        });

  if (!FUNCTION_INSTANCE_PROPERTIES.has(node.name) && !SIGNAL_INSTANCE_PROPERTIES.has(node.name)) {
    return;
  }

  if (!(node.receiver instanceof PropertyRead)) {
    return;
  }

  const receiverTarget = ctx.boundTarget.getExpressionTarget(node.receiver);
  if (receiverTarget instanceof TmplAstReference) {
    return;
  }

  ctx.addExtendedCheckCandidate?.({
    kind: 'notSignal',
    expr: node.receiver,
    sourceSpan: node.receiver.nameSpan,
    message: formatExtendedError(
      8109,
      `${node.receiver.name} is a function and should be invoked: ${node.receiver.name}()`,
    ),
    skipIfTriggered: directCandidate,
  });
}

export const factory: TemplateCheckFactory<8109, 'interpolatedSignalNotInvoked'> = {
  code: 8109,
  name: 'interpolatedSignalNotInvoked',
  create: () => new InterpolatedSignalCheck(),
};
