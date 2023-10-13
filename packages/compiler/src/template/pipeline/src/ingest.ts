/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../../constant_pool';
import {SecurityContext} from '../../../core';
import * as e from '../../../expression_parser/ast';
import * as i18n from '../../../i18n/i18n_ast';
import {splitNsName} from '../../../ml_parser/tags';
import * as o from '../../../output/output_ast';
import {ParseSourceSpan} from '../../../parse_util';
import * as t from '../../../render3/r3_ast';
import {BindingParser} from '../../../template_parser/binding_parser';
import * as ir from '../ir';

import {ComponentCompilationJob, HostBindingCompilationJob, type CompilationJob, type ViewCompilationUnit} from './compilation';
import {BINARY_OPERATORS, namespaceForKey} from './conversion';

const compatibilityMode = ir.CompatibilityMode.TemplateDefinitionBuilder;

/**
 * Process a template AST and convert it into a `ComponentCompilation` in the intermediate
 * representation.
 * TODO: Refactor more of the ingestion code into phases.
 */
export function ingestComponent(
    componentName: string, template: t.Node[], constantPool: ConstantPool,
    relativeContextFilePath: string, i18nUseExternalIds: boolean): ComponentCompilationJob {
  const cpl = new ComponentCompilationJob(
      componentName, constantPool, compatibilityMode, relativeContextFilePath, i18nUseExternalIds);
  ingestNodes(cpl.root, template);
  return cpl;
}

export interface HostBindingInput {
  componentName: string;
  properties: e.ParsedProperty[]|null;
  attributes: {[key: string]: o.Expression};
  events: e.ParsedEvent[]|null;
}

/**
 * Process a host binding AST and convert it into a `HostBindingCompilationJob` in the intermediate
 * representation.
 */
export function ingestHostBinding(
    input: HostBindingInput, bindingParser: BindingParser,
    constantPool: ConstantPool): HostBindingCompilationJob {
  const job = new HostBindingCompilationJob(input.componentName, constantPool, compatibilityMode);
  for (const property of input.properties ?? []) {
    ingestHostProperty(job, property, false);
  }
  for (const [name, expr] of Object.entries(input.attributes) ?? []) {
    ingestHostAttribute(job, name, expr);
  }
  for (const event of input.events ?? []) {
    ingestHostEvent(job, event);
  }
  return job;
}

// TODO: We should refactor the parser to use the same types and structures for host bindings as
// with ordinary components. This would allow us to share a lot more ingestion code.
export function ingestHostProperty(
    job: HostBindingCompilationJob, property: e.ParsedProperty, isTextAttribute: boolean): void {
  let expression: o.Expression|ir.Interpolation;
  const ast = property.expression.ast;
  if (ast instanceof e.Interpolation) {
    expression = new ir.Interpolation(
        ast.strings, ast.expressions.map(expr => convertAst(expr, job, property.sourceSpan)));
  } else {
    expression = convertAst(ast, job, property.sourceSpan);
  }
  let bindingKind = ir.BindingKind.Property;
  // TODO: this should really be handled in the parser.
  if (property.name.startsWith('attr.')) {
    property.name = property.name.substring('attr.'.length);
    bindingKind = ir.BindingKind.Attribute;
  }
  if (property.isAnimation) {
    bindingKind = ir.BindingKind.Animation;
  }
  job.root.update.push(ir.createBindingOp(
      job.root.xref, bindingKind, property.name, expression, null,
      SecurityContext
          .NONE /* TODO: what should we pass as security context? Passing NONE for now. */,
      isTextAttribute, false, property.sourceSpan));
}

export function ingestHostAttribute(
    job: HostBindingCompilationJob, name: string, value: o.Expression): void {
  const attrBinding = ir.createBindingOp(
      job.root.xref, ir.BindingKind.Attribute, name, value, null, SecurityContext.NONE, true, false,
      /* TODO: host attribute source spans */ null!);
  job.root.update.push(attrBinding);
}

export function ingestHostEvent(job: HostBindingCompilationJob, event: e.ParsedEvent) {
  const eventBinding = ir.createListenerOp(
      job.root.xref, event.name, null, event.targetOrPhase, true, event.sourceSpan);
  // TODO: Can this be a chain?
  eventBinding.handlerOps.push(ir.createStatementOp(new o.ReturnStatement(
      convertAst(event.handler.ast, job, event.sourceSpan), event.handlerSpan)));
  job.root.create.push(eventBinding);
}

