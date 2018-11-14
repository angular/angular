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
import {assertDefined, assertEqual, assertGreaterThan} from './assert';
import {allocExpando, createNodeAtIndex, elementAttribute, load, textBinding} from './instructions';
import {LContainer, NATIVE, RENDER_PARENT} from './interfaces/container';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nMutateOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, IcuType, TI18n, TIcu} from './interfaces/i18n';
import {TElementNode, TIcuContainerNode, TNode, TNodeType} from './interfaces/node';
import {RComment, RElement} from './interfaces/renderer';
import {SanitizerFn} from './interfaces/sanitization';
import {StylingContext} from './interfaces/styling';
import {BINDING_INDEX, HEADER_OFFSET, HOST_NODE, LViewData, TVIEW, TView} from './interfaces/view';
import {appendChild, createTextNode, removeChild} from './node_manipulation';
import {_getViewData, getIsParent, getPreviousOrParentTNode, getRenderer, getTView, setIsParent, setPreviousOrParentTNode} from './state';
import {NO_CHANGE} from './tokens';
import {addAllToArray, getNativeByIndex, getNativeByTNode, getTNode, isLContainer, stringify} from './util';

const MARKER = `�`;
const ICU_BLOCK_REGEX = /^\s*(�\d+�)\s*,\s*(select|plural)\s*,/;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;
const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+�\s*,\s*\S{6}\s*,[\s\S]*})/gi;

interface IcuExpression {
  type: IcuType;
  mainBinding: number;
  cases: string[];
  values: (string|IcuExpression)[][];
}

interface IcuCase {
  /**
   * Number of slots to allocate in expando for this case.
   *
   * This is the max number of DOM elements which will be created by this i18n + ICU blocks. When
   * the DOM elements are being created they are stored in the EXPANDO, so that update OpCodes can
   * write into them.
   */
  vars: number;

  /**
   * An optional array of child/sub ICUs.
   */
  childIcus: number[];

  /**
   * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
   */
  create: I18nMutateOpCodes;

  /**
   * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
   */
  remove: I18nMutateOpCodes;

  /**
   * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
   */
  update: I18nUpdateOpCodes;
}

/**
 * Breaks pattern into strings and top level {...} blocks.
 * Can be used to break a message into text and ICU expressions, or to break an ICU expression into
 * keys and cases.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern (sub)Pattern to be broken.
 *
 */
function extractParts(pattern: string): (string | IcuExpression)[] {
  if (!pattern) {
    return [];
  }

  let prevPos = 0;
  const braceStack = [];
  const results: (string | IcuExpression)[] = [];
  const braces = /[{}]/g;
  // lastIndex doesn't get set to 0 so we have to.
  braces.lastIndex = 0;

  let match;
  while (match = braces.exec(pattern)) {
    const pos = match.index;
    if (match[0] == '}') {
      braceStack.pop();

      if (braceStack.length == 0) {
        // End of the block.
        const block = pattern.substring(prevPos, pos);
        if (ICU_BLOCK_REGEX.test(block)) {
          results.push(parseICUBlock(block));
        } else if (block) {  // Don't push empty strings
          results.push(block);
        }

        prevPos = pos + 1;
      }
    } else {
      if (braceStack.length == 0) {
        const substring = pattern.substring(prevPos, pos);
        results.push(substring);
        prevPos = pos + 1;
      }
      braceStack.push('{');
    }
  }

  const substring = pattern.substring(prevPos);
  if (substring != '') {
    results.push(substring);
  }

  return results;
}

/**
 * Parses text containing an ICU expression and produces a JSON object for it.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern Text containing an ICU expression that needs to be parsed.
 *
 */
function parseICUBlock(pattern: string): IcuExpression {
  const cases = [];
  const values: (string | IcuExpression)[][] = [];
  let icuType = IcuType.plural;
  let mainBinding = 0;
  pattern = pattern.replace(ICU_BLOCK_REGEX, function(str: string, binding: string, type: string) {
    if (type === 'select') {
      icuType = IcuType.select;
    } else {
      icuType = IcuType.plural;
    }
    mainBinding = parseInt(binding.substr(1), 10);
    return '';
  });

  const parts = extractParts(pattern) as string[];
  // Looking for (key block)+ sequence. One of the keys has to be "other".
  for (let pos = 0; pos < parts.length;) {
    let key = parts[pos++].trim();
    if (icuType === IcuType.plural) {
      // Key can be "=x", we just want "x"
      key = key.replace(/\s*(?:=)?(\w+)\s*/, '$1');
    }
    if (key.length) {
      cases.push(key);
    }

    const blocks = extractParts(parts[pos++]) as string[];
    if (blocks.length) {
      values.push(blocks);
    }
  }

  assertGreaterThan(cases.indexOf('other'), -1, 'Missing key "other" in ICU statement.');
  // TODO(ocombe): support ICU expressions in attributes, see #21615
  return {type: icuType, mainBinding: mainBinding, cases, values};
}

/**
 * Removes everything inside the sub-templates of a message.
 */
function removeInnerTemplateTranslation(message: string): string {
  let match;
  let res = '';
  let index = 0;
  let inTemplate = false;
  let tagMatched;

  while ((match = SUBTEMPLATE_REGEXP.exec(message)) !== null) {
    if (!inTemplate) {
      res += message.substring(index, match.index + match[0].length);
      tagMatched = match[1];
      inTemplate = true;
    } else {
      if (match[0] === `${MARKER}/*${tagMatched}${MARKER}`) {
        index = match.index;
        inTemplate = false;
      }
    }
  }

  ngDevMode &&
      assertEqual(
          inTemplate, false,
          `Tag mismatch: unable to find the end of the sub-template in the translation "${message}"`);

  res += message.substr(index);
  return res;
}

/**
 * Extracts a part of a message and removes the rest.
 *
 * This method is used for extracting a part of the message associated with a template. A translated
 * message can span multiple templates.
 *
 * Example:
 * ```
 * <div i18n>Translate <span *ngIf>me</span>!</div>
 * ```
 *
 * @param message The message to crop
 * @param subTemplateIndex Index of the sub-template to extract. If undefined it returns the
 * external template and removes all sub-templates.
 */
