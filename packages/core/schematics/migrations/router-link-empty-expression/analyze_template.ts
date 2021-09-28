/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstBoundAttribute} from '@angular/compiler';

import {ResolvedTemplate} from '../../utils/ng_component_template';
import {parseHtmlGracefully} from '../../utils/parse_html';

import {RouterLinkEmptyExprVisitor} from './angular/html_routerlink_empty_expr_visitor';

export function analyzeResolvedTemplate(template: ResolvedTemplate): TmplAstBoundAttribute[]|null {
  const templateNodes = parseHtmlGracefully(template.content, template.filePath);

  if (!templateNodes) {
    return null;
  }

  const visitor = new RouterLinkEmptyExprVisitor();

  // Analyze the Angular Render3 HTML AST and collect all template variable assignments.
  visitor.visitAll(templateNodes);

  return visitor.emptyRouterLinkExpressions;
}
