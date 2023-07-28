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
 */
export function ingestComponent(
    componentName: string, template: t.Node[],
    constantPool: ConstantPool): ComponentCompilationJob {
  const cpl = new ComponentCompilationJob(componentName, constantPool, compatibilityMode);
  ingestNodes(cpl.root, template);
  return cpl;
}

export interface HostBindingInput {
  componentName: string;
  properties: e.ParsedProperty[]|null;
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
    ingestHostProperty(job, property);
  }
  for (const event of input.events ?? []) {
    ingestHostEvent(job, event);
  }
  return job;
}

// TODO: We should refactor the parser to use the same types and structures for host bindings as
// with ordinary components. This would allow us to share a lot more ingestion code.
export function ingestHostProperty(
    job: HostBindingCompilationJob, property: e.ParsedProperty): void {
  let expression: o.Expression|ir.Interpolation;
  const ast = property.expression.ast;
  if (ast instanceof e.Interpolation) {
    expression =
        new ir.Interpolation(ast.strings, ast.expressions.map(expr => convertAst(expr, job)));
  } else {
    expression = convertAst(ast, job);
  }
  let bindingKind = ir.BindingKind.Property;
  // TODO: this should really be handled in the parser.
  if (property.name.startsWith('attr.')) {
    property.name = property.name.substring('attr.'.length);
    bindingKind = ir.BindingKind.Attribute;
  }
  job.update.push(ir.createBindingOp(
      job.root.xref, bindingKind, property.name, expression, null,
      SecurityContext
          .NONE /* TODO: what should we pass as security context? Passing NONE for now. */,
      false, property.sourceSpan));
}

export function ingestHostEvent(job: HostBindingCompilationJob, event: e.ParsedEvent) {}

/**
 * Ingest the nodes of a template AST into the given `ViewCompilation`.
 */
function ingestNodes(view: ViewCompilationUnit, template: t.Node[]): void {
  for (const node of template) {
    if (node instanceof t.Element) {
      ingestElement(view, node);
    } else if (node instanceof t.Template) {
      ingestTemplate(view, node);
    } else if (node instanceof t.Text) {
      ingestText(view, node);
    } else if (node instanceof t.BoundText) {
      ingestBoundText(view, node);
    } else {
      throw new Error(`Unsupported template node: ${node.constructor.name}`);
    }
  }
}



/**
 * Ingest an element AST from the template into the given `ViewCompilation`.
 */
function ingestElement(view: ViewCompilationUnit, element: t.Element): void {
  const staticAttributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    staticAttributes[attr.name] = attr.value;
  }
  const id = view.job.allocateXrefId();

  const [namespaceKey, elementName] = splitNsName(element.name);

  const startOp = ir.createElementStartOp(
      elementName, id, namespaceForKey(namespaceKey), element.startSourceSpan);
  view.create.push(startOp);

  ingestBindings(view, startOp, element);
  ingestReferences(startOp, element);

  ingestNodes(view, element.children);
  view.create.push(ir.createElementEndOp(id, element.endSourceSpan));
}

/**
 * Ingest an `ng-template` node from the AST into the given `ViewCompilation`.
 */
function ingestTemplate(view: ViewCompilationUnit, tmpl: t.Template): void {
  const childView = view.job.allocateView(view.xref);

  let tagNameWithoutNamespace = tmpl.tagName;
  let namespacePrefix: string|null = '';
  if (tmpl.tagName) {
    [namespacePrefix, tagNameWithoutNamespace] = splitNsName(tmpl.tagName);
  }

  // TODO: validate the fallback tag name here.
  const tplOp = ir.createTemplateOp(
      childView.xref, tagNameWithoutNamespace ?? 'ng-template', namespaceForKey(namespacePrefix),
      tmpl.startSourceSpan);
  view.create.push(tplOp);

  ingestBindings(view, tplOp, tmpl);
  ingestReferences(tplOp, tmpl);

  ingestNodes(childView, tmpl.children);

  for (const {name, value} of tmpl.variables) {
    childView.contextVariables.set(name, value);
  }
}

/**
 * Ingest a literal text node from the AST into the given `ViewCompilation`.
 */
function ingestText(view: ViewCompilationUnit, text: t.Text): void {
  view.create.push(ir.createTextOp(view.job.allocateXrefId(), text.value, text.sourceSpan));
}

/**
 * Ingest an interpolated text node from the AST into the given `ViewCompilation`.
 */
