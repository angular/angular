/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  getTcbNodesOfTemplateAtPosition,
  getTargetAtPosition,
} from '@angular/language-service/private';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {getSetup} from './type_checker_setup.js';
import {
  hasExpressionIdentifier,
  SymbolBuilder,
  SymbolBoundTarget,
  findFirstMatchingNode,
  SymbolDirectiveMeta,
  SymbolReference,
  ClassDeclaration,
} from '@angular/compiler-cli/private/hybrid_analysis';
import ts from 'typescript';
import {getTcbPath, isTcbFunction, offsetToPosition} from '../../src/tcb_ls_util.js';
import * as compiler from '@angular/compiler';

class HybridSymbolDirectiveMeta implements SymbolDirectiveMeta {
  constructor(private meta: compiler.TcbDirectiveMetadata) {}

  getSymbolReference(): SymbolReference {
    return {
      filePath: this.meta.ref.nodeFilePath ?? '',
      position: this.meta.ref.nodeNameSpan?.start || 0,
      name: this.meta.ref.name || '',
      moduleSpecifier: this.meta.ref.moduleName || undefined,
    };
  }

  getNgModule(): ClassDeclaration | null {
    return null;
  }

  getReferenceTargetNode(): ts.ClassDeclaration | null {
    return null;
  }

  get matchSource() {
    return this.meta.matchSource || compiler.MatchSource.Selector;
  }

  get isComponent() {
    return this.meta.isComponent || false;
  }

  get selector() {
    return this.meta.selector || null;
  }

  get isStructural() {
    return this.meta.isStructural || false;
  }

  get inputs() {
    return this.meta.inputs || compiler.ClassPropertyMapping.empty();
  }

  get outputs() {
    return this.meta.outputs || compiler.ClassPropertyMapping.empty();
  }

  get hostDirectives() {
    return null;
  }
}

class HybridSymbolBoundTarget implements SymbolBoundTarget {
  constructor(private boundTarget: compiler.BoundTarget<compiler.TcbDirectiveMetadata>) {}

  getDirectivesOfNode(node: compiler.TmplAstNode): SymbolDirectiveMeta[] | null {
    const dirs = this.boundTarget.getDirectivesOfNode(
      node as compiler.TmplAstElement | compiler.TmplAstTemplate,
    );
    if (!dirs) return null;
    return dirs.map((d: any) => new HybridSymbolDirectiveMeta(d));
  }

  getConsumerOfBinding(
    binding:
      compiler.TmplAstBoundAttribute | compiler.TmplAstBoundEvent | compiler.TmplAstTextAttribute,
  ): SymbolDirectiveMeta | compiler.TmplAstElement | compiler.TmplAstTemplate | null {
    const consumer = this.boundTarget.getConsumerOfBinding(binding);
    if (!consumer) return null;

    if (
      consumer instanceof compiler.TmplAstElement ||
      consumer instanceof compiler.TmplAstTemplate
    ) {
      return consumer;
    }

    return new HybridSymbolDirectiveMeta(consumer);
  }

  getReferenceTarget(
    ref: compiler.TmplAstReference,
  ): compiler.ReferenceTarget<SymbolDirectiveMeta> | null {
    const target = this.boundTarget.getReferenceTarget(ref);
    if (!target) return null;
    if ('directive' in target) {
      return {
        directive: new HybridSymbolDirectiveMeta(target.directive),
        node: target.node,
      };
    }
    return target;
  }

  getExpressionTarget(expr: compiler.AST): compiler.TemplateEntity | null {
    return this.boundTarget.getExpressionTarget(expr);
  }
}

export interface TcbResult {
  code: string;
  selections: {
    start: {line: number; character: number};
    end: {line: number; character: number};
    isDirective?: boolean;
  }[];
  filePath: string;
  tsFilePath?: string;
}

export class TemplateTypeChecker {
  constructor(private hybridCompiler: HybridCompiler) {}

