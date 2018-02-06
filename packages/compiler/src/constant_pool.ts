/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';
import {OutputContext, error} from './util';

const CONSTANT_PREFIX = '_c';

export const enum DefinitionKind {Injector, Directive, Component, Pipe}

/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
class FixupExpression extends o.Expression {
  constructor(public resolved: o.Expression) { super(resolved.type); }

  shared: boolean;

  visitExpression(visitor: o.ExpressionVisitor, context: any): any {
    return this.resolved.visitExpression(visitor, context);
  }

  isEquivalent(e: o.Expression): boolean {
    return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
  }

  fixup(expression: o.Expression) {
    this.resolved = expression;
    this.shared = true;
  }
}

/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
export class ConstantPool {
  statements: o.Statement[] = [];
  private literals = new Map<string, FixupExpression>();
  private injectorDefinitions = new Map<any, FixupExpression>();
  private directiveDefinitions = new Map<any, FixupExpression>();
  private componentDefinitions = new Map<any, FixupExpression>();
  private pipeDefinitions = new Map<any, FixupExpression>();

  private nextNameIndex = 0;

  getConstLiteral(literal: o.Expression, forceShared?: boolean): o.Expression {
    const key = this.keyOf(literal);
    let fixup = this.literals.get(key);
    let newValue = false;
    if (!fixup) {
      fixup = new FixupExpression(literal);
      this.literals.set(key, fixup);
      newValue = true;
    }

    if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
      // Replace the expression with a variable
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(literal).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
      fixup.fixup(o.variable(name));
    }

    return fixup;
  }

  getDefinition(type: any, kind: DefinitionKind, ctx: OutputContext, forceShared: boolean = false):
      o.Expression {
    const definitions = this.definitionsOf(kind);
    let fixup = definitions.get(type);
    let newValue = false;
    if (!fixup) {
      const property = this.propertyNameOf(kind);
      fixup = new FixupExpression(ctx.importExpr(type).prop(property));
      definitions.set(type, fixup);
      newValue = true;
    }

    if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(fixup.resolved).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
      fixup.fixup(o.variable(name));
    }
    return fixup;
  }

  /**
   * Produce a unique name.
   *
   * The name might be unique among different prefixes if any of the prefixes end in
   * a digit so the prefix should be a constant string (not based on user input) and
   * must not end in a digit.
   */
  uniqueName(prefix: string): string { return `${prefix}${this.nextNameIndex++}`; }

  private definitionsOf(kind: DefinitionKind): Map<any, FixupExpression> {
    switch (kind) {
      case DefinitionKind.Component:
        return this.componentDefinitions;
      case DefinitionKind.Directive:
        return this.directiveDefinitions;
      case DefinitionKind.Injector:
        return this.injectorDefinitions;
      case DefinitionKind.Pipe:
        return this.pipeDefinitions;
    }
    error(`Unknown definition kind ${kind}`);
    return this.componentDefinitions;
  }

  public propertyNameOf(kind: DefinitionKind): string {
    switch (kind) {
      case DefinitionKind.Component:
        return 'ngComponentDef';
      case DefinitionKind.Directive:
        return 'ngDirectiveDef';
      case DefinitionKind.Injector:
        return 'ngInjectorDef';
      case DefinitionKind.Pipe:
        return 'ngPipeDef';
    }
    error(`Unknown definition kind ${kind}`);
    return '<unknown>';
  }

  private freshName(): string { return this.uniqueName(CONSTANT_PREFIX); }

  private keyOf(expression: o.Expression) {
    return expression.visitExpression(new KeyVisitor(), null);
  }
}

class KeyVisitor implements o.ExpressionVisitor {
  visitLiteralExpr(ast: o.LiteralExpr): string {
    return `${typeof ast.value === 'string' ? '"' + ast.value + '"' : ast.value}`;
  }
  visitLiteralArrayExpr(ast: o.LiteralArrayExpr): string {
    return `[${ast.entries.map(entry => entry.visitExpression(this, null)).join(',')}]`;
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr): string {
    const mapEntry = (entry: o.LiteralMapEntry) =>
        `${entry.key}:${entry.value.visitExpression(this, null)}`;
    return `{${ast.entries.map(mapEntry).join(',')}`;
  }

  visitExternalExpr(ast: o.ExternalExpr): string {
    return ast.value.moduleName ? `EX:${ast.value.moduleName}:${ast.value.name}` :
                                  `EX:${ast.value.runtime.name}`;
  }

  visitReadVarExpr = invalid;
  visitWriteVarExpr = invalid;
  visitWriteKeyExpr = invalid;
  visitWritePropExpr = invalid;
  visitInvokeMethodExpr = invalid;
  visitInvokeFunctionExpr = invalid;
  visitInstantiateExpr = invalid;
  visitConditionalExpr = invalid;
  visitNotExpr = invalid;
  visitAssertNotNullExpr = invalid;
  visitCastExpr = invalid;
  visitFunctionExpr = invalid;
  visitBinaryOperatorExpr = invalid;
  visitReadPropExpr = invalid;
  visitReadKeyExpr = invalid;
  visitCommaExpr = invalid;
}

function invalid<T>(arg: o.Expression | o.Statement): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${o.constructor.name}`);
}
