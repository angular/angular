/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ArrayType, AssertNotNull, BinaryOperatorExpr, BuiltinType, BuiltinTypeName, CastExpr, CommaExpr, ConditionalExpr, Expression, ExpressionType, ExpressionVisitor, ExternalExpr, FunctionExpr, InstantiateExpr, InvokeFunctionExpr, InvokeMethodExpr, LiteralArrayExpr, LiteralExpr, LiteralMapExpr, LocalizedString, MapType, NotExpr, ReadKeyExpr, ReadPropExpr, ReadVarExpr, Type, TypeofExpr, TypeVisitor, UnaryOperatorExpr, WrappedNodeExpr, WriteKeyExpr, WritePropExpr, WriteVarExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {Context} from './context';
import {ImportManager} from './import_manager';


export function translateType(type: Type, imports: ImportManager): ts.TypeNode {
  return type.visitType(new TypeTranslatorVisitor(imports), new Context(false));
}

export class TypeTranslatorVisitor implements ExpressionVisitor, TypeVisitor {
  constructor(private imports: ImportManager) {}

  visitBuiltinType(type: BuiltinType, context: Context): ts.KeywordTypeNode {
    switch (type.name) {
      case BuiltinTypeName.Bool:
        return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case BuiltinTypeName.Dynamic:
        return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
      case BuiltinTypeName.Int:
      case BuiltinTypeName.Number:
        return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case BuiltinTypeName.String:
        return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case BuiltinTypeName.None:
        return ts.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
      default:
        throw new Error(`Unsupported builtin type: ${BuiltinTypeName[type.name]}`);
    }
  }

  visitExpressionType(type: ExpressionType, context: Context): ts.TypeNode {
    const typeNode = this.translateExpression(type.value, context);
    if (type.typeParams === null) {
      return typeNode;
    }

    if (!ts.isTypeReferenceNode(typeNode)) {
      throw new Error(
          'An ExpressionType with type arguments must translate into a TypeReferenceNode');
    } else if (typeNode.typeArguments !== undefined) {
      throw new Error(
          `An ExpressionType with type arguments cannot have multiple levels of type arguments`);
    }

    const typeArgs = type.typeParams.map(param => this.translateType(param, context));
    return ts.createTypeReferenceNode(typeNode.typeName, typeArgs);
  }

  visitArrayType(type: ArrayType, context: Context): ts.ArrayTypeNode {
    return ts.createArrayTypeNode(this.translateType(type.of, context));
  }

  visitMapType(type: MapType, context: Context): ts.TypeLiteralNode {
    const parameter = ts.createParameter(
        undefined, undefined, undefined, 'key', undefined,
        ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
    const typeArgs = type.valueType !== null ?
        this.translateType(type.valueType, context) :
        ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    const indexSignature = ts.createIndexSignature(undefined, undefined, [parameter], typeArgs);
    return ts.createTypeLiteralNode([indexSignature]);
  }

  visitReadVarExpr(ast: ReadVarExpr, context: Context): ts.TypeQueryNode {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts.createTypeQueryNode(ts.createIdentifier(ast.name));
  }

  visitWriteVarExpr(expr: WriteVarExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWriteKeyExpr(expr: WriteKeyExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: WritePropExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeMethodExpr(ast: InvokeMethodExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeFunctionExpr(ast: InvokeFunctionExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInstantiateExpr(ast: InstantiateExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralExpr(ast: LiteralExpr, context: Context): ts.TypeNode {
    if (ast.value === null) {
      // TODO(alan-agius4): Remove when we no longer support TS 3.9
      // Use: return ts.createLiteralTypeNode(ts.createNull()) directly.
      return ts.versionMajorMinor.charAt(0) === '4' ?
          ts.createLiteralTypeNode(ts.createNull() as any) :
          ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword as any);
    } else if (ast.value === undefined) {
      return ts.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    } else if (typeof ast.value === 'boolean') {
      return ts.createLiteralTypeNode(ts.createLiteral(ast.value));
    } else if (typeof ast.value === 'number') {
      return ts.createLiteralTypeNode(ts.createLiteral(ast.value));
    } else {
      return ts.createLiteralTypeNode(ts.createLiteral(ast.value));
    }
  }

  visitLocalizedString(ast: LocalizedString, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitExternalExpr(ast: ExternalExpr, context: Context): ts.EntityName|ts.TypeReferenceNode {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol`);
    }
    const {moduleImport, symbol} =
        this.imports.generateNamedImport(ast.value.moduleName, ast.value.name);
    const symbolIdentifier = ts.createIdentifier(symbol);

    const typeName = moduleImport ?
        ts.createQualifiedName(ts.createIdentifier(moduleImport), symbolIdentifier) :
        symbolIdentifier;

    const typeArguments = ast.typeParams !== null ?
        ast.typeParams.map(type => this.translateType(type, context)) :
        undefined;
    return ts.createTypeReferenceNode(typeName, typeArguments);
  }

  visitConditionalExpr(ast: ConditionalExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: NotExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitAssertNotNullExpr(ast: AssertNotNull, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitCastExpr(ast: CastExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitFunctionExpr(ast: FunctionExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitUnaryOperatorExpr(ast: UnaryOperatorExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitBinaryOperatorExpr(ast: BinaryOperatorExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadPropExpr(ast: ReadPropExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadKeyExpr(ast: ReadKeyExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: Context): ts.TupleTypeNode {
    const values = ast.entries.map(expr => this.translateExpression(expr, context));
    return ts.createTupleTypeNode(values);
  }

  visitLiteralMapExpr(ast: LiteralMapExpr, context: Context): ts.TypeLiteralNode {
    const entries = ast.entries.map(entry => {
      const {key, quoted} = entry;
      const type = this.translateExpression(entry.value, context);
      return ts.createPropertySignature(
          /* modifiers */ undefined,
          /* name */ quoted ? ts.createStringLiteral(key) : key,
          /* questionToken */ undefined,
          /* type */ type,
          /* initializer */ undefined);
    });
    return ts.createTypeLiteralNode(entries);
  }

  visitCommaExpr(ast: CommaExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: WrappedNodeExpr<any>, context: Context): ts.TypeNode {
    const node: ts.Node = ast.node;
    if (ts.isEntityName(node)) {
      return ts.createTypeReferenceNode(node, /* typeArguments */ undefined);
    } else if (ts.isTypeNode(node)) {
      return node;
    } else if (ts.isLiteralExpression(node)) {
      return ts.createLiteralTypeNode(node);
    } else {
      throw new Error(
          `Unsupported WrappedNodeExpr in TypeTranslatorVisitor: ${ts.SyntaxKind[node.kind]}`);
    }
  }

  visitTypeofExpr(ast: TypeofExpr, context: Context): ts.TypeQueryNode {
    const typeNode = this.translateExpression(ast.expr, context);
    if (!ts.isTypeReferenceNode(typeNode)) {
      throw new Error(`The target of a typeof expression must be a type reference, but it was
          ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return ts.createTypeQueryNode(typeNode.typeName);
  }

  private translateType(type: Type, context: Context): ts.TypeNode {
    const typeNode = type.visitType(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
          `A Type must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }

  private translateExpression(expr: Expression, context: Context): ts.TypeNode {
    const typeNode = expr.visitExpression(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
          `An Expression must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }
}
