/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {Reference} from '../../imports';
import {OwningModule} from '../../imports/src/references';
import {DependencyTracker} from '../../incremental/api';
import {Declaration, DeclarationNode, FunctionDefinition, ReflectionHost} from '../../reflection';
import {isDeclaration} from '../../util/src/typescript';

import {ArrayConcatBuiltinFn, ArraySliceBuiltinFn, StringConcatBuiltinFn} from './builtin';
import {DynamicValue} from './dynamic';
import type {ForeignFunctionResolver} from './interface';
import {
  EnumValue,
  KnownFn,
  ResolvedModule,
  ResolvedValue,
  ResolvedValueArray,
  ResolvedValueMap,
} from './result';
import {SyntheticValue} from './synthetic';

/**
 * Tracks the scope of a function body, which includes `ResolvedValue`s for the parameters of that
 * body.
 */
type Scope = Map<ts.ParameterDeclaration, ResolvedValue>;

interface BinaryOperatorDef {
  literal: boolean;
  op: (a: any, b: any) => ResolvedValue;
}

function literalBinaryOp(op: (a: any, b: any) => any): BinaryOperatorDef {
  return {op, literal: true};
}

function referenceBinaryOp(op: (a: any, b: any) => any): BinaryOperatorDef {
  return {op, literal: false};
}

interface Context {
  originatingFile: ts.SourceFile;
  /**
   * The module name (if any) which was used to reach the currently resolving
   * symbols.
   */
  absoluteModuleName: string | null;

  /**
   * A file name representing the context in which the current
   * `absoluteModuleName`, if any, was resolved.
   */
  resolutionContext: string;
  scope: Scope;
  foreignFunctionResolver?: ForeignFunctionResolver;
}

