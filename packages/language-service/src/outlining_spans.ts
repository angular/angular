/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseLocation, ParseSourceSpan} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as t from '@angular/compiler/src/render3/r3_ast';  // t for template AST
import ts from 'typescript';

import {getFirstComponentForTemplateFile, isTypeScriptFile, toTextSpan} from './utils';

export function getOutliningSpans(compiler: NgCompiler, fileName: string): ts.OutliningSpan[] {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return [];
    }

    const templatesInFile: Array<t.Node[]> = [];
    for (const stmt of sf.statements) {
      if (isNamedClassDeclaration(stmt)) {
        const resources = compiler.getComponentResources(stmt);
        if (resources === null || isExternalResource(resources.template)) {
          continue;
        }
        const template = compiler.getTemplateTypeChecker().getTemplate(stmt);
        if (template === null) {
          continue;
        }
        templatesInFile.push(template);
      }
    }
    return templatesInFile.map(template => BlockVisitor.getBlockSpans(template)).flat();
  } else {
    const templateInfo = getFirstComponentForTemplateFile(fileName, compiler);
    if (templateInfo === undefined) {
      return [];
    }
    const {template} = templateInfo;
    return BlockVisitor.getBlockSpans(template);
  }
}

class BlockVisitor extends t.RecursiveVisitor {
  readonly blocks = [] as Array<t.BlockNode>;

  static getBlockSpans(templateNodes: t.Node[]): ts.OutliningSpan[] {
    const visitor = new BlockVisitor();
    t.visitAll(visitor, templateNodes);
    const {blocks} = visitor;
    return blocks.map(block => {
      let mainBlockSpan = block.sourceSpan;
      // The source span of for loops and deferred blocks contain all parts (ForLoopBlockEmpty,
      // DeferredBlockLoading, etc.). The folding range should only include the main block span for
      // these.
      if (block instanceof t.ForLoopBlock || block instanceof t.DeferredBlock) {
        mainBlockSpan = block.mainBlockSpan;
      }
      return {
        // We move the end back 1 character so we do not consume the close brace of the block in the
        // range.
        textSpan: toTextSpan(
            new ParseSourceSpan(block.startSourceSpan.end, mainBlockSpan.end.moveBy(-1))),
        hintSpan: toTextSpan(block.startSourceSpan),
        bannerText: '...',
        autoCollapse: false,
        kind: ts.OutliningSpanKind.Region,
      };
    });
  }

  visit(node: t.Node) {
    if (node instanceof t.BlockNode
        // Omit `IfBlock` because we include the branches individually
        && !(node instanceof t.IfBlock)) {
      this.blocks.push(node);
    }
  }
}
