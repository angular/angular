/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from './output/output_ast';

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

  shared = false;

  constructor(public resolved: o.Expression) {
    super(resolved.type);
    this.original = resolved;
  }

  override visitExpression(visitor: o.ExpressionVisitor, context: any): any {
    if (context === KEY_CONTEXT) {
      // When producing a key we want to traverse the constant not the
      // variable used to refer to it.
      return this.original.visitExpression(visitor, context);
    } else {
      return this.resolved.visitExpression(visitor, context);
    }
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
  }

  override isConstant() {
    return true;
  }

  override clone(): FixupExpression {
    throw new Error(`Not supported.`);
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
  private sharedConstants = new Map<string, o.Expression>();

  /**
   * Constant pool also tracks claimed names from {@link uniqueName}.
   * This is useful to avoid collisions if variables are intended to be
   * named a certain way- but may conflict. We wouldn't want to always suffix
   * them with unique numbers.
   */
  private _claimedNames = new Map<string, number>();

  private nextNameIndex = 0;

  constructor(private readonly isClosureCompilerEnabled: boolean = false) {}

  getConstLiteral(literal: o.Expression, forceShared?: boolean): o.Expression {
    if (
      (literal instanceof o.LiteralExpr && !isLongStringLiteral(literal)) ||
      literal instanceof FixupExpression
    ) {
      // Do no put simple literals into the constant pool or try to produce a constant for a
      // reference to a constant.
      return literal;
    }
    const key = GenericKeyFn.INSTANCE.keyOf(literal);
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
      let value: o.Expression;
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
        value = new o.FunctionExpr(
          [], // Params.
          [
            // Statements.
            new o.ReturnStatement(literal),
          ],
        );
        usage = o.variable(name).callFn([]);
      } else {
        // Just declare and use the variable directly, without a function call
        // indirection. This saves a few bytes and avoids an unnecessary call.
        value = literal;
        usage = o.variable(name);
      }

      this.statements.push(
        new o.DeclareVarStmt(name, value, o.INFERRED_TYPE, o.StmtModifier.Final),
      );
      fixup.fixup(usage);
    }

    return fixup;
  }

  getSharedConstant(def: SharedConstantDefinition, expr: o.Expression): o.Expression {
    const key = def.keyOf(expr);
    if (!this.sharedConstants.has(key)) {
      const id = this.freshName();
      this.sharedConstants.set(key, o.variable(id));
      this.statements.push(def.toSharedConstantDeclaration(id, expr));
    }
    return this.sharedConstants.get(key)!;
  }

  getLiteralFactory(literal: o.LiteralArrayExpr | o.LiteralMapExpr): {
    literalFactory: o.Expression;
    literalFactoryArguments: o.Expression[];
  } {
    // Create a pure function that builds an array of a mix of constant and variable expressions
    if (literal instanceof o.LiteralArrayExpr) {
      const argumentsForKey = literal.entries.map((e) => (e.isConstant() ? e : UNKNOWN_VALUE_KEY));
      const key = GenericKeyFn.INSTANCE.keyOf(o.literalArr(argumentsForKey));
      return this._getLiteralFactory(key, literal.entries, (entries) => o.literalArr(entries));
    } else {
      const expressionForKey = o.literalMap(
        literal.entries.map((e) => ({
          key: e.key,
          value: e.value.isConstant() ? e.value : UNKNOWN_VALUE_KEY,
          quoted: e.quoted,
        })),
      );
      const key = GenericKeyFn.INSTANCE.keyOf(expressionForKey);
      return this._getLiteralFactory(
        key,
        literal.entries.map((e) => e.value),
        (entries) =>
          o.literalMap(
            entries.map((value, index) => ({
              key: literal.entries[index].key,
              value,
              quoted: literal.entries[index].quoted,
            })),
          ),
      );
    }
  }

  // TODO: useUniqueName(false) is necessary for naming compatibility with
  // TemplateDefinitionBuilder, but should be removed once Template Pipeline is the default.
  getSharedFunctionReference(
    fn: o.Expression,
    prefix: string,
    useUniqueName: boolean = true,
  ): o.Expression {
    const isArrow = fn instanceof o.ArrowFunctionExpr;

    for (const current of this.statements) {
      // Arrow functions are saved as variables so we check if the
      // value of the variable is the same as the arrow function.
      if (isArrow && current instanceof o.DeclareVarStmt && current.value?.isEquivalent(fn)) {
        return o.variable(current.name);
      }

      // Function declarations are saved as function statements
      // so we compare them directly to the passed-in function.
      if (
        !isArrow &&
        current instanceof o.DeclareFunctionStmt &&
        fn instanceof o.FunctionExpr &&
        fn.isEquivalent(current)
      ) {
        return o.variable(current.name);
      }
    }

    // Otherwise declare the function.
    const name = useUniqueName ? this.uniqueName(prefix) : prefix;
    this.statements.push(
      fn instanceof o.FunctionExpr
        ? fn.toDeclStmt(name, o.StmtModifier.Final)
        : new o.DeclareVarStmt(name, fn, o.INFERRED_TYPE, o.StmtModifier.Final, fn.sourceSpan),
    );
    return o.variable(name);
  }

  private _getLiteralFactory(
    key: string,
    values: o.Expression[],
    resultMap: (parameters: o.Expression[]) => o.Expression,
  ): {literalFactory: o.Expression; literalFactoryArguments: o.Expression[]} {
    let literalFactory = this.literalFactories.get(key);
    const literalFactoryArguments = values.filter((e) => !e.isConstant());
    if (!literalFactory) {
      const resultExpressions = values.map((e, index) =>
        e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`),
      );
      const parameters = resultExpressions
        .filter(isVariable)
        .map((e) => new o.FnParam(e.name!, o.DYNAMIC_TYPE));
      const pureFunctionDeclaration = o.arrowFn(
        parameters,
        resultMap(resultExpressions),
        o.INFERRED_TYPE,
      );
      const name = this.freshName();
      this.statements.push(
        new o.DeclareVarStmt(name, pureFunctionDeclaration, o.INFERRED_TYPE, o.StmtModifier.Final),
      );
      literalFactory = o.variable(name);
      this.literalFactories.set(key, literalFactory);
    }
    return {literalFactory, literalFactoryArguments};
  }

  /**
   * Produce a unique name in the context of this pool.
   *
   * The name might be unique among different prefixes if any of the prefixes end in
   * a digit so the prefix should be a constant string (not based on user input) and
   * must not end in a digit.
   */
  uniqueName(name: string, alwaysIncludeSuffix = true): string {
    const count = this._claimedNames.get(name) ?? 0;
    const result = count === 0 && !alwaysIncludeSuffix ? `${name}` : `${name}${count}`;

    this._claimedNames.set(name, count + 1);
    return result;
  }

  private freshName(): string {
    return this.uniqueName(CONSTANT_PREFIX);
  }
}

export interface ExpressionKeyFn {
  keyOf(expr: o.Expression): string;
}

export interface SharedConstantDefinition extends ExpressionKeyFn {
  toSharedConstantDeclaration(declName: string, keyExpr: o.Expression): o.Statement;
}

export class GenericKeyFn implements ExpressionKeyFn {
  static readonly INSTANCE = new GenericKeyFn();

  keyOf(expr: o.Expression): string {
    if (expr instanceof o.LiteralExpr && typeof expr.value === 'string') {
      return `"${expr.value}"`;
    } else if (expr instanceof o.LiteralExpr) {
      return String(expr.value);
    } else if (expr instanceof o.LiteralArrayExpr) {
      const entries: string[] = [];
      for (const entry of expr.entries) {
        entries.push(this.keyOf(entry));
      }
      return `[${entries.join(',')}]`;
    } else if (expr instanceof o.LiteralMapExpr) {
      const entries: string[] = [];
      for (const entry of expr.entries) {
        let key = entry.key;
        if (entry.quoted) {
          key = `"${key}"`;
        }
        entries.push(key + ':' + this.keyOf(entry.value));
      }
      return `{${entries.join(',')}}`;
    } else if (expr instanceof o.ExternalExpr) {
      return `import("${expr.value.moduleName}", ${expr.value.name})`;
    } else if (expr instanceof o.ReadVarExpr) {
      return `read(${expr.name})`;
    } else if (expr instanceof o.TypeofExpr) {
      return `typeof(${this.keyOf(expr.expr)})`;
    } else {
      throw new Error(
        `${this.constructor.name} does not handle expressions of type ${expr.constructor.name}`,
      );
    }
  }
}

function isVariable(e: o.Expression): e is o.ReadVarExpr {
  return e instanceof o.ReadVarExpr;
}

function isLongStringLiteral(expr: o.Expression): boolean {
  return (
    expr instanceof o.LiteralExpr &&
    typeof expr.value === 'string' &&
    expr.value.length >= POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS
  );
}
