/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  AST,
  ASTWithSource,
  BindingPipe,
  EmptyExpr,
  ImplicitReceiver,
  LiteralPrimitive,
  ParseLocation,
  ParseSourceSpan,
  ParseSpan,
  PropertyRead,
  SafePropertyRead,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstTemplate,
  TmplAstText,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockPlaceholder,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockError,
  BoundTarget,
  ScopedNode,
  CssSelector,
  ExpressionIdentifier,
} from '@angular/compiler';
import {findFirstMatchingNode} from '@angular/compiler-cli/private/hybrid_analysis';
import {
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  InsertTextFormat,
} from 'vscode-languageserver';

import ts from 'typescript';

import {
  addAttributeCompletionEntries,
  AttributeCompletionKind,
  buildAnimationCompletionEntries,
  buildAttributeCompletionTable,
} from './attribute_completions.js';
import {
  getTargetAtPosition,
  TargetContext,
  TargetNodeKind,
  TemplateTarget,
} from '@angular/language-service/private';
import {isBoundEventWithSyntheticHandler, isWithin} from './utils.js';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {TemplateTypeChecker} from './type_checker.js';
import {TsGoFacade} from './facade.js';
import {getSetup, SetupResult} from './type_checker_setup.js';
import {offsetToPosition} from '../../src/tcb_ls_util.js';

export enum CompletionNodeContext {
  None,
  ElementTag,
  ElementAttributeKey,
  ElementAttributeValue,
  EventValue,
  TwoWayBinding,
}

function buildBlockSnippet(insertSnippet: boolean, blockName: string, withParens: boolean): string {
  if (!insertSnippet) {
    return blockName;
  }
  if (blockName === 'for') {
    return `${blockName} (\${1:item} of \${2:items}; track \${3:\\$index}) {$4}`;
  }
  if (withParens) {
    return `${blockName} ($1) {$2}`;
  }
  return `${blockName} {$1}`;
}

export class CompletionBuilder {
  private readonly node: AST | TmplAstNode;
  private readonly nodeParent: AST | TmplAstNode | null;
  private readonly nodeContext: CompletionNodeContext;
  private readonly template: TmplAstTemplate | null;
  private readonly position: number;

  constructor(
    private readonly hybridCompiler: HybridCompiler,
    private readonly templateTypeChecker: TemplateTypeChecker,
    private readonly facade: TsGoFacade,
    private readonly setup: SetupResult,
    private readonly targetDetails: TemplateTarget,
  ) {
    this.node =
      this.targetDetails.context.kind === TargetNodeKind.TwoWayBindingContext
        ? this.targetDetails.context.nodes[0]
        : this.targetDetails.context.node;
    this.nodeParent = this.targetDetails.parent;
    this.nodeContext = nodeContextFromTarget(this.targetDetails.context);
    this.template = this.targetDetails.template;
    this.position = this.targetDetails.position;
  }

  async getCompletions(): Promise<CompletionList | null> {
    if (this.isPropertyExpressionCompletion()) {
      return this.getPropertyExpressionCompletion();
    } else if (this.isElementTagCompletion()) {
      return this.getElementTagCompletion();
    } else if (this.isElementAttributeCompletion()) {
      if (this.isAnimationCompletion()) {
        return this.getAnimationCompletions();
      } else {
        return this.getElementAttributeCompletions();
      }
    } else if (this.isPipeCompletion()) {
      return this.getPipeCompletions();
    } else if (this.isLiteralCompletion()) {
      return this.getLiteralCompletions();
    } else if (this.isLetCompletion()) {
      return this.getGlobalPropertyExpressionCompletion();
    } else if (this.isBlockCompletion()) {
      return this.getBlockCompletions();
    } else {
      return null;
    }
  }

