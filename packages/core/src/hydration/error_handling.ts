/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {readPatchedData} from '../render3/context_discovery';
import {getComponentDef} from '../render3/def_getters';
import {getDeclarationComponentDef} from '../render3/instructions/element_validation';
import type {ComponentDef} from '../render3/interfaces/definition';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {RNode} from '../render3/interfaces/renderer_dom';
import {DECLARATION_COMPONENT_VIEW, HOST, LView, TVIEW} from '../render3/interfaces/view';
import {getParentRElement} from '../render3/node_manipulation';
import {getComponent} from '../render3/util/discovery_utils';
import {unwrapRNode} from '../render3/util/view_utils';

import {markRNodeAsHavingHydrationMismatch} from './utils';
import {DOC_PAGE_BASE_URL} from '../error_details_base_url';

const AT_THIS_LOCATION = '<-- AT THIS LOCATION';

const THIRD_PARTY_SCRIPTS_URL = `/guide/hydration#third-party-scripts-with-dom-manipulation`;

const MAX_DOM_PATH_SEGMENTS = 8;
const MAX_DOM_PATH_ANCESTOR_WALK = 64;
const MAX_SIBLING_INDEX_SCAN = 1000;
const CSS_IDENTIFIER_REGEXP = /^(?:[A-Za-z_]|-(?=[A-Za-z_-]))[A-Za-z0-9_-]*$/;
const IDENTIFYING_ATTRS = ['data-testid', 'aria-label', 'name', 'role', 'type'] as const;

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
    const parentRNode = getSafeParentRElement(lView, tNode);
    const componentHostElement = getDeclarationComponentHostElement(lView);

    const expectedDom = describeExpectedDom(lView, tNode, isViewContainerAnchor);
    const expected = `Angular expected this DOM:\n\n${expectedDom}\n\n`;

    let domPathSection = '';
    let actual = '';
    if (!node) {
      // No node found during hydration.
      header += `the node was not found.\n\n`;
      domPathSection = formatDomPathSection(parentRNode);

      const actualDom = parentRNode ? describeMissingNodeParentDom(parentRNode) : null;
      if (actualDom !== null) {
        actual = `Actual DOM is:\n\n${actualDom}\n\n`;
      }

      // Since the node is missing, attach mismatch info to the declaring component host.
      if (componentHostElement !== null) {
        markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom);
      }
    } else {
      const actualNode = shortRNodeDescription(
        (node as Node).nodeType,
        (node as HTMLElement).tagName ?? null,
        (node as HTMLElement).textContent ?? null,
      );

      header += `found ${actualNode}.\n\n`;
      domPathSection = formatDomPathSection(parentRNode, (node as Node).parentNode, node as Node);
      const actualDom = describeDomFromNode(node);
      actual = `Actual DOM is:\n\n${actualDom}\n\n`;

      // DevTools only report hydration issues on the component level, so we attach extra debug
      // info to the declaring component host element to make it available to DevTools.
      if (componentHostElement !== null) {
        markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom);
      }
    }

    const footer = getHydrationErrorFooter(hostComponentDef);
    let message =
      header + domPathSection + expected + actual + getHydrationAttributeNote() + footer;

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
    const domPathSection = formatDomPathSection((node as Node).parentNode, undefined, node as Node);
    const actualDom = describeDomFromNode(node!);
    const actual = `Actual DOM is:\n\n${actualDom}\n\n`;
    const footer = getHydrationErrorFooter(getClosestComponentDef(node!));

    const message = header + domPathSection + actual + footer;

    markRNodeAsHavingHydrationMismatch(node!, '', actualDom);
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
    let body = '';
    if (lView !== null && tNode !== null) {
      const parentRNode = getSafeParentRElement(lView, tNode);
      const componentHostElement = getDeclarationComponentHostElement(lView);
      const expectedDom = describeExpectedDom(lView, tNode, false);
      const actualDom = parentRNode ? describeMissingNodeParentDom(parentRNode) : null;

      body =
        formatDomPathSection(parentRNode) +
        `Angular expected this DOM:\n\n${expectedDom}\n\n` +
        (actualDom !== null ? `Actual DOM is:\n\n${actualDom}\n\n` : '') +
        getHydrationErrorFooter(getDeclarationComponentDef(lView));

      // Since the node is missing, attach mismatch info to the declaring component host.
      if (componentHostElement !== null) {
        markRNodeAsHavingHydrationMismatch(componentHostElement, expectedDom, actualDom ?? '');
      }
    }

    throw new RuntimeError(RuntimeErrorCode.HYDRATION_MISSING_NODE, `${header}${body}`);
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
  const domPathSection = formatDomPathSection(getSafeParentRElement(lView, tNode));
  const expected = `${describeExpectedDom(lView, tNode, false)}\n\n`;
  const footer = getHydrationErrorFooter(getDeclarationComponentDef(lView));

  throw new RuntimeError(
    RuntimeErrorCode.HYDRATION_MISSING_NODE,
    header + domPathSection + expected + footer,
  );
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
  const domPathSection = formatDomPathSection(host);
  const footer = getHydrationErrorFooter(getClosestComponentDef(host));

  markRNodeAsHavingHydrationMismatch(host);
  throw new RuntimeError(RuntimeErrorCode.HYDRATION_MISSING_NODE, header + domPathSection + footer);
}

