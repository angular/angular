/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstVisitor, Binary, BindingPipe, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead, visitAstChildren} from '@angular/compiler';

import {BuiltinType, Signature, Span, Symbol, SymbolQuery, SymbolTable} from './symbols';

export interface ExpressionDiagnosticsContext { event?: boolean; }

export enum DiagnosticKind {
  Error,
  Warning,
}

export class TypeDiagnostic {
  constructor(public kind: DiagnosticKind, public message: string, public ast: AST) {}
}

// AstType calculatetype of the ast given AST element.
export class AstType implements AstVisitor {
  public diagnostics: TypeDiagnostic[];

  constructor(
      private scope: SymbolTable, private query: SymbolQuery,
      private context: ExpressionDiagnosticsContext) {}

  getType(ast: AST): Symbol { return ast.visit(this); }

  getDiagnostics(ast: AST): TypeDiagnostic[] {
    this.diagnostics = [];
    const type: Symbol = ast.visit(this);
    if (this.context.event && type.callable) {
      this.reportWarning('Unexpected callable expression. Expected a method call', ast);
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

    const leftType = this.getType(ast.left);
    const rightType = this.getType(ast.right);
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
            return this.reportError('Expected a numeric type', errorAst);
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
            return this.reportError('Expected a number type', ast.left);
          case BuiltinType.Number << 8 | BuiltinType.Boolean:
          case BuiltinType.Number << 8 | BuiltinType.Other:
            return this.reportError('Expected a number type', ast.right);
          default:
            return this.reportError('Expected operands to be a string or number type', ast);
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
            return this.reportError('Expected the operants to be of similar type or any', ast);
        }
      case '&&':
        return rightType;
      case '||':
        return this.query.getTypeUnion(leftType, rightType);
    }

    return this.reportError(`Unrecognized operator ${ast.operation}`, ast);
  }

  visitChain(ast: Chain) {
    if (this.diagnostics) {
      // If we are producing diagnostics, visit the children
      visitAstChildren(ast, this);
    }
    // The type of a chain is always undefined.
    return this.query.getBuiltinType(BuiltinType.Undefined);
  }

  visitConditional(ast: Conditional) {
    // The type of a conditional is the union of the true and false conditions.
    return this.query.getTypeUnion(this.getType(ast.trueExp), this.getType(ast.falseExp));
  }

  visitFunctionCall(ast: FunctionCall) {
    // The type of a function call is the return type of the selected signature.
    // The signature is selected based on the types of the arguments. Angular doesn't
    // support contextual typing of arguments so this is simpler than TypeScript's
    // version.
    const args = ast.args.map(arg => this.getType(arg));
    const target = this.getType(ast.target !);
    if (!target || !target.callable) return this.reportError('Call target is not callable', ast);
    const signature = target.selectSignature(args);
    if (signature) return signature.result;
    // TODO: Consider a better error message here.
    return this.reportError('Unable no compatible signature found for call', ast);
  }

  visitImplicitReceiver(ast: ImplicitReceiver): Symbol {
    const _this = this;
    // Return a pseudo-symbol for the implicit receiver.
    // The members of the implicit receiver are what is defined by the
    // scope passed into this class.
    return {
      name: '$implict',
      kind: 'component',
      language: 'ng-template',
      type: undefined,
      container: undefined,
      callable: false,
      nullable: false,
      public: true,
      definition: undefined,
      members(): SymbolTable{return _this.scope;},
      signatures(): Signature[]{return [];},
      selectSignature(types): Signature | undefined{return undefined;},
      indexed(argument): Symbol | undefined{return undefined;}
    };
  }

  visitInterpolation(ast: Interpolation): Symbol {
    // If we are producing diagnostics, visit the children.
    if (this.diagnostics) {
      visitAstChildren(ast, this);
    }
    return this.undefinedType;
  }

  visitKeyedRead(ast: KeyedRead): Symbol {
    const targetType = this.getType(ast.obj);
    const keyType = this.getType(ast.key);
    const result = targetType.indexed(keyType);
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
    if (this.diagnostics) {
      visitAstChildren(ast, this);
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
            return this.reportError('Unrecognized primitive', ast);
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
    if (!pipe) return this.reportError(`No pipe by the name ${ast.name} found`, ast);
    const expType = this.getType(ast.exp);
    const signature =
        pipe.selectSignature([expType].concat(ast.args.map(arg => this.getType(arg))));
    if (!signature) return this.reportError('Unable to resolve signature for pipe invocation', ast);
    return signature.result;
  }

  visitPrefixNot(ast: PrefixNot) {
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

  private _anyType: Symbol;
  private get anyType(): Symbol {
    let result = this._anyType;
    if (!result) {
      result = this._anyType = this.query.getBuiltinType(BuiltinType.Any);
    }
    return result;
  }

  private _undefinedType: Symbol;
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

    // The type of a method is the selected methods result type.
    const method = receiverType.members().get(ast.name);
    if (!method) return this.reportError(`Unknown method '${ast.name}'`, ast);
    if (!method.type) return this.reportError(`Could not find a type for '${ast.name}'`, ast);
    if (!method.type.callable) return this.reportError(`Member '${ast.name}' is not callable`, ast);
    const signature = method.type.selectSignature(ast.args.map(arg => this.getType(arg)));
    if (!signature)
      return this.reportError(`Unable to resolve signature for call of method ${ast.name}`, ast);
    return signature.result;
  }

  private resolvePropertyRead(receiverType: Symbol, ast: SafePropertyRead|PropertyRead) {
    if (this.isAny(receiverType)) {
      return this.anyType;
    }

    // The type of a property read is the seelcted member's type.
    const member = receiverType.members().get(ast.name);
    if (!member) {
      let receiverInfo = receiverType.name;
      if (receiverInfo == '$implict') {
        receiverInfo =
            'The component declaration, template variable declarations, and element references do';
      } else if (receiverType.nullable) {
        return this.reportError(`The expression might be null`, ast.receiver);
      } else {
        receiverInfo = `'${receiverInfo}' does`;
      }
      return this.reportError(
          `Identifier '${ast.name}' is not defined. ${receiverInfo} not contain such a member`,
          ast);
    }
    if (!member.public) {
      let receiverInfo = receiverType.name;
      if (receiverInfo == '$implict') {
        receiverInfo = 'the component';
      } else {
        receiverInfo = `'${receiverInfo}'`;
      }
      this.reportWarning(
          `Identifier '${ast.name}' refers to a private member of ${receiverInfo}`, ast);
    }
    return member.type;
  }

  private reportError(message: string, ast: AST): Symbol {
    if (this.diagnostics) {
      this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Error, message, ast));
    }
    return this.anyType;
  }

  private reportWarning(message: string, ast: AST): Symbol {
    if (this.diagnostics) {
      this.diagnostics.push(new TypeDiagnostic(DiagnosticKind.Warning, message, ast));
    }
    return this.anyType;
  }

  private isAny(symbol: Symbol): boolean {
    return !symbol || this.query.getTypeKind(symbol) == BuiltinType.Any ||
        (!!symbol.type && this.isAny(symbol.type));
  }
}