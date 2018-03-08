/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassStmt, LiteralExpr, PartialModule, Statement, StmtModifier} from '@angular/compiler';
import * as ts from 'typescript';

import {MetadataCollector, MetadataValue, ModuleMetadata, isClassMetadata, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicCallExpression} from '../metadata/index';

import {MetadataTransformer, ValueTransform} from './metadata_cache';

export class PartialModuleMetadataTransformer implements MetadataTransformer {
  private moduleMap: Map<string, PartialModule>;

  constructor(modules: PartialModule[]) {
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
                    let val: any = {};

                    // If it is a string, number or boolean, keep it.
                    if (field.initializer && field.initializer instanceof LiteralExpr) {
                      const initializer = field.initializer.value;
                      const initializerType = typeof initializer;
                      if (initializerType === 'string' || initializerType === 'number' ||
                          initializerType === 'boolean') {
                        val = initializer;
                      }
                    }

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