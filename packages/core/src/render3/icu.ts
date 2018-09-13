/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SRCSET_ATTRS, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS, getTemplateContent} from '../sanitization/html_sanitizer';
import {InertBodyHelper} from '../sanitization/inert_body';
import {_sanitizeUrl, sanitizeSrcset} from '../sanitization/url_sanitizer';
import {assertDefined, assertEqual, assertLessThan} from './assert';
import {_getViewData, _setViewData, assertDataInRange, bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, createNodeAtIndex, getCurrentNgLocalization, getPreviousOrParentTNode, getRenderer, getTNode, getTView, load, setIsParent, setPreviousOrParentTNode} from './instructions';
import {ACTIVE_CASE, ICU_HEADER_OFFSET, ICU_RENDER_PARENT, IcuExpression, IcuTemplate, IcuType, LIcuData, PLURAL_RESOLVER} from './interfaces/icu';
import {LIcuNode, TElementNode, TIcuNode, TNode, TNodeType} from './interfaces/node';
import {RElement, RText} from './interfaces/renderer';
import {BINDING_INDEX, HEADER_OFFSET, LViewData, PARENT, TVIEW} from './interfaces/view';
import {addRemoveCaseFromICU, appendChild, getRenderParent} from './node_manipulation';
import {addAll, readElementValue, stringify} from './util';


// TODO(ocombe): update API docs once we have the final design
/**
 * Allocates a space in the template which will store ICU information.
 * This instruction is used with `icuBinding` instruction to update the ICU.
 *
 * ## Example
 * template: (rf: RenderFlags, myApp: MyApp) => {
 *   if (rf & RenderFlags.Create) {
 *     icu(0);
 *   }
 *   if (rf & RenderFlags.Update) {
 *     icuBinding(0, ...);
 *   }
 * }
 *
 * @param nodeIndex The index of the ICU expression allocation.
 * @param dataIndex The index of the ICU expression data in the current i18n mapping
 * @param rootLViewData
 */
export function icu(nodeIndex: number, dataIndex: number, rootLViewData?: LViewData): TIcuNode {
  const viewData = _getViewData();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], getTView().bindingStartIndex,
                   'ICU container nodes should be created before any bindings');

  const lIcuData = createLIcuData(viewData, dataIndex);
  const comment = getRenderer().createComment(ngDevMode ? 'ICU' : '');
  const tIcuNode: TIcuNode =
      createNodeAtIndex(nodeIndex, TNodeType.IcuExpression, comment, null, null, lIcuData);
  lIcuData[ICU_RENDER_PARENT] = getRenderParent(tIcuNode, viewData);
  appendChild(comment, tIcuNode, viewData);
  setIsParent(false);

  if (!rootLViewData) {
    rootLViewData = _getViewData();
    while (!rootLViewData[TVIEW].i18nInstructions && rootLViewData[PARENT]) {
      rootLViewData = rootLViewData[PARENT] !;
    }
  }

  if (!rootLViewData[TVIEW].icuNodes) {
    rootLViewData[TVIEW].icuNodes = [];
  }
  rootLViewData[TVIEW].icuNodes ![dataIndex] = nodeIndex;

  return tIcuNode;
}

const icuTagRegex = /\{\$([^}]+)\}/g;

// TODO(ocombe): update API docs once we have the final design
/**
 * Generates the mapping for an ICU Expression.
 *
 * @param type The type of the ICU Expression (plural or select)
 * @param mainBinding Index of the main binding
 * @param keys The list of keys
 * @param values The list of values
 * @param bindings A list of bindings that this ICU expression can use
 */
export function icuMapping(
    type: IcuType, mainBinding: number, keys: string[],
    values: (string | (string | IcuExpression)[])[],
    bindings: string[] | null = null): IcuExpression {
  let templates: IcuTemplate[] = [];
  const embedded: IcuExpression[] = [];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value === 'string') {
      templates.push(parseHTML(value, bindings));
    } else {
      // It is an array of strings & other ICU expressions
      for (let j = 0; j < value.length; j++) {
        if (typeof value[j] !== 'string') {
          // It is an embedded ICU expression
          const index = embedded.push(value[j] as IcuExpression) - 1;
          value[j] = `<!--__ICU-${index}__-->`;
        }
      }
      templates.push(parseHTML(value.join(''), bindings));
    }
  }

  return {type, keys, templates, mainBinding, embedded};
}

let bindingsDifferent: boolean;
let bindingsOffset: number;

