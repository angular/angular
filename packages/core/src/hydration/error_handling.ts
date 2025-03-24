/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {getDeclarationComponentDef} from '../render3/instructions/element_validation';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {RNode} from '../render3/interfaces/renderer_dom';
import {HOST, LView, TVIEW} from '../render3/interfaces/view';
import {getParentRElement} from '../render3/node_manipulation';
import {unwrapRNode} from '../render3/util/view_utils';

import {markRNodeAsHavingHydrationMismatch} from './utils';

const AT_THIS_LOCATION = '<-- AT THIS LOCATION';

/**
 * Retrieves a user friendly string for a given TNodeType for use in
 * friendly error messages
 *
 * @param tNodeType
 * @returns
 */
function getFriendlyStringFromTNodeType(tNodeType: TNodeType): string {
  switch (tNodeType) {
    case TNodeType.Container:
      return 'view container';
    case TNodeType.Element:
      return 'element';
    case TNodeType.ElementContainer:
      return 'ng-container';
    case TNodeType.Icu:
      return 'icu';
    case TNodeType.Placeholder:
      return 'i18n';
    case TNodeType.Projection:
      return 'projection';
    case TNodeType.Text:
      return 'text';
    case TNodeType.LetDeclaration:
      return '@let';
    default:
      // This should not happen as we cover all possible TNode types above.
      return '<unknown>';
  }
}

/**
 * Validates that provided nodes match during the hydration process.
 */
export function validateMatchingNode(
  node: RNode | null,
  nodeType: number,
  tagName: string | null,
  lView: LView,
  tNode: TNode,
  isViewContainerAnchor = false,
): void {
  if (
    !node ||
    (node as Node).nodeType !== nodeType ||
    ((node as Node).nodeType === Node.ELEMENT_NODE &&
      (node as HTMLElement).tagName.toLowerCase() !== tagName?.toLowerCase())
  ) {
    const expectedNode = shortRNodeDescription(nodeType, tagName, null);
    let header = `During hydration Angular expected ${expectedNode} but `;

    const hostComponentDef = getDeclarationComponentDef(lView);
    const componentClassName = hostComponentDef?.type?.name;

    const expectedDom = describeExpectedDom(lView, tNode, isViewContainerAnchor);
    const expected = `Angular expected this DOM:\n\n${expectedDom}\n\n`;

    let actual = '';
    const componentHostElement = unwrapRNode(lView[HOST]!);
    if (!node) {
      // No node found during hydration.
      header += `the node was not found.\n\n`;

      // Since the node is missing, we use the closest node to attach the error to
      markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom);
    } else {
      const actualNode = shortRNodeDescription(
        (node as Node).nodeType,
        (node as HTMLElement).tagName ?? null,
        (node as HTMLElement).textContent ?? null,
      );

      header += `found ${actualNode}.\n\n`;
      const actualDom = describeDomFromNode(node);
      actual = `Actual DOM is:\n\n${actualDom}\n\n`;

      // DevTools only report hydration issues on the component level, so we attach extra debug
      // info to a component host element to make it available to DevTools.
      markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom);
    }

    const footer = getHydrationErrorFooter(componentClassName);
    const message = header + expected + actual + getHydrationAttributeNote() + footer;
    throw new RuntimeError(RuntimeErrorCode.HYDRATION_NODE_MISMATCH, message);
  }
}

/**
 * Validates that a given node has sibling nodes
 */
export function validateSiblingNodeExists(node: RNode | null): void {
  validateNodeExists(node);
  if (!node!.nextSibling) {
    const header = 'During hydration Angular expected more sibling nodes to be present.\n\n';
    const actual = `Actual DOM is:\n\n${describeDomFromNode(node!)}\n\n`;
    const footer = getHydrationErrorFooter();

    const message = header + actual + footer;

    markRNodeAsHavingHydrationMismatch(node!, '', actual);
    throw new RuntimeError(RuntimeErrorCode.HYDRATION_MISSING_SIBLINGS, message);
  }
}

/**
 * Validates that a node exists or throws
 */
export function validateNodeExists(
  node: RNode | null,
  lView: LView | null = null,
  tNode: TNode | null = null,
): void {
  if (!node) {
    const header =
      'During hydration, Angular expected an element to be present at this location.\n\n';
    let expected = '';
    let footer = '';
    if (lView !== null && tNode !== null) {
      expected = describeExpectedDom(lView, tNode, false);
      footer = getHydrationErrorFooter();

      // Since the node is missing, we use the closest node to attach the error to
      markRNodeAsHavingHydrationMismatch(unwrapRNode(lView[HOST]!), expected, '');
    }

    throw new RuntimeError(
      RuntimeErrorCode.HYDRATION_MISSING_NODE,
      `${header}${expected}\n\n${footer}`,
    );
  }
}

/**
 * Builds the hydration error message when a node is not found
 *
 * @param lView the LView where the node exists
 * @param tNode the TNode
 */