function ingestBoundText(view: ViewCompilationUnit, text: t.BoundText): void {
  let value = text.value;
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }
  if (!(value instanceof e.Interpolation)) {
    throw new Error(
        `AssertionError: expected Interpolation for BoundText node, got ${value.constructor.name}`);
  }

  const textXref = view.job.allocateXrefId();
  view.create.push(ir.createTextOp(textXref, '', text.sourceSpan));
  view.update.push(ir.createInterpolateTextOp(
      textXref,
      new ir.Interpolation(
          value.strings, value.expressions.map(expr => convertAst(expr, view.job))),
      text.sourceSpan));
}

/**
 * Convert a template AST expression into an output AST expression.
 */
function convertAst(ast: e.AST, cpl: CompilationJob): o.Expression {
  if (ast instanceof e.ASTWithSource) {
    return convertAst(ast.ast, cpl);
  } else if (ast instanceof e.PropertyRead) {
    if (ast.receiver instanceof e.ImplicitReceiver && !(ast.receiver instanceof e.ThisReceiver)) {
      return new ir.LexicalReadExpr(ast.name);
    } else {
      return new o.ReadPropExpr(convertAst(ast.receiver, cpl), ast.name);
    }
  } else if (ast instanceof e.PropertyWrite) {
    return new o.WritePropExpr(convertAst(ast.receiver, cpl), ast.name, convertAst(ast.value, cpl));
  } else if (ast instanceof e.KeyedWrite) {
    return new o.WriteKeyExpr(
        convertAst(ast.receiver, cpl),
        convertAst(ast.key, cpl),
        convertAst(ast.value, cpl),
    );
  } else if (ast instanceof e.Call) {
    if (ast.receiver instanceof e.ImplicitReceiver) {
      throw new Error(`Unexpected ImplicitReceiver`);
    } else {
      return new o.InvokeFunctionExpr(
          convertAst(ast.receiver, cpl), ast.args.map(arg => convertAst(arg, cpl)));
    }
  } else if (ast instanceof e.LiteralPrimitive) {
    return o.literal(ast.value);
  } else if (ast instanceof e.Binary) {
    const operator = BINARY_OPERATORS.get(ast.operation);
    if (operator === undefined) {
      throw new Error(`AssertionError: unknown binary operator ${ast.operation}`);
    }
    return new o.BinaryOperatorExpr(
        operator, convertAst(ast.left, cpl), convertAst(ast.right, cpl));
  } else if (ast instanceof e.ThisReceiver) {
    return new ir.ContextExpr(cpl.root.xref);
  } else if (ast instanceof e.KeyedRead) {
    return new o.ReadKeyExpr(convertAst(ast.receiver, cpl), convertAst(ast.key, cpl));
  } else if (ast instanceof e.Chain) {
    throw new Error(`AssertionError: Chain in unknown context`);
  } else if (ast instanceof e.LiteralMap) {
    const entries = ast.keys.map((key, idx) => {
      const value = ast.values[idx];
      return new o.LiteralMapEntry(key.key, convertAst(value, cpl), key.quoted);
    });
    return new o.LiteralMapExpr(entries);
  } else if (ast instanceof e.LiteralArray) {
    return new o.LiteralArrayExpr(ast.expressions.map(expr => convertAst(expr, cpl)));
  } else if (ast instanceof e.Conditional) {
    return new o.ConditionalExpr(
        convertAst(ast.condition, cpl),
        convertAst(ast.trueExp, cpl),
        convertAst(ast.falseExp, cpl),
    );
  } else if (ast instanceof e.NonNullAssert) {
    // A non-null assertion shouldn't impact generated instructions, so we can just drop it.
    return convertAst(ast.expression, cpl);
  } else if (ast instanceof e.BindingPipe) {
    return new ir.PipeBindingExpr(
        cpl.allocateXrefId(),
        ast.name,
        [
          convertAst(ast.exp, cpl),
          ...ast.args.map(arg => convertAst(arg, cpl)),
        ],
    );
  } else if (ast instanceof e.SafeKeyedRead) {
    return new ir.SafeKeyedReadExpr(convertAst(ast.receiver, cpl), convertAst(ast.key, cpl));
  } else if (ast instanceof e.SafePropertyRead) {
    return new ir.SafePropertyReadExpr(convertAst(ast.receiver, cpl), ast.name);
  } else if (ast instanceof e.SafeCall) {
    return new ir.SafeInvokeFunctionExpr(
        convertAst(ast.receiver, cpl), ast.args.map(a => convertAst(a, cpl)));
  } else if (ast instanceof e.EmptyExpr) {
    return new ir.EmptyExpr();
  } else {
    throw new Error(`Unhandled expression type: ${ast.constructor.name}`);
  }
}

