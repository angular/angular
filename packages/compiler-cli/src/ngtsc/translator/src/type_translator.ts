/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '@angular/compiler';
import ts from 'typescript';

import {assertSuccessfulReferenceEmit, ImportFlags, Reference, ReferenceEmitter} from '../../imports';
import {ReflectionHost} from '../../reflection';

import {Context} from './context';
import {ImportManager} from './import_manager';


export function translateType(
    type: o.Type, contextFile: ts.SourceFile, reflector: ReflectionHost,
    refEmitter: ReferenceEmitter, imports: ImportManager): ts.TypeNode {
  return type.visitType(
      new TypeTranslatorVisitor(imports, contextFile, reflector, refEmitter), new Context(false));
}

class TypeTranslatorVisitor implements o.ExpressionVisitor, o.TypeVisitor {
  constructor(
      private imports: ImportManager, private contextFile: ts.SourceFile,
      private reflector: ReflectionHost, private refEmitter: ReferenceEmitter) {}

  visitBuiltinType(type: o.BuiltinType, context: Context): ts.KeywordTypeNode {
    switch (type.name) {
      case o.BuiltinTypeName.Bool:
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
      case o.BuiltinTypeName.Dynamic:
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
      case o.BuiltinTypeName.Int:
      case o.BuiltinTypeName.Number:
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
      case o.BuiltinTypeName.String:
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
      case o.BuiltinTypeName.None:
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword);
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
    return ts.factory.createTypeReferenceNode(typeNode.typeName, typeArgs);
  }

  visitArrayType(type: o.ArrayType, context: Context): ts.ArrayTypeNode {
    return ts.factory.createArrayTypeNode(this.translateType(type.of, context));
  }

  visitMapType(type: o.MapType, context: Context): ts.TypeLiteralNode {
    const parameter = ts.factory.createParameterDeclaration(
        undefined, undefined, 'key', undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword));
    const typeArgs = type.valueType !== null ?
        this.translateType(type.valueType, context) :
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    const indexSignature = ts.factory.createIndexSignature(undefined, [parameter], typeArgs);
    return ts.factory.createTypeLiteralNode([indexSignature]);
  }

  visitTransplantedType(ast: o.TransplantedType<ts.Node>, context: any) {
    if (!ts.isTypeNode(ast.type)) {
      throw new Error(`A TransplantedType must wrap a TypeNode`);
    }

    return this.translateTransplantedTypeNode(ast.type, context);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, context: Context): ts.TypeQueryNode {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts.factory.createTypeQueryNode(ts.factory.createIdentifier(ast.name));
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
      return ts.factory.createLiteralTypeNode(ts.factory.createNull());
    } else if (ast.value === undefined) {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword);
    } else if (typeof ast.value === 'boolean') {
      return ts.factory.createLiteralTypeNode(
          ast.value ? ts.factory.createTrue() : ts.factory.createFalse());
    } else if (typeof ast.value === 'number') {
      return ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral(ast.value));
    } else {
      return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(ast.value));
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
    const symbolIdentifier = ts.factory.createIdentifier(symbol);

    const typeName = moduleImport ? ts.factory.createQualifiedName(moduleImport, symbolIdentifier) :
                                    symbolIdentifier;

    const typeArguments = ast.typeParams !== null ?
        ast.typeParams.map(type => this.translateType(type, context)) :
        undefined;
    return ts.factory.createTypeReferenceNode(typeName, typeArguments);
  }

  visitConditionalExpr(ast: o.ConditionalExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: o.NotExpr, context: Context) {
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
    return ts.factory.createTupleTypeNode(values);
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: Context): ts.TypeLiteralNode {
    const entries = ast.entries.map(entry => {
      const {key, quoted} = entry;
      const type = this.translateExpression(entry.value, context);
      return ts.factory.createPropertySignature(
          /* modifiers */ undefined,
          /* name */ quoted ? ts.factory.createStringLiteral(key) : key,
          /* questionToken */ undefined,
          /* type */ type);
    });
    return ts.factory.createTypeLiteralNode(entries);
  }

  visitCommaExpr(ast: o.CommaExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, context: Context): ts.TypeNode {
    const node: ts.Node = ast.node;
    if (ts.isEntityName(node)) {
      return ts.factory.createTypeReferenceNode(node, /* typeArguments */ undefined);
    } else if (ts.isTypeNode(node)) {
      return node;
    } else if (ts.isLiteralExpression(node)) {
      return ts.factory.createLiteralTypeNode(node);
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
    return ts.factory.createTypeQueryNode(typeNode.typeName);
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

  /**
   * Translates a type reference node so that all of its references
   * are imported into the context file.
   */
  private translateTransplantedTypeReferenceNode(
      node: ts.TypeReferenceNode&{typeName: ts.Identifier}, context: any): ts.TypeReferenceNode {
    const declaration = this.reflector.getDeclarationOfIdentifier(node.typeName);

    if (declaration === null) {
      throw new Error(
          `Unable to statically determine the declaration file of type node ${node.typeName.text}`);
    }

    const emittedType = this.refEmitter.emit(
        new Reference(declaration.node), this.contextFile,
        ImportFlags.NoAliasing | ImportFlags.AllowTypeImports |
            ImportFlags.AllowRelativeDtsImports);

    assertSuccessfulReferenceEmit(emittedType, node, 'type');

    const result = emittedType.expression.visitExpression(this, context);

    if (!ts.isTypeReferenceNode(result)) {
      throw new Error(`Expected TypeReferenceNode when referencing the type for ${
          node.typeName.text}, but received ${ts.SyntaxKind[result.kind]}`);
    }

    // If the original node doesn't have any generic parameters we return the results.
    if (node.typeArguments === undefined || node.typeArguments.length === 0) {
      return result;
    }

    // If there are any generics, we have to reflect them as well.
    const translatedArgs =
        node.typeArguments.map(arg => this.translateTransplantedTypeNode(arg, context));

    return ts.factory.updateTypeReferenceNode(
        result, result.typeName, ts.factory.createNodeArray(translatedArgs));
  }

  /**
   * Translates a type node so that all of the type references it
   * contains are imported and can be referenced in the context file.
   */
  private translateTransplantedTypeNode(rootNode: ts.TypeNode, context: any): ts.TypeNode {
    const factory: ts.TransformerFactory<ts.Node> = transformContext => root => {
      const walk = (node: ts.Node): ts.Node => {
        if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
          const translated =
              this.translateTransplantedTypeReferenceNode(node as ts.TypeReferenceNode & {
                typeName: ts.Identifier;
              }, context);

          if (translated !== node) {
            return translated;
          }
        }

        return ts.visitEachChild(node, walk, transformContext);
      };

      return ts.visitNode(root, walk);
    };

    return ts.transform(rootNode, [factory]).transformed[0] as ts.TypeNode;
  }
}