export function getTranslationForTemplate(message: string, subTemplateIndex?: number) {
  if (typeof subTemplateIndex !== 'number') {
    // We want the root template message, ignore all sub-templates
    return removeInnerTemplateTranslation(message);
  } else {
    // We want a specific sub-template
    const start =
        message.indexOf(`:${subTemplateIndex}${MARKER}`) + 2 + subTemplateIndex.toString().length;
    const end = message.search(new RegExp(`${MARKER}\\/\\*\\d+:${subTemplateIndex}${MARKER}`));
    return removeInnerTemplateTranslation(message.substring(start, end));
  }
}

/**
 * Generate the OpCodes to update the bindings of a string.
 *
 * @param str The string containing the bindings.
 * @param destinationNode Index of the destination node which will receive the binding.
 * @param attrName Name of the attribute, if the string belongs to an attribute.
 * @param sanitizeFn Sanitization function used to sanitize the string after update, if necessary.
 */
function generateBindingUpdateOpCodes(
    str: string, destinationNode: number, attrName?: string,
    sanitizeFn: SanitizerFn | null = null): I18nUpdateOpCodes {
  const updateOpCodes: I18nUpdateOpCodes = [null, null];  // Alloc space for mask and size
  const textParts = str.split(BINDING_REGEXP);
  let mask = 0;

  for (let j = 0; j < textParts.length; j++) {
    const textValue = textParts[j];

    if (j & 1) {
      // Odd indexes are bindings
      const bindingIndex = parseInt(textValue, 10);
      updateOpCodes.push(-1 - bindingIndex);
      mask = mask | toMaskBit(bindingIndex);
    } else if (textValue !== '') {
      // Even indexes are text
      updateOpCodes.push(textValue);
    }
  }

  updateOpCodes.push(
      destinationNode << I18nUpdateOpCode.SHIFT_REF |
      (attrName ? I18nUpdateOpCode.Attr : I18nUpdateOpCode.Text));
  if (attrName) {
    updateOpCodes.push(attrName, sanitizeFn);
  }
  updateOpCodes[0] = mask;
  updateOpCodes[1] = updateOpCodes.length - 2;
  return updateOpCodes;
}

function getBindingMask(icuExpression: IcuExpression, mask = 0): number {
  mask = mask | toMaskBit(icuExpression.mainBinding);
  let match;
  for (let i = 0; i < icuExpression.values.length; i++) {
    const valueArr = icuExpression.values[i];
    for (let j = 0; j < valueArr.length; j++) {
      const value = valueArr[j];
      if (typeof value === 'string') {
        while (match = BINDING_REGEXP.exec(value)) {
          mask = mask | toMaskBit(parseInt(match[1], 10));
        }
      } else {
        mask = getBindingMask(value as IcuExpression, mask);
      }
    }
  }
  return mask;
}

const i18nIndexStack: number[] = [];
let i18nIndexStackPointer = -1;

/**
 * Convert binding index to mask bit.
 *
 * Each index represents a single bit on the bit-mask. Because bit-mask only has 32 bits, we make
 * the 32nd bit share all masks for all bindings higher than 32. Since it is extremely rare to have
 * more than 32 bindings this will be hit very rarely. The downside of hitting this corner case is
 * that we will execute binding code more often than necessary. (penalty of performance)
 */
function toMaskBit(bindingIndex: number): number {
  return 1 << Math.min(bindingIndex, 31);
}

const parentIndexStack: number[] = [];

/**
 * Marks a block of text as translatable.
 *
 * The instructions `i18nStart` and `i18nEnd` mark the translation block in the template.
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param message The translation message.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 */
export function i18nStart(index: number, message: string, subTemplateIndex?: number): void {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  ngDevMode &&
      assertEqual(
          tView.firstTemplatePass, true, `You should only call i18nEnd on first template pass`);
  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    i18nStartFirstPass(tView, index, message, subTemplateIndex);
  }
}

/**
 * See `i18nStart` above.
 */
