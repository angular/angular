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

  // The template is considered selectorless only if there
  // are direct references to directives or pipes.
  return {hasAnimations: analyzer.hasAnimations};
}

/**
 * Visitor that traverses all the template nodes and
 * expressions to look for selectorless references.
 */
class AnimationsAnalyzer extends CombinedRecursiveAstVisitor {
  hasAnimations: boolean = false;

  override visitElement(element: TmplAstElement): void {
    for (const attr of element.attributes) {
      if (attr.name === ANIMATE_LEAVE) {
        this.hasAnimations = true;
      }
    }
    for (const input of element.inputs) {
      if (input.name === ANIMATE_LEAVE) {
        this.hasAnimations = true;
      }
    }
    super.visitElement(element);
  }
}
