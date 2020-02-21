/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstVisitor, Binary, BindingPipe, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead} from '@angular/compiler';
import * as ts from 'typescript';

import {BuiltinType, Signature, Symbol, SymbolQuery, SymbolTable} from './symbols';
import * as ng from './types';

export interface ExpressionDiagnosticsContext { event?: boolean; }

// AstType calculatetype of the ast given AST element.
export class AstType implements AstVisitor {
  private readonly diagnostics: ng.Diagnostic[] = [];

  constructor(
      private scope: SymbolTable, private query: SymbolQuery,
      private context: ExpressionDiagnosticsContext) {}

  getType(ast: AST): Symbol { return ast.visit(this); }

  getDiagnostics(ast: AST): ng.Diagnostic[] {
    const type: Symbol = ast.visit(this);
    if (this.context.event && type.callable) {
      this.reportDiagnostic(
          'Unexpected callable expression. Expected a method call', ast,
          ts.DiagnosticCategory.Warning);
    }
    return this.diagnostics;
  }

  visitBinary(ast: Binary): Symbol {
    // Treat undefined and null as other.
    function normalize(kind: BuiltinType, other: BuiltinType): BuiltinType {
      switch (kind) {
        case BuiltinType.Undefined:
        case BuiltinType.Null:
          return normalize(other, BuiltinType.Other);
      }
      return kind;
    }

    const getType = (ast: AST, operation: string): Symbol => {
      const type = this.getType(ast);
      if (type.nullable) {
        switch (operation) {
          case '&&':
          case '||':
          case '==':
          case '!=':
          case '===':
          case '!==':
            // Nullable allowed.
            break;
          default:
            this.reportDiagnostic(`The expression might be null`, ast);
            break;
        }
        return this.query.getNonNullableType(type);
      }
      return type;
    };

    const leftType = getType(ast.left, ast.operation);
    const rightType = getType(ast.right, ast.operation);
    const leftRawKind = this.query.getTypeKind(leftType);
    const rightRawKind = this.query.getTypeKind(rightType);
    const leftKind = normalize(leftRawKind, rightRawKind);
    const rightKind = normalize(rightRawKind, leftRawKind);

    // The following swtich implements operator typing similar to the
    // type production tables in the TypeScript specification.
    // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.19
    const operKind = leftKind << 8 | rightKind;
    switch (ast.operation) {
      case '*':
      case '/':
      case '%':
      case '-':
      case '<<':
      case '>>':
      case '>>>':
      case '&':
      case '^':
      case '|':
        switch (operKind) {
          case BuiltinType.Any << 8 | BuiltinType.Any:
          case BuiltinType.Number << 8 | BuiltinType.Any:
          case BuiltinType.Any << 8 | BuiltinType.Number:
          case BuiltinType.Number << 8 | BuiltinType.Number:
            return this.query.getBuiltinType(BuiltinType.Number);
          default:
            let errorAst = ast.left;
            switch (leftKind) {
              case BuiltinType.Any:
              case BuiltinType.Number:
                errorAst = ast.right;
                break;
            }
            this.reportDiagnostic('Expected a numeric type', errorAst);
            return this.anyType;
        }
      case '+':
        switch (operKind) {
          case BuiltinType.Any << 8 | BuiltinType.Any:
          case BuiltinType.Any << 8 | BuiltinType.Boolean:
          case BuiltinType.Any << 8 | BuiltinType.Number:
          case BuiltinType.Any << 8 | BuiltinType.Other:
          case BuiltinType.Boolean << 8 | BuiltinType.Any:
          case BuiltinType.Number << 8 | BuiltinType.Any:
          case BuiltinType.Other << 8 | BuiltinType.Any:
            return this.anyType;
          case BuiltinType.Any << 8 | BuiltinType.String:
          case BuiltinType.Boolean << 8 | BuiltinType.String:
          case BuiltinType.Number << 8 | BuiltinType.String:
          case BuiltinType.String << 8 | BuiltinType.Any:
          case BuiltinType.String << 8 | BuiltinType.Boolean:
          case BuiltinType.String << 8 | BuiltinType.Number:
          case BuiltinType.String << 8 | BuiltinType.String:
          case BuiltinType.String << 8 | BuiltinType.Other:
          case BuiltinType.Other << 8 | BuiltinType.String:
            return this.query.getBuiltinType(BuiltinType.String);
          case BuiltinType.Number << 8 | BuiltinType.Number:
            return this.query.getBuiltinType(BuiltinType.Number);
          case BuiltinType.Boolean << 8 | BuiltinType.Number:
          case BuiltinType.Other << 8 | BuiltinType.Number:
            this.reportDiagnostic('Expected a number type', ast.left);
            return this.anyType;
          case BuiltinType.Number << 8 | BuiltinType.Boolean:
          case BuiltinType.Number << 8 | BuiltinType.Other:
            this.reportDiagnostic('Expected a number type', ast.right);
            return this.anyType;
          default:
            this.reportDiagnostic('Expected operands to be a string or number type', ast);
            return this.anyType;
        }
      case '>':
      case '<':
      case '<=':
      case '>=':
      case '==':
      case '!=':
      case '===':
      case '!==':
        switch (operKind) {
          case BuiltinType.Any << 8 | BuiltinType.Any:
          case BuiltinType.Any << 8 | BuiltinType.Boolean:
          case BuiltinType.Any << 8 | BuiltinType.Number:
          case BuiltinType.Any << 8 | BuiltinType.String:
          case BuiltinType.Any << 8 | BuiltinType.Other:
          case BuiltinType.Boolean << 8 | BuiltinType.Any:
          case BuiltinType.Boolean << 8 | BuiltinType.Boolean:
          case BuiltinType.Number << 8 | BuiltinType.Any:
          case BuiltinType.Number << 8 | BuiltinType.Number:
          case BuiltinType.String << 8 | BuiltinType.Any:
          case BuiltinType.String << 8 | BuiltinType.String:
          case BuiltinType.Other << 8 | BuiltinType.Any:
          case BuiltinType.Other << 8 | BuiltinType.Other:
            return this.query.getBuiltinType(BuiltinType.Boolean);
          default:
            this.reportDiagnostic('Expected the operants to be of similar type or any', ast);
            return this.anyType;
        }
      case '&&':
        return rightType;
      case '||':
        return this.query.getTypeUnion(leftType, rightType);
    }

    this.reportDiagnostic(`Unrecognized operator ${ast.operation}`, ast);
    return this.anyType;
  }

