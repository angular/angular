/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from './output/output_ast';
import {error, OutputContext} from './util';

const CONSTANT_PREFIX = '_c';

/**
 * `ConstantPool` tries to reuse literal factories when two or more literals are identical.
 * We determine whether literals are identical by creating a key out of their AST using the
 * `KeyVisitor`. This constant is used to replace dynamic expressions which can't be safely
 * converted into a key. E.g. given an expression `{foo: bar()}`, since we don't know what
 * the result of `bar` will be, we create a key that looks like `{foo: <unknown>}`. Note
 * that we use a variable, rather than something like `null` in order to avoid collisions.
 */
const UNKNOWN_VALUE_KEY = o.variable('<unknown>');

export const enum DefinitionKind {
  Injector,
  Directive,
  Component,
  Pipe
}

/**
 * Context to use when producing a key.
 *
 * This ensures we see the constant not the reference variable when producing
 * a key.
 */
const KEY_CONTEXT = {};

/**
 * Generally all primitive values are excluded from the `ConstantPool`, but there is an exclusion
 * for strings that reach a certain length threshold. This constant defines the length threshold for
 * strings.
 */
const POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS = 50;

/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
class FixupExpression extends o.Expression {
  private original: o.Expression;

  // TODO(issue/24571): remove '!'.
  shared!: boolean;

  constructor(public resolved: o.Expression) {
    super(resolved.type);
    this.original = resolved;
  }

  visitExpression(visitor: o.ExpressionVisitor, context: any): any {
    if (context === KEY_CONTEXT) {
      // When producing a key we want to traverse the constant not the
      // variable used to refer to it.
      return this.original.visitExpression(visitor, context);
    } else {
      return this.resolved.visitExpression(visitor, context);
    }
  }

  isEquivalent(e: o.Expression): boolean {
    return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
  }