/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function icuBindingV(values: any[]): void {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  ngDevMode && assertEqual(values.length % 2, 1, 'should have an odd number of values');

  const viewData = _getViewData();
  bindingsDifferent = false;
  bindingsOffset = viewData[BINDING_INDEX];

  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    bindingUpdated(viewData[BINDING_INDEX]++, values[i]) && (bindingsDifferent = true);
  }
}

/**
 * Creates an ICU interpolation binding with 1 expression.
 *
 * @param v0 value checked for change.
 */
export function icuBinding1(v0: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated(viewData[BINDING_INDEX]++, v0);
}

/** Creates an interpolation binding with 2 expressions. */
export function icuBinding2(v0: any, v1: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated2(viewData[BINDING_INDEX], v0, v1);
  viewData[BINDING_INDEX] += 2;
}

/** Creates an interpolation binding with 3 expressions. */
export function icuBinding3(v0: any, v1: any, v2: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated3(viewData[BINDING_INDEX]++, v0, v1, v2);
  viewData[BINDING_INDEX] += 3;
}

/** Create an interpolation binding with 4 expressions. */
export function icuBinding4(v0: any, v1: any, v2: any, v3: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  viewData[BINDING_INDEX] += 4;
}

/** Creates an interpolation binding with 5 expressions. */
export function icuBinding5(v0: any, v1: any, v2: any, v3: any, v4: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  bindingsDifferent = bindingUpdated(viewData[BINDING_INDEX] + 4, v4) || bindingsDifferent;
  viewData[BINDING_INDEX] += 5;
}

/** Creates an interpolation binding with 6 expressions. */
export function icuBinding6(v0: any, v1: any, v2: any, v3: any, v4: any, v5: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  bindingsDifferent = bindingUpdated2(viewData[BINDING_INDEX] + 4, v4, v5) || bindingsDifferent;
  viewData[BINDING_INDEX] += 6;
}

/** Creates an interpolation binding with 7 expressions. */
export function icuBinding7(v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  bindingsDifferent = bindingUpdated3(viewData[BINDING_INDEX] + 4, v4, v5, v6) || bindingsDifferent;
  viewData[BINDING_INDEX] += 7;
}

/** Creates an interpolation binding with 8 expressions. */
export function icuBinding8(
    v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any): void {
  const viewData = _getViewData();
  bindingsOffset = viewData[BINDING_INDEX];
  bindingsDifferent = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  bindingsDifferent =
      bindingUpdated4(viewData[BINDING_INDEX] + 4, v4, v5, v6, v7) || bindingsDifferent;
  viewData[BINDING_INDEX] += 8;
}

const EMBEDDED_ICU = /__ICU-(\d+)__/;
/**
 * Stack used to keep track of the instructions of ICU expressions.
 * This is deliberately created outside of `icuBindingApply` to avoid allocating
 * a new array every time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 */
let instructionsStack: IcuInstruction[] = [];

/**
 * Takes an ICU mapping generated by `icuMapping()` to transform the template accordingly.
 * It only updates the template if `icuBindingX` (with X a number from 1 to 8) determined that the
 * value returned by the ICU might have changed.
 *
 * @param mappingIndex Index of this mapping in `tView.icuExpressions`
 */
