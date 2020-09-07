/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import '../../util/ng_dev_mode';
import '../../util/ng_i18n_closure_mode';

import {getTemplateContent, SRCSET_ATTRS, URI_ATTRS, VALID_ATTRS, VALID_ELEMENTS} from '../../sanitization/html_sanitizer';
import {getInertBodyHelper} from '../../sanitization/inert_body';
import {_sanitizeUrl, sanitizeSrcset} from '../../sanitization/url_sanitizer';
import {addAllToArray} from '../../util/array_utils';
import {assertEqual} from '../../util/assert';
import {allocExpando, elementAttributeInternal, setInputsForProperty, setNgReflectProperties} from '../instructions/shared';
import {getDocument} from '../interfaces/document';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nMutateOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, IcuCase, IcuExpression, IcuType, TI18n, TIcu} from '../interfaces/i18n';
import {TNodeType} from '../interfaces/node';
import {RComment, RElement} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {HEADER_OFFSET, LView, T_HOST, TView} from '../interfaces/view';
import {getIsParent, getPreviousOrParentTNode} from '../state';
import {attachDebugGetter} from '../util/debug_utils';
import {getNativeByIndex, getTNode} from '../util/view_utils';

import {i18nMutateOpCodesToString, i18nUpdateOpCodesToString} from './i18n_debug';



const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const NESTED_ICU = /�(\d+)�/;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;


// Count for the number of vars that will be allocated for each i18n block.
// It is global because this is used in multiple functions that include loops and recursive calls.
// This is reset to 0 when `i18nStartFirstPass` is called.
let i18nVarsCount: number;

const parentIndexStack: number[] = [];