function i18nStartFirstPass(
    tView: TView, index: number, message: string, subTemplateIndex?: number) {
  i18nIndexStack[++i18nIndexStackPointer] = index;
  const viewData = _getViewData();
  const expandoStartIndex = tView.blueprint.length - HEADER_OFFSET;
  const previousOrParentTNode = getPreviousOrParentTNode();
  const parentTNode = getIsParent() ? getPreviousOrParentTNode() :
                                      previousOrParentTNode && previousOrParentTNode.parent;
  let parentIndex = parentTNode && parentTNode !== viewData[HOST_NODE] ?
      parentTNode.index - HEADER_OFFSET :
      index;
  let parentIndexPointer = 0;
  parentIndexStack[parentIndexPointer] = parentIndex;
  const createOpCodes: I18nMutateOpCodes = [];
  // If the previous node wasn't the direct parent then we have a translation without top level
  // element and we need to keep a reference of the previous element if there is one
  if (index > 0 && previousOrParentTNode !== parentTNode) {
    // Create an OpCode to select the previous TNode
    createOpCodes.push(
        previousOrParentTNode.index << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select);
  }
  const updateOpCodes: I18nUpdateOpCodes = [];
  const icuExpressions: TIcu[] = [];

  const templateTranslation = getTranslationForTemplate(message, subTemplateIndex);
  const msgParts = templateTranslation.split(PH_REGEXP);
  for (let i = 0; i < msgParts.length; i++) {
    let value = msgParts[i];
    if (i & 1) {
      // Odd indexes are placeholders (elements and sub-templates)
      if (value.charAt(0) === '/') {
        // It is a closing tag
        if (value.charAt(1) === '#') {
          const phIndex = parseInt(value.substr(2), 10);
          parentIndex = parentIndexStack[--parentIndexPointer];
          createOpCodes.push(phIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd);
        }
      } else {
        const phIndex = parseInt(value.substr(1), 10);
        // The value represents a placeholder that we move to the designated index
        createOpCodes.push(
            phIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
            parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

        if (value.charAt(0) === '#') {
          parentIndexStack[++parentIndexPointer] = parentIndex = phIndex;
        }
      }
    } else {
      // Even indexes are text (including bindings & ICU expressions)
      const parts = value.split(ICU_REGEXP);
      for (let j = 0; j < parts.length; j++) {
        value = parts[j];

        if (j & 1) {
          // Odd indexes are ICU expressions
          // Create the comment node that will anchor the ICU expression
          allocExpando(viewData);
          const icuNodeIndex = tView.blueprint.length - 1 - HEADER_OFFSET;
          createOpCodes.push(
              COMMENT_MARKER, ngDevMode ? `ICU ${icuNodeIndex}` : '',
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

          // Update codes for the ICU expression
          const icuExpression = parseICUBlock(value.substr(1, value.length - 2));
          const mask = getBindingMask(icuExpression);
          icuStart(icuExpressions, icuExpression, icuNodeIndex, icuNodeIndex);
          // Since this is recursive, the last TIcu that was pushed is the one we want
          const tIcuIndex = icuExpressions.length - 1;
          updateOpCodes.push(
              toMaskBit(icuExpression.mainBinding),  // mask of the main binding
              3,                                     // skip 3 opCodes if not changed
              -1 - icuExpression.mainBinding,
              icuNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch, tIcuIndex,
              mask,  // mask of all the bindings of this ICU expression
              2,     // skip 2 opCodes if not changed
              icuNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate, tIcuIndex);
        } else if (value !== '') {
          // Even indexes are text (including bindings)
          const hasBinding = value.match(BINDING_REGEXP);
          // Create text nodes
          allocExpando(viewData);
          createOpCodes.push(
              // If there is a binding, the value will be set during update
              hasBinding ? '' : value,
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

          if (hasBinding) {
            addAllToArray(
                generateBindingUpdateOpCodes(value, tView.blueprint.length - 1 - HEADER_OFFSET),
                updateOpCodes);
          }
        }
      }
    }
  }

  // NOTE: local var needed to properly assert the type of `TI18n`.
  const tI18n: TI18n = {
    vars: tView.blueprint.length - HEADER_OFFSET - expandoStartIndex,
    expandoStartIndex,
    create: createOpCodes,
    update: updateOpCodes,
    icus: icuExpressions.length ? icuExpressions : null,
  };
  tView.data[index + HEADER_OFFSET] = tI18n;
}

function appendI18nNode(tNode: TNode, parentTNode: TNode, previousTNode: TNode | null): TNode {
  ngDevMode && ngDevMode.rendererMoveNode++;
  const viewData = _getViewData();
  if (!previousTNode) {
    previousTNode = parentTNode;
  }
  // re-organize node tree to put this node in the correct position.
  if (previousTNode === parentTNode && tNode !== parentTNode.child) {
    tNode.next = parentTNode.child;
    parentTNode.child = tNode;
  } else if (previousTNode !== parentTNode && tNode !== previousTNode.next) {
    tNode.next = previousTNode.next;
    previousTNode.next = tNode;
  } else {
    tNode.next = null;
  }

  if (parentTNode !== viewData[HOST_NODE]) {
    tNode.parent = parentTNode as TElementNode;
  }

  appendChild(getNativeByTNode(tNode, viewData), tNode, viewData);

  const slotValue = viewData[tNode.index];
  if (tNode.type !== TNodeType.Container && isLContainer(slotValue)) {
    // Nodes that inject ViewContainerRef also have a comment node that should be moved
    appendChild(slotValue[NATIVE], tNode, viewData);
  }

  return tNode;
}

/**
 * Translates a translation block marked by `i18nStart` and `i18nEnd`. It inserts the text/ICU nodes
 * into the render tree, moves the placeholder nodes and removes the deleted nodes.
 */
export function i18nEnd(): void {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  ngDevMode &&
      assertEqual(
          tView.firstTemplatePass, true, `You should only call i18nEnd on first template pass`);
  if (tView.firstTemplatePass) {
    i18nEndFirstPass(tView);
  }
}

/**
 * See `i18nEnd` above.
 */
function i18nEndFirstPass(tView: TView) {
  const viewData = _getViewData();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], viewData[TVIEW].bindingStartIndex,
                   'i18nEnd should be called before any binding');

  const rootIndex = i18nIndexStack[i18nIndexStackPointer--];
  const tI18n = tView.data[rootIndex + HEADER_OFFSET] as TI18n;
  ngDevMode && assertDefined(tI18n, `You should call i18nStart before i18nEnd`);

  // The last placeholder that was added before `i18nEnd`
  const previousOrParentTNode = getPreviousOrParentTNode();
  const visitedPlaceholders =
      readCreateOpCodes(rootIndex, tI18n.create, tI18n.expandoStartIndex, viewData);

  // Remove deleted placeholders
  // The last placeholder that was added before `i18nEnd` is `previousOrParentTNode`
  for (let i = rootIndex + 1; i <= previousOrParentTNode.index - HEADER_OFFSET; i++) {
    if (visitedPlaceholders.indexOf(i) === -1) {
      removeNode(i, viewData);
    }
  }
}

function readCreateOpCodes(
    index: number, createOpCodes: I18nMutateOpCodes, expandoStartIndex: number,
    viewData: LViewData): number[] {
  const renderer = getRenderer();
  let currentTNode: TNode|null = null;
  let previousTNode: TNode|null = null;
  const visitedPlaceholders: number[] = [];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i];
    if (typeof opCode == 'string') {
      const textRNode = createTextNode(opCode, renderer);
      ngDevMode && ngDevMode.rendererCreateTextNode++;
      previousTNode = currentTNode;
      currentTNode =
          createNodeAtIndex(expandoStartIndex++, TNodeType.Element, textRNode, null, null);
      setIsParent(false);
    } else if (typeof opCode == 'number') {
      switch (opCode & I18nMutateOpCode.MASK_OPCODE) {
        case I18nMutateOpCode.AppendChild:
          const destinationNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_PARENT;
          let destinationTNode: TNode;
          if (destinationNodeIndex === index) {
            // If the destination node is `i18nStart`, we don't have a
            // top-level node and we should use the host node instead
            destinationTNode = viewData[HOST_NODE] !;
          } else {
            destinationTNode = getTNode(destinationNodeIndex, viewData);
          }
          ngDevMode &&
              assertDefined(
                  currentTNode !,
                  `You need to create or select a node before you can insert it into the DOM`);
          previousTNode = appendI18nNode(currentTNode !, destinationTNode, previousTNode);
          destinationTNode.next = null;
          break;
        case I18nMutateOpCode.Select:
          const nodeIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          visitedPlaceholders.push(nodeIndex);
          previousTNode = currentTNode;
          currentTNode = getTNode(nodeIndex, viewData);
          if (currentTNode) {
            setPreviousOrParentTNode(currentTNode);
            if (currentTNode.type === TNodeType.Element) {
              setIsParent(true);
            }
          }
          break;
        case I18nMutateOpCode.ElementEnd:
          const elementIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          previousTNode = currentTNode = getTNode(elementIndex, viewData);
          setPreviousOrParentTNode(currentTNode);
          setIsParent(false);
          break;
        case I18nMutateOpCode.Attr:
          const elementNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          const attrName = createOpCodes[++i] as string;
          const attrValue = createOpCodes[++i] as string;
          elementAttribute(elementNodeIndex, attrName, attrValue);
          break;
        default:
          throw new Error(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    } else {
      switch (opCode) {
        case COMMENT_MARKER:
          const commentValue = createOpCodes[++i] as string;
          ngDevMode && assertEqual(
                           typeof commentValue, 'string',
                           `Expected "${commentValue}" to be a comment node value`);
          const commentRNode = renderer.createComment(commentValue);
          ngDevMode && ngDevMode.rendererCreateComment++;
          previousTNode = currentTNode;
          currentTNode = createNodeAtIndex(
              expandoStartIndex++, TNodeType.IcuContainer, commentRNode, null, null);
          (currentTNode as TIcuContainerNode).activeCaseIndex = null;
          // We will add the case nodes later, during the update phase
          setIsParent(false);
          break;
        case ELEMENT_MARKER:
          const tagNameValue = createOpCodes[++i] as string;
          ngDevMode && assertEqual(
                           typeof tagNameValue, 'string',
                           `Expected "${tagNameValue}" to be an element node tag name`);
          const elementRNode = renderer.createElement(tagNameValue);
          ngDevMode && ngDevMode.rendererCreateElement++;
          previousTNode = currentTNode;
          currentTNode = createNodeAtIndex(
              expandoStartIndex++, TNodeType.Element, elementRNode, tagNameValue, null);
          break;
        default:
          throw new Error(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    }
  }

  setIsParent(false);

  return visitedPlaceholders;
}

function readUpdateOpCodes(
    updateOpCodes: I18nUpdateOpCodes, icus: TIcu[] | null, bindingsStartIndex: number,
    changeMask: number, viewData: LViewData, bypassCheckBit = false) {
  let caseCreated = false;
  for (let i = 0; i < updateOpCodes.length; i++) {
    // bit code to check if we should apply the next update
    const checkBit = updateOpCodes[i] as number;
    // Number of opCodes to skip until next set of update codes
    const skipCodes = updateOpCodes[++i] as number;
    if (bypassCheckBit || (checkBit & changeMask)) {
      // The value has been updated since last checked
      let value = '';
      for (let j = i + 1; j <= (i + skipCodes); j++) {
        const opCode = updateOpCodes[j];
        if (typeof opCode == 'string') {
          value += opCode;
        } else if (typeof opCode == 'number') {
          if (opCode < 0) {
            // It's a binding index whose value is negative
            value += stringify(viewData[bindingsStartIndex - opCode]);
          } else {
            const nodeIndex = opCode >>> I18nUpdateOpCode.SHIFT_REF;
            switch (opCode & I18nUpdateOpCode.MASK_OPCODE) {
              case I18nUpdateOpCode.Attr:
                const attrName = updateOpCodes[++j] as string;
                const sanitizeFn = updateOpCodes[++j] as SanitizerFn | null;
                elementAttribute(nodeIndex, attrName, value, sanitizeFn);
                break;
              case I18nUpdateOpCode.Text:
                textBinding(nodeIndex, value);
                break;
              case I18nUpdateOpCode.IcuSwitch:
                let tIcuIndex = updateOpCodes[++j] as number;
                let tIcu = icus ![tIcuIndex];
                let icuTNode = getTNode(nodeIndex, viewData) as TIcuContainerNode;
                // If there is an active case, delete the old nodes
                if (icuTNode.activeCaseIndex !== null) {
                  const removeCodes = tIcu.remove[icuTNode.activeCaseIndex];
                  for (let k = 0; k < removeCodes.length; k++) {
                    const removeOpCode = removeCodes[k] as number;
                    switch (removeOpCode & I18nMutateOpCode.MASK_OPCODE) {
                      case I18nMutateOpCode.Remove:
                        const nodeIndex = removeOpCode >>> I18nMutateOpCode.SHIFT_REF;
                        removeNode(nodeIndex, viewData);
                        break;
                      case I18nMutateOpCode.RemoveNestedIcu:
                        const nestedIcuNodeIndex =
                            removeCodes[k + 1] as number >>> I18nMutateOpCode.SHIFT_REF;
                        const nestedIcuTNode =
                            getTNode(nestedIcuNodeIndex, viewData) as TIcuContainerNode;
                        const activeIndex = nestedIcuTNode.activeCaseIndex;
                        if (activeIndex !== null) {
                          const nestedIcuTIndex = removeOpCode >>> I18nMutateOpCode.SHIFT_REF;
                          const nestedTIcu = icus ![nestedIcuTIndex];
                          addAllToArray(nestedTIcu.remove[activeIndex], removeCodes);
                        }
                        break;
                    }
                  }
                }

                // Update the active caseIndex
                const caseIndex = getCaseIndex(tIcu, value);
                icuTNode.activeCaseIndex = caseIndex !== -1 ? caseIndex : null;

                // Add the nodes for the new case
                readCreateOpCodes(-1, tIcu.create[caseIndex], tIcu.expandoStartIndex, viewData);
                caseCreated = true;
                break;
              case I18nUpdateOpCode.IcuUpdate:
                tIcuIndex = updateOpCodes[++j] as number;
                tIcu = icus ![tIcuIndex];
                icuTNode = getTNode(nodeIndex, viewData) as TIcuContainerNode;
                readUpdateOpCodes(
                    tIcu.update[icuTNode.activeCaseIndex !], icus, bindingsStartIndex, changeMask,
                    viewData, caseCreated);
                break;
            }
          }
        }
      }
    }
    i += skipCodes;
  }
}

function removeNode(index: number, viewData: LViewData) {
  const removedPhTNode = getTNode(index, viewData);
  const removedPhRNode = getNativeByIndex(index, viewData);
  removeChild(removedPhTNode, removedPhRNode || null, viewData);
  removedPhTNode.detached = true;
  ngDevMode && ngDevMode.rendererRemoveNode++;

  const slotValue = load(index) as RElement | RComment | LContainer | StylingContext;
  if (isLContainer(slotValue)) {
    const lContainer = slotValue as LContainer;
    if (removedPhTNode.type !== TNodeType.Container) {
      removeChild(removedPhTNode, lContainer[NATIVE] || null, viewData);
    }
    lContainer[RENDER_PARENT] = null;
  }
}

/**
 *
 * Use this instruction to create a translation block that doesn't contain any placeholder.
 * It calls both {@link i18nStart} and {@link i18nEnd} in one instruction.
 *
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param message The translation message.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 */
export function i18n(index: number, message: string, subTemplateIndex?: number): void {
  i18nStart(index, message, subTemplateIndex);
  i18nEnd();
}

/**
 * Marks a list of attributes as translatable.
 *
 * @param index A unique index in the static block
 * @param values
 */
export function i18nAttributes(index: number, values: string[]): void {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  ngDevMode &&
      assertEqual(
          tView.firstTemplatePass, true, `You should only call i18nEnd on first template pass`);
  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    i18nAttributesFirstPass(tView, index, values);
  }
}

/**
 * See `i18nAttributes` above.
 */
function i18nAttributesFirstPass(tView: TView, index: number, values: string[]) {
  const previousElement = getPreviousOrParentTNode();
  const previousElementIndex = previousElement.index - HEADER_OFFSET;
  const updateOpCodes: I18nUpdateOpCodes = [];
  for (let i = 0; i < values.length; i += 2) {
    const attrName = values[i];
    const message = values[i + 1];
    const parts = message.split(ICU_REGEXP);
    for (let j = 0; j < parts.length; j++) {
      const value = parts[j];

      if (j & 1) {
        // Odd indexes are ICU expressions
        // TODO(ocombe): support ICU expressions in attributes
      } else if (value !== '') {
        // Even indexes are text (including bindings)
        const hasBinding = !!value.match(BINDING_REGEXP);
        if (hasBinding) {
          addAllToArray(
              generateBindingUpdateOpCodes(value, previousElementIndex, attrName), updateOpCodes);
        } else {
          elementAttribute(previousElementIndex, attrName, value);
        }
      }
    }
  }

  tView.data[index + HEADER_OFFSET] = updateOpCodes;
}

let changeMask = 0b0;
let shiftsCounter = 0;

/**
 * Stores the values of the bindings during each update cycle in order to determine if we need to
 * update the translated nodes.
 *
 * @param expression The binding's new value or NO_CHANGE
 */
export function i18nExp<T>(expression: T | NO_CHANGE): void {
  if (expression !== NO_CHANGE) {
    changeMask = changeMask | (1 << shiftsCounter);
  }
  shiftsCounter++;
}

/**
 * Updates a translation block or an i18n attribute when the bindings have changed.
 *
 * @param index Index of either {@link i18nStart} (translation block) or {@link i18nAttributes}
 * (i18n attribute) on which it should update the content.
 */
export function i18nApply(index: number) {
  if (shiftsCounter) {
    const tView = getTView();
    ngDevMode && assertDefined(tView, `tView should be defined`);
    const viewData = _getViewData();
    const tI18n = tView.data[index + HEADER_OFFSET];
    let updateOpCodes: I18nUpdateOpCodes;
    let icus: TIcu[]|null = null;
    if (Array.isArray(tI18n)) {
      updateOpCodes = tI18n as I18nUpdateOpCodes;
    } else {
      updateOpCodes = (tI18n as TI18n).update;
      icus = (tI18n as TI18n).icus;
    }
    const bindingsStartIndex = viewData[BINDING_INDEX] - shiftsCounter - 1;
    readUpdateOpCodes(updateOpCodes, icus, bindingsStartIndex, changeMask, viewData);

    // Reset changeMask & maskBit to default for the next update cycle
    changeMask = 0b0;
    shiftsCounter = 0;
  }
}

enum Plural {
  Zero = 0,
  One = 1,
  Two = 2,
  Few = 3,
  Many = 4,
  Other = 5,
}

/**
 * Returns the plural case based on the locale.
 * This is a copy of the deprecated function that we used in Angular v4.
 * // TODO(ocombe): remove this once we can the real getPluralCase function
 *
 * @deprecated from v5 the plural case function is in locale data files common/locales/*.ts
 */
function getPluralCase(locale: string, nLike: number | string): Plural {
  if (typeof nLike === 'string') {
    nLike = parseInt(<string>nLike, 10);
  }
  const n: number = nLike as number;
  const nDecimal = n.toString().replace(/^[^.]*\.?/, '');
  const i = Math.floor(Math.abs(n));
  const v = nDecimal.length;
  const f = parseInt(nDecimal, 10);
  const t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;

  const lang = locale.split('-')[0].toLowerCase();

  switch (lang) {
    case 'af':
    case 'asa':
    case 'az':
    case 'bem':
    case 'bez':
    case 'bg':
    case 'brx':
    case 'ce':
    case 'cgg':
    case 'chr':
    case 'ckb':
    case 'ee':
    case 'el':
    case 'eo':
    case 'es':
    case 'eu':
    case 'fo':
    case 'fur':
    case 'gsw':
    case 'ha':
    case 'haw':
    case 'hu':
    case 'jgo':
    case 'jmc':
    case 'ka':
    case 'kk':
    case 'kkj':
    case 'kl':
    case 'ks':
    case 'ksb':
    case 'ky':
    case 'lb':
    case 'lg':
    case 'mas':
    case 'mgo':
    case 'ml':
    case 'mn':
    case 'nb':
    case 'nd':
    case 'ne':
    case 'nn':
    case 'nnh':
    case 'nyn':
    case 'om':
    case 'or':
    case 'os':
    case 'ps':
    case 'rm':
    case 'rof':
    case 'rwk':
    case 'saq':
    case 'seh':
    case 'sn':
    case 'so':
    case 'sq':
    case 'ta':
    case 'te':
    case 'teo':
    case 'tk':
    case 'tr':
    case 'ug':
    case 'uz':
    case 'vo':
    case 'vun':
    case 'wae':
    case 'xog':
      if (n === 1) return Plural.One;
      return Plural.Other;
    case 'ak':
    case 'ln':
    case 'mg':
    case 'pa':
    case 'ti':
      if (n === Math.floor(n) && n >= 0 && n <= 1) return Plural.One;
      return Plural.Other;
    case 'am':
    case 'as':
    case 'bn':
    case 'fa':
    case 'gu':
    case 'hi':
    case 'kn':
    case 'mr':
    case 'zu':
      if (i === 0 || n === 1) return Plural.One;
      return Plural.Other;
    case 'ar':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10) return Plural.Few;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99) return Plural.Many;
      return Plural.Other;
    case 'ast':
    case 'ca':
    case 'de':
    case 'en':
    case 'et':
    case 'fi':
    case 'fy':
    case 'gl':
    case 'it':
    case 'nl':
    case 'sv':
    case 'sw':
    case 'ur':
    case 'yi':
      if (i === 1 && v === 0) return Plural.One;
      return Plural.Other;
    case 'be':
      if (n % 10 === 1 && !(n % 100 === 11)) return Plural.One;
      if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
          !(n % 100 >= 12 && n % 100 <= 14))
        return Plural.Few;
      if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
          n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'br':
      if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91)) return Plural.One;
      if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92)) return Plural.Two;
      if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) &&
          !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 ||
            n % 100 >= 90 && n % 100 <= 99))
        return Plural.Few;
      if (!(n === 0) && n % 1e6 === 0) return Plural.Many;
      return Plural.Other;
    case 'bs':
    case 'hr':
    case 'sr':
      if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
        return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
              !(i % 100 >= 12 && i % 100 <= 14) ||
          f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
              !(f % 100 >= 12 && f % 100 <= 14))
        return Plural.Few;
      return Plural.Other;
    case 'cs':
    case 'sk':
      if (i === 1 && v === 0) return Plural.One;
      if (i === Math.floor(i) && i >= 2 && i <= 4 && v === 0) return Plural.Few;
      if (!(v === 0)) return Plural.Many;
      return Plural.Other;
    case 'cy':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n === 3) return Plural.Few;
      if (n === 6) return Plural.Many;
      return Plural.Other;
    case 'da':
      if (n === 1 || !(t === 0) && (i === 0 || i === 1)) return Plural.One;
      return Plural.Other;
    case 'dsb':
    case 'hsb':
      if (v === 0 && i % 100 === 1 || f % 100 === 1) return Plural.One;
      if (v === 0 && i % 100 === 2 || f % 100 === 2) return Plural.Two;
      if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 ||
          f % 100 === Math.floor(f % 100) && f % 100 >= 3 && f % 100 <= 4)
        return Plural.Few;
      return Plural.Other;
    case 'ff':
    case 'fr':
    case 'hy':
    case 'kab':
      if (i === 0 || i === 1) return Plural.One;
      return Plural.Other;
    case 'fil':
      if (v === 0 && (i === 1 || i === 2 || i === 3) ||
          v === 0 && !(i % 10 === 4 || i % 10 === 6 || i % 10 === 9) ||
          !(v === 0) && !(f % 10 === 4 || f % 10 === 6 || f % 10 === 9))
        return Plural.One;
      return Plural.Other;
    case 'ga':
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      if (n === Math.floor(n) && n >= 3 && n <= 6) return Plural.Few;
      if (n === Math.floor(n) && n >= 7 && n <= 10) return Plural.Many;
      return Plural.Other;
    case 'gd':
      if (n === 1 || n === 11) return Plural.One;
      if (n === 2 || n === 12) return Plural.Two;
      if (n === Math.floor(n) && (n >= 3 && n <= 10 || n >= 13 && n <= 19)) return Plural.Few;
      return Plural.Other;
    case 'gv':
      if (v === 0 && i % 10 === 1) return Plural.One;
      if (v === 0 && i % 10 === 2) return Plural.Two;
      if (v === 0 &&
          (i % 100 === 0 || i % 100 === 20 || i % 100 === 40 || i % 100 === 60 || i % 100 === 80))
        return Plural.Few;
      if (!(v === 0)) return Plural.Many;
      return Plural.Other;
    case 'he':
      if (i === 1 && v === 0) return Plural.One;
      if (i === 2 && v === 0) return Plural.Two;
      if (v === 0 && !(n >= 0 && n <= 10) && n % 10 === 0) return Plural.Many;
      return Plural.Other;
    case 'is':
      if (t === 0 && i % 10 === 1 && !(i % 100 === 11) || !(t === 0)) return Plural.One;
      return Plural.Other;
    case 'ksh':
      if (n === 0) return Plural.Zero;
      if (n === 1) return Plural.One;
      return Plural.Other;
    case 'kw':
    case 'naq':
    case 'se':
    case 'smn':
      if (n === 1) return Plural.One;
      if (n === 2) return Plural.Two;
      return Plural.Other;
    case 'lag':
      if (n === 0) return Plural.Zero;
      if ((i === 0 || i === 1) && !(n === 0)) return Plural.One;
      return Plural.Other;
    case 'lt':
      if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19)) return Plural.One;
      if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 &&
          !(n % 100 >= 11 && n % 100 <= 19))
        return Plural.Few;
      if (!(f === 0)) return Plural.Many;
      return Plural.Other;
    case 'lv':
    case 'prg':
      if (n % 10 === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19 ||
          v === 2 && f % 100 === Math.floor(f % 100) && f % 100 >= 11 && f % 100 <= 19)
        return Plural.Zero;
      if (n % 10 === 1 && !(n % 100 === 11) || v === 2 && f % 10 === 1 && !(f % 100 === 11) ||
          !(v === 2) && f % 10 === 1)
        return Plural.One;
      return Plural.Other;
    case 'mk':
      if (v === 0 && i % 10 === 1 || f % 10 === 1) return Plural.One;
      return Plural.Other;
    case 'mt':
      if (n === 1) return Plural.One;
      if (n === 0 || n % 100 === Math.floor(n % 100) && n % 100 >= 2 && n % 100 <= 10)
        return Plural.Few;
      if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 19) return Plural.Many;
      return Plural.Other;
    case 'pl':
      if (i === 1 && v === 0) return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14))
        return Plural.Few;
      if (v === 0 && !(i === 1) && i % 10 === Math.floor(i % 10) && i % 10 >= 0 && i % 10 <= 1 ||
          v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
          v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 12 && i % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'pt':
      if (n === Math.floor(n) && n >= 0 && n <= 2 && !(n === 2)) return Plural.One;
      return Plural.Other;
    case 'ro':
      if (i === 1 && v === 0) return Plural.One;
      if (!(v === 0) || n === 0 ||
          !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
        return Plural.Few;
      return Plural.Other;
    case 'ru':
    case 'uk':
      if (v === 0 && i % 10 === 1 && !(i % 100 === 11)) return Plural.One;
      if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
          !(i % 100 >= 12 && i % 100 <= 14))
        return Plural.Few;
      if (v === 0 && i % 10 === 0 ||
          v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 5 && i % 10 <= 9 ||
          v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 11 && i % 100 <= 14)
        return Plural.Many;
      return Plural.Other;
    case 'shi':
      if (i === 0 || n === 1) return Plural.One;
      if (n === Math.floor(n) && n >= 2 && n <= 10) return Plural.Few;
      return Plural.Other;
    case 'si':
      if (n === 0 || n === 1 || i === 0 && f === 1) return Plural.One;
      return Plural.Other;
    case 'sl':
      if (v === 0 && i % 100 === 1) return Plural.One;
      if (v === 0 && i % 100 === 2) return Plural.Two;
      if (v === 0 && i % 100 === Math.floor(i % 100) && i % 100 >= 3 && i % 100 <= 4 || !(v === 0))
        return Plural.Few;
      return Plural.Other;
    case 'tzm':
      if (n === Math.floor(n) && n >= 0 && n <= 1 || n === Math.floor(n) && n >= 11 && n <= 99)
        return Plural.One;
      return Plural.Other;
    // When there is no specification, the default is always "other"
    // Spec: http://cldr.unicode.org/index/cldr-spec/plural-rules
    // > other (required—general plural form — also used if the language only has a single form)
    default:
      return Plural.Other;
  }
}

