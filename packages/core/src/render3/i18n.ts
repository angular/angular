/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual, assertLessThan} from './assert';
import {NO_CHANGE, _getViewData, adjustBlueprintForNewNode, bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, createNodeAtIndex, getRenderer, getTNode, load, loadElement, resetComponentState} from './instructions';
import {RENDER_PARENT} from './interfaces/container';
import {LContainerNode, LNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {BINDING_INDEX, HEADER_OFFSET, HOST_NODE, TVIEW} from './interfaces/view';
import {appendChild, createTextNode, removeChild} from './node_manipulation';
import {stringify} from './util';

/**
 * A list of flags to encode the i18n instructions used to translate the template.
 * We shift the flags by 29 so that 30 & 31 & 32 bits contains the instructions.
 */
export const enum I18nInstructions {
  Text = 1 << 29,
  Element = 2 << 29,
  Expression = 3 << 29,
  TemplateRoot = 4 << 29,
  Any = 5 << 29,
  CloseNode = 6 << 29,
  RemoveNode = 7 << 29,
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
const i18nTagRegex = /{\$([^}]+)}/g;

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
 * @param templateRoots An array of template roots whose content should be ignored when
 * generating the instructions for their parent template.
 * @param lastChildIndex The index of the last child of the i18n node. Used when the i18n block is
 * an ng-container.
 *
 * @returns A list of instructions used to translate each template.
 */
export function i18nMapping(
    translation: string, elements: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, templateRoots?: string[] | null,
    lastChildIndex?: number | null): I18nInstruction[][] {
  const translationParts = translation.split(i18nTagRegex);
  const nbTemplates = templateRoots ? templateRoots.length + 1 : 1;
  const instructions: I18nInstruction[][] = (new Array(nbTemplates)).fill(undefined);

  generateMappingInstructions(
      0, 0, translationParts, instructions, elements, expressions, templateRoots, lastChildIndex);

  return instructions;
}

/**
 * Internal function that reads the translation parts and generates a set of instructions for each
 * template.
 *
 * See `i18nMapping()` for more details.
 *
 * @param tmplIndex The order of appearance of the template.
 * 0 for the root template, following indexes match the order in `templateRoots`.
 * @param partIndex The current index in `translationParts`.
 * @param translationParts The translation string split into an array of placeholders and text
 * elements.
 * @param instructions The current list of instructions to update.
 * @param elements An array containing, for each template, the maps of element placeholders and
 * their indexes.
 * @param expressions An array containing, for each template, the maps of expression placeholders
 * and their indexes.
 * @param templateRoots An array of template roots whose content should be ignored when
 * generating the instructions for their parent template.
 * @param lastChildIndex The index of the last child of the i18n node. Used when the i18n block is
 * an ng-container.
 *
 * @returns the current index in `translationParts`
 */
function generateMappingInstructions(
    tmplIndex: number, partIndex: number, translationParts: string[],
    instructions: I18nInstruction[][], elements: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, templateRoots?: string[] | null,
    lastChildIndex?: number | null): number {
  const tmplInstructions: I18nInstruction[] = [];
  const phVisited: string[] = [];
  let openedTagCount = 0;
  let maxIndex = 0;
  let currentElements: PlaceholderMap|null =
      elements && elements[tmplIndex] ? elements[tmplIndex] : null;
  let currentExpressions: PlaceholderMap|null =
      expressions && expressions[tmplIndex] ? expressions[tmplIndex] : null;

  instructions[tmplIndex] = tmplInstructions;

  for (; partIndex < translationParts.length; partIndex++) {
    // The value can either be text or the name of a placeholder (element/template root/expression)
    const value = translationParts[partIndex];

    // Odd indexes are placeholders
    if (partIndex & 1) {
      let phIndex;
      if (currentElements && currentElements[value] !== undefined) {
        phIndex = currentElements[value];
        // The placeholder represents a DOM element, add an instruction to move it
        let templateRootIndex = templateRoots ? templateRoots.indexOf(value) : -1;
        if (templateRootIndex !== -1 && (templateRootIndex + 1) !== tmplIndex) {
          // This is a template root, it has no closing tag, not treating it as an element
          tmplInstructions.push(phIndex | I18nInstructions.TemplateRoot);
        } else {
          tmplInstructions.push(phIndex | I18nInstructions.Element);
          openedTagCount++;
        }
        phVisited.push(value);
      } else if (currentExpressions && currentExpressions[value] !== undefined) {
        phIndex = currentExpressions[value];
        // The placeholder represents an expression, add an instruction to move it
        tmplInstructions.push(phIndex | I18nInstructions.Expression);
        phVisited.push(value);
      } else {
        // It is a closing tag
        tmplInstructions.push(I18nInstructions.CloseNode);

        if (tmplIndex > 0) {
          openedTagCount--;

          // If we have reached the closing tag for this template, exit the loop
          if (openedTagCount === 0) {
            break;
          }
        }
      }

      if (phIndex !== undefined && phIndex > maxIndex) {
        maxIndex = phIndex;
      }

      if (templateRoots) {
        const newTmplIndex = templateRoots.indexOf(value) + 1;
        if (newTmplIndex !== 0 && newTmplIndex !== tmplIndex) {
          partIndex = generateMappingInstructions(
              newTmplIndex, partIndex, translationParts, instructions, elements, expressions,
              templateRoots, lastChildIndex);
        }
      }

    } else if (value) {
      // It's a non-empty string, create a text node
      tmplInstructions.push(I18nInstructions.Text, value);
    }
  }

  // Add instructions to remove elements that are not used in the translation
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

  // Add instructions to remove expressions that are not used in the translation
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
      tmplInstructions.push(i | I18nInstructions.Any);
    }
  }

  return partIndex;
}

