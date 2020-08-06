/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getPluralCase} from '../../i18n/localization';
import {assertDefined, assertEqual, assertIndexInRange} from '../../util/assert';
import {attachPatchData} from '../context_discovery';
import {elementAttributeInternal, elementPropertyInternal, getOrCreateTNode, textBindingInternal} from '../instructions/shared';
import {LContainer, NATIVE} from '../interfaces/container';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nMutateOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, IcuType, TI18n, TIcu} from '../interfaces/i18n';
import {TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeType, TProjectionNode} from '../interfaces/node';
import {RComment, RElement, RText} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isLContainer} from '../interfaces/type_checks';
import {HEADER_OFFSET, LView, RENDERER, T_HOST, TView} from '../interfaces/view';
import {appendChild, applyProjection, createTextNode, nativeRemoveNode} from '../node_manipulation';
import {getBindingIndex, getLView, getPreviousOrParentTNode, getTView, setIsNotParent, setPreviousOrParentTNode} from '../state';
import {renderStringify} from '../util/misc_utils';
import {getNativeByIndex, getNativeByTNode, getTNode, load} from '../util/view_utils';
import {getLocaleId} from './i18n_locale_id';


const i18nIndexStack: number[] = [];
let i18nIndexStackPointer = -1;

function popI18nIndex() {
  return i18nIndexStack[i18nIndexStackPointer--];
}

export function pushI18nIndex(index: number) {
  i18nIndexStack[++i18nIndexStackPointer] = index;
}

let changeMask = 0b0;
let shiftsCounter = 0;

export function setMaskBit(bit: boolean) {
  if (bit) {
    changeMask = changeMask | (1 << shiftsCounter);
  }
  shiftsCounter++;
}

export function applyI18n(tView: TView, lView: LView, index: number) {
  if (shiftsCounter > 0) {
    ngDevMode && assertDefined(tView, `tView should be defined`);
    const tI18n = tView.data[index + HEADER_OFFSET] as TI18n | I18nUpdateOpCodes;
    let updateOpCodes: I18nUpdateOpCodes;
    let tIcus: TIcu[]|null = null;
    if (Array.isArray(tI18n)) {
      updateOpCodes = tI18n as I18nUpdateOpCodes;
    } else {
      updateOpCodes = (tI18n as TI18n).update;
      tIcus = (tI18n as TI18n).icus;
    }
    const bindingsStartIndex = getBindingIndex() - shiftsCounter - 1;
    applyUpdateOpCodes(tView, tIcus, lView, updateOpCodes, bindingsStartIndex, changeMask);

    // Reset changeMask & maskBit to default for the next update cycle
    changeMask = 0b0;
    shiftsCounter = 0;
  }
}

/**
 * Apply `I18nMutateOpCodes` OpCodes.
 *
 * @param tView Current `TView`
 * @param rootIndex Pointer to the root (parent) tNode for the i18n.
 * @param createOpCodes OpCodes to process
 * @param lView Current `LView`
 */