/**
 * Builds the hydration error message in the case that dom nodes are created outside of
 * the Angular context and are being used as projected nodes
 *
 * @param rNode the RNode created outside of Angular context
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
  if (tNode.classesWithoutHost) {
    results.push(`class="${shorten(tNode.classesWithoutHost)}"`);
  }
  if (tNode.stylesWithoutHost) {
    results.push(`style="${shorten(tNode.stylesWithoutHost)}"`);
  }
  return results.join(' ');
}

/**
 * The list of internal attributes that should be filtered out while
 * producing an error message.
 */
const internalAttrs = /* @__PURE__ */ new Set(['ngh', 'ng-version', 'ng-server-context']);

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
    if (tNode.prev.prev) {
      content += spacer + '…\n';
    }
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

  const parentRNode = getSafeParentRElement(lView, tNode);
  if (parentRNode) {
    content = describeRNode(parentRNode as unknown as RNode, '\n' + content);
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
    if (currentNode.previousSibling.previousSibling) {
      content += spacer + '…\n';
    }
    content += spacer + describeRNode(currentNode.previousSibling) + '\n';
  }
  content += spacer + describeRNode(currentNode) + `  ${AT_THIS_LOCATION}\n`;
  if (currentNode.nextSibling) {
    content += spacer + describeRNode(currentNode.nextSibling) + '\n';
    if (currentNode.nextSibling.nextSibling) {
      content += spacer + '…\n';
    }
  }
  if (currentNode.parentNode && isElementNode(currentNode.parentNode)) {
    content = describeRNode(currentNode.parentNode as Node, '\n' + content);
  }
  return content;
}

/**
 * Describes the actual contents of the parent element when a child node is missing.
 */
function describeMissingNodeParentDom(parentNode: Node): string | null {
  if (!isElementNode(parentNode)) {
    return null;
  }
  if (!parentNode.firstChild) {
    return describeRNode(parentNode as unknown as RNode, '');
  }
  const spacer = '  ';
  const tailNodes: Node[] = [];
  let cursor = parentNode.lastChild;
  while (cursor !== null && tailNodes.length < 2) {
    tailNodes.unshift(cursor);
    cursor = cursor.previousSibling;
  }
  let inner = cursor !== null ? `\n${spacer}…\n` : '\n';
  for (const child of tailNodes) {
    inner += `${spacer}${describeRNode(child as unknown as RNode)}\n`;
  }
  return describeRNode(parentNode as unknown as RNode, inner);
}

// Component lookup & compact DOM path helpers

function getDeclarationComponentHostElement(lView: LView): RNode | null {
  const host = lView[DECLARATION_COMPONENT_VIEW]?.[HOST];
  return host ? unwrapRNode(host) : null;
}

function getSafeParentRElement(lView: LView, tNode: TNode): Node | null {
  return (tNode.type
    ? getParentRElement(lView[TVIEW], tNode, lView)
    : null) as unknown as Node | null;
}

function isElementNode(node: Node | null | undefined): node is Element {
  return node != null && node.nodeType === Node.ELEMENT_NODE;
}

function isBodyOrDocumentElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return tag === 'body' || tag === 'html';
}

function getComponentAtPatchedElement(el: Element): Record<string, unknown> | null {
  return readPatchedData(el as HTMLElement) !== null
    ? getComponent<Record<string, unknown>>(el)
    : null;
}

