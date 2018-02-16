/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticReflector, StaticSymbol} from '@angular/compiler';
import * as ts from 'typescript';

import {MetadataValue, isClassMetadata, isMetadataImportedSymbolReferenceExpression, isMetadataSymbolicCallExpression} from '../metadata';

import {MetadataTransformer, ValueTransform} from './metadata_cache';

export type Transformer = (sourceFile: ts.SourceFile) => ts.SourceFile;
export type TransformerFactory = (context: ts.TransformationContext) => Transformer;

export function getDecoratorStripTransformerFactory(
    coreDecorators: Set<StaticSymbol>, reflector: StaticReflector,
    checker: ts.TypeChecker): TransformerFactory {
  return function(context: ts.TransformationContext) {
    return function(sourceFile: ts.SourceFile): ts.SourceFile {
      const stripDecoratorsFromClassDeclaration =
          (node: ts.ClassDeclaration): ts.ClassDeclaration => {
            if (node.decorators === undefined) {
              return node;
            }
            const decorators = node.decorators.filter(decorator => {
              const callExpr = decorator.expression;
              if (ts.isCallExpression(callExpr)) {
                const id = callExpr.expression;
                if (ts.isIdentifier(id)) {
                  const symbol = resolveToStaticSymbol(id, sourceFile.fileName, reflector, checker);
                  return symbol && coreDecorators.has(symbol);
                }
              }
              return true;
            });
            if (decorators.length !== node.decorators.length) {
              return ts.updateClassDeclaration(
                  node, decorators, node.modifiers, node.name, node.typeParameters,
                  node.heritageClauses || [], node.members, );
            }
            return node;
          };

      const stripDecoratorPropertyAssignment = (node: ts.ClassDeclaration): ts.ClassDeclaration => {
        return ts.visitEachChild(node, member => {
          if (!ts.isPropertyDeclaration(member) || !isDecoratorAssignment(member) ||
              !member.initializer || !ts.isArrayLiteralExpression(member.initializer)) {
            return member;
          }

          const newInitializer = ts.visitEachChild(member.initializer, decorator => {
            if (!ts.isObjectLiteralExpression(decorator)) {
              return decorator;
            }
            const type = lookupProperty(decorator, 'type');
            if (!type || !ts.isIdentifier(type)) {
              return decorator;
            }
            const symbol = resolveToStaticSymbol(type, sourceFile.fileName, reflector, checker);
            if (!symbol || !coreDecorators.has(symbol)) {
              return decorator;
            }
            return undefined;
          }, context);

          if (newInitializer === member.initializer) {
            return member;
          } else if (newInitializer.elements.length === 0) {
            return undefined;
          } else {
            return ts.updateProperty(
                member, member.decorators, member.modifiers, member.name, member.questionToken,
                member.type, newInitializer);
          }
        }, context);
      };

      return ts.visitEachChild(sourceFile, stmt => {
        if (ts.isClassDeclaration(stmt)) {
          let decl = stmt;
          if (stmt.decorators) {
            decl = stripDecoratorsFromClassDeclaration(stmt);
          }
          return stripDecoratorPropertyAssignment(decl);
        }
        return stmt;
      }, context);
    };
  };
}

function isDecoratorAssignment(member: ts.ClassElement): boolean {
  if (!ts.isPropertyDeclaration(member)) {
    return false;
  }
  if (!member.modifiers ||
      !member.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword)) {
    return false;
  }
  if (!ts.isIdentifier(member.name) || member.name.text !== 'decorators') {
    return false;
  }
  if (!member.initializer || !ts.isArrayLiteralExpression(member.initializer)) {
    return false;
  }
  return true;
}

function lookupProperty(expr: ts.ObjectLiteralExpression, prop: string): ts.Expression|undefined {
  const decl = expr.properties.find(
      elem => !!elem.name && ts.isIdentifier(elem.name) && elem.name.text === prop);
  if (decl === undefined || !ts.isPropertyAssignment(decl)) {
    return undefined;
  }
  return decl.initializer;
}

function resolveToStaticSymbol(
    id: ts.Identifier, containingFile: string, reflector: StaticReflector,
    checker: ts.TypeChecker): StaticSymbol|null {
  const res = checker.getSymbolAtLocation(id);
  if (!res || !res.declarations || res.declarations.length === 0) {
    return null;
  }
  const decl = res.declarations[0];
  if (!ts.isImportSpecifier(decl)) {
    return null;
  }
  const moduleSpecifier = decl.parent !.parent !.parent !.moduleSpecifier;
  if (!ts.isStringLiteral(moduleSpecifier)) {
    return null;
  }
  return reflector.tryFindDeclaration(moduleSpecifier.text, id.text, containingFile);
}

export class StripDecoratorsMetadataTransformer implements MetadataTransformer {
  constructor(private coreDecorators: Set<StaticSymbol>, private reflector: StaticReflector) {}

  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    return (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (isClassMetadata(value) && ts.isClassDeclaration(node) && value.decorators) {
        value.decorators = value.decorators.filter(d => {
          if (isMetadataSymbolicCallExpression(d) &&
              isMetadataImportedSymbolReferenceExpression(d.expression)) {
            const declaration = this.reflector.tryFindDeclaration(
                d.expression.module, d.expression.name, sourceFile.fileName);
            if (declaration && this.coreDecorators.has(declaration)) {
              return false;
            }
          }
          return true;
        });
      }
      return value;
    };
  }
}
