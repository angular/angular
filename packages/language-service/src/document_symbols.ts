/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  ParseSourceSpan,
  TmplAstBoundAttribute,
  TmplAstBoundDeferredTrigger,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstContent,
  TmplAstDeferredBlock,
  TmplAstDeferredBlockError,
  TmplAstDeferredBlockLoading,
  TmplAstDeferredBlockPlaceholder,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstHoverDeferredTrigger,
  TmplAstIfBlock,
  TmplAstIfBlockBranch,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstRecursiveVisitor,
  TmplAstReference,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstSwitchBlockCaseGroup,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstTimerDeferredTrigger,
  TmplAstVariable,
  TmplAstViewportDeferredTrigger,
  tmplAstVisitAll,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import ts from 'typescript';

import {AngularSymbolKind, TemplateDocumentSymbol} from '../api';

import {getFirstComponentForTemplateFile, isTypeScriptFile, toTextSpan} from './utils';

// Re-export for consumers that import from this file
export {AngularSymbolKind, DocumentSymbolsOptions, TemplateDocumentSymbol} from '../api';
import {DocumentSymbolsOptions} from '../api';

/** Maximum length for expression text in symbol names */
const MAX_EXPRESSION_LENGTH = 30;

/**
 * Gets the source text for an expression, truncated if too long.
 */
function getExpressionText(expr: AST | null): string {
  if (expr === null) {
    return '';
  }
  // ASTWithSource contains the original source text
  if (expr instanceof ASTWithSource && expr.source !== null) {
    const source = expr.source.trim();
    if (source.length > MAX_EXPRESSION_LENGTH) {
      return source.substring(0, MAX_EXPRESSION_LENGTH) + '…';
    }
    return source;
  }
  // Fallback for other AST types - just use ellipsis
  return '…';
}

/**
 * Gets document symbols for Angular templates in the given file.
 * For TypeScript files with inline templates, returns symbols for each template.
 * For external template files (.html), returns symbols for the template content.
 *
 * @param compiler The Angular compiler instance
 * @param fileName The file path to get template symbols for
 * @param options Optional configuration for document symbols behavior
 */
export function getTemplateDocumentSymbols(
  compiler: NgCompiler,
  fileName: string,
  options?: DocumentSymbolsOptions,
): TemplateDocumentSymbol[] {
  if (isTypeScriptFile(fileName)) {
    const sf = compiler.getCurrentProgram().getSourceFile(fileName);
    if (sf === undefined) {
      return [];
    }

    const symbols: TemplateDocumentSymbol[] = [];
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
        // For inline templates, create symbols with className for proper merging
        const className = stmt.name.text;
        const templateSymbols = TemplateSymbolVisitor.getSymbols(template, options);
        // Set className on root-level symbols for multi-component file support
        for (const symbol of templateSymbols) {
          symbol.className = className;
        }
        if (templateSymbols.length > 0) {
          symbols.push(...templateSymbols);
        }
      }
    }
    return symbols;
  } else {
    // External template file
    const typeCheckInfo = getFirstComponentForTemplateFile(fileName, compiler);
    if (typeCheckInfo === undefined) {
      return [];
    }
    return TemplateSymbolVisitor.getSymbols(typeCheckInfo.nodes, options);
  }
}

/**
 * Visitor that walks the template AST and creates document symbols.
 */
class TemplateSymbolVisitor extends TmplAstRecursiveVisitor {
  private readonly symbols: TemplateDocumentSymbol[] = [];
  private readonly symbolStack: TemplateDocumentSymbol[][] = [];
  /**
   * Set of variables that have already been processed explicitly.
   * Used to prevent duplicates when visitVariable is called via tmplAstVisitAll.
   */
  private readonly processedVariables = new Set<TmplAstVariable>();
  /**
   * Options for customizing symbol generation behavior.
   */
  private readonly options: DocumentSymbolsOptions;

  constructor(options?: DocumentSymbolsOptions) {
    super();
    this.options = options ?? {};
  }

