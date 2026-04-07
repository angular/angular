/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {extractJsDocTags} from './jsdoc_extractor';

/**
 * Check if the member has a JSDoc @internal or a @internal is a normal comment
 */
export function isInternal(member: ts.HasJSDoc): boolean {
  return (
    extractJsDocTags(member).some((tag) => tag.name === 'internal') ||
    hasLeadingInternalComment(member)
  );
}

/*
 * Check if the member has a comment block with @internal
 */
function hasLeadingInternalComment(member: ts.Node): boolean {
  const memberText = member.getSourceFile().text;
  return (
    ts.reduceEachLeadingCommentRange(
      memberText,
      member.getFullStart(),
      (pos, end, kind, hasTrailingNewLine, containsInternal) => {
        return containsInternal || memberText.slice(pos, end).includes('@internal');
      },
      /* state */ false,
      /* initial */ false,
    ) ?? false
  );
}
