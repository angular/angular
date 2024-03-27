/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Determines if one node is contained within another. Adapted from
 * {@see goog.dom.contains}.
 * @param node Node that should contain otherNode.
 * @param otherNode Node being contained.
 * @return True if otherNode is contained within node.
 */
export function contains(node: Node, otherNode: Node|null): boolean {
  if (otherNode === null) {
    return false;
  }

  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if ('contains' in node && otherNode.nodeType === 1) {
    return node.contains(otherNode);
  }

  // W3C DOM Level 3
  if ('compareDocumentPosition' in node) {
    return (node === otherNode || Boolean(node.compareDocumentPosition(otherNode) & 16));
  }

  // W3C DOM Level 1
  while (otherNode && node !== otherNode) {
    otherNode = otherNode.parentNode;
  }
  return otherNode === node;
}

/**
 * Helper method for broadcastCustomEvent. Returns true if any member of
 * the set is an ancestor of element.
 */
export function hasAncestorInNodeList(
    element: Element,
    nodeList: NodeList,
    ): boolean {
  for (let idx = 0; idx < nodeList.length; ++idx) {
    const member = nodeList[idx];
    if (member !== element && contains(member, element)) {
      return true;
    }
  }
  return false;
}