function getClosestComponentDef(node: RNode | null): ComponentDef<unknown> | null {
  let cursor: Node | null = node as Node | null;
  while (cursor !== null) {
    if (isElementNode(cursor)) {
      const component = getComponentAtPatchedElement(cursor);
      if (component !== null && component.constructor) {
        return getComponentDef(component.constructor);
      }
    }
    cursor = cursor.parentNode;
  }
  return null;
}

function escapeAttrValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getBaseSelectorLabel(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.getAttribute('id')?.trim();
  if (id) {
    const shortId = shorten(id, 30);
    return CSS_IDENTIFIER_REGEXP.test(shortId)
      ? `${tag}#${shortId}`
      : `${tag}[id="${escapeAttrValue(shortId)}"]`;
  }
  for (const attr of IDENTIFYING_ATTRS) {
    const value = el.getAttribute(attr)?.trim();
    if (value) {
      return `${tag}[${attr}="${escapeAttrValue(shorten(value, 30))}"]`;
    }
  }
  const classAttr = el.getAttribute('class');
  if (classAttr) {
    const classes: string[] = [];
    for (const token of classAttr.split(/\s+/)) {
      if (token && CSS_IDENTIFIER_REGEXP.test(token)) {
        classes.push(token);
        if (classes.length === 2) break;
      }
    }
    if (classes.length > 0) {
      return `${tag}.${classes.join('.')}`;
    }
  }
  return tag;
}

function formatSelectorSegment(el: Element): {label: string; isDisambiguated: boolean} {
  const baseLabel = getBaseSelectorLabel(el);
  const parent = el.parentNode;
  if (!isElementNode(parent)) {
    return {label: baseLabel, isDisambiguated: false};
  }

  const tag = el.tagName.toLowerCase();
  let indexOfType = 0;
  let seenSelf = false;
  let hasDuplicateLabel = false;
  let scanned = 0;

  for (let child = parent.firstChild; child !== null; child = child.nextSibling) {
    if (!isElementNode(child)) continue;
    if (++scanned > MAX_SIBLING_INDEX_SCAN) {
      return {label: baseLabel, isDisambiguated: false};
    }
    if (child.tagName.toLowerCase() !== tag) continue;
    if (!seenSelf) {
      indexOfType++;
      if (child === el) {
        seenSelf = true;
        continue;
      }
    }
    if (getBaseSelectorLabel(child) === baseLabel) {
      hasDuplicateLabel = true;
      if (seenSelf) break;
    }
  }

  return hasDuplicateLabel && seenSelf
    ? {label: `${baseLabel}:nth-of-type(${indexOfType})`, isDisambiguated: true}
    : {label: baseLabel, isDisambiguated: false};
}

function getSegmentPriority(el: Element, isDisambiguated: boolean): number {
  if (el.getAttribute('id')?.trim()) {
    return 2;
  }
  for (const attr of IDENTIFYING_ATTRS) {
    if (attr !== 'type' && el.getAttribute(attr)?.trim()) {
      return 2;
    }
  }
  if (getComponentAtPatchedElement(el) !== null) {
    return 2;
  }
  return isDisambiguated ? 1 : 0;
}

/**
 * Returns the 1-based sibling index descriptor when a node sits inside a parent with multiple
 * siblings (e.g. `(element 3 of 5)` or `(node 2 of 4)`), so repeated direct children in a template
 * or `@for` list can be told apart.
 */
function describeSiblingPosition(node: Node | undefined): string {
  if (!node || !isElementNode(node.parentNode)) {
    return '';
  }
  const elementsOnly = isElementNode(node);
  let position = 0;
  let total = 0;
  for (let child = node.parentNode.firstChild; child !== null; child = child.nextSibling) {
    if (elementsOnly && !isElementNode(child)) continue;
    total++;
    if (total > MAX_SIBLING_INDEX_SCAN) {
      return '';
    }
    if (child === node) {
      position = total;
    }
  }
  if (total <= 1 || position === 0) {
    return '';
  }
  return elementsOnly
    ? ` (child element ${position} of ${total})`
    : ` (child node ${position} of ${total})`;
}

/**
 * Formats a compact CSS-style ancestor path ending at `targetNode`, crossing component boundaries.
 * Duplicate siblings sharing the same base selector are disambiguated with `:nth-of-type(N)`.
 * Deep paths (`> MAX_DOM_PATH_SEGMENTS`) retain notable landmarks (`#id`, identifying attributes,
 * component hosts, and `:nth-of-type(N)` branches) while eliding unremarkable wrapper nodes.
 */
