/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Used to create transpiler specific AST nodes from Angular Output AST nodes in an abstract way.
 *
 * Note that the `AstFactory` makes no assumptions about the target language being generated.
 * It is up to the caller to do this - e.g. only call `createTaggedTemplate()` or pass `let`|`const`
 * to `createVariableDeclaration()` if the final JS will allow it.
 */
export interface AstFactory<TStatement, TExpression> {
  /**
   * Attach the `leadingComments` to the given `statement` node.
   *
   * @param statement the statement where the comments are to be attached.
   * @param leadingComments the comments to attach.
   */
  attachComments(statement: TStatement | TExpression, leadingComments: LeadingComment[]): void;

  /**
   * Create a literal array expression (e.g. `[expr1, expr2]`).
   *
   * @param elements a collection of the expressions to appear in each array slot.
   */
  createArrayLiteral(elements: TExpression[]): TExpression;

  /**
   * Create an assignment expression (e.g. `lhsExpr = rhsExpr`).
   *
   * @param target an expression that evaluates to the left side of the assignment.
   * @param operator binary assignment operator that will be applied.
   * @param value an expression that evaluates to the right side of the assignment.
   */
  createAssignment(target: TExpression, operator: BinaryOperator, value: TExpression): TExpression;

  /**
   * Create a binary expression (e.g. `lhs && rhs`).
   *
   * @param leftOperand an expression that will appear on the left of the operator.
   * @param operator the binary operator that will be applied.
   * @param rightOperand an expression that will appear on the right of the operator.
   */
  createBinaryExpression(
    leftOperand: TExpression,
    operator: BinaryOperator,
    rightOperand: TExpression,
  ): TExpression;

  /**
   * Create a block of statements (e.g. `{ stmt1; stmt2; }`).
   *
   * @param body an array of statements to be wrapped in a block.
   */
  createBlock(body: TStatement[]): TStatement;

  /**
   * Create an expression that is calling the `callee` with the given `args`.
   *
   * @param callee an expression that evaluates to a function to be called.
   * @param args the arguments to be passed to the call.
   * @param pure whether to mark the call as pure (having no side-effects).
   */
  createCallExpression(callee: TExpression, args: TExpression[], pure: boolean): TExpression;

  /**
   * Create a ternary expression (e.g. `testExpr ? trueExpr : falseExpr`).
   *
   * @param condition an expression that will be tested for truthiness.
   * @param thenExpression an expression that is executed if `condition` is truthy.
   * @param elseExpression an expression that is executed if `condition` is falsy.
   */
  createConditional(
    condition: TExpression,
    thenExpression: TExpression,
    elseExpression: TExpression,
  ): TExpression;

  /**
   * Create an element access (e.g. `obj[expr]`).
   *
   * @param expression an expression that evaluates to the object to be accessed.
   * @param element an expression that evaluates to the element on the object.
   */
  createElementAccess(expression: TExpression, element: TExpression): TExpression;

  /**
   * Create a statement that is simply executing the given `expression` (e.g. `x = 10;`).
   *
   * @param expression the expression to be converted to a statement.
   */
  createExpressionStatement(expression: TExpression): TStatement;

  /**
   * Create a statement that declares a function (e.g. `function foo(param1, param2) { stmt; }`).
   *
   * @param functionName the name of the function.
   * @param parameters the names of the function's parameters.
   * @param body a statement (or a block of statements) that are the body of the function.
   */
  createFunctionDeclaration(
    functionName: string,
    parameters: string[],
    body: TStatement,
  ): TStatement;

  /**
   * Create an expression that represents a function
   * (e.g. `function foo(param1, param2) { stmt; }`).
   *
   * @param functionName the name of the function.
   * @param parameters the names of the function's parameters.
   * @param body a statement (or a block of statements) that are the body of the function.
   */
  createFunctionExpression(
    functionName: string | null,
    parameters: string[],
    body: TStatement,
  ): TExpression;

  /**
   * Create an expression that represents an arrow function
   * (e.g. `(param1, param2) => body`).
   *
   * @param parameters the names of the function's parameters.
   * @param body an expression or block of statements that are the body of the function.
   */
  createArrowFunctionExpression(parameters: string[], body: TExpression | TStatement): TExpression;

  /**
   * Creates an expression that represents a dynamic import
   * (e.g. `import('./some/path')`)
   *
   * @param url the URL that should by used in the dynamic import
   */
  createDynamicImport(url: string | TExpression): TExpression;

  /**
   * Create an identifier.
   *
   * @param name the name of the identifier.
   */
  createIdentifier(name: string): TExpression;

  /**
   * Create an if statement (e.g. `if (testExpr) { trueStmt; } else { falseStmt; }`).
   *
   * @param condition an expression that will be tested for truthiness.
   * @param thenStatement a statement (or block of statements) that is executed if `condition` is
   *     truthy.
   * @param elseStatement a statement (or block of statements) that is executed if `condition` is
   *     falsy.
   */
  createIfStatement(
    condition: TExpression,
    thenStatement: TStatement,
    elseStatement: TStatement | null,
  ): TStatement;

  /**
   * Create a simple literal (e.g. `"string"`, `123`, `false`, etc).
   *
   * @param value the value of the literal.
   */
  createLiteral(value: string | number | boolean | null | undefined): TExpression;

  /**
   * Create an expression that is instantiating the `expression` as a class.
   *
   * @param expression an expression that evaluates to a constructor to be instantiated.
   * @param args the arguments to be passed to the constructor.
   */
  createNewExpression(expression: TExpression, args: TExpression[]): TExpression;

