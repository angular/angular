/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {
  assertEqual,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  throwError,
} from '../../util/assert';
import {getClosureSafeProperty} from '../../util/property';
import {assertTIcu, assertTNode} from '../assert';
import {IcuCreateOpCode, TIcu} from '../interfaces/i18n';
import {TIcuContainerNode, TNode, TNodeType} from '../interfaces/node';
import {HEADER_OFFSET, LView, TView} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {setI18nHandling} from '../node_manipulation';
import {getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore} from '../node_manipulation_i18n';
import {createTNodeAtIndex} from '../tnode_manipulation';

import {addTNodeAndUpdateInsertBeforeIndex} from './i18n_insert_before_index';

const CURRENT_CASE_LVIEW_INDEX = getClosureSafeProperty({
  currentCaseLViewIndex: getClosureSafeProperty,
});
const TVIEW = getClosureSafeProperty({
  tView: getClosureSafeProperty,
});
const I18N_MARKER = '�';
const I18N_MARKER_BODY_REGEXP = /^(?:\d+(?::\d+)?|\/?#\d+(?::\d+)?|\/?\*\d+:\d+)$/;

export interface I18nMarker {
  start: number;
  end: number;
  value: string;
}

export function throwInvalidI18nStructure(message: string | false | null): never {
  throw new RuntimeError(RuntimeErrorCode.INVALID_I18N_STRUCTURE, message);
}

/** Ensures that compiler-provided binding metadata is valid. */
export function validateI18nBindingCount(bindingCount: number): void {
  if (!Number.isSafeInteger(bindingCount) || bindingCount < 0) {
    throwInvalidI18nStructure(ngDevMode && 'Invalid i18n binding count.');
  }
}

/** Ensures that a translated binding belongs to its source message. */
export function validateI18nBindingIndex(bindingIndex: number, bindingCount: number): void {
  if (!Number.isSafeInteger(bindingIndex) || bindingIndex < 0 || bindingIndex >= bindingCount) {
    throwInvalidI18nStructure(ngDevMode && 'An i18n message references an invalid binding.');
  }
}

/** Parses syntactically valid reserved i18n markers without allowing delimiter overlap. */
export function getI18nMarkers(message: string): I18nMarker[] {
  const markers: I18nMarker[] = [];
  let cursor = 0;
  while (cursor < message.length) {
    const start = message.indexOf(I18N_MARKER, cursor);
    if (start === -1) break;
    const markerEnd = message.indexOf(I18N_MARKER, start + 1);
    const value = markerEnd === -1 ? '' : message.slice(start + 1, markerEnd);
    if (markerEnd === -1 || !I18N_MARKER_BODY_REGEXP.test(value)) {
      throwInvalidI18nStructure(ngDevMode && 'Invalid i18n marker in translation.');
    }
    markers.push({start, end: markerEnd + 1, value});
    cursor = markerEnd + 1;
  }
  return markers;
}

/** Splits structural placeholders without reusing a binding marker's closing delimiter. */
export function splitByI18nPlaceholders(message: string): string[] {
  const parts: string[] = [];
  const stack: string[] = [];
  const seenPlaceholders = new Set<string>();
  let partStart = 0;
  for (const {start, end, value} of getI18nMarkers(message)) {
    const isClosing = value.charAt(0) === '/';
    const type = value.charAt(isClosing ? 1 : 0);
    if (type === '#' || type === '*') {
      if (isClosing) {
        if (stack.pop() !== value.slice(1)) {
          throwInvalidI18nStructure(ngDevMode && 'Mismatched i18n placeholder in translation.');
        }
      } else {
        if (seenPlaceholders.has(value)) {
          throwInvalidI18nStructure(ngDevMode && 'Repeated i18n placeholder in translation.');
        }
        seenPlaceholders.add(value);
        stack.push(value);
      }
      parts.push(message.slice(partStart, start), value);
      partStart = end;
    }
  }
  if (stack.length !== 0) {
    throwInvalidI18nStructure(ngDevMode && 'Unclosed i18n placeholder in translation.');
  }
  parts.push(message.slice(partStart));
  return parts;
}

/** Rejects input that the browser's inert HTML parser would convert into an i18n marker. */
export function validateIcuCaseHtml(value: string): void {
  if (value.includes('\0')) {
    throwInvalidI18nStructure(ngDevMode && 'Invalid null character in an i18n ICU case.');
  }
  if (/<!--�\d+�-->/.test(value)) {
    throwInvalidI18nStructure(ngDevMode && 'Invalid nested i18n ICU reference.');
  }
  for (const match of value.matchAll(/&#(?:[xX]([\da-fA-F]+)|(\d+));?/g)) {
    const isHex = match[1] !== undefined;
    const codePoint = Number.parseInt(isHex ? match[1] : match[2], isHex ? 16 : 10);
    if (
      codePoint === 0 ||
      codePoint === 0xfffd ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff) ||
      codePoint > 0x10ffff
    ) {
      throwInvalidI18nStructure(
        ngDevMode && 'Invalid numeric character reference in an i18n ICU case.',
      );
    }
  }
}

/**
 * Retrieve `TIcu` at a given `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be read from.
 */
export function getTIcu(tView: TView, index: number): TIcu | null {
  const value = tView.data[index] as null | TIcu | TIcuContainerNode | string;
  if (value === null || typeof value === 'string') return null;
  if (
    ngDevMode &&
    !(Object.hasOwn(value, TVIEW) || Object.hasOwn(value, CURRENT_CASE_LVIEW_INDEX))
  ) {
    throwError("We expect to get 'null'|'TIcu'|'TIcuContainer', but got: " + value);
  }
  // Here the `Object.hasOwn(value, CURRENT_CASE_LVIEW_INDEX)` is a polymorphic read as it can be
  // either TIcu or TIcuContainerNode. This is not ideal, but we still think it is OK because it
  // will be just two cases which fits into the browser inline cache (inline cache can take up to
  // 4)
  const tIcu = Object.hasOwn(value, CURRENT_CASE_LVIEW_INDEX)
    ? (value as TIcu)
    : (value as TIcuContainerNode).value;
  ngDevMode && assertTIcu(tIcu);
  return tIcu;
}

/**
 * Store `TIcu` at a give `index`.
 *
 * The `TIcu` can be stored either directly (if it is nested ICU) OR
 * it is stored inside tho `TIcuContainer` if it is top level ICU.
 *
 * The reason for this is that the top level ICU need a `TNode` so that they are part of the render
 * tree, but nested ICU's have no TNode, because we don't know ahead of time if the nested ICU is
 * expressed (parent ICU may have selected a case which does not contain it.)
 *
 * @param tView Current `TView`.
 * @param index Index where the value should be stored at in `Tview.data`
 * @param tIcu The TIcu to store.
 */
export function setTIcu(tView: TView, index: number, tIcu: TIcu): void {
  const tNode = tView.data[index] as null | TIcuContainerNode;
  ngDevMode &&
    assertEqual(
      tNode === null || Object.hasOwn(tNode, TVIEW),
      true,
      "We expect to get 'null'|'TIcuContainer'",
    );
  if (tNode === null) {
    tView.data[index] = tIcu;
  } else {
    ngDevMode && assertTNodeType(tNode, TNodeType.Icu);
    tNode.value = tIcu;
  }
}

/**
 * Set `TNode.insertBeforeIndex` taking the `Array` into account.
 *
 * See `TNode.insertBeforeIndex`
 */
export function setTNodeInsertBeforeIndex(tNode: TNode, index: number) {
  ngDevMode && assertTNode(tNode);
  let insertBeforeIndex = tNode.insertBeforeIndex;
  if (insertBeforeIndex === null) {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    insertBeforeIndex = tNode.insertBeforeIndex = [
      null! /* may be updated to number later */,
      index,
    ];
  } else {
    assertEqual(Array.isArray(insertBeforeIndex), true, 'Expecting array here');
    (insertBeforeIndex as number[]).push(index);
  }
}

/**
 * Create `TNode.type=TNodeType.Placeholder` node.
 *
 * See `TNodeType.Placeholder` for more information.
 */
export function createTNodePlaceholder(
  tView: TView,
  previousTNodes: TNode[],
  index: number,
): TNode {
  const existing = tView.data[index];
  if (
    !Number.isSafeInteger(index) ||
    index < HEADER_OFFSET ||
    index >= tView.bindingStartIndex ||
    existing !== null
  ) {
    throwInvalidI18nStructure(ngDevMode && 'An i18n placeholder targets an invalid source node.');
  }
  const tNode = createTNodeAtIndex(tView, index, TNodeType.Placeholder, null, null);
  addTNodeAndUpdateInsertBeforeIndex(previousTNodes, tNode);
  return tNode;
}

/**
 * Returns current ICU case.
 *
 * ICU cases are stored as index into the `TIcu.cases`.
 * At times it is necessary to communicate that the ICU case just switched and that next ICU update
 * should update all bindings regardless of the mask. In such a case the we store negative numbers
 * for cases which have just been switched. This function removes the negative flag.
 */
export function getCurrentICUCaseIndex(tIcu: TIcu, lView: LView) {
  const currentCase: number | null = lView[tIcu.currentCaseLViewIndex];
  return currentCase === null ? currentCase : currentCase < 0 ? ~currentCase : currentCase;
}

export function getParentFromIcuCreateOpCode(mergedCode: number): number {
  return mergedCode >>> IcuCreateOpCode.SHIFT_PARENT;
}

export function getRefFromIcuCreateOpCode(mergedCode: number): number {
  return (mergedCode & IcuCreateOpCode.MASK_REF) >>> IcuCreateOpCode.SHIFT_REF;
}

export function getInstructionFromIcuCreateOpCode(mergedCode: number): number {
  return mergedCode & IcuCreateOpCode.MASK_INSTRUCTION;
}

export function icuCreateOpCode(opCode: IcuCreateOpCode, parentIdx: number, refIdx: number) {
  ngDevMode && assertGreaterThanOrEqual(parentIdx, 0, 'Missing parent index');
  ngDevMode && assertGreaterThan(refIdx, 0, 'Missing ref index');
  return (
    opCode | (parentIdx << IcuCreateOpCode.SHIFT_PARENT) | (refIdx << IcuCreateOpCode.SHIFT_REF)
  );
}

// Returns whether the given value corresponds to a root template message,
// or a sub-template.
export function isRootTemplateMessage(subTemplateIndex: number): subTemplateIndex is -1 {
  return subTemplateIndex === -1;
}
