/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {CollectorOptions, MetadataCollector, MetadataValue, ModuleMetadata, isMetadataGlobalReferenceExpression} from '../metadata/index';

export interface LoweringRequest {
  kind: ts.SyntaxKind;
  location: number;
  end: number;
  name: string;
}

export type RequestLocationMap = Map<number, LoweringRequest>;

const enum DeclarationOrder { BeforeStmt, AfterStmt }

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
    // Note: We cannot use ts.updateSourcefile here as
    // it does not work well with decorators.
    // See https://github.com/Microsoft/TypeScript/issues/17384
    const newSf = ts.getMutableClone(sourceFile);
    if (!(sourceFile.flags & ts.NodeFlags.Synthesized)) {
      newSf.flags &= ~ts.NodeFlags.Synthesized;
    }
    newSf.statements = ts.setTextRange(ts.createNodeArray(newStatements), sourceFile.statements);
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

export function getExpressionLoweringTransformFactory(requestsMap: RequestsMap):
    (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) => ts.SourceFile {
  // Return the factory
  return (context: ts.TransformationContext) => (sourceFile: ts.SourceFile): ts.SourceFile => {
    const requests = requestsMap.getRequests(sourceFile);
    if (requests && requests.size) {
      return transformSourceFile(sourceFile, requests, context);
    }
    return sourceFile;
  };
}

export interface RequestsMap { getRequests(sourceFile: ts.SourceFile): RequestLocationMap; }

interface MetadataAndLoweringRequests {
  metadata: ModuleMetadata|undefined;
  requests: RequestLocationMap;
}

function shouldLower(node: ts.Node | undefined): boolean {
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
        // Avoid lowering expressions already in an exported variable declaration
        return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) == 0;
    }
    return shouldLower(node.parent);
  }
  return true;
}

const REWRITE_PREFIX = '\u0275';

function isPrimitive(value: any): boolean {
  return Object(value) !== value;
}

function isRewritten(value: any): boolean {
  return isMetadataGlobalReferenceExpression(value) && value.name.startsWith(REWRITE_PREFIX);
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

const LOWERABLE_FIELD_NAMES = new Set(['useValue', 'useFactory', 'data']);

export class LowerMetadataCache implements RequestsMap {
  private collector: MetadataCollector;
  private metadataCache = new Map<string, MetadataAndLoweringRequests>();

  constructor(options: CollectorOptions, private strict?: boolean) {
    this.collector = new MetadataCollector(options);
  }

  getMetadata(sourceFile: ts.SourceFile): ModuleMetadata|undefined {
    return this.ensureMetadataAndRequests(sourceFile).metadata;
  }

  getRequests(sourceFile: ts.SourceFile): RequestLocationMap {
    return this.ensureMetadataAndRequests(sourceFile).requests;
  }

  private ensureMetadataAndRequests(sourceFile: ts.SourceFile): MetadataAndLoweringRequests {
    let result = this.metadataCache.get(sourceFile.fileName);
    if (!result) {
      result = this.getMetadataAndRequests(sourceFile);
      this.metadataCache.set(sourceFile.fileName, result);
    }
    return result;
  }

  private getMetadataAndRequests(sourceFile: ts.SourceFile): MetadataAndLoweringRequests {
    let identNumber = 0;
    const freshIdent = () => REWRITE_PREFIX + identNumber++;
    const requests = new Map<number, LoweringRequest>();

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
    const replaceNode = (node: ts.Node) => {
      const name = freshIdent();
      requests.set(node.pos, {name, kind: node.kind, location: node.pos, end: node.end});
      return {__symbolic: 'reference', name};
    };

    const substituteExpression = (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (!isPrimitive(value) && !isRewritten(value)) {
        if ((node.kind === ts.SyntaxKind.ArrowFunction ||
             node.kind === ts.SyntaxKind.FunctionExpression) &&
            shouldLower(node)) {
          return replaceNode(node);
        }
        if (isLiteralFieldNamed(node, LOWERABLE_FIELD_NAMES) && shouldLower(node) &&
            !isExportedSymbol(node) && !isExportedPropertyAccess(node)) {
          return replaceNode(node);
        }
      }
      return value;
    };

    // Do not validate or lower metadata in a declaration file. Declaration files are requested
    // when we need to update the version of the metadata to add informatoin that might be missing
    // in the out-of-date version that can be recovered from the .d.ts file.
    const declarationFile = sourceFile.isDeclarationFile;

    const metadata = this.collector.getMetadata(
        sourceFile, this.strict && !declarationFile,
        declarationFile ? undefined : substituteExpression);

    return {metadata, requests};
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
        if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0) {
          const classDeclaration =
              node as(ts.ClassDeclaration | ts.FunctionDeclaration | ts.InterfaceDeclaration);
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
        if ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) != 0 &&
            variableDeclaration.name.kind == ts.SyntaxKind.Identifier) {
          const name = variableDeclaration.name as ts.Identifier;
          exportTable.add(name.text);
        }
        break;
      case ts.SyntaxKind.ExportDeclaration:
        const exportDeclaration = node as ts.ExportDeclaration;
        const {moduleSpecifier, exportClause} = exportDeclaration;
        if (!moduleSpecifier && exportClause) {
          exportClause.elements.forEach(spec => { exportTable.add(spec.name.text); });
        }
    }
  });
  return exportTable;
}
