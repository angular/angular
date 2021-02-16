/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '@angular/compiler';
import * as ts from 'typescript';

import {Context} from './context';
import {ImportManager} from './import_manager';


export function translateType(type: o.Type, imports: ImportManager): ts.TypeNode {
  return type.visitType(new TypeTranslatorVisitor(imports), new Context(false));
}

export class TypeTranslatorVisitor implements o.ExpressionVisitor, o.TypeVisitor {
  constructor(private imports: ImportManager) {}

  visitBuiltinType(type: o.BuiltinType, context: Context): ts.KeywordTypeNode {
    switch (type.name) {
      case o.BuiltinTypeName.Bool:
        return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case o.BuiltinTypeName.Dynamic:
        return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
      case o.BuiltinTypeName.Int:
      case o.BuiltinTypeName.Number:
        return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case o.BuiltinTypeName.String:
        return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case o.BuiltinTypeName.None:
        return ts.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
      default:
        throw new Error(`Unsupported builtin type: ${o.BuiltinTypeName[type.name]}`);
    }
  }

  visitExpressionType(type: o.ExpressionType, context: Context): ts.TypeNode {
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

  visitArrayType(type: o.ArrayType, context: Context): ts.ArrayTypeNode {
    return ts.createArrayTypeNode(this.translateType(type.of, context));
  }

  visitMapType(type: o.MapType, context: Context): ts.TypeLiteralNode {
    const parameter = ts.createParameter(
        undefined, undefined, undefined, 'key', undefined,
        ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
    const typeArgs = type.valueType !== null ?
        this.translateType(type.valueType, context) :
        ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    const indexSignature = ts.createIndexSignature(undefined, undefined, [parameter], typeArgs);
    return ts.createTypeLiteralNode([indexSignature]);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, context: Context): ts.TypeQueryNode {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts.createTypeQueryNode(ts.createIdentifier(ast.name));
  }

  visitWriteVarExpr(expr: o.WriteVarExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWriteKeyExpr(expr: o.WriteKeyExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitWritePropExpr(expr: o.WritePropExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeMethodExpr(ast: o.InvokeMethodExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInvokeFunctionExpr(ast: o.InvokeFunctionExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitTaggedTemplateExpr(ast: o.TaggedTemplateExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitLiteralExpr(ast: o.LiteralExpr, context: Context): ts.TypeNode {
    if (ast.value === null) {
      return ts.createLiteralTypeNode(ts.createNull());
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

  visitLocalizedString(ast: o.LocalizedString, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitExternalExpr(ast: o.ExternalExpr, context: Context): ts.EntityName|ts.TypeReferenceNode {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol`);
    }
    const {moduleImport, symbol} =
        this.imports.generateNamedImport(ast.value.moduleName, ast.value.name);
    const symbolIdentifier = ts.createIdentifier(symbol);

    const typeName =
        moduleImport ? ts.createQualifiedName(moduleImport, symbolIdentifier) : symbolIdentifier;

    const typeArguments = ast.typeParams !== null ?
        ast.typeParams.map(type => this.translateType(type, context)) :
        undefined;
    return ts.createTypeReferenceNode(typeName, typeArguments);
  }

  visitConditionalExpr(ast: o.ConditionalExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: o.NotExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitAssertNotNullExpr(ast: o.AssertNotNull, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitCastExpr(ast: o.CastExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitFunctionExpr(ast: o.FunctionExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitUnaryOperatorExpr(ast: o.UnaryOperatorExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadPropExpr(ast: o.ReadPropExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitReadKeyExpr(ast: o.ReadKeyExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, context: Context): ts.TupleTypeNode {
    const values = ast.entries.map(expr => this.translateExpression(expr, context));
    return ts.createTupleTypeNode(values);
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: Context): ts.TypeLiteralNode {
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

  visitCommaExpr(ast: o.CommaExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, context: Context): ts.TypeNode {
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

  visitTypeofExpr(ast: o.TypeofExpr, context: Context): ts.TypeQueryNode {
    const typeNode = this.translateExpression(ast.expr, context);
    if (!ts.isTypeReferenceNode(typeNode)) {
      throw new Error(`The target of a typeof expression must be a type reference, but it was
          ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return ts.createTypeQueryNode(typeNode.typeName);
  }

  private translateType(type: o.Type, context: Context): ts.TypeNode {
    const typeNode = type.visitType(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
          `A Type must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }

  private translateExpression(expr: o.Expression, context: Context): ts.TypeNode {
    const typeNode = expr.visitExpression(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
          `An Expression must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return typeNode;
  }
}
