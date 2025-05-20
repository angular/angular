/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ParseLocation,
  ParseSourceSpan,
  TmplAstBlockNode,
  TmplAstDeferredBlock,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import ts from 'typescript';

import {getFirstComponentForTemplateFile, isTypeScriptFile, toTextSpan} from './utils';

export function getOutliningSpans(compiler: NgCompiler, fileName: string): ts.OutliningSpan[] {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return [];
    }

    const templatesInFile: Array<TmplAstNode[]> = [];
    for (const stmt of sf.statements) {
      if (isNamedClassDeclaration(stmt)) {
        const resources = compiler.getDirectiveResources(stmt);
        if (
          resources === null ||
          resources.template === null ||
          isExternalResource(resources.template)
        ) {
          continue;
        }
        const template = compiler.getTemplateTypeChecker().getTemplate(stmt);
        if (template === null) {
          continue;
        }
        templatesInFile.push(template);
      }
    }
    return templatesInFile.map((template) => BlockVisitor.getBlockSpans(template)).flat();
  } else {
    const typeCheckInfo = getFirstComponentForTemplateFile(fileName, compiler);
    return typeCheckInfo === undefined ? [] : BlockVisitor.getBlockSpans(typeCheckInfo.nodes);
  }
}

class BlockVisitor extends TmplAstRecursiveVisitor {
  readonly blocks = [] as Array<TmplAstBlockNode>;

  static getBlockSpans(templateNodes: TmplAstNode[]): ts.OutliningSpan[] {
    const visitor = new BlockVisitor();
    tmplAstVisitAll(visitor, templateNodes);
    const {blocks} = visitor;
    return blocks.map((block) => {
      let mainBlockSpan = block.sourceSpan;
      // The source span of for loops and deferred blocks contain all parts (ForLoopBlockEmpty,
      // DeferredBlockLoading, etc.). The folding range should only include the main block span for
      // these.
      if (block instanceof TmplAstForLoopBlock || block instanceof TmplAstDeferredBlock) {
        mainBlockSpan = block.mainBlockSpan;
      }
      return {
        // We move the end back 1 character so we do not consume the close brace of the block in the
        // range.
        textSpan: toTextSpan(
          new ParseSourceSpan(block.startSourceSpan.end, mainBlockSpan.end.moveBy(-1)),
        ),
        hintSpan: toTextSpan(block.startSourceSpan),
        bannerText: '...',
        autoCollapse: false,
        kind: ts.OutliningSpanKind.Region,
      };
    });
  }

  visit(node: TmplAstNode) {
    if (
      node instanceof TmplAstBlockNode &&
      // Omit `IfBlock` because we include the branches individually
      !(node instanceof TmplAstIfBlock)
    ) {
      this.blocks.push(node);
    }
    node.visit(this);
  }
}
