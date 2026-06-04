/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  BindingType,
  SelectorlessMatcher,
  TmplAstContent,
  TmplAstContentBlock,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCaseGroup,
  TmplAstTemplate,
  tmplAstVisitAll,
  TypeCheckId,
} from '@angular/compiler';
import ts from 'typescript';

import {ParsedTemplateWithSource} from './resources';
import {ErrorCode, ngErrorCode} from '../../../diagnostics';
import {ForeignComponentMeta} from '../../../metadata';
import {makeTemplateDiagnostic} from '../../../typecheck/diagnostics';
import {SourceMapping} from '../../../typecheck/api';

/**
 * Analyzes the template for invalid use of features relating to foreign components.
 *
 * @param template The template to analyze.
 * @param foreignMatcher A matcher that can be used to identify foreign components.
 * @returns A list of diagnostics that should be reported for the template.
 */
export function analyzeForeignComponentFeatures(
  template: ParsedTemplateWithSource,
  foreignMatcher: SelectorlessMatcher<ForeignComponentMeta> | null,
): ts.Diagnostic[] {
  const analyzer = new ForeignComponentFeatureAnalyzer(foreignMatcher, template.sourceMapping);
  tmplAstVisitAll(analyzer, template.nodes);
  return analyzer.diagnostics;
}

class ForeignComponentFeatureAnalyzer extends TmplAstRecursiveVisitor {
  private currentParent: TmplAstNode | null = null;
  readonly diagnostics: ts.Diagnostic[] = [];

  constructor(
    private readonly foreignMatcher: SelectorlessMatcher<ForeignComponentMeta> | null,
    private readonly sourceMapping: SourceMapping,
  ) {
    super();
  }

  private elementIsForeignComponent(tagName: string): boolean {
    return this.foreignMatcher !== null && this.foreignMatcher.match(tagName).length > 0;
  }

  private parentNodeIsForeignComponent(): boolean {
    return (
      this.currentParent !== null &&
      this.currentParent instanceof TmplAstElement &&
      this.elementIsForeignComponent(this.currentParent.name)
    );
  }

  override visitElement(element: TmplAstElement): void {
    if (this.elementIsForeignComponent(element.name)) {
      if (element.outputs.length > 0) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components do not support event bindings.',
          ),
        );
      }
      if (element.references.length > 0) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components do not support references.',
          ),
        );
      }
      if (element.inputs.some((input) => input.type !== BindingType.Property)) {
        this.diagnostics.push(
          makeTemplateDiagnostic(
            '' as TypeCheckId,
            this.sourceMapping,
            element.sourceSpan,
            ts.DiagnosticCategory.Error,
            ngErrorCode(ErrorCode.FOREIGN_COMPONENT_UNSUPPORTED_BINDING),
            'Foreign components only support static attributes and property bindings.',
          ),
        );
      }
    }

    const prevParent = this.currentParent;
    this.currentParent = element;
    super.visitElement(element);
    this.currentParent = prevParent;
  }

  override visitTemplate(template: TmplAstTemplate): void {
    const prevParent = this.currentParent;
    this.currentParent = template;
    super.visitTemplate(template);
    this.currentParent = prevParent;
  }

  override visitDeferredBlock(deferred: TmplAstDeferredBlock): void {
    const prevParent = this.currentParent;
    this.currentParent = deferred;
    super.visitDeferredBlock(deferred);
    this.currentParent = prevParent;
  }

  override visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitDeferredBlockPlaceholder(block);
    this.currentParent = prevParent;
  }

  override visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitDeferredBlockError(block);
    this.currentParent = prevParent;
  }

  override visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitDeferredBlockLoading(block);
    this.currentParent = prevParent;
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitSwitchBlock(block);
    this.currentParent = prevParent;
  }

  override visitSwitchBlockCaseGroup(block: TmplAstSwitchBlockCaseGroup): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitSwitchBlockCaseGroup(block);
    this.currentParent = prevParent;
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitForLoopBlock(block);
    this.currentParent = prevParent;
  }

  override visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitForLoopBlockEmpty(block);
    this.currentParent = prevParent;
  }

  override visitIfBlock(block: TmplAstIfBlock): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitIfBlock(block);
    this.currentParent = prevParent;
  }

  override visitIfBlockBranch(block: TmplAstIfBlockBranch): void {
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitIfBlockBranch(block);
    this.currentParent = prevParent;
  }

  override visitContent(content: TmplAstContent): void {
    const prevParent = this.currentParent;
    this.currentParent = content;
    super.visitContent(content);
    this.currentParent = prevParent;
  }

  override visitContentBlock(block: TmplAstContentBlock): void {
    if (!this.parentNodeIsForeignComponent()) {
      this.diagnostics.push(
        makeTemplateDiagnostic(
          '' as TypeCheckId,
          this.sourceMapping,
          block.sourceSpan,
          ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.INVALID_CONTENT_PLACEMENT),
          '@content blocks are only valid as direct children of foreign components.',
        ),
      );
    }
    const prevParent = this.currentParent;
    this.currentParent = block;
    super.visitContentBlock(block);
    this.currentParent = prevParent;
  }
}
