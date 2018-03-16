/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassStmt, LiteralExpr, PartialModule, Statement, StmtModifier, Expression, ExpressionVisitor, ExternalExpr, StaticReflector, LiteralArrayExpr, LiteralMapExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {MetadataCollector, MetadataValue, ModuleMetadata, isClassMetadata, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicCallExpression} from '../metadata/index';

import {MetadataTransformer, ValueTransform} from './metadata_cache';

const UNSUPPORTED = {};

const unsupported = () => UNSUPPORTED;
class ExpressionConverter implements ExpressionVisitor {

  constructor(private reflector: StaticReflector) {}

  visitReadVarExpr = unsupported;
  visitWriteVarExpr = unsupported;
  visitWriteKeyExpr = unsupported;
  visitWritePropExpr = unsupported;
  visitInvokeMethodExpr = unsupported;
  visitInvokeFunctionExpr = unsupported;
  visitInstantiateExpr = unsupported;
  visitLiteralExpr(ast: LiteralExpr) { return ast.value; }

  visitExternalExpr(ast: ExternalExpr) {
    return ast.value.moduleName && ast.value.name ?
      this.reflector.getStaticSymbol(ast.value.moduleName, ast.value.name) : UNSUPPORTED;
  }

  visitConditionalExpr = unsupported;
  visitNotExpr = unsupported;
  visitAssertNotNullExpr = unsupported;
  visitCastExpr = unsupported;
  visitFunctionExpr = unsupported;
  visitBinaryOperatorExpr = unsupported;
  visitReadPropExpr = unsupported;
  visitReadKeyExpr = unsupported;
  visitLiteralArrayExpr(ast: LiteralArrayExpr, context: any) {
    let supported = true;
    const result = ast.entries.map(v => {
      if (supported) {
         const result = v.visitExpression(this, context);
         if (result !== UNSUPPORTED) return result;
      }
      supported = false;
      return UNSUPPORTED;
    });
    return supported ? result : UNSUPPORTED;
  }
  visitLiteralMapExpr(ast: LiteralMapExpr, context: any) {
    let supported = true;
    const result: any = {};
    ast.entries.forEach(v => {
      if (supported) {
         const value = v.value.visitExpression(this, context);
         if (value !== UNSUPPORTED) {
           result[v.key] = value;
         } else {
          supported = false;
         }
      }
    });
    return supported ? result : UNSUPPORTED;
  }
  visitCommaExpr = unsupported;
}

function convertToMetadata(expression: Expression | undefined, reflector: StaticReflector): any {
  return expression ?
    expression.visitExpression(new ExpressionConverter(reflector), null) : {};
}

export class PartialModuleMetadataTransformer implements MetadataTransformer {
  private moduleMap: Map<string, PartialModule>;

  constructor(modules: PartialModule[], private reflector: StaticReflector) {
    this.moduleMap = new Map(modules.map<[string, PartialModule]>(m => [m.fileName, m]));
  }

  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    const partialModule = this.moduleMap.get(sourceFile.fileName);
    if (partialModule) {
      const classMap = new Map<string, ClassStmt>(
          partialModule.statements.filter(isClassStmt).map<[string, ClassStmt]>(s => [s.name, s]));
      if (classMap.size > 0) {
        return (value: MetadataValue, node: ts.Node): MetadataValue => {
          // For class metadata that is going to be transformed to have a static method ensure the
          // metadata contains a static declaration the new static method.
          if (isClassMetadata(value) && node.kind === ts.SyntaxKind.ClassDeclaration) {
            const classDeclaration = node as ts.ClassDeclaration;
            if (classDeclaration.name) {
              const partialClass = classMap.get(classDeclaration.name.text);
              if (partialClass) {
                // Add fields
                for (const field of partialClass.fields) {
                  if (field.name && field.modifiers &&
                      field.modifiers.some(modifier => modifier === StmtModifier.Static)) {
                    let val = convertToMetadata(field.initializer, this.reflector);
                    value.statics = {...(value.statics || {}), [field.name]: val};
                  }
                }
              }
            }
          }
          return value;
        };
      }
    }
  }
}

function isClassStmt(v: Statement): v is ClassStmt {
  return v instanceof ClassStmt;
}

export class RemoveAngularDecoratorMetadataTransformer implements MetadataTransformer {
  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    return (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (isClassMetadata(value) && node.kind === ts.SyntaxKind.ClassDeclaration) {
        const classDeclaration = node as ts.ClassDeclaration;
        if (value.decorators) {
          const newDecorators = value.decorators.filter(d => !isAngularDirective(d));
          if (newDecorators.length === 0) {
            delete value.decorators;
          } else {
            value.decorators = newDecorators;
          }
        }
      }
      return value;
    };
  }
}

function isAngularDirective(directive: any): boolean {
  if (isMetadataSymbolicCallExpression(directive)) {
    const target = directive.expression;
    return isMetadataImportedSymbolReferenceExpression(target) &&
        target.module.startsWith('@angular/');
  }
  return false;
}