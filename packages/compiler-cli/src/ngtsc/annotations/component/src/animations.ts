/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  TmplAstNode,
  CombinedRecursiveAstVisitor,
  tmplAstVisitAll,
  TmplAstElement,
} from '@angular/compiler';

const ANIMATE_ENTER = 'animate.enter';
const ANIMATE_LEAVE = `animate.leave`;

/**
 * Analyzes a component's template to determine if it's using animate.enter
 * or animate.leave syntax.
 */
export function analyzeTemplateForAnimations(template: TmplAstNode[]): {
  hasAnimations: boolean;
} {
  const analyzer = new AnimationsAnalyzer();
  tmplAstVisitAll(analyzer, template);

  return {hasAnimations: analyzer.hasAnimations};
}

/**
 * Visitor that traverses all the template nodes and
 * expressions to look for animation references.
 */
class AnimationsAnalyzer extends CombinedRecursiveAstVisitor {
  hasAnimations: boolean = false;

  override visitElement(element: TmplAstElement): void {
    for (const attr of element.attributes) {
      if (attr.name === ANIMATE_LEAVE || attr.name === ANIMATE_ENTER) {
        this.hasAnimations = true;
      }
    }
    for (const input of element.inputs) {
      if (input.name === ANIMATE_LEAVE || input.name === ANIMATE_ENTER) {
        this.hasAnimations = true;
      }
    }
    super.visitElement(element);
  }
}