export function icuBindingApply(mappingIndex: number): void {
  if (!bindingsDifferent) {
    return;
  }

  const viewData = _getViewData();

  let rootLViewData = viewData;
  while (!rootLViewData[TVIEW].icuExpressions && rootLViewData[PARENT]) {
    rootLViewData = rootLViewData[PARENT] !;
  }

  if (ngDevMode) {
    assertDefined(
        rootLViewData[TVIEW].icuExpressions,
        'icuMapping should be defined before calling icuBindingApply');
  }

  const icuExpression = rootLViewData[TVIEW].icuExpressions ![mappingIndex];
  if (!icuExpression) {
    return;
  }

  const index = rootLViewData[TVIEW].icuNodes ![mappingIndex];
  if (ngDevMode) {
    assertDataInRange(index + HEADER_OFFSET);
  }

  const lIcuNode = load(index) as LIcuNode;
  const tIcuNode = getTNode(index) as TIcuNode;
  if (ngDevMode) {
    assertEqual(tIcuNode.type, TNodeType.IcuExpression, 'Node should be an ICU expression');
    ngDevMode.rendererSetICU++;
  }

  const mainBindingValue = stringify(viewData[bindingsOffset + icuExpression.mainBinding]);
  const oldCaseIndex = lIcuNode.data[ACTIVE_CASE];
  const newCaseIndex = getCaseIndex(icuExpression, mainBindingValue, lIcuNode);

  // Remove the DOM nodes from the previous case
  if (oldCaseIndex !== -1 && oldCaseIndex !== newCaseIndex) {
    addRemoveCaseFromICU(lIcuNode, tIcuNode, viewData, false);
    // Clean up the `LIcuData`
    lIcuNode.data.length = ICU_HEADER_OFFSET;
  }

  if (newCaseIndex !== -1) {
    let template = icuExpression.templates[newCaseIndex];

    // Create new nodes
    if (oldCaseIndex !== newCaseIndex) {
      _setViewData(lIcuNode.data as any as LViewData);
      setPreviousOrParentTNode(tIcuNode);
      setIsParent(true);

      // Creating nodes without a view will overwrite lIcuNode next's value, keep it for later
      const next = tIcuNode.next;
      let nodeIndex = 0;
      appendNodes(template, nodeIndex, icuExpression, lIcuNode, tIcuNode, viewData);

      _setViewData(viewData);
      addRemoveCaseFromICU(lIcuNode, tIcuNode, viewData, true);
      // Restore lIcuNode's next value in case of projection
      tIcuNode.next = next;
    }

    // Update bindings & embedded ICUs
    const child = tIcuNode.child;
    if (child) {
      let lChild = readElementValue(lIcuNode.data[child.index]);
      let node = lChild.native !as any as Node;
      const instructions = template.instructions.slice();
      for (let j = 0; j < instructions.length; j++) {
        switch (instructions[j]) {
          case IcuInstructions.FIRST_CHILD:
            node = node.firstChild !;
            break;
          case IcuInstructions.NEXT_SIBLING:
            node = node.nextSibling !;
            break;
          case IcuInstructions.PARENT_NODE:
            node = node.parentNode !;
            break;
          case IcuInstructions.START_INTERPOLATION:
            let attrName, sanitize;
            const isElement = node.nodeType === Node.ELEMENT_NODE;

            if (isElement) {
              attrName = instructions[++j] as string;
              sanitize = instructions[++j] as Function;
            }

            let value = '';
            let nextInstruction = instructions[++j];
            while (nextInstruction !== IcuInstructions.END_INTERPOLATION) {
              if (typeof nextInstruction === 'string') {
                value += nextInstruction;
              } else {
                // it's a binding
                value += stringify(viewData[bindingsOffset + (nextInstruction as number)]);
              }
              nextInstruction = instructions[++j];
            }
            if (isElement) {
              (node as Element)
                  .setAttribute(attrName as string, sanitize ? sanitize(value) : value);
            } else {
              node.textContent = value;
            }
            break;
          case IcuInstructions.EMBEDDED_ICU:
            // An embedded ICU expression
            const index = instructions[++j] as number;
            const embeddedIcu = icuExpression.embedded[index];
            const embeddedMainBinding =
                stringify(viewData[bindingsOffset + embeddedIcu.mainBinding]);
            const embeddedIndex = getCaseIndex(embeddedIcu, embeddedMainBinding, lIcuNode);
            const embeddedTemplate = embeddedIcu.templates[embeddedIndex];
            if (node.nodeType === Node.COMMENT_NODE) {
              // if we still have the comment node, we need to replace it by the embedded nodes
              const firstChild = embeddedTemplate.wrapper.cloneNode(true).firstChild;
              let nextNode = firstChild;
              while (nextNode) {
                const nodeToMove = nextNode;
                nextNode = nextNode.nextSibling;
                node.parentNode !.insertBefore(nodeToMove, node.nextSibling);
              }
              node.parentNode !.removeChild(node);
              node = firstChild !;
            }
            // add the instructions for the embedded ICU
            instructions.splice(j + 1, 0, ...embeddedTemplate.instructions);
        }
      }
    }
  }
  lIcuNode.data[ACTIVE_CASE] = newCaseIndex;
}

function appendNodes(
    template: IcuTemplate, nodeIndex: number, icuExpression: IcuExpression, lIcuNode: LIcuNode,
    tIcuNode: TIcuNode, viewData: LViewData) {
  let nextNode = template.wrapper.cloneNode(true).firstChild;
  while (nextNode) {
    if (nextNode.nodeType === Node.COMMENT_NODE) {
      // Check if the comment node is a placeholder for an embedded ICU
      const match = EMBEDDED_ICU.exec(nextNode.textContent || '');
      if (match) {
        const index = parseInt(match[1], 10);
        const embeddedIcu = icuExpression.embedded[index];
        const embeddedMainBinding = stringify(viewData[bindingsOffset + embeddedIcu.mainBinding]);
        const embeddedIndex = getCaseIndex(embeddedIcu, embeddedMainBinding, lIcuNode);
        const embeddedTemplate = embeddedIcu.templates[embeddedIndex];
        // Append the nodes of the embedded ICU
        appendNodes(embeddedTemplate, nodeIndex, icuExpression, lIcuNode, tIcuNode, viewData);
      }
    }
    addNode(nodeIndex++, nextNode, tIcuNode);
    nextNode = nextNode.nextSibling;
  }
}

