/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyWrite} from '@angular/compiler';
import {Variable, visitAll} from '@angular/compiler/src/render3/r3_ast';

import {ResolvedTemplate} from '../../utils/ng_component_template';
import {parseHtmlGracefully} from '../../utils/parse_html';

import {PropertyAssignment, PropertyWriteHtmlVisitor} from './angular/property_write_html_visitor';

export interface TemplateVariableAssignment {
  node: PropertyWrite;
  start: number;
  end: number;
}

/**
 * Analyzes a given resolved template by looking for property assignments to local
 * template variables within bound events.
 */
export function analyzeResolvedTemplate(template: ResolvedTemplate): TemplateVariableAssignment[]|
    null {
  const templateNodes = parseHtmlGracefully(template.content, template.filePath);

  if (!templateNodes) {
    return null;
  }

  const visitor = new PropertyWriteHtmlVisitor();

  // Analyze the Angular Render3 HTML AST and collect all property assignments and
  // template variables.
  visitAll(visitor, templateNodes);

  return filterTemplateVariableAssignments(visitor.propertyAssignments, visitor.templateVariables)
      .map(({node, start, end}) => ({node, start: start + node.span.start, end}));
}

/**
 * Returns all template variable assignments by looking if a given property
 * assignment is setting the value for one of the specified template variables.
 */
function filterTemplateVariableAssignments(writes: PropertyAssignment[], variables: Variable[]) {
  return writes.filter(propertyWrite => !!variables.find(v => v.name === propertyWrite.node.name));
}