function getPluralCategory(value: any, locale: string): string {
  const plural = getPluralCase(locale, value);

  switch (plural) {
    case Plural.Zero:
      return 'zero';
    case Plural.One:
      return 'one';
    case Plural.Two:
      return 'two';
    case Plural.Few:
      return 'few';
    case Plural.Many:
      return 'many';
    default:
      return 'other';
  }
}

/**
 * Returns the index of the current case of an ICU expression depending on the main binding value
 *
 * @param icuExpression
 * @param bindingValue The value of the main binding used by this ICU expression
 */
function getCaseIndex(icuExpression: TIcu, bindingValue: string): number {
  let index = icuExpression.cases.indexOf(bindingValue);
  if (index === -1) {
    switch (icuExpression.type) {
      case IcuType.plural: {
        // TODO(ocombe): replace this hard-coded value by the real LOCALE_ID value
        const locale = 'en-US';
        const resolvedCase = getPluralCategory(bindingValue, locale);
        index = icuExpression.cases.indexOf(resolvedCase);
        if (index === -1 && resolvedCase !== 'other') {
          index = icuExpression.cases.indexOf('other');
        }
        break;
      }
      case IcuType.select: {
        index = icuExpression.cases.indexOf('other');
        break;
      }
    }
  }
  return index;
}

