/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../util/ng_i18n_closure_mode';
import {DEFAULT_LOCALE_ID, getPluralCase} from '../i18n/localization';
import {SRCSET_ATTRS, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS, getTemplateContent} from '../sanitization/html_sanitizer';
import {InertBodyHelper} from '../sanitization/inert_body';
import {_sanitizeUrl, sanitizeSrcset} from '../sanitization/url_sanitizer';
import {addAllToArray} from '../util/array_utils';
import {assertDataInRange, assertDefined, assertEqual, assertGreaterThan} from '../util/assert';
import {attachPatchData} from './context_discovery';
import {bind, setDelayProjection, ɵɵload} from './instructions/all';
import {attachI18nOpCodesDebug} from './instructions/lview_debug';
import {TsickleIssue1009, allocExpando, elementAttributeInternal, elementPropertyInternal, getOrCreateTNode, setInputsForProperty, textBindingInternal} from './instructions/shared';
import {LContainer, NATIVE} from './interfaces/container';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nMutateOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, IcuType, TI18n, TIcu} from './interfaces/i18n';
import {TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeType, TProjectionNode} from './interfaces/node';
import {RComment, RElement, RText} from './interfaces/renderer';
import {SanitizerFn} from './interfaces/sanitization';
import {isLContainer} from './interfaces/type_checks';
import {BINDING_INDEX, HEADER_OFFSET, LView, RENDERER, TVIEW, TView, T_HOST} from './interfaces/view';
import {appendChild, appendProjectedNodes, createTextNode, nativeRemoveNode} from './node_manipulation';
import {getIsParent, getLView, getPreviousOrParentTNode, setIsNotParent, setPreviousOrParentTNode} from './state';
import {NO_CHANGE} from './tokens';
import {renderStringify} from './util/misc_utils';
import {findComponentView} from './util/view_traversal_utils';
import {getNativeByIndex, getNativeByTNode, getTNode} from './util/view_utils';


const MARKER = `�`;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*!]\d+):?\d*�/gi;
const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const enum TagType {
  ELEMENT = '#',
  TEMPLATE = '*',
  PROJECTION = '!',
}

