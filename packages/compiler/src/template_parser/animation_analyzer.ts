/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CombinedRecursiveAstVisitor} from '../combined_visitor';
import {Node, Element, visitAll} from '../render3/r3_ast';
const ANIMATE_LEAVE = `animate.leave`;

/**
 * Analyzes a component's template to determine if it's using animate.enter
 * or animate.leave syntax.
 */
export function analyzeTemplateForAnimations(template: Node[]): boolean {
  const analyzer = new AnimationsAnalyzer();
  visitAll(analyzer, template);

  // The template is considered selectorless only if there
  // are direct references to directives or pipes.
  return analyzer.hasAnimations;
}

/**
 * Visitor that traverses all the template nodes and
 * expressions to look for selectorless references.
 */
class AnimationsAnalyzer extends CombinedRecursiveAstVisitor {
  hasAnimations: boolean = false;

  override visitElement(element: Element): void {
    // check for regular strings
    for (const attr of element.attributes) {
      if (attr.name === ANIMATE_LEAVE) {
        this.hasAnimations = true;
      }
    }
    // check for attribute bindings
    for (const input of element.inputs) {
      if (input.name === ANIMATE_LEAVE) {
        this.hasAnimations = true;
      }
    }
    // check for event bindings
    for (const output of element.outputs) {
      if (output.name === ANIMATE_LEAVE) {
        this.hasAnimations = true;
      }
    }
    super.visitElement(element);
  }
}
