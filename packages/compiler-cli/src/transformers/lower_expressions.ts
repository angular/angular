/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createLoweredSymbol, isLoweredSymbol} from '@angular/compiler';
import * as ts from 'typescript';

import {CollectorOptions, isMetadataGlobalReferenceExpression, MetadataCollector, MetadataValue, ModuleMetadata} from '../metadata/index';

import {MetadataCache, MetadataTransformer, ValueTransform} from './metadata_cache';

export interface LoweringRequest {
  kind: ts.SyntaxKind;
  location: number;
  end: number;
  name: string;
}

export type RequestLocationMap = Map<number, LoweringRequest>;

const enum DeclarationOrder {
  BeforeStmt,
  AfterStmt
}

interface Declaration {
  name: string;
  node: ts.Node;
  order: DeclarationOrder;
}

interface DeclarationInsert {
  declarations: Declaration[];
  relativeTo: ts.Node;
}

function toMap<T, K>(items: T[], select: (item: T) => K): Map<K, T> {
  return new Map(items.map<[K, T]>(i => [select(i), i]));
}

// We will never lower expressions in a nested lexical scope so avoid entering them.
// This also avoids a bug in TypeScript 2.3 where the lexical scopes get out of sync
// when using visitEachChild.
function isLexicalScope(node: ts.Node): boolean {
  switch (node.kind) {
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ClassExpression:
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.TypeLiteral:
    case ts.SyntaxKind.ArrayType:
      return true;
  }
  return false;
}

function transformSourceFile(
    sourceFile: ts.SourceFile, requests: RequestLocationMap,
    context: ts.TransformationContext): ts.SourceFile {
  const inserts: DeclarationInsert[] = [];

  // Calculate the range of interesting locations. The transform will only visit nodes in this
  // range to improve the performance on large files.
  const locations = Array.from(requests.keys());
  const min = Math.min(...locations);
  const max = Math.max(...locations);

  // Visit nodes matching the request and synthetic nodes added by tsickle
  function shouldVisit(pos: number, end: number): boolean {
    return (pos <= max && end >= min) || pos == -1;
  }

  function visitSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
    function topLevelStatement(node: ts.Statement): ts.Statement {
      const declarations: Declaration[] = [];

      function visitNode(node: ts.Node): ts.Node {
        // Get the original node before tsickle
        const {pos, end, kind, parent: originalParent} = ts.getOriginalNode(node);
        const nodeRequest = requests.get(pos);
        if (nodeRequest && nodeRequest.kind == kind && nodeRequest.end == end) {
          // This node is requested to be rewritten as a reference to the exported name.
          if (originalParent && originalParent.kind === ts.SyntaxKind.VariableDeclaration) {
            // As the value represents the whole initializer of a variable declaration,
            // just refer to that variable. This e.g. helps to preserve closure comments
            // at the right place.
            const varParent = originalParent as ts.VariableDeclaration;
            if (varParent.name.kind === ts.SyntaxKind.Identifier) {
              const varName = varParent.name.text;
              const exportName = nodeRequest.name;
              declarations.push({
                name: exportName,
                node: ts.createIdentifier(varName),
                order: DeclarationOrder.AfterStmt
              });
              return node;
            }
          }
          // Record that the node needs to be moved to an exported variable with the given name
          const exportName = nodeRequest.name;
          declarations.push({name: exportName, node, order: DeclarationOrder.BeforeStmt});
          return ts.createIdentifier(exportName);
        }
        let result = node;
        if (shouldVisit(pos, end) && !isLexicalScope(node)) {
          result = ts.visitEachChild(node, visitNode, context);
        }
        return result;
      }

      // Get the original node before tsickle
      const {pos, end} = ts.getOriginalNode(node);
      let resultStmt: ts.Statement;
      if (shouldVisit(pos, end)) {
        resultStmt = ts.visitEachChild(node, visitNode, context);
      } else {
        resultStmt = node;
      }

      if (declarations.length) {
        inserts.push({relativeTo: resultStmt, declarations});
      }
      return resultStmt;
    }

    let newStatements = sourceFile.statements.map(topLevelStatement);

    if (inserts.length) {
      // Insert the declarations relative to the rewritten statement that references them.
      const insertMap = toMap(inserts, i => i.relativeTo);
      const tmpStatements: ts.Statement[] = [];
      newStatements.forEach(statement => {
        const insert = insertMap.get(statement);
        if (insert) {
          const before = insert.declarations.filter(d => d.order === DeclarationOrder.BeforeStmt);
          if (before.length) {
            tmpStatements.push(createVariableStatementForDeclarations(before));
          }
          tmpStatements.push(statement);
          const after = insert.declarations.filter(d => d.order === DeclarationOrder.AfterStmt);
          if (after.length) {
            tmpStatements.push(createVariableStatementForDeclarations(after));
          }
        } else {
          tmpStatements.push(statement);
        }
      });

      // Insert an exports clause to export the declarations
      tmpStatements.push(ts.createExportDeclaration(
          /* decorators */ undefined,
          /* modifiers */ undefined,
          ts.createNamedExports(
              inserts
                  .reduce(
                      (accumulator, insert) => [...accumulator, ...insert.declarations],
                      [] as Declaration[])
                  .map(
                      declaration => ts.createExportSpecifier(
                          /* propertyName */ undefined, declaration.name)))));

      newStatements = tmpStatements;
    }

    const newSf = ts.updateSourceFileNode(
        sourceFile, ts.setTextRange(ts.createNodeArray(newStatements), sourceFile.statements));
    if (!(sourceFile.flags & ts.NodeFlags.Synthesized)) {
      (newSf.flags as ts.NodeFlags) &= ~ts.NodeFlags.Synthesized;
    }

    return newSf;
  }

  return visitSourceFile(sourceFile);
}

