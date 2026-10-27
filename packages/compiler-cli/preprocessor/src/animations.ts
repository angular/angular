/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CombinedRecursiveAstVisitor,
  TmplAstElement,
  TmplAstNode,
  tmplAstVisitAll,
} from '@angular/compiler';

const ANIMATE_ENTER = 'animate.enter';
const ANIMATE_LEAVE = 'animate.leave';

/** Whether `template` uses the `animate.enter` or `animate.leave` syntax anywhere. */
export function hasAnimations(template: TmplAstNode[]): boolean {
  const analyzer = new AnimationsAnalyzer();
  tmplAstVisitAll(analyzer, template);
  return analyzer.hasAnimations;
}

class AnimationsAnalyzer extends CombinedRecursiveAstVisitor {
  hasAnimations = false;

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
