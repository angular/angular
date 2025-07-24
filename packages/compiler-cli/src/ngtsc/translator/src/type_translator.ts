/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '@angular/compiler';
import ts from 'typescript';

import {
  assertSuccessfulReferenceEmit,
  ImportFlags,
  OwningModule,
  Reference,
  ReferenceEmitter,
} from '../../imports';
import {AmbientImport, ReflectionHost} from '../../reflection';

import {Context} from './context';
import {ImportManager} from './import_manager/import_manager';
import {tsNumericExpression} from './ts_util';
import {TypeEmitter} from './type_emitter';

export function translateType(
  type: o.Type,
  contextFile: ts.SourceFile,
  reflector: ReflectionHost,
  refEmitter: ReferenceEmitter,
  imports: ImportManager,
): ts.TypeNode {
  return type.visitType(
    new TypeTranslatorVisitor(imports, contextFile, reflector, refEmitter),
    new Context(false),
  );
}

class TypeTranslatorVisitor implements o.ExpressionVisitor, o.TypeVisitor {
  constructor(
    private imports: ImportManager,
    private contextFile: ts.SourceFile,
    private reflector: ReflectionHost,
    private refEmitter: ReferenceEmitter,
  ) {}

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
        'An ExpressionType with type arguments must translate into a TypeReferenceNode',
      );
    } else if (typeNode.typeArguments !== undefined) {
      throw new Error(
        `An ExpressionType with type arguments cannot have multiple levels of type arguments`,
      );
    }

    const typeArgs = type.typeParams.map((param) => this.translateType(param, context));
    return ts.factory.createTypeReferenceNode(typeNode.typeName, typeArgs);
  }

  visitArrayType(type: o.ArrayType, context: Context): ts.ArrayTypeNode {
    return ts.factory.createArrayTypeNode(this.translateType(type.of, context));
  }

  visitMapType(type: o.MapType, context: Context): ts.TypeLiteralNode {
    const parameter = ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'key',
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    );
    const typeArgs =
      type.valueType !== null
        ? this.translateType(type.valueType, context)
        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
    const indexSignature = ts.factory.createIndexSignature(undefined, [parameter], typeArgs);
    return ts.factory.createTypeLiteralNode([indexSignature]);
  }

  visitTransplantedType(ast: o.TransplantedType<unknown>, context: Context) {
    const node = ast.type instanceof Reference ? ast.type.node : ast.type;
    if (!ts.isTypeNode(node)) {
      throw new Error(`A TransplantedType must wrap a TypeNode`);
    }

    const viaModule = ast.type instanceof Reference ? ast.type.bestGuessOwningModule : null;

    const emitter = new TypeEmitter((typeRef) =>
      this.translateTypeReference(typeRef, context, viaModule),
    );
    return emitter.emitType(node);
  }

  visitReadVarExpr(ast: o.ReadVarExpr, context: Context): ts.TypeQueryNode {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts.factory.createTypeQueryNode(ts.factory.createIdentifier(ast.name));
  }

  visitInvokeFunctionExpr(ast: o.InvokeFunctionExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitTaggedTemplateLiteralExpr(ast: o.TaggedTemplateLiteralExpr, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitTemplateLiteralExpr(ast: o.TemplateLiteralExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitTemplateLiteralElementExpr(ast: o.TemplateLiteralElementExpr, context: any) {
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
        ast.value ? ts.factory.createTrue() : ts.factory.createFalse(),
      );
    } else if (typeof ast.value === 'number') {
      return ts.factory.createLiteralTypeNode(tsNumericExpression(ast.value));
    } else {
      return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(ast.value));
    }
  }

  visitLocalizedString(ast: o.LocalizedString, context: Context): never {
    throw new Error('Method not implemented.');
  }

  visitExternalExpr(ast: o.ExternalExpr, context: Context): ts.EntityName | ts.TypeReferenceNode {
    if (ast.value.moduleName === null || ast.value.name === null) {
      throw new Error(`Import unknown module or symbol`);
    }
    const typeName = this.imports.addImport({
      exportModuleSpecifier: ast.value.moduleName,
      exportSymbolName: ast.value.name,
      requestedFile: this.contextFile,
      asTypeReference: true,
    });

    const typeArguments =
      ast.typeParams !== null
        ? ast.typeParams.map((type) => this.translateType(type, context))
        : undefined;
    return ts.factory.createTypeReferenceNode(typeName, typeArguments);
  }

  visitConditionalExpr(ast: o.ConditionalExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitDynamicImportExpr(ast: o.outputAst.DynamicImportExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  visitNotExpr(ast: o.NotExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitFunctionExpr(ast: o.FunctionExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitArrowFunctionExpr(ast: o.ArrowFunctionExpr, context: any) {
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
    const values = ast.entries.map((expr) => this.translateExpression(expr, context));
    return ts.factory.createTupleTypeNode(values);
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, context: Context): ts.TypeLiteralNode {
    const entries = ast.entries.map((entry) => {
      const {key, quoted} = entry;
      const type = this.translateExpression(entry.value, context);
      return ts.factory.createPropertySignature(
        /* modifiers */ undefined,
        /* name */ quoted ? ts.factory.createStringLiteral(key) : key,
        /* questionToken */ undefined,
        /* type */ type,
      );
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
        `Unsupported WrappedNodeExpr in TypeTranslatorVisitor: ${ts.SyntaxKind[node.kind]}`,
      );
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

  visitVoidExpr(ast: o.VoidExpr, context: Context) {
    throw new Error('Method not implemented.');
  }

  visitParenthesizedExpr(ast: o.ParenthesizedExpr, context: any) {
    throw new Error('Method not implemented.');
  }

  private translateType(type: o.Type, context: Context): ts.TypeNode {
    const typeNode = type.visitType(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
        `A Type must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`,
      );
    }
    return typeNode;
  }

  private translateExpression(expr: o.Expression, context: Context): ts.TypeNode {
    const typeNode = expr.visitExpression(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
        `An Expression must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`,
      );
    }
    return typeNode;
  }

  private translateTypeReference(
    type: ts.TypeReferenceNode,
    context: Context,
    viaModule: OwningModule | null,
  ): ts.TypeReferenceNode | null {
    const target = ts.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
    const declaration = this.reflector.getDeclarationOfIdentifier(target);
    if (declaration === null) {
      throw new Error(
        `Unable to statically determine the declaration file of type node ${target.text}`,
      );
    }

    let owningModule = viaModule;
    if (typeof declaration.viaModule === 'string') {
      owningModule = {
        specifier: declaration.viaModule,
        resolutionContext: type.getSourceFile().fileName,
      };
    }

    const reference = new Reference(
      declaration.node,
      declaration.viaModule === AmbientImport ? AmbientImport : owningModule,
    );
    const emittedType = this.refEmitter.emit(
      reference,
      this.contextFile,
      ImportFlags.NoAliasing | ImportFlags.AllowTypeImports | ImportFlags.AllowAmbientReferences,
    );

    assertSuccessfulReferenceEmit(emittedType, target, 'type');

    const typeNode = this.translateExpression(emittedType.expression, context);

    if (!ts.isTypeReferenceNode(typeNode)) {
      throw new Error(
        `Expected TypeReferenceNode for emitted reference, got ${ts.SyntaxKind[typeNode.kind]}.`,
      );
    }
    return typeNode;
  }
}