/**
 * Ingest the nodes of a template AST into the given `ViewCompilation`.
 */
function ingestNodes(unit: ViewCompilationUnit, template: t.Node[]): void {
  for (const node of template) {
    if (node instanceof t.Element) {
      ingestElement(unit, node);
    } else if (node instanceof t.Template) {
      ingestTemplate(unit, node);
    } else if (node instanceof t.Content) {
      ingestContent(unit, node);
    } else if (node instanceof t.Text) {
      ingestText(unit, node);
    } else if (node instanceof t.BoundText) {
      ingestBoundText(unit, node);
    } else if (node instanceof t.IfBlock) {
      ingestIfBlock(unit, node);
    } else if (node instanceof t.SwitchBlock) {
      ingestSwitchBlock(unit, node);
    } else if (node instanceof t.DeferredBlock) {
      ingestDeferBlock(unit, node);
    } else {
      throw new Error(`Unsupported template node: ${node.constructor.name}`);
    }
  }
}

/**
 * Ingest an element AST from the template into the given `ViewCompilation`.
 */
function ingestElement(unit: ViewCompilationUnit, element: t.Element): void {
  if (element.i18n !== undefined &&
      !(element.i18n instanceof i18n.Message || element.i18n instanceof i18n.TagPlaceholder)) {
    throw Error(`Unhandled i18n metadata type for element: ${element.i18n.constructor.name}`);
  }

  const staticAttributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    staticAttributes[attr.name] = attr.value;
  }
  const id = unit.job.allocateXrefId();

  const [namespaceKey, elementName] = splitNsName(element.name);

  const startOp = ir.createElementStartOp(
      elementName, id, namespaceForKey(namespaceKey),
      element.i18n instanceof i18n.TagPlaceholder ? element.i18n : undefined,
      element.startSourceSpan);
  unit.create.push(startOp);

  ingestBindings(unit, startOp, element);
  ingestReferences(startOp, element);
  ingestNodes(unit, element.children);

  const endOp = ir.createElementEndOp(id, element.endSourceSpan);
  unit.create.push(endOp);

  // If there is an i18n message associated with this element, insert i18n start and end ops.
  if (element.i18n instanceof i18n.Message) {
    const i18nBlockId = unit.job.allocateXrefId();
    ir.OpList.insertAfter<ir.CreateOp>(ir.createI18nStartOp(i18nBlockId, element.i18n), startOp);
    ir.OpList.insertBefore<ir.CreateOp>(ir.createI18nEndOp(i18nBlockId), endOp);
  }
}

/**
 * Ingest an `ng-template` node from the AST into the given `ViewCompilation`.
 */
function ingestTemplate(unit: ViewCompilationUnit, tmpl: t.Template): void {
  if (tmpl.i18n !== undefined &&
      !(tmpl.i18n instanceof i18n.Message || tmpl.i18n instanceof i18n.TagPlaceholder)) {
    throw Error(`Unhandled i18n metadata type for template: ${tmpl.i18n.constructor.name}`);
  }

  const childView = unit.job.allocateView(unit.xref);

  let tagNameWithoutNamespace = tmpl.tagName;
  let namespacePrefix: string|null = '';
  if (tmpl.tagName) {
    [namespacePrefix, tagNameWithoutNamespace] = splitNsName(tmpl.tagName);
  }

  const i18nPlaceholder = tmpl.i18n instanceof i18n.TagPlaceholder ? tmpl.i18n : undefined;
  const tplOp = ir.createTemplateOp(
      childView.xref, tagNameWithoutNamespace, namespaceForKey(namespacePrefix), false,
      i18nPlaceholder, tmpl.startSourceSpan);
  unit.create.push(tplOp);

  ingestBindings(unit, tplOp, tmpl);
  ingestReferences(tplOp, tmpl);
  ingestNodes(childView, tmpl.children);

  for (const {name, value} of tmpl.variables) {
    childView.contextVariables.set(name, value);
  }

  // If this is a plain template and there is an i18n message associated with it, insert i18n start
  // and end ops. For structural directive templates, the i18n ops will be added when ingesting the
  // element/template the directive is placed on.
  if (isPlainTemplate(tmpl) && tmpl.i18n instanceof i18n.Message) {
    const id = unit.job.allocateXrefId();
    ir.OpList.insertAfter(ir.createI18nStartOp(id, tmpl.i18n), childView.create.head);
    ir.OpList.insertBefore(ir.createI18nEndOp(id), childView.create.tail);
  }
}

