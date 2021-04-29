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
import {assertDefined, assertEqual, assertGreaterThanOrEqual, assertOneOf, assertString} from '../../util/assert';
import {CharCode} from '../../util/char_code';
import {loadIcuContainerVisitor} from '../instructions/i18n_icu_container_visitor';
import {allocExpando, createTNodeAtIndex} from '../instructions/shared';
import {getDocument} from '../interfaces/document';
import {ELEMENT_MARKER, I18nCreateOpCode, I18nCreateOpCodes, I18nRemoveOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, ICU_MARKER, IcuCreateOpCode, IcuCreateOpCodes, IcuExpression, IcuType, TI18n, TIcu} from '../interfaces/i18n';
import {TNode, TNodeType} from '../interfaces/node';
import {SanitizerFn} from '../interfaces/sanitization';
import {HEADER_OFFSET, LView, TView} from '../interfaces/view';
import {getCurrentParentTNode, getCurrentTNode, setCurrentTNode} from '../state';
import {attachDebugGetter} from '../util/debug_utils';

import {i18nCreateOpCodesToString, i18nRemoveOpCodesToString, i18nUpdateOpCodesToString, icuCreateOpCodesToString} from './i18n_debug';
import {addTNodeAndUpdateInsertBeforeIndex} from './i18n_insert_before_index';
import {ensureIcuContainerVisitorLoaded} from './i18n_tree_shaking';
import {createTNodePlaceholder, icuCreateOpCode, setTIcu, setTNodeInsertBeforeIndex} from './i18n_util';



const BINDING_REGEXP = /�(\d+):?\d*�/gi;
const ICU_REGEXP = /({\s*�\d+:?\d*�\s*,\s*\S{6}\s*,[\s\S]*})/gi;
const NESTED_ICU = /�(\d+)�/;
const ICU_BLOCK_REGEXP = /^\s*(�\d+:?\d*�)\s*,\s*(select|plural)\s*,/;

