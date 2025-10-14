/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ParsedEventType} from '../expression_parser/ast';
/**
 * This is an R3 `Node`-like wrapper for a raw `html.Comment` node. We do not currently
 * require the implementation of a visitor for Comments as they are only collected at
 * the top-level of the R3 AST, and only if `Render3ParseOptions['collectCommentNodes']`
 * is true.
 */
export class Comment {
  value;
  sourceSpan;
  constructor(value, sourceSpan) {
    this.value = value;
    this.sourceSpan = sourceSpan;
  }
  visit(_visitor) {
    throw new Error('visit() not implemented for Comment');
  }
}
export class Text {
  value;
  sourceSpan;
  constructor(value, sourceSpan) {
    this.value = value;
    this.sourceSpan = sourceSpan;
  }
  visit(visitor) {
    return visitor.visitText(this);
  }
}
export class BoundText {
  value;
  sourceSpan;
  i18n;
  constructor(value, sourceSpan, i18n) {
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitBoundText(this);
  }
}
/**
 * Represents a text attribute in the template.
 *
 * `valueSpan` may not be present in cases where there is no value `<div a></div>`.
 * `keySpan` may also not be present for synthetic attributes from ICU expansions.
 */
export class TextAttribute {
  name;
  value;
  sourceSpan;
  keySpan;
  valueSpan;
  i18n;
  constructor(name, value, sourceSpan, keySpan, valueSpan, i18n) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitTextAttribute(this);
  }
}
export class BoundAttribute {
  name;
  type;
  securityContext;
  value;
  unit;
  sourceSpan;
  keySpan;
  valueSpan;
  i18n;
  constructor(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan, i18n) {
    this.name = name;
    this.type = type;
    this.securityContext = securityContext;
    this.value = value;
    this.unit = unit;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
    this.i18n = i18n;
  }
  static fromBoundElementProperty(prop, i18n) {
    if (prop.keySpan === undefined) {
      throw new Error(
        `Unexpected state: keySpan must be defined for bound attributes but was not for ${prop.name}: ${prop.sourceSpan}`,
      );
    }
    return new BoundAttribute(
      prop.name,
      prop.type,
      prop.securityContext,
      prop.value,
      prop.unit,
      prop.sourceSpan,
      prop.keySpan,
      prop.valueSpan,
      i18n,
    );
  }
  visit(visitor) {
    return visitor.visitBoundAttribute(this);
  }
}
export class BoundEvent {
  name;
  type;
  handler;
  target;
  phase;
  sourceSpan;
  handlerSpan;
  keySpan;
  constructor(name, type, handler, target, phase, sourceSpan, handlerSpan, keySpan) {
    this.name = name;
    this.type = type;
    this.handler = handler;
    this.target = target;
    this.phase = phase;
    this.sourceSpan = sourceSpan;
    this.handlerSpan = handlerSpan;
    this.keySpan = keySpan;
  }
  static fromParsedEvent(event) {
    const target = event.type === ParsedEventType.Regular ? event.targetOrPhase : null;
    const phase = event.type === ParsedEventType.LegacyAnimation ? event.targetOrPhase : null;
    if (event.keySpan === undefined) {
      throw new Error(
        `Unexpected state: keySpan must be defined for bound event but was not for ${event.name}: ${event.sourceSpan}`,
      );
    }
    return new BoundEvent(
      event.name,
      event.type,
      event.handler,
      target,
      phase,
      event.sourceSpan,
      event.handlerSpan,
      event.keySpan,
    );
  }
  visit(visitor) {
    return visitor.visitBoundEvent(this);
  }
}
export class Element {
  name;
  attributes;
  inputs;
  outputs;
  directives;
  children;
  references;
  isSelfClosing;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  isVoid;
  i18n;
  constructor(
    name,
    attributes,
    inputs,
    outputs,
    directives,
    children,
    references,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    isVoid,
    i18n,
  ) {
    this.name = name;
    this.attributes = attributes;
    this.inputs = inputs;
    this.outputs = outputs;
    this.directives = directives;
    this.children = children;
    this.references = references;
    this.isSelfClosing = isSelfClosing;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.isVoid = isVoid;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitElement(this);
  }
}
export class DeferredTrigger {
  nameSpan;
  sourceSpan;
  prefetchSpan;
  whenOrOnSourceSpan;
  hydrateSpan;
  constructor(nameSpan, sourceSpan, prefetchSpan, whenOrOnSourceSpan, hydrateSpan) {
    this.nameSpan = nameSpan;
    this.sourceSpan = sourceSpan;
    this.prefetchSpan = prefetchSpan;
    this.whenOrOnSourceSpan = whenOrOnSourceSpan;
    this.hydrateSpan = hydrateSpan;
  }
  visit(visitor) {
    return visitor.visitDeferredTrigger(this);
  }
}
export class BoundDeferredTrigger extends DeferredTrigger {
  value;
  constructor(value, sourceSpan, prefetchSpan, whenSourceSpan, hydrateSpan) {
    // BoundDeferredTrigger is for 'when' triggers. These aren't really "triggers" and don't have a
    // nameSpan. Trigger names are the built in event triggers like hover, interaction, etc.
    super(/** nameSpan */ null, sourceSpan, prefetchSpan, whenSourceSpan, hydrateSpan);
    this.value = value;
  }
}
export class NeverDeferredTrigger extends DeferredTrigger {}
export class IdleDeferredTrigger extends DeferredTrigger {}
export class ImmediateDeferredTrigger extends DeferredTrigger {}
export class HoverDeferredTrigger extends DeferredTrigger {
  reference;
  constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
    this.reference = reference;
  }
}
export class TimerDeferredTrigger extends DeferredTrigger {
  delay;
  constructor(delay, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
    this.delay = delay;
  }
}
export class InteractionDeferredTrigger extends DeferredTrigger {
  reference;
  constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
    this.reference = reference;
  }
}
export class ViewportDeferredTrigger extends DeferredTrigger {
  reference;
  constructor(reference, nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan) {
    super(nameSpan, sourceSpan, prefetchSpan, onSourceSpan, hydrateSpan);
    this.reference = reference;
  }
}
export class BlockNode {
  nameSpan;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  constructor(nameSpan, sourceSpan, startSourceSpan, endSourceSpan) {
    this.nameSpan = nameSpan;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
  }
}
export class DeferredBlockPlaceholder extends BlockNode {
  children;
  minimumTime;
  i18n;
  constructor(children, minimumTime, nameSpan, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.children = children;
    this.minimumTime = minimumTime;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitDeferredBlockPlaceholder(this);
  }
}
export class DeferredBlockLoading extends BlockNode {
  children;
  afterTime;
  minimumTime;
  i18n;
  constructor(
    children,
    afterTime,
    minimumTime,
    nameSpan,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.children = children;
    this.afterTime = afterTime;
    this.minimumTime = minimumTime;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitDeferredBlockLoading(this);
  }
}
export class DeferredBlockError extends BlockNode {
  children;
  i18n;
  constructor(children, nameSpan, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.children = children;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitDeferredBlockError(this);
  }
}
export class DeferredBlock extends BlockNode {
  children;
  placeholder;
  loading;
  error;
  mainBlockSpan;
  i18n;
  triggers;
  prefetchTriggers;
  hydrateTriggers;
  definedTriggers;
  definedPrefetchTriggers;
  definedHydrateTriggers;
  constructor(
    children,
    triggers,
    prefetchTriggers,
    hydrateTriggers,
    placeholder,
    loading,
    error,
    nameSpan,
    sourceSpan,
    mainBlockSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.children = children;
    this.placeholder = placeholder;
    this.loading = loading;
    this.error = error;
    this.mainBlockSpan = mainBlockSpan;
    this.i18n = i18n;
    this.triggers = triggers;
    this.prefetchTriggers = prefetchTriggers;
    this.hydrateTriggers = hydrateTriggers;
    // We cache the keys since we know that they won't change and we
    // don't want to enumarate them every time we're traversing the AST.
    this.definedTriggers = Object.keys(triggers);
    this.definedPrefetchTriggers = Object.keys(prefetchTriggers);
    this.definedHydrateTriggers = Object.keys(hydrateTriggers);
  }
  visit(visitor) {
    return visitor.visitDeferredBlock(this);
  }
  visitAll(visitor) {
    // Visit the hydrate triggers first to match their insertion order.
    this.visitTriggers(this.definedHydrateTriggers, this.hydrateTriggers, visitor);
    this.visitTriggers(this.definedTriggers, this.triggers, visitor);
    this.visitTriggers(this.definedPrefetchTriggers, this.prefetchTriggers, visitor);
    visitAll(visitor, this.children);
    const remainingBlocks = [this.placeholder, this.loading, this.error].filter((x) => x !== null);
    visitAll(visitor, remainingBlocks);
  }
  visitTriggers(keys, triggers, visitor) {
    visitAll(
      visitor,
      keys.map((k) => triggers[k]),
    );
  }
}
export class SwitchBlock extends BlockNode {
  expression;
  cases;
  unknownBlocks;
  constructor(
    expression,
    cases,
    /**
     * These blocks are only captured to allow for autocompletion in the language service. They
     * aren't meant to be processed in any other way.
     */
    unknownBlocks,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    nameSpan,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.expression = expression;
    this.cases = cases;
    this.unknownBlocks = unknownBlocks;
  }
  visit(visitor) {
    return visitor.visitSwitchBlock(this);
  }
}
export class SwitchBlockCase extends BlockNode {
  expression;
  children;
  i18n;
  constructor(expression, children, sourceSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.expression = expression;
    this.children = children;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitSwitchBlockCase(this);
  }
}
export class ForLoopBlock extends BlockNode {
  item;
  expression;
  trackBy;
  trackKeywordSpan;
  contextVariables;
  children;
  empty;
  mainBlockSpan;
  i18n;
  constructor(
    item,
    expression,
    trackBy,
    trackKeywordSpan,
    contextVariables,
    children,
    empty,
    sourceSpan,
    mainBlockSpan,
    startSourceSpan,
    endSourceSpan,
    nameSpan,
    i18n,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.item = item;
    this.expression = expression;
    this.trackBy = trackBy;
    this.trackKeywordSpan = trackKeywordSpan;
    this.contextVariables = contextVariables;
    this.children = children;
    this.empty = empty;
    this.mainBlockSpan = mainBlockSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitForLoopBlock(this);
  }
}
export class ForLoopBlockEmpty extends BlockNode {
  children;
  i18n;
  constructor(children, sourceSpan, startSourceSpan, endSourceSpan, nameSpan, i18n) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.children = children;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitForLoopBlockEmpty(this);
  }
}
export class IfBlock extends BlockNode {
  branches;
  constructor(branches, sourceSpan, startSourceSpan, endSourceSpan, nameSpan) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.branches = branches;
  }
  visit(visitor) {
    return visitor.visitIfBlock(this);
  }
}
export class IfBlockBranch extends BlockNode {
  expression;
  children;
  expressionAlias;
  i18n;
  constructor(
    expression,
    children,
    expressionAlias,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    nameSpan,
    i18n,
  ) {
    super(nameSpan, sourceSpan, startSourceSpan, endSourceSpan);
    this.expression = expression;
    this.children = children;
    this.expressionAlias = expressionAlias;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitIfBlockBranch(this);
  }
}
export class UnknownBlock {
  name;
  sourceSpan;
  nameSpan;
  constructor(name, sourceSpan, nameSpan) {
    this.name = name;
    this.sourceSpan = sourceSpan;
    this.nameSpan = nameSpan;
  }
  visit(visitor) {
    return visitor.visitUnknownBlock(this);
  }
}
export class LetDeclaration {
  name;
  value;
  sourceSpan;
  nameSpan;
  valueSpan;
  constructor(name, value, sourceSpan, nameSpan, valueSpan) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.nameSpan = nameSpan;
    this.valueSpan = valueSpan;
  }
  visit(visitor) {
    return visitor.visitLetDeclaration(this);
  }
}
export class Component {
  componentName;
  tagName;
  fullName;
  attributes;
  inputs;
  outputs;
  directives;
  children;
  references;
  isSelfClosing;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  i18n;
  constructor(
    componentName,
    tagName,
    fullName,
    attributes,
    inputs,
    outputs,
    directives,
    children,
    references,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    this.componentName = componentName;
    this.tagName = tagName;
    this.fullName = fullName;
    this.attributes = attributes;
    this.inputs = inputs;
    this.outputs = outputs;
    this.directives = directives;
    this.children = children;
    this.references = references;
    this.isSelfClosing = isSelfClosing;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitComponent(this);
  }
}
export class Directive {
  name;
  attributes;
  inputs;
  outputs;
  references;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  i18n;
  constructor(
    name,
    attributes,
    inputs,
    outputs,
    references,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    this.name = name;
    this.attributes = attributes;
    this.inputs = inputs;
    this.outputs = outputs;
    this.references = references;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitDirective(this);
  }
}
export class Template {
  tagName;
  attributes;
  inputs;
  outputs;
  directives;
  templateAttrs;
  children;
  references;
  variables;
  isSelfClosing;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  i18n;
  constructor(
    // tagName is the name of the container element, if applicable.
    // `null` is a special case for when there is a structural directive on an `ng-template` so
    // the renderer can differentiate between the synthetic template and the one written in the
    // file.
    tagName,
    attributes,
    inputs,
    outputs,
    directives,
    templateAttrs,
    children,
    references,
    variables,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    this.tagName = tagName;
    this.attributes = attributes;
    this.inputs = inputs;
    this.outputs = outputs;
    this.directives = directives;
    this.templateAttrs = templateAttrs;
    this.children = children;
    this.references = references;
    this.variables = variables;
    this.isSelfClosing = isSelfClosing;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitTemplate(this);
  }
}
export class Content {
  selector;
  attributes;
  children;
  isSelfClosing;
  sourceSpan;
  startSourceSpan;
  endSourceSpan;
  i18n;
  name = 'ng-content';
  constructor(
    selector,
    attributes,
    children,
    isSelfClosing,
    sourceSpan,
    startSourceSpan,
    endSourceSpan,
    i18n,
  ) {
    this.selector = selector;
    this.attributes = attributes;
    this.children = children;
    this.isSelfClosing = isSelfClosing;
    this.sourceSpan = sourceSpan;
    this.startSourceSpan = startSourceSpan;
    this.endSourceSpan = endSourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitContent(this);
  }
}
export class Variable {
  name;
  value;
  sourceSpan;
  keySpan;
  valueSpan;
  constructor(name, value, sourceSpan, keySpan, valueSpan) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
  }
  visit(visitor) {
    return visitor.visitVariable(this);
  }
}
export class Reference {
  name;
  value;
  sourceSpan;
  keySpan;
  valueSpan;
  constructor(name, value, sourceSpan, keySpan, valueSpan) {
    this.name = name;
    this.value = value;
    this.sourceSpan = sourceSpan;
    this.keySpan = keySpan;
    this.valueSpan = valueSpan;
  }
  visit(visitor) {
    return visitor.visitReference(this);
  }
}
export class Icu {
  vars;
  placeholders;
  sourceSpan;
  i18n;
  constructor(vars, placeholders, sourceSpan, i18n) {
    this.vars = vars;
    this.placeholders = placeholders;
    this.sourceSpan = sourceSpan;
    this.i18n = i18n;
  }
  visit(visitor) {
    return visitor.visitIcu(this);
  }
}
/**
 * AST node that represents the host element of a directive.
 * This node is used only for type checking purposes and cannot be produced from a user's template.
 */
