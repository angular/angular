/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {makeRelatedInformation} from '../../diagnostics';
import {Reference} from '../../imports';
import {FunctionDefinition} from '../../reflection';
import {DynamicValue, DynamicValueVisitor} from './dynamic';
import {EnumValue, KnownFn, ResolvedModule, ResolvedValue} from './result';

/**
 * Derives a type representation from a resolved value to be reported in a diagnostic.
 *
 * @param value The resolved value for which a type representation should be derived.
 * @param maxDepth The maximum nesting depth of objects and arrays, defaults to 1 level.
 */
export function describeResolvedType(value: ResolvedValue, maxDepth: number = 1): string {
  if (value === null) {
    return 'null';
  } else if (value === undefined) {
    return 'undefined';
  } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return typeof value;
  } else if (value instanceof Map) {
    if (maxDepth === 0) {
      return 'object';
    }
    const entries = Array.from(value.entries()).map(([key, v]) => {
      return `${quoteKey(key)}: ${describeResolvedType(v, maxDepth - 1)}`;
    });
    return entries.length > 0 ? `{ ${entries.join('; ')} }` : '{}';
  } else if (value instanceof ResolvedModule) {
    return '(module)';
  } else if (value instanceof EnumValue) {
    return value.enumRef.debugName ?? '(anonymous)';
  } else if (value instanceof Reference) {
    return value.debugName ?? '(anonymous)';
  } else if (Array.isArray(value)) {
    if (maxDepth === 0) {
      return 'Array';
    }
    return `[${value.map(v => describeResolvedType(v, maxDepth - 1)).join(', ')}]`;
  } else if (value instanceof DynamicValue) {
    return '(not statically analyzable)';
  } else if (value instanceof KnownFn) {
    return 'Function';
  } else {
    return 'unknown';
  }
}

function quoteKey(key: string): string {
  if (/^[a-z0-9_]+$/i.test(key)) {
    return key;
  } else {
    return `'${key.replace(/'/g, '\\\'')}'`;
  }
}

/**
 * Creates an array of related information diagnostics for a `DynamicValue` that describe the trace
 * of why an expression was evaluated as dynamic.
 *
 * @param node The node for which a `ts.Diagnostic` is to be created with the trace.
 * @param value The dynamic value for which a trace should be created.
 */
export function traceDynamicValue(
    node: ts.Node, value: DynamicValue): ts.DiagnosticRelatedInformation[] {
  return value.accept(new TraceDynamicValueVisitor(node));
}

class TraceDynamicValueVisitor implements DynamicValueVisitor<ts.DiagnosticRelatedInformation[]> {
  private currentContainerNode: ts.Node|null = null;

  constructor(private node: ts.Node) {}

  visitDynamicInput(value: DynamicValue<DynamicValue>): ts.DiagnosticRelatedInformation[] {
    const trace = value.reason.accept(this);
    if (this.shouldTrace(value.node)) {
      const info =
          makeRelatedInformation(value.node, 'Unable to evaluate this expression statically.');
      trace.unshift(info);
    }
    return trace;
  }

  visitDynamicString(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(
        value.node, 'A string value could not be determined statically.')];
  }

  visitExternalReference(value: DynamicValue<Reference<ts.Declaration>>):
      ts.DiagnosticRelatedInformation[] {
    const name = value.reason.debugName;
    const description = name !== null ? `'${name}'` : 'an anonymous declaration';
    return [makeRelatedInformation(
        value.node,
        `A value for ${
            description} cannot be determined statically, as it is an external declaration.`)];
  }

  visitComplexFunctionCall(value: DynamicValue<FunctionDefinition>):
      ts.DiagnosticRelatedInformation[] {
    return [
      makeRelatedInformation(
          value.node,
          'Unable to evaluate function call of complex function. A function must have exactly one return statement.'),
      makeRelatedInformation(value.reason.node, 'Function is declared here.')
    ];
  }

  visitInvalidExpressionType(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(value.node, 'Unable to evaluate an invalid expression.')];
  }

  visitUnknown(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(value.node, 'Unable to evaluate statically.')];
  }

  visitUnknownIdentifier(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(value.node, 'Unknown reference.')];
  }

  visitDynamicType(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(value.node, 'Dynamic type.')];
  }

  visitUnsupportedSyntax(value: DynamicValue): ts.DiagnosticRelatedInformation[] {
    return [makeRelatedInformation(value.node, 'This syntax is not supported.')];
  }

  /**
   * Determines whether the dynamic value reported for the node should be traced, i.e. if it is not
   * part of the container for which the most recent trace was created.
   */
  private shouldTrace(node: ts.Node): boolean {
    if (node === this.node) {
      // Do not include a dynamic value for the origin node, as the main diagnostic is already
      // reported on that node.
      return false;
    }

    const container = getContainerNode(node);
    if (container === this.currentContainerNode) {
      // The node is part of the same container as the previous trace entry, so this dynamic value
      // should not become part of the trace.
      return false;
    }

    this.currentContainerNode = container;
    return true;
  }
}

/**
 * Determines the closest parent node that is to be considered as container, which is used to reduce
 * the granularity of tracing the dynamic values to a single entry per container. Currently, full
 * statements and destructuring patterns are considered as container.
 */
function getContainerNode(node: ts.Node): ts.Node {
  let currentNode: ts.Node|undefined = node;
  while (currentNode !== undefined) {
    switch (currentNode.kind) {
      case ts.SyntaxKind.ExpressionStatement:
      case ts.SyntaxKind.VariableStatement:
      case ts.SyntaxKind.ReturnStatement:
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.SwitchStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.ContinueStatement:
      case ts.SyntaxKind.BreakStatement:
      case ts.SyntaxKind.ThrowStatement:
      case ts.SyntaxKind.ObjectBindingPattern:
      case ts.SyntaxKind.ArrayBindingPattern:
        return currentNode;
    }

    currentNode = currentNode.parent;
  }
  return node.getSourceFile();
}
