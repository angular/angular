/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {CollectorOptions} from './collector';
import {ClassMetadata, FunctionMetadata, InterfaceMetadata, isMetadataError, isMetadataGlobalReferenceExpression, isMetadataImportDefaultReference, isMetadataImportedSymbolReferenceExpression, isMetadataModuleReferenceExpression, isMetadataSymbolicReferenceExpression, isMetadataSymbolicSpreadExpression, MetadataEntry, MetadataError, MetadataImportedSymbolReferenceExpression, MetadataSourceLocationInfo, MetadataSymbolicCallExpression, MetadataValue} from './schema';
import {Symbols} from './symbols';



// In TypeScript 2.1 the spread element kind was renamed.
const spreadElementSyntaxKind: ts.SyntaxKind =
    (ts.SyntaxKind as any).SpreadElement || (ts.SyntaxKind as any).SpreadElementExpression;

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

/* @internal */
export function recordMapEntry<T extends MetadataEntry>(
    entry: T, node: ts.Node,
    nodeMap: Map<MetadataValue|ClassMetadata|InterfaceMetadata|FunctionMetadata, ts.Node>,
    sourceFile?: ts.SourceFile) {
  if (!nodeMap.has(entry)) {
    nodeMap.set(entry, node);
    if (node &&
        (isMetadataImportedSymbolReferenceExpression(entry) ||
         isMetadataImportDefaultReference(entry)) &&
        entry.line == null) {
      const info = sourceInfo(node, sourceFile);
      if (info.line != null) entry.line = info.line;
      if (info.character != null) entry.character = info.character;
    }
  }
  return entry;
}

/**
 * ts.forEachChild stops iterating children when the callback return a truthy value.
 * This method inverts this to implement an `every` style iterator. It will return
 * true if every call to `cb` returns `true`.
 */
function everyNodeChild(node: ts.Node, cb: (node: ts.Node) => boolean) {
  return !ts.forEachChild(node, node => !cb(node));
}

export function isPrimitive(value: any): boolean {
  return Object(value) !== value;
}

function isDefined(obj: any): boolean {
  return obj !== undefined;
}

// import {propertyName as name} from 'place'
// import {name} from 'place'
export interface ImportSpecifierMetadata {
  name: string;
  propertyName?: string;
}
export interface ImportMetadata {
  defaultName?: string;                      // import d from 'place'
  namespace?: string;                        // import * as d from 'place'
  namedImports?: ImportSpecifierMetadata[];  // import {a} from 'place'
  from: string;                              // from 'place'
}


function getSourceFileOfNode(node: ts.Node|undefined): ts.SourceFile {
  while (node && node.kind != ts.SyntaxKind.SourceFile) {
    node = node.parent;
  }
  return <ts.SourceFile>node;
}

/* @internal */
export function sourceInfo(
    node: ts.Node|undefined, sourceFile: ts.SourceFile|undefined): MetadataSourceLocationInfo {
  if (node) {
    sourceFile = sourceFile || getSourceFileOfNode(node);
    if (sourceFile) {
      return ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
    }
  }
  return {};
}

/* @internal */
export function errorSymbol(
    message: string, node?: ts.Node, context?: {[name: string]: string},
    sourceFile?: ts.SourceFile): MetadataError {
  const result: MetadataError = {__symbolic: 'error', message, ...sourceInfo(node, sourceFile)};
  if (context) {
    result.context = context;
  }
  return result;
}

/**
 * Produce a symbolic representation of an expression folding values into their final value when
 * possible.
 */
export class Evaluator {
  constructor(
      private symbols: Symbols, private nodeMap: Map<MetadataEntry, ts.Node>,
      private options: CollectorOptions = {},
      private recordExport?: (name: string, value: MetadataValue) => void) {}