  async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem | null> {
    let entry = item;
    if (!entry.data) {
      const tcbUri = this.setup.tsFilePath.replace(/\.ts$/, '.ngtypecheck.ts');
      await this.facade.ensureDocument(tcbUri, this.setup.tcbCode);
      const globalRead = findFirstMatchingNode(this.setup.tcbSf, {
        filter: (n: ts.Node): n is ts.PropertyAccessExpression =>
          ts.isPropertyAccessExpression(n) &&
          (n.expression.kind === ts.SyntaxKind.ThisKeyword ||
            (ts.isIdentifier(n.expression) &&
              n.expression.text === ExpressionIdentifier.COMPONENT_COMPLETION)),
      });
      if (globalRead) {
        const componentCtxPos = offsetToPosition(this.setup.tcbCode, globalRead.name.getStart());
        const completions = await this.facade.getCompletionsAtPosition(tcbUri, componentCtxPos);
        const match = completions?.items.find((it: CompletionItem) => it.label === entry.label);
        if (match) {
          entry = match;
        }
      }
    }

    if (entry.data) {
      const resolved = await this.facade.resolveCompletionItem(entry);
      if (resolved) {
        return resolved;
      }
    }

    const resolvedDeclarations: any[] = this.setup.meta?.resolvedDeclarations || [];
    const dir = resolvedDeclarations.find(
      (d) => d.name === item.label || d.selector === item.label,
    );
    if (dir) {
      const kind = dir.isComponent ? 'component' : 'directive';
      item.detail = item.detail ?? createDisplayString(dir.name, kind, undefined, undefined);
      return item;
    }

    return entry;
  }

  private isLetCompletion(): boolean {
    return (
      this.node instanceof TmplAstLetDeclaration ||
      this.nodeParent instanceof TmplAstLetDeclaration ||
      (this.node instanceof TmplAstText && /@let\b/.test(this.node.value))
    );
  }

  private isBlockCompletion(): boolean {
    if (this.node instanceof TmplAstText) {
      return /@[a-z\s]*$/.test(this.node.value);
    }
    return this.node instanceof TmplAstSwitchBlock;
  }

  private isPropertyExpressionCompletion(): boolean {
    return (
      this.node instanceof PropertyRead ||
      this.node instanceof SafePropertyRead ||
      this.node instanceof EmptyExpr ||
      (this.node instanceof TmplAstBoundEvent &&
        this.nodeContext === CompletionNodeContext.EventValue)
    );
  }

  private async getPropertyExpressionCompletion(): Promise<CompletionList | null> {
    if (
      this.node instanceof EmptyExpr ||
      this.node instanceof TmplAstBoundEvent ||
      (this.node instanceof PropertyRead &&
        (this.node.receiver instanceof ImplicitReceiver ||
          this.node.receiver instanceof ThisReceiver))
    ) {
      return this.getGlobalPropertyExpressionCompletion();
    }

    const node = this.node as PropertyRead | SafePropertyRead;
    let tsExpr =
      findFirstMatchingNode(this.setup.tcbSf, {
        filter: ts.isPropertyAccessExpression,
        withSpan: node.nameSpan,
      }) ??
      findFirstMatchingNode(this.setup.tcbSf, {
        filter: ts.isPropertyAccessExpression,
        withSpan: (node as any).sourceSpan,
      });

    if (!tsExpr && node instanceof SafePropertyRead) {
      const ternaryExpr = findFirstMatchingNode(this.setup.tcbSf, {
        filter: ts.isParenthesizedExpression,
        withSpan: node.sourceSpan,
      });
      if (ternaryExpr && ts.isConditionalExpression(ternaryExpr.expression)) {
        const whenTrue = ternaryExpr.expression.whenTrue;
        if (ts.isPropertyAccessExpression(whenTrue)) {
          tsExpr = whenTrue;
        } else if (
          ts.isCallExpression(whenTrue) &&
          ts.isPropertyAccessExpression(whenTrue.expression)
        ) {
          tsExpr = whenTrue.expression;
        }
      }
    }

    if (
      !tsExpr &&
      node.receiver &&
      !(node.receiver instanceof ImplicitReceiver) &&
      !(node.receiver instanceof ThisReceiver)
    ) {
      const receiverName = (node.receiver as any).name;
      tsExpr = findFirstMatchingNode(this.setup.tcbSf, {
        filter: (n: ts.Node): n is ts.PropertyAccessExpression => {
          if (!ts.isPropertyAccessExpression(n)) return false;
          let expr: ts.Expression = n.expression;
          while (ts.isParenthesizedExpression(expr)) {
            expr = expr.expression;
          }
          if (receiverName && ts.isIdentifier(expr) && expr.text === receiverName) return true;
          return ts.isPropertyAccessExpression(expr);
        },
      });
    }

    if (!tsExpr) {
      return null;
    }

    const tcbUri = this.setup.tsFilePath.replace(/\.ts$/, '.ngtypecheck.ts');
    await this.facade.ensureDocument(tcbUri, this.setup.tcbCode);
    const targetOffset =
      tsExpr.name && tsExpr.name.getStart() > 0 ? tsExpr.name.getStart() : tsExpr.getEnd();
    const tcbPos = offsetToPosition(this.setup.tcbCode, targetOffset);
    return this.facade.getCompletionsAtPosition(tcbUri, tcbPos);
  }

