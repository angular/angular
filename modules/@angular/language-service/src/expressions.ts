/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol, identifierName, tokenReference} from '@angular/compiler';
import {AST, ASTWithSource, AstVisitor, Binary, BindingPipe, Chain, Conditional, FunctionCall, ImplicitReceiver, Interpolation, KeyedRead, KeyedWrite, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, PrefixNot, PropertyRead, PropertyWrite, Quote, SafeMethodCall, SafePropertyRead} from '@angular/compiler/src/expression_parser/ast';
import {ElementAst, EmbeddedTemplateAst, ReferenceAst, TemplateAst, templateVisitAll} from '@angular/compiler/src/template_parser/template_ast';

import {AstPath as AstPathBase} from './ast_path';
import {TemplateInfo} from './common';
import {TemplateAstChildVisitor, TemplateAstPath} from './template_path';
import {BuiltinType, CompletionKind, Definition, DiagnosticKind, Signature, Span, Symbol, SymbolDeclaration, SymbolQuery, SymbolTable} from './types';
import {inSpan, spanOf} from './utils';

export interface ExpressionDiagnosticsContext { event?: boolean; }

export function getExpressionDiagnostics(
    scope: SymbolTable, ast: AST, query: SymbolQuery,
    context: ExpressionDiagnosticsContext = {}): TypeDiagnostic[] {
  const analyzer = new AstType(scope, query, context);
  analyzer.getDiagnostics(ast);
  return analyzer.diagnostics;
}

export function getExpressionCompletions(
    scope: SymbolTable, ast: AST, position: number, query: SymbolQuery): Symbol[] {
  const path = new AstPath(ast, position);
  if (path.empty) return undefined;
  const tail = path.tail;
  let result: SymbolTable|undefined = scope;

  function getType(ast: AST): Symbol { return new AstType(scope, query, {}).getType(ast); }

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitBinary(ast) {},
    visitChain(ast) {},
    visitConditional(ast) {},
    visitFunctionCall(ast) {},
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) { result = undefined; },
    visitKeyedRead(ast) {},
    visitKeyedWrite(ast) {},
    visitLiteralArray(ast) {},
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {},
    visitPipe(ast) {
      if (position >= ast.exp.span.end &&
          (!ast.args || !ast.args.length || position < (<AST>ast.args[0]).span.start)) {
        // We are in a position a pipe name is expected.
        result = query.getPipes();
      }
    },
    visitPrefixNot(ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitQuote(ast) {
      // For a quote, return the members of any (if there are any).
      result = query.getBuiltinType(BuiltinType.Any).members();
    },
    visitSafeMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
    visitSafePropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      result = receiverType ? receiverType.members() : scope;
    },
  });

  return result && result.values();
}