const MARKER = `�`;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*!]\d+):?\d*�/gi;
const enum TagType {
  ELEMENT = '#',
  TEMPLATE = '*',
  PROJECTION = '!',
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


/**
 * See `i18nStart` above.
 */
export function i18nStartFirstPass(
    lView: LView, tView: TView, index: number, message: string, subTemplateIndex?: number) {
  const startIndex = tView.blueprint.length - HEADER_OFFSET;
  i18nVarsCount = 0;
  const previousOrParentTNode = getPreviousOrParentTNode();
  const parentTNode =
      getIsParent() ? previousOrParentTNode : previousOrParentTNode && previousOrParentTNode.parent;
  let parentIndex =
      parentTNode && parentTNode !== lView[T_HOST] ? parentTNode.index - HEADER_OFFSET : index;
  let parentIndexPointer = 0;
  parentIndexStack[parentIndexPointer] = parentIndex;
  const createOpCodes: I18nMutateOpCodes = [];
  if (ngDevMode) {
    attachDebugGetter(createOpCodes, i18nMutateOpCodesToString);
  }
  // If the previous node wasn't the direct parent then we have a translation without top level
  // element and we need to keep a reference of the previous element if there is one. We should also
  // keep track whether an element was a parent node or not, so that the logic that consumes
  // the generated `I18nMutateOpCode`s can leverage this information to properly set TNode state
  // (whether it's a parent or sibling).
  if (index > 0 && previousOrParentTNode !== parentTNode) {
    let previousTNodeIndex = previousOrParentTNode.index - HEADER_OFFSET;
    // If current TNode is a sibling node, encode it using a negative index. This information is
    // required when the `Select` action is processed (see the `readCreateOpCodes` function).
    if (!getIsParent()) {
      previousTNodeIndex = ~previousTNodeIndex;
    }
    // Create an OpCode to select the previous TNode
    createOpCodes.push(previousTNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select);
  }
  const updateOpCodes: I18nUpdateOpCodes = [];
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  const icuExpressions: TIcu[] = [];

  if (message === '' && isRootTemplateMessage(subTemplateIndex)) {
    // If top level translation is an empty string, do not invoke additional processing
    // and just create op codes for empty text node instead.
    createOpCodes.push(
        message, allocNodeIndex(startIndex),
        parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);
  } else {
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
          const isElement = value.charAt(0) === TagType.ELEMENT;
          // The value represents a placeholder that we move to the designated index.
          // Note: positive indicies indicate that a TNode with a given index should also be marked
          // as parent while executing `Select` instruction.
          createOpCodes.push(
              (isElement ? phIndex : ~phIndex) << I18nMutateOpCode.SHIFT_REF |
                  I18nMutateOpCode.Select,
              parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

          if (isElement) {
            parentIndexStack[++parentIndexPointer] = parentIndex = phIndex;
          }
        }
      } else {
        // Even indexes are text (including bindings & ICU expressions)
        const parts = extractParts(value);
        for (let j = 0; j < parts.length; j++) {
          if (j & 1) {
            // Odd indexes are ICU expressions
            const icuExpression = parts[j] as IcuExpression;

            // Verify that ICU expression has the right shape. Translations might contain invalid
            // constructions (while original messages were correct), so ICU parsing at runtime may
            // not succeed (thus `icuExpression` remains a string).
            if (typeof icuExpression !== 'object') {
              throw new Error(
                  `Unable to parse ICU expression in "${templateTranslation}" message.`);
            }

            // Create the comment node that will anchor the ICU expression
            const icuNodeIndex = allocNodeIndex(startIndex);
            createOpCodes.push(
                COMMENT_MARKER, ngDevMode ? `ICU ${icuNodeIndex}` : '', icuNodeIndex,
                parentIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild);

            // Update codes for the ICU expression
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
            const textNodeIndex = allocNodeIndex(startIndex);
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
  }

  if (i18nVarsCount > 0) {
    allocExpando(tView, lView, i18nVarsCount);
  }

  // NOTE: local var needed to properly assert the type of `TI18n`.
  const tI18n: TI18n = {
    vars: i18nVarsCount,
    create: createOpCodes,
    update: updateOpCodes,
    icus: icuExpressions.length ? icuExpressions : null,
  };

  tView.data[index + HEADER_OFFSET] = tI18n;
}

/**
 * See `i18nAttributes` above.
 */
export function i18nAttributesFirstPass(
    lView: LView, tView: TView, index: number, values: string[]) {
  const previousElement = getPreviousOrParentTNode();
  const previousElementIndex = previousElement.index - HEADER_OFFSET;
  const updateOpCodes: I18nUpdateOpCodes = [];
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
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
          if (tView.firstCreatePass && tView.data[index + HEADER_OFFSET] === null) {
            addAllToArray(
                generateBindingUpdateOpCodes(value, previousElementIndex, attrName), updateOpCodes);
          }
        } else {
          const tNode = getTNode(tView, previousElementIndex);
          // Set attributes for Elements only, for other types (like ElementContainer),
          // only set inputs below
          if (tNode.type === TNodeType.Element) {
            elementAttributeInternal(tNode, lView, attrName, value, null, null);
          }
          // Check if that attribute is a directive input
          const dataValue = tNode.inputs !== null && tNode.inputs[attrName];
          if (dataValue) {
            setInputsForProperty(tView, lView, dataValue, attrName, value);
            if (ngDevMode) {
              const element = getNativeByIndex(previousElementIndex, lView) as RElement | RComment;
              setNgReflectProperties(lView, element, tNode.type, dataValue, value);
            }
          }
        }
      }
    }
  }

  if (tView.firstCreatePass && tView.data[index + HEADER_OFFSET] === null) {
    tView.data[index + HEADER_OFFSET] = updateOpCodes;
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
export function generateBindingUpdateOpCodes(
    str: string, destinationNode: number, attrName?: string,
    sanitizeFn: SanitizerFn|null = null): I18nUpdateOpCodes {
  const updateOpCodes: I18nUpdateOpCodes = [null, null];  // Alloc space for mask and size
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
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

function allocNodeIndex(startIndex: number): number {
  return startIndex + i18nVarsCount++;
}


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

export function isRootTemplateMessage(subTemplateIndex: number|
                                      undefined): subTemplateIndex is undefined {
  return subTemplateIndex === undefined;
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
          `Tag mismatch: unable to find the end of the sub-template in the translation "${
              message}"`);

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
  if (isRootTemplateMessage(subTemplateIndex)) {
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
 * Generate the OpCodes for ICU expressions.
 *
 * @param tIcus
 * @param icuExpression
 * @param startIndex
 * @param expandoStartIndex
 */
export function icuStart(
    tIcus: TIcu[], icuExpression: IcuExpression, startIndex: number,
    expandoStartIndex: number): void {
  const createCodes: I18nMutateOpCodes[] = [];
  const removeCodes: I18nMutateOpCodes[] = [];
  const updateCodes: I18nUpdateOpCodes[] = [];
  const vars = [];
  const childIcus: number[][] = [];
  const values = icuExpression.values;
  for (let i = 0; i < values.length; i++) {
    // Each value is an array of strings & other ICU expressions
    const valueArr = values[i];
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
    currentCaseLViewIndex: HEADER_OFFSET +
        expandoStartIndex  // expandoStartIndex does not include the header so add it.
        + 1,               // The first item stored is the `<!--ICU #-->` anchor so skip it.
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
 * Parses text containing an ICU expression and produces a JSON object for it.
 * Original code from closure library, modified for Angular.
 *
 * @param pattern Text containing an ICU expression that needs to be parsed.
 *
 */
export function parseICUBlock(pattern: string): IcuExpression {
  const cases = [];
  const values: (string|IcuExpression)[][] = [];
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

  // TODO(ocombe): support ICU expressions in attributes, see #21615
  return {type: icuType, mainBinding: mainBinding, cases, values};
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
  const inertBodyHelper = getInertBodyHelper(getDocument());
  const inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeHtml);
  if (!inertBodyElement) {
    throw new Error('Unable to generate inert body element');
  }
  const wrapper = getTemplateContent(inertBodyElement!) as Element || inertBodyElement;
  const opCodes: IcuCase = {
    vars: 1,  // allocate space for `TIcu.currentCaseLViewIndex`
    childIcus: [],
    create: [],
    remove: [],
    update: []
  };
  if (ngDevMode) {
    attachDebugGetter(opCodes.create, i18nMutateOpCodesToString);
    attachDebugGetter(opCodes.remove, i18nMutateOpCodesToString);
    attachDebugGetter(opCodes.update, i18nUpdateOpCodesToString);
  }
  parseNodes(wrapper.firstChild, opCodes, parentIndex, nestedIcus, tIcus, expandoStartIndex);
  return opCodes;
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
function extractParts(pattern: string): (string|IcuExpression)[] {
  if (!pattern) {
    return [];
  }

  let prevPos = 0;
  const braceStack = [];
  const results: (string|IcuExpression)[] = [];
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
 * Parses a node, its children and its siblings, and generates the mutate & update OpCodes.
 *
 * @param currentNode The first node to parse
 * @param icuCase The data for the ICU expression case that contains those nodes
 * @param parentIndex Index of the current node's parent
 * @param nestedIcus Data for the nested ICU expressions that this case contains
 * @param tIcus Data for all ICU expressions of the current message
 * @param expandoStartIndex Expando start index for the current ICU expression
 */
export function parseNodes(
    currentNode: Node|null, icuCase: IcuCase, parentIndex: number, nestedIcus: IcuExpression[],
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
              const attr = elAttrs.item(i)!;
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
                      console.warn(`WARNING: ignoring unsafe attribute value ${
                          lowerAttrName} on element ${tagName} (see http://g.co/ng/security#xss)`);
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
      currentNode = nextNode!;
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
          // FIXME(misko): Index should be part of the opcode
          nestTIcuIndex,
          mask,  // mask of all the bindings of this ICU expression
          2,     // skip 2 opCodes if not changed
          nestedIcuNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate,
          nestTIcuIndex);
      icuCase.remove.push(
          nestTIcuIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.RemoveNestedIcu,
          // FIXME(misko): Index should be part of the opcode
          nestedIcuNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove);
    }
  }
}
