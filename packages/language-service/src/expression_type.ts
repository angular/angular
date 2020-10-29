/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstVisitor, ASTWithName, Binary, BindingPipe, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, NonNullAssert, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead, ThisReceiver, Unary} from '@angular/compiler';

import {createDiagnostic, Diagnostic} from './diagnostic_messages';
import {BuiltinType, Signature, Symbol, SymbolQuery, SymbolTable} from './symbols';
import * as ng from './types';
import {offsetSpan} from './utils';

interface ExpressionDiagnosticsContext {
  inEvent?: boolean;
}

// AstType calculatetype of the ast given AST element.
export class AstType implements AstVisitor {
  private readonly diagnostics: ng.Diagnostic[] = [];

  constructor(
      private scope: SymbolTable, private query: SymbolQuery,
      private context: ExpressionDiagnosticsContext, private source: string) {}

  getType(ast: AST): Symbol {
    return ast.visit(this);
  }

  getDiagnostics(ast: AST): ng.Diagnostic[] {
    const type: Symbol = ast.visit(this);
    if (this.context.inEvent && type.callable) {
      this.diagnostics.push(
          createDiagnostic(refinedSpan(ast), Diagnostic.callable_expression_expected_method_call));
    }
    return this.diagnostics;
  }

  visitUnary(ast: Unary): Symbol {
    // Visit the child to produce diagnostics.
    ast.expr.visit(this);

    // The unary plus and minus operator are always of type number.
    // https://github.com/Microsoft/TypeScript/blob/v1.8.10/doc/spec.md#4.18
    switch (ast.operator) {
      case '-':
      case '+':
        return this.query.getBuiltinType(BuiltinType.Number);
    }

    this.diagnostics.push(
        createDiagnostic(refinedSpan(ast), Diagnostic.unrecognized_operator, ast.operator));
    return this.anyType;
  }

