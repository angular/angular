/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const END_COMMENT = /-->/g;
const END_COMMENT_ESCAPED = '-\u200B-\u200B>';

/**
 * Escape the content of the strings so that it can be safely inserted into a comment node.
 *
 * The issue is that HTML does not specify any way to escape comment end text inside the comment.
 * `<!-- The way you close a comment is with "-->". -->`. Above the `"-->"` is meant to be text not
 * an end to the comment. This can be created programmatically through DOM APIs.
 *
 * ```
 * div.innerHTML = div.innerHTML
 * ```
 *
 * One would expect that the above code would be safe to do, but it turns out that because comment
 * text is not escaped, the comment may contain text which will prematurely close the comment
 * opening up the application for XSS attack. (In SSR we programmatically create comment nodes which
 * may contain such text and expect them to be safe.)
 *
 * This function escapes the comment text by looking for the closing char sequence `-->` and replace
 * it with `-_-_>` where the `_` is a zero width space `\u200B`. The result is that if a comment
 * contains `-->` text it will render normally but it will not cause the HTML parser to close the
 * comment.
 *
 * @param value text to make safe for comment node by escaping the comment close character sequence
 */
export function escapeCommentText(value: string): string {
  return value.replace(END_COMMENT, END_COMMENT_ESCAPED);
}