  visitChain(ast: Chain) {
    // If we are producing diagnostics, visit the children
    for (const expr of ast.expressions) {
      expr.visit(this);
    }
    // The type of a chain is always undefined.
    return this.query.getBuiltinType(BuiltinType.Undefined);
  }

  visitConditional(ast: Conditional) {
    // The type of a conditional is the union of the true and false conditions.
    ast.condition.visit(this);
    ast.trueExp.visit(this);
    ast.falseExp.visit(this);
    return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
  }

  visitFunctionCall(ast: FunctionCall) {
    // The type of a function call is the return type of the selected signature.
    // The signature is selected based on the types of the arguments. Angular doesn't
    // support contextual typing of arguments so this is simpler than TypeScript's
    // version.
    const args = ast.args.map(arg => this.getType(arg));
    const target = this.getType(ast.target !);
    if (!target || !target.callable) {
      this.reportDiagnostic('Call target is not callable', ast);
      return this.anyType;
    }
    const signature = target.selectSignature(args);
    if (signature) {
      return signature.result;
    }
    // TODO: Consider a better error message here.
    this.reportDiagnostic('Unable no compatible signature found for call', ast);
    return this.anyType;
  }

  visitImplicitReceiver(ast: ImplicitReceiver): Symbol {
    const _this = this;
    // Return a pseudo-symbol for the implicit receiver.
    // The members of the implicit receiver are what is defined by the
    // scope passed into this class.
    return {
      name: '$implicit',
      kind: 'component',
      language: 'ng-template',
      type: undefined,
      container: undefined,
      callable: false,
      nullable: false,
      public: true,
      definition: undefined,
      documentation: [],
      members(): SymbolTable{return _this.scope;},
      signatures(): Signature[]{return [];},
      selectSignature(types): Signature | undefined{return undefined;},
      indexed(argument): Symbol | undefined{return undefined;},
      typeArguments(): Symbol[] | undefined{return undefined;},
    };
  }

  visitInterpolation(ast: Interpolation): Symbol {
    // If we are producing diagnostics, visit the children.
    for (const expr of ast.expressions) {
      expr.visit(this);
    }
    return this.undefinedType;
  }

  visitKeyedRead(ast: KeyedRead): Symbol {
    const targetType = this.getType(ast.obj);
    const keyType = this.getType(ast.key);
    const result = targetType.indexed(
        keyType, ast.key instanceof LiteralPrimitive ? ast.key.value : undefined);
    return result || this.anyType;
  }

  visitKeyedWrite(ast: KeyedWrite): Symbol {
    // The write of a type is the type of the value being written.
    return this.getType(ast.value);
  }

  visitLiteralArray(ast: LiteralArray): Symbol {
    // A type literal is an array type of the union of the elements
    return this.query.getArrayType(
        this.query.getTypeUnion(...ast.expressions.map(element => this.getType(element))));
  }

  visitLiteralMap(ast: LiteralMap): Symbol {
    // If we are producing diagnostics, visit the children
    for (const value of ast.values) {
      value.visit(this);
    }
    // TODO: Return a composite type.
    return this.anyType;
  }

  visitLiteralPrimitive(ast: LiteralPrimitive) {
    // The type of a literal primitive depends on the value of the literal.
    switch (ast.value) {
      case true:
      case false:
        return this.query.getBuiltinType(BuiltinType.Boolean);
      case null:
        return this.query.getBuiltinType(BuiltinType.Null);
      case undefined:
        return this.query.getBuiltinType(BuiltinType.Undefined);
      default:
        switch (typeof ast.value) {
          case 'string':
            return this.query.getBuiltinType(BuiltinType.String);
          case 'number':
            return this.query.getBuiltinType(BuiltinType.Number);
          default:
            this.reportDiagnostic('Unrecognized primitive', ast);
            return this.anyType;
        }
    }
  }