  public getTcb(filePath: string, position: {line: number; character: number}): TcbResult | null {
    const setup = getSetup(this.hybridCompiler, filePath, position);
    if (!setup) return null;

    const {parsedTemplate, offset, tcbSf, tcbCode, tsFilePath, isHostBinding, hostElement} = setup;
    const tcbPath = getTcbPath(tsFilePath);

    let target;
    if (isHostBinding && hostElement) {
      target = getTargetAtPosition([hostElement], offset);
    } else {
      target = getTargetAtPosition(parsedTemplate.nodes, offset);
    }

    if (!target) {
      return {
        code: tcbCode,
        selections: [],
        filePath: tcbPath,
      };
    }
    let tcbNodes: ts.Node[] | null = null;
    const contextNode = (target.context as any)?.node;

    const isPropertyRead =
      contextNode instanceof compiler.PropertyRead ||
      contextNode instanceof compiler.SafePropertyRead ||
      contextNode instanceof compiler.SafeCall ||
      contextNode instanceof compiler.SafeKeyedRead ||
      contextNode instanceof compiler.LiteralPrimitive;

    if (isPropertyRead) {
      const nameSpan = (contextNode as any).nameSpan || contextNode.sourceSpan;
      const tsNode = nameSpan
        ? findFirstMatchingNode(tcbSf, {
            withSpan: nameSpan,
            filter: (node: ts.Node): node is ts.Identifier | ts.StringLiteral =>
              ts.isIdentifier(node) || ts.isStringLiteral(node),
          })
        : null;
      if (tsNode) {
        tcbNodes = [tsNode];
      }
    } else if (contextNode instanceof compiler.TmplAstVariable) {
      const nameSpan =
        contextNode.keySpan || (contextNode as any).nameSpan || contextNode.sourceSpan;
      if (nameSpan) {
        const tsNode = findFirstMatchingNode(tcbSf, {
          withSpan: nameSpan,
          filter: (node: ts.Node): node is ts.Identifier => ts.isIdentifier(node),
        });
        if (tsNode) {
          tcbNodes = [tsNode];
        }
      }
    }

    if (!tcbNodes || tcbNodes.length === 0) {
      const tcbNodesInfo = getTcbNodesOfTemplateAtPosition(parsedTemplate.nodes, offset, tcbSf);
      tcbNodes = tcbNodesInfo ? tcbNodesInfo.nodes : null;
    }

    const selections = tcbNodes
      ? tcbNodes.map((n) => {
          const start = offsetToPosition(tcbCode, n.getStart(tcbSf));
          const end = offsetToPosition(tcbCode, n.getEnd());
          const isDirective = isDirectiveTarget(tcbSf, n);
          return {start, end, isDirective};
        })
      : [];

    return {
      code: tcbCode,
      selections,
      filePath: tcbPath,
      tsFilePath,
    };
  }

  public getSymbolOfNode(
    filePath: string,
    position: {line: number; character: number},
  ): any | null {
    const setup = getSetup(this.hybridCompiler, filePath, position);
    if (!setup) return null;

    const {tsFilePath, meta, parsedTemplate, offset, tcbSf, isHostBinding, hostElement} = setup;

    let target;
    if (isHostBinding && hostElement) {
      target = getTargetAtPosition([hostElement], offset);
    } else {
      target = getTargetAtPosition(parsedTemplate.nodes, offset);
    }
    if (!target) {
      return null;
    }

    const node = 'nodes' in target.context ? target.context.nodes[0] : target.context.node;
    if (!node) {
      return null;
    }

    return this.getSymbolForNode(node, tsFilePath, meta.classKey, tcbSf);
  }

  public getSymbolForNode(
    node: compiler.TmplAstNode | compiler.AST,
    tsFilePath: string,
    classKey: string,
    tcbSf: ts.SourceFile,
  ): any | null {
    const boundTarget = this.hybridCompiler.getBoundTarget(tsFilePath, classKey);
    if (!boundTarget) return null;

    const typeCheckIdMap = this.hybridCompiler.getTypeCheckIdMap(tsFilePath);
    const typeCheckId = typeCheckIdMap?.get(classKey);
    if (!typeCheckId) return null;

    let tcbBlock: ts.Node | null = null;
    function visit(n: ts.Node) {
      if (isTcbFunction(n, typeCheckId)) {
        tcbBlock = n;
      } else {
        ts.forEachChild(n, visit);
      }
    }
    visit(tcbSf);

    if (!tcbBlock) return null;

    const tcbPath = getTcbPath(tsFilePath);
    const builder = new SymbolBuilder(
      tcbPath as any,
      true, // tcbIsShim
      tcbBlock,
      new HybridSymbolBoundTarget(boundTarget),
      this.hybridCompiler.tcbConfig,
    );

    return builder.getSymbol(node);
  }
}

function isDirectiveTarget(tcbSf: ts.SourceFile, node: ts.Node): boolean {
  let baseIdentifier: ts.Identifier | null = null;

  // strip parenthesis and as expressions
  let expr = node;
  if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    expr = expr.left;
  }

  if (ts.isPropertyAccessExpression(expr) || ts.isElementAccessExpression(expr)) {
    let inner = expr.expression as ts.Expression;
    while (
      ts.isParenthesizedExpression(inner) ||
      ts.isAsExpression(inner) ||
      ts.isNonNullExpression(inner)
    ) {
      if (ts.isParenthesizedExpression(inner)) inner = inner.expression;
      else if (ts.isAsExpression(inner)) inner = inner.expression;
      else if (ts.isNonNullExpression(inner)) inner = inner.expression;
    }
    if (ts.isIdentifier(inner)) baseIdentifier = inner;
  } else if (ts.isIdentifier(expr)) {
    baseIdentifier = expr;
  }

  if (!baseIdentifier) {
    return false;
  }

  const varName = baseIdentifier.text;
  let isDir = false;

  function visit(n: ts.Node) {
    if (isDir) return;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === varName) {
      const typeOrName = n.type ?? n.name;
      const hasTDir =
        hasExpressionIdentifier(tcbSf, typeOrName, compiler.ExpressionIdentifier.DIRECTIVE) ||
        hasExpressionIdentifier(tcbSf, typeOrName, compiler.ExpressionIdentifier.HOST_DIRECTIVE);
      if (hasTDir) {
        isDir = true;
      }
    } else {
      ts.forEachChild(n, visit);
    }
  }

  visit(tcbSf);
  return isDir;
}