export class StaticInterpreter {
  private readonly BINARY_OPERATORS = new Map<ts.SyntaxKind, BinaryOperatorDef>([
    [ts.SyntaxKind.PlusToken, literalBinaryOp((a, b) => a + b)],
    [ts.SyntaxKind.MinusToken, literalBinaryOp((a, b) => a - b)],
    [ts.SyntaxKind.AsteriskToken, literalBinaryOp((a, b) => a * b)],
    [ts.SyntaxKind.SlashToken, literalBinaryOp((a, b) => a / b)],
    [ts.SyntaxKind.PercentToken, literalBinaryOp((a, b) => a % b)],
    [ts.SyntaxKind.AmpersandToken, literalBinaryOp((a, b) => a & b)],
    [ts.SyntaxKind.BarToken, literalBinaryOp((a, b) => a | b)],
    [ts.SyntaxKind.CaretToken, literalBinaryOp((a, b) => a ^ b)],
    [ts.SyntaxKind.LessThanToken, literalBinaryOp((a, b) => a < b)],
    [ts.SyntaxKind.LessThanEqualsToken, literalBinaryOp((a, b) => a <= b)],
    [ts.SyntaxKind.GreaterThanToken, literalBinaryOp((a, b) => a > b)],
    [ts.SyntaxKind.GreaterThanEqualsToken, literalBinaryOp((a, b) => a >= b)],
    [ts.SyntaxKind.EqualsEqualsToken, literalBinaryOp((a, b) => a == b)],
    [ts.SyntaxKind.EqualsEqualsEqualsToken, literalBinaryOp((a, b) => a === b)],
    [ts.SyntaxKind.ExclamationEqualsToken, literalBinaryOp((a, b) => a != b)],
    [ts.SyntaxKind.ExclamationEqualsEqualsToken, literalBinaryOp((a, b) => a !== b)],
    [ts.SyntaxKind.LessThanLessThanToken, literalBinaryOp((a, b) => a << b)],
    [ts.SyntaxKind.GreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >> b)],
    [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >>> b)],
    [ts.SyntaxKind.AsteriskAsteriskToken, literalBinaryOp((a, b) => Math.pow(a, b))],
    [ts.SyntaxKind.AmpersandAmpersandToken, referenceBinaryOp((a, b) => a && b)],
    [ts.SyntaxKind.BarBarToken, referenceBinaryOp((a, b) => a || b)],
  ]);

  private readonly UNARY_OPERATORS = new Map<ts.SyntaxKind, (a: any) => any>([
    [ts.SyntaxKind.TildeToken, (a) => ~a],
    [ts.SyntaxKind.MinusToken, (a) => -a],
    [ts.SyntaxKind.PlusToken, (a) => +a],
    [ts.SyntaxKind.ExclamationToken, (a) => !a],
  ]);

  constructor(
    private host: ReflectionHost,
    private checker: ts.TypeChecker,
    private dependencyTracker: DependencyTracker | null,
  ) {}

  visit(node: ts.Expression, context: Context): ResolvedValue {
    return this.visitExpression(node, context);
  }

  private visitExpression(node: ts.Expression, context: Context): ResolvedValue {
    let result: ResolvedValue;
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    } else if (node.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    } else if (ts.isStringLiteral(node)) {
      return node.text;
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    } else if (ts.isTemplateExpression(node)) {
      result = this.visitTemplateExpression(node, context);
    } else if (ts.isNumericLiteral(node)) {
      return parseFloat(node.text);
    } else if (ts.isObjectLiteralExpression(node)) {
      result = this.visitObjectLiteralExpression(node, context);
    } else if (ts.isIdentifier(node)) {
      result = this.visitIdentifier(node, context);
    } else if (ts.isPropertyAccessExpression(node)) {
      result = this.visitPropertyAccessExpression(node, context);
    } else if (ts.isCallExpression(node)) {
      result = this.visitCallExpression(node, context);
    } else if (ts.isConditionalExpression(node)) {
      result = this.visitConditionalExpression(node, context);
    } else if (ts.isPrefixUnaryExpression(node)) {
      result = this.visitPrefixUnaryExpression(node, context);
    } else if (ts.isBinaryExpression(node)) {
      result = this.visitBinaryExpression(node, context);
    } else if (ts.isArrayLiteralExpression(node)) {
      result = this.visitArrayLiteralExpression(node, context);
    } else if (ts.isParenthesizedExpression(node)) {
      result = this.visitParenthesizedExpression(node, context);
    } else if (ts.isElementAccessExpression(node)) {
      result = this.visitElementAccessExpression(node, context);
    } else if (ts.isAsExpression(node)) {
      result = this.visitExpression(node.expression, context);
    } else if (ts.isNonNullExpression(node)) {
      result = this.visitExpression(node.expression, context);
    } else if (this.host.isClass(node)) {
      result = this.visitDeclaration(node, context);
    } else {
      return DynamicValue.fromUnsupportedSyntax(node);
    }
    if (result instanceof DynamicValue && result.node !== node) {
      return DynamicValue.fromDynamicInput(node, result);
    }
    return result;
  }

  private visitArrayLiteralExpression(
    node: ts.ArrayLiteralExpression,
    context: Context,
  ): ResolvedValue {
    const array: ResolvedValueArray = [];
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i];
      if (ts.isSpreadElement(element)) {
        array.push(...this.visitSpreadElement(element, context));
      } else {
        array.push(this.visitExpression(element, context));
      }
    }
    return array;
  }

  protected visitObjectLiteralExpression(
    node: ts.ObjectLiteralExpression,
    context: Context,
  ): ResolvedValue {
    const map: ResolvedValueMap = new Map<string, ResolvedValue>();
    for (let i = 0; i < node.properties.length; i++) {
      const property = node.properties[i];
      if (ts.isPropertyAssignment(property)) {
        const name = this.stringNameFromPropertyName(property.name, context);
        // Check whether the name can be determined statically.
        if (name === undefined) {
          return DynamicValue.fromDynamicInput(node, DynamicValue.fromDynamicString(property.name));
        }
        map.set(name, this.visitExpression(property.initializer, context));
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const symbol = this.checker.getShorthandAssignmentValueSymbol(property);
        if (symbol === undefined || symbol.valueDeclaration === undefined) {
          map.set(property.name.text, DynamicValue.fromUnknown(property));
        } else {
          map.set(property.name.text, this.visitDeclaration(symbol.valueDeclaration, context));
        }
      } else if (ts.isSpreadAssignment(property)) {
        const spread = this.visitExpression(property.expression, context);
        if (spread instanceof DynamicValue) {
          return DynamicValue.fromDynamicInput(node, spread);
        } else if (spread instanceof Map) {
          spread.forEach((value, key) => map.set(key, value));
        } else if (spread instanceof ResolvedModule) {
          spread.getExports().forEach((value, key) => map.set(key, value));
        } else {
          return DynamicValue.fromDynamicInput(
            node,
            DynamicValue.fromInvalidExpressionType(property, spread),
          );
        }
      } else {
        return DynamicValue.fromUnknown(node);
      }
    }
    return map;
  }

  private visitTemplateExpression(node: ts.TemplateExpression, context: Context): ResolvedValue {
    const pieces: string[] = [node.head.text];
    for (let i = 0; i < node.templateSpans.length; i++) {
      const span = node.templateSpans[i];
      const value = literal(this.visit(span.expression, context), () =>
        DynamicValue.fromDynamicString(span.expression),
      );
      if (value instanceof DynamicValue) {
        return DynamicValue.fromDynamicInput(node, value);
      }
      pieces.push(`${value}`, span.literal.text);
    }
    return pieces.join('');
  }

  private visitIdentifier(node: ts.Identifier, context: Context): ResolvedValue {
    const decl = this.host.getDeclarationOfIdentifier(node);
    if (decl === null) {
      if (ts.identifierToKeywordKind(node) === ts.SyntaxKind.UndefinedKeyword) {
        return undefined;
      } else {
        // Check if the symbol here is imported.
        if (this.dependencyTracker !== null && this.host.getImportOfIdentifier(node) !== null) {
          // It was, but no declaration for the node could be found. This means that the dependency
          // graph for the current file cannot be properly updated to account for this (broken)
          // import. Instead, the originating file is reported as failing dependency analysis,
          // ensuring that future compilations will always attempt to re-resolve the previously
          // broken identifier.
          this.dependencyTracker.recordDependencyAnalysisFailure(context.originatingFile);
        }
        return DynamicValue.fromUnknownIdentifier(node);
      }
    }
    const declContext = {...context, ...joinModuleContext(context, node, decl)};
    const result = this.visitDeclaration(decl.node, declContext);
    if (result instanceof Reference) {
      // Only record identifiers to non-synthetic references. Synthetic references may not have the
      // same value at runtime as they do at compile time, so it's not legal to refer to them by the
      // identifier here.
      if (!result.synthetic) {
        result.addIdentifier(node);
      }
    } else if (result instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, result);
    }
    return result;
  }

  private visitDeclaration(node: DeclarationNode, context: Context): ResolvedValue {
    if (this.dependencyTracker !== null) {
      this.dependencyTracker.addDependency(context.originatingFile, node.getSourceFile());
    }
    if (this.host.isClass(node)) {
      return this.getReference(node, context);
    } else if (ts.isVariableDeclaration(node)) {
      return this.visitVariableDeclaration(node, context);
    } else if (ts.isParameter(node) && context.scope.has(node)) {
      return context.scope.get(node)!;
    } else if (ts.isExportAssignment(node)) {
      return this.visitExpression(node.expression, context);
    } else if (ts.isEnumDeclaration(node)) {
      return this.visitEnumDeclaration(node, context);
    } else if (ts.isSourceFile(node)) {
      return this.visitSourceFile(node, context);
    } else if (ts.isBindingElement(node)) {
      return this.visitBindingElement(node, context);
    } else {
      return this.getReference(node, context);
    }
  }
  private visitVariableDeclaration(node: ts.VariableDeclaration, context: Context): ResolvedValue {
    const value = this.host.getVariableValue(node);
    if (value !== null) {
      return this.visitExpression(value, context);
    } else if (isVariableDeclarationDeclared(node)) {
      // If the declaration has a literal type that can be statically reduced to a value, resolve to
      // that value. If not, the historical behavior for variable declarations is to return a
      // `Reference` to the variable, as the consumer could use it in a context where knowing its
      // static value is not necessary.
      //
      // Arguably, since the value cannot be statically determined, we should return a
      // `DynamicValue`. This returns a `Reference` because it's the same behavior as before
      // `visitType` was introduced.
      //
      // TODO(zarend): investigate switching to a `DynamicValue` and verify this won't break any
      // use cases, especially in ngcc
      if (node.type !== undefined) {
        const evaluatedType = this.visitType(node.type, context);
        if (!(evaluatedType instanceof DynamicValue)) {
          return evaluatedType;
        }
      }
      return this.getReference(node, context);
    } else {
      return undefined;
    }
  }

  private visitEnumDeclaration(node: ts.EnumDeclaration, context: Context): ResolvedValue {
    const enumRef = this.getReference(node, context);
    const map = new Map<string, EnumValue>();
    node.members.forEach((member, index) => {
      const name = this.stringNameFromPropertyName(member.name, context);
      if (name !== undefined) {
        const resolved = member.initializer ? this.visit(member.initializer, context) : index;
        map.set(name, new EnumValue(enumRef, name, resolved));
      }
    });
    return map;
  }

  private visitElementAccessExpression(
    node: ts.ElementAccessExpression,
    context: Context,
  ): ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }
    const rhs = this.visitExpression(node.argumentExpression, context);
    if (rhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, rhs);
    }
    if (typeof rhs !== 'string' && typeof rhs !== 'number') {
      return DynamicValue.fromInvalidExpressionType(node, rhs);
    }

    return this.accessHelper(node, lhs, rhs, context);
  }

  private visitPropertyAccessExpression(
    node: ts.PropertyAccessExpression,
    context: Context,
  ): ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    const rhs = node.name.text;
    // TODO: handle reference to class declaration.
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }
    return this.accessHelper(node, lhs, rhs, context);
  }

  private visitSourceFile(node: ts.SourceFile, context: Context): ResolvedValue {
    const declarations = this.host.getExportsOfModule(node);
    if (declarations === null) {
      return DynamicValue.fromUnknown(node);
    }

    return new ResolvedModule(declarations, (decl) => {
      const declContext = {
        ...context,
        ...joinModuleContext(context, node, decl),
      };

      // Visit both concrete and inline declarations.
      return this.visitDeclaration(decl.node, declContext);
    });
  }

  private accessHelper(
    node: ts.Node,
    lhs: ResolvedValue,
    rhs: string | number,
    context: Context,
  ): ResolvedValue {
    const strIndex = `${rhs}`;
    if (lhs instanceof Map) {
      if (lhs.has(strIndex)) {
        return lhs.get(strIndex)!;
      } else {
        return undefined;
      }
    } else if (lhs instanceof ResolvedModule) {
      return lhs.getExport(strIndex);
    } else if (Array.isArray(lhs)) {
      if (rhs === 'length') {
        return lhs.length;
      } else if (rhs === 'slice') {
        return new ArraySliceBuiltinFn(lhs);
      } else if (rhs === 'concat') {
        return new ArrayConcatBuiltinFn(lhs);
      }
      if (typeof rhs !== 'number' || !Number.isInteger(rhs)) {
        return DynamicValue.fromInvalidExpressionType(node, rhs);
      }
      return lhs[rhs];
    } else if (typeof lhs === 'string' && rhs === 'concat') {
      return new StringConcatBuiltinFn(lhs);
    } else if (lhs instanceof Reference) {
      const ref = lhs.node;
      if (this.host.isClass(ref)) {
        const module = owningModule(context, lhs.bestGuessOwningModule);
        let value: ResolvedValue = undefined;
        const member = this.host
          .getMembersOfClass(ref)
          .find((member) => member.isStatic && member.name === strIndex);
        if (member !== undefined) {
          if (member.value !== null) {
            value = this.visitExpression(member.value, context);
          } else if (member.implementation !== null) {
            value = new Reference(member.implementation, module);
          } else if (member.node) {
            value = new Reference(member.node, module);
          }
        }
        return value;
      } else if (isDeclaration(ref)) {
        return DynamicValue.fromDynamicInput(
          node,
          DynamicValue.fromExternalReference(ref, lhs as Reference<ts.Declaration>),
        );
      }
    } else if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    } else if (lhs instanceof SyntheticValue) {
      return DynamicValue.fromSyntheticInput(node, lhs);
    }

    return DynamicValue.fromUnknown(node);
  }

  private visitCallExpression(node: ts.CallExpression, context: Context): ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    }

    // If the call refers to a builtin function, attempt to evaluate the function.
    if (lhs instanceof KnownFn) {
      return lhs.evaluate(node, this.evaluateFunctionArguments(node, context));
    }

    if (!(lhs instanceof Reference)) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }

    const fn = this.host.getDefinitionOfFunction(lhs.node);
    if (fn === null) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }

    if (!isFunctionOrMethodReference(lhs)) {
      return DynamicValue.fromInvalidExpressionType(node.expression, lhs);
    }

    const resolveFfrExpr = (expr: ts.Expression) => {
      let contextExtension: {
        absoluteModuleName?: string | null;
        resolutionContext?: string;
      } = {};

      // TODO(alxhub): the condition `fn.body === null` here is vestigial - we probably _do_ want to
      // change the context like this even for non-null function bodies. But, this is being
      // redesigned as a refactoring with no behavior changes so that should be done as a follow-up.
      if (
        fn.body === null &&
        expr.getSourceFile() !== node.expression.getSourceFile() &&
        lhs.bestGuessOwningModule !== null
      ) {
        contextExtension = {
          absoluteModuleName: lhs.bestGuessOwningModule.specifier,
          resolutionContext: lhs.bestGuessOwningModule.resolutionContext,
        };
      }

      return this.visitFfrExpression(expr, {...context, ...contextExtension});
    };

    // If the function is foreign (declared through a d.ts file), attempt to resolve it with the
    // foreignFunctionResolver, if one is specified.
    if (fn.body === null && context.foreignFunctionResolver !== undefined) {
      const unresolvable = DynamicValue.fromDynamicInput(
        node,
        DynamicValue.fromExternalReference(node.expression, lhs),
      );
      return context.foreignFunctionResolver(lhs, node, resolveFfrExpr, unresolvable);
    }

    const res: ResolvedValue = this.visitFunctionBody(node, fn, context);

    // If the result of attempting to resolve the function body was a DynamicValue, attempt to use
    // the foreignFunctionResolver if one is present. This could still potentially yield a usable
    // value.
    if (res instanceof DynamicValue && context.foreignFunctionResolver !== undefined) {
      const unresolvable = DynamicValue.fromComplexFunctionCall(node, fn);
      return context.foreignFunctionResolver(lhs, node, resolveFfrExpr, unresolvable);
    }

    return res;
  }

  /**
   * Visit an expression which was extracted from a foreign-function resolver.
   *
   * This will process the result and ensure it's correct for FFR-resolved values, including marking
   * `Reference`s as synthetic.
   */
  private visitFfrExpression(expr: ts.Expression, context: Context): ResolvedValue {
    const res = this.visitExpression(expr, context);
    if (res instanceof Reference) {
      // This Reference was created synthetically, via a foreign function resolver. The real
      // runtime value of the function expression may be different than the foreign function
      // resolved value, so mark the Reference as synthetic to avoid it being misinterpreted.
      res.synthetic = true;
    }
    return res;
  }

  private visitFunctionBody(
    node: ts.CallExpression,
    fn: FunctionDefinition,
    context: Context,
  ): ResolvedValue {
    if (fn.body === null) {
      return DynamicValue.fromUnknown(node);
    } else if (fn.body.length !== 1 || !ts.isReturnStatement(fn.body[0])) {
      return DynamicValue.fromComplexFunctionCall(node, fn);
    }
    const ret = fn.body[0] as ts.ReturnStatement;

    const args = this.evaluateFunctionArguments(node, context);
    const newScope: Scope = new Map<ts.ParameterDeclaration, ResolvedValue>();
    const calleeContext = {...context, scope: newScope};
    fn.parameters.forEach((param, index) => {
      let arg = args[index];
      if (param.node.dotDotDotToken !== undefined) {
        arg = args.slice(index);
      }
      if (arg === undefined && param.initializer !== null) {
        arg = this.visitExpression(param.initializer, calleeContext);
      }
      newScope.set(param.node, arg);
    });

    return ret.expression !== undefined
      ? this.visitExpression(ret.expression, calleeContext)
      : undefined;
  }

  private visitConditionalExpression(
    node: ts.ConditionalExpression,
    context: Context,
  ): ResolvedValue {
    const condition = this.visitExpression(node.condition, context);
    if (condition instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, condition);
    }

    if (condition) {
      return this.visitExpression(node.whenTrue, context);
    } else {
      return this.visitExpression(node.whenFalse, context);
    }
  }

  private visitPrefixUnaryExpression(
    node: ts.PrefixUnaryExpression,
    context: Context,
  ): ResolvedValue {
    const operatorKind = node.operator;
    if (!this.UNARY_OPERATORS.has(operatorKind)) {
      return DynamicValue.fromUnsupportedSyntax(node);
    }

    const op = this.UNARY_OPERATORS.get(operatorKind)!;
    const value = this.visitExpression(node.operand, context);
    if (value instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, value);
    } else {
      return op(value);
    }
  }

  private visitBinaryExpression(node: ts.BinaryExpression, context: Context): ResolvedValue {
    const tokenKind = node.operatorToken.kind;
    if (!this.BINARY_OPERATORS.has(tokenKind)) {
      return DynamicValue.fromUnsupportedSyntax(node);
    }

    const opRecord = this.BINARY_OPERATORS.get(tokenKind)!;
    let lhs: ResolvedValue, rhs: ResolvedValue;
    if (opRecord.literal) {
      lhs = literal(this.visitExpression(node.left, context), (value) =>
        DynamicValue.fromInvalidExpressionType(node.left, value),
      );
      rhs = literal(this.visitExpression(node.right, context), (value) =>
        DynamicValue.fromInvalidExpressionType(node.right, value),
      );
    } else {
      lhs = this.visitExpression(node.left, context);
      rhs = this.visitExpression(node.right, context);
    }
    if (lhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, lhs);
    } else if (rhs instanceof DynamicValue) {
      return DynamicValue.fromDynamicInput(node, rhs);
    } else {
      return opRecord.op(lhs, rhs);
    }
  }

  private visitParenthesizedExpression(
    node: ts.ParenthesizedExpression,
    context: Context,
  ): ResolvedValue {
    return this.visitExpression(node.expression, context);
  }

  private evaluateFunctionArguments(node: ts.CallExpression, context: Context): ResolvedValueArray {
    const args: ResolvedValueArray = [];
    for (const arg of node.arguments) {
      if (ts.isSpreadElement(arg)) {
        args.push(...this.visitSpreadElement(arg, context));
      } else {
        args.push(this.visitExpression(arg, context));
      }
    }
    return args;
  }

  private visitSpreadElement(node: ts.SpreadElement, context: Context): ResolvedValueArray {
    const spread = this.visitExpression(node.expression, context);
    if (spread instanceof DynamicValue) {
      return [DynamicValue.fromDynamicInput(node, spread)];
    } else if (!Array.isArray(spread)) {
      return [DynamicValue.fromInvalidExpressionType(node, spread)];
    } else {
      return spread;
    }
  }

  private visitBindingElement(node: ts.BindingElement, context: Context): ResolvedValue {
    const path: ts.BindingElement[] = [];
    let closestDeclaration: ts.Node = node;

    while (
      ts.isBindingElement(closestDeclaration) ||
      ts.isArrayBindingPattern(closestDeclaration) ||
      ts.isObjectBindingPattern(closestDeclaration)
    ) {
      if (ts.isBindingElement(closestDeclaration)) {
        path.unshift(closestDeclaration);
      }

      closestDeclaration = closestDeclaration.parent;
    }

    if (
      !ts.isVariableDeclaration(closestDeclaration) ||
      closestDeclaration.initializer === undefined
    ) {
      return DynamicValue.fromUnknown(node);
    }

    let value = this.visit(closestDeclaration.initializer, context);
    for (const element of path) {
      let key: number | string;
      if (ts.isArrayBindingPattern(element.parent)) {
        key = element.parent.elements.indexOf(element);
      } else {
        const name = element.propertyName || element.name;
        if (ts.isIdentifier(name)) {
          key = name.text;
        } else {
          return DynamicValue.fromUnknown(element);
        }
      }
      value = this.accessHelper(element, value, key, context);
      if (value instanceof DynamicValue) {
        return value;
      }
    }

    return value;
  }

  private stringNameFromPropertyName(node: ts.PropertyName, context: Context): string | undefined {
    if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
      return node.text;
    } else if (ts.isComputedPropertyName(node)) {
      const literal = this.visitExpression(node.expression, context);
      return typeof literal === 'string' ? literal : undefined;
    } else {
      return undefined;
    }
  }

  private getReference<T extends DeclarationNode>(node: T, context: Context): Reference<T> {
    return new Reference(node, owningModule(context));
  }

  private visitType(node: ts.TypeNode, context: Context): ResolvedValue {
    if (ts.isLiteralTypeNode(node)) {
      return this.visitExpression(node.literal, context);
    } else if (ts.isTupleTypeNode(node)) {
      return this.visitTupleType(node, context);
    } else if (ts.isNamedTupleMember(node)) {
      return this.visitType(node.type, context);
    } else if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword) {
      return this.visitType(node.type, context);
    } else if (ts.isTypeQueryNode(node)) {
      return this.visitTypeQuery(node, context);
    }

    return DynamicValue.fromDynamicType(node);
  }

  private visitTupleType(node: ts.TupleTypeNode, context: Context): ResolvedValueArray {
    const res: ResolvedValueArray = [];

    for (const elem of node.elements) {
      res.push(this.visitType(elem, context));
    }

    return res;
  }

  private visitTypeQuery(node: ts.TypeQueryNode, context: Context): ResolvedValue {
    if (!ts.isIdentifier(node.exprName)) {
      return DynamicValue.fromUnknown(node);
    }

    const decl = this.host.getDeclarationOfIdentifier(node.exprName);
    if (decl === null) {
      return DynamicValue.fromUnknownIdentifier(node.exprName);
    }

    const declContext: Context = {...context, ...joinModuleContext(context, node, decl)};
    return this.visitDeclaration(decl.node, declContext);
  }
}

