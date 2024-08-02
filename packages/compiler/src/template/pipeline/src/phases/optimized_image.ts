/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';

import {ComponentCompilationJob, type CompilationJob} from '../compilation';

const importLoader = {loader: 'image-file'};

/**
 * Reworks the const collection if there is a local file references by the ngLocalSrc attribute
 *
 * When there is, a import is generated with a custom loader and width/height are read from it
 * if the values aren't already provided (and if the fill property isn't present)
 */
export function importLocalImage(job: CompilationJob): void {
  if (job instanceof ComponentCompilationJob) {
    for (const expr of job.consts) {
      if (expr instanceof o.LiteralArrayExpr) {
        handleArrayExpression(expr);
      }
    }
  }
}

function handleArrayExpression(arrayExpr: o.LiteralArrayExpr) {
  let ngLocalSrcIndex = -1;
  let firstNonStaticIndex = -1;
  let hasWidth = false;
  let hasHeight = false;
  let hasFill = false;

  for (const [i, expr] of arrayExpr.entries.entries()) {
    if (!(expr instanceof o.LiteralExpr)) {
      continue;
    }
    if (expr.value === 'ngLocalSrc') {
      ngLocalSrcIndex = i;
    } else if (expr.value === 'width') {
      hasWidth = true;
    } else if (expr.value === 'height') {
      hasHeight = true;
    } else if (expr.value === 'fill') {
      hasFill = true;
    } else if (typeof expr.value === 'number' && firstNonStaticIndex === -1) {
      firstNonStaticIndex = i;
      // It is important to not break here as
      // height/width will appear later if they're not static
    }
  }

  // ngLocalSrc property is absent
  if (ngLocalSrcIndex === -1) {
    return;
  }

  // The src property is not a static string
  if (ngLocalSrcIndex > firstNonStaticIndex && firstNonStaticIndex !== -1) {
    return;
  }

  const imgSrc = (arrayExpr.entries[ngLocalSrcIndex + 1] as o.LiteralExpr).value as string;
  // Nothing to do if it's an absolute url
  if (/^https?:\/\//.test(imgSrc)) {
    return;
  }

  // replacing the static src with the one provided by the import
  arrayExpr.entries[ngLocalSrcIndex + 1] = o.importExpr(
    new o.ExternalReference(imgSrc, 'default', null, importLoader),
  );

  // In case of fill, we don't want to read the sizes
  if (hasFill) {
    return;
  }

  if (!hasHeight) {
    arrayExpr.entries.unshift(
      o.literal('height'),
      o.importExpr(new o.ExternalReference(imgSrc, 'height', null, importLoader)),
    );
  }

  if (!hasWidth) {
    arrayExpr.entries.unshift(
      o.literal('width'),
      o.importExpr(new o.ExternalReference(imgSrc, 'width', null, importLoader)),
    );
  }
}