/**
 * Generate the OpCodes for ICU expressions.
 *
 * @param tIcus
 * @param icuExpression
 * @param startIndex
 * @param expandoStartIndex
 */
function icuStart(
    tIcus: TIcu[], icuExpression: IcuExpression, startIndex: number,
    expandoStartIndex: number): void {
  const createCodes = [];
  const removeCodes = [];
  const updateCodes = [];
  const vars = [];
  const childIcus: number[][] = [];
  for (let i = 0; i < icuExpression.values.length; i++) {
    // Each value is an array of strings & other ICU expressions
    const valueArr = icuExpression.values[i];
    const nestedIcus: IcuExpression[] = [];
    for (let j = 0; j < valueArr.length; j++) {
      const value = valueArr[j];
      if (typeof value !== 'string') {
        // It is an nested ICU expression
        const icuIndex = nestedIcus.push(value as IcuExpression) - 1;
        // Replace nested ICU expression by a comment node
        valueArr[j] = `<!--�${icuIndex}�-->`;
      }
    }
    const icuCase: IcuCase =
        parseIcuCase(valueArr.join(''), startIndex, nestedIcus, tIcus, expandoStartIndex);
    createCodes.push(icuCase.create);
    removeCodes.push(icuCase.remove);
    updateCodes.push(icuCase.update);
    vars.push(icuCase.vars);
    childIcus.push(icuCase.childIcus);
  }
  const tIcu: TIcu = {
    type: icuExpression.type,
    vars,
    expandoStartIndex: expandoStartIndex + 1, childIcus,
    cases: icuExpression.cases,
    create: createCodes,
    remove: removeCodes,
    update: updateCodes
  };
  tIcus.push(tIcu);
  const lViewData = _getViewData();
  const worstCaseSize = Math.max(...vars);
  for (let i = 0; i < worstCaseSize; i++) {
    allocExpando(lViewData);
  }
}