export class HostElement {
  tagNames;
  bindings;
  listeners;
  sourceSpan;
  constructor(tagNames, bindings, listeners, sourceSpan) {
    this.tagNames = tagNames;
    this.bindings = bindings;
    this.listeners = listeners;
    this.sourceSpan = sourceSpan;
    if (tagNames.length === 0) {
      throw new Error('HostElement must have at least one tag name.');
    }
  }
  visit() {
    throw new Error(`HostElement cannot be visited`);
  }
}
export class RecursiveVisitor {
  visitElement(element) {
    visitAll(this, element.attributes);
    visitAll(this, element.inputs);
    visitAll(this, element.outputs);
    visitAll(this, element.directives);
    visitAll(this, element.children);
    visitAll(this, element.references);
  }
  visitTemplate(template) {
    visitAll(this, template.attributes);
    visitAll(this, template.inputs);
    visitAll(this, template.outputs);
    visitAll(this, template.directives);
    visitAll(this, template.children);
    visitAll(this, template.references);
    visitAll(this, template.variables);
  }
  visitDeferredBlock(deferred) {
    deferred.visitAll(this);
  }
  visitDeferredBlockPlaceholder(block) {
    visitAll(this, block.children);
  }
  visitDeferredBlockError(block) {
    visitAll(this, block.children);
  }
  visitDeferredBlockLoading(block) {
    visitAll(this, block.children);
  }
  visitSwitchBlock(block) {
    visitAll(this, block.cases);
  }
  visitSwitchBlockCase(block) {
    visitAll(this, block.children);
  }
  visitForLoopBlock(block) {
    const blockItems = [block.item, ...block.contextVariables, ...block.children];
    block.empty && blockItems.push(block.empty);
    visitAll(this, blockItems);
  }
  visitForLoopBlockEmpty(block) {
    visitAll(this, block.children);
  }
  visitIfBlock(block) {
    visitAll(this, block.branches);
  }
  visitIfBlockBranch(block) {
    const blockItems = block.children;
    block.expressionAlias && blockItems.push(block.expressionAlias);
    visitAll(this, blockItems);
  }
  visitContent(content) {
    visitAll(this, content.children);
  }
  visitComponent(component) {
    visitAll(this, component.attributes);
    visitAll(this, component.inputs);
    visitAll(this, component.outputs);
    visitAll(this, component.directives);
    visitAll(this, component.children);
    visitAll(this, component.references);
  }
  visitDirective(directive) {
    visitAll(this, directive.attributes);
    visitAll(this, directive.inputs);
    visitAll(this, directive.outputs);
    visitAll(this, directive.references);
  }
  visitVariable(variable) {}
  visitReference(reference) {}
  visitTextAttribute(attribute) {}
  visitBoundAttribute(attribute) {}
  visitBoundEvent(attribute) {}
  visitText(text) {}
  visitBoundText(text) {}
  visitIcu(icu) {}
  visitDeferredTrigger(trigger) {}
  visitUnknownBlock(block) {}
  visitLetDeclaration(decl) {}
}
export function visitAll(visitor, nodes) {
  const result = [];
  if (visitor.visit) {
    for (const node of nodes) {
      visitor.visit(node);
    }
  } else {
    for (const node of nodes) {
      const newNode = node.visit(visitor);
      if (newNode) {
        result.push(newNode);
      }
    }
  }
  return result;
}
//# sourceMappingURL=r3_ast.js.map
