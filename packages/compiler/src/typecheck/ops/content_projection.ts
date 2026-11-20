/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CssSelector, SelectorMatcher} from '../../directive_matching';
import {splitNsName} from '../../ml_parser/tags';
import {
  BoundaryBlock,
  Content,
  Element,
  ForLoopBlock,
  ForLoopBlockEmpty,
  IfBlock,
  IfBlockBranch,
  LetDeclaration,
  Node,
  SwitchBlock,
  SwitchBlockCaseGroup,
  Template,
  Text,
  TextAttribute,
} from '../../render3/r3_ast';
import {createCssSelectorFromNode} from '../../render3/view/util';
import {NG_PROJECT_AS} from '../../template_parser/template_preparser';
import {OutOfBandDiagnosticCategory} from '../oob';
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
  private readonly category: OutOfBandDiagnosticCategory;

  constructor(
    private tcb: Context,
    private element: Element,
    private ngContentSelectors: string[],
    private componentName: string,
  ) {
    super();

    // We only need to account for `error` and `warning` since
    // this check won't be enabled for `suppress`.
    this.category =
      tcb.env.config.controlFlowPreventingContentProjection === 'error'
        ? OutOfBandDiagnosticCategory.Error
        : OutOfBandDiagnosticCategory.Warning;
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
          if (child instanceof Element || child instanceof Template) {
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
      IfBlockBranch | SwitchBlockCaseGroup | ForLoopBlock | ForLoopBlockEmpty | BoundaryBlock
    > = [];

    for (const child of this.element.children) {
      if (child instanceof ForLoopBlock) {
        if (this.shouldCheck(child)) {
          result.push(child);
        }
        if (child.empty !== null && this.shouldCheck(child.empty)) {
          result.push(child.empty);
        }
      } else if (child instanceof IfBlock) {
        for (const branch of child.branches) {
          if (this.shouldCheck(branch)) {
            result.push(branch);
          }
        }
      } else if (child instanceof SwitchBlock) {
        for (const current of child.groups) {
          if (this.shouldCheck(current)) {
            result.push(current);
          }
        }
      } else if (child instanceof BoundaryBlock) {
        // `@error` blocks aren't checked, because they don't copy the
        // tag name and attributes of their root node for content projection.
        if (this.shouldCheck(child)) {
          result.push(child);
        }
      }
    }

    return result;
  }

  private shouldCheck(node: Node & {children: Node[]}): boolean {
    // Skip nodes with less than two children since it's impossible
    // for them to run into the issue that we're checking for.
    if (node.children.length < 2) {
      return false;
    }

    let hasSeenRootNode = false;

    // Check the number of root nodes while skipping empty text where relevant.
    for (const child of node.children) {
      // `@let` declarations don't render anything so they don't affect content projection.
      if (child instanceof LetDeclaration) {
        continue;
      }

      // Normally `preserveWhitspaces` would have been accounted for during parsing, however
      // in `ngtsc/annotations/component/src/resources.ts#parseExtractedTemplate` we enable
      // `preserveWhitespaces` to preserve the accuracy of source maps diagnostics. This means
      // that we have to account for it here since the presence of text nodes affects the
      // content projection behavior.
      if (
        !(child instanceof Text) ||
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

/**
 * A `TcbOp` that validates static attributes on `<ng-content>`, allowing attributes that are
 * either read by Angular or used to match a content projection slot of a parent component.
 */
export class TcbContentAttributesOp extends TcbOp {
  constructor(
    private tcb: Context,
    private node: Content,
  ) {
    super();
  }

  override readonly optional = false;

  override execute(): null {
    const usedInSlot = this.tcb.contentAttributesInProjectionSlots.get(this.node);
    for (const attr of this.node.attributes) {
      if (!isAllowedNgContentAttribute(attr.name) && !usedInSlot?.has(attr)) {
        this.tcb.oobRecorder.unsupportedNgContentAttribute(this.tcb.id, attr);
      }
    }
    return null;
  }
}

function isAllowedNgContentAttribute(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower === 'select' ||
    name === 'ngProjectAs' ||
    name === 'ngSkipHydration' ||
    name === 'ngPreserveWhitespaces'
  );
}

/**
 * Finds the static attributes on child `<ng-content>` nodes that select a specific content
 * projection slot of their parent component. An attribute participates in projection if the
 * `<ng-content>` node would land in a different slot without it.
 */
export function getContentAttributesInProjectionSlots(
  children: Node[],
  ngContentSelectors: string[],
): Map<Content, Set<TextAttribute>> {
  const matcher = new SelectorMatcher<string>();
  for (const selector of ngContentSelectors) {
    if (selector !== '*') {
      matcher.addSelectables(CssSelector.parse(selector), selector);
    }
  }

  const result = new Map<Content, Set<TextAttribute>>();
  for (const child of children) {
    if (
      !(child instanceof Content) ||
      child.attributes.some((attr) => attr.name === NG_PROJECT_AS)
    ) {
      continue;
    }
    const selector = createContentCssSelector(child);
    const slot = findProjectionSlot(matcher, ngContentSelectors, selector);
    const attributes = new Set<TextAttribute>();
    for (const attr of child.attributes) {
      const withoutAttr = removeAttributeFromSelector(selector, attr.name);
      if (findProjectionSlot(matcher, ngContentSelectors, withoutAttr) !== slot) {
        attributes.add(attr);
      }
    }
    result.set(child, attributes);
  }
  return result;
}

function findProjectionSlot(
  matcher: SelectorMatcher<string>,
  ngContentSelectors: string[],
  selector: CssSelector,
): number | null {
  let slot: number | null = null;
  matcher.match(selector, (_, slotSelector) => {
    const index = ngContentSelectors.indexOf(slotSelector);
    if (slot === null || index < slot) {
      slot = index;
    }
  });
  return slot;
}

function removeAttributeFromSelector(selector: CssSelector, name: string): CssSelector {
  const nameNoNs = splitNsName(name)[1];
  const result = new CssSelector();
  result.setElement(selector.element);
  for (let i = 0; i < selector.attrs.length; i += 2) {
    if (selector.attrs[i] !== nameNoNs) {
      result.addAttribute(selector.attrs[i], selector.attrs[i + 1]);
    }
  }
  if (nameNoNs.toLowerCase() !== 'class') {
    for (const className of selector.classNames) {
      result.addClassName(className);
    }
  }
  return result;
}

function createContentCssSelector(node: Content): CssSelector {
  const selector = new CssSelector();
  for (const attr of node.attributes) {
    const name = splitNsName(attr.name)[1];
    if (name.toLowerCase() === 'select') {
      continue;
    }
    selector.addAttribute(name, attr.value);
    if (name.toLowerCase() === 'class') {
      for (const className of attr.value.trim().split(/\s+/)) {
        if (className !== '') {
          selector.addClassName(className);
        }
      }
    }
  }
  return selector;
}