  visitBinary(ast: Binary): Symbol {
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
            this.diagnostics.push(
                createDiagnostic(refinedSpan(ast), Diagnostic.expression_might_be_null));
            break;
        }
      }
      return type;
    };

    const leftType = getType(ast.left, ast.operation);
    const rightType = getType(ast.right, ast.operation);
    const leftKind = this.query.getTypeKind(leftType);
    const rightKind = this.query.getTypeKind(rightType);

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
            this.diagnostics.push(
                createDiagnostic(errorAst.span, Diagnostic.expected_a_number_type));
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
            this.diagnostics.push(
                createDiagnostic(ast.left.span, Diagnostic.expected_a_number_type));
            return this.anyType;
          case BuiltinType.Number << 8 | BuiltinType.Boolean:
          case BuiltinType.Number << 8 | BuiltinType.Other:
            this.diagnostics.push(
                createDiagnostic(ast.right.span, Diagnostic.expected_a_number_type));
            return this.anyType;
          default:
            this.diagnostics.push(
                createDiagnostic(refinedSpan(ast), Diagnostic.expected_a_string_or_number_type));
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
        if (!(leftKind & rightKind) &&
            !((leftKind | rightKind) & (BuiltinType.Null | BuiltinType.Undefined))) {
          // Two values are comparable only if
          //   - they have some type overlap, or
          //   - at least one is not defined
          this.diagnostics.push(createDiagnostic(
              refinedSpan(ast), Diagnostic.expected_operands_of_comparable_types_or_any));
        }
        return this.query.getBuiltinType(BuiltinType.Boolean);
      case '&&':
        return rightType;
      case '||':
        return this.query.getTypeUnion(leftType, rightType);
    }

    this.diagnostics.push(
        createDiagnostic(refinedSpan(ast), Diagnostic.unrecognized_operator, ast.operation));
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
    const target = this.getType(ast.target!);
    if (!target || !target.callable) {
      this.diagnostics.push(createDiagnostic(
          refinedSpan(ast), Diagnostic.call_target_not_callable, this.sourceOf(ast.target!),
          target.name));
      return this.anyType;
    }
    const signature = target.selectSignature(args);
    if (signature) {
      return signature.result;
    }
    // TODO: Consider a better error message here. See `typescript_symbols#selectSignature` for more
    // details.
    this.diagnostics.push(
        createDiagnostic(refinedSpan(ast), Diagnostic.unable_to_resolve_compatible_call_signature));
    return this.anyType;
  }

  visitImplicitReceiver(_ast: ImplicitReceiver): Symbol {
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
      members(): SymbolTable {
        return _this.scope;
      },
      signatures(): Signature[] {
        return [];
      },
      selectSignature(_types): Signature |
          undefined {
            return undefined;
          },
      indexed(_argument): Symbol |
          undefined {
            return undefined;
          },
      typeArguments(): Symbol[] |
          undefined {
            return undefined;
          },
    };
  }

  visitThisReceiver(_ast: ThisReceiver): Symbol {
    return this.visitImplicitReceiver(_ast);
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
            this.diagnostics.push(createDiagnostic(
                refinedSpan(ast), Diagnostic.unrecognized_primitive, typeof ast.value));
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
      this.diagnostics.push(createDiagnostic(refinedSpan(ast), Diagnostic.no_pipe_found, ast.name));
      return this.anyType;
    }
    const expType = this.getType(ast.exp);
    const signature =
        pipe.selectSignature([expType].concat(ast.args.map(arg => this.getType(arg))));
    if (!signature) {
      this.diagnostics.push(
          createDiagnostic(refinedSpan(ast), Diagnostic.unable_to_resolve_signature, ast.name));
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

  visitQuote(_ast: Quote) {
    // The type of a quoted expression is any.
    return this.query.getBuiltinType(BuiltinType.Any);
  }

  visitSafeMethodCall(ast: SafeMethodCall) {
    return this.resolveMethodCall(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
  }

  visitSafePropertyRead(ast: SafePropertyRead) {
    return this.resolvePropertyRead(this.query.getNonNullableType(this.getType(ast.receiver)), ast);
  }

  /**
   * Gets the source of an expession AST.
   * The AST's sourceSpan is relative to the start of the template source code, which is contained
   * at this.source.
   */
  private sourceOf(ast: AST): string {
    return this.source.substring(ast.sourceSpan.start, ast.sourceSpan.end);
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
      this.diagnostics.push(
          createDiagnostic(refinedSpan(ast), Diagnostic.could_not_resolve_type, ast.name));
      return this.anyType;
    }
    if (this.isAny(methodType)) {
      return this.anyType;
    }
    if (!methodType.callable) {
      this.diagnostics.push(
          createDiagnostic(refinedSpan(ast), Diagnostic.identifier_not_callable, ast.name));
      return this.anyType;
    }
    const signature = methodType.selectSignature(ast.args.map(arg => this.getType(arg)));
    if (!signature) {
      this.diagnostics.push(
          createDiagnostic(refinedSpan(ast), Diagnostic.unable_to_resolve_signature, ast.name));
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
        this.diagnostics.push(createDiagnostic(
            refinedSpan(ast), Diagnostic.identifier_not_defined_in_app_context, ast.name));
      } else if (receiverType.nullable && ast.receiver instanceof PropertyRead) {
        const receiver = ast.receiver.name;
        this.diagnostics.push(createDiagnostic(
            refinedSpan(ast), Diagnostic.identifier_possibly_undefined, receiver,
            `${receiver}?.${ast.name}`, `${receiver}!.${ast.name}`));
      } else {
        this.diagnostics.push(createDiagnostic(
            refinedSpan(ast), Diagnostic.identifier_not_defined_on_receiver, ast.name,
            receiverType.name));
      }
      return this.anyType;
    }
    if (!member.public) {
      const container =
          receiverType.name === '$implicit' ? 'the component' : `'${receiverType.name}'`;
      this.diagnostics.push(createDiagnostic(
          refinedSpan(ast), Diagnostic.identifier_is_private, ast.name, container));
    }
    return member.type;
  }

  private isAny(symbol: Symbol): boolean {
    return !symbol || this.query.getTypeKind(symbol) === BuiltinType.Any ||
        (!!symbol.type && this.isAny(symbol.type));
  }
}

function refinedSpan(ast: AST): ng.Span {
  // nameSpan is an absolute span, but the spans returned by the expression visitor are expected to
  // be relative to the start of the expression.
  // TODO: migrate to only using absolute spans
  const absoluteOffset = ast.sourceSpan.start - ast.span.start;
  if (ast instanceof ASTWithName) {
    return offsetSpan(ast.nameSpan, -absoluteOffset);
  }
  return offsetSpan(ast.sourceSpan, -absoluteOffset);
}
