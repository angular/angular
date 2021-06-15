/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {ExpressionIdentifier, hasExpressionIdentifier} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import * as ts from 'typescript';

import {findTightestNode} from './ts_utils';
import {getTemplateLocationFromShimLocation, toTextSpan} from './utils';


/**
 * Converts a given `ts.DocumentSpan` in a shim file to its equivalent `ts.DocumentSpan` in the
 * template.
 *
 * You can optionally provide a `requiredNodeText` that ensures the equivalent template node's text
 * matches. If it does not, this function will return `null`.
 */
export function convertToTemplateDocumentSpan<T extends ts.DocumentSpan>(
    shimDocumentSpan: T, templateTypeChecker: TemplateTypeChecker, program: ts.Program,
    requiredNodeText?: string): T|null {
  const sf = program.getSourceFile(shimDocumentSpan.fileName);
  if (sf === undefined) {
    return null;
  }
  const tcbNode = findTightestNode(sf, shimDocumentSpan.textSpan.start);
  if (tcbNode === undefined ||
      hasExpressionIdentifier(sf, tcbNode, ExpressionIdentifier.EVENT_PARAMETER)) {
    // If the reference result is the $event parameter in the subscribe/addEventListener
    // function in the TCB, we want to filter this result out of the references. We really only
    // want to return references to the parameter in the template itself.
    return null;
  }
  // TODO(atscott): Determine how to consistently resolve paths. i.e. with the project
  // serverHost or LSParseConfigHost in the adapter. We should have a better defined way to
  // normalize paths.
  const mapping = getTemplateLocationFromShimLocation(
      templateTypeChecker, absoluteFrom(shimDocumentSpan.fileName),
      shimDocumentSpan.textSpan.start);
  if (mapping === null) {
    return null;
  }

  const {span, templateUrl} = mapping;
  if (requiredNodeText !== undefined && span.toString() !== requiredNodeText) {
    return null;
  }

  return {
    ...shimDocumentSpan,
    fileName: templateUrl,
    textSpan: toTextSpan(span),
    // Specifically clear other text span values because we do not have enough knowledge to
    // convert these to spans in the template.
    contextSpan: undefined,
    originalContextSpan: undefined,
    originalTextSpan: undefined,
  };
}