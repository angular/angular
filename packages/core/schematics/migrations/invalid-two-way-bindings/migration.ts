/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ASTWithSource,
  BindingType,
  ParsedEventType,
  parseTemplate,
  ReadKeyExpr,
  ReadPropExpr,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstTemplate,
} from '@angular/compiler';
import ts from 'typescript';

/**
 * Migrates a template to replace the invalid usages of two-way bindings with their long form.
 * Returns null if no changes had to be made to the file.
 * @param template Template to be migrated.
 */
export function migrateTemplate(template: string): string | null {
  // Don't attempt to parse templates that don't contain two-way bindings.
  if (!template.includes(')]=')) {
    return null;
  }

  let rootNodes: TmplAstNode[] | null = null;

  try {
    const parsed = parseTemplate(template, '', {allowInvalidAssignmentEvents: true});

    if (parsed.errors === null) {
      rootNodes = parsed.nodes;
    }
  } catch {}

  // Don't migrate invalid templates.
  if (rootNodes === null) {
    return null;
  }

  const visitor = new InvalidTwoWayBindingCollector();
  const bindings = visitor
    .collectInvalidBindings(rootNodes)
    .sort((a, b) => b.sourceSpan.start.offset - a.sourceSpan.start.offset);

  if (bindings.length === 0) {
    return null;
  }

  let result = template;
  const printer = ts.createPrinter();

  for (const binding of bindings) {
    const valueText = result.slice(binding.value.sourceSpan.start, binding.value.sourceSpan.end);
    const outputText = migrateTwoWayEvent(valueText, binding, printer);

    if (outputText === null) {
      continue;
    }

    const before = result.slice(0, binding.sourceSpan.start.offset);
    const after = result.slice(binding.sourceSpan.end.offset);
    const inputText = migrateTwoWayInput(binding, valueText);
    result = before + inputText + ' ' + outputText + after;
  }

  return result;
}

/**
 * Creates the string for the input side of an invalid two-way bindings.
 * @param binding Invalid two-way binding to be migrated.
 * @param value String value of the binding.
 */
function migrateTwoWayInput(binding: TmplAstBoundAttribute, value: string): string {
  return `[${binding.name}]="${value}"`;
}

/**
 * Creates the string for the output side of an invalid two-way bindings.
 * @param binding Invalid two-way binding to be migrated.
 * @param value String value of the binding.
 */
function migrateTwoWayEvent(
  value: string,
  binding: TmplAstBoundAttribute,
  printer: ts.Printer,
): string | null {
  // Note that we use the TypeScript parser, as opposed to our own, because even though we have
  // an expression AST here already, our AST is harder to work with in a migration context.
  // To use it here, we would have to solve the following:
  // 1. Expose the internal converter that turns it from an event AST to an output AST.
  // 2. The process of converting to an output AST also transforms some expressions
  // (e.g. `foo.bar` becomes `ctx.foo.bar`). We would have to strip away those transformations here
  // which introduces room for mistakes.
  // 3. We'd still need a way to convert the output AST back into a string. We have such a utility
  // for JIT compilation, but it also includes JIT-specific logic we might not want.
  // Given these issues and the fact that the kinds of expressions we're migrating is fairly narrow,
  // we can get away with using the TypeScript AST instead.
  const sourceFile = ts.createSourceFile('temp.ts', value, ts.ScriptTarget.Latest);
  const expression =
    sourceFile.statements.length === 1 && ts.isExpressionStatement(sourceFile.statements[0])
      ? sourceFile.statements[0].expression
      : null;

  if (expression === null) {
    return null;
  }

  let migrated: ts.Expression | null = null;

  // Historically the expression parser was handling two-way events by appending `=$event`
  // to the raw string before attempting to parse it. This has led to bugs over the years (see
  // #37809) and to unintentionally supporting unassignable events in the two-way binding. The
  // logic below aims to emulate the old behavior. Note that the generated code doesn't necessarily
  // make sense based on what the user wrote, for example the event binding for `[(value)]="a ? b :
  // c"` would produce `ctx.a ? ctx.b : ctx.c = $event`. We aim to reproduce what the parser used to
  // generate before #54154.
  if (ts.isBinaryExpression(expression) && isReadExpression(expression.right)) {
    // `a && b` -> `a && (b = $event)`
    migrated = ts.factory.updateBinaryExpression(
      expression,
      expression.left,
      expression.operatorToken,
      wrapInEventAssignment(expression.right),
    );
  } else if (ts.isConditionalExpression(expression) && isReadExpression(expression.whenFalse)) {
    // `a ? b : c` -> `a ? b : c = $event`
    migrated = ts.factory.updateConditionalExpression(
      expression,
      expression.condition,
      expression.questionToken,
      expression.whenTrue,
      expression.colonToken,
      wrapInEventAssignment(expression.whenFalse),
    );
  } else if (isPrefixNot(expression)) {
    // `!!a` -> `a = $event`
    let innerExpression = expression.operand;
    while (true) {
      if (isPrefixNot(innerExpression)) {
        innerExpression = innerExpression.operand;
      } else {
        if (isReadExpression(innerExpression)) {
          migrated = wrapInEventAssignment(innerExpression);
        }

        break;
      }
    }
  }

  if (migrated === null) {
    return null;
  }

  const newValue = printer.printNode(ts.EmitHint.Expression, migrated, sourceFile);
  return `(${binding.name}Change)="${newValue}"`;
}