/**
 * Transforms a string template into an HTML template and a list of instructions used to update
 * attributes or nodes that contain bindings.
 *
 * @param unsafeHtml The string to parse
 * @param parentIndex
 * @param nestedIcus
 * @param tIcus
 * @param expandoStartIndex
 */
function parseIcuCase(
    unsafeHtml: string, parentIndex: number, nestedIcus: IcuExpression[], tIcus: TIcu[],
    expandoStartIndex: number): IcuCase {
  const inertBodyHelper = new InertBodyHelper(document);
  const inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
  if (!inertBodyElement) {
    throw new Error('Unable to generate inert body element');
  }
  const wrapper = getTemplateContent(inertBodyElement !) as Element || inertBodyElement;
  const opCodes: IcuCase = {vars: 0, childIcus: [], create: [], remove: [], update: []};
  parseNodes(wrapper.firstChild, opCodes, parentIndex, nestedIcus, tIcus, expandoStartIndex);
  return opCodes;
}

const NESTED_ICU = /�(\d+)�/;

/**
 * Parses a node, its children and its siblings, and generates the mutate & update OpCodes.
 *
 * @param currentNode The first node to parse
 * @param icuCase The data for the ICU expression case that contains those nodes
 * @param parentIndex Index of the current node's parent
 * @param nestedIcus Data for the nested ICU expressions that this case contains
 * @param tIcus Data for all ICU expressions of the current message
 * @param expandoStartIndex Expando start index for the current ICU expression
 */