export function applyCreateOpCodes(
    tView: TView, rootindex: number, createOpCodes: I18nMutateOpCodes, lView: LView): number[] {
  const renderer = lView[RENDERER];
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
          createDynamicNodeAtIndex(tView, lView, textNodeIndex, TNodeType.Element, textRNode, null);
      visitedNodes.push(textNodeIndex);
      setIsNotParent();
    } else if (typeof opCode == 'number') {
      switch (opCode & I18nMutateOpCode.MASK_INSTRUCTION) {
        case I18nMutateOpCode.AppendChild:
          const destinationNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_PARENT;
          let destinationTNode: TNode;
          if (destinationNodeIndex === rootindex) {
            // If the destination node is `i18nStart`, we don't have a
            // top-level node and we should use the host node instead
            destinationTNode = lView[T_HOST]!;
          } else {
            destinationTNode = getTNode(tView, destinationNodeIndex);
          }
          ngDevMode &&
              assertDefined(
                  currentTNode!,
                  `You need to create or select a node before you can insert it into the DOM`);
          previousTNode =
              appendI18nNode(tView, currentTNode!, destinationTNode, previousTNode, lView);
          break;
        case I18nMutateOpCode.Select:
          // Negative indices indicate that a given TNode is a sibling node, not a parent node
          // (see `i18nStartFirstPass` for additional information).
          const isParent = opCode >= 0;
          // FIXME(misko): This SHIFT_REF looks suspect as it does not have mask.
          const nodeIndex = (isParent ? opCode : ~opCode) >>> I18nMutateOpCode.SHIFT_REF;
          visitedNodes.push(nodeIndex);
          previousTNode = currentTNode;
          currentTNode = getTNode(tView, nodeIndex);
          if (currentTNode) {
            setPreviousOrParentTNode(currentTNode, isParent);
          }
          break;
        case I18nMutateOpCode.ElementEnd:
          const elementIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          previousTNode = currentTNode = getTNode(tView, elementIndex);
          setPreviousOrParentTNode(currentTNode, false);
          break;
        case I18nMutateOpCode.Attr:
          const elementNodeIndex = opCode >>> I18nMutateOpCode.SHIFT_REF;
          const attrName = createOpCodes[++i] as string;
          const attrValue = createOpCodes[++i] as string;
          // This code is used for ICU expressions only, since we don't support
          // directives/components in ICUs, we don't need to worry about inputs here
          elementAttributeInternal(
              getTNode(tView, elementNodeIndex), lView, attrName, attrValue, null, null);
          break;
        default:
          throw new Error(`Unable to determine the type of mutate operation for "${opCode}"`);
      }
    } else {
      switch (opCode) {
        case COMMENT_MARKER:
          const commentValue = createOpCodes[++i] as string;
          const commentNodeIndex = createOpCodes[++i] as number;
          ngDevMode &&
              assertEqual(
                  typeof commentValue, 'string',
                  `Expected "${commentValue}" to be a comment node value`);
          const commentRNode = renderer.createComment(commentValue);
          ngDevMode && ngDevMode.rendererCreateComment++;
          previousTNode = currentTNode;
          currentTNode = createDynamicNodeAtIndex(
              tView, lView, commentNodeIndex, TNodeType.IcuContainer, commentRNode, null);
          visitedNodes.push(commentNodeIndex);
          attachPatchData(commentRNode, lView);
          // We will add the case nodes later, during the update phase
          setIsNotParent();
          break;
        case ELEMENT_MARKER:
          const tagNameValue = createOpCodes[++i] as string;
          const elementNodeIndex = createOpCodes[++i] as number;
          ngDevMode &&
              assertEqual(
                  typeof tagNameValue, 'string',
                  `Expected "${tagNameValue}" to be an element node tag name`);
          const elementRNode = renderer.createElement(tagNameValue);
          ngDevMode && ngDevMode.rendererCreateElement++;
          previousTNode = currentTNode;
          currentTNode = createDynamicNodeAtIndex(
              tView, lView, elementNodeIndex, TNodeType.Element, elementRNode, tagNameValue);
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


/**
 * Apply `I18nUpdateOpCodes` OpCodes
 *
 * @param tView Current `TView`
 * @param tIcus If ICUs present than this contains them.
 * @param lView Current `LView`
 * @param updateOpCodes OpCodes to process
 * @param bindingsStartIndex Location of the first `ɵɵi18nApply`
 * @param changeMask Each bit corresponds to a `ɵɵi18nExp` (Counting backwards from
 *     `bindingsStartIndex`)
 */
export function applyUpdateOpCodes(
    tView: TView, tIcus: TIcu[]|null, lView: LView, updateOpCodes: I18nUpdateOpCodes,
    bindingsStartIndex: number, changeMask: number) {
  let caseCreated = false;
  for (let i = 0; i < updateOpCodes.length; i++) {
    // bit code to check if we should apply the next update
    const checkBit = updateOpCodes[i] as number;
    // Number of opCodes to skip until next set of update codes
    const skipCodes = updateOpCodes[++i] as number;
    if (checkBit & changeMask) {
      // The value has been updated since last checked
      let value = '';
      for (let j = i + 1; j <= (i + skipCodes); j++) {
        const opCode = updateOpCodes[j];
        if (typeof opCode == 'string') {
          value += opCode;
        } else if (typeof opCode == 'number') {
          if (opCode < 0) {
            // Negative opCode represent `i18nExp` values offset.
            value += renderStringify(lView[bindingsStartIndex - opCode]);
          } else {
            const nodeIndex = opCode >>> I18nUpdateOpCode.SHIFT_REF;
            switch (opCode & I18nUpdateOpCode.MASK_OPCODE) {
              case I18nUpdateOpCode.Attr:
                const propName = updateOpCodes[++j] as string;
                const sanitizeFn = updateOpCodes[++j] as SanitizerFn | null;
                elementPropertyInternal(
                    tView, getTNode(tView, nodeIndex), lView, propName, value, lView[RENDERER],
                    sanitizeFn, false);
                break;
              case I18nUpdateOpCode.Text:
                textBindingInternal(lView, nodeIndex, value);
                break;
              case I18nUpdateOpCode.IcuSwitch:
                caseCreated =
                    applyIcuSwitchCase(tView, tIcus!, updateOpCodes[++j] as number, lView, value);
                break;
              case I18nUpdateOpCode.IcuUpdate:
                applyIcuUpdateCase(
                    tView, tIcus!, updateOpCodes[++j] as number, bindingsStartIndex, lView,
                    caseCreated);
                break;
            }
          }
        }
      }
    }
    i += skipCodes;
  }
}

/**
 * Apply OpCodes associated with updating an existing ICU.
 *
 * @param tView Current `TView`
 * @param tIcus ICUs active at this location.
 * @param tIcuIndex Index into `tIcus` to process.
 * @param bindingsStartIndex Location of the first `ɵɵi18nApply`
 * @param lView Current `LView`
 * @param changeMask Each bit corresponds to a `ɵɵi18nExp` (Counting backwards from
 *     `bindingsStartIndex`)
 */
function applyIcuUpdateCase(
    tView: TView, tIcus: TIcu[], tIcuIndex: number, bindingsStartIndex: number, lView: LView,
    caseCreated: boolean) {
  ngDevMode && assertIndexInRange(tIcus, tIcuIndex);
  const tIcu = tIcus[tIcuIndex];
  ngDevMode && assertIndexInRange(lView, tIcu.currentCaseLViewIndex);
  const activeCaseIndex = lView[tIcu.currentCaseLViewIndex];
  if (activeCaseIndex !== null) {
    const mask = caseCreated ?
        -1 :  // -1 is same as all bits on, which simulates creation since it marks all bits dirty
        changeMask;
    applyUpdateOpCodes(tView, tIcus, lView, tIcu.update[activeCaseIndex], bindingsStartIndex, mask);
  }
}

/**
 * Apply OpCodes associated with switching a case on ICU.
 *
 * This involves tearing down existing case and than building up a new case.
 *
 * @param tView Current `TView`
 * @param tIcus ICUs active at this location.
 * @param tICuIndex Index into `tIcus` to process.
 * @param lView Current `LView`
 * @param value Value of the case to update to.
 * @returns true if a new case was created (needed so that the update executes regardless of the
 *     bitmask)
 */
function applyIcuSwitchCase(
    tView: TView, tIcus: TIcu[], tICuIndex: number, lView: LView, value: string): boolean {
  applyIcuSwitchCaseRemove(tView, tIcus, tICuIndex, lView);

  // Rebuild a new case for this ICU
  let caseCreated = false;
  const tIcu = tIcus[tICuIndex];
  const caseIndex = getCaseIndex(tIcu, value);
  lView[tIcu.currentCaseLViewIndex] = caseIndex !== -1 ? caseIndex : null;
  if (caseIndex > -1) {
    // Add the nodes for the new case
    applyCreateOpCodes(
        tView, -1,  // -1 means we don't have parent node
        tIcu.create[caseIndex], lView);
    caseCreated = true;
  }
  return caseCreated;
}

/**
 * Apply OpCodes associated with tearing down of DOM.
 *
 * This involves tearing down existing case and than building up a new case.
 *
 * @param tView Current `TView`
 * @param tIcus ICUs active at this location.
 * @param tIcuIndex Index into `tIcus` to process.
 * @param lView Current `LView`
 * @returns true if a new case was created (needed so that the update executes regardless of the
 *     bitmask)
 */
function applyIcuSwitchCaseRemove(tView: TView, tIcus: TIcu[], tIcuIndex: number, lView: LView) {
  ngDevMode && assertIndexInRange(tIcus, tIcuIndex);
  const tIcu = tIcus[tIcuIndex];
  const activeCaseIndex = lView[tIcu.currentCaseLViewIndex];
  if (activeCaseIndex !== null) {
    const removeCodes = tIcu.remove[activeCaseIndex];
    for (let k = 0; k < removeCodes.length; k++) {
      const removeOpCode = removeCodes[k] as number;
      const nodeOrIcuIndex = removeOpCode >>> I18nMutateOpCode.SHIFT_REF;
      switch (removeOpCode & I18nMutateOpCode.MASK_INSTRUCTION) {
        case I18nMutateOpCode.Remove:
          // FIXME(misko): this comment is wrong!
          // Remove DOM element, but do *not* mark TNode as detached, since we are
          // just switching ICU cases (while keeping the same TNode), so a DOM element
          // representing a new ICU case will be re-created.
          removeNode(tView, lView, nodeOrIcuIndex, /* markAsDetached */ false);
          break;
        case I18nMutateOpCode.RemoveNestedIcu:
          applyIcuSwitchCaseRemove(tView, tIcus, nodeOrIcuIndex, lView);
          break;
      }
    }
  }
}

function appendI18nNode(
    tView: TView, tNode: TNode, parentTNode: TNode, previousTNode: TNode|null,
    lView: LView): TNode {
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

  if (parentTNode !== lView[T_HOST]) {
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
    applyProjection(tView, lView, tNode as TProjectionNode);
    return tNode;
  }

  appendChild(tView, lView, getNativeByTNode(tNode, lView), tNode);

  const slotValue = lView[tNode.index];
  if (tNode.type !== TNodeType.Container && isLContainer(slotValue)) {
    // Nodes that inject ViewContainerRef also have a comment node that should be moved
    appendChild(tView, lView, slotValue[NATIVE], tNode);
  }
  return tNode;
}

/**
 * See `i18nEnd` above.
 */
export function i18nEndFirstPass(tView: TView, lView: LView) {
  ngDevMode &&
      assertEqual(
          getBindingIndex(), tView.bindingStartIndex,
          'i18nEnd should be called before any binding');

  const rootIndex = popI18nIndex();
  const tI18n = tView.data[rootIndex + HEADER_OFFSET] as TI18n;
  ngDevMode && assertDefined(tI18n, `You should call i18nStart before i18nEnd`);

  // Find the last node that was added before `i18nEnd`
  const lastCreatedNode = getPreviousOrParentTNode();

  // Read the instructions to insert/move/remove DOM elements
  const visitedNodes = applyCreateOpCodes(tView, rootIndex, tI18n.create, lView);

  // Remove deleted nodes
  let index = rootIndex + 1;
  while (index <= lastCreatedNode.index - HEADER_OFFSET) {
    if (visitedNodes.indexOf(index) === -1) {
      removeNode(tView, lView, index, /* markAsDetached */ true);
    }
    // Check if an element has any local refs and skip them
    const tNode = getTNode(tView, index);
    if (tNode &&
        (tNode.type === TNodeType.Container || tNode.type === TNodeType.Element ||
         tNode.type === TNodeType.ElementContainer) &&
        tNode.localNames !== null) {
      // Divide by 2 to get the number of local refs,
      // since they are stored as an array that also includes directive indexes,
      // i.e. ["localRef", directiveIndex, ...]
      index += tNode.localNames.length >> 1;
    }
    index++;
  }
}

function removeNode(tView: TView, lView: LView, index: number, markAsDetached: boolean) {
  const removedPhTNode = getTNode(tView, index);
  const removedPhRNode = getNativeByIndex(index, lView);
  if (removedPhRNode) {
    nativeRemoveNode(lView[RENDERER], removedPhRNode);
  }

  const slotValue = load(lView, index) as RElement | RComment | LContainer;
  if (isLContainer(slotValue)) {
    const lContainer = slotValue as LContainer;
    if (removedPhTNode.type !== TNodeType.Container) {
      nativeRemoveNode(lView[RENDERER], lContainer[NATIVE]);
    }
  }

  if (markAsDetached) {
    // Define this node as detached to avoid projecting it later
    removedPhTNode.flags |= TNodeFlags.isDetached;
  }
  ngDevMode && ngDevMode.rendererRemoveNode++;
}

/**
 * Creates and stores the dynamic TNode, and unhooks it from the tree for now.
 */
function createDynamicNodeAtIndex(
    tView: TView, lView: LView, index: number, type: TNodeType, native: RElement|RText|null,
    name: string|null): TElementNode|TIcuContainerNode {
  const previousOrParentTNode = getPreviousOrParentTNode();
  ngDevMode && assertIndexInRange(lView, index + HEADER_OFFSET);
  lView[index + HEADER_OFFSET] = native;
  // FIXME(misko): Why does this create A TNode??? I would not expect this to be here.
  const tNode = getOrCreateTNode(tView, lView[T_HOST], index, type as any, name, null);

  // We are creating a dynamic node, the previous tNode might not be pointing at this node.
  // We will link ourselves into the tree later with `appendI18nNode`.
  if (previousOrParentTNode && previousOrParentTNode.next === tNode) {
    previousOrParentTNode.next = null;
  }

  return tNode;
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