export function nodeNotFoundError(lView: LView, tNode: TNode): Error {
  const header = 'During serialization, Angular was unable to find an element in the DOM:\n\n';
  const expected = `${describeExpectedDom(lView, tNode, false)}\n\n`;
  const footer = getHydrationErrorFooter();

  throw new RuntimeError(RuntimeErrorCode.HYDRATION_MISSING_NODE, header + expected + footer);
}

/**
 * Builds a hydration error message when a node is not found at a path location
 *
 * @param host the Host Node
 * @param path the path to the node
 */
export function nodeNotFoundAtPathError(host: Node, path: string): Error {
  const header =
    `During hydration Angular was unable to locate a node ` +
    `using the "${path}" path, starting from the ${describeRNode(host)} node.\n\n`;
  const footer = getHydrationErrorFooter();

  markRNodeAsHavingHydrationMismatch(host);
  throw new RuntimeError(RuntimeErrorCode.HYDRATION_MISSING_NODE, header + footer);
}

/**
 * Builds the hydration error message in the case that dom nodes are created outside of
 * the Angular context and are being used as projected nodes
 *
 * @param lView the LView
 * @param tNode the TNode
 * @returns an error
 */
export function unsupportedProjectionOfDomNodes(rNode: RNode): Error {
  const header =
    'During serialization, Angular detected DOM nodes ' +
    'that were created outside of Angular context and provided as projectable nodes ' +
    '(likely via `ViewContainerRef.createComponent` or `createComponent` APIs). ' +
    'Hydration is not supported for such cases, consider refactoring the code to avoid ' +
    'this pattern or using `ngSkipHydration` on the host element of the component.\n\n';
  const actual = `${describeDomFromNode(rNode)}\n\n`;
  const message = header + actual + getHydrationAttributeNote();
  return new RuntimeError(RuntimeErrorCode.UNSUPPORTED_PROJECTION_DOM_NODES, message);
}

/**
 * Builds the hydration error message in the case that ngSkipHydration was used on a
 * node that is not a component host element or host binding
 *
 * @param rNode the HTML Element
 * @returns an error
 */
export function invalidSkipHydrationHost(rNode: RNode): Error {
  const header =
    'The `ngSkipHydration` flag is applied on a node ' +
    "that doesn't act as a component host. Hydration can be " +
    'skipped only on per-component basis.\n\n';
  const actual = `${describeDomFromNode(rNode)}\n\n`;
  const footer = 'Please move the `ngSkipHydration` attribute to the component host element.\n\n';
  const message = header + actual + footer;
  return new RuntimeError(RuntimeErrorCode.INVALID_SKIP_HYDRATION_HOST, message);
}

// Stringification methods

/**
 * Stringifies a given TNode's attributes
 *
 * @param tNode a provided TNode
 * @returns string
 */
function stringifyTNodeAttrs(tNode: TNode): string {
  const results = [];
  if (tNode.attrs) {
    for (let i = 0; i < tNode.attrs.length; ) {
      const attrName = tNode.attrs[i++];
      // Once we reach the first flag, we know that the list of
      // attributes is over.
      if (typeof attrName == 'number') {
        break;
      }
      const attrValue = tNode.attrs[i++];
      results.push(`${attrName}="${shorten(attrValue as string)}"`);
    }
  }
  return results.join(' ');
}

/**
 * The list of internal attributes that should be filtered out while
 * producing an error message.
 */
const internalAttrs = new Set(['ngh', 'ng-version', 'ng-server-context']);

/**
 * Stringifies an HTML Element's attributes
 *
 * @param rNode an HTML Element
 * @returns string
 */
function stringifyRNodeAttrs(rNode: HTMLElement): string {
  const results = [];
  for (let i = 0; i < rNode.attributes.length; i++) {
    const attr = rNode.attributes[i];
    if (internalAttrs.has(attr.name)) continue;
    results.push(`${attr.name}="${shorten(attr.value)}"`);
  }
  return results.join(' ');
}

// Methods for Describing the DOM

/**
 * Converts a tNode to a helpful readable string value for use in error messages
 *
 * @param tNode a given TNode
 * @param innerContent the content of the node
 * @returns string
 */
function describeTNode(tNode: TNode, innerContent: string = '…'): string {
  switch (tNode.type) {
    case TNodeType.Text:
      const content = tNode.value ? `(${tNode.value})` : '';
      return `#text${content}`;
    case TNodeType.Element:
      const attrs = stringifyTNodeAttrs(tNode);
      const tag = tNode.value.toLowerCase();
      return `<${tag}${attrs ? ' ' + attrs : ''}>${innerContent}</${tag}>`;
    case TNodeType.ElementContainer:
      return '<!-- ng-container -->';
    case TNodeType.Container:
      return '<!-- container -->';
    default:
      const typeAsString = getFriendlyStringFromTNodeType(tNode.type);
      return `#node(${typeAsString})`;
  }
}

