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
 * The intrinsic property name used to project children into a foreign component.
 */
const CHILDREN = 'children';

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
  // Tracks the named @content blocks defined for each foreign component element.
  // This is used to detect duplicate @content declarations under the same parent
  // during the recursive AST traversal.
  private readonly seenContentBlocks = new Map<TmplAstElement, Map<string, TmplAstContentBlock>>();

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
      this.validateForeignComponent(element);
    }

    const prevParent = this.currentParent;
    this.currentParent = element;
    super.visitElement(element);
    this.currentParent = prevParent;
  }

  private validateForeignComponent(element: TmplAstElement): void {
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

    // A foreign component maps implicit child nodes to a 'children' property.
    // If the user also explicitly binds to '[children]' or sets a static 'children' attribute,
    // this is a conflict.
    const childrenInput = element.inputs.find(
      (input) => input.type === BindingType.Property && input.name === CHILDREN,
    );
    const childrenAttr = element.attributes.find((attr) => attr.name === CHILDREN);
    const conflictingSource = childrenInput ?? childrenAttr;
    if (conflictingSource === undefined) {
      return;
    }

    // Explicit `@content` blocks (TmplAstContentBlock) are mapped to properties by their name, so
    // they do not conflict with the default 'children' property. We only care about child nodes
    // that are not content blocks, as those are implicitly passed to the 'children' property.
    const firstChild = element.children.find((child) => !(child instanceof TmplAstContentBlock));
    if (firstChild === undefined) {
      return;
    }

    this.diagnostics.push(
      makeTemplateDiagnostic(
        '' as TypeCheckId,
        this.sourceMapping,
        conflictingSource.sourceSpan,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.CONFLICTING_CONTENT_AND_PROPERTY),
        `A foreign component cannot have both a '${CHILDREN}' property and child nodes.`,
        [
          {
            text: 'Child nodes are defined here.',
            start: firstChild.sourceSpan.start.offset,
            end: firstChild.sourceSpan.end.offset,
            sourceFile: this.sourceMapping.node.getSourceFile(),
          },
        ],
      ),
    );
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
    if (this.parentNodeIsForeignComponent()) {
      this.validateContentBlock(block);
    } else {
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

  private validateContentBlock(block: TmplAstContentBlock): void {
    const parent = this.currentParent as TmplAstElement;

    // Retrieve or initialize the map of @content blocks seen so far for this parent.
    // Since the visitor is recursive, we must track declarations per-parent to
    // only report duplicates within the scope of the same foreign component.
    let seen = this.seenContentBlocks.get(parent);
    if (seen === undefined) {
      seen = new Map<string, TmplAstContentBlock>();
      this.seenContentBlocks.set(parent, seen);
    }

    if (seen.has(block.name)) {
      const firstDecl = seen.get(block.name)!;
      this.diagnostics.push(
        makeTemplateDiagnostic(
          '' as TypeCheckId,
          this.sourceMapping,
          block.sourceSpan,
          ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.CONFLICTING_CONTENT_DECLARATION),
          `A @content block with the name '${block.name}' has already been defined for this ` +
            'component.',
          [
            {
              text: `The @content block '${block.name}' was first defined here.`,
              start: firstDecl.sourceSpan.start.offset,
              end: firstDecl.sourceSpan.end.offset,
              sourceFile: this.sourceMapping.node.getSourceFile(),
            },
          ],
        ),
      );
    } else {
      seen.set(block.name, block);
    }

    // A @content block projects content into a property of the foreign component.
    // If the parent element also binds to this property (either via a property binding
    // or a static attribute), it creates a conflict as both try to write to the same prop.
    const conflictInput = parent.inputs.find(
      (input) => input.type === BindingType.Property && input.name === block.name,
    );
    const conflictAttr = parent.attributes.find((attr) => attr.name === block.name);
    const conflict = conflictInput ?? conflictAttr;

    if (conflict !== undefined) {
      this.diagnostics.push(
        makeTemplateDiagnostic(
          '' as TypeCheckId,
          this.sourceMapping,
          block.sourceSpan,
          ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.CONFLICTING_CONTENT_AND_PROPERTY),
          `A @content block with the name '${block.name}' conflicts with a property on the ` +
            'parent component.',
          [
            {
              text: `The property '${block.name}' is defined here.`,
              start: conflict.sourceSpan.start.offset,
              end: conflict.sourceSpan.end.offset,
              sourceFile: this.sourceMapping.node.getSourceFile(),
            },
          ],
        ),
      );
    }

    // Explicitly defining a `@content(children)` block is unnecessary because child nodes are
    // implicitly passed to the `children` property.
    if (block.name === CHILDREN) {
      this.diagnostics.push(
        makeTemplateDiagnostic(
          '' as TypeCheckId,
          this.sourceMapping,
          block.sourceSpan,
          ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.FOREIGN_COMPONENT_CONTENT_UNNECESSARY_FOR_CHILDREN),
          `Defining a @content (${CHILDREN}) block is unnecessary. ` +
            'Pass children as direct nested content of the foreign component instead.',
        ),
      );
    }
  }
}
