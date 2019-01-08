/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteReference, NodeReference, Reference, ReferenceResolver, ResolvedReference} from '../../imports';
import {Declaration, ReflectionHost} from '../../reflection';

import {ArraySliceBuiltinFn} from './builtin';
import {BuiltinFn, DYNAMIC_VALUE, EnumValue, ResolvedValue, ResolvedValueArray, ResolvedValueMap, isDynamicValue} from './result';


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

const BINARY_OPERATORS = new Map<ts.SyntaxKind, BinaryOperatorDef>([
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
  [ts.SyntaxKind.LessThanLessThanToken, literalBinaryOp((a, b) => a << b)],
  [ts.SyntaxKind.GreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >> b)],
  [ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken, literalBinaryOp((a, b) => a >>> b)],
  [ts.SyntaxKind.AsteriskAsteriskToken, literalBinaryOp((a, b) => Math.pow(a, b))],
  [ts.SyntaxKind.AmpersandAmpersandToken, referenceBinaryOp((a, b) => a && b)],
  [ts.SyntaxKind.BarBarToken, referenceBinaryOp((a, b) => a || b)]
]);

const UNARY_OPERATORS = new Map<ts.SyntaxKind, (a: any) => any>([
  [ts.SyntaxKind.TildeToken, a => ~a], [ts.SyntaxKind.MinusToken, a => -a],
  [ts.SyntaxKind.PlusToken, a => +a], [ts.SyntaxKind.ExclamationToken, a => !a]
]);

interface Context {
  /**
   * The module name (if any) which was used to reach the currently resolving symbols.
   */
  absoluteModuleName: string|null;

  /**
   * A file name representing the context in which the current `absoluteModuleName`, if any, was
   * resolved.
   */
  resolutionContext: string;
  scope: Scope;
  foreignFunctionResolver?
      (ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
       args: ReadonlyArray<ts.Expression>): ts.Expression|null;
}

export class StaticInterpreter {
  constructor(
      private host: ReflectionHost, private checker: ts.TypeChecker,
      private refResolver: ReferenceResolver) {}

  visit(node: ts.Expression, context: Context): ResolvedValue {
    return this.visitExpression(node, context);
  }

  private visitExpression(node: ts.Expression, context: Context): ResolvedValue {
    if (node.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    } else if (ts.isStringLiteral(node)) {
      return node.text;
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      return node.text;
    } else if (ts.isTemplateExpression(node)) {
      return this.visitTemplateExpression(node, context);
    } else if (ts.isNumericLiteral(node)) {
      return parseFloat(node.text);
    } else if (ts.isObjectLiteralExpression(node)) {
      return this.visitObjectLiteralExpression(node, context);
    } else if (ts.isIdentifier(node)) {
      return this.visitIdentifier(node, context);
    } else if (ts.isPropertyAccessExpression(node)) {
      return this.visitPropertyAccessExpression(node, context);
    } else if (ts.isCallExpression(node)) {
      return this.visitCallExpression(node, context);
    } else if (ts.isConditionalExpression(node)) {
      return this.visitConditionalExpression(node, context);
    } else if (ts.isPrefixUnaryExpression(node)) {
      return this.visitPrefixUnaryExpression(node, context);
    } else if (ts.isBinaryExpression(node)) {
      return this.visitBinaryExpression(node, context);
    } else if (ts.isArrayLiteralExpression(node)) {
      return this.visitArrayLiteralExpression(node, context);
    } else if (ts.isParenthesizedExpression(node)) {
      return this.visitParenthesizedExpression(node, context);
    } else if (ts.isElementAccessExpression(node)) {
      return this.visitElementAccessExpression(node, context);
    } else if (ts.isAsExpression(node)) {
      return this.visitExpression(node.expression, context);
    } else if (ts.isNonNullExpression(node)) {
      return this.visitExpression(node.expression, context);
    } else if (this.host.isClass(node)) {
      return this.visitDeclaration(node, context);
    } else {
      return DYNAMIC_VALUE;
    }
  }