function createVariableStatementForDeclarations(declarations: Declaration[]): ts.VariableStatement {
  const varDecls = declarations.map(
      i => ts.createVariableDeclaration(i.name, /* type */ undefined, i.node as ts.Expression));
  return ts.createVariableStatement(
      /* modifiers */ undefined, ts.createVariableDeclarationList(varDecls, ts.NodeFlags.Const));
}

export function getExpressionLoweringTransformFactory(
    requestsMap: RequestsMap, program: ts.Program): (context: ts.TransformationContext) =>
    (sourceFile: ts.SourceFile) => ts.SourceFile {
  // Return the factory
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile): ts.SourceFile => {
    // We need to use the original SourceFile for reading metadata, and not the transformed one.
    const originalFile = program.getSourceFile(sourceFile.fileName);
    if (originalFile) {
      const requests = requestsMap.getRequests(originalFile);
      if (requests && requests.size) {
        return transformSourceFile(sourceFile, requests, context);
      }
    }
    return sourceFile;
  };
}

export interface RequestsMap {
  getRequests(sourceFile: ts.SourceFile): RequestLocationMap;
}

function isEligibleForLowering(node: ts.Node|undefined): boolean {
  if (node) {
    switch (node.kind) {
      case ts.SyntaxKind.SourceFile:
      case ts.SyntaxKind.Decorator:
        // Lower expressions that are local to the module scope or
        // in a decorator.
        return true;
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.EnumDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
        // Don't lower expressions in a declaration.
        return false;
      case ts.SyntaxKind.VariableDeclaration:
        const isExported = (ts.getCombinedModifierFlags(node as ts.VariableDeclaration) &
                            ts.ModifierFlags.Export) == 0;
        // This might be unnecessary, as the variable might be exported and only used as a reference
        // in another expression. However, the variable also might be involved in provider
        // definitions. If that's the case, there is a specific token (`ROUTES`) which the compiler
        // attempts to understand deeply. Sub-expressions within that token (`loadChildren` for
        // example) might also require lowering even if the top-level declaration is already
        // properly exported.
        const varNode = node as ts.VariableDeclaration;
        return isExported ||
            (varNode.initializer !== undefined &&
             (ts.isObjectLiteralExpression(varNode.initializer) ||
              ts.isArrayLiteralExpression(varNode.initializer) ||
              ts.isCallExpression(varNode.initializer)));
    }
    return isEligibleForLowering(node.parent);
  }
  return true;
}

function isPrimitive(value: any): boolean {
  return Object(value) !== value;
}

function isRewritten(value: any): boolean {
  return isMetadataGlobalReferenceExpression(value) && isLoweredSymbol(value.name);
}

function isLiteralFieldNamed(node: ts.Node, names: Set<string>): boolean {
  if (node.parent && node.parent.kind == ts.SyntaxKind.PropertyAssignment) {
    const property = node.parent as ts.PropertyAssignment;
    if (property.parent && property.parent.kind == ts.SyntaxKind.ObjectLiteralExpression &&
        property.name && property.name.kind == ts.SyntaxKind.Identifier) {
      const propertyName = property.name as ts.Identifier;
      return names.has(propertyName.text);
    }
  }
  return false;
}

export class LowerMetadataTransform implements RequestsMap, MetadataTransformer {
  // TODO(issue/24571): remove '!'.
  private cache!: MetadataCache;
  private requests = new Map<string, RequestLocationMap>();
  private lowerableFieldNames: Set<string>;

  constructor(lowerableFieldNames: string[]) {
    this.lowerableFieldNames = new Set<string>(lowerableFieldNames);
  }