  static getSymbols(
    templateNodes: TmplAstNode[],
    options?: DocumentSymbolsOptions,
  ): TemplateDocumentSymbol[] {
    const visitor = new TemplateSymbolVisitor(options);
    visitor.symbolStack.push(visitor.symbols);
    tmplAstVisitAll(visitor, templateNodes);
    return visitor.symbols;
  }

  private addSymbol(symbol: TemplateDocumentSymbol): void {
    const current = this.symbolStack[this.symbolStack.length - 1];
    current.push(symbol);
  }

  private pushChildren(symbol: TemplateDocumentSymbol): void {
    symbol.childItems = [];
    this.symbolStack.push(symbol.childItems);
  }

  private popChildren(): void {
    this.symbolStack.pop();
  }

  // Control flow blocks
  override visitIfBlock(block: TmplAstIfBlock): void {
    // Visit branches with index to differentiate @if from @else if
    for (let i = 0; i < block.branches.length; i++) {
      this.visitIfBlockBranchWithIndex(block.branches[i], i);
    }
  }

  private visitIfBlockBranchWithIndex(branch: TmplAstIfBlockBranch, index: number): void {
    let name: string;
    if (branch.expression === null) {
      // No expression means @else
      name = '@else';
    } else if (index === 0) {
      // First branch with expression is @if
      const exprText = getExpressionText(branch.expression);
      const aliasText = branch.expressionAlias ? `; as ${branch.expressionAlias.name}` : '';
      name = `@if (${exprText}${aliasText})`;
    } else {
      // Subsequent branches with expression are @else if
      const exprText = getExpressionText(branch.expression);
      const aliasText = branch.expressionAlias ? `; as ${branch.expressionAlias.name}` : '';
      name = `@else if (${exprText}${aliasText})`;
    }

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Struct, // Control flow → Struct 🔶
      spans: [toTextSpan(branch.sourceSpan)],
      nameSpan: toTextSpan(branch.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add expression alias as a child variable if present
    if (branch.expressionAlias) {
      this.processedVariables.add(branch.expressionAlias);
      const aliasSymbol: TemplateDocumentSymbol = {
        text: `let ${branch.expressionAlias.name}`,
        kind: ts.ScriptElementKind.localVariableElement,
        spans: [toTextSpan(branch.expressionAlias.sourceSpan)],
        nameSpan: toTextSpan(branch.expressionAlias.keySpan),
      };
      this.addSymbol(aliasSymbol);
    }

    tmplAstVisitAll(this, branch.children);
    this.popChildren();
  }

  // Keep the base class method as a no-op since we handle branches in visitIfBlock
  override visitIfBlockBranch(_branch: TmplAstIfBlockBranch): void {
    // Handled by visitIfBlockBranchWithIndex
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    // Get expression text for the collection being iterated
    const exprText = getExpressionText(block.expression);
    const name = `@for (${block.item.name} of ${exprText})`;
    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Array, // @for loop → Array 📦
      spans: [toTextSpan(block.mainBlockSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add the loop item variable (mark as processed to avoid duplicates)
    this.processedVariables.add(block.item);
    const itemSymbol: TemplateDocumentSymbol = {
      text: `let ${block.item.name}`,
      kind: ts.ScriptElementKind.localVariableElement,
      spans: [toTextSpan(block.item.sourceSpan)],
      nameSpan: toTextSpan(block.item.keySpan),
    };
    this.addSymbol(itemSymbol);

    // Add context variables ($index, $count, $first, $last, $even, $odd)
    // By default, only show explicitly aliased ones (e.g., `let i = $index`)
    // If showImplicitForVariables is true, show all including implicit ones
    for (const contextVar of block.contextVariables) {
      this.processedVariables.add(contextVar);
      // Show if explicitly aliased (name differs from value) OR if showImplicitForVariables is enabled
      const isExplicitlyAliased = contextVar.name !== contextVar.value;
      if (isExplicitlyAliased || this.options.showImplicitForVariables) {
        const contextSymbol: TemplateDocumentSymbol = {
          text: `let ${contextVar.name}`,
          kind: ts.ScriptElementKind.localVariableElement,
          spans: [toTextSpan(contextVar.sourceSpan)],
          nameSpan: toTextSpan(contextVar.keySpan),
        };
        this.addSymbol(contextSymbol);
      }
    }

    tmplAstVisitAll(this, block.children);
    if (block.empty) {
      block.empty.visit(this);
    }
    this.popChildren();
  }

  override visitForLoopBlockEmpty(block: TmplAstForLoopBlockEmpty): void {
    const symbol: TemplateDocumentSymbol = {
      text: '@empty',
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Array, // @empty is part of @for → Array
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, block.children);
    this.popChildren();
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    // Get expression text for the switch condition
    const exprText = getExpressionText(block.expression);
    const name = `@switch (${exprText})`;
    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Struct, // @switch → Struct 🔶
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, block.groups);
    this.popChildren();
  }

  override visitSwitchBlockCaseGroup(group: TmplAstSwitchBlockCaseGroup): void {
    // A case group represents multiple cases that share the same body (fall-through)
    // Create a single symbol for the group with all case labels
    if (group.cases.length === 0) {
      return;
    }

    // Build the name by combining all case labels
    const caseLabels: string[] = [];
    let hasDefault = false;
    for (const caseBlock of group.cases) {
      if (caseBlock.expression === null) {
        hasDefault = true;
        caseLabels.push('@default');
      } else {
        const exprText = getExpressionText(caseBlock.expression);
        caseLabels.push(`@case (${exprText})`);
      }
    }

    // For a single case, just use the case name
    // For multiple cases (fall-through), join with " | " to indicate grouping
    const name = caseLabels.length === 1 ? caseLabels[0] : caseLabels.join(' | ');

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: hasDefault ? ts.ScriptElementKind.label : ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Struct, // @case/@default → Struct 🔶
      spans: [toTextSpan(group.sourceSpan)],
      nameSpan: toTextSpan(group.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, group.children);
    this.popChildren();
  }

  // Keep the base class method as a no-op since we handle cases in visitSwitchBlockCaseGroup
  override visitSwitchBlockCase(_block: TmplAstSwitchBlockCase): void {
    // Handled by visitSwitchBlockCaseGroup
  }

  override visitDeferredBlock(block: TmplAstDeferredBlock): void {
    // Build defer name with trigger information
    const triggers = this.getDeferTriggerInfo(block);
    const name = triggers.length > 0 ? `@defer (${triggers.join('; ')})` : '@defer';

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Event, // @defer → Event ⚡
      spans: [toTextSpan(block.mainBlockSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add prefetch trigger info as child if present
    const prefetchTriggers = this.getPrefetchTriggerInfo(block);
    if (prefetchTriggers.length > 0) {
      const prefetchSymbol: TemplateDocumentSymbol = {
        text: `prefetch ${prefetchTriggers.join('; ')}`,
        kind: ts.ScriptElementKind.keyword,
        spans: [toTextSpan(block.startSourceSpan)],
        nameSpan: toTextSpan(block.startSourceSpan),
      };
      this.addSymbol(prefetchSymbol);
    }

    tmplAstVisitAll(this, block.children);
    if (block.placeholder) {
      block.placeholder.visit(this);
    }
    if (block.loading) {
      block.loading.visit(this);
    }
    if (block.error) {
      block.error.visit(this);
    }
    this.popChildren();
  }

  /**
   * Gets human-readable trigger information for a @defer block.
   */
  private getDeferTriggerInfo(block: TmplAstDeferredBlock): string[] {
    const triggers: string[] = [];
    const t = block.triggers;

    if (t.when) {
      const exprText = getExpressionText((t.when as TmplAstBoundDeferredTrigger).value);
      triggers.push(`when ${exprText}`);
    }
    if (t.idle) {
      triggers.push('on idle');
    }
    if (t.immediate) {
      triggers.push('on immediate');
    }
    if (t.timer) {
      const delay = (t.timer as TmplAstTimerDeferredTrigger).delay;
      triggers.push(`on timer(${delay}ms)`);
    }
    if (t.viewport) {
      const ref = (t.viewport as TmplAstViewportDeferredTrigger).reference;
      triggers.push(ref ? `on viewport(${ref})` : 'on viewport');
    }
    if (t.interaction) {
      const ref = (t.interaction as TmplAstInteractionDeferredTrigger).reference;
      triggers.push(ref ? `on interaction(${ref})` : 'on interaction');
    }
    if (t.hover) {
      const ref = (t.hover as TmplAstHoverDeferredTrigger).reference;
      triggers.push(ref ? `on hover(${ref})` : 'on hover');
    }
    if (t.never) {
      triggers.push('on never');
    }

    return triggers;
  }

  /**
   * Gets human-readable prefetch trigger information for a @defer block.
   */
  private getPrefetchTriggerInfo(block: TmplAstDeferredBlock): string[] {
    const triggers: string[] = [];
    const t = block.prefetchTriggers;

    if (t.when) {
      const exprText = getExpressionText((t.when as TmplAstBoundDeferredTrigger).value);
      triggers.push(`when ${exprText}`);
    }
    if (t.idle) {
      triggers.push('on idle');
    }
    if (t.immediate) {
      triggers.push('on immediate');
    }
    if (t.timer) {
      const delay = (t.timer as TmplAstTimerDeferredTrigger).delay;
      triggers.push(`on timer(${delay}ms)`);
    }
    if (t.viewport) {
      const ref = (t.viewport as TmplAstViewportDeferredTrigger).reference;
      triggers.push(ref ? `on viewport(${ref})` : 'on viewport');
    }
    if (t.interaction) {
      const ref = (t.interaction as TmplAstInteractionDeferredTrigger).reference;
      triggers.push(ref ? `on interaction(${ref})` : 'on interaction');
    }
    if (t.hover) {
      const ref = (t.hover as TmplAstHoverDeferredTrigger).reference;
      triggers.push(ref ? `on hover(${ref})` : 'on hover');
    }

    return triggers;
  }

  override visitDeferredBlockPlaceholder(block: TmplAstDeferredBlockPlaceholder): void {
    // Include minimum time parameter if present
    const minTime = block.minimumTime;
    const name = minTime !== null ? `@placeholder (minimum ${minTime}ms)` : '@placeholder';

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Event, // @placeholder → Event ⚡
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, block.children);
    this.popChildren();
  }

  override visitDeferredBlockLoading(block: TmplAstDeferredBlockLoading): void {
    // Include timing parameters if present
    const timings: string[] = [];
    if (block.afterTime !== null) {
      timings.push(`after ${block.afterTime}ms`);
    }
    if (block.minimumTime !== null) {
      timings.push(`minimum ${block.minimumTime}ms`);
    }
    const name = timings.length > 0 ? `@loading (${timings.join('; ')})` : '@loading';

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Event, // @loading → Event ⚡
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, block.children);
    this.popChildren();
  }

  override visitDeferredBlockError(block: TmplAstDeferredBlockError): void {
    const symbol: TemplateDocumentSymbol = {
      text: '@error',
      kind: ts.ScriptElementKind.functionElement,
      lspKind: AngularSymbolKind.Event, // @error → Event ⚡
      spans: [toTextSpan(block.sourceSpan)],
      nameSpan: toTextSpan(block.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);
    tmplAstVisitAll(this, block.children);
    this.popChildren();
  }

  // Elements and components
  override visitElement(element: TmplAstElement): void {
    const symbol: TemplateDocumentSymbol = {
      text: `<${element.name}>`,
      kind: ts.ScriptElementKind.memberVariableElement,
      // Use Object for elements 🟡
      lspKind: AngularSymbolKind.Object,
      spans: [toTextSpan(element.sourceSpan)],
      nameSpan: toTextSpan(element.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add references as children
    for (const ref of element.references) {
      ref.visit(this);
    }

    // Visit child elements
    tmplAstVisitAll(this, element.children);
    this.popChildren();
  }

  override visitComponent(component: TmplAstComponent): void {
    const symbol: TemplateDocumentSymbol = {
      text: `<${component.tagName || component.componentName}>`,
      kind: ts.ScriptElementKind.classElement,
      spans: [toTextSpan(component.sourceSpan)],
      nameSpan: toTextSpan(component.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add references as children
    for (const ref of component.references) {
      ref.visit(this);
    }

    // Visit child elements
    tmplAstVisitAll(this, component.children);
    this.popChildren();
  }

  override visitTemplate(template: TmplAstTemplate): void {
    // Check if this template is from a structural directive (has directives and tagName)
    const structuralDirective = this.getStructuralDirectiveInfo(template);

    let name: string;
    let kind: ts.ScriptElementKind;
    let lspKind: AngularSymbolKind | undefined;

    if (structuralDirective) {
      // Display structural directive like control flow: *ngIf (expr), *ngFor (let item of items)
      name = structuralDirective.displayName;
      // Use Class icon for all structural directives (like components)
      kind = ts.ScriptElementKind.classElement;
      lspKind = undefined; // Use default Class mapping
    } else {
      // Regular ng-template or template element → keep as Field to match HTML elements
      name = template.tagName ? `<${template.tagName}>` : '<ng-template>';
      kind = ts.ScriptElementKind.memberVariableElement;
      lspKind = undefined; // Use default Field mapping
    }

    const symbol: TemplateDocumentSymbol = {
      text: name,
      kind,
      lspKind,
      spans: [toTextSpan(template.sourceSpan)],
      nameSpan: toTextSpan(template.startSourceSpan),
    };
    this.addSymbol(symbol);
    this.pushChildren(symbol);

    // Add references and variables as children
    for (const ref of template.references) {
      ref.visit(this);
    }
    for (const variable of template.variables) {
      variable.visit(this);
    }

    // Visit child elements
    tmplAstVisitAll(this, template.children);
    this.popChildren();
  }

  /**
   * Detects structural directives and returns display information.
   * Maps deprecated directives to their control flow equivalents.
   */
  private getStructuralDirectiveInfo(
    template: TmplAstTemplate,
  ): {displayName: string; directiveName: string} | null {
    // If no templateAttrs, not a structural directive template
    if (template.templateAttrs.length === 0) {
      return null;
    }

    // For structural directives, look at templateAttrs to find the directive
    // The directive name is in the first templateAttr's name (e.g., 'ngFor', 'ngIf')
    for (const attr of template.templateAttrs) {
      let directiveName: string;
      if (attr instanceof TmplAstBoundAttribute) {
        directiveName = attr.name.toLowerCase();
      } else if (attr instanceof TmplAstTextAttribute) {
        directiveName = attr.name.toLowerCase();
      } else {
        continue;
      }

      // Map to control flow equivalents for common directives
      if (directiveName === 'ngif') {
        const expr = this.getTemplateAttrExpression(template, 'ngIf');
        return {displayName: `*ngIf (${expr})`, directiveName: 'ngIf'};
      }
      if (directiveName === 'ngforof' || directiveName === 'ngfor') {
        const ofExpr = this.getTemplateAttrExpression(template, 'ngForOf');
        const itemVar = template.variables.find((v) => v.value === '$implicit');
        const itemName = itemVar?.name || 'item';
        return {displayName: `*ngFor (let ${itemName} of ${ofExpr})`, directiveName: 'ngFor'};
      }
      if (directiveName === 'ngswitch') {
        const expr = this.getTemplateAttrExpression(template, 'ngSwitch');
        return {displayName: `[ngSwitch] (${expr})`, directiveName: 'ngSwitch'};
      }
      if (directiveName === 'ngswitchcase') {
        const expr = this.getTemplateAttrExpression(template, 'ngSwitchCase');
        return {displayName: `*ngSwitchCase (${expr})`, directiveName: 'ngSwitchCase'};
      }
      if (directiveName === 'ngswitchdefault') {
        return {displayName: '*ngSwitchDefault', directiveName: 'ngSwitchDefault'};
      }
      if (directiveName === 'ngtemplateoutlet') {
        const outlet = this.getTemplateAttrExpression(template, 'ngTemplateOutlet');
        return {displayName: `*ngTemplateOutlet (${outlet})`, directiveName: 'ngTemplateOutlet'};
      }
      if (directiveName === 'ngcomponentoutlet') {
        const component = this.getTemplateAttrExpression(template, 'ngComponentOutlet');
        return {
          displayName: `*ngComponentOutlet (${component})`,
          directiveName: 'ngComponentOutlet',
        };
      }
      if (directiveName === 'ngplural') {
        const expr = this.getTemplateAttrExpression(template, 'ngPlural');
        return {displayName: `[ngPlural] (${expr})`, directiveName: 'ngPlural'};
      }
      if (directiveName === 'ngpluralcase') {
        const value = this.getTemplateAttrExpression(template, 'ngPluralCase');
        return {displayName: `*ngPluralCase (${value})`, directiveName: 'ngPluralCase'};
      }
    }

    // For any other structural directive template with tagName but not matching known ones
    // This could be a custom structural directive - show as Class
    if (template.tagName !== null && template.templateAttrs.length > 0) {
      // Get the first bound attribute for display
      const firstAttr = template.templateAttrs[0];
      if (firstAttr instanceof TmplAstBoundAttribute) {
        const expr = getExpressionText(firstAttr.value);
        return {displayName: `*${firstAttr.name} (${expr})`, directiveName: 'custom'};
      } else if (firstAttr instanceof TmplAstTextAttribute) {
        return {displayName: `*${firstAttr.name}`, directiveName: 'custom'};
      }
    }

    return null;
  }

  /**
   * Gets the expression text for a template attribute by name.
   */
  private getTemplateAttrExpression(template: TmplAstTemplate, attrName: string): string {
    for (const attr of template.templateAttrs) {
      if (attr instanceof TmplAstBoundAttribute && attr.name === attrName) {
        return getExpressionText(attr.value);
      }
      if (attr instanceof TmplAstTextAttribute && attr.name === attrName) {
        return attr.value || '';
      }
    }
    return '…';
  }

  override visitContent(content: TmplAstContent): void {
    const selector = content.selector ? ` select="${content.selector}"` : '';
    const symbol: TemplateDocumentSymbol = {
      text: `<ng-content${selector}>`,
      kind: ts.ScriptElementKind.interfaceElement,
      spans: [toTextSpan(content.sourceSpan)],
      nameSpan: toTextSpan(content.startSourceSpan),
    };
    this.addSymbol(symbol);
  }

  // Template variables and references
  override visitReference(reference: TmplAstReference): void {
    const symbol: TemplateDocumentSymbol = {
      text: `#${reference.name}`,
      kind: ts.ScriptElementKind.localVariableElement,
      spans: [toTextSpan(reference.sourceSpan)],
      nameSpan: toTextSpan(reference.keySpan),
    };
    this.addSymbol(symbol);
  }

  override visitVariable(variable: TmplAstVariable): void {
    // Skip variables that were already processed explicitly (e.g., @for item, @if alias)
    if (this.processedVariables.has(variable)) {
      return;
    }
    const symbol: TemplateDocumentSymbol = {
      text: `let ${variable.name}`,
      kind: ts.ScriptElementKind.localVariableElement,
      spans: [toTextSpan(variable.sourceSpan)],
      nameSpan: toTextSpan(variable.keySpan),
    };
    this.addSymbol(symbol);
  }

  override visitLetDeclaration(decl: TmplAstLetDeclaration): void {
    const symbol: TemplateDocumentSymbol = {
      text: `@let ${decl.name}`,
      kind: ts.ScriptElementKind.letElement,
      spans: [toTextSpan(decl.sourceSpan)],
      nameSpan: toTextSpan(decl.nameSpan),
    };
    this.addSymbol(symbol);
  }
}