function buildDomPath(targetNode: Node | null | undefined, includeSingle = false): string | null {
  if (!isElementNode(targetNode) || isBodyOrDocumentElement(targetNode)) {
    return null;
  }

  const chain: Element[] = [];
  let cursor: Node | null = targetNode;
  while (
    isElementNode(cursor) &&
    !isBodyOrDocumentElement(cursor) &&
    chain.length < MAX_DOM_PATH_ANCESTOR_WALK
  ) {
    chain.unshift(cursor);
    cursor = cursor.parentNode;
  }
  if (chain.length === 0 || (!includeSingle && chain.length === 1)) {
    return null;
  }

  const segments = chain.map((el) => formatSelectorSegment(el));
  if (segments.length <= MAX_DOM_PATH_SEGMENTS) {
    return segments.map((s) => s.label).join(' > ');
  }

  // Always retain the root host (`0`) and the closest 3 ancestors to the mismatch.
  const kept = new Set<number>([0, segments.length - 3, segments.length - 2, segments.length - 1]);
  const middleBudget = MAX_DOM_PATH_SEGMENTS - kept.size;
  const middleCandidates: Array<{index: number; priority: number}> = [];
  for (let i = segments.length - 4; i >= 1; i--) {
    const priority = getSegmentPriority(chain[i], segments[i].isDisambiguated);
    if (priority > 0) {
      middleCandidates.push({index: i, priority});
    }
  }
  // Prefer higher-signal landmarks (`id`, identifying attributes, component hosts), breaking ties
  // in favor of ancestors closer to the mismatch.
  middleCandidates.sort((a, b) => b.priority - a.priority || b.index - a.index);
  for (let i = 0; i < middleCandidates.length && i < middleBudget; i++) {
    kept.add(middleCandidates[i].index);
  }

  const ordered = Array.from(kept).sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const idx = ordered[i];
    if (i > 0 && idx - ordered[i - 1] > 1) {
      parts.push('…');
    }
    parts.push(segments[idx].label);
  }
  return parts.join(' > ');
}

function formatDomPathSection(
  expectedParent: Node | null,
  actualParent?: Node | null,
  actualNode?: Node,
): string {
  const position = describeSiblingPosition(actualNode);
  if (actualParent && actualParent !== expectedParent) {
    const expectedPath = buildDomPath(expectedParent, true);
    const actualPath = buildDomPath(actualParent, true);
    let section = '';
    if (expectedPath) {
      section += `Expected DOM path: ${expectedPath}\n`;
    }
    if (actualPath) {
      section += `Actual DOM path: ${actualPath}${position}\n`;
    }
    return section ? `${section}\n` : '';
  }
  const path = buildDomPath(expectedParent, position !== '');
  return path ? `DOM path: ${path}${position}\n\n` : '';
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
      const shortened = textContent ? shorten(textContent) : '';
      const content = shortened ? ` (with the "${shortened}" content)` : '';
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
 * @param componentDef the ComponentDef of the declaring component, if available
 * @returns string
 */
function getHydrationErrorFooter(componentDef?: ComponentDef<unknown> | null): string {
  const debugInfo = componentDef?.debugInfo;
  const componentClassName = debugInfo?.className || componentDef?.type?.name;
  const sourceLocation =
    debugInfo?.filePath && debugInfo?.lineNumber
      ? ` (at ${debugInfo.filePath}:${debugInfo.lineNumber})`
      : '';
  const componentInfo = componentClassName ? `the "${componentClassName}"` : 'corresponding';
  return (
    `To fix this problem:\n` +
    `  * check ${componentInfo} component${sourceLocation} for hydration-related issues\n` +
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
 * Collapses whitespace runs (including newlines) into single spaces and trims ends.
 *
 * @param input a string to normalize
 * @returns
 */
function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/gm, ' ').trim();
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
  input = normalizeWhitespace(input);
  return input.length > maxLength ? `${input.substring(0, maxLength - 1)}…` : input;
}

/**
 * Cheap, production-safe description of a DOM node for error messages: its `nodeName`, plus a
 * truncated snippet of its `textContent` if it has any. Unlike `shorten()` above, this is meant
 * to be called from code paths that also run in production, so it skips the newline-stripping
 * and ellipsis formatting that `shorten()` does.
 */
export function describeDomNode(node: Node): string {
  const textContent = node.textContent?.slice(0, 50);
  return textContent ? `${node.nodeName} ("${textContent}")` : node.nodeName;
}
