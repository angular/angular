/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TmplAstDeferredBlock,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlock,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstTemplate,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import ts from 'typescript';

import {getFirstComponentForTemplateFile, isTypeScriptFile, toTextSpan} from './utils';

/**
 * Augments the navigation tree provided by the TypeScript language service with
 * Angular template control flow blocks (`@if`, `@for`, `@switch`, `@defer`) and
 * HTML elements. This enables VS Code features like Sticky Scroll and the
 * document outline to display Angular-specific template structures.
 */
export function getNavigationTree(
  compiler: NgCompiler,
  tsNavigationTree: ts.NavigationTree,
  fileName: string,
): ts.NavigationTree {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return tsNavigationTree;
    }

    // Find inline templates and inject navigation items into the TS tree.
    for (const stmt of sf.statements) {
      if (!isNamedClassDeclaration(stmt)) {
        continue;
      }
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

      const templateChildren = buildNavigationTreeForTemplate(template);
      if (templateChildren.length > 0) {
        injectChildrenIntoTree(tsNavigationTree, templateChildren, stmt.name!);
      }
    }

    return tsNavigationTree;
  } else {
    // External template file: build a standalone navigation tree.
    const typeCheckInfo = getFirstComponentForTemplateFile(fileName, compiler);
    if (typeCheckInfo === undefined) {
      return tsNavigationTree;
    }
    const children = buildNavigationTreeForTemplate(typeCheckInfo.nodes);
    if (children.length === 0) {
      return tsNavigationTree;
    }
    return {
      text: '<template>',
      kind: ts.ScriptElementKind.unknown,
      kindModifiers: '',
      spans: [ts.createTextSpanFromBounds(0, 0)],
      nameSpan: undefined,
      childItems: children,
    };
  }
}

/**
 * Injects Angular template navigation children into the appropriate location
 * in the existing TypeScript navigation tree. We find the class node matching
 * the component declaration and add the template children as nested items.
 */
function injectChildrenIntoTree(
  tree: ts.NavigationTree,
  templateChildren: ts.NavigationTree[],
  className: ts.Identifier,
): void {
  if (tree.childItems) {
    for (const child of tree.childItems) {
      if (child.text === className.text && child.kind === ts.ScriptElementKind.classElement) {
        // Find or create the `template` property node
        child.childItems = [...(child.childItems ?? []), ...templateChildren];
        return;
      }
      injectChildrenIntoTree(child, templateChildren, className);
    }
  }
}

function buildNavigationTreeForTemplate(nodes: TmplAstNode[]): ts.NavigationTree[] {
  const visitor = new NavigationTreeVisitor();
  tmplAstVisitAll(visitor, nodes);
  return visitor.items;
}

class NavigationTreeVisitor extends TmplAstRecursiveVisitor {
  readonly items: ts.NavigationTree[] = [];

  override visitElement(element: TmplAstElement): void {
    const children = buildNavigationTreeForTemplate(element.children);
    const item: ts.NavigationTree = {
      text: `<${element.name}>`,
      kind: ts.ScriptElementKind.jsxAttribute,
      kindModifiers: '',
      spans: [toTextSpan(element.sourceSpan)],
      nameSpan: toTextSpan(element.startSourceSpan),
      childItems: children.length > 0 ? children : undefined,
    };
    this.items.push(item);
  }

  override visitTemplate(template: TmplAstTemplate): void {
    const tagName = template.tagName ?? 'ng-template';
    const children = buildNavigationTreeForTemplate(template.children);
    const item: ts.NavigationTree = {
      text: `<${tagName}>`,
      kind: ts.ScriptElementKind.jsxAttribute,
      kindModifiers: '',
      spans: [toTextSpan(template.sourceSpan)],
      nameSpan: toTextSpan(template.startSourceSpan),
      childItems: children.length > 0 ? children : undefined,
    };
    this.items.push(item);
  }

  override visitIfBlock(block: TmplAstIfBlock): void {
    const branchItems: ts.NavigationTree[] = [];
    for (const branch of block.branches) {
      const label = branch.expression ? '@if' : '@else';
      const children = buildNavigationTreeForTemplate(branch.children);
      branchItems.push({
        text: label,
        kind: ts.ScriptElementKind.label,
        kindModifiers: '',
        spans: [toTextSpan(branch.sourceSpan)],
        nameSpan: toTextSpan(branch.startSourceSpan),
        childItems: children.length > 0 ? children : undefined,
      });
    }

    const item: ts.NavigationTree = {
      text: '@if',
      kind: ts.ScriptElementKind.label,
      kindModifiers: '',
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
      childItems: branchItems.length > 0 ? branchItems : undefined,
    };
    this.items.push(item);
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    const children = buildNavigationTreeForTemplate(block.children);
    const childItems: ts.NavigationTree[] = children;

    if (block.empty) {
      const emptyChildren = buildNavigationTreeForTemplate(block.empty.children);
      childItems.push({
        text: '@empty',
        kind: ts.ScriptElementKind.label,
        kindModifiers: '',
        spans: [toTextSpan(block.empty.sourceSpan)],
        nameSpan: toTextSpan(block.empty.startSourceSpan),
        childItems: emptyChildren.length > 0 ? emptyChildren : undefined,
      });
    }

    const item: ts.NavigationTree = {
      text: '@for',
      kind: ts.ScriptElementKind.label,
      kindModifiers: '',
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
      childItems: childItems.length > 0 ? childItems : undefined,
    };
    this.items.push(item);
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    const caseItems: ts.NavigationTree[] = [];
    for (const group of block.groups) {
      for (const caseNode of group.cases) {
        const label = caseNode.expression ? '@case' : '@default';
        const children = buildNavigationTreeForTemplate(group.children);
        caseItems.push({
          text: label,
          kind: ts.ScriptElementKind.label,
          kindModifiers: '',
          spans: [toTextSpan(group.sourceSpan)],
          nameSpan: toTextSpan(caseNode.startSourceSpan),
          childItems: children.length > 0 ? children : undefined,
        });
      }
    }

    const item: ts.NavigationTree = {
      text: '@switch',
      kind: ts.ScriptElementKind.label,
      kindModifiers: '',
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
      childItems: caseItems.length > 0 ? caseItems : undefined,
    };
    this.items.push(item);
  }

  override visitDeferredBlock(block: TmplAstDeferredBlock): void {
    const children = buildNavigationTreeForTemplate(block.children);
    const item: ts.NavigationTree = {
      text: '@defer',
      kind: ts.ScriptElementKind.label,
      kindModifiers: '',
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
      childItems: children.length > 0 ? children : undefined,
    };
    this.items.push(item);
  }
}
