/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  createCssSelectorFromNode,
  CssSelector,
  SelectorMatcher,
  TmplAstComponent,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstNode,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCaseGroup,
  TmplAstTemplate,
  TmplAstText,
} from '@angular/compiler';
import ts from 'typescript';
import {TcbOp} from './base';
import {Context} from './context';

/**
 * A `TcbOp` that finds and flags control flow nodes that interfere with content projection.
 *
 * Context:
 * Control flow blocks try to emulate the content projection behavior of `*ngIf` and `*ngFor`
 * in order to reduce breakages when moving from one syntax to the other (see #52414), however the
 * approach only works if there's only one element at the root of the control flow expression.
 * This means that a stray sibling node (e.g. text) can prevent an element from being projected
 * into the right slot. The purpose of the `TcbOp` is to find any places where a node at the root
 * of a control flow expression *would have been projected* into a specific slot, if the control
 * flow node didn't exist.
 */
export class TcbControlFlowContentProjectionOp extends TcbOp {
  private readonly category: ts.DiagnosticCategory;

  constructor(
    private tcb: Context,
    private element: TmplAstElement | TmplAstComponent,
    private ngContentSelectors: string[],
    private componentName: string,
  ) {
    super();

    // We only need to account for `error` and `warning` since
    // this check won't be enabled for `suppress`.
    this.category =
      tcb.env.config.controlFlowPreventingContentProjection === 'error'
        ? ts.DiagnosticCategory.Error
        : ts.DiagnosticCategory.Warning;
  }

  override readonly optional = false;

  override execute(): null {
    const controlFlowToCheck = this.findPotentialControlFlowNodes();

    if (controlFlowToCheck.length > 0) {
      const matcher = new SelectorMatcher<string>();

      for (const selector of this.ngContentSelectors) {
        // `*` is a special selector for the catch-all slot.
        if (selector !== '*') {
          matcher.addSelectables(CssSelector.parse(selector), selector);
        }
      }

      for (const root of controlFlowToCheck) {
        for (const child of root.children) {
          if (child instanceof TmplAstElement || child instanceof TmplAstTemplate) {
            matcher.match(createCssSelectorFromNode(child), (_, originalSelector) => {
              this.tcb.oobRecorder.controlFlowPreventingContentProjection(
                this.tcb.id,
                this.category,
                child,
                this.componentName,
                originalSelector,
                root,
                this.tcb.hostPreserveWhitespaces,
              );
            });
          }
        }
      }
    }

    return null;
  }

  private findPotentialControlFlowNodes() {
    const result: Array<
      | TmplAstIfBlockBranch
      | TmplAstSwitchBlockCaseGroup
      | TmplAstForLoopBlock
      | TmplAstForLoopBlockEmpty
    > = [];

    for (const child of this.element.children) {
      if (child instanceof TmplAstForLoopBlock) {
        if (this.shouldCheck(child)) {
          result.push(child);
        }
        if (child.empty !== null && this.shouldCheck(child.empty)) {
          result.push(child.empty);
        }
      } else if (child instanceof TmplAstIfBlock) {
        for (const branch of child.branches) {
          if (this.shouldCheck(branch)) {
            result.push(branch);
          }
        }
      } else if (child instanceof TmplAstSwitchBlock) {
        for (const current of child.groups) {
          if (this.shouldCheck(current)) {
            result.push(current);
          }
        }
      }
    }

    return result;
  }

  private shouldCheck(node: TmplAstNode & {children: TmplAstNode[]}): boolean {
    // Skip nodes with less than two children since it's impossible
    // for them to run into the issue that we're checking for.
    if (node.children.length < 2) {
      return false;
    }

    let hasSeenRootNode = false;

    // Check the number of root nodes while skipping empty text where relevant.
    for (const child of node.children) {
      // Normally `preserveWhitspaces` would have been accounted for during parsing, however
      // in `ngtsc/annotations/component/src/resources.ts#parseExtractedTemplate` we enable
      // `preserveWhitespaces` to preserve the accuracy of source maps diagnostics. This means
      // that we have to account for it here since the presence of text nodes affects the
      // content projection behavior.
      if (
        !(child instanceof TmplAstText) ||
        this.tcb.hostPreserveWhitespaces ||
        child.value.trim().length > 0
      ) {
        // Content projection will be affected if there's more than one root node.
        if (hasSeenRootNode) {
          return true;
        }
        hasSeenRootNode = true;
      }
    }

    return false;
  }
}
