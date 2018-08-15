/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassStmt, PartialModule, Statement, StmtModifier} from '@angular/compiler';
import * as ts from 'typescript';

import {isClassMetadata, MetadataCollector, MetadataValue, ModuleMetadata} from '../metadata/index';

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
                for (const field of partialClass.fields) {
                  if (field.name && field.modifiers &&
                      field.modifiers.some(modifier => modifier === StmtModifier.Static)) {
                    value.statics = {...(value.statics || {}), [field.name]: {}};
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
