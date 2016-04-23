import * as ts from 'typescript';
import {Symbols} from './symbols';

import {
  MetadataValue,
  MetadataObject,
  MetadataSymbolicCallExpression,
  MetadataSymbolicReferenceExpression
} from './schema';

// TOOD: Remove when tools directory is upgraded to support es6 target
interface Map<K, V> {
  has(k: K): boolean;
  set(k: K, v: V): void;
  get(k: K): V;
  delete (k: K): void;
}
interface MapConstructor {
  new<K, V>(): Map<K, V>;
}
declare var Map: MapConstructor;

function isMethodCallOf(callExpression: ts.CallExpression, memberName: string): boolean {
  const expression = callExpression.expression;
  if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
    const propertyAccessExpression = <ts.PropertyAccessExpression>expression;
    const name = propertyAccessExpression.name;
    if (name.kind == ts.SyntaxKind.Identifier) {
      return name.text === memberName;
    }
  }
  return false;
}

function isCallOf(callExpression: ts.CallExpression, ident: string): boolean {
  const expression = callExpression.expression;
  if (expression.kind === ts.SyntaxKind.Identifier) {
    const identifier = <ts.Identifier>expression;
    return identifier.text === ident;
  }
  return false;
}

/**
 * ts.forEachChild stops iterating children when the callback return a truthy value.
 * This method inverts this to implement an `every` style iterator. It will return
 * true if every call to `cb` returns `true`.
 */
function everyNodeChild(node: ts.Node, cb: (node: ts.Node) => boolean) {
  return !ts.forEachChild(node, node => !cb(node));
}

function isPrimitive(value: any): boolean {
  return Object(value) !== value;
}

function isDefined(obj: any): boolean {
  return obj !== undefined;
}

/**
 * Produce a symbolic representation of an expression folding values into their final value when
 * possible.
 */
export class Evaluator {
  constructor(private typeChecker: ts.TypeChecker, private symbols: Symbols,
              private moduleNameOf: (fileName: string) => string) {}

  // TODO: Determine if the first declaration is deterministic.
  private symbolFileName(symbol: ts.Symbol): string {
    if (symbol) {
      if (symbol.flags & ts.SymbolFlags.Alias) {
        symbol = this.typeChecker.getAliasedSymbol(symbol);
      }
      const declarations = symbol.getDeclarations();
      if (declarations && declarations.length > 0) {
        const sourceFile = declarations[0].getSourceFile();
        if (sourceFile) {
          return sourceFile.fileName;
        }
      }
    }
    return undefined;
  }

  private symbolReference(symbol: ts.Symbol): MetadataSymbolicReferenceExpression {
    if (symbol) {
      const name = symbol.name;
      const module = this.moduleNameOf(this.symbolFileName(symbol));
      return {__symbolic: "reference", name, module};
    }
  }

  private nodeSymbolReference(node: ts.Node): MetadataSymbolicReferenceExpression {
    return this.symbolReference(this.typeChecker.getSymbolAtLocation(node));
  }

  nameOf(node: ts.Node): string {
    if (node.kind == ts.SyntaxKind.Identifier) {
      return (<ts.Identifier>node).text;
    }
    return <string>this.evaluateNode(node);
  }

  /**
   * Returns true if the expression represented by `node` can be folded into a literal expression.
   *
   * For example, a literal is always foldable. This means that literal expressions such as `1.2`
   * `"Some value"` `true` `false` are foldable.
   *
   * - An object literal is foldable if all the properties in the literal are foldable.
   * - An array literal is foldable if all the elements are foldable.
   * - A call is foldable if it is a call to a Array.prototype.concat or a call to CONST_EXPR.
   * - A property access is foldable if the object is foldable.
   * - A array index is foldable if index expression is foldable and the array is foldable.
   * - Binary operator expressions are foldable if the left and right expressions are foldable and
   *   it is one of '+', '-', '*', '/', '%', '||', and '&&'.
   * - An identifier is foldable if a value can be found for its symbol is in the evaluator symbol
   *   table.
   */
  public isFoldable(node: ts.Node): boolean {
    return this.isFoldableWorker(node, new Map<ts.Node, boolean>());
  }

