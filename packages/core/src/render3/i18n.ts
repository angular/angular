/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertLessThan} from './assert';
import {NO_CHANGE, bindingUpdated, createLNode, getPreviousOrParentNode, getRenderer, getViewData, load, resetApplicationState} from './instructions';
import {RENDER_PARENT} from './interfaces/container';
import {LContainerNode, LElementNode, LNode, TContainerNode, TNodeType} from './interfaces/node';
import {BINDING_INDEX, HEADER_OFFSET, TVIEW} from './interfaces/view';
import {appendChild, createTextNode, getParentLNode, removeChild} from './node_manipulation';
import {stringify} from './util';

/**
 * A list of flags to encode the i18n instructions used to translate the template.
 * We shift the flags by 29 so that 30 & 31 & 32 bits contains the instructions.
 */
export const enum I18nInstructions {
  Text = 1 << 29,
  Element = 2 << 29,
  Expression = 3 << 29,
  CloseNode = 4 << 29,
  RemoveNode = 5 << 29,
  /** Used to decode the number encoded with the instruction. */
  IndexMask = (1 << 29) - 1,
  /** Used to test the type of instruction. */
  InstructionMask = ~((1 << 29) - 1),
}

/**
 * Represents the instructions used to translate the template.
 * Instructions can be a placeholder index, a static text or a simple bit field (`I18nFlag`).
 * When the instruction is the flag `Text`, it is always followed by its text value.
 */
export type I18nInstruction = number | string;
/**
 * Represents the instructions used to translate attributes containing expressions.
 * Even indexes contain static strings, while odd indexes contain the index of the expression whose
 * value will be concatenated into the final translation.
 */
export type I18nExpInstruction = number | string;
/** Mapping of placeholder names to their absolute indexes in their templates. */
export type PlaceholderMap = {
  [name: string]: number
};
const i18nTagRegex = /\{\$([^}]+)\}/g;

/**
 * Takes a translation string, the initial list of placeholders (elements and expressions) and the
 * indexes of their corresponding expression nodes to return a list of instructions for each
 * template function.
 *
 * Because embedded templates have different indexes for each placeholder, each parameter (except
 * the translation) is an array, where each value corresponds to a different template, by order of
 * appearance.
 *
 * @param translation A translation string where placeholders are represented by `{$name}`
 * @param elements An array containing, for each template, the maps of element placeholders and
 * their indexes.
 * @param expressions An array containing, for each template, the maps of expression placeholders
 * and their indexes.
 * @param tmplContainers An array of template container placeholders whose content should be ignored
 * when generating the instructions for their parent template.
 * @param lastChildIndex The index of the last child of the i18n node. Used when the i18n block is
 * an ng-container.
 *
 * @returns A list of instructions used to translate each template.
 */
export function i18nMapping(
    translation: string, elements: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, tmplContainers?: string[] | null,
    lastChildIndex?: number | null): I18nInstruction[][] {
  const translationParts = translation.split(i18nTagRegex);
  const instructions: I18nInstruction[][] = [];

  generateMappingInstructions(
      0, translationParts, instructions, elements, expressions, tmplContainers, lastChildIndex);

  return instructions;
}

/**
 * Internal function that reads the translation parts and generates a set of instructions for each
 * template.
 *
 * See `i18nMapping()` for more details.
 *
 * @param index The current index in `translationParts`.
 * @param translationParts The translation string split into an array of placeholders and text
 * elements.
 * @param instructions The current list of instructions to update.
 * @param elements An array containing, for each template, the maps of element placeholders and
 * their indexes.
 * @param expressions An array containing, for each template, the maps of expression placeholders
 * and their indexes.
 * @param tmplContainers An array of template container placeholders whose content should be ignored
 * when generating the instructions for their parent template.
 * @param lastChildIndex The index of the last child of the i18n node. Used when the i18n block is
 * an ng-container.
 * @returns the current index in `translationParts`
 */
