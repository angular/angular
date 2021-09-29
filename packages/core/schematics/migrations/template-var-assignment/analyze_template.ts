/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {PropertyWrite} from '@angular/compiler';
import {ResolvedTemplate} from '../../utils/ng_component_template';
import {parseHtmlGracefully} from '../../utils/parse_html';
import {HtmlVariableAssignmentVisitor} from './angular/html_variable_assignment_visitor';

export interface TemplateVariableAssignment {
  node: PropertyWrite;
  start: number;
  end: number;
}

/**
 * Analyzes a given resolved template by looking for property assignments to local
 * template variables within bound events.
 */
export function analyzeResolvedTemplate(
    template: ResolvedTemplate,
    compilerModule: typeof import('@angular/compiler')): TemplateVariableAssignment[]|null {
  const templateNodes = parseHtmlGracefully(template.content, template.filePath, compilerModule);

  if (!templateNodes) {
    return null;
  }

  const visitor = new HtmlVariableAssignmentVisitor(compilerModule);

  // Analyze the Angular Render3 HTML AST and collect all template variable assignments.
  visitor.visitAll(templateNodes);

  return visitor.variableAssignments.map(
      ({node, start, end}) => ({node, start: start + node.span.start, end}));
}