  private async getGlobalPropertyExpressionCompletion(): Promise<CompletionList | null> {
    const tcbUri = this.setup.tsFilePath.replace(/\.ts$/, '.ngtypecheck.ts');
    await this.facade.ensureDocument(tcbUri, this.setup.tcbCode);

    const globalRead = findFirstMatchingNode(this.setup.tcbSf, {
      filter: (n: ts.Node): n is ts.PropertyAccessExpression =>
        ts.isPropertyAccessExpression(n) &&
        (n.expression.kind === ts.SyntaxKind.ThisKeyword ||
          (ts.isIdentifier(n.expression) &&
            n.expression.text === ExpressionIdentifier.COMPONENT_COMPLETION)),
    });

    let tsCompletions: CompletionList | null = null;
    if (globalRead) {
      const componentCtxPos = offsetToPosition(this.setup.tcbCode, globalRead.name.getStart());
      tsCompletions = await this.facade.getCompletionsAtPosition(tcbUri, componentCtxPos);
    }

    const items: CompletionItem[] = tsCompletions ? [...tsCompletions.items] : [];

    let astNodeLocation: ts.Node | null = null;
    if (this.node instanceof EmptyExpr) {
      astNodeLocation = findFirstMatchingNode(this.setup.tcbSf, {
        filter: (n: ts.Node): n is ts.Node => true,
        withSpan: this.node.sourceSpan,
      });
    } else if (
      this.node instanceof PropertyRead &&
      (this.node.receiver instanceof ImplicitReceiver || this.node.receiver instanceof ThisReceiver)
    ) {
      astNodeLocation =
        findFirstMatchingNode(this.setup.tcbSf, {
          filter: ts.isPropertyAccessExpression,
          withSpan: this.node.sourceSpan,
        }) ??
        findFirstMatchingNode(this.setup.tcbSf, {
          filter: (n: ts.Node): n is ts.Node => true,
          withSpan: this.node.sourceSpan,
        });
    }

    if (astNodeLocation) {
      const astPos = offsetToPosition(this.setup.tcbCode, astNodeLocation.getStart());
      const astCompletions = await this.facade.getCompletionsAtPosition(tcbUri, astPos);
      if (astCompletions) {
        for (const it of astCompletions.items) {
          if (
            it.kind === CompletionItemKind.Value ||
            it.kind === CompletionItemKind.Keyword ||
            (it.kind === CompletionItemKind.Variable && it.label === 'undefined')
          ) {
            if (!items.some((existing) => existing.label === it.label)) {
              items.push(it);
            }
          }
        }
      }
    }

    if (this.setup.parsedTemplate.nodes) {
      const boundTarget = this.hybridCompiler.getBoundTarget(
        this.setup.tsFilePath,
        this.setup.meta.classKey,
      );
      const inScopeEntities = collectAllEntitiesInScope(
        this.setup.parsedTemplate.nodes,
        this.position,
        boundTarget,
      );
      for (const entity of inScopeEntities.values()) {
        if (!items.some((it) => it.label === entity.name)) {
          items.push({
            label: entity.name,
            kind: entity.kind,
            sortText: entity.name,
            detail: entity.detail,
          });
        }
      }
    }

    return {
      isIncomplete: tsCompletions?.isIncomplete ?? false,
      items,
    };
  }