// i18nPostprocess consts
const ROOT_TEMPLATE_ID = 0;
const PP_MULTI_VALUE_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]/;
const PP_PLACEHOLDERS_REGEXP = /\[(�.+?�?)\]|(�\/?\*\d+:\d+�)/g;
const PP_ICU_VARS_REGEXP = /({\s*)(VAR_(PLURAL|SELECT)(_\d+)?)(\s*,)/g;
const PP_ICU_PLACEHOLDERS_REGEXP = /{([A-Z0-9_]+)}/g;
const PP_ICUS_REGEXP = /�I18N_EXP_(ICU(_\d+)?)�/g;
const PP_CLOSE_TEMPLATE_REGEXP = /\/\*/;
const PP_TEMPLATE_ID_REGEXP = /\d+\:(\d+)/;

// Parsed placeholder structure used in postprocessing (within `i18nPostprocess` function)
// Contains the following fields: [templateId, isCloseTemplateTag, placeholder]
type PostprocessPlaceholder = [number, boolean, string];

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
        if (ICU_BLOCK_REGEXP.test(block)) {
          results.push(parseICUBlock(block));
        } else {
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
  results.push(substring);
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
  pattern = pattern.replace(ICU_BLOCK_REGEXP, function(str: string, binding: string, type: string) {
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
    if (cases.length > values.length) {
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
 * - `�!{index}(:{block})�`/`�/!{index}(:{block})�`: *Projection Placeholder*:  Marks the
 *   beginning and end of <ng-content> that was embedded in the original translation block.
 *   The placeholder `index` points to the element index in the template instructions set.
 *   An optional `block` that matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param message The translation message.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 *
 * @codeGenApi
 */
export function ɵɵi18nStart(index: number, message: string, subTemplateIndex?: number): void {
  const tView = getLView()[TVIEW];
  ngDevMode && assertDefined(tView, `tView should be defined`);
  i18nIndexStack[++i18nIndexStackPointer] = index;
  // We need to delay projections until `i18nEnd`
  setDelayProjection(true);
  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    i18nStartFirstPass(tView, index, message, subTemplateIndex);
  }
}

// Count for the number of vars that will be allocated for each i18n block.
// It is global because this is used in multiple functions that include loops and recursive calls.
// This is reset to 0 when `i18nStartFirstPass` is called.
let i18nVarsCount: number;

/**
 * See `i18nStart` above.
 */
function i18nStartFirstPass(
    tView: TView, index: number, message: string, subTemplateIndex?: number) {
  const viewData = getLView();
  const startIndex = tView.blueprint.length - HEADER_OFFSET;
  i18nVarsCount = 0;
  const previousOrParentTNode = getPreviousOrParentTNode();
  const parentTNode = getIsParent() ? getPreviousOrParentTNode() :
                                      previousOrParentTNode && previousOrParentTNode.parent;
  let parentIndex =
      parentTNode && parentTNode !== viewData[T_HOST] ? parentTNode.index - HEADER_OFFSET : index;
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
  const msgParts = replaceNgsp(templateTranslation).split(PH_REGEXP);
  for (let i = 0; i < msgParts.length; i++) {
    let value = msgParts[i];
    if (i & 1) {
      // Odd indexes are placeholders (elements and sub-templates)
      if (value.charAt(0) === '/') {
        // It is a closing tag
        if (value.charAt(1) === TagType.ELEMENT) {
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

        if (value.charAt(0) === TagType.ELEMENT) {
          parentIndexStack[++parentIndexPointer] = parentIndex = phIndex;
        }
      }
    } else {
      // Even indexes are text (including bindings & ICU expressions)
      const parts = extractParts(value);
      for (let j = 0; j < parts.length; j++) {
        if (j & 1) {
          // Odd indexes are ICU expressions
          // Create the comment node that will anchor the ICU expression
          const icuNodeIndex = startIndex + i18nVarsCount++;
          createOpCodes.push(
              COMMENT_MARKER, ngDevMode ? `ICU ${icuNodeIndex}` : '', icuNodeIndex,
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

          // Update codes for the ICU expression
          const icuExpression = parts[j] as IcuExpression;
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
        } else if (parts[j] !== '') {
          const text = parts[j] as string;
          // Even indexes are text (including bindings)
          const hasBinding = text.match(BINDING_REGEXP);
          // Create text nodes
          const textNodeIndex = startIndex + i18nVarsCount++;
          createOpCodes.push(
              // If there is a binding, the value will be set during update
              hasBinding ? '' : text, textNodeIndex,
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

          if (hasBinding) {
            addAllToArray(generateBindingUpdateOpCodes(text, textNodeIndex), updateOpCodes);
          }
        }
      }
    }
  }

  if (i18nVarsCount > 0) {
    allocExpando(viewData, i18nVarsCount);
  }

  ngDevMode &&
      attachI18nOpCodesDebug(
          createOpCodes, updateOpCodes, icuExpressions.length ? icuExpressions : null, viewData);

  // NOTE: local var needed to properly assert the type of `TI18n`.
  const tI18n: TI18n = {
    vars: i18nVarsCount,
    create: createOpCodes,
    update: updateOpCodes,
    icus: icuExpressions.length ? icuExpressions : null,
  };

  tView.data[index + HEADER_OFFSET] = tI18n;
}

function appendI18nNode(
    tNode: TNode, parentTNode: TNode, previousTNode: TNode | null, viewData: LView): TNode {
  ngDevMode && ngDevMode.rendererMoveNode++;
  const nextNode = tNode.next;
  if (!previousTNode) {
    previousTNode = parentTNode;
  }

  // Re-organize node tree to put this node in the correct position.
  if (previousTNode === parentTNode && tNode !== parentTNode.child) {
    tNode.next = parentTNode.child;
    parentTNode.child = tNode;
  } else if (previousTNode !== parentTNode && tNode !== previousTNode.next) {
    tNode.next = previousTNode.next;
    previousTNode.next = tNode;
  } else {
    tNode.next = null;
  }

  if (parentTNode !== viewData[T_HOST]) {
    tNode.parent = parentTNode as TElementNode;
  }

  // If tNode was moved around, we might need to fix a broken link.
  let cursor: TNode|null = tNode.next;
  while (cursor) {
    if (cursor.next === tNode) {
      cursor.next = nextNode;
    }
    cursor = cursor.next;
  }

  // If the placeholder to append is a projection, we need to move the projected nodes instead
  if (tNode.type === TNodeType.Projection) {
    const tProjectionNode = tNode as TProjectionNode;
    appendProjectedNodes(
        viewData, tProjectionNode, tProjectionNode.projection, findComponentView(viewData));
    return tNode;
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
 * Handles message string post-processing for internationalization.
 *
 * Handles message string post-processing by transforming it from intermediate
 * format (that might contain some markers that we need to replace) to the final
 * form, consumable by i18nStart instruction. Post processing steps include:
 *
 * 1. Resolve all multi-value cases (like [�*1:1��#2:1�|�#4:1�|�5�])
 * 2. Replace all ICU vars (like "VAR_PLURAL")
 * 3. Replace all placeholders used inside ICUs in a form of {PLACEHOLDER}
 * 4. Replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�)
 *    in case multiple ICUs have the same placeholder name
 *
 * @param message Raw translation string for post processing
 * @param replacements Set of replacements that should be applied
 *
 * @returns Transformed string that can be consumed by i18nStart instruction
 *
 * @codeGenApi
 */
export function ɵɵi18nPostprocess(
    message: string, replacements: {[key: string]: (string | string[])} = {}): string {
  /**
   * Step 1: resolve all multi-value placeholders like [�#5�|�*1:1��#2:1�|�#4:1�]
   *
   * Note: due to the way we process nested templates (BFS), multi-value placeholders are typically
   * grouped by templates, for example: [�#5�|�#6�|�#1:1�|�#3:2�] where �#5� and �#6� belong to root
   * template, �#1:1� belong to nested template with index 1 and �#1:2� - nested template with index
   * 3. However in real templates the order might be different: i.e. �#1:1� and/or �#3:2� may go in
   * front of �#6�. The post processing step restores the right order by keeping track of the
   * template id stack and looks for placeholders that belong to the currently active template.
   */
  let result: string = message;
  if (PP_MULTI_VALUE_PLACEHOLDERS_REGEXP.test(message)) {
    const matches: {[key: string]: PostprocessPlaceholder[]} = {};
    const templateIdsStack: number[] = [ROOT_TEMPLATE_ID];
    result = result.replace(PP_PLACEHOLDERS_REGEXP, (m: any, phs: string, tmpl: string): string => {
      const content = phs || tmpl;
      const placeholders: PostprocessPlaceholder[] = matches[content] || [];
      if (!placeholders.length) {
        content.split('|').forEach((placeholder: string) => {
          const match = placeholder.match(PP_TEMPLATE_ID_REGEXP);
          const templateId = match ? parseInt(match[1], 10) : ROOT_TEMPLATE_ID;
          const isCloseTemplateTag = PP_CLOSE_TEMPLATE_REGEXP.test(placeholder);
          placeholders.push([templateId, isCloseTemplateTag, placeholder]);
        });
        matches[content] = placeholders;
      }

      if (!placeholders.length) {
        throw new Error(`i18n postprocess: unmatched placeholder - ${content}`);
      }

      const currentTemplateId = templateIdsStack[templateIdsStack.length - 1];
      let idx = 0;
      // find placeholder index that matches current template id
      for (let i = 0; i < placeholders.length; i++) {
        if (placeholders[i][0] === currentTemplateId) {
          idx = i;
          break;
        }
      }
      // update template id stack based on the current tag extracted
      const [templateId, isCloseTemplateTag, placeholder] = placeholders[idx];
      if (isCloseTemplateTag) {
        templateIdsStack.pop();
      } else if (currentTemplateId !== templateId) {
        templateIdsStack.push(templateId);
      }
      // remove processed tag from the list
      placeholders.splice(idx, 1);
      return placeholder;
    });
  }

  // return current result if no replacements specified
  if (!Object.keys(replacements).length) {
    return result;
  }

  /**
   * Step 2: replace all ICU vars (like "VAR_PLURAL")
   */
  result = result.replace(PP_ICU_VARS_REGEXP, (match, start, key, _type, _idx, end): string => {
    return replacements.hasOwnProperty(key) ? `${start}${replacements[key]}${end}` : match;
  });

  /**
   * Step 3: replace all placeholders used inside ICUs in a form of {PLACEHOLDER}
   */
  result = result.replace(PP_ICU_PLACEHOLDERS_REGEXP, (match, key): string => {
    return replacements.hasOwnProperty(key) ? replacements[key] as string : match;
  });

  /**
   * Step 4: replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�) in case
   * multiple ICUs have the same placeholder name
   */
  result = result.replace(PP_ICUS_REGEXP, (match, key): string => {
    if (replacements.hasOwnProperty(key)) {
      const list = replacements[key] as string[];
      if (!list.length) {
        throw new Error(`i18n postprocess: unmatched ICU - ${match} with key: ${key}`);
      }
      return list.shift() !;
    }
    return match;
  });

  return result;
}

/**
 * Translates a translation block marked by `i18nStart` and `i18nEnd`. It inserts the text/ICU nodes
 * into the render tree, moves the placeholder nodes and removes the deleted nodes.
 *
 * @codeGenApi
 */
export function ɵɵi18nEnd(): void {
  const tView = getLView()[TVIEW];
  ngDevMode && assertDefined(tView, `tView should be defined`);
  i18nEndFirstPass(tView);
  // Stop delaying projections
  setDelayProjection(false);
}

/**
 * See `i18nEnd` above.
 */
function i18nEndFirstPass(tView: TView) {
  const viewData = getLView();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], viewData[TVIEW].bindingStartIndex,
                   'i18nEnd should be called before any binding');

  const rootIndex = i18nIndexStack[i18nIndexStackPointer--];
  const tI18n = tView.data[rootIndex + HEADER_OFFSET] as TI18n;
  ngDevMode && assertDefined(tI18n, `You should call i18nStart before i18nEnd`);

  // Find the last node that was added before `i18nEnd`
  let lastCreatedNode = getPreviousOrParentTNode();

  // Read the instructions to insert/move/remove DOM elements
  const visitedNodes = readCreateOpCodes(rootIndex, tI18n.create, tI18n.icus, viewData);

  // Remove deleted nodes
  for (let i = rootIndex + 1; i <= lastCreatedNode.index - HEADER_OFFSET; i++) {
    if (visitedNodes.indexOf(i) === -1) {
      removeNode(i, viewData);
    }
  }
}

/**
 * Creates and stores the dynamic TNode, and unhooks it from the tree for now.
 */
function createDynamicNodeAtIndex(
    lView: LView, index: number, type: TNodeType, native: RElement | RText | null,
    name: string | null): TElementNode|TIcuContainerNode {
  const previousOrParentTNode = getPreviousOrParentTNode();
  ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
  lView[index + HEADER_OFFSET] = native;
  const tNode = getOrCreateTNode(lView[TVIEW], lView[T_HOST], index, type as any, name, null);

  // We are creating a dynamic node, the previous tNode might not be pointing at this node.
  // We will link ourselves into the tree later with `appendI18nNode`.
  if (previousOrParentTNode.next === tNode) {
    previousOrParentTNode.next = null;
  }

  return tNode;
}

function readCreateOpCodes(
    index: number, createOpCodes: I18nMutateOpCodes, icus: TIcu[] | null,
    viewData: LView): number[] {
  const renderer = getLView()[RENDERER];
  let currentTNode: TNode|null = null;
  let previousTNode: TNode|null = null;
  const visitedNodes: number[] = [];
  for (let i = 0; i < createOpCodes.length; i++) {
    const opCode = createOpCodes[i];
    if (typeof opCode == 'string') {
      const textRNode = createTextNode(opCode, renderer);
      const textNodeIndex = createOpCodes[++i] as number;
      ngDevMode && ngDevMode.rendererCreateTextNode++;
      previousTNode = currentTNode;
      currentTNode =
          createDynamicNodeAtIndex(viewData, textNodeIndex, TNodeType.Element, textRNode, null);
      visitedNodes.push(textNodeIndex);
      setIsNotParent();
    } else if (typeof opCode == 'number') {
      switch (opCode & I18nMutateOpCode.MASK_OPCODE) {
        case I18nMutateOpCode.AppendChild:
          const destinationNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_PARENT;
          let destinationTNode: TNode;
          if (destinationNodeIndex === index) {
            // If the destination node is `i18nStart`, we don't have a
            // top-level node and we should use the host node instead
            destinationTNode = viewData[T_HOST] !;
          } else {
            destinationTNode = getTNode(destinationNodeIndex, viewData);
          }
          ngDevMode &&
              assertDefined(
                  currentTNode !,
                  `You need to create or select a node before you can insert it into the DOM`);
          previousTNode = appendI18nNode(currentTNode !, destinationTNode, previousTNode, viewData);
          break;
        case I18nMutateOpCode.Select:
          const nodeIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          visitedNodes.push(nodeIndex);
          previousTNode = currentTNode;
          currentTNode = getTNode(nodeIndex, viewData);
          if (currentTNode) {
            setPreviousOrParentTNode(currentTNode, currentTNode.type === TNodeType.Element);
          }
          break;
        case I18nMutateOpCode.ElementEnd:
          const elementIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          previousTNode = currentTNode = getTNode(elementIndex, viewData);
          setPreviousOrParentTNode(currentTNode, false);
          break;
        case I18nMutateOpCode.Attr:
          const elementNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          const attrName = createOpCodes[++i] as string;
          const attrValue = createOpCodes[++i] as string;
          // This code is used for ICU expressions only, since we don't support
          // directives/components in ICUs, we don't need to worry about inputs here
          elementAttributeInternal(elementNodeIndex, attrName, attrValue, viewData);
          break;
        default:
          throw new Error(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    } else {
      switch (opCode) {
        case COMMENT_MARKER:
          const commentValue = createOpCodes[++i] as string;
          const commentNodeIndex = createOpCodes[++i] as number;
          ngDevMode && assertEqual(
                           typeof commentValue, 'string',
                           `Expected "${commentValue}" to be a comment node value`);
          const commentRNode = renderer.createComment(commentValue);
          ngDevMode && ngDevMode.rendererCreateComment++;
          previousTNode = currentTNode;
          currentTNode = createDynamicNodeAtIndex(
              viewData, commentNodeIndex, TNodeType.IcuContainer, commentRNode, null);
          visitedNodes.push(commentNodeIndex);
          attachPatchData(commentRNode, viewData);
          (currentTNode as TIcuContainerNode).activeCaseIndex = null;
          // We will add the case nodes later, during the update phase
          setIsNotParent();
          break;
        case ELEMENT_MARKER:
          const tagNameValue = createOpCodes[++i] as string;
          const elementNodeIndex = createOpCodes[++i] as number;
          ngDevMode && assertEqual(
                           typeof tagNameValue, 'string',
                           `Expected "${tagNameValue}" to be an element node tag name`);
          const elementRNode = renderer.createElement(tagNameValue);
          ngDevMode && ngDevMode.rendererCreateElement++;
          previousTNode = currentTNode;
          currentTNode = createDynamicNodeAtIndex(
              viewData, elementNodeIndex, TNodeType.Element, elementRNode, tagNameValue);
          visitedNodes.push(elementNodeIndex);
          break;
        default:
          throw new Error(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    }
  }

  setIsNotParent();

  return visitedNodes;
}

function readUpdateOpCodes(
    updateOpCodes: I18nUpdateOpCodes, icus: TIcu[] | null, bindingsStartIndex: number,
    changeMask: number, viewData: LView, bypassCheckBit = false) {
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
            value += renderStringify(viewData[bindingsStartIndex - opCode]);
          } else {
            const nodeIndex = opCode >>> I18nUpdateOpCode.SHIFT_REF;
            let tIcuIndex: number;
            let tIcu: TIcu;
            let icuTNode: TIcuContainerNode;
            switch (opCode & I18nUpdateOpCode.MASK_OPCODE) {
              case I18nUpdateOpCode.Attr:
                const propName = updateOpCodes[++j] as string;
                const sanitizeFn = updateOpCodes[++j] as SanitizerFn | null;
                elementPropertyInternal(nodeIndex, propName, value, sanitizeFn);
                break;
              case I18nUpdateOpCode.Text:
                textBindingInternal(viewData, nodeIndex, value);
                break;
              case I18nUpdateOpCode.IcuSwitch:
                tIcuIndex = updateOpCodes[++j] as number;
                tIcu = icus ![tIcuIndex];
                icuTNode = getTNode(nodeIndex, viewData) as TIcuContainerNode;
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
                readCreateOpCodes(-1, tIcu.create[caseIndex], icus, viewData);
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

function removeNode(index: number, viewData: LView) {
  const removedPhTNode = getTNode(index, viewData);
  const removedPhRNode = getNativeByIndex(index, viewData);
  if (removedPhRNode) {
    nativeRemoveNode(viewData[RENDERER], removedPhRNode);
  }

  const slotValue = ɵɵload(index) as RElement | RComment | LContainer;
  if (isLContainer(slotValue)) {
    const lContainer = slotValue as LContainer;
    if (removedPhTNode.type !== TNodeType.Container) {
      nativeRemoveNode(viewData[RENDERER], lContainer[NATIVE]);
    }
  }

  // Define this node as detached so that we don't risk projecting it
  removedPhTNode.flags |= TNodeFlags.isDetached;
  ngDevMode && ngDevMode.rendererRemoveNode++;
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
 *
 * @codeGenApi
 */
export function ɵɵi18n(index: number, message: string, subTemplateIndex?: number): void {
  ɵɵi18nStart(index, message, subTemplateIndex);
  ɵɵi18nEnd();
}

/**
 * Marks a list of attributes as translatable.
 *
 * @param index A unique index in the static block
 * @param values
 *
 * @codeGenApi
 */
export function ɵɵi18nAttributes(index: number, values: string[]): void {
  const tView = getLView()[TVIEW];
  ngDevMode && assertDefined(tView, `tView should be defined`);
  i18nAttributesFirstPass(tView, index, values);
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
        throw new Error('ICU expressions are not yet supported in attributes');
      } else if (value !== '') {
        // Even indexes are text (including bindings)
        const hasBinding = !!value.match(BINDING_REGEXP);
        if (hasBinding) {
          if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
            addAllToArray(
                generateBindingUpdateOpCodes(value, previousElementIndex, attrName), updateOpCodes);
          }
        } else {
          const lView = getLView();
          elementAttributeInternal(previousElementIndex, attrName, value, lView);
          // Check if that attribute is a directive input
          const tNode = getTNode(previousElementIndex, lView);
          const dataValue = tNode.inputs && tNode.inputs[attrName];
          if (dataValue) {
            setInputsForProperty(lView, dataValue, value);
          }
        }
      }
    }
  }

  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    tView.data[index + HEADER_OFFSET] = updateOpCodes;
  }
}

let changeMask = 0b0;
let shiftsCounter = 0;

/**
 * Stores the values of the bindings during each update cycle in order to determine if we need to
 * update the translated nodes.
 *
 * @param value The binding's value
 * @returns This function returns itself so that it may be chained
 * (e.g. `i18nExp(ctx.name)(ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵi18nExp<T>(value: T): TsickleIssue1009 {
  const lView = getLView();
  const expression = bind(lView, value);
  if (expression !== NO_CHANGE) {
    changeMask = changeMask | (1 << shiftsCounter);
  }
  shiftsCounter++;
  return ɵɵi18nExp;
}

/**
 * Updates a translation block or an i18n attribute when the bindings have changed.
 *
 * @param index Index of either {@link i18nStart} (translation block) or {@link i18nAttributes}
 * (i18n attribute) on which it should update the content.
 *
 * @codeGenApi
 */
export function ɵɵi18nApply(index: number) {
  if (shiftsCounter) {
    const lView = getLView();
    const tView = lView[TVIEW];
    ngDevMode && assertDefined(tView, `tView should be defined`);
    const tI18n = tView.data[index + HEADER_OFFSET];
    let updateOpCodes: I18nUpdateOpCodes;
    let icus: TIcu[]|null = null;
    if (Array.isArray(tI18n)) {
      updateOpCodes = tI18n as I18nUpdateOpCodes;
    } else {
      updateOpCodes = (tI18n as TI18n).update;
      icus = (tI18n as TI18n).icus;
    }
    const bindingsStartIndex = lView[BINDING_INDEX] - shiftsCounter - 1;
    readUpdateOpCodes(updateOpCodes, icus, bindingsStartIndex, changeMask, lView);

    // Reset changeMask & maskBit to default for the next update cycle
    changeMask = 0b0;
    shiftsCounter = 0;
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
        const resolvedCase = getPluralCase(bindingValue, getLocaleId());
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
    childIcus,
    cases: icuExpression.cases,
    create: createCodes,
    remove: removeCodes,
    update: updateCodes
  };
  tIcus.push(tIcu);
  // Adding the maximum possible of vars needed (based on the cases with the most vars)
  i18nVarsCount += Math.max(...vars);
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
                ELEMENT_MARKER, tagName, newIndex,
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
              hasBinding ? '' : value, newIndex,
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
                COMMENT_MARKER, newLocal, newIndex,
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

/**
 * Angular Dart introduced &ngsp; as a placeholder for non-removable space, see:
 * https://github.com/dart-lang/angular/blob/0bb611387d29d65b5af7f9d2515ab571fd3fbee4/_tests/test/compiler/preserve_whitespace_test.dart#L25-L32
 * In Angular Dart &ngsp; is converted to the 0xE500 PUA (Private Use Areas) unicode character
 * and later on replaced by a space. We are re-implementing the same idea here, since translations
 * might contain this special character.
 */
const NGSP_UNICODE_REGEXP = /\uE500/g;
function replaceNgsp(value: string): string {
  return value.replace(NGSP_UNICODE_REGEXP, ' ');
}

let TRANSLATIONS: {[key: string]: string} = {};
export interface I18nLocalizeOptions { translations: {[key: string]: string}; }

/**
 * Set the configuration for `i18nLocalize`.
 *
 * @deprecated this method is temporary & should not be used as it will be removed soon
 */
export function i18nConfigureLocalize(options: I18nLocalizeOptions = {
  translations: {}
}) {
  TRANSLATIONS = options.translations;
}

const LOCALIZE_PH_REGEXP = /\{\$(.*?)\}/g;

/**
 * A goog.getMsg-like function for users that do not use Closure.
 *
 * This method is required as a *temporary* measure to prevent i18n tests from being blocked while
 * running outside of Closure Compiler. This method will not be needed once runtime translation
 * service support is introduced.
 *
 * @codeGenApi
 * @deprecated this method is temporary & should not be used as it will be removed soon
 */
export function ɵɵi18nLocalize(input: string, placeholders?: {[key: string]: string}) {
  if (typeof TRANSLATIONS[input] !== 'undefined') {  // to account for empty string
    input = TRANSLATIONS[input];
  }
  if (placeholders !== undefined && Object.keys(placeholders).length) {
    return input.replace(LOCALIZE_PH_REGEXP, (_, key) => placeholders[key] || '');
  }
  return input;
}

/**
 * The locale id that the application is currently using (for translations and ICU expressions).
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 */
let LOCALE_ID = DEFAULT_LOCALE_ID;

/**
 * Sets the locale id that will be used for translations and ICU expressions.
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 *
 * @param localeId
 */
export function setLocaleId(localeId: string) {
  assertDefined(localeId, `Expected localeId to be defined`);
  if (typeof localeId === 'string') {
    LOCALE_ID = localeId.toLowerCase().replace(/_/g, '-');
  }
}

/**
 * Gets the locale id that will be used for translations and ICU expressions.
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 */
export function getLocaleId(): string {
  return LOCALE_ID;
}