/**
 * Creates an LNode in the current view at the given index.
 *
 * @param index The index at which to add the node on the current view
 * @param node The DOM element for the node to create
 * @param lIcuTNode The `LIcuTNode` that is used as an anchor for this ICU expression
 */
function addNode(index: number, node: RElement | RText | null, lIcuTNode: TNode): void {
  const previousOrParentTNode = getPreviousOrParentTNode();
  setPreviousOrParentTNode(lIcuTNode);
  setIsParent(true);
  const tNode =
      createNodeAtIndex(index, TNodeType.Element, node, null, null, null, ICU_HEADER_OFFSET);
  tNode.parent = lIcuTNode as TElementNode;

  // Now link ourselves into the tree.
  if (index === 0) {
    lIcuTNode.child = tNode;
  } else {
    previousOrParentTNode.next = tNode;
  }
}

/**
 * Returns the index of the current case of an ICU expression depending on the main binding value
 *
 * @param icuExpression
 * @param bindingValue The value of the main binding used by this ICU expression
 * @param lIcuNode The `LIcuNode` that is used as an anchor for this ICU expression
 */
function getCaseIndex(
    icuExpression: IcuExpression, bindingValue: string, lIcuNode: LIcuNode): number {
  let index = icuExpression.keys.indexOf(bindingValue);
  if (index === -1) {
    switch (icuExpression.type) {
      case IcuType.Plural: {
        let resolver = lIcuNode.data[PLURAL_RESOLVER];
        if (!resolver) {
          const ngLocaleLocalization = getCurrentNgLocalization();
          if (!ngLocaleLocalization) {
            throw new Error('An instance of NgLocalization is required for plural ICU expressions');
          }
          resolver = (value: any) => ngLocaleLocalization.getPluralCategory(value);
          lIcuNode.data[PLURAL_RESOLVER] = resolver;
        }
        const resolvedCase = resolver(bindingValue);
        index = icuExpression.keys.indexOf(resolvedCase);
        if (index === -1 && resolvedCase !== 'other') {
          index = icuExpression.keys.indexOf('other');
        }
        break;
      }
      case IcuType.Select: {
        index = icuExpression.keys.indexOf('other');
        break;
      }
    }
  }
  return index;
}

/**
 * Transforms a string template into an HTML template and a list of instructions used to update
 * attributes or nodes that contain bindings.
 *
 * @param unsafeHtml The string to parse
 * @param bindings A list of bindings that can be used in the message
 */
function parseHTML(unsafeHtml: string, bindings: string[] | null): IcuTemplate {
  const inertBodyHelper = new InertBodyHelper(document);
  const inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
  if (!inertBodyElement) {
    throw new Error('Unable to generate inert body element');
  }
  const instructions: (string | number | Function)[] = [];
  const wrapper = getTemplateContent(inertBodyElement !) as Element || inertBodyElement;
  parseNode(wrapper, bindings, instructions);
  // Remove the first instruction as it is always `FIRST_CHILD`
  instructions.shift();
  // Remove the last instruction as it is always `PARENT_NODE`
  instructions.pop();
  return {wrapper, instructions};
}

/**
 * A list of flags to encode the icu instructions used to update the template.
 * We use negative numbers to make sure that they will not be confused with binding indexes.
 */
const enum IcuInstructions {
  FIRST_CHILD = -1,
  NEXT_SIBLING = -2,
  PARENT_NODE = -3,
  START_INTERPOLATION = -4,
  END_INTERPOLATION = -5,
  EMBEDDED_ICU = -6,
}

/**
 * Represents the instructions used to translate the template.
 * Instructions can be a placeholder index, a static text, an ICU instruction or a simple bit field
 * (`I18nInstructions`).
 * When the instruction is the flag `Text`, it is always followed by its text value.
 */
type IcuInstruction = string | number | null | Function;

/**
 * Parses a node & its children and generates a list of instructions to update attributes or nodes
 * that contain bindings.
 *
 * @param node The node to parse
 * @param bindings A list of bindings that can be used in the message
 * @param instructions A set of instructions to update attributes or nodes that contain bindings.
 */