  private isElementTagCompletion(): boolean {
    if (this.nodeContext === CompletionNodeContext.ElementTag) {
      return true;
    }
    if (this.node instanceof TmplAstText) {
      const positionInTextNode = this.position - this.node.sourceSpan.start.offset;
      return this.node.value.substring(0, positionInTextNode).endsWith('<');
    }
    return false;
  }

  private getElementTagCompletion(): CompletionList | null {
    const isTagContext = this.nodeContext === CompletionNodeContext.ElementTag;
    const resolvedDeclarations: any[] = this.setup.meta?.resolvedDeclarations || [];
    const directives = resolvedDeclarations.filter((d) => d.isComponent || d.selector);

    const items: CompletionItem[] = [];
    for (const dir of directives) {
      if (!dir.selector) continue;
      const selectors = CssSelector.parse(dir.selector);
      for (const selector of selectors) {
        if (selector.element && selector.element !== '*') {
          const insertText = isTagContext
            ? selector.element
            : `<${selector.element}>$0</${selector.element}>`;
          items.push({
            label: selector.element,
            kind: CompletionItemKind.Class,
            sortText: selector.element,
            insertText,
            insertTextFormat: isTagContext ? InsertTextFormat.PlainText : InsertTextFormat.Snippet,
          });
        }
      }
    }

    return {
      isIncomplete: false,
      items,
    };
  }

  private isElementAttributeCompletion(): boolean {
    return (
      (this.nodeContext === CompletionNodeContext.ElementAttributeKey ||
        this.nodeContext === CompletionNodeContext.TwoWayBinding) &&
      (this.node instanceof TmplAstElement ||
        this.node instanceof TmplAstTemplate ||
        this.node instanceof TmplAstBoundAttribute ||
        this.node instanceof TmplAstTextAttribute ||
        this.node instanceof TmplAstBoundEvent)
    );
  }

  private getElementAttributeCompletions(): CompletionList | null {
    let element = (
      this.node instanceof TmplAstElement || this.node instanceof TmplAstTemplate
        ? this.node
        : this.nodeParent
    ) as TmplAstElement | TmplAstTemplate;

    if (!element) {
      return null;
    }

    if (
      element instanceof TmplAstElement &&
      !element.isSelfClosing &&
      element.endSourceSpan !== null &&
      isWithin(this.position, element.endSourceSpan)
    ) {
      return null;
    }

    let insertSnippet: true | undefined;
    if (
      this.node instanceof TmplAstBoundEvent &&
      (this.node.handlerSpan === undefined ||
        isBoundEventWithSyntheticHandler(this.node) ||
        (this.node.handler instanceof ASTWithSource &&
          this.node.handler.ast instanceof EmptyExpr) ||
        this.node.handler instanceof EmptyExpr)
    ) {
      insertSnippet = true;
    }

    const isBoundAttributeValueEmpty =
      this.node instanceof TmplAstBoundAttribute &&
      (this.node.valueSpan === undefined ||
        (this.node.value instanceof ASTWithSource && this.node.value.ast instanceof EmptyExpr) ||
        this.node.value instanceof EmptyExpr ||
        this.node.value === undefined);
    if (isBoundAttributeValueEmpty) {
      insertSnippet = true;
    }

    if (this.node instanceof TmplAstTextAttribute) {
      if (this.node.value === '') {
        insertSnippet = true;
      }
    }

    if (this.node instanceof TmplAstElement) {
      insertSnippet = true;
    }

    const isAttributeContext =
      this.node instanceof TmplAstElement || this.node instanceof TmplAstTextAttribute;

    const table = buildAttributeCompletionTable(
      element,
      this.setup.meta,
      this.hybridCompiler.getBoundTarget(this.setup.tsFilePath, this.setup.meta.classKey),
    );

    const items: CompletionItem[] = [];
    for (const completion of table.values()) {
      switch (completion.kind) {
        case AttributeCompletionKind.DomEvent:
          if (this.node instanceof TmplAstBoundAttribute) continue;
          break;
        case AttributeCompletionKind.DomAttribute:
        case AttributeCompletionKind.DomProperty:
          if (this.node instanceof TmplAstBoundEvent) continue;
          break;
        case AttributeCompletionKind.DirectiveInput:
          if (this.node instanceof TmplAstBoundEvent) continue;
          if (
            !completion.twoWayBindingSupported &&
            this.nodeContext === CompletionNodeContext.TwoWayBinding
          ) {
            continue;
          }
          break;
        case AttributeCompletionKind.DirectiveOutput:
          if (this.node instanceof TmplAstBoundAttribute) continue;
          break;
        case AttributeCompletionKind.DirectiveAttribute:
          if (
            this.node instanceof TmplAstBoundAttribute ||
            this.node instanceof TmplAstBoundEvent
          ) {
            continue;
          }
          break;
      }

      addAttributeCompletionEntries(
        items,
        completion,
        isAttributeContext,
        element instanceof TmplAstElement,
        undefined,
        insertSnippet,
      );
    }

    return {
      isIncomplete: false,
      items,
    };
  }