export function getExpressionSymbol(
    scope: SymbolTable, ast: AST, position: number,
    query: SymbolQuery): {symbol: Symbol, span: Span} {
  const path = new AstPath(ast, position, /* excludeEmpty */ true);
  if (path.empty) return undefined;
  const tail = path.tail;

  function getType(ast: AST): Symbol { return new AstType(scope, query, {}).getType(ast); }

  let symbol: Symbol = undefined;
  let span: Span = undefined;

  // If the completion request is in a not in a pipe or property access then the global scope
  // (that is the scope of the implicit receiver) is the right scope as the user is typing the
  // beginning of an expression.
  tail.visit({
    visitBinary(ast) {},
    visitChain(ast) {},
    visitConditional(ast) {},
    visitFunctionCall(ast) {},
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) {},
    visitKeyedRead(ast) {},
    visitKeyedWrite(ast) {},
    visitLiteralArray(ast) {},
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitPipe(ast) {
      if (position >= ast.exp.span.end &&
          (!ast.args || !ast.args.length || position < (<AST>ast.args[0]).span.start)) {
        // We are in a position a pipe name is expected.
        const pipes = query.getPipes();
        if (pipes) {
          symbol = pipes.get(ast.name);
          span = ast.span;
        }
      }
    },
    visitPrefixNot(ast) {},
    visitPropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitPropertyWrite(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitQuote(ast) {},
    visitSafeMethodCall(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
    visitSafePropertyRead(ast) {
      const receiverType = getType(ast.receiver);
      symbol = receiverType && receiverType.members().get(ast.name);
      span = ast.span;
    },
  });

  if (symbol && span) {
    return {symbol, span};
  }
}

interface ExpressionVisitor extends AstVisitor {
  visit?(ast: AST, context?: any): any;
}


// Consider moving to expression_parser/ast
class NullVisitor implements ExpressionVisitor {
  visitBinary(ast: Binary): void {}
  visitChain(ast: Chain): void {}
  visitConditional(ast: Conditional): void {}
  visitFunctionCall(ast: FunctionCall): void {}
  visitImplicitReceiver(ast: ImplicitReceiver): void {}
  visitInterpolation(ast: Interpolation): void {}
  visitKeyedRead(ast: KeyedRead): void {}
  visitKeyedWrite(ast: KeyedWrite): void {}
  visitLiteralArray(ast: LiteralArray): void {}
  visitLiteralMap(ast: LiteralMap): void {}
  visitLiteralPrimitive(ast: LiteralPrimitive): void {}
  visitMethodCall(ast: MethodCall): void {}
  visitPipe(ast: BindingPipe): void {}
  visitPrefixNot(ast: PrefixNot): void {}
  visitPropertyRead(ast: PropertyRead): void {}
  visitPropertyWrite(ast: PropertyWrite): void {}
  visitQuote(ast: Quote): void {}
  visitSafeMethodCall(ast: SafeMethodCall): void {}
  visitSafePropertyRead(ast: SafePropertyRead): void {}
}

export class TypeDiagnostic {
  constructor(public kind: DiagnosticKind, public message: string, public ast: AST) {}
}

// AstType calculatetype of the ast given AST element.
class AstType implements ExpressionVisitor {
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
      visitChildren(ast, this);
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
    const target = this.getType(ast.target);
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
      visitChildren(ast, this);
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
      visitChildren(ast, this);
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
    if (!pipe) return this.reportError(`No pipe by the name ${pipe.name} found`, ast);
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
    if (!method) return this.reportError(`Unknown method ${ast.name}`, ast);
    if (!method.type.callable) return this.reportError(`Member ${ast.name} is not callable`, ast);
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
        (symbol.type && this.isAny(symbol.type));
  }
}

class AstPath extends AstPathBase<AST> {
  constructor(ast: AST, public position: number, excludeEmpty: boolean = false) {
    super(new AstPathVisitor(position, excludeEmpty).buildPath(ast).path);
  }
}

class AstPathVisitor extends NullVisitor {
  public path: AST[] = [];

  constructor(private position: number, private excludeEmpty: boolean) { super(); }

  visit(ast: AST) {
    if ((!this.excludeEmpty || ast.span.start < ast.span.end) && inSpan(this.position, ast.span)) {
      this.path.push(ast);
      visitChildren(ast, this);
    }
  }

  buildPath(ast: AST): AstPathVisitor {
    // We never care about the ASTWithSource node and its visit() method calls its ast's visit so
    // the visit() method above would never see it.
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }
    this.visit(ast);
    return this;
  }
}

// TODO: Consider moving to expression_parser/ast
function visitChildren(ast: AST, visitor: ExpressionVisitor) {
  function visit(ast: AST) { visitor.visit && visitor.visit(ast) || ast.visit(visitor); }

  function visitAll<T extends AST>(asts: T[]) { asts.forEach(visit); }

  ast.visit({
    visitBinary(ast) {
      visit(ast.left);
      visit(ast.right);
    },
    visitChain(ast) { visitAll(ast.expressions); },
    visitConditional(ast) {
      visit(ast.condition);
      visit(ast.trueExp);
      visit(ast.falseExp);
    },
    visitFunctionCall(ast) {
      visit(ast.target);
      visitAll(ast.args);
    },
    visitImplicitReceiver(ast) {},
    visitInterpolation(ast) { visitAll(ast.expressions); },
    visitKeyedRead(ast) {
      visit(ast.obj);
      visit(ast.key);
    },
    visitKeyedWrite(ast) {
      visit(ast.obj);
      visit(ast.key);
      visit(ast.obj);
    },
    visitLiteralArray(ast) { visitAll(ast.expressions); },
    visitLiteralMap(ast) {},
    visitLiteralPrimitive(ast) {},
    visitMethodCall(ast) {
      visit(ast.receiver);
      visitAll(ast.args);
    },
    visitPipe(ast) {
      visit(ast.exp);
      visitAll(ast.args);
    },
    visitPrefixNot(ast) { visit(ast.expression); },
    visitPropertyRead(ast) { visit(ast.receiver); },
    visitPropertyWrite(ast) {
      visit(ast.receiver);
      visit(ast.value);
    },
    visitQuote(ast) {},
    visitSafeMethodCall(ast) {
      visit(ast.receiver);
      visitAll(ast.args);
    },
    visitSafePropertyRead(ast) { visit(ast.receiver); },
  });
}