/**
 * Converts an RNode to a helpful readable string value for use in error messages
 *
 * @param rNode a given RNode
 * @param innerContent the content of the node
 * @returns string
 */
function describeRNode(rNode: RNode, innerContent: string = '…'): string {
  const node = rNode as HTMLElement;
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      const tag = node.tagName!.toLowerCase();
      const attrs = stringifyRNodeAttrs(node);
      return `<${tag}${attrs ? ' ' + attrs : ''}>${innerContent}</${tag}>`;
    case Node.TEXT_NODE:
      const content = node.textContent ? shorten(node.textContent) : '';
      return `#text${content ? `(${content})` : ''}`;
    case Node.COMMENT_NODE:
      return `<!-- ${shorten(node.textContent ?? '')} -->`;
    default:
      return `#node(${node.nodeType})`;
  }
}

/**
 * Builds the string containing the expected DOM present given the LView and TNode
 * values for a readable error message
 *
 * @param lView the lView containing the DOM
 * @param tNode the tNode
 * @param isViewContainerAnchor boolean
 * @returns string
 */
function describeExpectedDom(lView: LView, tNode: TNode, isViewContainerAnchor: boolean): string {
  const spacer = '  ';
  let content = '';
  if (tNode.prev) {
    content += spacer + '…\n';
    content += spacer + describeTNode(tNode.prev) + '\n';
  } else if (tNode.type && tNode.type & TNodeType.AnyContainer) {
    content += spacer + '…\n';
  }
  if (isViewContainerAnchor) {
    content += spacer + describeTNode(tNode) + '\n';
    content += spacer + `<!-- container -->  ${AT_THIS_LOCATION}\n`;
  } else {
    content += spacer + describeTNode(tNode) + `  ${AT_THIS_LOCATION}\n`;
  }
  content += spacer + '…\n';

  const parentRNode = tNode.type ? getParentRElement(lView[TVIEW], tNode, lView) : null;
  if (parentRNode) {
    content = describeRNode(parentRNode as unknown as Node, '\n' + content);
  }
  return content;
}

/**
 * Builds the string containing the DOM present around a given RNode for a
 * readable error message
 *
 * @param node the RNode
 * @returns string
 */
function describeDomFromNode(node: RNode): string {
  const spacer = '  ';
  let content = '';
  const currentNode = node as HTMLElement;
  if (currentNode.previousSibling) {
    content += spacer + '…\n';
    content += spacer + describeRNode(currentNode.previousSibling) + '\n';
  }
  content += spacer + describeRNode(currentNode) + `  ${AT_THIS_LOCATION}\n`;
  if (node.nextSibling) {
    content += spacer + '…\n';
  }
  if (node.parentNode) {
    content = describeRNode(currentNode.parentNode as Node, '\n' + content);
  }
  return content;
}

/**
 * Shortens the description of a given RNode by its type for readability
 *
 * @param nodeType the type of node
 * @param tagName the node tag name
 * @param textContent the text content in the node
 * @returns string
 */
function shortRNodeDescription(
  nodeType: number,
  tagName: string | null,
  textContent: string | null,
): string {
  switch (nodeType) {
    case Node.ELEMENT_NODE:
      return `<${tagName!.toLowerCase()}>`;
    case Node.TEXT_NODE:
      const content = textContent ? ` (with the "${shorten(textContent)}" content)` : '';
      return `a text node${content}`;
    case Node.COMMENT_NODE:
      return 'a comment node';
    default:
      return `#node(nodeType=${nodeType})`;
  }
}

/**
 * Builds the footer hydration error message
 *
 * @param componentClassName the name of the component class
 * @returns string
 */
function getHydrationErrorFooter(componentClassName?: string): string {
  const componentInfo = componentClassName ? `the "${componentClassName}"` : 'corresponding';
  return (
    `To fix this problem:\n` +
    `  * check ${componentInfo} component for hydration-related issues\n` +
    `  * check to see if your template has valid HTML structure\n` +
    `  * or skip hydration by adding the \`ngSkipHydration\` attribute ` +
    `to its host node in a template\n\n`
  );
}

/**
 * An attribute related note for hydration errors
 */
function getHydrationAttributeNote(): string {
  return (
    'Note: attributes are only displayed to better represent the DOM' +
    ' but have no effect on hydration mismatches.\n\n'
  );
}

// Node string utility functions

/**
 * Strips all newlines out of a given string
 *
 * @param input a string to be cleared of new line characters
 * @returns
 */
function stripNewlines(input: string): string {
  return input.replace(/\s+/gm, '');
}

/**
 * Reduces a string down to a maximum length of characters with ellipsis for readability
 *
 * @param input a string input
 * @param maxLength a maximum length in characters
 * @returns string
 */
function shorten(input: string | null, maxLength = 50): string {
  if (!input) {
    return '';
  }
  input = stripNewlines(input);
  return input.length > maxLength ? `${input.substring(0, maxLength - 1)}…` : input;
}
