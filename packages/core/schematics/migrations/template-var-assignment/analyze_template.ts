/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PropertyWrite, parseTemplate} from '@angular/compiler';
import {Variable, visitAll} from '@angular/compiler/src/render3/r3_ast';

import {ResolvedTemplate} from './angular/ng_component_template';
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
export function analyzeResolvedTemplate(
    filePath: string, template: ResolvedTemplate): TemplateVariableAssignment[]|null {
  try {
    const templateNodes = parseTemplate(template.content, filePath).nodes;
    const visitor = new PropertyWriteHtmlVisitor();

    // Analyze the Angular Render3 HTML AST and collect all property assignments and
    // template variables.
    visitAll(visitor, templateNodes);

    return filterTemplateVariableAssignments(visitor.propertyAssignments, visitor.templateVariables)
        .map(({node, start, end}) => ({node, start: start + node.span.start, end}));
  } catch {
    // Do nothing if the template couldn't be parsed. We don't want to throw any
    // exception if a template is syntactically not valid. e.g. template could be
    // using preprocessor syntax.
    return null;
  }
}

/**
 * Returns all template variable assignments by looking if a given property
 * assignment is setting the value for one of the specified template variables.
 */
function filterTemplateVariableAssignments(writes: PropertyAssignment[], variables: Variable[]) {
  return writes.filter(propertyWrite => !!variables.find(v => v.name === propertyWrite.node.name));
}