function isFunctionOrMethodReference(
  ref: Reference<ts.Node>,
): ref is Reference<ts.FunctionDeclaration | ts.MethodDeclaration | ts.FunctionExpression> {
  return (
    ts.isFunctionDeclaration(ref.node) ||
    ts.isMethodDeclaration(ref.node) ||
    ts.isFunctionExpression(ref.node)
  );
}

function literal(
  value: ResolvedValue,
  reject: (value: ResolvedValue) => ResolvedValue,
): ResolvedValue {
  if (value instanceof EnumValue) {
    value = value.resolved;
  }
  if (
    value instanceof DynamicValue ||
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  return reject(value);
}

function isVariableDeclarationDeclared(node: ts.VariableDeclaration): boolean {
  if (node.parent === undefined || !ts.isVariableDeclarationList(node.parent)) {
    return false;
  }
  const declList = node.parent;
  if (declList.parent === undefined || !ts.isVariableStatement(declList.parent)) {
    return false;
  }
  const varStmt = declList.parent;
  const modifiers = ts.getModifiers(varStmt);
  return (
    modifiers !== undefined && modifiers.some((mod) => mod.kind === ts.SyntaxKind.DeclareKeyword)
  );
}

const EMPTY = {};

function joinModuleContext(
  existing: Context,
  node: ts.Node,
  decl: Declaration,
): {
  absoluteModuleName?: string;
  resolutionContext?: string;
} {
  if (typeof decl.viaModule === 'string' && decl.viaModule !== existing.absoluteModuleName) {
    return {
      absoluteModuleName: decl.viaModule,
      resolutionContext: node.getSourceFile().fileName,
    };
  } else {
    return EMPTY;
  }
}

function owningModule(context: Context, override: OwningModule | null = null): OwningModule | null {
  let specifier = context.absoluteModuleName;
  if (override !== null) {
    specifier = override.specifier;
  }
  if (specifier !== null) {
    return {
      specifier,
      resolutionContext: context.resolutionContext,
    };
  } else {
    return null;
  }
}
