/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TmplAstRecursiveVisitor as TemplateVisitor,
  TmplAstNode,
  TmplAstElement as Element,
  TmplAstBoundAttribute as BoundAttribute,
  TmplAstBoundText as BoundText,
  TmplAstBoundEvent as BoundEvent,
  RecursiveAstVisitor as AstVisitor,
  BindingPipe,
  TmplAstComponent,
  TmplAstDirective,
} from '@angular/compiler';

class SelectorlessPipeAnalyzer extends AstVisitor {
  constructor(private tracker: (name: string) => void) {
    super();
  }

  override visitPipe(ast: BindingPipe, context: any): any {
    if ((ast as any).type === 1) {
      this.tracker(ast.name);
    }
    super.visitPipe(ast, context);
  }
}

class SelectorlessDirectivesAnalyzer extends TemplateVisitor {
  symbols: Set<string> | null = null;
  private pipeAnalyzer = new SelectorlessPipeAnalyzer((name) => this.trackSymbol(name));

  override visitElement(element: Element): void {
    for (const input of element.inputs) {
      input.value.visit(this.pipeAnalyzer);
    }
    for (const output of element.outputs) {
      output.handler.visit(this.pipeAnalyzer);
    }
    super.visitElement(element);
  }

  override visitBoundText(text: BoundText): void {
    text.value.visit(this.pipeAnalyzer);
    super.visitBoundText(text);
  }

  override visitBoundAttribute(attribute: BoundAttribute): void {
    attribute.value.visit(this.pipeAnalyzer);
    super.visitBoundAttribute(attribute);
  }

  override visitBoundEvent(event: BoundEvent): void {
    event.handler.visit(this.pipeAnalyzer);
    super.visitBoundEvent(event);
  }

  override visitComponent(component: TmplAstComponent): void {
    this.trackSymbol(component.componentName);
    super.visitComponent(component);
  }

  override visitDirective(directive: TmplAstDirective): void {
    this.trackSymbol(directive.name);
    super.visitDirective(directive);
  }

  private trackSymbol(name: string) {
    this.symbols ??= new Set();
    this.symbols.add(name);
  }
}

// TODO(atscott): Import from compiler-cli instead once exported
export function analyzeTemplateForSelectorless(template: TmplAstNode[]): {
  isSelectorless: boolean;
  localReferencedSymbols: Set<string> | null;
} {
  const analyzer = new SelectorlessDirectivesAnalyzer();
  for (const node of template) {
    node.visit(analyzer);
  }
  const isSelectorless = analyzer.symbols !== null && analyzer.symbols.size > 0;
  const localReferencedSymbols = analyzer.symbols;

  return {isSelectorless, localReferencedSymbols};
}