  visitMethodCall(ast: MethodCall) {
    return this.resolveMethodCall(this.getType(ast.receiver), ast);
  }

  visitPipe(ast: BindingPipe) {
    // The type of a pipe node is the return type of the pipe's transform method. The table returned
    // by getPipes() is expected to contain symbols with the corresponding transform method type.
    const pipe = this.query.getPipes().get(ast.name);
    if (!pipe) {
      this.reportDiagnostic(`No pipe by the name ${ast.name} found`, ast);
      return this.anyType;
    }
    const expType = this.getType(ast.exp);
    const signature =
        pipe.selectSignature([expType].concat(ast.args.map(arg => this.getType(arg))));
    if (!signature) {
      this.reportDiagnostic('Unable to resolve signature for pipe invocation', ast);
      return this.anyType;
    }
    return signature.result;
  }

  visitPrefixNot(ast: PrefixNot) {
    // If we are producing diagnostics, visit the children
    ast.expression.visit(this);
    // The type of a prefix ! is always boolean.
    return this.query.getBuiltinType(BuiltinType.Boolean);
  }

  visitNonNullAssert(ast: NonNullAssert) {
    const expressionType = this.getType(ast.expression);
    return this.query.getNonNullableType(expressionType);
  }

  visitPropertyRead(ast: PropertyRead) {
    return this.resolvePropertyRead(this.getType(ast.receiver), ast);
  }

  visitPropertyWrite(ast: PropertyWrite) {
    // The type of a write is the type of the value being written.
    return this.getType(ast.value);
  }

  visitQuote(ast: Quote) {
    // The type of a quoted expression is any.
    return this.query.getBuiltinType(BuiltinType.Any);
  }

  visitSafeMethodCall(ast: SafeMethodCall) {
    return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
  }

  visitSafePropertyRead(ast: SafePropertyRead) {
    return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
  }

  private _anyType: Symbol|undefined;
  private get anyType(): Symbol {
    let result = this._anyType;
    if (!result) {
      result = this._anyType = this.query.getBuiltinType(BuiltinType.Any);
    }
    return result;
  }

  private _undefinedType: Symbol|undefined;
  private get undefinedType(): Symbol {
    let result = this._undefinedType;
    if (!result) {
      result = this._undefinedType = this.query.getBuiltinType(BuiltinType.Undefined);
    }
    return result;
  }

  private resolveMethodCall(receiverType: Symbol, ast: SafeMethodCall|MethodCall) {
    if (this.isAny(receiverType)) {
      return this.anyType;
    }
    const methodType = this.resolvePropertyRead(receiverType, ast);
    if (!methodType) {
      this.reportDiagnostic(`Could not find a type for '${ast.name}'`, ast);
      return this.anyType;
    }
    if (this.isAny(methodType)) {
      return this.anyType;
    }
    if (!methodType.callable) {
      this.reportDiagnostic(`Member '${ast.name}' is not callable`, ast);
      return this.anyType;
    }
    const signature = methodType.selectSignature(ast.args.map(arg => this.getType(arg)));
    if (!signature) {
      this.reportDiagnostic(`Unable to resolve signature for call of method ${ast.name}`, ast);
      return this.anyType;
    }
    return signature.result;
  }

  private resolvePropertyRead(receiverType: Symbol, ast: SafePropertyRead|PropertyRead) {
    if (this.isAny(receiverType)) {
      return this.anyType;
    }
    // The type of a property read is the seelcted member's type.
    const member = receiverType.members().get(ast.name);
    if (!member) {
      if (receiverType.name === '$implicit') {
        this.reportDiagnostic(
            `Identifier '${ast.name}' is not defined. ` +
                `The component declaration, template variable declarations, and element references do not contain such a member`,
            ast);
      } else if (receiverType.nullable && ast.receiver instanceof PropertyRead) {
        const receiver = ast.receiver.name;
        this.reportDiagnostic(
            `'${receiver}' is possibly undefined. Consider using the safe navigation operator (${receiver}?.${ast.name}) ` +
                `or non-null assertion operator (${receiver}!.${ast.name}).`,
            ast, ts.DiagnosticCategory.Suggestion);
      } else {
        this.reportDiagnostic(
            `Identifier '${ast.name}' is not defined. '${receiverType.name}' does not contain such a member`,
            ast);
      }
      return this.anyType;
    }
    if (!member.public) {
      this.reportDiagnostic(
          `Identifier '${ast.name}' refers to a private member of ${receiverType.name === '$implicit' ? 'the component' : `
      '${receiverType.name}'
          `}`,
          ast, ts.DiagnosticCategory.Warning);
    }
    return member.type;
  }

  private reportDiagnostic(message: string, ast: AST, kind = ts.DiagnosticCategory.Error) {
    this.diagnostics.push({kind, span: ast.span, message});
  }

  private isAny(symbol: Symbol): boolean {
    return !symbol || this.query.getTypeKind(symbol) === BuiltinType.Any ||
        (!!symbol.type && this.isAny(symbol.type));
  }
}
