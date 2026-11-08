/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NO_ERRORS_SCHEMA} from '../../core';
import {BindingType, ParsedEventType} from '../../expression_parser/ast';
import {PRESERVE_WS_ATTR_NAME} from '../../ml_parser/html_whitespaces';
import {isNgContainer, isNgTemplate} from '../../ml_parser/tags';
import {
  BoundAttribute,
  BoundEvent,
  Content,
  Element,
  Node,
  RecursiveVisitor,
  Template,
  TextAttribute,
  visitAll,
} from '../../render3/r3_ast';
import {
  isBindingAttributeName,
  isDeclarationAttributeName,
} from '../../render3/r3_template_transform';
import {createCssSelectorFromNode} from '../../render3/view/util';
import {
  NG_CONTENT_SELECT_ATTR,
  NG_NON_BINDABLE_ATTR,
  NG_PROJECT_AS,
} from '../../template_parser/template_preparser';
import {TcbDirectiveMetadata} from '../api';
import {OutOfBandDiagnosticCategory} from '../oob';
import {TcbOp} from './base';
import {createSlotMatcher} from './content_projection';
import type {Context} from './context';

/** An `<ng-container>`, an explicit `<ng-template>`, or an `<ng-content>`. */
export type NonRenderingNode = Element | Template | Content;

/**
 * The attribute that tells hydration to skip a subtree. It's read on every node, containers
 * included, see `isInSkipHydrationBlock` in `@angular/core`.
 */
const SKIP_HYDRATION_ATTR_NAME = 'ngSkipHydration';

const OPT_OUT_HINT =
  'This check can be disabled using the ' +
  '`extendedDiagnostics.checks.ignoredBinding = "suppress"` compiler option.';

/**
 * A `TcbOp` which reports what Angular ignores on an `<ng-container>`, an explicit
 * `<ng-template>`, or an `<ng-content>`: none of them renders an element, so a binding or
 * attribute on them only takes effect if a directive, a content projection slot, or Angular
 * itself uses it.
 *
 * It only reports. Type-checking the expressions of these bindings is left to other ops.
 */
export class TcbIgnoredBindingsOp extends TcbOp {
  private readonly category: OutOfBandDiagnosticCategory;

  constructor(
    private tcb: Context,
    private node: NonRenderingNode,
    private directives: TcbDirectiveMetadata[],
  ) {
    super();
    // `suppress` never creates this op.
    this.category =
      tcb.env.config.ignoredBinding === 'error'
        ? OutOfBandDiagnosticCategory.Error
        : OutOfBandDiagnosticCategory.Warning;
  }

  override readonly optional = false;

  override execute(): null {
    const node = this.node;
    if (node instanceof Content) {
      this.checkContent(node);
      return null;
    }

    const claimedInputs = new Set<string>();
    const claimedOutputs = new Set<string>();
    for (const dir of this.directives) {
      for (const name of dir.inputs.propertyNames) claimedInputs.add(name);
      for (const name of dir.outputs.propertyNames) claimedOutputs.add(name);
    }

    for (const input of node.inputs) {
      if (this.compilesToProperty(input) && claimedInputs.has(input.name)) {
        continue;
      }
      if (this.isIgnoredInput(input)) {
        this.tcb.oobRecorder.ignoredBinding(this.tcb.id, this.category, node, input);
      }
    }

    for (const output of node.outputs) {
      // Global targets such as `(document:keydown)` work on these elements. The `Change` half of
      // an unclaimed `[(x)]` is reported through its property half. `(animate.enter)` and
      // `(animate.leave)` callbacks never run here. Legacy `(@trigger.done)` callbacks are left
      // alone, like legacy `[@trigger]` bindings.
      const isIgnoredEvent =
        output.type === ParsedEventType.Regular || output.type === ParsedEventType.Animation;
      if (!claimedOutputs.has(output.name) && output.target === null && isIgnoredEvent) {
        this.tcb.oobRecorder.ignoredBinding(this.tcb.id, this.category, node, output);
      }
    }

    // A directive can read any static attribute through `HostAttributeToken`, so only nodes
    // without one are checked. Selectorless directives are listed in `node.directives`. The
    // directives of a structural directive's template can read the attributes too, because the
    // compiler copies them to that template.
    if (
      this.directives.length === 0 &&
      node.directives.length === 0 &&
      !this.isProjected() &&
      !this.tcb.nodesWrappedByStructuralDirectives.has(node)
    ) {
      for (const attr of node.attributes) {
        if (!isAttributeReadByAngular(attr.name)) {
          this.tcb.oobRecorder.ignoredBinding(this.tcb.id, this.category, node, attr);
        }
      }
    }

    return null;
  }