  private isAnimationCompletion(): boolean {
    if (this.nodeContext !== CompletionNodeContext.ElementAttributeKey) {
      return false;
    }
    const name = (this.node as any).name;
    return typeof name === 'string' && (name.startsWith('@') || name.startsWith('[@'));
  }

  private getAnimationCompletions(): CompletionList | null {
    const animations: string[] = [];
    const items = buildAnimationCompletionEntries(animations, undefined, CompletionItemKind.Value);
    return {
      isIncomplete: false,
      items,
    };
  }

  private isPipeCompletion(): boolean {
    return this.node instanceof BindingPipe;
  }

  private getPipeCompletions(): CompletionList | null {
    const resolvedDeclarations: any[] = this.setup.meta?.resolvedDeclarations || [];
    const pipes = resolvedDeclarations.filter((d) => d.declarationType === 'pipe' || d.pipeName);
    const items: CompletionItem[] = [];

    for (const pipe of pipes) {
      const name = pipe.pipeName || pipe.name;
      if (name) {
        items.push({
          label: name,
          kind: CompletionItemKind.Function,
          sortText: name,
          detail: `(pipe) ${name}`,
        });
      }
    }

    return {
      isIncomplete: false,
      items,
    };
  }

  private isLiteralCompletion(): boolean {
    return (
      this.node instanceof LiteralPrimitive ||
      (this.node instanceof TmplAstTextAttribute &&
        this.nodeContext === CompletionNodeContext.ElementAttributeValue)
    );
  }

  private async getLiteralCompletions(): Promise<CompletionList | null> {
    let tsExpr: ts.StringLiteral | ts.NumericLiteral | null = null;
    if (this.node instanceof TmplAstTextAttribute) {
      const strNode = findFirstMatchingNode(this.setup.tcbSf, {
        filter: ts.isParenthesizedExpression,
        withSpan: this.node.sourceSpan,
      });
      if (strNode !== null && ts.isStringLiteral(strNode.expression)) {
        tsExpr = strNode.expression;
      } else {
        tsExpr =
          findFirstMatchingNode(this.setup.tcbSf, {
            filter: (n: ts.Node): n is ts.StringLiteral => ts.isStringLiteral(n),
            withSpan: this.node.sourceSpan,
          }) ??
          (this.node.valueSpan
            ? findFirstMatchingNode(this.setup.tcbSf, {
                filter: (n: ts.Node): n is ts.StringLiteral => ts.isStringLiteral(n),
                withSpan: this.node.valueSpan,
              })
            : null);
      }
    } else {
      tsExpr = findFirstMatchingNode(this.setup.tcbSf, {
        filter: (n: ts.Node): n is ts.NumericLiteral | ts.StringLiteral =>
          ts.isStringLiteral(n) || ts.isNumericLiteral(n),
        withSpan: (this.node as any).sourceSpan,
      });
    }

    if (!tsExpr) {
      return null;
    }

    let positionInShimFile = tsExpr.getEnd();
    if (ts.isStringLiteral(tsExpr)) {
      positionInShimFile -= 1;
    }

    const tcbUri = this.setup.tsFilePath.replace(/\.ts$/, '.ngtypecheck.ts');
    await this.facade.ensureDocument(tcbUri, this.setup.tcbCode);
    const tcbPos = offsetToPosition(this.setup.tcbCode, positionInShimFile);
    const tsResults = await this.facade.getCompletionsAtPosition(tcbUri, tcbPos);
    if (!tsResults) {
      return null;
    }

    const isTextAttr = this.node instanceof TmplAstTextAttribute;
    const items: CompletionItem[] = [];
    for (const item of tsResults.items) {
      let label = item.label;
      let insertText = item.insertText ?? label;
      let kind = item.kind;

      if (
        isTextAttr &&
        ((label.startsWith("'") && label.endsWith("'")) ||
          (label.startsWith('"') && label.endsWith('"')))
      ) {
        label = label.slice(1, -1);
        insertText = label;
      }
      if (kind === CompletionItemKind.Constant) {
        kind = CompletionItemKind.Value;
      }

      items.push({
        ...item,
        label,
        kind,
        insertText,
      });
    }

    return {
      isIncomplete: tsResults.isIncomplete,
      items,
    };
  }