function parseNodes(
    currentNode: Node | null, icuCase: IcuCase, parentIndex: number, nestedIcus: IcuExpression[],
    tIcus: TIcu[], expandoStartIndex: number) {
  if (currentNode) {
    const nestedIcusToCreate: [IcuExpression, number][] = [];
    while (currentNode) {
      const nextNode: Node|null = currentNode.nextSibling;
      const newIndex = expandoStartIndex + ++icuCase.vars;
      switch (currentNode.nodeType) {
        case Node.ELEMENT_NODE:
          const element = currentNode as Element;
          const tagName = element.tagName.toLowerCase();
          if (!VALID_ELEMENTS.hasOwnProperty(tagName)) {
            // This isn't a valid element, we won't create an element for it
            icuCase.vars--;
          } else {
            icuCase.create.push(
                ELEMENT_MARKER, tagName,
                parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);
            const elAttrs = element.attributes;
            for (let i = 0; i < elAttrs.length; i++) {
              const attr = elAttrs.item(i) !;
              const lowerAttrName = attr.name.toLowerCase();
              const hasBinding = !!attr.value.match(BINDING_REGEXP);
              // we assume the input string is safe, unless it's using a binding
              if (hasBinding) {
                if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                  if (URI_ATTRS[lowerAttrName]) {
                    addAllToArray(
                        generateBindingUpdateOpCodes(attr.value, newIndex, attr.name, _sanitizeUrl),
                        icuCase.update);
                  } else if (SRCSET_ATTRS[lowerAttrName]) {
                    addAllToArray(
                        generateBindingUpdateOpCodes(
                            attr.value, newIndex, attr.name, sanitizeSrcset),
                        icuCase.update);
                  } else {
                    addAllToArray(
                        generateBindingUpdateOpCodes(attr.value, newIndex, attr.name),
                        icuCase.update);
                  }
                } else {
                  ngDevMode &&
                      console.warn(
                          `WARNING: ignoring unsafe attribute value ${lowerAttrName} on element ${tagName} (see http://g.co/ng/security#xss)`);
                }
              } else {
                icuCase.create.push(
                    newIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Attr, attr.name,
                    attr.value);
              }
            }
            // Parse the children of this node (if any)
            parseNodes(
                currentNode.firstChild, icuCase, newIndex, nestedIcus, tIcus, expandoStartIndex);
            // Remove the parent node after the children
            icuCase.remove.push(newIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove);
          }
          break;
        case Node.TEXT_NODE:
          const value = currentNode.textContent || '';
          const hasBinding = value.match(BINDING_REGEXP);
          icuCase.create.push(
              hasBinding ? '' : value,
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);
          icuCase.remove.push(newIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove);
          if (hasBinding) {
            addAllToArray(generateBindingUpdateOpCodes(value, newIndex), icuCase.update);
          }
          break;
        case Node.COMMENT_NODE:
          // Check if the comment node is a placeholder for a nested ICU
          const match = NESTED_ICU.exec(currentNode.textContent || '');
          if (match) {
            const nestedIcuIndex = parseInt(match[1], 10);
            const newLocal = ngDevMode ? `nested ICU ${nestedIcuIndex}` : '';
            // Create the comment node that will anchor the ICU expression
            icuCase.create.push(
                COMMENT_MARKER, newLocal,
                parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);
            const nestedIcu = nestedIcus[nestedIcuIndex];
            nestedIcusToCreate.push([nestedIcu, newIndex]);
          } else {
            // We do not handle any other type of comment
            icuCase.vars--;
          }
          break;
        default:
          // We do not handle any other type of element
          icuCase.vars--;
      }
      currentNode = nextNode !;
    }

    for (let i = 0; i < nestedIcusToCreate.length; i++) {
      const nestedIcu = nestedIcusToCreate[i][0];
      const nestedIcuNodeIndex = nestedIcusToCreate[i][1];
      icuStart(tIcus, nestedIcu, nestedIcuNodeIndex, expandoStartIndex + icuCase.vars);
      // Since this is recursive, the last TIcu that was pushed is the one we want
      const nestTIcuIndex = tIcus.length - 1;
      icuCase.vars += Math.max(...tIcus[nestTIcuIndex].vars);
      icuCase.childIcus.push(nestTIcuIndex);
      const mask = getBindingMask(nestedIcu);
      icuCase.update.push(
          toMaskBit(nestedIcu.mainBinding),  // mask of the main binding
          3,                                 // skip 3 opCodes if not changed
          -1 - nestedIcu.mainBinding,
          nestedIcuNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch,
          nestTIcuIndex,
          mask,  // mask of all the bindings of this ICU expression
          2,     // skip 2 opCodes if not changed
          nestedIcuNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate,
          nestTIcuIndex);
      icuCase.remove.push(
          nestTIcuIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.RemoveNestedIcu,
          nestedIcuNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove);
    }
  }
}

const RAW_ICU_REGEXP = /{\s*(\S*)\s*,\s*\S{6}\s*,[\s\S]*}/gi;

/**
 * Replaces the variable parameter (main binding) of an ICU by a given value.
 *
 * Example:
 * ```
 * const MSG_APP_1_RAW = "{VAR_SELECT, select, male {male} female {female} other {other}}";
 * const MSG_APP_1 = i18nIcuReplaceVars(MSG_APP_1_RAW, { VAR_SELECT: "�0�" });
 * // --> MSG_APP_1 = "{�0�, select, male {male} female {female} other {other}}"
 * ```
 */
export function i18nIcuReplaceVars(message: string, replacements: {[key: string]: string}): string {
  const keys = Object.keys(replacements);
  function replaceFn(replacement: string) {
    return (str: string, varMatch: string) => { return str.replace(varMatch, replacement); };
  }
  for (let i = 0; i < keys.length; i++) {
    message = message.replace(RAW_ICU_REGEXP, replaceFn(replacements[keys[i]]));
  }
  return message;
}