function generateMappingInstructions(
    index: number, translationParts: string[], instructions: I18nInstruction[][],
    elements: (PlaceholderMap | null)[] | null, expressions?: (PlaceholderMap | null)[] | null,
    tmplContainers?: string[] | null, lastChildIndex?: number | null): number {
  const tmplIndex = instructions.length;
  const tmplInstructions: I18nInstruction[] = [];
  const phVisited = [];
  let openedTagCount = 0;
  let maxIndex = 0;

  instructions.push(tmplInstructions);

  for (; index < translationParts.length; index++) {
    const value = translationParts[index];

    // Odd indexes are placeholders
    if (index & 1) {
      let phIndex;

      if (elements && elements[tmplIndex] &&
          typeof(phIndex = elements[tmplIndex] ![value]) !== 'undefined') {
        // The placeholder represents a DOM element
        // Add an instruction to move the element
        tmplInstructions.push(phIndex | I18nInstructions.Element);
        phVisited.push(value);
        openedTagCount++;
      } else if (
          expressions && expressions[tmplIndex] &&
          typeof(phIndex = expressions[tmplIndex] ![value]) !== 'undefined') {
        // The placeholder represents an expression
        // Add an instruction to move the expression
        tmplInstructions.push(phIndex | I18nInstructions.Expression);
        phVisited.push(value);
      } else {  // It is a closing tag
        tmplInstructions.push(I18nInstructions.CloseNode);

        if (tmplIndex > 0) {
          openedTagCount--;

          // If we have reached the closing tag for this template, exit the loop
          if (openedTagCount === 0) {
            break;
          }
        }
      }

      if (typeof phIndex !== 'undefined' && phIndex > maxIndex) {
        maxIndex = phIndex;
      }

      if (tmplContainers && tmplContainers.indexOf(value) !== -1 &&
          tmplContainers.indexOf(value) >= tmplIndex) {
        index = generateMappingInstructions(
            index, translationParts, instructions, elements, expressions, tmplContainers,
            lastChildIndex);
      }

    } else if (value) {
      // It's a non-empty string, create a text node
      tmplInstructions.push(I18nInstructions.Text, value);
    }
  }

  // Check if some elements from the template are missing from the translation
  if (elements) {
    const tmplElements = elements[tmplIndex];

    if (tmplElements) {
      const phKeys = Object.keys(tmplElements);

      for (let i = 0; i < phKeys.length; i++) {
        const ph = phKeys[i];

        if (phVisited.indexOf(ph) === -1) {
          let index = tmplElements[ph];
          // Add an instruction to remove the element
          tmplInstructions.push(index | I18nInstructions.RemoveNode);

          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }
  }

  // Check if some expressions from the template are missing from the translation
  if (expressions) {
    const tmplExpressions = expressions[tmplIndex];

    if (tmplExpressions) {
      const phKeys = Object.keys(tmplExpressions);

      for (let i = 0; i < phKeys.length; i++) {
        const ph = phKeys[i];

        if (phVisited.indexOf(ph) === -1) {
          let index = tmplExpressions[ph];
          if (ngDevMode) {
            assertLessThan(
                index.toString(2).length, 28, `Index ${index} is too big and will overflow`);
          }
          // Add an instruction to remove the expression
          tmplInstructions.push(index | I18nInstructions.RemoveNode);

          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }
  }

  if (tmplIndex === 0 && typeof lastChildIndex === 'number') {
    // The current parent is an ng-container and it has more children after the translation that we
    // need to append to keep the order of the DOM nodes correct
    for (let i = maxIndex + 1; i <= lastChildIndex; i++) {
      if (ngDevMode) {
        assertLessThan(i.toString(2).length, 28, `Index ${i} is too big and will overflow`);
      }
      // We consider those additional placeholders as expressions because we don't care about
      // their children, all we need to do is to append them
      tmplInstructions.push(i | I18nInstructions.Expression);
    }
  }

  return index;
}

function appendI18nNode(node: LNode, parentNode: LNode, previousNode: LNode) {
  if (ngDevMode) {
    ngDevMode.rendererMoveNode++;
  }

  const viewData = getViewData();

  appendChild(parentNode, node.native || null, viewData);

  // On first pass, re-organize node tree to put this node in the correct position.
  const firstTemplatePass = node.view[TVIEW].firstTemplatePass;
  if (firstTemplatePass) {
    node.tNode.next = null;
    if (previousNode === parentNode && node.tNode !== parentNode.tNode.child) {
      node.tNode.next = parentNode.tNode.child;
      parentNode.tNode.child = node.tNode;
    } else if (previousNode !== parentNode && node.tNode !== previousNode.tNode.next) {
      node.tNode.next = previousNode.tNode.next;
      previousNode.tNode.next = node.tNode;
    }
  }

  // Template containers also have a comment node for the `ViewContainerRef` that should be moved
  if (node.tNode.type === TNodeType.Container && node.dynamicLContainerNode) {
    // (node.native as RComment).textContent = 'test';
    // console.log(node.native);
    appendChild(parentNode, node.dynamicLContainerNode.native || null, viewData);
    if (firstTemplatePass) {
      node.tNode.dynamicContainerNode = node.dynamicLContainerNode.tNode;
      node.dynamicLContainerNode.tNode.parent = node.tNode as TContainerNode;
    }
    return node.dynamicLContainerNode;
  }

  return node;
}

/**
 * Takes a list of instructions generated by `i18nMapping()` to transform the template accordingly.
 *
 * @param startIndex Index of the first element to translate (for instance the first child of the
 * element with the i18n attribute).
 * @param instructions The list of instructions to apply on the current view.
 */
export function i18nApply(startIndex: number, instructions: I18nInstruction[]): void {
  const viewData = getViewData();
  if (ngDevMode) {
    assertEqual(viewData[BINDING_INDEX], -1, 'i18nApply should be called before any binding');
  }

  if (!instructions) {
    return;
  }

  const renderer = getRenderer();
  let localParentNode: LNode = getParentLNode(load(startIndex)) || getPreviousOrParentNode();
  let localPreviousNode: LNode = localParentNode;
  resetApplicationState();  // We don't want to add to the tree with the wrong previous node

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i] as number;
    switch (instruction & I18nInstructions.InstructionMask) {
      case I18nInstructions.Element:
        const element: LNode = load(instruction & I18nInstructions.IndexMask);
        localPreviousNode = appendI18nNode(element, localParentNode, localPreviousNode);
        localParentNode = element;
        break;
      case I18nInstructions.Expression:
        const expr: LNode = load(instruction & I18nInstructions.IndexMask);
        localPreviousNode = appendI18nNode(expr, localParentNode, localPreviousNode);
        break;
      case I18nInstructions.Text:
        if (ngDevMode) {
          ngDevMode.rendererCreateTextNode++;
        }
        const value = instructions[++i];
        const textRNode = createTextNode(value, renderer);
        // If we were to only create a `RNode` then projections won't move the text.
        // Create text node at the current end of viewData. Must subtract header offset because
        // createLNode takes a raw index (not adjusted by header offset).
        const textLNode =
            createLNode(viewData.length - HEADER_OFFSET, TNodeType.Element, textRNode, null, null);
        localPreviousNode = appendI18nNode(textLNode, localParentNode, localPreviousNode);
        resetApplicationState();
        break;
      case I18nInstructions.CloseNode:
        localPreviousNode = localParentNode;
        localParentNode = getParentLNode(localParentNode) !;
        break;
      case I18nInstructions.RemoveNode:
        if (ngDevMode) {
          ngDevMode.rendererRemoveNode++;
        }
        const index = instruction & I18nInstructions.IndexMask;
        const removedNode: LNode|LContainerNode = load(index);
        const parentNode = getParentLNode(removedNode) !;
        removeChild(parentNode, removedNode.native || null, viewData);

        // For template containers we also need to remove their `ViewContainerRef` from the DOM
        if (removedNode.tNode.type === TNodeType.Container && removedNode.dynamicLContainerNode) {
          removeChild(parentNode, removedNode.dynamicLContainerNode.native || null, viewData);
          removedNode.dynamicLContainerNode.tNode.detached = true;
          removedNode.dynamicLContainerNode.data[RENDER_PARENT] = null;
        }
        break;
    }
  }
}

/**
 * Takes a translation string and the initial list of expressions and returns a list of instructions
 * that will be used to translate an attribute.
 * Even indexes contain static strings, while odd indexes contain the index of the expression whose
 * value will be concatenated into the final translation.
 */
export function i18nExpMapping(
    translation: string, placeholders: PlaceholderMap): I18nExpInstruction[] {
  const staticText: I18nExpInstruction[] = translation.split(i18nTagRegex);
  // odd indexes are placeholders
  for (let i = 1; i < staticText.length; i += 2) {
    staticText[i] = placeholders[staticText[i]];
  }
  return staticText;
}

/**
 * Checks if the value of up to 8 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation(
    instructions: I18nExpInstruction[], numberOfExp: number, v0: any, v1?: any, v2?: any, v3?: any,
    v4?: any, v5?: any, v6?: any, v7?: any): string|NO_CHANGE {
  let different = bindingUpdated(v0);

  if (numberOfExp > 1) {
    different = bindingUpdated(v1) || different;

    if (numberOfExp > 2) {
      different = bindingUpdated(v2) || different;

      if (numberOfExp > 3) {
        different = bindingUpdated(v3) || different;

        if (numberOfExp > 4) {
          different = bindingUpdated(v4) || different;

          if (numberOfExp > 5) {
            different = bindingUpdated(v5) || different;

            if (numberOfExp > 6) {
              different = bindingUpdated(v6) || different;

              if (numberOfExp > 7) {
                different = bindingUpdated(v7) || different;
              }
            }
          }
        }
      }
    }
  }

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    let value: any;
    // Odd indexes are placeholders
    if (i & 1) {
      switch (instructions[i]) {
        case 0:
          value = v0;
          break;
        case 1:
          value = v1;
          break;
        case 2:
          value = v2;
          break;
        case 3:
          value = v3;
          break;
        case 4:
          value = v4;
          break;
        case 5:
          value = v5;
          break;
        case 6:
          value = v6;
          break;
        case 7:
          value = v7;
          break;
      }

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Create a translated interpolation binding with a variable number of expressions.
 *
 * If there are 1 to 8 expressions then `i18nInterpolation()` should be used instead. It is faster
 * because there is no need to create an array of expressions and iterate over it.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolationV(instructions: I18nExpInstruction[], values: any[]): string|
    NO_CHANGE {
  let different = false;
  for (let i = 0; i < values.length; i++) {
    // Check if bindings have changed
    bindingUpdated(values[i]) && (different = true);
  }

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are placeholders
    if (i & 1) {
      res += stringify(values[instructions[i] as number]);
    } else {
      res += instructions[i];
    }
  }

  return res;
}
