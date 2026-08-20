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
import {
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_VIEW,
  HOST,
  LView,
  T_HOST,
  TVIEW,
} from '../render3/interfaces/view';
import {getParentRElement} from '../render3/node_manipulation';
import {getComponent} from '../render3/util/discovery_utils';
import {unwrapRNode} from '../render3/util/view_utils';

import {readPatchedData} from '../render3/context_discovery';
import {markRNodeAsHavingHydrationMismatch} from './utils';
import {DOC_PAGE_BASE_URL} from '../../../core/src/error_details_base_url';

const AT_THIS_LOCATION = '<-- AT THIS LOCATION';
const MAX_DOM_PATH_NODES = 4;

const THIRD_PARTY_SCRIPTS_URL = `/guide/hydration#third-party-scripts-with-dom-manipulation`;

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

    const componentHostElement = getDeclarationComponentHostElement(lView);
    const expectedDom = describeExpectedDom(lView, tNode, isViewContainerAnchor, {
      includePath: true,
    });
    const expected = `Angular expected this DOM:\n\n${expectedDom}\n\n`;

    let actual = '';
    if (!node) {
      // No node found during hydration.
      header += `the node was not found.\n\n`;

      // Since the node is missing, we use the closest node to attach the error to
      if (componentHostElement !== null) {
        markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom);
      }
    } else {
      const actualNode = shortRNodeDescription(
        (node as Node).nodeType,
        (node as HTMLElement).tagName ?? null,
        (node as HTMLElement).textContent ?? null,
      );

      header += `found ${actualNode}.\n\n`;
      const actualComponentHostElement = getClosestComponentHostElement(node);
      const actualDom = describeDomFromNode(node, {
        ancestorBoundary: actualComponentHostElement,
        includePath: true,
      });
      actual = `Actual DOM is:\n\n${actualDom}\n\n`;

      // DevTools only report hydration issues on the component level, so we attach extra debug
      // info to a component host element to make it available to DevTools.
      const mismatchHostElement = actualComponentHostElement ?? componentHostElement;
      if (mismatchHostElement !== null) {
        markRNodeAsHavingHydrationMismatch(mismatchHostElement, expectedDom, actualDom);
      }
    }

    const footer = getHydrationErrorFooter(componentClassName);
    let message = header + expected + actual + getHydrationAttributeNote() + footer;

    // Check both when a mismatching node is found AND when the expected node is missing,
    // since third-party scripts can both inject extra nodes and remove existing ones.
    if (!node || (node && isLikelyExternalSourceNode(node))) {
      message +=
        `Note: It looks like this mismatch may have been caused by a third-party script or ` +
        `browser extension that modified the DOM outside of Angular's control. ` +
        `Angular hydration does not support nodes injected or removed outside of the Angular-managed DOM. ` +
        `Note: If you know which element in the DOM this will be inserted, consider adding ngSkipHydration to prevent this error. \n\n`;
    }

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
    for (let i = 0; i < tNode.attrs.length;) {
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
  if (tNode.classesWithoutHost !== null) {
    results.push(`class="${shorten(tNode.classesWithoutHost)}"`);
  }
  if (tNode.stylesWithoutHost !== null) {
    results.push(`style="${shorten(tNode.stylesWithoutHost)}"`);
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

function describeTNodeForPath(tNode: TNode): string {
  if (tNode.type !== TNodeType.Element) {
    return describeTNode(tNode);
  }

  const attrs = stringifyTNodeAttrs(tNode);
  const tag = tNode.value.toLowerCase();
  return `<${tag}${attrs ? ' ' + attrs : ''}>`;
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

function describeRNodeForPath(rNode: RNode): string {
  const node = rNode as HTMLElement;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return describeRNode(rNode);
  }

  const tag = node.tagName.toLowerCase();
  const attrs = stringifyRNodeAttrs(node);
  return `<${tag}${attrs ? ' ' + attrs : ''}>`;
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
function describeExpectedDom(
  lView: LView,
  tNode: TNode,
  isViewContainerAnchor: boolean,
  options: {includePath?: boolean} = {},
): string {
  const lines: string[] = [];
  if (tNode.prev) {
    lines.push('…', describeTNode(tNode.prev));
  } else if (tNode.type && tNode.type & TNodeType.AnyContainer) {
    lines.push('…');
  }
  if (isViewContainerAnchor) {
    lines.push(describeTNode(tNode), `<!-- container -->  ${AT_THIS_LOCATION}`);
  } else {
    lines.push(describeTNode(tNode) + `  ${AT_THIS_LOCATION}`);
  }
  lines.push('…');

  const ancestors: TNode[] = [];
  const declarationComponentLView = lView[DECLARATION_COMPONENT_VIEW];
  let currentLView: LView | null = lView;
  let parentTNode = tNode.parent;

  while (currentLView !== null) {
    for (let parent = parentTNode; parent !== null; parent = parent.parent) {
      if (parent.type === TNodeType.Element) {
        ancestors.push(parent);
      }
    }

    if (currentLView === declarationComponentLView) {
      break;
    }

    parentTNode = currentLView[T_HOST]?.parent ?? null;
    currentLView = currentLView[DECLARATION_VIEW];
  }

  const componentHostElement = getDeclarationComponentHostElement(lView);
  let content = lines.join('\n');
  const parentRNode = tNode.type ? getParentRElement(lView[TVIEW], tNode, lView) : null;
  if (parentRNode !== null) {
    content = describeRNode(parentRNode as unknown as Node, `\n${indent(content)}\n`);
  }

  if (!options.includePath) {
    return content;
  }

  const path = ancestors.reverse().map(describeTNodeForPath);
  if (componentHostElement !== null) {
    path.unshift(describeRNodeForPath(componentHostElement));
  }
  path.push(isViewContainerAnchor ? '<!-- container -->' : describeTNodeForPath(tNode));
  return `DOM path:\n${formatDomPath(path)}\n\n${content}`;
}

/**
 * Builds the string containing the DOM present around a given RNode for a
 * readable error message
 *
 * @param node the RNode
 * @param options configuration for the DOM description
 * @returns string
 */
function describeDomFromNode(
  node: RNode,
  options: {ancestorBoundary?: RNode | null; includePath?: boolean} = {},
): string {
  const lines: string[] = [];
  const currentNode = node as HTMLElement;
  if (currentNode.previousSibling) {
    lines.push('…', describeRNode(currentNode.previousSibling));
  }
  lines.push(describeRNode(currentNode) + `  ${AT_THIS_LOCATION}`);
  if (node.nextSibling) {
    lines.push('…');
  }

  let content = lines.join('\n');
  const parent = currentNode.parentNode;
  if (parent?.nodeType === Node.ELEMENT_NODE) {
    content = describeRNode(parent, `\n${indent(content)}\n`);
  }

  if (!options.includePath) {
    return content;
  }

  const path: string[] = [];
  let pathNode: Node | null = currentNode;
  while (
    pathNode !== null &&
    (pathNode === currentNode || pathNode.nodeType === Node.ELEMENT_NODE)
  ) {
    path.unshift(describeRNodeForPath(pathNode));
    if (pathNode === options.ancestorBoundary) {
      break;
    }
    pathNode = pathNode.parentNode;
  }
  return `DOM path:\n${formatDomPath(path)}\n\n${content}`;
}

function formatDomPath(nodes: string[]): string {
  const boundedNodes =
    nodes.length <= MAX_DOM_PATH_NODES
      ? nodes
      : [nodes[0], '...', ...nodes.slice(-(MAX_DOM_PATH_NODES - 1))];

  return boundedNodes
    .map((node, index) => (index === 0 ? node : `${'   '.repeat(index - 1)} └─ ${node}`))
    .join('\n');
}

function indent(value: string): string {
  return value.replace(/^/gm, '  ');
}

function getDeclarationComponentHostElement(lView: LView): RNode | null {
  const hostElement = lView[DECLARATION_COMPONENT_VIEW][HOST];
  return hostElement === null ? null : unwrapRNode(hostElement);
}

function getClosestComponentHostElement(node: RNode): RNode | null {
  let currentNode: Node | null = node as Node;
  while (currentNode !== null) {
    if (
      currentNode.nodeType === Node.ELEMENT_NODE &&
      getComponent(currentNode as Element) !== null
    ) {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }
  return null;
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
    `  * check if there are any third-party scripts that manipulate the DOM. More info: ${DOC_PAGE_BASE_URL}${THIRD_PARTY_SCRIPTS_URL}\n` +
    `  * or skip hydration by adding the \`ngSkipHydration\` attribute ` +
    `to its host node in a template\n\n`
  );
}

/**
 * Checks if a given RNode is likely to have been added by a third-party script
 * or browser extension, by checking whether Angular has any knowledge of it
 * via patched data. Nodes created and managed by Angular will always have
 * patched data attached to them.
 */
function isLikelyExternalSourceNode(rNode: RNode): boolean {
  const node = rNode as Node;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  // If Angular has patched this node, it was created within Angular's context.
  if (readPatchedData(node as HTMLElement)) {
    return false;
  }
  // No patched data means Angular has no record of this node —
  // it was likely injected by a third-party script or browser extension.
  return true;
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