/** Wraps an expression in an assignment to `$event`, e.g. `foo.bar = $event`. */
function wrapInEventAssignment(node: ts.Expression): ts.Expression {
  return ts.factory.createBinaryExpression(
    node,
    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
    ts.factory.createIdentifier('$event'),
  );
}

/**
 * Checks whether an expression is a valid read expression. Note that identifiers
 * are considered read expressions in Angular templates as well.
 */
function isReadExpression(
  node: ts.Expression,
): node is ts.Identifier | ts.PropertyAccessExpression | ts.ElementAccessExpression {
  return (
    ts.isIdentifier(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  );
}

/** Checks whether an expression is in the form of `!x`. */
function isPrefixNot(node: ts.Expression): node is ts.PrefixUnaryExpression {
  return ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken;
}

/** Traverses a template AST and collects any invalid two-way bindings. */
class InvalidTwoWayBindingCollector extends TmplAstRecursiveVisitor {
  private invalidBindings: TmplAstBoundAttribute[] | null = null;

  collectInvalidBindings(rootNodes: TmplAstNode[]): TmplAstBoundAttribute[] {
    const result = (this.invalidBindings = []);
    rootNodes.forEach((node) => node.visit(this));
    this.invalidBindings = null;
    return result;
  }

  override visitElement(element: TmplAstElement): void {
    this.visitNodeWithBindings(element);
    super.visitElement(element);
  }

  override visitTemplate(template: TmplAstTemplate): void {
    this.visitNodeWithBindings(template);
    super.visitTemplate(template);
  }

  private visitNodeWithBindings(node: TmplAstElement | TmplAstTemplate) {
    const seenOneWayBindings = new Set<string>();

    // Collect all of the regular event and input binding
    // names so we can easily check for their presence.
    for (const output of node.outputs) {
      if (output.type === ParsedEventType.Regular) {
        seenOneWayBindings.add(output.name);
      }
    }

    for (const input of node.inputs) {
      if (input.type === BindingType.Property) {
        seenOneWayBindings.add(input.name);
      }
    }

    // Make a second pass only over the two-way bindings.
    for (const input of node.inputs) {
      // Skip over non-two-way bindings or two-way bindings where the user is also binding
      // to the input/output side. We can't migrate the latter, because we may end up converting
      // something like `[(ngModel)]="invalid" (ngModelChange)="foo()"` to
      // `[ngModel]="invalid" (ngModelChange)="invalid = $event" (ngModelChange)="foo()"` which
      // would break the app.
      if (
        input.type !== BindingType.TwoWay ||
        seenOneWayBindings.has(input.name) ||
        seenOneWayBindings.has(input.name + 'Change')
      ) {
        continue;
      }

      let value = input.value;

      if (value instanceof ASTWithSource) {
        value = value.ast;
      }

      // The only supported expression types are property reads and keyed reads.
      if (!(value instanceof ReadPropExpr) && !(value instanceof ReadKeyExpr)) {
        this.invalidBindings!.push(input);
      }
    }
  }
}