function parseNode(node: Node, bindings: string[] | null, instructions: IcuInstruction[]) {
  let current = node.firstChild;
  if (current) {
    instructions.push(IcuInstructions.FIRST_CHILD);
    while (current) {
      const nextNode: Node|null = current.nextSibling;
      switch (current.nodeType) {
        case Node.ELEMENT_NODE:
          const element = current as Element;

          if (!VALID_ELEMENTS.hasOwnProperty(element.tagName.toLowerCase())) {
            node.removeChild(current);
          } else {
            const elAttrs = element.attributes;
            for (let i = 0; i < elAttrs.length; i++) {
              const elAttr = elAttrs.item(i) !;
              const lower = elAttr.name.toLowerCase();
              const hasBinding = !!elAttr.value.match(icuTagRegex);
              // we assume the input string is safe, unless it's using a binding
              if (hasBinding) {
                if (!VALID_ATTRS.hasOwnProperty(lower)) {
                  if (ngDevMode) {
                    console.warn(
                        `WARNING: sanitizing unsafe attribute value ${lower} (see http://g.co/ng/security#xss)`);
                  }

                  element.removeAttribute(elAttr.name);
                  i--;
                } else {
                  if (URI_ATTRS[lower]) {
                    addInstruction(instructions, bindings, elAttr.value, elAttr.name, _sanitizeUrl);
                  } else if (SRCSET_ATTRS[lower]) {
                    addInstruction(
                        instructions, bindings, elAttr.value, elAttr.name, sanitizeSrcset);
                  } else {
                    addInstruction(instructions, bindings, elAttr.value, elAttr.name, null);
                  }
                }
              }
            }
            parseNode(current, bindings, instructions);
          }
          break;
        case Node.TEXT_NODE:
          addInstruction(instructions, bindings, current.textContent || '');
          break;
        case Node.COMMENT_NODE:
          // Check if the comment node is a placeholder for an embedded ICU
          const match = EMBEDDED_ICU.exec(current.textContent || '');
          if (match) {
            instructions.push(IcuInstructions.EMBEDDED_ICU);
            // Index of the ICU in the `embedded` property
            instructions.push(parseInt(match[1], 10));
          }
          break;
        default:
          // Strip non-element, non-text nodes.
          current.parentNode !.removeChild(current);
      }
      current = nextNode;
      if (nextNode) {
        instructions.push(IcuInstructions.NEXT_SIBLING);
      }
    }
    instructions.push(IcuInstructions.PARENT_NODE);
  }
}

/**
 * Adds a set of instructions to update attributes or nodes that contain bindings.
 *
 * @param instructions The existing list of instructions for this ICU expression
 * @param bindings A list of bindings that can be used in the message
 * @param value Content of the attribute or node that contains bindings
 * @param attrName Name of the attribute to update, if the value is from an attribute
 * @param sanitize An optional function used to sanitize the value
 */
function addInstruction(
    instructions: IcuInstruction[], bindings: string[] | null, value: string, attrName?: string,
    sanitize?: null | ((v: string) => string)) {
  instructions.push(IcuInstructions.START_INTERPOLATION);
  if (attrName) {
    instructions.push(attrName);
  }
  if (typeof sanitize !== 'undefined') {
    instructions.push(sanitize);
  }
  addAll(splitValue(value, bindings), instructions);
  instructions.push(IcuInstructions.END_INTERPOLATION);
}

/**
 * Takes a string message and returns a list of strings and binding indexes. Empty strings are
 * replaced by null.
 *
 * @param message The message to split
 * @param bindings A list of bindings that can be used in the message
 */
function splitValue(message: string, bindings: string[] | null): (string | number)[] {
  const template = [];
  // Split the template string, even indexes are text and odd indexes are bindings
  const splitTemplate = message.split(icuTagRegex);

  for (let i = 0; i < splitTemplate.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // If this is a binding, push the binding index into the arrays
      const bindingIndex = bindings !.indexOf(splitTemplate[i]);
      template.push(bindingIndex);
    } else {
      // Even indexes are text
      template.push(splitTemplate[i]);
    }
  }

  return template;
}

/**
 * Creates a `LIcuData`, either from a container instruction, or for a ViewContainerRef.
 *
 * @param currentView The parent view of the LIcuNode
 * @param dataIndex The index of the ICU expression data in the current i18n mapping
 */
function createLIcuData(currentView: LViewData, dataIndex: number): LIcuData {
  return [
    -1,  // active index
    null,
    currentView,
    null,  // renderParent, set after node creation
    dataIndex,
  ];
}