  /**
   * Create a literal object expression (e.g. `{ prop1: expr1, prop2: expr2 }`).
   *
   * @param properties the properties (key and value) to appear in the object.
   */
  createObjectLiteral(properties: ObjectLiteralProperty<TExpression>[]): TExpression;

  /**
   * Wrap an expression in parentheses.
   *
   * @param expression the expression to wrap in parentheses.
   */
  createParenthesizedExpression(expression: TExpression): TExpression;

  /**
   * Create a property access (e.g. `obj.prop`).
   *
   * @param expression an expression that evaluates to the object to be accessed.
   * @param propertyName the name of the property to access.
   */
  createPropertyAccess(expression: TExpression, propertyName: string): TExpression;

  /**
   * Create a return statement (e.g `return expr;`).
   *
   * @param expression the expression to be returned.
   */
  createReturnStatement(expression: TExpression | null): TStatement;

  /**
   * Create a tagged template literal string. E.g.
   *
   * ```
   * tag`str1${expr1}str2${expr2}str3`
   * ```
   *
   * @param tag an expression that is applied as a tag handler for this template string.
   * @param template the collection of strings and expressions that constitute an interpolated
   *     template literal.
   */
  createTaggedTemplate(tag: TExpression, template: TemplateLiteral<TExpression>): TExpression;

  /**
   * Create an untagged template literal
   *
   * ```
   * `str1${expr1}str2${expr2}str3`
   * ```
   *
   * @param template the collection of strings and expressions that constitute an interpolated
   *     template literal.
   */
  createTemplateLiteral(template: TemplateLiteral<TExpression>): TExpression;

  /**
   * Create a throw statement (e.g. `throw expr;`).
   *
   * @param expression the expression to be thrown.
   */
  createThrowStatement(expression: TExpression): TStatement;

  /**
   * Create an expression that extracts the type of an expression (e.g. `typeof expr`).
   *
   * @param expression the expression whose type we want.
   */
  createTypeOfExpression(expression: TExpression): TExpression;

  /**
   * Create an expression that evaluates an expression and returns `undefined`.
   *
   * @param expression the expression whose type we want.
   */
  createVoidExpression(expression: TExpression): TExpression;

  /**
   * Prefix the `operand` with the given `operator` (e.g. `-expr`).
   *
   * @param operator the text of the operator to apply (e.g. `+`, `-` or `!`).
   * @param operand the expression that the operator applies to.
   */
  createUnaryExpression(operator: UnaryOperator, operand: TExpression): TExpression;

  /**
   * Create an expression that declares a new variable, possibly initialized to `initializer`.
   *
   * @param variableName the name of the variable.
   * @param initializer if not `null` then this expression is assigned to the declared variable.
   * @param type whether this variable should be declared as `var`, `let` or `const`.
   */
  createVariableDeclaration(
    variableName: string,
    initializer: TExpression | null,
    type: VariableDeclarationType,
  ): TStatement;

  /**
   * Attach a source map range to the given node.
   *
   * @param node the node to which the range should be attached.
   * @param sourceMapRange the range to attach to the node, or null if there is no range to attach.
   * @returns the `node` with the `sourceMapRange` attached.
   */
  setSourceMapRange<T extends TStatement | TExpression>(
    node: T,
    sourceMapRange: SourceMapRange | null,
  ): T;
}

/**
 * The type of a variable declaration.
 */
export type VariableDeclarationType = 'const' | 'let' | 'var';

/**
 * The unary operators supported by the `AstFactory`.
 */
export type UnaryOperator = '+' | '-' | '!';

/**
 * The binary operators supported by the `AstFactory`.
 */
export type BinaryOperator =
  | '&&'
  | '>'
  | '>='
  | '&'
  | '|'
  | '/'
  | '=='
  | '==='
  | '<'
  | '<='
  | '-'
  | '%'
  | '*'
  | '**'
  | '!='
  | '!=='
  | '||'
  | '+'
  | '??'
  | 'in'
  | '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='
  | '**='
  | '&&='
  | '||='
  | '??=';

/**
 * The original location of the start or end of a node created by the `AstFactory`.
 */
export interface SourceMapLocation {
  /** 0-based character position of the location in the original source file. */
  offset: number;
  /** 0-based line index of the location in the original source file. */
  line: number;
  /** 0-based column position of the location in the original source file. */
  column: number;
}

/**
 * The original range of a node created by the `AstFactory`.
 */
export interface SourceMapRange {
  url: string;
  content: string;
  start: SourceMapLocation;
  end: SourceMapLocation;
}

/**
 * Information used by the `AstFactory` to create a property on an object literal expression.
 */
export interface ObjectLiteralProperty<TExpression> {
  propertyName: string;
  value: TExpression;
  /**
   * Whether the `propertyName` should be enclosed in quotes.
   */
  quoted: boolean;
}

/**
 * Information used by the `AstFactory` to create a template literal string (i.e. a back-ticked
 * string with interpolations).
 */
export interface TemplateLiteral<TExpression> {
  /**
   * A collection of the static string pieces of the interpolated template literal string.
   */
  elements: TemplateElement[];
  /**
   * A collection of the interpolated expressions that are interleaved between the elements.
   */
  expressions: TExpression[];
}

/**
 * Information about a static string piece of an interpolated template literal string.
 */
export interface TemplateElement {
  /** The raw string as it was found in the original source code. */
  raw: string;
  /** The parsed string, with escape codes etc processed. */
  cooked: string;
  /** The original location of this piece of the template literal string. */
  range: SourceMapRange | null;
}

/**
 * Information used by the `AstFactory` to prepend a comment to a statement that was created by the
 * `AstFactory`.
 */
export interface LeadingComment {
  toString(): string;
  multiline: boolean;
  trailingNewline: boolean;
}