  private visitArrayLiteralExpression(node: ts.ArrayLiteralExpression, context: Context):
      ResolvedValue {
    const array: ResolvedValueArray = [];
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i];
      if (ts.isSpreadElement(element)) {
        const spread = this.visitExpression(element.expression, context);
        if (isDynamicValue(spread)) {
          return DYNAMIC_VALUE;
        }
        if (!Array.isArray(spread)) {
          throw new Error(`Unexpected value in spread expression: ${spread}`);
        }

        array.push(...spread);
      } else {
        const result = this.visitExpression(element, context);
        if (isDynamicValue(result)) {
          return DYNAMIC_VALUE;
        }

        array.push(result);
      }
    }
    return array;
  }

  private visitObjectLiteralExpression(node: ts.ObjectLiteralExpression, context: Context):
      ResolvedValue {
    const map: ResolvedValueMap = new Map<string, ResolvedValue>();
    for (let i = 0; i < node.properties.length; i++) {
      const property = node.properties[i];
      if (ts.isPropertyAssignment(property)) {
        const name = this.stringNameFromPropertyName(property.name, context);

        // Check whether the name can be determined statically.
        if (name === undefined) {
          return DYNAMIC_VALUE;
        }

        map.set(name, this.visitExpression(property.initializer, context));
      } else if (ts.isShorthandPropertyAssignment(property)) {
        const symbol = this.checker.getShorthandAssignmentValueSymbol(property);
        if (symbol === undefined || symbol.valueDeclaration === undefined) {
          return DYNAMIC_VALUE;
        }
        map.set(property.name.text, this.visitDeclaration(symbol.valueDeclaration, context));
      } else if (ts.isSpreadAssignment(property)) {
        const spread = this.visitExpression(property.expression, context);
        if (isDynamicValue(spread)) {
          return DYNAMIC_VALUE;
        }
        if (!(spread instanceof Map)) {
          throw new Error(`Unexpected value in spread assignment: ${spread}`);
        }
        spread.forEach((value, key) => map.set(key, value));
      } else {
        return DYNAMIC_VALUE;
      }
    }
    return map;
  }

  private visitTemplateExpression(node: ts.TemplateExpression, context: Context): ResolvedValue {
    const pieces: string[] = [node.head.text];
    for (let i = 0; i < node.templateSpans.length; i++) {
      const span = node.templateSpans[i];
      const value = this.visit(span.expression, context);
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ||
          value == null) {
        pieces.push(`${value}`);
      } else {
        return DYNAMIC_VALUE;
      }
      pieces.push(span.literal.text);
    }
    return pieces.join('');
  }

  private visitIdentifier(node: ts.Identifier, context: Context): ResolvedValue {
    const decl = this.host.getDeclarationOfIdentifier(node);
    if (decl === null) {
      return DYNAMIC_VALUE;
    }
    const result =
        this.visitDeclaration(decl.node, {...context, ...joinModuleContext(context, node, decl)});
    if (result instanceof Reference) {
      result.addIdentifier(node);
    }
    return result;
  }

  private visitDeclaration(node: ts.Declaration, context: Context): ResolvedValue {
    if (this.host.isClass(node)) {
      return this.getReference(node, context);
    } else if (ts.isVariableDeclaration(node)) {
      return this.visitVariableDeclaration(node, context);
    } else if (ts.isParameter(node) && context.scope.has(node)) {
      return context.scope.get(node) !;
    } else if (ts.isExportAssignment(node)) {
      return this.visitExpression(node.expression, context);
    } else if (ts.isEnumDeclaration(node)) {
      return this.visitEnumDeclaration(node, context);
    } else if (ts.isSourceFile(node)) {
      return this.visitSourceFile(node, context);
    } else {
      return this.getReference(node, context);
    }
  }

  private visitVariableDeclaration(node: ts.VariableDeclaration, context: Context): ResolvedValue {
    const value = this.host.getVariableValue(node);
    if (value !== null) {
      return this.visitExpression(value, context);
    } else if (isVariableDeclarationDeclared(node)) {
      return this.getReference(node, context);
    } else {
      return undefined;
    }
  }

  private visitEnumDeclaration(node: ts.EnumDeclaration, context: Context): ResolvedValue {
    const enumRef = this.getReference(node, context) as Reference<ts.EnumDeclaration>;
    const map = new Map<string, EnumValue>();
    node.members.forEach(member => {
      const name = this.stringNameFromPropertyName(member.name, context);
      if (name !== undefined) {
        const resolved = member.initializer && this.visit(member.initializer, context);
        map.set(name, new EnumValue(enumRef, name, resolved));
      }
    });
    return map;
  }

  private visitElementAccessExpression(node: ts.ElementAccessExpression, context: Context):
      ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    if (node.argumentExpression === undefined) {
      throw new Error(`Expected argument in ElementAccessExpression`);
    }
    if (isDynamicValue(lhs)) {
      return DYNAMIC_VALUE;
    }
    const rhs = this.visitExpression(node.argumentExpression, context);
    if (isDynamicValue(rhs)) {
      return DYNAMIC_VALUE;
    }
    if (typeof rhs !== 'string' && typeof rhs !== 'number') {
      throw new Error(
          `ElementAccessExpression index should be string or number, got ${typeof rhs}: ${rhs}`);
    }

    return this.accessHelper(lhs, rhs, context);
  }

  private visitPropertyAccessExpression(node: ts.PropertyAccessExpression, context: Context):
      ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    const rhs = node.name.text;
    // TODO: handle reference to class declaration.
    if (isDynamicValue(lhs)) {
      return DYNAMIC_VALUE;
    }

    return this.accessHelper(lhs, rhs, context);
  }

  private visitSourceFile(node: ts.SourceFile, context: Context): ResolvedValue {
    const declarations = this.host.getExportsOfModule(node);
    if (declarations === null) {
      return DYNAMIC_VALUE;
    }
    const map = new Map<string, ResolvedValue>();
    declarations.forEach((decl, name) => {
      const value = this.visitDeclaration(
          decl.node, {
                         ...context, ...joinModuleContext(context, node, decl),
                     });
      map.set(name, value);
    });
    return map;
  }

  private accessHelper(lhs: ResolvedValue, rhs: string|number, context: Context): ResolvedValue {
    const strIndex = `${rhs}`;
    if (lhs instanceof Map) {
      if (lhs.has(strIndex)) {
        return lhs.get(strIndex) !;
      } else {
        throw new Error(`Invalid map access: [${Array.from(lhs.keys())}] dot ${rhs}`);
      }
    } else if (Array.isArray(lhs)) {
      if (rhs === 'length') {
        return lhs.length;
      } else if (rhs === 'slice') {
        return new ArraySliceBuiltinFn(lhs);
      }
      if (typeof rhs !== 'number' || !Number.isInteger(rhs)) {
        return DYNAMIC_VALUE;
      }
      if (rhs < 0 || rhs >= lhs.length) {
        throw new Error(`Index out of bounds: ${rhs} vs ${lhs.length}`);
      }
      return lhs[rhs];
    } else if (lhs instanceof Reference) {
      const ref = lhs.node;
      if (this.host.isClass(ref)) {
        let absoluteModuleName = context.absoluteModuleName;
        if (lhs instanceof NodeReference || lhs instanceof AbsoluteReference) {
          absoluteModuleName = lhs.moduleName || absoluteModuleName;
        }
        let value: ResolvedValue = undefined;
        const member = this.host.getMembersOfClass(ref).find(
            member => member.isStatic && member.name === strIndex);
        if (member !== undefined) {
          if (member.value !== null) {
            value = this.visitExpression(member.value, context);
          } else if (member.implementation !== null) {
            value = new NodeReference(member.implementation, absoluteModuleName);
          } else if (member.node) {
            value = new NodeReference(member.node, absoluteModuleName);
          }
        }
        return value;
      }
    }
    throw new Error(`Invalid dot property access: ${lhs} dot ${rhs}`);
  }

  private visitCallExpression(node: ts.CallExpression, context: Context): ResolvedValue {
    const lhs = this.visitExpression(node.expression, context);
    if (isDynamicValue(lhs)) {
      return DYNAMIC_VALUE;
    }

    // If the call refers to a builtin function, attempt to evaluate the function.
    if (lhs instanceof BuiltinFn) {
      return lhs.evaluate(node.arguments.map(arg => this.visitExpression(arg, context)));
    }

    if (!(lhs instanceof Reference)) {
      throw new Error(`attempting to call something that is not a function: ${lhs}`);
    } else if (!isFunctionOrMethodReference(lhs)) {
      throw new Error(
          `calling something that is not a function declaration? ${ts.SyntaxKind[lhs.node.kind]} (${node.getText()})`);
    }

    const fn = this.host.getDefinitionOfFunction(lhs.node);

    // If the function is foreign (declared through a d.ts file), attempt to resolve it with the
    // foreignFunctionResolver, if one is specified.
    if (fn.body === null) {
      let expr: ts.Expression|null = null;
      if (context.foreignFunctionResolver) {
        expr = context.foreignFunctionResolver(lhs, node.arguments);
      }
      if (expr === null) {
        throw new Error(
            `could not resolve foreign function declaration: ${node.getSourceFile().fileName} ${(lhs.node.name as ts.Identifier).text}`);
      }

      // If the function is declared in a different file, resolve the foreign function expression
      // using the absolute module name of that file (if any).
      if ((lhs instanceof NodeReference || lhs instanceof AbsoluteReference) &&
          lhs.moduleName !== null) {
        context = {
          ...context,
          absoluteModuleName: lhs.moduleName,
          resolutionContext: node.getSourceFile().fileName,
        };
      }

      return this.visitExpression(expr, context);
    }

    const body = fn.body;
    if (body.length !== 1 || !ts.isReturnStatement(body[0])) {
      throw new Error('Function body must have a single return statement only.');
    }
    const ret = body[0] as ts.ReturnStatement;

    const newScope: Scope = new Map<ts.ParameterDeclaration, ResolvedValue>();
    fn.parameters.forEach((param, index) => {
      let value: ResolvedValue = undefined;
      if (index < node.arguments.length) {
        const arg = node.arguments[index];
        value = this.visitExpression(arg, context);
      }
      if (value === undefined && param.initializer !== null) {
        value = this.visitExpression(param.initializer, context);
      }
      newScope.set(param.node, value);
    });

    return ret.expression !== undefined ?
        this.visitExpression(ret.expression, {...context, scope: newScope}) :
        undefined;
  }

  private visitConditionalExpression(node: ts.ConditionalExpression, context: Context):
      ResolvedValue {
    const condition = this.visitExpression(node.condition, context);
    if (isDynamicValue(condition)) {
      return condition;
    }

    if (condition) {
      return this.visitExpression(node.whenTrue, context);
    } else {
      return this.visitExpression(node.whenFalse, context);
    }
  }

  private visitPrefixUnaryExpression(node: ts.PrefixUnaryExpression, context: Context):
      ResolvedValue {
    const operatorKind = node.operator;
    if (!UNARY_OPERATORS.has(operatorKind)) {
      throw new Error(`Unsupported prefix unary operator: ${ts.SyntaxKind[operatorKind]}`);
    }

    const op = UNARY_OPERATORS.get(operatorKind) !;
    const value = this.visitExpression(node.operand, context);
    return isDynamicValue(value) ? DYNAMIC_VALUE : op(value);
  }

  private visitBinaryExpression(node: ts.BinaryExpression, context: Context): ResolvedValue {
    const tokenKind = node.operatorToken.kind;
    if (!BINARY_OPERATORS.has(tokenKind)) {
      throw new Error(`Unsupported binary operator: ${ts.SyntaxKind[tokenKind]}`);
    }

    const opRecord = BINARY_OPERATORS.get(tokenKind) !;
    let lhs: ResolvedValue, rhs: ResolvedValue;
    if (opRecord.literal) {
      lhs = literal(this.visitExpression(node.left, context));
      rhs = literal(this.visitExpression(node.right, context));
    } else {
      lhs = this.visitExpression(node.left, context);
      rhs = this.visitExpression(node.right, context);
    }

    return isDynamicValue(lhs) || isDynamicValue(rhs) ? DYNAMIC_VALUE : opRecord.op(lhs, rhs);
  }

  private visitParenthesizedExpression(node: ts.ParenthesizedExpression, context: Context):
      ResolvedValue {
    return this.visitExpression(node.expression, context);
  }

  private stringNameFromPropertyName(node: ts.PropertyName, context: Context): string|undefined {
    if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
      return node.text;
    } else {  // ts.ComputedPropertyName
      const literal = this.visitExpression(node.expression, context);
      return typeof literal === 'string' ? literal : undefined;
    }
  }

  private getReference(node: ts.Declaration, context: Context): Reference {
    return this.refResolver.resolve(node, context.absoluteModuleName, context.resolutionContext);
  }
}

function isFunctionOrMethodReference(ref: Reference<ts.Node>):
    ref is Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression> {
  return ts.isFunctionDeclaration(ref.node) || ts.isMethodDeclaration(ref.node) ||
      ts.isFunctionExpression(ref.node);
}

function literal(value: ResolvedValue): any {
  if (value === null || value === undefined || typeof value === 'string' ||
      typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (isDynamicValue(value)) {
    return DYNAMIC_VALUE;
  }
  throw new Error(`Value ${value} is not literal and cannot be used in this context.`);
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
  return varStmt.modifiers !== undefined &&
      varStmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.DeclareKeyword);
}

const EMPTY = {};

function joinModuleContext(existing: Context, node: ts.Node, decl: Declaration): {
  absoluteModuleName?: string,
  resolutionContext?: string,
} {
  if (decl.viaModule !== null && decl.viaModule !== existing.absoluteModuleName) {
    return {
      absoluteModuleName: decl.viaModule,
      resolutionContext: node.getSourceFile().fileName,
    };
  } else {
    return EMPTY;
  }
}