// TODO: Remove LNode arg when we remove dynamicContainerNode
function appendI18nNode(
    node: LNode, tNode: TNode, parentTNode: TNode, previousTNode: TNode): TNode {
  if (ngDevMode) {
    ngDevMode.rendererMoveNode++;
  }

  const viewData = _getViewData();

  // On first pass, re-organize node tree to put this node in the correct position.
  const firstTemplatePass = viewData[TVIEW].firstTemplatePass;
  if (firstTemplatePass) {
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
  }

  appendChild(node.native, tNode, viewData);

  // Template containers also have a comment node for the `ViewContainerRef` that should be moved
  if (tNode.type === TNodeType.Container && node.dynamicLContainerNode) {
    appendChild(node.dynamicLContainerNode.native, tNode, viewData);
    return tNode.dynamicContainerNode !;
  }

  return tNode;
}

/**
 * Takes a list of instructions generated by `i18nMapping()` to transform the template accordingly.
 *
 * @param startIndex Index of the first element to translate (for instance the first child of the
 * element with the i18n attribute).
 * @param instructions The list of instructions to apply on the current view.
 */
export function i18nApply(startIndex: number, instructions: I18nInstruction[]): void {
  const viewData = _getViewData();
  if (ngDevMode) {
    assertEqual(
        viewData[BINDING_INDEX], viewData[TVIEW].bindingStartIndex,
        'i18nApply should be called before any binding');
  }

  if (!instructions) {
    return;
  }

  const renderer = getRenderer();
  const startTNode = getTNode(startIndex);
  let localParentTNode: TNode = startTNode.parent || viewData[HOST_NODE] !;
  let localPreviousTNode: TNode = localParentTNode;
  resetComponentState();  // We don't want to add to the tree with the wrong previous node

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i] as number;
    switch (instruction & I18nInstructions.InstructionMask) {
      case I18nInstructions.Element:
        const elementIndex = instruction & I18nInstructions.IndexMask;
        const element: LNode = load(elementIndex);
        const elementTNode = getTNode(elementIndex);
        localPreviousTNode =
            appendI18nNode(element, elementTNode, localParentTNode, localPreviousTNode);
        localParentTNode = elementTNode;
        break;
      case I18nInstructions.Expression:
      case I18nInstructions.TemplateRoot:
      case I18nInstructions.Any:
        const nodeIndex = instruction & I18nInstructions.IndexMask;
        const node: LNode = load(nodeIndex);
        localPreviousTNode =
            appendI18nNode(node, getTNode(nodeIndex), localParentTNode, localPreviousTNode);
        break;
      case I18nInstructions.Text:
        if (ngDevMode) {
          ngDevMode.rendererCreateTextNode++;
        }
        const value = instructions[++i];
        const textRNode = createTextNode(value, renderer);
        // If we were to only create a `RNode` then projections won't move the text.
        // Create text node at the current end of viewData. Must subtract header offset because
        // createNodeAtIndex takes a raw index (not adjusted by header offset).
        adjustBlueprintForNewNode(viewData);
        const lastNodeIndex = viewData.length - 1 - HEADER_OFFSET;
        const textTNode =
            createNodeAtIndex(lastNodeIndex, TNodeType.Element, textRNode, null, null);
        localPreviousTNode = appendI18nNode(
            loadElement(lastNodeIndex), textTNode, localParentTNode, localPreviousTNode);
        resetComponentState();
        break;
      case I18nInstructions.CloseNode:
        localPreviousTNode = localParentTNode;
        localParentTNode = localParentTNode.parent || viewData[HOST_NODE] !;
        break;
      case I18nInstructions.RemoveNode:
        if (ngDevMode) {
          ngDevMode.rendererRemoveNode++;
        }
        const removeIndex = instruction & I18nInstructions.IndexMask;
        const removedNode: LNode|LContainerNode = load(removeIndex);
        const removedTNode = getTNode(removeIndex);
        removeChild(removedTNode, removedNode.native || null, viewData);

        // For template containers we also need to remove their `ViewContainerRef` from the DOM
        if (removedTNode.type === TNodeType.Container && removedNode.dynamicLContainerNode) {
          removeChild(removedTNode, removedNode.dynamicLContainerNode.native || null, viewData);
          removedTNode.dynamicContainerNode !.detached = true;
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
 * Checks if the value of an expression has changed and replaces it by its value in a translation,
 * or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation1(instructions: I18nExpInstruction[], v0: any): string|NO_CHANGE {
  const different = bindingUpdated(_getViewData()[BINDING_INDEX]++, v0);

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      res += stringify(v0);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 2 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation2(instructions: I18nExpInstruction[], v0: any, v1: any): string|
    NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated2(viewData[BINDING_INDEX], v0, v1);
  viewData[BINDING_INDEX] += 2;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b1 ? v1 : v0;

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 3 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation3(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any): string|NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated3(viewData[BINDING_INDEX], v0, v1, v2);
  viewData[BINDING_INDEX] += 3;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b2 ? v2 : (b1 ? v1 : v0);

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 4 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation4(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any, v3: any): string|NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  viewData[BINDING_INDEX] += 4;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b2 ? (b1 ? v3 : v2) : (b1 ? v1 : v0);

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 5 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation5(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any, v3: any, v4: any): string|
    NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated(viewData[BINDING_INDEX] + 4, v4) || different;
  viewData[BINDING_INDEX] += 5;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b4 = idx & 4;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b4 ? v4 : (b2 ? (b1 ? v3 : v2) : (b1 ? v1 : v0));

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 6 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 * @param v5 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */ export function
i18nInterpolation6(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any, v3: any, v4: any, v5: any):
    string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated2(viewData[BINDING_INDEX] + 4, v4, v5) || different;
  viewData[BINDING_INDEX] += 6;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b4 = idx & 4;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b4 ? (b1 ? v5 : v4) : (b2 ? (b1 ? v3 : v2) : (b1 ? v1 : v0));

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 7 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 * @param v5 value checked for change.
 * @param v6 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation7(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any, v3: any, v4: any, v5: any,
    v6: any): string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated3(viewData[BINDING_INDEX] + 4, v4, v5, v6) || different;
  viewData[BINDING_INDEX] += 7;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b4 = idx & 4;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value = b4 ? (b2 ? v6 : (b1 ? v5 : v4)) : (b2 ? (b1 ? v3 : v2) : (b1 ? v1 : v0));

      res += stringify(value);
    } else {
      res += instructions[i];
    }
  }

  return res;
}