  // RequestMap
  getRequests(sourceFile: ts.SourceFile): RequestLocationMap {
    let result = this.requests.get(sourceFile.fileName);
    if (!result) {
      // Force the metadata for this source file to be collected which
      // will recursively call start() populating the request map;
      this.cache.getMetadata(sourceFile);

      // If we still don't have the requested metadata, the file is not a module
      // or is a declaration file so return an empty map.
      result = this.requests.get(sourceFile.fileName) || new Map<number, LoweringRequest>();
    }
    return result;
  }

  // MetadataTransformer
  connect(cache: MetadataCache): void {
    this.cache = cache;
  }

  start(sourceFile: ts.SourceFile): ValueTransform|undefined {
    let identNumber = 0;
    const freshIdent = () => createLoweredSymbol(identNumber++);
    const requests = new Map<number, LoweringRequest>();
    this.requests.set(sourceFile.fileName, requests);

    const replaceNode = (node: ts.Node) => {
      const name = freshIdent();
      requests.set(node.pos, {name, kind: node.kind, location: node.pos, end: node.end});
      return {__symbolic: 'reference', name};
    };

    const isExportedSymbol = (() => {
      let exportTable: Set<string>;
      return (node: ts.Node) => {
        if (node.kind == ts.SyntaxKind.Identifier) {
          const ident = node as ts.Identifier;

          if (!exportTable) {
            exportTable = createExportTableFor(sourceFile);
          }
          return exportTable.has(ident.text);
        }
        return false;
      };
    })();

    const isExportedPropertyAccess = (node: ts.Node) => {
      if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
        const pae = node as ts.PropertyAccessExpression;
        if (isExportedSymbol(pae.expression)) {
          return true;
        }
      }
      return false;
    };

    const hasLowerableParentCache = new Map<ts.Node, boolean>();

    const shouldBeLowered = (node: ts.Node|undefined): boolean => {
      if (node === undefined) {
        return false;
      }
      let lowerable: boolean = false;
      if ((node.kind === ts.SyntaxKind.ArrowFunction ||
           node.kind === ts.SyntaxKind.FunctionExpression) &&
          isEligibleForLowering(node)) {
        lowerable = true;
      } else if (
          isLiteralFieldNamed(node, this.lowerableFieldNames) && isEligibleForLowering(node) &&
          !isExportedSymbol(node) && !isExportedPropertyAccess(node)) {
        lowerable = true;
      }
      return lowerable;
    };

    const hasLowerableParent = (node: ts.Node|undefined): boolean => {
      if (node === undefined) {
        return false;
      }
      if (!hasLowerableParentCache.has(node)) {
        hasLowerableParentCache.set(
            node, shouldBeLowered(node.parent) || hasLowerableParent(node.parent));
      }
      return hasLowerableParentCache.get(node)!;
    };

    const isLowerable = (node: ts.Node|undefined): boolean => {
      if (node === undefined) {
        return false;
      }
      return shouldBeLowered(node) && !hasLowerableParent(node);
    };

    return (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (!isPrimitive(value) && !isRewritten(value) && isLowerable(node)) {
        return replaceNode(node);
      }
      return value;
    };
  }
}

function createExportTableFor(sourceFile: ts.SourceFile): Set<string> {
  const exportTable = new Set<string>();
  // Lazily collect all the exports from the source file
  ts.forEachChild(sourceFile, function scan(node) {
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
        if ((ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) != 0) {
          const classDeclaration =
              node as (ts.ClassDeclaration | ts.FunctionDeclaration | ts.InterfaceDeclaration);
          const name = classDeclaration.name;
          if (name) exportTable.add(name.text);
        }
        break;
      case ts.SyntaxKind.VariableStatement:
        const variableStatement = node as ts.VariableStatement;
        for (const declaration of variableStatement.declarationList.declarations) {
          scan(declaration);
        }
        break;
      case ts.SyntaxKind.VariableDeclaration:
        const variableDeclaration = node as ts.VariableDeclaration;
        if ((ts.getCombinedModifierFlags(variableDeclaration) & ts.ModifierFlags.Export) != 0 &&
            variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
          const name = variableDeclaration.name as ts.Identifier;
          exportTable.add(name.text);
        }
        break;
      case ts.SyntaxKind.ExportDeclaration:
        const exportDeclaration = node as ts.ExportDeclaration;
        const {moduleSpecifier, exportClause} = exportDeclaration;
        if (!moduleSpecifier && exportClause && ts.isNamedExports(exportClause)) {
          exportClause.elements.forEach(spec => {
            exportTable.add(spec.name.text);
          });
        }
    }
  });
  return exportTable;
}