  private isFoldableWorker(node: ts.Node, folding: Map<ts.Node, boolean>): boolean {
    if (node) {
      switch (node.kind) {
        case ts.SyntaxKind.ObjectLiteralExpression:
          return everyNodeChild(node, child => {
            if (child.kind === ts.SyntaxKind.PropertyAssignment) {
              const propertyAssignment = <ts.PropertyAssignment>child;
              return this.isFoldableWorker(propertyAssignment.initializer, folding)
            }
            return false;
          });
        case ts.SyntaxKind.ArrayLiteralExpression:
          return everyNodeChild(node, child => this.isFoldableWorker(child, folding));
        case ts.SyntaxKind.CallExpression:
          const callExpression = <ts.CallExpression>node;
          // We can fold a <array>.concat(<v>).
          if (isMethodCallOf(callExpression, "concat") && callExpression.arguments.length === 1) {
            const arrayNode = (<ts.PropertyAccessExpression>callExpression.expression).expression;
            if (this.isFoldableWorker(arrayNode, folding) &&
                this.isFoldableWorker(callExpression.arguments[0], folding)) {
              // It needs to be an array.
              const arrayValue = this.evaluateNode(arrayNode);
              if (arrayValue && Array.isArray(arrayValue)) {
                return true;
              }
            }
          }
          // We can fold a call to CONST_EXPR
          if (isCallOf(callExpression, "CONST_EXPR") && callExpression.arguments.length === 1)
            return this.isFoldableWorker(callExpression.arguments[0], folding);
          return false;
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.NullKeyword:
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
          return true;
        case ts.SyntaxKind.ParenthesizedExpression:
          const parenthesizedExpression = <ts.ParenthesizedExpression>node;
          return this.isFoldableWorker(parenthesizedExpression.expression, folding);
        case ts.SyntaxKind.BinaryExpression:
          const binaryExpression = <ts.BinaryExpression>node;
          switch (binaryExpression.operatorToken.kind) {
            case ts.SyntaxKind.PlusToken:
            case ts.SyntaxKind.MinusToken:
            case ts.SyntaxKind.AsteriskToken:
            case ts.SyntaxKind.SlashToken:
            case ts.SyntaxKind.PercentToken:
            case ts.SyntaxKind.AmpersandAmpersandToken:
            case ts.SyntaxKind.BarBarToken:
              return this.isFoldableWorker(binaryExpression.left, folding) &&
                     this.isFoldableWorker(binaryExpression.right, folding);
          }
        case ts.SyntaxKind.PropertyAccessExpression:
          const propertyAccessExpression = <ts.PropertyAccessExpression>node;
          return this.isFoldableWorker(propertyAccessExpression.expression, folding);
        case ts.SyntaxKind.ElementAccessExpression:
          const elementAccessExpression = <ts.ElementAccessExpression>node;
          return this.isFoldableWorker(elementAccessExpression.expression, folding) &&
                 this.isFoldableWorker(elementAccessExpression.argumentExpression, folding);
        case ts.SyntaxKind.Identifier:
          let symbol = this.typeChecker.getSymbolAtLocation(node);
          if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = this.typeChecker.getAliasedSymbol(symbol);
          }
          if (this.symbols.has(symbol)) return true;

          // If this is a reference to a foldable variable then it is foldable too.
          const variableDeclaration = <ts.VariableDeclaration>(
              symbol.declarations && symbol.declarations.length && symbol.declarations[0]);
          if (variableDeclaration.kind === ts.SyntaxKind.VariableDeclaration) {
            const initializer = variableDeclaration.initializer;
            if (folding.has(initializer)) {
              // A recursive reference is not foldable.
              return false;
            }
            folding.set(initializer, true);
            const result = this.isFoldableWorker(initializer, folding);
            folding.delete(initializer);
            return result;
          }
          break;
      }
    }
    return false;
  }

  /**
   * Produce a JSON serialiable object representing `node`. The foldable values in the expression
   * tree are folded. For example, a node representing `1 + 2` is folded into `3`.
   */
  public evaluateNode(node: ts.Node): MetadataValue {
    switch (node.kind) {
      case ts.SyntaxKind.ObjectLiteralExpression:
        let obj: MetadataValue = {};
        let allPropertiesDefined = true;
        ts.forEachChild(node, child => {
          switch (child.kind) {
            case ts.SyntaxKind.PropertyAssignment:
              const assignment = <ts.PropertyAssignment>child;
              const propertyName = this.nameOf(assignment.name);
              const propertyValue = this.evaluateNode(assignment.initializer);
              obj[propertyName] = propertyValue;
              allPropertiesDefined = isDefined(propertyValue) && allPropertiesDefined;
          }
        });
        if (allPropertiesDefined) return obj;
        break;
      case ts.SyntaxKind.ArrayLiteralExpression:
        let arr = [];
        let allElementsDefined = true;
        ts.forEachChild(node, child => {
          const value = this.evaluateNode(child);
          arr.push(value);
          allElementsDefined = isDefined(value) && allElementsDefined;
        });
        if (allElementsDefined) return arr;
        break;
      case ts.SyntaxKind.CallExpression:
        const callExpression = <ts.CallExpression>node;
        const args = callExpression.arguments.map(arg => this.evaluateNode(arg));
        if (this.isFoldable(callExpression)) {
          if (isMethodCallOf(callExpression, "concat")) {
            const arrayValue = <MetadataValue[]>this.evaluateNode(
                (<ts.PropertyAccessExpression>callExpression.expression).expression);
            return arrayValue.concat(args[0]);
          }
        }
        // Always fold a CONST_EXPR even if the argument is not foldable.
        if (isCallOf(callExpression, "CONST_EXPR") && callExpression.arguments.length === 1) {
          return args[0];
        }
        const expression = this.evaluateNode(callExpression.expression);
        if (isDefined(expression) && args.every(isDefined)) {
          const result: MetadataSymbolicCallExpression = {
            __symbolic: "call",
            expression: this.evaluateNode(callExpression.expression)
          };
          if (args && args.length) {
            result.arguments = args;
          }
          return result;
        }
        break;
      case ts.SyntaxKind.PropertyAccessExpression: {
        const propertyAccessExpression = <ts.PropertyAccessExpression>node;
        const expression = this.evaluateNode(propertyAccessExpression.expression);
        const member = this.nameOf(propertyAccessExpression.name);
        if (this.isFoldable(propertyAccessExpression.expression)) return expression[member];
        if (isDefined(expression)) {
          return {__symbolic: "select", expression, member};
        }
        break;
      }
      case ts.SyntaxKind.ElementAccessExpression: {
        const elementAccessExpression = <ts.ElementAccessExpression>node;
        const expression = this.evaluateNode(elementAccessExpression.expression);
        const index = this.evaluateNode(elementAccessExpression.argumentExpression);
        if (this.isFoldable(elementAccessExpression.expression) &&
            this.isFoldable(elementAccessExpression.argumentExpression))
          return expression[<string | number>index];
        if (isDefined(expression) && isDefined(index)) {
          return {__symbolic: "index", expression, index};
        }
        break;
      }
      case ts.SyntaxKind.Identifier:
        let symbol = this.typeChecker.getSymbolAtLocation(node);
        if (symbol.flags & ts.SymbolFlags.Alias) {
          symbol = this.typeChecker.getAliasedSymbol(symbol);
        }
        if (this.symbols.has(symbol)) return this.symbols.get(symbol);
        if (this.isFoldable(node)) {
          // isFoldable implies, in this context, symbol declaration is a VariableDeclaration
          const variableDeclaration = <ts.VariableDeclaration>(
              symbol.declarations && symbol.declarations.length && symbol.declarations[0]);
          return this.evaluateNode(variableDeclaration.initializer);
        }
        return this.nodeSymbolReference(node);
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return (<ts.LiteralExpression>node).text;
      case ts.SyntaxKind.StringLiteral:
        return (<ts.StringLiteral>node).text;
      case ts.SyntaxKind.NumericLiteral:
        return parseFloat((<ts.LiteralExpression>node).text);
      case ts.SyntaxKind.NullKeyword:
        return null;
      case ts.SyntaxKind.TrueKeyword:
        return true;
      case ts.SyntaxKind.FalseKeyword:
        return false;
      case ts.SyntaxKind.ParenthesizedExpression:
        const parenthesizedExpression = <ts.ParenthesizedExpression>node;
        return this.evaluateNode(parenthesizedExpression.expression);
      case ts.SyntaxKind.TypeAssertionExpression:
        const typeAssertion = <ts.TypeAssertion>node;
        return this.evaluateNode(typeAssertion.expression);
      case ts.SyntaxKind.PrefixUnaryExpression:
        const prefixUnaryExpression = <ts.PrefixUnaryExpression>node;
        const operand = this.evaluateNode(prefixUnaryExpression.operand);
        if (isDefined(operand) && isPrimitive(operand)) {
          switch (prefixUnaryExpression.operator) {
            case ts.SyntaxKind.PlusToken:
              return +operand;
            case ts.SyntaxKind.MinusToken:
              return -operand;
            case ts.SyntaxKind.TildeToken:
              return ~operand;
            case ts.SyntaxKind.ExclamationToken:
              return !operand;
          }
        }
        let operatorText: string;
        switch (prefixUnaryExpression.operator) {
          case ts.SyntaxKind.PlusToken:
            operatorText = '+';
            break;
          case ts.SyntaxKind.MinusToken:
            operatorText = '-';
            break;
          case ts.SyntaxKind.TildeToken:
            operatorText = '~';
            break;
          case ts.SyntaxKind.ExclamationToken:
            operatorText = '!';
            break;
          default:
            return undefined;
        }
        return {__symbolic: "pre", operator: operatorText, operand: operand };
      case ts.SyntaxKind.BinaryExpression:
        const binaryExpression = <ts.BinaryExpression>node;
        const left = this.evaluateNode(binaryExpression.left);
        const right = this.evaluateNode(binaryExpression.right);
        if (isDefined(left) && isDefined(right)) {
          if (isPrimitive(left) && isPrimitive(right))
            switch (binaryExpression.operatorToken.kind) {
              case ts.SyntaxKind.BarBarToken:
                return <any>left || <any>right;
              case ts.SyntaxKind.AmpersandAmpersandToken:
                return <any>left && <any>right;
              case ts.SyntaxKind.AmpersandToken:
                return <any>left & <any>right;
              case ts.SyntaxKind.BarToken:
                return <any>left | <any>right;
              case ts.SyntaxKind.CaretToken:
                return <any>left ^ <any>right;
              case ts.SyntaxKind.EqualsEqualsToken:
                return <any>left == <any>right;
              case ts.SyntaxKind.ExclamationEqualsToken:
                return <any>left != <any>right;
              case ts.SyntaxKind.EqualsEqualsEqualsToken:
                return <any>left === <any>right;
              case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                return <any>left !== <any>right;
              case ts.SyntaxKind.LessThanToken:
                return <any>left < <any>right;
              case ts.SyntaxKind.GreaterThanToken:
                return <any>left > <any>right;
              case ts.SyntaxKind.LessThanEqualsToken:
                return <any>left <= <any>right;
              case ts.SyntaxKind.GreaterThanEqualsToken:
                return <any>left >= <any>right;
              case ts.SyntaxKind.LessThanLessThanToken:
                return (<any>left) << (<any>right);
              case ts.SyntaxKind.GreaterThanGreaterThanToken:
                return <any>left >> <any>right;
              case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                return <any>left >>> <any>right;
              case ts.SyntaxKind.PlusToken:
                return <any>left + <any>right;
              case ts.SyntaxKind.MinusToken:
                return <any>left - <any>right;
              case ts.SyntaxKind.AsteriskToken:
                return <any>left * <any>right;
              case ts.SyntaxKind.SlashToken:
                return <any>left / <any>right;
              case ts.SyntaxKind.PercentToken:
                return <any>left % <any>right;
            }
          return {
            __symbolic: "binop",
            operator: binaryExpression.operatorToken.getText(),
            left: left,
            right: right
          };
        }
        break;
    }
    return undefined;
  }
}