/**
 * Ingest a literal text node from the AST into the given `ViewCompilation`.
 */
function ingestContent(unit: ViewCompilationUnit, content: t.Content): void {
  const op = ir.createProjectionOp(unit.job.allocateXrefId(), content.selector);
  for (const attr of content.attributes) {
    ingestBinding(
        unit, op.xref, attr.name, o.literal(attr.value), e.BindingType.Attribute, null,
        SecurityContext.NONE, attr.sourceSpan, BindingFlags.TextValue);
  }
  unit.create.push(op);
}

/**
 * Ingest a literal text node from the AST into the given `ViewCompilation`.
 */
function ingestText(unit: ViewCompilationUnit, text: t.Text): void {
  unit.create.push(ir.createTextOp(unit.job.allocateXrefId(), text.value, text.sourceSpan));
}

/**
 * Ingest an interpolated text node from the AST into the given `ViewCompilation`.
 */
function ingestBoundText(unit: ViewCompilationUnit, text: t.BoundText): void {
  let value = text.value;
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }
  if (!(value instanceof e.Interpolation)) {
    throw new Error(
        `AssertionError: expected Interpolation for BoundText node, got ${value.constructor.name}`);
  }
  if (text.i18n !== undefined && !(text.i18n instanceof i18n.Container)) {
    throw Error(
        `Unhandled i18n metadata type for text interpolation: ${text.i18n?.constructor.name}`);
  }

  const i18nPlaceholders = text.i18n instanceof i18n.Container ?
      text.i18n.children.filter(
          (node): node is i18n.Placeholder => node instanceof i18n.Placeholder) :
      [];

  const textXref = unit.job.allocateXrefId();
  unit.create.push(ir.createTextOp(textXref, '', text.sourceSpan));
  // TemplateDefinitionBuilder does not generate source maps for sub-expressions inside an
  // interpolation. We copy that behavior in compatibility mode.
  // TODO: is it actually correct to generate these extra maps in modern mode?
  const baseSourceSpan = unit.job.compatibility ? null : text.sourceSpan;
  unit.update.push(ir.createInterpolateTextOp(
      textXref,
      new ir.Interpolation(
          value.strings, value.expressions.map(expr => convertAst(expr, unit.job, baseSourceSpan))),
      i18nPlaceholders, text.sourceSpan));
}

/**
 * Ingest an `@if` block into the given `ViewCompilation`.
 */
function ingestIfBlock(unit: ViewCompilationUnit, ifBlock: t.IfBlock): void {
  let firstXref: ir.XrefId|null = null;
  let conditions: Array<ir.ConditionalCaseExpr> = [];
  for (const ifCase of ifBlock.branches) {
    const cView = unit.job.allocateView(unit.xref);
    if (ifCase.expressionAlias !== null) {
      cView.contextVariables.set(ifCase.expressionAlias.name, ir.CTX_REF);
    }
    if (firstXref === null) {
      firstXref = cView.xref;
    }
    unit.create.push(ir.createTemplateOp(
        cView.xref, 'Conditional', ir.Namespace.HTML, true,
        undefined /* TODO: figure out how i18n works with new control flow */, ifCase.sourceSpan));
    const caseExpr = ifCase.expression ? convertAst(ifCase.expression, unit.job, null) : null;
    const conditionalCaseExpr =
        new ir.ConditionalCaseExpr(caseExpr, cView.xref, ifCase.expressionAlias);
    conditions.push(conditionalCaseExpr);
    ingestNodes(cView, ifCase.children);
  }
  const conditional = ir.createConditionalOp(firstXref!, null, conditions, ifBlock.sourceSpan);
  unit.update.push(conditional);
}

/**
 * Ingest an `@switch` block into the given `ViewCompilation`.
 */