  private isProjected(): boolean {
    return this.tcb.nodesInProjectionSlots.has(this.node);
  }

  /**
   * Whether `input` compiles to a property binding, which a directive input of the same name
   * claims. On an explicit `<ng-template>`, class, style, and attribute bindings compile to
   * property bindings too.
   */
  private compilesToProperty(input: BoundAttribute): boolean {
    if (isPropertyBinding(input)) {
      return true;
    }
    return (
      this.node instanceof Template &&
      (input.type === BindingType.Class ||
        input.type === BindingType.Style ||
        input.type === BindingType.Attribute)
    );
  }

  private isIgnoredInput(input: BoundAttribute): boolean {
    const isContainer = this.node instanceof Element;
    switch (input.type) {
      case BindingType.Attribute:
        // `[attr.x]` on `<ng-container>` is already a template parse error.
        return !isContainer;
      case BindingType.Class:
      case BindingType.Style:
      case BindingType.Animation:
        return true;
      case BindingType.LegacyAnimation:
        return false;
    }
    if (isClassOrStyleMapBinding(input)) {
      return true;
    }
    // Unknown properties of `<ng-container>` already get NG8002, unless `NO_ERRORS_SCHEMA`
    // silences it.
    return !isContainer || this.tcb.schemas.some((s) => s.name === NO_ERRORS_SCHEMA.name);
  }

  private checkContent(node: Content): void {
    for (const attr of node.attributes) {
      // `<ng-content>` keeps every attribute as text, including the ones meant as bindings.
      const isBinding = isBindingAttributeName(attr.name);
      if (isBinding || (!this.isProjected() && isIgnoredNgContentAttribute(attr))) {
        this.tcb.oobRecorder.ignoredBinding(this.tcb.id, this.category, node, attr);
      }
    }
  }
}

/** Whether `binding` is a `[x]` or `[(x)]` binding. */
function isPropertyBinding(binding: BoundAttribute): boolean {
  return binding.type === BindingType.Property || binding.type === BindingType.TwoWay;
}

/** Whether `binding` is a `[class]` or `[style]` binding. */
function isClassOrStyleMapBinding(binding: BoundAttribute): boolean {
  return isPropertyBinding(binding) && (binding.name === 'class' || binding.name === 'style');
}

/** Whether Angular itself reads the static attribute `name` on these elements. */
function isAttributeReadByAngular(name: string): boolean {
  return (
    name === NG_NON_BINDABLE_ATTR ||
    name === NG_PROJECT_AS ||
    name === PRESERVE_WS_ATTR_NAME ||
    name === SKIP_HYDRATION_ATTR_NAME
  );
}

function isAttributeReadByNgContent(name: string): boolean {
  // The preparser matches `select` in any case.
  return isAttributeReadByAngular(name) || name.toLowerCase() === NG_CONTENT_SELECT_ATTR;
}

function isIgnoredNgContentAttribute(attr: TextAttribute): boolean {
  // `*x`, `#x`, and `let-x` are handled by the template transform.
  return !isAttributeReadByNgContent(attr.name) && !isDeclarationAttributeName(attr.name);
}

/** Whether `node` is an `<ng-container>`, an explicit `<ng-template>`, or an `<ng-content>`. */
export function isNonRenderingNode(node: Node): node is NonRenderingNode {
  if (node instanceof Element) return isNgContainer(node.name);
  if (node instanceof Template) return isExplicitNgTemplate(node);
  return node instanceof Content;
}

/** Whether `template` was written as `<ng-template>`, rather than created by `*` syntax. */
function isExplicitNgTemplate(template: Template): boolean {
  return template.tagName !== null && isNgTemplate(template.tagName);
}

/**
 * Returns the element that `*` syntax wraps in `template`, or `null`. The compiler copies the
 * static attributes of that element to `template`, where the template's directives can read them.
 */
export function getElementWrappedByTemplate(template: Template): Element | null {
  const [child] = template.children;
  if (isExplicitNgTemplate(template) || template.children.length !== 1) {
    return null;
  }
  return child instanceof Element ? child : null;
}

/**
 * Finds the nodes that a specific content projection slot of a component selects among its
 * content, looking through control flow blocks the way content projection does. Static attributes
 * of those nodes take part in projection, so they take effect. Slots match a node with
 * `ngProjectAs` against that value instead of its attributes, so its own attributes don't select it.
 */