  nameOf(node: ts.Node|undefined): string|MetadataError {
    if (node && node.kind == ts.SyntaxKind.Identifier) {
      return (<ts.Identifier>node).text;
    }
    const result = node && this.evaluateNode(node);
    if (isMetadataError(result) || typeof result === 'string') {
      return result;
    } else {
      return errorSymbol(
          'Name expected', node, {received: (node && node.getText()) || '<missing>'});
    }
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
   * - An identifier is foldable if a value can be found for its symbol in the evaluator symbol
   *   table.
   */
  public isFoldable(node: ts.Node): boolean {
    return this.isFoldableWorker(node, new Map<ts.Node, boolean>());
  }

  private isFoldableWorker(node: ts.Node|undefined, folding: Map<ts.Node, boolean>): boolean {
    if (node) {
      switch (node.kind) {
        case ts.SyntaxKind.ObjectLiteralExpression:
          return everyNodeChild(node, child => {
            if (child.kind === ts.SyntaxKind.PropertyAssignment) {
              const propertyAssignment = <ts.PropertyAssignment>child;
              return this.isFoldableWorker(propertyAssignment.initializer, folding);
            }
            return false;
          });
        case ts.SyntaxKind.ArrayLiteralExpression:
          return everyNodeChild(node, child => this.isFoldableWorker(child, folding));
        case ts.SyntaxKind.CallExpression:
          const callExpression = <ts.CallExpression>node;
          // We can fold a <array>.concat(<v>).
          if (isMethodCallOf(callExpression, 'concat') &&
              arrayOrEmpty(callExpression.arguments).length === 1) {
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
          if (isCallOf(callExpression, 'CONST_EXPR') &&
              arrayOrEmpty(callExpression.arguments).length === 1)
            return this.isFoldableWorker(callExpression.arguments[0], folding);
          return false;
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.NullKeyword:
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.TemplateHead:
        case ts.SyntaxKind.TemplateMiddle:
        case ts.SyntaxKind.TemplateTail:
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
            default:
              return false;
          }
        case ts.SyntaxKind.PropertyAccessExpression:
          const propertyAccessExpression = <ts.PropertyAccessExpression>node;
          return this.isFoldableWorker(propertyAccessExpression.expression, folding);
        case ts.SyntaxKind.ElementAccessExpression:
          const elementAccessExpression = <ts.ElementAccessExpression>node;
          return this.isFoldableWorker(elementAccessExpression.expression, folding) &&
              this.isFoldableWorker(elementAccessExpression.argumentExpression, folding);
        case ts.SyntaxKind.Identifier:
          let identifier = <ts.Identifier>node;
          let reference = this.symbols.resolve(identifier.text);
          if (reference !== undefined && isPrimitive(reference)) {
            return true;
          }
          break;
        case ts.SyntaxKind.TemplateExpression:
          const templateExpression = <ts.TemplateExpression>node;
          return templateExpression.templateSpans.every(
              span => this.isFoldableWorker(span.expression, folding));
      }
    }
    return false;
  }

  /**
   * Produce a JSON serialiable object representing `node`. The foldable values in the expression
   * tree are folded. For example, a node representing `1 + 2` is folded into `3`.
   */
  public evaluateNode(node: ts.Node, preferReference?: boolean): MetadataValue {
    const t = this;
    let error: MetadataError|undefined;

    function recordEntry(entry: MetadataValue, node: ts.Node): MetadataValue {
      if (t.options.substituteExpression) {
        const newEntry = t.options.substituteExpression(entry, node);
        if (t.recordExport && newEntry != entry && isMetadataGlobalReferenceExpression(newEntry)) {
          t.recordExport(newEntry.name, entry);
        }
        entry = newEntry;
      }
      return recordMapEntry(entry, node, t.nodeMap);
    }

    function isFoldableError(value: any): value is MetadataError {
      return !t.options.verboseInvalidExpression && isMetadataError(value);
    }

    const resolveName = (name: string, preferReference?: boolean): MetadataValue => {
      const reference = this.symbols.resolve(name, preferReference);
      if (reference === undefined) {
        // Encode as a global reference. StaticReflector will check the reference.
        return recordEntry({__symbolic: 'reference', name}, node);
      }
      if (reference && isMetadataSymbolicReferenceExpression(reference)) {
        return recordEntry({...reference}, node);
      }
      return reference;
    };

    switch (node.kind) {
      case ts.SyntaxKind.ObjectLiteralExpression:
        let obj: {[name: string]: any} = {};
        let quoted: string[] = [];
        ts.forEachChild(node, child => {
          switch (child.kind) {
            case ts.SyntaxKind.ShorthandPropertyAssignment:
            case ts.SyntaxKind.PropertyAssignment:
              const assignment = <ts.PropertyAssignment|ts.ShorthandPropertyAssignment>child;
              if (assignment.name.kind == ts.SyntaxKind.StringLiteral) {
                const name = (assignment.name as ts.StringLiteral).text;
                quoted.push(name);
              }
              const propertyName = this.nameOf(assignment.name);
              if (isFoldableError(propertyName)) {
                error = propertyName;
                return true;
              }
              const propertyValue = isPropertyAssignment(assignment) ?
                  this.evaluateNode(assignment.initializer, /* preferReference */ true) :
                  resolveName(propertyName, /* preferReference */ true);
              if (isFoldableError(propertyValue)) {
                error = propertyValue;
                return true;  // Stop the forEachChild.
              } else {
                obj[propertyName] = isPropertyAssignment(assignment) ?
                    recordEntry(propertyValue, assignment.initializer) :
                    propertyValue;
              }
          }
        });
        if (error) return error;
        if (this.options.quotedNames && quoted.length) {
          obj['$quoted$'] = quoted;
        }
        return recordEntry(obj, node);
      case ts.SyntaxKind.ArrayLiteralExpression:
        let arr: MetadataValue[] = [];
        ts.forEachChild(node, child => {
          const value = this.evaluateNode(child, /* preferReference */ true);

          // Check for error
          if (isFoldableError(value)) {
            error = value;
            return true;  // Stop the forEachChild.
          }

          // Handle spread expressions
          if (isMetadataSymbolicSpreadExpression(value)) {
            if (Array.isArray(value.expression)) {
              for (const spreadValue of value.expression) {
                arr.push(spreadValue);
              }
              return;
            }
          }

          arr.push(value);
        });
        if (error) return error;
        return recordEntry(arr, node);
      case spreadElementSyntaxKind:
        let spreadExpression = this.evaluateNode((node as any).expression);
        return recordEntry({__symbolic: 'spread', expression: spreadExpression}, node);
      case ts.SyntaxKind.CallExpression:
        const callExpression = <ts.CallExpression>node;
        if (isCallOf(callExpression, 'forwardRef') &&
            arrayOrEmpty(callExpression.arguments).length === 1) {
          const firstArgument = callExpression.arguments[0];
          if (firstArgument.kind == ts.SyntaxKind.ArrowFunction) {
            const arrowFunction = <ts.ArrowFunction>firstArgument;
            return recordEntry(this.evaluateNode(arrowFunction.body), node);
          }
        }
        const args = arrayOrEmpty(callExpression.arguments).map(arg => this.evaluateNode(arg));
        if (this.isFoldable(callExpression)) {
          if (isMethodCallOf(callExpression, 'concat')) {
            const arrayValue = <MetadataValue[]>this.evaluateNode(
                (<ts.PropertyAccessExpression>callExpression.expression).expression);
            if (isFoldableError(arrayValue)) return arrayValue;
            return arrayValue.concat(args[0]);
          }
        }
        // Always fold a CONST_EXPR even if the argument is not foldable.
        if (isCallOf(callExpression, 'CONST_EXPR') &&
            arrayOrEmpty(callExpression.arguments).length === 1) {
          return recordEntry(args[0], node);
        }
        const expression = this.evaluateNode(callExpression.expression);
        if (isFoldableError(expression)) {
          return recordEntry(expression, node);
        }
        let result: MetadataSymbolicCallExpression = {__symbolic: 'call', expression: expression};
        if (args && args.length) {
          result.arguments = args;
        }
        return recordEntry(result, node);
      case ts.SyntaxKind.NewExpression:
        const newExpression = <ts.NewExpression>node;
        const newArgs = arrayOrEmpty(newExpression.arguments).map(arg => this.evaluateNode(arg));
        const newTarget = this.evaluateNode(newExpression.expression);
        if (isMetadataError(newTarget)) {
          return recordEntry(newTarget, node);
        }
        const call: MetadataSymbolicCallExpression = {__symbolic: 'new', expression: newTarget};
        if (newArgs.length) {
          call.arguments = newArgs;
        }
        return recordEntry(call, node);
      case ts.SyntaxKind.PropertyAccessExpression: {
        const propertyAccessExpression = <ts.PropertyAccessExpression>node;
        const expression = this.evaluateNode(propertyAccessExpression.expression);
        if (isFoldableError(expression)) {
          return recordEntry(expression, node);
        }
        const member = this.nameOf(propertyAccessExpression.name);
        if (isFoldableError(member)) {
          return recordEntry(member, node);
        }
        if (expression && this.isFoldable(propertyAccessExpression.expression))
          return (<any>expression)[member];
        if (isMetadataModuleReferenceExpression(expression)) {
          // A select into a module reference and be converted into a reference to the symbol
          // in the module
          return recordEntry(
              {__symbolic: 'reference', module: expression.module, name: member}, node);
        }
        return recordEntry({__symbolic: 'select', expression, member}, node);
      }
      case ts.SyntaxKind.ElementAccessExpression: {
        const elementAccessExpression = <ts.ElementAccessExpression>node;
        const expression = this.evaluateNode(elementAccessExpression.expression);
        if (isFoldableError(expression)) {
          return recordEntry(expression, node);
        }
        if (!elementAccessExpression.argumentExpression) {
          return recordEntry(errorSymbol('Expression form not supported', node), node);
        }
        const index = this.evaluateNode(elementAccessExpression.argumentExpression);
        if (isFoldableError(expression)) {
          return recordEntry(expression, node);
        }
        if (this.isFoldable(elementAccessExpression.expression) &&
            this.isFoldable(elementAccessExpression.argumentExpression))
          return (<any>expression)[<string|number>index];
        return recordEntry({__symbolic: 'index', expression, index}, node);
      }
      case ts.SyntaxKind.Identifier:
        const identifier = <ts.Identifier>node;
        const name = identifier.text;
        return resolveName(name, preferReference);
      case ts.SyntaxKind.TypeReference:
        const typeReferenceNode = <ts.TypeReferenceNode>node;
        const typeNameNode = typeReferenceNode.typeName;
        const getReference: (typeNameNode: ts.Identifier|ts.QualifiedName) => MetadataValue =
            node => {
              if (typeNameNode.kind === ts.SyntaxKind.QualifiedName) {
                const qualifiedName = <ts.QualifiedName>node;
                const left = this.evaluateNode(qualifiedName.left);
                if (isMetadataModuleReferenceExpression(left)) {
                  return recordEntry(
                      <MetadataImportedSymbolReferenceExpression>{
                        __symbolic: 'reference',
                        module: left.module,
                        name: qualifiedName.right.text
                      },
                      node);
                }
                // Record a type reference to a declared type as a select.
                return {__symbolic: 'select', expression: left, member: qualifiedName.right.text};
              } else {
                const identifier = <ts.Identifier>typeNameNode;
                const symbol = this.symbols.resolve(identifier.text);
                if (isFoldableError(symbol) || isMetadataSymbolicReferenceExpression(symbol)) {
                  return recordEntry(symbol, node);
                }
                return recordEntry(
                    errorSymbol('Could not resolve type', node, {typeName: identifier.text}), node);
              }
            };
        const typeReference = getReference(typeNameNode);
        if (isFoldableError(typeReference)) {
          return recordEntry(typeReference, node);
        }
        if (!isMetadataModuleReferenceExpression(typeReference) &&
            typeReferenceNode.typeArguments && typeReferenceNode.typeArguments.length) {
          const args = typeReferenceNode.typeArguments.map(element => this.evaluateNode(element));
          // TODO: Remove typecast when upgraded to 2.0 as it will be correctly inferred.
          // Some versions of 1.9 do not infer this correctly.
          (<MetadataImportedSymbolReferenceExpression>typeReference).arguments = args;
        }
        return recordEntry(typeReference, node);
      case ts.SyntaxKind.UnionType:
        const unionType = <ts.UnionTypeNode>node;
        // Remove null and undefined from the list of unions.
        const references =
            unionType.types
                .filter(
                    n => n.kind !== ts.SyntaxKind.UndefinedKeyword &&
                        !(ts.isLiteralTypeNode(n) && n.literal.kind === ts.SyntaxKind.NullKeyword))
                .map(n => this.evaluateNode(n));

        // The remmaining reference must be the same. If two have type arguments consider them
        // different even if the type arguments are the same.
        let candidate: any = null;
        for (let i = 0; i < references.length; i++) {
          const reference = references[i];
          if (isMetadataSymbolicReferenceExpression(reference)) {
            if (candidate) {
              if ((reference as any).name == candidate.name &&
                  (reference as any).module == candidate.module && !(reference as any).arguments) {
                candidate = reference;
              }
            } else {
              candidate = reference;
            }
          } else {
            return reference;
          }
        }
        if (candidate) return candidate;
        break;
      case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.TemplateHead:
      case ts.SyntaxKind.TemplateTail:
      case ts.SyntaxKind.TemplateMiddle:
        return (<ts.LiteralLikeNode>node).text;
      case ts.SyntaxKind.NumericLiteral:
        return parseFloat((<ts.LiteralExpression>node).text);
      case ts.SyntaxKind.AnyKeyword:
        return recordEntry({__symbolic: 'reference', name: 'any'}, node);
      case ts.SyntaxKind.StringKeyword:
        return recordEntry({__symbolic: 'reference', name: 'string'}, node);
      case ts.SyntaxKind.NumberKeyword:
        return recordEntry({__symbolic: 'reference', name: 'number'}, node);
      case ts.SyntaxKind.BooleanKeyword:
        return recordEntry({__symbolic: 'reference', name: 'boolean'}, node);
      case ts.SyntaxKind.ArrayType:
        const arrayTypeNode = <ts.ArrayTypeNode>node;
        return recordEntry(
            {
              __symbolic: 'reference',
              name: 'Array',
              arguments: [this.evaluateNode(arrayTypeNode.elementType)]
            },
            node);
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
              return +(operand as any);
            case ts.SyntaxKind.MinusToken:
              return -(operand as any);
            case ts.SyntaxKind.TildeToken:
              return ~(operand as any);
            case ts.SyntaxKind.ExclamationToken:
              return !operand;
          }
        }
        let operatorText: '+'|'-'|'~'|'!';
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
        return recordEntry({__symbolic: 'pre', operator: operatorText, operand: operand}, node);
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
          return recordEntry(
              {
                __symbolic: 'binop',
                operator: binaryExpression.operatorToken.getText(),
                left: left,
                right: right
              },
              node);
        }
        break;
      case ts.SyntaxKind.ConditionalExpression:
        const conditionalExpression = <ts.ConditionalExpression>node;
        const condition = this.evaluateNode(conditionalExpression.condition);
        const thenExpression = this.evaluateNode(conditionalExpression.whenTrue);
        const elseExpression = this.evaluateNode(conditionalExpression.whenFalse);
        if (isPrimitive(condition)) {
          return condition ? thenExpression : elseExpression;
        }
        return recordEntry({__symbolic: 'if', condition, thenExpression, elseExpression}, node);
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.ArrowFunction:
        return recordEntry(errorSymbol('Lambda not supported', node), node);
      case ts.SyntaxKind.TaggedTemplateExpression:
        return recordEntry(
            errorSymbol('Tagged template expressions are not supported in metadata', node), node);
      case ts.SyntaxKind.TemplateExpression:
        const templateExpression = <ts.TemplateExpression>node;
        if (this.isFoldable(node)) {
          return templateExpression.templateSpans.reduce(
              (previous, current) => previous + <string>this.evaluateNode(current.expression) +
                  <string>this.evaluateNode(current.literal),
              this.evaluateNode(templateExpression.head));
        } else {
          return templateExpression.templateSpans.reduce((previous, current) => {
            const expr = this.evaluateNode(current.expression);
            const literal = this.evaluateNode(current.literal);
            if (isFoldableError(expr)) return expr;
            if (isFoldableError(literal)) return literal;
            if (typeof previous === 'string' && typeof expr === 'string' &&
                typeof literal === 'string') {
              return previous + expr + literal;
            }
            let result = expr;
            if (previous !== '') {
              result = {__symbolic: 'binop', operator: '+', left: previous, right: expr};
            }
            if (literal != '') {
              result = {__symbolic: 'binop', operator: '+', left: result, right: literal};
            }
            return result;
          }, this.evaluateNode(templateExpression.head));
        }
      case ts.SyntaxKind.AsExpression:
        const asExpression = <ts.AsExpression>node;
        return this.evaluateNode(asExpression.expression);
      case ts.SyntaxKind.ClassExpression:
        return {__symbolic: 'class'};
    }
    return recordEntry(errorSymbol('Expression form not supported', node), node);
  }
}

function isPropertyAssignment(node: ts.Node): node is ts.PropertyAssignment {
  return node.kind == ts.SyntaxKind.PropertyAssignment;
}

const empty = ts.createNodeArray<any>();

function arrayOrEmpty<T extends ts.Node>(v: ts.NodeArray<T>|undefined): ts.NodeArray<T> {
  return v || empty;
}