function ingestSwitchBlock(unit: ViewCompilationUnit, switchBlock: t.SwitchBlock): void {
  let firstXref: ir.XrefId|null = null;
  let conditions: Array<ir.ConditionalCaseExpr> = [];
  for (const switchCase of switchBlock.cases) {
    const cView = unit.job.allocateView(unit.xref);
    if (firstXref === null) {
      firstXref = cView.xref;
    }
    unit.create.push(ir.createTemplateOp(
        cView.xref, 'Case', ir.Namespace.HTML, true,
        undefined /* TODO: figure out how i18n works with new control flow */,
        switchCase.sourceSpan));
    const caseExpr = switchCase.expression ?
        convertAst(switchCase.expression, unit.job, switchBlock.startSourceSpan) :
        null;
    const conditionalCaseExpr = new ir.ConditionalCaseExpr(caseExpr, cView.xref);
    conditions.push(conditionalCaseExpr);
    ingestNodes(cView, switchCase.children);
  }
  const conditional = ir.createConditionalOp(
      firstXref!, convertAst(switchBlock.expression, unit.job, null), conditions,
      switchBlock.sourceSpan);
  unit.update.push(conditional);
}

function ingestDeferView(
    unit: ViewCompilationUnit, suffix: string, children?: t.Node[],
    sourceSpan?: ParseSourceSpan): ir.TemplateOp|null {
  if (children === undefined) {
    return null;
  }
  const secondaryView = unit.job.allocateView(unit.xref);
  ingestNodes(secondaryView, children);
  const templateOp = ir.createTemplateOp(
      secondaryView.xref, `Defer${suffix}`, ir.Namespace.HTML, true, undefined, sourceSpan!);
  unit.create.push(templateOp);
  return templateOp;
}

function ingestDeferBlock(unit: ViewCompilationUnit, deferBlock: t.DeferredBlock): void {
  // Generate the defer main view and all secondary views.
  const main = ingestDeferView(unit, '', deferBlock.children, deferBlock.sourceSpan)!;
  const loading = ingestDeferView(
      unit, 'Loading', deferBlock.loading?.children, deferBlock.loading?.sourceSpan);
  const placeholder = ingestDeferView(
      unit, 'Placeholder', deferBlock.placeholder?.children, deferBlock.placeholder?.sourceSpan);
  const error =
      ingestDeferView(unit, 'Error', deferBlock.error?.children, deferBlock.error?.sourceSpan);

  // Create the main defer op, and ops for all secondary views.
  const deferOp = ir.createDeferOp(unit.job.allocateXrefId(), main.xref, deferBlock.sourceSpan);
  unit.create.push(deferOp);

  if (loading && deferBlock.loading) {
    deferOp.loading =
        ir.createDeferSecondaryOp(deferOp.xref, loading.xref, ir.DeferSecondaryKind.Loading);
    if (deferBlock.loading.afterTime !== null || deferBlock.loading.minimumTime !== null) {
      deferOp.loading.constValue = [deferBlock.loading.minimumTime, deferBlock.loading.afterTime];
    }
    unit.create.push(deferOp.loading);
  }

  if (placeholder && deferBlock.placeholder) {
    deferOp.placeholder = ir.createDeferSecondaryOp(
        deferOp.xref, placeholder.xref, ir.DeferSecondaryKind.Placeholder);
    if (deferBlock.placeholder.minimumTime !== null) {
      deferOp.placeholder.constValue = [deferBlock.placeholder.minimumTime];
    }
    unit.create.push(deferOp.placeholder);
  }

  if (error && deferBlock.error) {
    deferOp.error =
        ir.createDeferSecondaryOp(deferOp.xref, error.xref, ir.DeferSecondaryKind.Error);
    unit.create.push(deferOp.error);
  }

  // Configure all defer conditions.
  const deferOnOp = ir.createDeferOnOp(unit.job.allocateXrefId(), null!);

  // Add all ops to the view.
  unit.create.push(deferOnOp);
}

/**
 * Convert a template AST expression into an output AST expression.
 */