  private getBlockCompletions(): CompletionList | null {
    let hasLeadingAt = false;
    if (this.node instanceof TmplAstText) {
      const positionInText = this.position - this.node.sourceSpan.start.offset;
      const textToLeft = this.node.value.substring(0, positionInText);
      hasLeadingAt = Boolean(textToLeft.match(/(?:^|\s)@[a-zA-Z]*$/));
    } else if (this.node instanceof TmplAstElement) {
      hasLeadingAt = this.node.name.startsWith('@');
    }

    let blocks: {name: string; withParens: boolean}[];
    if (this.nodeParent instanceof TmplAstSwitchBlock || this.node instanceof TmplAstSwitchBlock) {
      blocks = [
        {name: 'case', withParens: true},
        {name: 'default', withParens: false},
      ];
    } else {
      blocks = [
        {name: 'if', withParens: true},
        {name: 'for', withParens: true},
        {name: 'switch', withParens: true},
        {name: 'defer', withParens: false},
      ];
    }

    const items: CompletionItem[] = blocks.map((b) => {
      const label = b.name;
      const insertSnippet = true;
      const snippet = buildBlockSnippet(insertSnippet, b.name, b.withParens);
      return {
        label,
        kind: CompletionItemKind.Keyword,
        sortText: label,
        insertText: snippet,
        insertTextFormat: InsertTextFormat.Snippet,
      };
    });

    return {
      isIncomplete: false,
      items,
    };
  }
}

/**
 * Construct a display string which incorporates the kind, container, name, and type of a
 * target declaration.
 */
function createDisplayString(
  name: string,
  kind: string,
  containerName?: string,
  type?: string,
): string {
  const container = containerName ? `${containerName}.` : '';
  const typeStr = type ? `: ${type}` : '';
  return `(${kind}) ${container}${name}${typeStr}`;
}

function findInnermostScopedNode(nodes: TmplAstNode[], offset: number): ScopedNode | null {
  let matched: ScopedNode | null = null;

  function visit(node: TmplAstNode) {
    const span = node.sourceSpan;
    if (span && offset >= span.start.offset && offset <= span.end.offset) {
      if (
        node instanceof TmplAstForLoopBlock ||
        node instanceof TmplAstIfBlockBranch ||
        node instanceof TmplAstTemplate ||
        node instanceof TmplAstForLoopBlockEmpty ||
        node instanceof TmplAstDeferredBlock ||
        node instanceof TmplAstDeferredBlockPlaceholder ||
        node instanceof TmplAstDeferredBlockLoading ||
        node instanceof TmplAstDeferredBlockError
      ) {
        matched = node as unknown as ScopedNode;
      }
    }

    if (node instanceof TmplAstIfBlock) {
      for (const branch of node.branches) {
        visit(branch);
      }
    } else if (node instanceof TmplAstForLoopBlock) {
      if (node.empty) {
        visit(node.empty);
      }
      for (const child of node.children) {
        visit(child);
      }
    } else if (node instanceof TmplAstSwitchBlock) {
      for (const group of node.groups) {
        for (const child of group.children) {
          visit(child);
        }
      }
    } else if ('children' in node && Array.isArray((node as any).children)) {
      for (const child of (node as any).children) {
        visit(child);
      }
    }
  }

  for (const node of nodes) {
    visit(node);
  }

  return matched;
}

