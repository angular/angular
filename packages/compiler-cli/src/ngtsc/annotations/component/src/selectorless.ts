/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstNode,
  BindingPipe,
  CombinedRecursiveAstVisitor,
  tmplAstVisitAll,
  BindingPipeType,
} from '@angular/compiler';

/**
 * Analyzes a component's template to determine if it's using selectorless syntax
 * and to extract the names of the selectorless symbols that are referenced.
 */
export function analyzeTemplateForSelectorless(template: TmplAstNode[]): {
  isSelectorless: boolean;
  localReferencedSymbols: Set<string> | null;
} {
  const analyzer = new SelectorlessDirectivesAnalyzer();
  tmplAstVisitAll(analyzer, template);
  const isSelectorless = analyzer.symbols !== null && analyzer.symbols.size > 0;
  const localReferencedSymbols = analyzer.symbols;

  // The template is considered selectorless only if there
  // are direct references to directives or pipes.
  return {isSelectorless, localReferencedSymbols};
}

/**
 * Visitor that traverses all the template nodes and
 * expressions to look for selectorless references.
 */
class SelectorlessDirectivesAnalyzer extends CombinedRecursiveAstVisitor {
  symbols: Set<string> | null = null;

  override visit(node: AST | TmplAstNode) {
    if (node instanceof BindingPipe && node.type === BindingPipeType.ReferencedDirectly) {
      this.trackSymbol(node.name);
    }

    super.visit(node);
  }

  override visitComponent(component: TmplAstComponent) {
    this.trackSymbol(component.componentName);
    super.visitComponent(component);
  }

  override visitDirective(directive: TmplAstDirective) {
    this.trackSymbol(directive.name);
    super.visitDirective(directive);
  }

  private trackSymbol(name: string) {
    this.symbols ??= new Set();
    this.symbols.add(name);
  }
}
