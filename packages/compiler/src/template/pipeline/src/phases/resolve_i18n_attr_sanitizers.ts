/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import {Identifiers} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';
import {MATH_ML_NAMESPACE, SVG_NAMESPACE} from '../namespaces';

/**
 * Wraps static i18n extracted attributes in their corresponding sanitizers/validators.
 */
export function resolveI18nAttrSanitizers(job: CompilationJob): void {
  const tagNamesByElement = new Map<ir.XrefId, string>();

  for (const unit of job.units) {
    for (const op of unit.ops()) {
      if (op.kind === ir.OpKind.ElementStart || op.kind === ir.OpKind.Template) {
        let tag = op.tag ?? '';
        switch (op.namespace) {
          case ir.Namespace.SVG:
            tag = `:${SVG_NAMESPACE}:${tag}`;
            break;
          case ir.Namespace.Math:
            tag = `:${MATH_ML_NAMESPACE}:${tag}`;
            break;
        }

        tagNamesByElement.set(op.xref, tag);
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (
        op.kind === ir.OpKind.ExtractedAttribute &&
        op.i18nContext !== null &&
        op.expression !== null
      ) {
        const tagName = tagNamesByElement.get(op.target) ?? '';
        let expr = op.expression;
        switch (op.securityContext) {
          case SecurityContext.HTML:
            expr = o.importExpr(Identifiers.sanitizeHtml).callFn([expr]);
            break;
          case SecurityContext.STYLE:
            expr = o.importExpr(Identifiers.sanitizeStyle).callFn([expr]);
            break;
          case SecurityContext.SCRIPT:
            expr = o.importExpr(Identifiers.sanitizeScript).callFn([expr]);
            break;
          case SecurityContext.URL:
            expr = o.importExpr(Identifiers.sanitizeUrl).callFn([expr]);
            break;
          case SecurityContext.RESOURCE_URL:
            expr = o.importExpr(Identifiers.sanitizeResourceUrl).callFn([expr]);
            break;
          case SecurityContext.ATTRIBUTE_NO_BINDING:
            expr = o
              .importExpr(Identifiers.validateAttribute)
              .callFn([expr, o.literal(tagName), o.literal(op.name)]);
            break;
        }
        op.expression = expr;
      }
    }
  }
}
