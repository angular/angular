/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExpressionType, ExternalExpr, R3Identifiers as Identifiers, Type} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportFlags, Reference, ReferenceEmitter} from '../../imports';
import {PartialEvaluator, ResolvedValueMap} from '../../partial_evaluator';
import {ReflectionHost} from '../../reflection';

export interface DtsHandler {
  addTypeReplacement(node: ts.Declaration, type: Type): void;
}

export class ModuleWithProvidersScanner {
  constructor(
      private host: ReflectionHost, private evaluator: PartialEvaluator,
      private emitter: ReferenceEmitter) {}

  scan(sf: ts.SourceFile, dts: DtsHandler): void {
    for (const stmt of sf.statements) {
      this.visitStatement(dts, stmt);
    }
  }

  private visitStatement(dts: DtsHandler, stmt: ts.Statement): void {
    // Detect whether a statement is exported, which is used as one of the hints whether to look
    // more closely at possible MWP functions within. This is a syntactic check, not a semantic
    // check, so it won't detect cases like:
    //
    // var X = ...;
    // export {X}
    //
    // This is intentional, because the alternative is slow and this will catch 99% of the cases we
    // need to handle.
    const isExported = stmt.modifiers !== undefined &&
        stmt.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);

    if (!isExported) {
      return;
    }

    if (ts.isClassDeclaration(stmt)) {
      for (const member of stmt.members) {
        if (!ts.isMethodDeclaration(member) || !isStatic(member)) {
          continue;
        }

        this.visitFunctionOrMethodDeclaration(dts, member);
      }
    } else if (ts.isFunctionDeclaration(stmt)) {
      this.visitFunctionOrMethodDeclaration(dts, stmt);
    }
  }

  private visitFunctionOrMethodDeclaration(
      dts: DtsHandler, decl: ts.MethodDeclaration|ts.FunctionDeclaration): void {
    // First, some sanity. This should have a method body with a single return statement.
    if (decl.body === undefined || decl.body.statements.length !== 1) {
      return;
    }
    const retStmt = decl.body.statements[0];
    if (!ts.isReturnStatement(retStmt) || retStmt.expression === undefined) {
      return;
    }
    const retValue = retStmt.expression;

    // Now, look at the return type of the method. Maybe bail if the type is already marked, or if
    // it's incompatible with a MWP function.
    const returnType = this.returnTypeOf(decl);
    if (returnType === ReturnType.OTHER || returnType === ReturnType.MWP_WITH_TYPE) {
      // Don't process this declaration, it either already declares the right return type, or an
      // incompatible one.
      return;
    }

    const value = this.evaluator.evaluate(retValue);
    if (!(value instanceof Map) || !value.has('ngModule')) {
      // The return value does not provide sufficient information to be able to add a generic type.
      return;
    }

    if (returnType === ReturnType.INFERRED && !isModuleWithProvidersType(value)) {
      // The return type is inferred but the returned object is not of the correct shape, so we
      // shouldn's modify the return type to become `ModuleWithProviders`.
      return;
    }

    // The return type has been verified to represent the `ModuleWithProviders` type, but either the
    // return type is inferred or the generic type argument is missing. In both cases, a new return
    // type is created where the `ngModule` type is included as generic type argument.
    const ngModule = value.get('ngModule');
    if (!(ngModule instanceof Reference) || !ts.isClassDeclaration(ngModule.node)) {
      return;
    }

    const ngModuleExpr =
        this.emitter.emit(ngModule, decl.getSourceFile(), ImportFlags.ForceNewImport);
    const ngModuleType = new ExpressionType(ngModuleExpr.expression);
    const mwpNgType = new ExpressionType(
        new ExternalExpr(Identifiers.ModuleWithProviders), [/* modifiers */], [ngModuleType]);

    dts.addTypeReplacement(decl, mwpNgType);
  }

  private returnTypeOf(decl: ts.FunctionDeclaration|ts.MethodDeclaration|
                       ts.VariableDeclaration): ReturnType {
    if (decl.type === undefined) {
      return ReturnType.INFERRED;
    } else if (!ts.isTypeReferenceNode(decl.type)) {
      return ReturnType.OTHER;
    }

    // Try to figure out if the type is of a familiar form, something that looks like it was
    // imported.
    let typeId: ts.Identifier;
    if (ts.isIdentifier(decl.type.typeName)) {
      // def: ModuleWithProviders
      typeId = decl.type.typeName;
    } else if (ts.isQualifiedName(decl.type.typeName) && ts.isIdentifier(decl.type.typeName.left)) {
      // def: i0.ModuleWithProviders
      typeId = decl.type.typeName.right;
    } else {
      return ReturnType.OTHER;
    }

    const importDecl = this.host.getImportOfIdentifier(typeId);
    if (importDecl === null || importDecl.from !== '@angular/core' ||
        importDecl.name !== 'ModuleWithProviders') {
      return ReturnType.OTHER;
    }

    if (decl.type.typeArguments === undefined || decl.type.typeArguments.length === 0) {
      // The return type is indeed ModuleWithProviders, but no generic type parameter was found.
      return ReturnType.MWP_NO_TYPE;
    } else {
      // The return type is ModuleWithProviders, and the user has already specified a generic type.
      return ReturnType.MWP_WITH_TYPE;
    }
  }
}

enum ReturnType {
  INFERRED,
  MWP_NO_TYPE,
  MWP_WITH_TYPE,
  OTHER,
}

/** Whether the resolved value map represents a ModuleWithProviders object */
function isModuleWithProvidersType(value: ResolvedValueMap): boolean {
  const ngModule = value.has('ngModule');
  const providers = value.has('providers');

  return ngModule && (value.size === 1 || (providers && value.size === 2));
}

function isStatic(node: ts.Node): boolean {
  return node.modifiers !== undefined &&
      node.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
}
