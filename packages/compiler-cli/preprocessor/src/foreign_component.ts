/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Analysis of template features relating to foreign components, ported from ngtsc's
 * `analyzeForeignComponentFeatures` and producing `NgDiagnostic`s for the diagnostics
 * channel instead of `ts.Diagnostic`s.
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/foreign_component.ts
 */

import {
  BindingType,
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
  ParseSourceSpan,
} from '@angular/compiler';

import * as nga from './types.js';

/** Error codes for the diagnostics below, mirroring ngtsc's `ErrorCode` members. */
const FOREIGN_COMPONENT_UNSUPPORTED_BINDING = 8025;
const INVALID_CONTENT_PLACEMENT = 8026;
const FOREIGN_COMPONENT_CONTENT_UNNECESSARY_FOR_CHILDREN = 8027;
const CONFLICTING_CONTENT_DECLARATION = 8028;
const CONFLICTING_CONTENT_AND_PROPERTY = 8029;

/**
 * The intrinsic property name used to project children into a foreign component.
 */
const CHILDREN = 'children';

/**
 * Analyzes the template for invalid use of features relating to foreign components.
 *
 * The reference matches foreign components through a `SelectorlessMatcher` whose registry is
 * keyed by the imported component names, one entry per name — set membership on the names is
 * the same relation.
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/metadata/src/util.ts#L366-L377
 *
 * @param nodes The parsed template nodes to analyze.
 * @param foreignComponentNames The names registered via `foreignImports`.
 * @param filePath The file diagnostics are attributed to (the template file for external
 *   templates, the component source file otherwise).
 * @returns A list of diagnostics that should be reported for the template.
 */
export function analyzeForeignComponentFeatures(
  nodes: TmplAstNode[],
  foreignComponentNames: ReadonlySet<string>,
  filePath: string,
): nga.NgDiagnostic[] {
  const analyzer = new ForeignComponentFeatureAnalyzer(foreignComponentNames, filePath);
  tmplAstVisitAll(analyzer, nodes);
  return analyzer.diagnostics;
}

class ForeignComponentFeatureAnalyzer extends TmplAstRecursiveVisitor {
  private currentParent: TmplAstNode | null = null;
  readonly diagnostics: nga.NgDiagnostic[] = [];
  // Tracks the named @content blocks defined for each foreign component element.
  // This is used to detect duplicate @content declarations under the same parent
  // during the recursive AST traversal.
  private readonly seenContentBlocks = new Map<TmplAstElement, Map<string, TmplAstContentBlock>>();

  constructor(
    private readonly foreignComponentNames: ReadonlySet<string>,
    private readonly filePath: string,
  ) {
    super();
  }

  private report(code: number, sourceSpan: ParseSourceSpan, messageText: string): void {
    this.diagnostics.push({
      category: 1,
      code,
      messageText,
      filePath: this.filePath,
      span: {start: sourceSpan.start.offset, end: sourceSpan.end.offset},
    });
  }

  private elementIsForeignComponent(tagName: string): boolean {
    return this.foreignComponentNames.has(tagName);
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
      this.report(
        FOREIGN_COMPONENT_UNSUPPORTED_BINDING,
        element.sourceSpan,
        'Foreign components do not support event bindings.',
      );
    }
    if (element.references.length > 0) {
      this.report(
        FOREIGN_COMPONENT_UNSUPPORTED_BINDING,
        element.sourceSpan,
        'Foreign components do not support references.',
      );
    }
    if (element.inputs.some((input) => input.type !== BindingType.Property)) {
      this.report(
        FOREIGN_COMPONENT_UNSUPPORTED_BINDING,
        element.sourceSpan,
        'Foreign components only support static attributes and property bindings.',
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

    this.report(
      CONFLICTING_CONTENT_AND_PROPERTY,
      conflictingSource.sourceSpan,
      `A foreign component cannot have both a '${CHILDREN}' property and child nodes.`,
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
      this.report(
        INVALID_CONTENT_PLACEMENT,
        block.sourceSpan,
        '@content blocks are only valid as direct children of foreign components.',
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
      this.report(
        CONFLICTING_CONTENT_DECLARATION,
        block.sourceSpan,
        `A @content block with the name '${block.name}' has already been defined for this ` +
          'component.',
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
      this.report(
        CONFLICTING_CONTENT_AND_PROPERTY,
        block.sourceSpan,
        `A @content block with the name '${block.name}' conflicts with a property on the ` +
          'parent component.',
      );
    }

    // Explicitly defining a `@content (children)` block without parameters is unnecessary because
    // child nodes are implicitly passed to the `children` property.
    if (block.name === CHILDREN && block.variables.length === 0) {
      this.report(
        FOREIGN_COMPONENT_CONTENT_UNNECESSARY_FOR_CHILDREN,
        block.sourceSpan,
        `Defining a @content (${CHILDREN}) block with no parameters is unnecessary. ` +
          'Pass children as direct nested content of the foreign component instead.',
      );
    }
  }
}
