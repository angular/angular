/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstVisitor,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredTrigger,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIcu,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstUnknownBlock,
  TmplAstVariable,
  TmplAstComponent,
  TmplAstDirective,
  ParseSourceSpan,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {PotentialDirective} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';
import {TypeCheckInfo} from './utils';

/**
 * see https://github.com/microsoft/TypeScript/blob/c85e626d8e17427a6865521737b45ccbbe9c78ef/src/services/classifier2020.ts#L49
 */
export const enum TokenEncodingConsts {
  typeOffset = 8,
  modifierMask = (1 << typeOffset) - 1,
}

/**
 * Token types extended from TypeScript
 * see https://github.com/microsoft/TypeScript/blob/c85e626d8e17427a6865521737b45ccbbe9c78ef/src/services/classifier2020.ts#L55
 */
export const enum TokenType {
  class,
  enum,
  interface,
  namespace,
  typeParameter,
  type,
  parameter,
  variable,
  enumMember,
  property,
  function,
  member,
}

/**
 * Token modifiers extended from TypeScript
 * see https://github.com/microsoft/TypeScript/blob/c85e626d8e17427a6865521737b45ccbbe9c78ef/src/services/classifier2020.ts#L71
 */
export const enum TokenModifier {
  declaration,
  static,
  async,
  readonly,
  defaultLibrary,
  local,
}

export function getClassificationsForTemplate(
  compiler: NgCompiler,
  typeCheckInfo: TypeCheckInfo,
  range: ts.TextSpan,
): ts.Classifications {
  const templateTypeChecker = compiler.getTemplateTypeChecker();
  const potentialTags = templateTypeChecker.getElementsInFileScope(typeCheckInfo.declaration);

  const visitor = new ClassificationVisitor(potentialTags, range);
  visitor.visitAll(typeCheckInfo.nodes);

  return {
    spans: visitor.getSpans(),
    endOfLineState: ts.EndOfLineState.None,
  };
}

class ClassificationVisitor implements TmplAstVisitor {
  private spans: number[] = [];
  constructor(
    private tags: Map<string, PotentialDirective | null>,
    private range: ts.TextSpan,
  ) {}

  getSpans(): number[] {
    return this.spans;
  }

  visit(node: TmplAstNode | null) {
    if (node && this.rangeIntersectsWith(node.sourceSpan)) {
      node.visit(this);
    }
  }

  visitElement(element: TmplAstElement) {
    const tag = element.name;
    const potentialDirective = this.tags.get(tag);
    // prevent classification of non-component directives that would be applied
    // to this element due to a matching selector
    const isComponent = potentialDirective && potentialDirective.isComponent;
    const classification = this.classifyAs(TokenType.class);

    if (isComponent && this.rangeIntersectsWith(element.startSourceSpan)) {
      this.spans.push(element.startSourceSpan.start.offset + 1, tag.length, classification);
    }

    this.visitAll(element.children);

    if (isComponent && !element.isSelfClosing && this.rangeIntersectsWith(element.endSourceSpan!)) {
      this.spans.push(element.endSourceSpan!.start.offset + 2, tag.length, classification);
    }
  }

  visitContent(content: TmplAstContent) {
    this.visitAll(content.children);
  }

  visitVariable(variable: TmplAstVariable) {}
  visitReference(reference: TmplAstReference) {}
  visitTextAttribute(attribute: TmplAstTextAttribute) {}
  visitBoundAttribute(attribute: TmplAstBoundAttribute) {}
  visitBoundEvent(attribute: TmplAstBoundEvent) {}
  visitText(text: TmplAstText) {}
  visitBoundText(text: TmplAstBoundText) {}
  visitIcu(icu: TmplAstIcu) {}

  visitDeferredBlock(deferred: TmplAstDeferredBlock) {
    this.visitAll(deferred.children);
    this.visit(deferred.error);
    this.visit(deferred.loading);
    this.visit(deferred.placeholder);
  }

  visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder) {
    this.visitAll(block.children);
  }

  visitDeferredBlockError(block: TmplAstDeferredBlockError) {
    this.visitAll(block.children);
  }

  visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading) {
    this.visitAll(block.children);
  }

  visitDeferredTrigger(trigger: TmplAstDeferredTrigger) {}

  visitSwitchBlock(block: TmplAstSwitchBlock) {
    this.visitAll(block.cases);
  }

  visitSwitchBlockCase(block: TmplAstSwitchBlockCase) {
    this.visitAll(block.children);
  }

  visitForLoopBlock(block: TmplAstForLoopBlock) {
    this.visitAll(block.children);
    this.visit(block.empty);
  }

  visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty) {
    this.visitAll(block.children);
  }

  visitIfBlock(block: TmplAstIfBlock) {
    this.visitAll(block.branches);
  }

  visitIfBlockBranch(block: TmplAstIfBlockBranch) {
    this.visitAll(block.children);
  }

  visitTemplate(template: TmplAstTemplate) {
    this.visitAll(template.children);
  }

  visitUnknownBlock(block: TmplAstUnknownBlock) {}
  visitLetDeclaration(decl: TmplAstLetDeclaration) {}

  visitComponent(component: TmplAstComponent) {}
  visitDirective(directive: TmplAstDirective) {}

  visitAll(children: TmplAstNode[]) {
    for (const child of children) {
      this.visit(child);
    }
  }

  private rangeIntersectsWith(span: ParseSourceSpan) {
    const start = span.start.offset;
    const length = span.end.offset - start;
    return ts.textSpanIntersectsWith(this.range, start, length);
  }

  private classifyAs(type: TokenType, modifiers: number = 0) {
    return ((type + 1) << TokenEncodingConsts.typeOffset) + modifiers;
  }
}
