/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Disallowed strings in the comment.
 *
 * see: https://html.spec.whatwg.org/multipage/syntax.html#comments
 */
const COMMENT_DISALLOWED = /^>|^->|<!--|-->|--!>|<!-$/g;
/**
 * Delimiter in the disallowed strings which needs to be wrapped with zero with character.
 */
const COMMENT_DELIMITER = /(<|>)/g;
const COMMENT_DELIMITER_ESCAPED = '\u200B$1\u200B';

/**
 * Escape the content of comment strings so that it can be safely inserted into a comment node.
 *
 * The issue is that HTML does not specify any way to escape comment end text inside the comment.
 * Consider: `<!-- The way you close a comment is with ">", and "->" at the beginning or by "-->" or
 * "--!>" at the end. -->`. Above the `"-->"` is meant to be text not an end to the comment. This
 * can be created programmatically through DOM APIs. (`<!--` are also disallowed.)
 *
 * see: https://html.spec.whatwg.org/multipage/syntax.html#comments
 *
 * ```ts
 * div.innerHTML = div.innerHTML
 * ```
 *
 * One would expect that the above code would be safe to do, but it turns out that because comment
 * text is not escaped, the comment may contain text which will prematurely close the comment
 * opening up the application for XSS attack. (In SSR we programmatically create comment nodes which
 * may contain such text and expect them to be safe.)
 *
 * This function escapes the comment text by looking for comment delimiters (`<` and `>`) and
 * surrounding them with `_>_` where the `_` is a zero width space `\u200B`. The result is that if a
 * comment contains any of the comment start/end delimiters (such as `<!--`, `-->` or `--!>`) the
 * text it will render normally but it will not cause the HTML parser to close/open the comment.
 *
 * @param value text to make safe for comment node by escaping the comment open/close character
 *     sequence.
 */
export function escapeCommentText(value: string): string {
  return value.replace(COMMENT_DISALLOWED, (text) =>
    text.replace(COMMENT_DELIMITER, COMMENT_DELIMITER_ESCAPED),
  );
}

/**
 * Verifies whether a given child node is a descendant of a given parent node.
 * It may not be the case when properties like `.firstChild` are clobbered and
 * accessing `.firstChild` results in an unexpected node returned.
 */
function isClobberedElement(parentNode: Node, childNode: Node): boolean {
  return (
    (parentNode.compareDocumentPosition(childNode) & Node.DOCUMENT_POSITION_CONTAINED_BY) !==
    Node.DOCUMENT_POSITION_CONTAINED_BY
  );
}

/**
 * Retrieves next sibling node and makes sure that there is no
 * clobbering of the `nextSibling` property happening.
 */
export function getNextSibling(node: Node): Node | null {
  const nextSibling = node.nextSibling;
  // Make sure there is no `nextSibling` clobbering: navigating to
  // the next sibling and going back to the previous one should result
  // in the original node.
  if (nextSibling && node !== nextSibling.previousSibling) {
    throw clobberedElementError(nextSibling);
  }
  return nextSibling;
}

/**
 * Retrieves first child node and makes sure that there is no
 * clobbering of the `firstChild` property happening.
 */
export function getFirstChild(node: Node): Node | null {
  const firstChild = node.firstChild;
  if (firstChild && isClobberedElement(node, firstChild)) {
    throw clobberedElementError(firstChild);
  }
  return firstChild;
}

/** Gets a reasonable nodeName, even for clobbered nodes. */
export function getNodeName(node: Node): string {
  const nodeName = node.nodeName;
  // If the property is clobbered, assume it is an `HTMLFormElement`.
  return typeof nodeName === 'string' ? nodeName : 'FORM';
}

function clobberedElementError(node: Node) {
  return new Error(
    `Action failed because the element is clobbered: ${(node as Element).outerHTML}`,
  );
}