function collectAllEntitiesInScope(
  nodes: TmplAstNode[],
  offset: number,
  boundTarget?: BoundTarget<any> | null,
): Map<string, {name: string; kind: CompletionItemKind; detail: string}> {
  const result = new Map<string, {name: string; kind: CompletionItemKind; detail: string}>();

  const scopedNode = findInnermostScopedNode(nodes, offset);
  if (boundTarget) {
    const entities = boundTarget.getEntitiesInScope(scopedNode);
    for (const entity of entities) {
      let kind = CompletionItemKind.Variable;
      let detail = `(variable) ${entity.name}`;
      if (entity instanceof TmplAstReference) {
        detail = `(reference) ${entity.name}`;
      } else if (entity instanceof TmplAstLetDeclaration) {
        detail = `(let) ${entity.name}`;
      }
      result.set(entity.name, {name: entity.name, kind, detail});
    }
  }

  function visitPath(currentNodes: TmplAstNode[]) {
    for (const node of currentNodes) {
      const span = node.sourceSpan;

      if (node instanceof TmplAstReference) {
        result.set(node.name, {
          name: node.name,
          kind: CompletionItemKind.Variable,
          detail: `(reference) ${node.name}`,
        });
      } else if (node instanceof TmplAstElement || node instanceof TmplAstTemplate) {
        for (const ref of node.references) {
          result.set(ref.name, {
            name: ref.name,
            kind: CompletionItemKind.Variable,
            detail: `(reference) ${ref.name}`,
          });
        }
      }

      if (node instanceof TmplAstLetDeclaration) {
        if (node.sourceSpan.start.offset <= offset) {
          result.set(node.name, {
            name: node.name,
            kind: CompletionItemKind.Variable,
            detail: `(let) ${node.name}`,
          });
        }
      }

      if (span && offset >= span.start.offset && offset <= span.end.offset) {
        if (node instanceof TmplAstTemplate) {
          for (const v of node.variables) {
            result.set(v.name, {
              name: v.name,
              kind: CompletionItemKind.Variable,
              detail: `(variable) ${v.name}`,
            });
          }
          visitPath(node.children);
        } else if (node instanceof TmplAstForLoopBlock) {
          if (
            node.mainBlockSpan &&
            offset >= node.mainBlockSpan.start.offset &&
            offset <= node.mainBlockSpan.end.offset
          ) {
            result.set(node.item.name, {
              name: node.item.name,
              kind: CompletionItemKind.Variable,
              detail: `(variable) ${node.item.name}`,
            });
            for (const cv of node.contextVariables) {
              result.set(cv.name, {
                name: cv.name,
                kind: CompletionItemKind.Variable,
                detail: `(variable) ${cv.name}`,
              });
            }
            visitPath(node.children);
          } else if (
            node.empty &&
            offset >= node.empty.sourceSpan.start.offset &&
            offset <= node.empty.sourceSpan.end.offset
          ) {
            visitPath(node.empty.children);
          } else {
            visitPath(node.children);
          }
        } else if (node instanceof TmplAstIfBlock) {
          for (const branch of node.branches) {
            if (
              offset >= branch.sourceSpan.start.offset &&
              offset <= branch.sourceSpan.end.offset
            ) {
              if (branch.expressionAlias) {
                result.set(branch.expressionAlias.name, {
                  name: branch.expressionAlias.name,
                  kind: CompletionItemKind.Variable,
                  detail: `(variable) ${branch.expressionAlias.name}`,
                });
              }
              visitPath(branch.children);
            }
          }
        } else if (node instanceof TmplAstSwitchBlock) {
          for (const group of node.groups) {
            if (offset >= group.sourceSpan.start.offset && offset <= group.sourceSpan.end.offset) {
              visitPath(group.children);
            }
          }
        } else if (node instanceof TmplAstDeferredBlock) {
          visitPath(node.children);
        } else if ('children' in node && Array.isArray((node as any).children)) {
          visitPath((node as any).children);
        }
      }
    }
  }

  visitPath(nodes);
  return result;
}

