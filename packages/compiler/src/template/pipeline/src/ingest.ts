/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool} from '../../../constant_pool';
import * as e from '../../../expression_parser/ast';
import * as o from '../../../output/output_ast';
import * as t from '../../../render3/r3_ast';
import * as ir from '../ir';

import {ComponentCompilation, ViewCompilation} from './compilation';
import {BINARY_OPERATORS} from './conversion';

/**
 * Process a template AST and convert it into a `ComponentCompilation` in the intermediate
 * representation.
 */
export function ingest(
    componentName: string, template: t.Node[], constantPool: ConstantPool): ComponentCompilation {
  const cpl = new ComponentCompilation(componentName, constantPool);
  ingestNodes(cpl.root, template);
  return cpl;
}

/**
 * Ingest the nodes of a template AST into the given `ViewCompilation`.
 */
function ingestNodes(view: ViewCompilation, template: t.Node[]): void {
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
function ingestElement(view: ViewCompilation, element: t.Element): void {
  const staticAttributes: Record<string, string> = {};
  for (const attr of element.attributes) {
    staticAttributes[attr.name] = attr.value;
  }
  const id = view.tpl.allocateXrefId();

  const startOp = ir.createElementStartOp(element.name, id);
  view.create.push(startOp);

  ingestAttributes(startOp, element);
  ingestBindings(view, startOp, element);
  ingestReferences(startOp, element);

  ingestNodes(view, element.children);
  view.create.push(ir.createElementEndOp(id));
}

/**
 * Ingest an `ng-template` node from the AST into the given `ViewCompilation`.
 */
function ingestTemplate(view: ViewCompilation, tmpl: t.Template): void {
  const childView = view.tpl.allocateView(view.xref);

  // TODO: validate the fallback tag name here.
  const tplOp = ir.createTemplateOp(childView.xref, tmpl.tagName ?? 'ng-template');
  view.create.push(tplOp);

  ingestAttributes(tplOp, tmpl);
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
function ingestText(view: ViewCompilation, text: t.Text): void {
  view.create.push(ir.createTextOp(view.tpl.allocateXrefId(), text.value));
}

/**
 * Ingest an interpolated text node from the AST into the given `ViewCompilation`.
 */
function ingestBoundText(view: ViewCompilation, text: t.BoundText): void {
  let value = text.value;
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }
  if (!(value instanceof e.Interpolation)) {
    throw new Error(
        `AssertionError: expected Interpolation for BoundText node, got ${value.constructor.name}`);
  }

  const textXref = view.tpl.allocateXrefId();
  view.create.push(ir.createTextOp(textXref, ''));
  view.update.push(ir.createInterpolateTextOp(
      textXref, value.strings, value.expressions.map(expr => convertAst(expr, view.tpl))));
}

/**
 * Convert a template AST expression into an output AST expression.
 */
function convertAst(ast: e.AST, cpl: ComponentCompilation): o.Expression {
  if (ast instanceof e.ASTWithSource) {
    return convertAst(ast.ast, cpl);
  } else if (ast instanceof e.PropertyRead) {
    if (ast.receiver instanceof e.ImplicitReceiver) {
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
  } else if (ast instanceof e.BindingPipe) {
    return new ir.PipeBindingExpr(
        cpl.allocateXrefId(),
        ast.name,
        [
          convertAst(ast.exp, cpl),
          ...ast.args.map(arg => convertAst(arg, cpl)),
        ],
    );
  } else {
    throw new Error(`Unhandled expression type: ${ast.constructor.name}`);
  }
}

/**
 * Process all of the attributes on an element-like structure in the template AST and convert them
 * to their IR representation.
 */
function ingestAttributes(op: ir.ElementOpBase, element: t.Element|t.Template): void {
  ir.assertIsElementAttributes(op.attributes);
  for (const attr of element.attributes) {
    op.attributes.add(ir.ElementAttributeKind.Attribute, attr.name, o.literal(attr.value));
  }

  for (const input of element.inputs) {
    op.attributes.add(ir.ElementAttributeKind.Binding, input.name, null);
  }
  for (const output of element.outputs) {
    op.attributes.add(ir.ElementAttributeKind.Binding, output.name, null);
  }
  if (element instanceof t.Template) {
    for (const attr of element.templateAttrs) {
      // TODO: what do we do about the value here?
      op.attributes.add(ir.ElementAttributeKind.Template, attr.name, null);
    }
  }
}

/**
 * Process all of the bindings on an element-like structure in the template AST and convert them
 * to their IR representation.
 */
function ingestBindings(
    view: ViewCompilation, op: ir.ElementOpBase, element: t.Element|t.Template): void {
  if (element instanceof t.Template) {
    for (const attr of [...element.templateAttrs, ...element.inputs]) {
      if (!(attr instanceof t.BoundAttribute)) {
        continue;
      }
      ingestPropertyBinding(view, op.xref, attr.name, attr.value);
    }
  } else {
    for (const input of element.inputs) {
      ingestPropertyBinding(view, op.xref, input.name, input.value);
    }

    for (const output of element.outputs) {
      const listenerOp = ir.createListenerOp(op.xref, output.name, op.tag);
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

      const expressions = inputExprs.map(expr => convertAst(expr, view.tpl));
      const returnExpr = expressions.pop()!;

      for (const expr of expressions) {
        const stmtOp = ir.createStatementOp<ir.UpdateOp>(new o.ExpressionStatement(expr));
        listenerOp.handlerOps.push(stmtOp);
      }
      listenerOp.handlerOps.push(ir.createStatementOp(new o.ReturnStatement(returnExpr)));
      view.create.push(listenerOp);
    }
  }
}

function ingestPropertyBinding(
    view: ViewCompilation, xref: ir.XrefId, name: string, value: e.AST): void {
  if (value instanceof e.ASTWithSource) {
    value = value.ast;
  }
  if (value instanceof e.Interpolation) {
    view.update.push(ir.createInterpolatePropertyOp(
        xref, name, value.strings, value.expressions.map(expr => convertAst(expr, view.tpl))));
  } else {
    view.update.push(ir.createPropertyOp(xref, name, convertAst(value, view.tpl)));
  }
}

/**
 * Process all of the local references on an element-like structure in the template AST and convert
 * them to their IR representation.
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