export function getNodesInProjectionSlots(
  children: Node[],
  ngContentSelectors: string[] | null,
): Set<Node> {
  const matcher = createSlotMatcher(ngContentSelectors ?? []);
  const collector = new ProjectionCandidateCollector();
  visitAll(collector, children);

  const result = new Set<Node>();
  for (const candidate of collector.candidates) {
    // A structural wrapper is projected by the tag and attributes of the node it wraps.
    const target =
      candidate instanceof Template &&
      !isExplicitNgTemplate(candidate) &&
      candidate.children.length === 1
        ? candidate.children[0]
        : candidate;
    if (target instanceof Content || ngContentSelectors === null) {
      // An `<ng-content>` can be projected again, and a component whose slots are unknown may
      // select any of its content; keep their attributes conservatively.
      result.add(target);
    } else if (
      (target instanceof Element || target instanceof Template) &&
      !target.attributes.some((attr) => attr.name === NG_PROJECT_AS) &&
      matcher.match(createCssSelectorFromNode(target), null)
    ) {
      result.add(target);
    }
  }
  return result;
}

/** Collects the nodes at the root of a component's content, descending only into blocks. */
class ProjectionCandidateCollector extends RecursiveVisitor {
  readonly candidates: Node[] = [];

  override visitElement(element: Element): void {
    this.candidates.push(element);
  }

  override visitTemplate(template: Template): void {
    this.candidates.push(template);
  }

  override visitContent(content: Content): void {
    this.candidates.push(content);
  }

  override visitComponent(): void {}
}

/** Builds the message of an NG8031 diagnostic, shared by the diagnostic recorders. */
export function getIgnoredBindingMessage(
  node: NonRenderingNode,
  binding: BoundAttribute | BoundEvent | TextAttribute,
): string {
  return `${getProblemDescription(node, binding)}\n\n${OPT_OUT_HINT}`;
}

function getProblemDescription(
  node: NonRenderingNode,
  binding: BoundAttribute | BoundEvent | TextAttribute,
): string {
  const tagName = getNonRenderingTagName(node);
  const reason =
    node instanceof Content
      ? `because Angular replaces <ng-content> with projected content`
      : `because <${tagName}> doesn't render an element`;

  if (binding instanceof TextAttribute) {
    if (isBindingAttributeName(binding.name)) {
      return (
        `The '${binding.name}' binding has no effect on <${tagName}>, ${reason}. ` +
        `Angular never evaluates bindings on <ng-content>.`
      );
    }
    return (
      `The '${binding.name}' attribute has no effect on <${tagName}>, ${reason}, and no ` +
      `directive or content projection slot reads it.`
    );
  }

  const displayName = getBindingDisplayName(binding);
  if (
    binding instanceof BoundAttribute &&
    isPropertyBinding(binding) &&
    !isClassOrStyleMapBinding(binding)
  ) {
    // An unclaimed property usually means that a directive is missing from the imports.
    return (
      `The '${displayName}' binding has no effect on <${tagName}>, ${reason}. ` +
      `If '${binding.name}' is an input of a directive, add the directive to the component's ` +
      `imports.`
    );
  }
  return (
    `The '${displayName}' binding has no effect on <${tagName}>, ${reason}. ` +
    `Move the binding to an element.`
  );
}

/** Builds the message of an NG8032 diagnostic, shared by the diagnostic recorders. */
export function getComponentOnNonRenderingElementMessage(
  node: Element | Template,
  componentName: string,
): string {
  const tagName = getNonRenderingTagName(node);
  return (
    `Component '${componentName}' matches <${tagName}>, but <${tagName}> can't host a ` +
    `component because it doesn't render an element. Use an element that matches the ` +
    `component's selector instead.`
  );
}

function getNonRenderingTagName(node: NonRenderingNode): string {
  if (node instanceof Content) return 'ng-content';
  return node instanceof Element ? 'ng-container' : 'ng-template';
}

function getBindingDisplayName(binding: BoundAttribute | BoundEvent): string {
  if (binding instanceof BoundEvent) {
    return `(${binding.name})`;
  }
  switch (binding.type) {
    case BindingType.Attribute:
      return `[attr.${binding.name}]`;
    case BindingType.Class:
      return `[class.${binding.name}]`;
    case BindingType.Style:
      return `[style.${binding.name}${binding.unit ? '.' + binding.unit : ''}]`;
    case BindingType.TwoWay:
      return `[(${binding.name})]`;
    default:
      return `[${binding.name}]`;
  }
}