/**
 * Checks if the values of up to 8 expressions have changed and replaces them by their values in a
 * translation, or returns NO_CHANGE.
 *
 * @param instructions A list of instructions that will be used to translate an attribute.
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 * @param v5 value checked for change.
 * @param v6 value checked for change.
 * @param v7 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation8(
    instructions: I18nExpInstruction[], v0: any, v1: any, v2: any, v3: any, v4: any, v5: any,
    v6: any, v7: any): string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated4(viewData[BINDING_INDEX] + 4, v4, v5, v6, v7) || different;
  viewData[BINDING_INDEX] += 8;

  if (!different) {
    return NO_CHANGE;
  }

  let res = '';
  for (let i = 0; i < instructions.length; i++) {
    // Odd indexes are bindings
    if (i & 1) {
      // Extract bits
      const idx = instructions[i] as number;
      const b4 = idx & 4;
      const b2 = idx & 2;
      const b1 = idx & 1;
      // Get the value from the argument vx where x = idx
      const value =
          b4 ? (b2 ? (b1 ? v7 : v6) : (b1 ? v5 : v4)) : (b2 ? (b1 ? v3 : v2) : (b1 ? v1 : v0));

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
  const viewData = _getViewData();
  let different = false;
  for (let i = 0; i < values.length; i++) {
    // Check if bindings have changed
    bindingUpdated(viewData[BINDING_INDEX]++, values[i]) && (different = true);
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