export function getExpressionScope(
    info: TemplateInfo, path: TemplateAstPath, includeEvent: boolean): SymbolTable {
  let result = info.template.members;
  const references = getReferences(info);
  const variables = getVarDeclarations(info, path);
  const events = getEventDeclaration(info, path, includeEvent);
  if (references.length || variables.length || events.length) {
    const referenceTable = info.template.query.createSymbolTable(references);
    const variableTable = info.template.query.createSymbolTable(variables);
    const eventsTable = info.template.query.createSymbolTable(events);
    result =
        info.template.query.mergeSymbolTable([result, referenceTable, variableTable, eventsTable]);
  }
  return result;
}

function getEventDeclaration(info: TemplateInfo, path: TemplateAstPath, includeEvent?: boolean) {
  let result: SymbolDeclaration[] = [];
  if (includeEvent) {
    // TODO: Determine the type of the event parameter based on the Observable<T> or EventEmitter<T>
    // of the event.
    result = [{
      name: '$event',
      kind: 'variable',
      type: info.template.query.getBuiltinType(BuiltinType.Any)
    }];
  }
  return result;
}

function getReferences(info: TemplateInfo): SymbolDeclaration[] {
  const result: SymbolDeclaration[] = [];

  function processReferences(references: ReferenceAst[]) {
    for (const reference of references) {
      let type: Symbol;
      if (reference.value) {
        type = info.template.query.getTypeSymbol(tokenReference(reference.value));
      }
      result.push({
        name: reference.name,
        kind: 'reference',
        type: type || info.template.query.getBuiltinType(BuiltinType.Any),
        get definition() { return getDefintionOf(info, reference); }
      });
    }
  }

  const visitor = new class extends TemplateAstChildVisitor {
    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
      super.visitEmbeddedTemplate(ast, context);
      processReferences(ast.references);
    }
    visitElement(ast: ElementAst, context: any): any {
      super.visitElement(ast, context);
      processReferences(ast.references);
    }
  };

  templateVisitAll(visitor, info.templateAst);

  return result;
}

function getVarDeclarations(info: TemplateInfo, path: TemplateAstPath): SymbolDeclaration[] {
  const result: SymbolDeclaration[] = [];

  let current = path.tail;
  while (current) {
    if (current instanceof EmbeddedTemplateAst) {
      for (const variable of current.variables) {
        const name = variable.name;

        // Find the first directive with a context.
        const context =
            current.directives
                .map(d => info.template.query.getTemplateContext(d.directive.type.reference))
                .find(c => !!c);

        // Determine the type of the context field referenced by variable.value.
        let type: Symbol;
        if (context) {
          const value = context.get(variable.value);
          if (value) {
            type = value.type;
            if (info.template.query.getTypeKind(type) === BuiltinType.Any) {
              // The any type is not very useful here. For special cases, such as ngFor, we can do
              // better.
              type = refinedVariableType(type, info, current);
            }
          }
        }
        if (!type) {
          type = info.template.query.getBuiltinType(BuiltinType.Any);
        }
        result.push({
          name,
          kind: 'variable', type, get definition() { return getDefintionOf(info, variable); }
        });
      }
    }
    current = path.parentOf(current);
  }

  return result;
}

function refinedVariableType(
    type: Symbol, info: TemplateInfo, templateElement: EmbeddedTemplateAst): Symbol {
  // Special case the ngFor directive
  const ngForDirective =
      templateElement.directives.find(d => identifierName(d.directive.type) == 'NgFor');
  if (ngForDirective) {
    const ngForOfBinding = ngForDirective.inputs.find(i => i.directiveName == 'ngForOf');
    if (ngForOfBinding) {
      const bindingType =
          new AstType(info.template.members, info.template.query, {}).getType(ngForOfBinding.value);
      if (bindingType) {
        return info.template.query.getElementType(bindingType);
      }
    }
  }

  // We can't do better, just return the original type.
  return type;
}

function getDefintionOf(info: TemplateInfo, ast: TemplateAst): Definition {
  if (info.fileName) {
    const templateOffset = info.template.span.start;
    return [{
      fileName: info.fileName,
      span: {
        start: ast.sourceSpan.start.offset + templateOffset,
        end: ast.sourceSpan.end.offset + templateOffset
      }
    }];
  }
}