function convertAst(
    ast: e.AST, job: CompilationJob, baseSourceSpan: ParseSourceSpan|null): o.Expression {
  if (ast instanceof e.ASTWithSource) {
    return convertAst(ast.ast, job, baseSourceSpan);
  } else if (ast instanceof e.PropertyRead) {
    if (ast.receiver instanceof e.ImplicitReceiver && !(ast.receiver instanceof e.ThisReceiver)) {
      return new ir.LexicalReadExpr(ast.name);
    } else {
      return new o.ReadPropExpr(
          convertAst(ast.receiver, job, baseSourceSpan), ast.name, null,
          convertSourceSpan(ast.span, baseSourceSpan));
    }
  } else if (ast instanceof e.PropertyWrite) {
    return new o.WritePropExpr(
        convertAst(ast.receiver, job, baseSourceSpan), ast.name,
        convertAst(ast.value, job, baseSourceSpan), undefined,
        convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.KeyedWrite) {
    return new o.WriteKeyExpr(
        convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan),
        convertAst(ast.value, job, baseSourceSpan), undefined,
        convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.Call) {
    if (ast.receiver instanceof e.ImplicitReceiver) {
      throw new Error(`Unexpected ImplicitReceiver`);
    } else {
      return new o.InvokeFunctionExpr(
          convertAst(ast.receiver, job, baseSourceSpan),
          ast.args.map(arg => convertAst(arg, job, baseSourceSpan)), undefined,
          convertSourceSpan(ast.span, baseSourceSpan));
    }
  } else if (ast instanceof e.LiteralPrimitive) {
    return o.literal(ast.value, undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.Binary) {
    const operator = BINARY_OPERATORS.get(ast.operation);
    if (operator === undefined) {
      throw new Error(`AssertionError: unknown binary operator ${ast.operation}`);
    }
    return new o.BinaryOperatorExpr(
        operator, convertAst(ast.left, job, baseSourceSpan),
        convertAst(ast.right, job, baseSourceSpan), undefined,
        convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.ThisReceiver) {
    // TODO: should context expressions have source maps?
    return new ir.ContextExpr(job.root.xref);
  } else if (ast instanceof e.KeyedRead) {
    return new o.ReadKeyExpr(
        convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan),
        undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.Chain) {
    throw new Error(`AssertionError: Chain in unknown context`);
  } else if (ast instanceof e.LiteralMap) {
    const entries = ast.keys.map((key, idx) => {
      const value = ast.values[idx];
      // TODO: should literals have source maps, or do we just map the whole surrounding expression?
      return new o.LiteralMapEntry(key.key, convertAst(value, job, baseSourceSpan), key.quoted);
    });
    return new o.LiteralMapExpr(entries, undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.LiteralArray) {
    // TODO: should literals have source maps, or do we just map the whole surrounding expression?
    return new o.LiteralArrayExpr(
        ast.expressions.map(expr => convertAst(expr, job, baseSourceSpan)));
  } else if (ast instanceof e.Conditional) {
    return new o.ConditionalExpr(
        convertAst(ast.condition, job, baseSourceSpan),
        convertAst(ast.trueExp, job, baseSourceSpan), convertAst(ast.falseExp, job, baseSourceSpan),
        undefined, convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.NonNullAssert) {
    // A non-null assertion shouldn't impact generated instructions, so we can just drop it.
    return convertAst(ast.expression, job, baseSourceSpan);
  } else if (ast instanceof e.BindingPipe) {
    // TODO: pipes should probably have source maps; figure out details.
    return new ir.PipeBindingExpr(
        job.allocateXrefId(),
        ast.name,
        [
          convertAst(ast.exp, job, baseSourceSpan),
          ...ast.args.map(arg => convertAst(arg, job, baseSourceSpan)),
        ],
    );
  } else if (ast instanceof e.SafeKeyedRead) {
    return new ir.SafeKeyedReadExpr(
        convertAst(ast.receiver, job, baseSourceSpan), convertAst(ast.key, job, baseSourceSpan),
        convertSourceSpan(ast.span, baseSourceSpan));
  } else if (ast instanceof e.SafePropertyRead) {
    // TODO: source span
    return new ir.SafePropertyReadExpr(convertAst(ast.receiver, job, baseSourceSpan), ast.name);
  } else if (ast instanceof e.SafeCall) {
    // TODO: source span
    return new ir.SafeInvokeFunctionExpr(
        convertAst(ast.receiver, job, baseSourceSpan),
        ast.args.map(a => convertAst(a, job, baseSourceSpan)));
  } else if (ast instanceof e.EmptyExpr) {
    return new ir.EmptyExpr(convertSourceSpan(ast.span, baseSourceSpan));
  } else {
    throw new Error(`Unhandled expression type: ${ast.constructor.name}`);
  }
}

/**
 * Checks whether the given template is a plain ng-template (as opposed to another kind of template
 * such as a structural directive template or control flow template). This is checked based on the
 * tagName. We can expect that only plain ng-templates will come through with a tagName of
 * 'ng-template'.
 *
 * Here are some of the cases we expect:
 *
 * | Angular HTML                       | Template tagName   |
 * | ---------------------------------- | ------------------ |
 * | `<ng-template>`                    | 'ng-template'      |
 * | `<div *ngIf="true">`               | 'div'              |
 * | `<svg><ng-template>`               | 'svg:ng-template'  |
 * | `@if (true) {`                     | 'Conditional'      |
 * | `<ng-template *ngIf>` (plain)      | 'ng-template'      |
 * | `<ng-template *ngIf>` (structural) | null               |
 */
function isPlainTemplate(tmpl: t.Template) {
  return splitNsName(tmpl.tagName ?? '')[1] === 'ng-template';
}

/**
 * Process all of the bindings on an element-like structure in the template AST and convert them
 * to their IR representation.
 */
function ingestBindings(
    unit: ViewCompilationUnit, op: ir.ElementOpBase, element: t.Element|t.Template): void {
  let flags: BindingFlags = BindingFlags.None;
  if (element instanceof t.Template) {
    flags |= BindingFlags.OnNgTemplateElement;
    if (element instanceof t.Template && isPlainTemplate(element)) {
      flags |= BindingFlags.BindingTargetsTemplate;
    }

    const templateAttrFlags =
        flags | BindingFlags.BindingTargetsTemplate | BindingFlags.IsStructuralTemplateAttribute;
    for (const attr of element.templateAttrs) {
      if (attr instanceof t.TextAttribute) {
        ingestBinding(
            unit, op.xref, attr.name, o.literal(attr.value), e.BindingType.Attribute, null,
            SecurityContext.NONE, attr.sourceSpan, templateAttrFlags | BindingFlags.TextValue);
      } else {
        ingestBinding(
            unit, op.xref, attr.name, attr.value, attr.type, attr.unit, attr.securityContext,
            attr.sourceSpan, templateAttrFlags);
      }
    }
  }

  for (const attr of element.attributes) {
    // This is only attribute TextLiteral bindings, such as `attr.foo="bar"`. This can never be
    // `[attr.foo]="bar"` or `attr.foo="{{bar}}"`, both of which will be handled as inputs with
    // `BindingType.Attribute`.
    ingestBinding(
        unit, op.xref, attr.name, o.literal(attr.value), e.BindingType.Attribute, null,
        SecurityContext.NONE, attr.sourceSpan, flags | BindingFlags.TextValue);
  }
  for (const input of element.inputs) {
    ingestBinding(
        unit, op.xref, input.name, input.value, input.type, input.unit, input.securityContext,
        input.sourceSpan, flags);
  }

  for (const output of element.outputs) {
    let listenerOp: ir.ListenerOp;
    if (output.type === e.ParsedEventType.Animation) {
      if (output.phase === null) {
        throw Error('Animation listener should have a phase');
      }
    }

    if (element instanceof t.Template && !isPlainTemplate(element)) {
      unit.create.push(
          ir.createExtractedAttributeOp(op.xref, ir.BindingKind.Property, output.name, null));
      continue;
    }

    listenerOp =
        ir.createListenerOp(op.xref, output.name, op.tag, output.phase, false, output.sourceSpan);

    // if output.handler is a chain, then push each statement from the chain separately, and
    // return the last one?
    let handlerExprs: e.AST[];
    let handler: e.AST = output.handler;
    if (handler instanceof e.ASTWithSource) {
      handler = handler.ast;
    }

    if (handler instanceof e.Chain) {
      handlerExprs = handler.expressions;
    } else {
      handlerExprs = [handler];
    }

    if (handlerExprs.length === 0) {
      throw new Error('Expected listener to have non-empty expression list.');
    }

    const expressions = handlerExprs.map(expr => convertAst(expr, unit.job, output.handlerSpan));
    const returnExpr = expressions.pop()!;

    for (const expr of expressions) {
      const stmtOp =
          ir.createStatementOp<ir.UpdateOp>(new o.ExpressionStatement(expr, expr.sourceSpan));
      listenerOp.handlerOps.push(stmtOp);
    }
    listenerOp.handlerOps.push(
        ir.createStatementOp(new o.ReturnStatement(returnExpr, returnExpr.sourceSpan)));
    unit.create.push(listenerOp);
  }
}

const BINDING_KINDS = new Map<e.BindingType, ir.BindingKind>([
  [e.BindingType.Property, ir.BindingKind.Property],
  [e.BindingType.Attribute, ir.BindingKind.Attribute],
  [e.BindingType.Class, ir.BindingKind.ClassName],
  [e.BindingType.Style, ir.BindingKind.StyleProperty],
  [e.BindingType.Animation, ir.BindingKind.Animation],
]);

enum BindingFlags {
  None = 0b000,

  /**
   * The binding is to a static text literal and not to an expression.
   */
  TextValue = 0b0001,

  /**
   * The binding belongs to the `<ng-template>` side of a `t.Template`.
   */
  BindingTargetsTemplate = 0b0010,

  /**
   * The binding is on a structural directive.
   */
  IsStructuralTemplateAttribute = 0b0100,

  /**
   * The binding is on a `t.Template`.
   */
  OnNgTemplateElement = 0b1000,
}

function ingestBinding(
    view: ViewCompilationUnit, xref: ir.XrefId, name: string, value: e.AST|o.Expression,
    type: e.BindingType, unit: string|null, securityContext: SecurityContext,
    sourceSpan: ParseSourceSpan, flags: BindingFlags): void {
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }

  if (flags & BindingFlags.OnNgTemplateElement && !(flags & BindingFlags.BindingTargetsTemplate) &&
      type === e.BindingType.Property) {
    // This binding only exists for later const extraction, and is not an actual binding to be
    // created.
    view.create.push(ir.createExtractedAttributeOp(xref, ir.BindingKind.Property, name, null));
    return;
  }

  let expression: o.Expression|ir.Interpolation;
  // TODO: We could easily generate source maps for subexpressions in these cases, but
  // TemplateDefinitionBuilder does not. Should we do so?
  if (value instanceof e.Interpolation) {
    expression = new ir.Interpolation(
        value.strings, value.expressions.map(expr => convertAst(expr, view.job, null)));
  } else if (value instanceof e.AST) {
    expression = convertAst(value, view.job, null);
  } else {
    expression = value;
  }

  const kind: ir.BindingKind = BINDING_KINDS.get(type)!;
  view.update.push(ir.createBindingOp(
      xref, kind, name, expression, unit, securityContext, !!(flags & BindingFlags.TextValue),
      !!(flags & BindingFlags.IsStructuralTemplateAttribute), sourceSpan));
}

/**
 * Process all of the local references on an element-like structure in the template AST and
 * convert them to their IR representation.
 */
function ingestReferences(op: ir.ElementOpBase, element: t.Element|t.Template): void {
  assertIsArray<ir.LocalRef>(op.localRefs);
  for (const {name, value} of element.references) {
    op.localRefs.push({
      name,
      target: value,
    });
  }
}

/**
 * Assert that the given value is an array.
 */
function assertIsArray<T>(value: any): asserts value is Array<T> {
  if (!Array.isArray(value)) {
    throw new Error(`AssertionError: expected an array`);
  }
}

/**
 * Creates an absolute `ParseSourceSpan` from the relative `ParseSpan`.
 *
 * `ParseSpan` objects are relative to the start of the expression.
 * This method converts these to full `ParseSourceSpan` objects that
 * show where the span is within the overall source file.
 *
 * @param span the relative span to convert.
 * @param baseSourceSpan a span corresponding to the base of the expression tree.
 * @returns a `ParseSourceSpan` for the given span or null if no `baseSourceSpan` was provided.
 */
function convertSourceSpan(
    span: e.ParseSpan, baseSourceSpan: ParseSourceSpan|null): ParseSourceSpan|null {
  if (baseSourceSpan === null) {
    return null;
  }
  const start = baseSourceSpan.start.moveBy(span.start);
  const end = baseSourceSpan.start.moveBy(span.end);
  const fullStart = baseSourceSpan.fullStart.moveBy(span.start);
  return new ParseSourceSpan(start, end, fullStart);
}
