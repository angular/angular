/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CollectorOptions, MetadataCollector, MetadataValue, ModuleMetadata} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

export interface LoweringRequest {
  kind: ts.SyntaxKind;
  location: number;
  end: number;
  name: string;
}

export type RequestLocationMap = Map<number, LoweringRequest>;

interface Declaration {
  name: string;
  node: ts.Node;
}

interface DeclarationInsert {
  declarations: Declaration[];
  priorTo: ts.Node;
}

function toMap<T, K>(items: T[], select: (item: T) => K): Map<K, T> {
  return new Map(items.map<[K, T]>(i => [select(i), i]));
}

function transformSourceFile(
    sourceFile: ts.SourceFile, requests: RequestLocationMap,
    context: ts.TransformationContext): ts.SourceFile {
  const inserts: DeclarationInsert[] = [];

  // Calculate the range of intersting locations. The transform will only visit nodes in this
  // range to improve the performance on large files.
  const locations = Array.from(requests.keys());
  const min = Math.min(...locations);
  const max = Math.max(...locations);

  function visitSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
    function topLevelStatement(node: ts.Node): ts.Node {
      const declarations: Declaration[] = [];

      function visitNode(node: ts.Node): ts.Node {
        const nodeRequest = requests.get(node.pos);
        if (nodeRequest && nodeRequest.kind == node.kind && nodeRequest.end == node.end) {
          // This node is requested to be rewritten as a reference to the exported name.
          // Record that the node needs to be moved to an exported variable with the given name
          const name = nodeRequest.name;
          declarations.push({name, node});
          return ts.createIdentifier(name);
        }
        if (node.pos <= max && node.end >= min) return ts.visitEachChild(node, visitNode, context);
        return node;
      }

      const result = ts.visitEachChild(node, visitNode, context);

      if (declarations.length) {
        inserts.push({priorTo: result, declarations});
      }
      return result;
    }

    const traversedSource = ts.visitEachChild(sourceFile, topLevelStatement, context);
    if (inserts.length) {
      // Insert the declarations before the rewritten statement that references them.
      const insertMap = toMap(inserts, i => i.priorTo);
      const newStatements: ts.Statement[] = [...traversedSource.statements];
      for (let i = newStatements.length; i >= 0; i--) {
        const statement = newStatements[i];
        const insert = insertMap.get(statement);
        if (insert) {
          const declarations = insert.declarations.map(
              i => ts.createVariableDeclaration(
                  i.name, /* type */ undefined, i.node as ts.Expression));
          const statement = ts.createVariableStatement(
              /* modifiers */ undefined,
              ts.createVariableDeclarationList(declarations, ts.NodeFlags.Const));
          newStatements.splice(i, 0, statement);
        }
      }

      // Insert an exports clause to export the declarations
      newStatements.push(ts.createExportDeclaration(
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
      return ts.updateSourceFileNode(traversedSource, newStatements);
    }
    return traversedSource;
  }

  return visitSourceFile(sourceFile);
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
    const freshIdent = () => '\u0275' + identNumber++;
    const requests = new Map<number, LoweringRequest>();
    const replaceNode = (node: ts.Node) => {
      const name = freshIdent();
      requests.set(node.pos, {name, kind: node.kind, location: node.pos, end: node.end});
      return {__symbolic: 'reference', name};
    };

    const substituteExpression = (value: MetadataValue, node: ts.Node): MetadataValue => {
      if (node.kind === ts.SyntaxKind.ArrowFunction ||
          node.kind === ts.SyntaxKind.FunctionExpression) {
        return replaceNode(node);
      }
      return value;
    };

    const metadata = this.collector.getMetadata(sourceFile, this.strict, substituteExpression);

    return {metadata, requests};
  }
}