  isConstant() {
    return true;
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
  private literalFactories = new Map<string, o.Expression>();
  private injectorDefinitions = new Map<any, FixupExpression>();
  private directiveDefinitions = new Map<any, FixupExpression>();
  private componentDefinitions = new Map<any, FixupExpression>();
  private pipeDefinitions = new Map<any, FixupExpression>();

  private nextNameIndex = 0;

  constructor(private readonly isClosureCompilerEnabled: boolean = false) {}

  getConstLiteral(literal: o.Expression, forceShared?: boolean): o.Expression {
    if ((literal instanceof o.LiteralExpr && !isLongStringLiteral(literal)) ||
        literal instanceof FixupExpression) {
      // Do no put simple literals into the constant pool or try to produce a constant for a
      // reference to a constant.
      return literal;
    }
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
      let definition: o.WriteVarExpr;
      let usage: o.Expression;
      if (this.isClosureCompilerEnabled && isLongStringLiteral(literal)) {
        // For string literals, Closure will **always** inline the string at
        // **all** usages, duplicating it each time. For large strings, this
        // unnecessarily bloats bundle size. To work around this restriction, we
        // wrap the string in a function, and call that function for each usage.
        // This tricks Closure into using inline logic for functions instead of
        // string literals. Function calls are only inlined if the body is small
        // enough to be worth it. By doing this, very large strings will be
        // shared across multiple usages, rather than duplicating the string at
        // each usage site.
        //
        // const myStr = function() { return "very very very long string"; };
        // const usage1 = myStr();
        // const usage2 = myStr();
        definition = o.variable(name).set(new o.FunctionExpr(
            [],  // Params.
            [
              // Statements.
              new o.ReturnStatement(literal),
            ],
            ));
        usage = o.variable(name).callFn([]);
      } else {
        // Just declare and use the variable directly, without a function call
        // indirection. This saves a few bytes and avoids an unncessary call.
        definition = o.variable(name).set(literal);
        usage = o.variable(name);
      }

      this.statements.push(definition.toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
      fixup.fixup(usage);
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

  getLiteralFactory(literal: o.LiteralArrayExpr|o.LiteralMapExpr):
      {literalFactory: o.Expression, literalFactoryArguments: o.Expression[]} {
    // Create a pure function that builds an array of a mix of constant and variable expressions
    if (literal instanceof o.LiteralArrayExpr) {
      const argumentsForKey = literal.entries.map(e => e.isConstant() ? e : UNKNOWN_VALUE_KEY);
      const key = this.keyOf(o.literalArr(argumentsForKey));
      return this._getLiteralFactory(key, literal.entries, entries => o.literalArr(entries));
    } else {
      const expressionForKey = o.literalMap(
          literal.entries.map(e => ({
                                key: e.key,
                                value: e.value.isConstant() ? e.value : UNKNOWN_VALUE_KEY,
                                quoted: e.quoted
                              })));
      const key = this.keyOf(expressionForKey);
      return this._getLiteralFactory(
          key, literal.entries.map(e => e.value),
          entries => o.literalMap(entries.map((value, index) => ({
                                                key: literal.entries[index].key,
                                                value,
                                                quoted: literal.entries[index].quoted
                                              }))));
    }
  }

  private _getLiteralFactory(
      key: string, values: o.Expression[], resultMap: (parameters: o.Expression[]) => o.Expression):
      {literalFactory: o.Expression, literalFactoryArguments: o.Expression[]} {
    let literalFactory = this.literalFactories.get(key);
    const literalFactoryArguments = values.filter((e => !e.isConstant()));
    if (!literalFactory) {
      const resultExpressions = values.map(
          (e, index) => e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`));
      const parameters =
          resultExpressions.filter(isVariable).map(e => new o.FnParam(e.name!, o.DYNAMIC_TYPE));
      const pureFunctionDeclaration =
          o.fn(parameters, [new o.ReturnStatement(resultMap(resultExpressions))], o.INFERRED_TYPE);
      const name = this.freshName();
      this.statements.push(
          o.variable(name).set(pureFunctionDeclaration).toDeclStmt(o.INFERRED_TYPE, [
            o.StmtModifier.Final
          ]));
      literalFactory = o.variable(name);
      this.literalFactories.set(key, literalFactory);
    }
    return {literalFactory, literalFactoryArguments};
  }

  /**
   * Produce a unique name.
   *
   * The name might be unique among different prefixes if any of the prefixes end in
   * a digit so the prefix should be a constant string (not based on user input) and
   * must not end in a digit.
   */
  uniqueName(prefix: string): string {
    return `${prefix}${this.nextNameIndex++}`;
  }

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
  }

  public propertyNameOf(kind: DefinitionKind): string {
    switch (kind) {
      case DefinitionKind.Component:
        return 'ɵcmp';
      case DefinitionKind.Directive:
        return 'ɵdir';
      case DefinitionKind.Injector:
        return 'ɵinj';
      case DefinitionKind.Pipe:
        return 'ɵpipe';
    }
  }

  private freshName(): string {
    return this.uniqueName(CONSTANT_PREFIX);
  }

  private keyOf(expression: o.Expression) {
    return expression.visitExpression(new KeyVisitor(), KEY_CONTEXT);
  }
}

/**
 * Visitor used to determine if 2 expressions are equivalent and can be shared in the
 * `ConstantPool`.
 *
 * When the id (string) generated by the visitor is equal, expressions are considered equivalent.
 */
class KeyVisitor implements o.ExpressionVisitor {
  visitLiteralExpr(ast: o.LiteralExpr): string {
    return `${typeof ast.value === 'string' ? '"' + ast.value + '"' : ast.value}`;
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, context: object): string {
    return `[${ast.entries.map(entry => entry.visitExpression(this, context)).join(',')}]`;
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: object): string {
    const mapKey = (entry: o.LiteralMapEntry) => {
      const quote = entry.quoted ? '"' : '';
      return `${quote}${entry.key}${quote}`;
    };
    const mapEntry = (entry: o.LiteralMapEntry) =>
        `${mapKey(entry)}:${entry.value.visitExpression(this, context)}`;
    return `{${ast.entries.map(mapEntry).join(',')}`;
  }

  visitExternalExpr(ast: o.ExternalExpr): string {
    return ast.value.moduleName ? `EX:${ast.value.moduleName}:${ast.value.name}` :
                                  `EX:${ast.value.runtime.name}`;
  }

  visitReadVarExpr(node: o.ReadVarExpr) {
    return `VAR:${node.name}`;
  }

  visitTypeofExpr(node: o.TypeofExpr, context: any): string {
    return `TYPEOF:${node.expr.visitExpression(this, context)}`;
  }

  visitWrappedNodeExpr = invalid;
  visitWriteVarExpr = invalid;
  visitWriteKeyExpr = invalid;
  visitWritePropExpr = invalid;
  visitInvokeMethodExpr = invalid;
  visitInvokeFunctionExpr = invalid;
  visitTaggedTemplateExpr = invalid;
  visitInstantiateExpr = invalid;
  visitConditionalExpr = invalid;
  visitNotExpr = invalid;
  visitAssertNotNullExpr = invalid;
  visitCastExpr = invalid;
  visitFunctionExpr = invalid;
  visitUnaryOperatorExpr = invalid;
  visitBinaryOperatorExpr = invalid;
  visitReadPropExpr = invalid;
  visitReadKeyExpr = invalid;
  visitCommaExpr = invalid;
  visitLocalizedString = invalid;
}

function invalid<T>(this: o.ExpressionVisitor, arg: o.Expression|o.Statement): never {
  throw new Error(
      `Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}

function isVariable(e: o.Expression): e is o.ReadVarExpr {
  return e instanceof o.ReadVarExpr;
}

function isLongStringLiteral(expr: o.Expression): boolean {
  return expr instanceof o.LiteralExpr && typeof expr.value === 'string' &&
      expr.value.length >= POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS;
}