function nodeContextFromTarget(target: TargetContext): CompletionNodeContext {
  switch (target.kind) {
    case TargetNodeKind.ElementInTagContext:
      return CompletionNodeContext.ElementTag;
    case TargetNodeKind.ElementInBodyContext:
      return CompletionNodeContext.ElementAttributeKey;
    case TargetNodeKind.TwoWayBindingContext:
      return CompletionNodeContext.TwoWayBinding;
    case TargetNodeKind.AttributeInKeyContext:
      return CompletionNodeContext.ElementAttributeKey;
    case TargetNodeKind.AttributeInValueContext:
      if (target.node instanceof TmplAstBoundEvent) {
        return CompletionNodeContext.EventValue;
      } else if (target.node instanceof TmplAstTextAttribute) {
        return CompletionNodeContext.ElementAttributeValue;
      } else {
        return CompletionNodeContext.None;
      }
    default:
      return CompletionNodeContext.None;
  }
}

export async function getCompletionsAtPosition(
  filePath: string,
  offset: number,
  position: {line: number; character: number},
  fileContent: string,
  hybridCompiler: HybridCompiler,
  templateTypeChecker: TemplateTypeChecker,
  facade: TsGoFacade,
): Promise<CompletionList | null> {
  const setup = getSetup(hybridCompiler, filePath, position);
  if (!setup) {
    return null;
  }

  let targetDetails;
  if (setup.isHostBinding && setup.hostElement) {
    targetDetails = getTargetAtPosition([setup.hostElement], offset);
  } else {
    targetDetails = getTargetAtPosition(setup.parsedTemplate.nodes, offset);
  }
  if (!targetDetails) {
    const templateText = setup.meta?.template || '';
    if (/@let\b/.test(templateText)) {
      const span = new ParseSourceSpan(
        new ParseLocation(null as any, offset, 0, 0),
        new ParseLocation(null as any, offset, 0, 0),
      );
      const parseSpan = new ParseSpan(offset, offset);
      const absSpan = new AbsoluteSourceSpan(offset, offset);
      targetDetails = {
        context: {
          kind: TargetNodeKind.RawExpression,
          node: new TmplAstLetDeclaration(
            'unknown',
            new EmptyExpr(parseSpan, absSpan),
            span,
            span,
            span,
          ),
        },
        parent: null,
        template: null,
        position: offset,
      } as any;
    } else {
      const lastOpen = templateText.lastIndexOf('<');
      if (lastOpen !== -1) {
        const afterOpen = templateText.substring(lastOpen + 1);
        if (/^[a-zA-Z0-9_-]*$/.test(afterOpen)) {
          const span = new ParseSourceSpan(
            new ParseLocation(null as any, offset, 0, 0),
            new ParseLocation(null as any, offset, 0, 0),
          );
          targetDetails = {
            context: {
              kind: TargetNodeKind.ElementInTagContext,
              node: new TmplAstText(templateText, span),
            },
            parent: null,
            template: null,
            position: offset,
          } as any;
        }
      }
    }
  }
  if (!targetDetails) {
    return null;
  }

  const builder = new CompletionBuilder(
    hybridCompiler,
    templateTypeChecker,
    facade,
    setup,
    targetDetails,
  );
  return builder.getCompletions();
}

export async function getCompletionEntryDetails(
  filePath: string,
  offset: number,
  position: {line: number; character: number},
  fileContent: string,
  hybridCompiler: HybridCompiler,
  templateTypeChecker: TemplateTypeChecker,
  facade: TsGoFacade,
  item: CompletionItem | string,
): Promise<CompletionItem | null> {
  const setup = getSetup(hybridCompiler, filePath, position);
  if (!setup) {
    return null;
  }

  let targetDetails;
  if (setup.isHostBinding && setup.hostElement) {
    targetDetails = getTargetAtPosition([setup.hostElement], offset);
  } else {
    targetDetails = getTargetAtPosition(setup.parsedTemplate.nodes, offset);
  }
  if (!targetDetails) {
    return null;
  }

  const builder = new CompletionBuilder(
    hybridCompiler,
    templateTypeChecker,
    facade,
    setup,
    targetDetails,
  );

  const completionItem: CompletionItem = typeof item === 'string' ? {label: item} : item;

  return builder.resolveCompletionItem(completionItem);
}