const MARKER = `�`;
const SUBTEMPLATE_REGEXP = /�\/?\*(\d+:\d+)�/gi;
const PH_REGEXP = /�(\/?[#*]\d+):?\d*�/gi;

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
 * Create dynamic nodes from i18n translation block.
 *
 * - Text nodes are created synchronously
 * - TNodes are linked into tree lazily
 *
 * @param tView Current `TView`
 * @parentTNodeIndex index to the parent TNode of this i18n block
 * @param lView Current `LView`
 * @param index Index of `ɵɵi18nStart` instruction.
 * @param message Message to translate.
 * @param subTemplateIndex Index into the sub template of message translation. (ie in case of
 *     `ngIf`) (-1 otherwise)
 */
export function i18nStartFirstCreatePass(
    tView: TView, parentTNodeIndex: number, lView: LView, index: number, message: string,
    subTemplateIndex: number) {
  const rootTNode = getCurrentParentTNode();
  const createOpCodes: I18nCreateOpCodes = [] as any;
  const updateOpCodes: I18nUpdateOpCodes = [] as any;
  const existingTNodeStack: TNode[][] = [[]];
  if (ngDevMode) {
    attachDebugGetter(createOpCodes, i18nCreateOpCodesToString);
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }

  message = getTranslationForTemplate(message, subTemplateIndex);
  const msgParts = replaceNgsp(message).split(PH_REGEXP);
  for (let i = 0; i < msgParts.length; i++) {
    let value = msgParts[i];
    if ((i & 1) === 0) {
      // Even indexes are text (including bindings & ICU expressions)
      const parts = i18nParseTextIntoPartsAndICU(value);
      for (let j = 0; j < parts.length; j++) {
        let part = parts[j];
        if ((j & 1) === 0) {
          // `j` is odd therefore `part` is string
          const text = part as string;
          ngDevMode && assertString(text, 'Parsed ICU part should be string');
          if (text !== '') {
            i18nStartFirstCreatePassProcessTextNode(
                tView, rootTNode, existingTNodeStack[0], createOpCodes, updateOpCodes, lView, text);
          }
        } else {
          // `j` is Even therefor `part` is an `ICUExpression`
          const icuExpression: IcuExpression = part as IcuExpression;
          // Verify that ICU expression has the right shape. Translations might contain invalid
          // constructions (while original messages were correct), so ICU parsing at runtime may
          // not succeed (thus `icuExpression` remains a string).
          // Note: we intentionally retain the error here by not using `ngDevMode`, because
          // the value can change based on the locale and users aren't guaranteed to hit
          // an invalid string while they're developing.
          if (typeof icuExpression !== 'object') {
            throw new Error(`Unable to parse ICU expression in "${message}" message.`);
          }
          const icuContainerTNode = createTNodeAndAddOpCode(
              tView, rootTNode, existingTNodeStack[0], lView, createOpCodes,
              ngDevMode ? `ICU ${index}:${icuExpression.mainBinding}` : '', true);
          const icuNodeIndex = icuContainerTNode.index;
          ngDevMode &&
              assertGreaterThanOrEqual(
                  icuNodeIndex, HEADER_OFFSET, 'Index must be in absolute LView offset');
          icuStart(tView, lView, updateOpCodes, parentTNodeIndex, icuExpression, icuNodeIndex);
        }
      }
    } else {
      // Odd indexes are placeholders (elements and sub-templates)
      // At this point value is something like: '/#1:2' (originally coming from '�/#1:2�')
      const isClosing = value.charCodeAt(0) === CharCode.SLASH;
      const type = value.charCodeAt(isClosing ? 1 : 0);
      ngDevMode && assertOneOf(type, CharCode.STAR, CharCode.HASH);
      const index = HEADER_OFFSET + Number.parseInt(value.substring((isClosing ? 2 : 1)));
      if (isClosing) {
        existingTNodeStack.shift();
        setCurrentTNode(getCurrentParentTNode()!, false);
      } else {
        const tNode = createTNodePlaceholder(tView, existingTNodeStack[0], index);
        existingTNodeStack.unshift([]);
        setCurrentTNode(tNode, true);
      }
    }
  }

  tView.data[index] = <TI18n>{
    create: createOpCodes,
    update: updateOpCodes,
  };
}

/**
 * Allocate space in i18n Range add create OpCode instruction to crete a text or comment node.
 *
 * @param tView Current `TView` needed to allocate space in i18n range.
 * @param rootTNode Root `TNode` of the i18n block. This node determines if the new TNode will be
 *     added as part of the `i18nStart` instruction or as part of the `TNode.insertBeforeIndex`.
 * @param existingTNodes internal state for `addTNodeAndUpdateInsertBeforeIndex`.
 * @param lView Current `LView` needed to allocate space in i18n range.
 * @param createOpCodes Array storing `I18nCreateOpCodes` where new opCodes will be added.
 * @param text Text to be added when the `Text` or `Comment` node will be created.
 * @param isICU true if a `Comment` node for ICU (instead of `Text`) node should be created.
 */
function createTNodeAndAddOpCode(
    tView: TView, rootTNode: TNode|null, existingTNodes: TNode[], lView: LView,
    createOpCodes: I18nCreateOpCodes, text: string|null, isICU: boolean): TNode {
  const i18nNodeIdx = allocExpando(tView, lView, 1, null);
  let opCode = i18nNodeIdx << I18nCreateOpCode.SHIFT;
  let parentTNode = getCurrentParentTNode();

  if (rootTNode === parentTNode) {
    // FIXME(misko): A null `parentTNode` should represent when we fall of the `LView` boundary.
    // (there is no parent), but in some circumstances (because we are inconsistent about how we set
    // `previousOrParentTNode`) it could point to `rootTNode` So this is a work around.
    parentTNode = null;
  }
  if (parentTNode === null) {
    // If we don't have a parent that means that we can eagerly add nodes.
    // If we have a parent than these nodes can't be added now (as the parent has not been created
    // yet) and instead the `parentTNode` is responsible for adding it. See
    // `TNode.insertBeforeIndex`
    opCode |= I18nCreateOpCode.APPEND_EAGERLY;
  }
  if (isICU) {
    opCode |= I18nCreateOpCode.COMMENT;
    ensureIcuContainerVisitorLoaded(loadIcuContainerVisitor);
  }
  createOpCodes.push(opCode, text === null ? '' : text);
  // We store `{{?}}` so that when looking at debug `TNodeType.template` we can see where the
  // bindings are.
  const tNode = createTNodeAtIndex(
      tView, i18nNodeIdx, isICU ? TNodeType.Icu : TNodeType.Text,
      text === null ? (ngDevMode ? '{{?}}' : '') : text, null);
  addTNodeAndUpdateInsertBeforeIndex(existingTNodes, tNode);
  const tNodeIdx = tNode.index;
  setCurrentTNode(tNode, false /* Text nodes are self closing */);
  if (parentTNode !== null && rootTNode !== parentTNode) {
    // We are a child of deeper node (rather than a direct child of `i18nStart` instruction.)
    // We have to make sure to add ourselves to the parent.
    setTNodeInsertBeforeIndex(parentTNode, tNodeIdx);
  }
  return tNode;
}

/**
 * Processes text node in i18n block.
 *
 * Text nodes can have:
 * - Create instruction in `createOpCodes` for creating the text node.
 * - Allocate spec for text node in i18n range of `LView`
 * - If contains binding:
 *    - bindings => allocate space in i18n range of `LView` to store the binding value.
 *    - populate `updateOpCodes` with update instructions.
 *
 * @param tView Current `TView`
 * @param rootTNode Root `TNode` of the i18n block. This node determines if the new TNode will
 *     be added as part of the `i18nStart` instruction or as part of the
 *     `TNode.insertBeforeIndex`.
 * @param existingTNodes internal state for `addTNodeAndUpdateInsertBeforeIndex`.
 * @param createOpCodes Location where the creation OpCodes will be stored.
 * @param lView Current `LView`
 * @param text The translated text (which may contain binding)
 */
function i18nStartFirstCreatePassProcessTextNode(
    tView: TView, rootTNode: TNode|null, existingTNodes: TNode[], createOpCodes: I18nCreateOpCodes,
    updateOpCodes: I18nUpdateOpCodes, lView: LView, text: string): void {
  const hasBinding = text.match(BINDING_REGEXP);
  const tNode = createTNodeAndAddOpCode(
      tView, rootTNode, existingTNodes, lView, createOpCodes, hasBinding ? null : text, false);
  if (hasBinding) {
    generateBindingUpdateOpCodes(updateOpCodes, text, tNode.index, null, 0, null);
  }
}

/**
 * See `i18nAttributes` above.
 */
export function i18nAttributesFirstPass(tView: TView, index: number, values: string[]) {
  const previousElement = getCurrentTNode()!;
  const previousElementIndex = previousElement.index;
  const updateOpCodes: I18nUpdateOpCodes = [] as any;
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  if (tView.firstCreatePass && tView.data[index] === null) {
    for (let i = 0; i < values.length; i += 2) {
      const attrName = values[i];
      const message = values[i + 1];

      if (message !== '') {
        // Check if attribute value contains an ICU and throw an error if that's the case.
        // ICUs in element attributes are not supported.
        // Note: we intentionally retain the error here by not using `ngDevMode`, because
        // the `value` can change based on the locale and users aren't guaranteed to hit
        // an invalid string while they're developing.
        if (ICU_REGEXP.test(message)) {
          throw new Error(
              `ICU expressions are not supported in attributes. Message: "${message}".`);
        }

        // i18n attributes that hit this code path are guaranteed to have bindings, because
        // the compiler treats static i18n attributes as regular attribute bindings.
        // Since this may not be the first i18n attribute on this element we need to pass in how
        // many previous bindings there have already been.
        generateBindingUpdateOpCodes(
            updateOpCodes, message, previousElementIndex, attrName, countBindings(updateOpCodes),
            null);
      }
    }
    tView.data[index] = updateOpCodes;
  }
}


/**
 * Generate the OpCodes to update the bindings of a string.
 *
 * @param updateOpCodes Place where the update opcodes will be stored.
 * @param str The string containing the bindings.
 * @param destinationNode Index of the destination node which will receive the binding.
 * @param attrName Name of the attribute, if the string belongs to an attribute.
 * @param sanitizeFn Sanitization function used to sanitize the string after update, if necessary.
 * @param bindingStart The lView index of the next expression that can be bound via an opCode.
 * @returns The mask value for these bindings
 */
function generateBindingUpdateOpCodes(
    updateOpCodes: I18nUpdateOpCodes, str: string, destinationNode: number, attrName: string|null,
    bindingStart: number, sanitizeFn: SanitizerFn|null): number {
  ngDevMode &&
      assertGreaterThanOrEqual(
          destinationNode, HEADER_OFFSET, 'Index must be in absolute LView offset');
  const maskIndex = updateOpCodes.length;  // Location of mask
  const sizeIndex = maskIndex + 1;         // location of size for skipping
  updateOpCodes.push(null, null);          // Alloc space for mask and size
  const startIndex = maskIndex + 2;        // location of first allocation.
  if (ngDevMode) {
    attachDebugGetter(updateOpCodes, i18nUpdateOpCodesToString);
  }
  const textParts = str.split(BINDING_REGEXP);
  let mask = 0;

  for (let j = 0; j < textParts.length; j++) {
    const textValue = textParts[j];

    if (j & 1) {
      // Odd indexes are bindings
      const bindingIndex = bindingStart + parseInt(textValue, 10);
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
  updateOpCodes[maskIndex] = mask;
  updateOpCodes[sizeIndex] = updateOpCodes.length - startIndex;
  return mask;
}

/**
 * Count the number of bindings in the given `opCodes`.
 *
 * It could be possible to speed this up, by passing the number of bindings found back from
 * `generateBindingUpdateOpCodes()` to `i18nAttributesFirstPass()` but this would then require more
 * complexity in the code and/or transient objects to be created.
 *
 * Since this function is only called once when the template is instantiated, is trivial in the
 * first instance (since `opCodes` will be an empty array), and it is not common for elements to
 * contain multiple i18n bound attributes, it seems like this is a reasonable compromise.
 */
function countBindings(opCodes: I18nUpdateOpCodes): number {
  let count = 0;
  for (let i = 0; i < opCodes.length; i++) {
    const opCode = opCodes[i];
    // Bindings are negative numbers.
    if (typeof opCode === 'number' && opCode < 0) {
      count++;
    }
  }
  return count;
}

/**
 * Convert binding index to mask bit.
 *
 * Each index represents a single bit on the bit-mask. Because bit-mask only has 32 bits, we make
 * the 32nd bit share all masks for all bindings higher than 32. Since it is extremely rare to
 * have more than 32 bindings this will be hit very rarely. The downside of hitting this corner
 * case is that we will execute binding code more often than necessary. (penalty of performance)
 */
function toMaskBit(bindingIndex: number): number {
  return 1 << Math.min(bindingIndex, 31);
}

export function isRootTemplateMessage(subTemplateIndex: number): subTemplateIndex is - 1 {
  return subTemplateIndex === -1;
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
 * This method is used for extracting a part of the message associated with a template. A
 * translated message can span multiple templates.
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
export function getTranslationForTemplate(message: string, subTemplateIndex: number) {
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
 * @param icuExpression
 * @param index Index where the anchor is stored and an optional `TIcuContainerNode`
 *   - `lView[anchorIdx]` points to a `Comment` node representing the anchor for the ICU.
 *   - `tView.data[anchorIdx]` points to the `TIcuContainerNode` if ICU is root (`null` otherwise)
 */
export function icuStart(
    tView: TView, lView: LView, updateOpCodes: I18nUpdateOpCodes, parentIdx: number,
    icuExpression: IcuExpression, anchorIdx: number) {
  ngDevMode && assertDefined(icuExpression, 'ICU expression must be defined');
  let bindingMask = 0;
  const tIcu: TIcu = {
    type: icuExpression.type,
    currentCaseLViewIndex: allocExpando(tView, lView, 1, null),
    anchorIdx,
    cases: [],
    create: [],
    remove: [],
    update: []
  };
  addUpdateIcuSwitch(updateOpCodes, icuExpression, anchorIdx);
  setTIcu(tView, anchorIdx, tIcu);
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
    bindingMask = parseIcuCase(
                      tView, tIcu, lView, updateOpCodes, parentIdx, icuExpression.cases[i],
                      valueArr.join(''), nestedIcus) |
        bindingMask;
  }
  if (bindingMask) {
    addUpdateIcuUpdate(updateOpCodes, bindingMask, anchorIdx);
  }
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

  const parts = i18nParseTextIntoPartsAndICU(pattern) as string[];
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

    const blocks = i18nParseTextIntoPartsAndICU(parts[pos++]) as string[];
    if (cases.length > values.length) {
      values.push(blocks);
    }
  }

  // TODO(ocombe): support ICU expressions in attributes, see #21615
  return {type: icuType, mainBinding: mainBinding, cases, values};
}


/**
 * Breaks pattern into strings and top level {...} blocks.
 * Can be used to break a message into text and ICU expressions, or to break an ICU expression
 * into keys and cases. Original code from closure library, modified for Angular.
 *
 * @param pattern (sub)Pattern to be broken.
 * @returns An `Array<string|IcuExpression>` where:
 *   - odd positions: `string` => text between ICU expressions
 *   - even positions: `ICUExpression` => ICU expression parsed into `ICUExpression` record.
 */
export function i18nParseTextIntoPartsAndICU(pattern: string): (string|IcuExpression)[] {
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
 */
export function parseIcuCase(
    tView: TView, tIcu: TIcu, lView: LView, updateOpCodes: I18nUpdateOpCodes, parentIdx: number,
    caseName: string, unsafeCaseHtml: string, nestedIcus: IcuExpression[]): number {
  const create: IcuCreateOpCodes = [] as any;
  const remove: I18nRemoveOpCodes = [] as any;
  const update: I18nUpdateOpCodes = [] as any;
  if (ngDevMode) {
    attachDebugGetter(create, icuCreateOpCodesToString);
    attachDebugGetter(remove, i18nRemoveOpCodesToString);
    attachDebugGetter(update, i18nUpdateOpCodesToString);
  }
  tIcu.cases.push(caseName);
  tIcu.create.push(create);
  tIcu.remove.push(remove);
  tIcu.update.push(update);

  const inertBodyHelper = getInertBodyHelper(getDocument());
  const inertBodyElement = inertBodyHelper.getInertBodyElement(unsafeCaseHtml);
  ngDevMode && assertDefined(inertBodyElement, 'Unable to generate inert body element');
  const inertRootNode = getTemplateContent(inertBodyElement!) as Element || inertBodyElement;
  if (inertRootNode) {
    return walkIcuTree(
        tView, tIcu, lView, updateOpCodes, create, remove, update, inertRootNode, parentIdx,
        nestedIcus, 0);
  } else {
    return 0;
  }
}

function walkIcuTree(
    tView: TView, tIcu: TIcu, lView: LView, sharedUpdateOpCodes: I18nUpdateOpCodes,
    create: IcuCreateOpCodes, remove: I18nRemoveOpCodes, update: I18nUpdateOpCodes,
    parentNode: Element, parentIdx: number, nestedIcus: IcuExpression[], depth: number): number {
  let bindingMask = 0;
  let currentNode = parentNode.firstChild;
  while (currentNode) {
    const newIndex = allocExpando(tView, lView, 1, null);
    switch (currentNode.nodeType) {
      case Node.ELEMENT_NODE:
        const element = currentNode as Element;
        const tagName = element.tagName.toLowerCase();
        if (VALID_ELEMENTS.hasOwnProperty(tagName)) {
          addCreateNodeAndAppend(create, ELEMENT_MARKER, tagName, parentIdx, newIndex);
          tView.data[newIndex] = tagName;
          const elAttrs = element.attributes;
          for (let i = 0; i < elAttrs.length; i++) {
            const attr = elAttrs.item(i)!;
            const lowerAttrName = attr.name.toLowerCase();
            const hasBinding = !!attr.value.match(BINDING_REGEXP);
            // we assume the input string is safe, unless it's using a binding
            if (hasBinding) {
              if (VALID_ATTRS.hasOwnProperty(lowerAttrName)) {
                if (URI_ATTRS[lowerAttrName]) {
                  generateBindingUpdateOpCodes(
                      update, attr.value, newIndex, attr.name, 0, _sanitizeUrl);
                } else if (SRCSET_ATTRS[lowerAttrName]) {
                  generateBindingUpdateOpCodes(
                      update, attr.value, newIndex, attr.name, 0, sanitizeSrcset);
                } else {
                  generateBindingUpdateOpCodes(update, attr.value, newIndex, attr.name, 0, null);
                }
              } else {
                ngDevMode &&
                    console.warn(
                        `WARNING: ignoring unsafe attribute value ` +
                        `${lowerAttrName} on element ${tagName} ` +
                        `(see https://g.co/ng/security#xss)`);
              }
            } else {
              addCreateAttribute(create, newIndex, attr);
            }
          }
          // Parse the children of this node (if any)
          bindingMask = walkIcuTree(
                            tView, tIcu, lView, sharedUpdateOpCodes, create, remove, update,
                            currentNode as Element, newIndex, nestedIcus, depth + 1) |
              bindingMask;
          addRemoveNode(remove, newIndex, depth);
        }
        break;
      case Node.TEXT_NODE:
        const value = currentNode.textContent || '';
        const hasBinding = value.match(BINDING_REGEXP);
        addCreateNodeAndAppend(create, null, hasBinding ? '' : value, parentIdx, newIndex);
        addRemoveNode(remove, newIndex, depth);
        if (hasBinding) {
          bindingMask =
              generateBindingUpdateOpCodes(update, value, newIndex, null, 0, null) | bindingMask;
        }
        break;
      case Node.COMMENT_NODE:
        // Check if the comment node is a placeholder for a nested ICU
        const isNestedIcu = NESTED_ICU.exec(currentNode.textContent || '');
        if (isNestedIcu) {
          const nestedIcuIndex = parseInt(isNestedIcu[1], 10);
          const icuExpression: IcuExpression = nestedIcus[nestedIcuIndex];
          // Create the comment node that will anchor the ICU expression
          addCreateNodeAndAppend(
              create, ICU_MARKER, ngDevMode ? `nested ICU ${nestedIcuIndex}` : '', parentIdx,
              newIndex);
          icuStart(tView, lView, sharedUpdateOpCodes, parentIdx, icuExpression, newIndex);
          addRemoveNestedIcu(remove, newIndex, depth);
        }
        break;
    }
    currentNode = currentNode.nextSibling;
  }
  return bindingMask;
}

function addRemoveNode(remove: I18nRemoveOpCodes, index: number, depth: number) {
  if (depth === 0) {
    remove.push(index);
  }
}

function addRemoveNestedIcu(remove: I18nRemoveOpCodes, index: number, depth: number) {
  if (depth === 0) {
    remove.push(~index);  // remove ICU at `index`
    remove.push(index);   // remove ICU comment at `index`
  }
}

function addUpdateIcuSwitch(
    update: I18nUpdateOpCodes, icuExpression: IcuExpression, index: number) {
  update.push(
      toMaskBit(icuExpression.mainBinding), 2, -1 - icuExpression.mainBinding,
      index << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch);
}

function addUpdateIcuUpdate(update: I18nUpdateOpCodes, bindingMask: number, index: number) {
  update.push(bindingMask, 1, index << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate);
}

function addCreateNodeAndAppend(
    create: IcuCreateOpCodes, marker: null|ICU_MARKER|ELEMENT_MARKER, text: string,
    appendToParentIdx: number, createAtIdx: number) {
  if (marker !== null) {
    create.push(marker);
  }
  create.push(
      text, createAtIdx,
      icuCreateOpCode(IcuCreateOpCode.AppendChild, appendToParentIdx, createAtIdx));
}

function addCreateAttribute(create: IcuCreateOpCodes, newIndex: number, attr: Attr) {
  create.push(newIndex << IcuCreateOpCode.SHIFT_REF | IcuCreateOpCode.Attr, attr.name, attr.value);
}
