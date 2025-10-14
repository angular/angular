/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '@angular/compiler';
import ts from 'typescript';
import {assertSuccessfulReferenceEmit, ImportFlags, Reference} from '../../imports';
import {AmbientImport} from '../../reflection';
import {Context} from './context';
import {tsNumericExpression} from './ts_util';
import {TypeEmitter} from './type_emitter';
export function translateType(type, contextFile, reflector, refEmitter, imports) {
  return type.visitType(
    new TypeTranslatorVisitor(imports, contextFile, reflector, refEmitter),
    new Context(false),
  );
}
class TypeTranslatorVisitor {
  imports;
  contextFile;
  reflector;
  refEmitter;
  constructor(imports, contextFile, reflector, refEmitter) {
    this.imports = imports;
    this.contextFile = contextFile;
    this.reflector = reflector;
    this.refEmitter = refEmitter;
  }
  visitBuiltinType(type, context) {
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
  visitExpressionType(type, context) {
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
  visitArrayType(type, context) {
    return ts.factory.createArrayTypeNode(this.translateType(type.of, context));
  }
  visitMapType(type, context) {
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
  visitTransplantedType(ast, context) {
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
  visitReadVarExpr(ast, context) {
    if (ast.name === null) {
      throw new Error(`ReadVarExpr with no variable name in type`);
    }
    return ts.factory.createTypeQueryNode(ts.factory.createIdentifier(ast.name));
  }
  visitInvokeFunctionExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitTaggedTemplateLiteralExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitTemplateLiteralExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitTemplateLiteralElementExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitInstantiateExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitLiteralExpr(ast, context) {
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
  visitLocalizedString(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitExternalExpr(ast, context) {
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
  visitConditionalExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitDynamicImportExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitRegularExpressionLiteral(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitNotExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitFunctionExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitArrowFunctionExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitUnaryOperatorExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitBinaryOperatorExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitReadPropExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitReadKeyExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitLiteralArrayExpr(ast, context) {
    const values = ast.entries.map((expr) => this.translateExpression(expr, context));
    return ts.factory.createTupleTypeNode(values);
  }
  visitLiteralMapExpr(ast, context) {
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
  visitCommaExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitWrappedNodeExpr(ast, context) {
    const node = ast.node;
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
  visitTypeofExpr(ast, context) {
    const typeNode = this.translateExpression(ast.expr, context);
    if (!ts.isTypeReferenceNode(typeNode)) {
      throw new Error(`The target of a typeof expression must be a type reference, but it was
          ${ts.SyntaxKind[typeNode.kind]}`);
    }
    return ts.factory.createTypeQueryNode(typeNode.typeName);
  }
  visitVoidExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  visitParenthesizedExpr(ast, context) {
    throw new Error('Method not implemented.');
  }
  translateType(type, context) {
    const typeNode = type.visitType(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
        `A Type must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`,
      );
    }
    return typeNode;
  }
  translateExpression(expr, context) {
    const typeNode = expr.visitExpression(this, context);
    if (!ts.isTypeNode(typeNode)) {
      throw new Error(
        `An Expression must translate to a TypeNode, but was ${ts.SyntaxKind[typeNode.kind]}`,
      );
    }
    return typeNode;
  }
  translateTypeReference(type, context, viaModule) {
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
//# sourceMappingURL=type_translator.js.map