/**
 * Process all of the bindings on an element-like structure in the template AST and convert them
 * to their IR representation.
 */
function ingestBindings(
    view: ViewCompilationUnit, op: ir.ElementOpBase, element: t.Element|t.Template): void {
  if (element instanceof t.Template) {
    for (const attr of element.templateAttrs) {
      if (attr instanceof t.TextAttribute) {
        ingestBinding(
            view, op.xref, attr.name, o.literal(attr.value), e.BindingType.Attribute, null,
            SecurityContext.NONE, attr.sourceSpan, true);
      } else {
        ingestBinding(
            view, op.xref, attr.name, attr.value, attr.type, attr.unit, attr.securityContext,
            attr.sourceSpan, true);
      }
    }
  }

  for (const attr of element.attributes) {
    // This is only attribute TextLiteral bindings, such as `attr.foo="bar"`. This can never be
    // `[attr.foo]="bar"` or `attr.foo="{{bar}}"`, both of which will be handled as inputs with
    // `BindingType.Attribute`.
    ingestBinding(
        view, op.xref, attr.name, o.literal(attr.value), e.BindingType.Attribute, null,
        SecurityContext.NONE, attr.sourceSpan, false);
  }

  for (const input of element.inputs) {
    ingestBinding(
        view, op.xref, input.name, input.value, input.type, input.unit, input.securityContext,
        input.sourceSpan, false);
  }

  for (const output of element.outputs) {
    let listenerOp: ir.ListenerOp;
    if (output.type === e.ParsedEventType.Animation) {
      if (output.phase === null) {
        throw Error('Animation listener should have a phase');
      }
      listenerOp = ir.createListenerOpForAnimation(op.xref, output.name, output.phase!, op.tag);
    } else {
      listenerOp = ir.createListenerOp(op.xref, output.name, op.tag);
    }
    // if output.handler is a chain, then push each statement from the chain separately, and
    // return the last one?
    let inputExprs: e.AST[];
    let handler: e.AST = output.handler;
    if (handler instanceof e.ASTWithSource) {
      handler = handler.ast;
    }

    if (handler instanceof e.Chain) {
      inputExprs = handler.expressions;
    } else {
      inputExprs = [handler];
    }

    if (inputExprs.length === 0) {
      throw new Error('Expected listener to have non-empty expression list.');
    }

    const expressions = inputExprs.map(expr => convertAst(expr, view.job));
    const returnExpr = expressions.pop()!;

    for (const expr of expressions) {
      const stmtOp = ir.createStatementOp<ir.UpdateOp>(new o.ExpressionStatement(expr));
      listenerOp.handlerOps.push(stmtOp);
    }
    listenerOp.handlerOps.push(ir.createStatementOp(new o.ReturnStatement(returnExpr)));
    view.create.push(listenerOp);
  }
}

const BINDING_KINDS = new Map<e.BindingType, ir.BindingKind>([
  [e.BindingType.Property, ir.BindingKind.Property],
  [e.BindingType.Attribute, ir.BindingKind.Attribute],
  [e.BindingType.Class, ir.BindingKind.ClassName],
  [e.BindingType.Style, ir.BindingKind.StyleProperty],
  [e.BindingType.Animation, ir.BindingKind.Animation],
]);

function ingestBinding(
    view: ViewCompilationUnit, xref: ir.XrefId, name: string, value: e.AST|o.Expression,
    type: e.BindingType, unit: string|null, securityContext: SecurityContext,
    sourceSpan: ParseSourceSpan, isTemplateBinding: boolean): void {
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }

  let expression: o.Expression|ir.Interpolation;
  if (value instanceof e.Interpolation) {
    expression = new ir.Interpolation(
        value.strings, value.expressions.map(expr => convertAst(expr, view.job)));
  } else if (value instanceof e.AST) {
    expression = convertAst(value, view.job);
  } else {
    expression = value;
  }

  const kind: ir.BindingKind = BINDING_KINDS.get(type)!;
  view.update.push(ir.createBindingOp(
      xref, kind, name, expression, unit, securityContext, isTemplateBinding, sourceSpan));
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
