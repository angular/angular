/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertEqual} from './assert';
import {NO_CHANGE, bindingUpdated} from './instructions';
import {stringify} from './util';

/**
 * A list of flags to encode the i18n instructions used to translate the template.
 * We shift the flags by 29 so that 30 & 31 & 32 bits contains the instructions.
 */
export const enum I18nFlags {
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
/** Mapping of placeholder names to their absolute index in the current view. */
export type PlaceholderMap = {
  [name: string]: number
};
export const tagRegex = /\{\$([^}]+)\}/g;

/**
 * A function to recursively generate the instructions for i18nMapping
 *
 * @param index The current index in msgList
 * @param msgList The translation string split into an array of placeholders and text elements
 * @param elements A map of element placeholders and their indexes
 * @param expressions A map of expression placeholders and their indexes
 * @param tmplContainers An array of template container placeholders whose content should be ignored
 * @param lastChildIndex The index of the last child of the i18n node.
 *
 * @returns the current index in msgList
 */
function generateInstructions(
    index: number, instructions: I18nInstruction[][], msgList: string[],
    elements: (PlaceholderMap | null)[] | null, expressions?: (PlaceholderMap | null)[] | null,
    tmplContainers?: string[] | null, lastChildIndex?: (number | null)[]): number {
  const tmplIndex = instructions.length;
  const tmplInstructions: I18nInstruction[] = [];
  const phAdded = [];
  let tagCounter = 0;
  let maxIndex = 0;

  instructions.push(tmplInstructions);

  for (; index < msgList.length; index++) {
    const value = msgList[index];

    // Odd indexes are placeholders
    if (index & 1) {
      let phIndex;

      if (elements && elements[tmplIndex] &&
          typeof(phIndex = elements[tmplIndex] ![value]) !== 'undefined') {
        tmplInstructions.push(phIndex | I18nFlags.Element);
        phAdded.push(value);

        if (tmplIndex > 0 || (tmplContainers && tmplContainers.indexOf(value) !== -1)) {
          tagCounter++;
        }
      } else if (
          expressions && expressions[tmplIndex] &&
          typeof(phIndex = expressions[tmplIndex] ![value]) !== 'undefined') {
        tmplInstructions.push(phIndex | I18nFlags.Expression);
        phAdded.push(value);
      } else {
        tmplInstructions.push(I18nFlags.CloseNode);

        if (tmplIndex > 0) {
          tagCounter--;

          // If we have reached the closing tag for this template, exit the loop
          if (tagCounter === 0) {
            break;
          }
        }
      }

      if (typeof phIndex !== 'undefined' && phIndex > maxIndex) {
        maxIndex = phIndex;
      }

      if (tmplContainers && tmplContainers.indexOf(value) !== -1 &&
          tmplContainers.indexOf(value) >= tmplIndex) {
        index = generateInstructions(
            index, instructions, msgList, elements, expressions, tmplContainers, lastChildIndex);
      }

    } else if (value) {  // It's a string, don't create a text node for empty values
      tmplInstructions.push(I18nFlags.Text, value);
    }
  }

  if (elements) {
    const tmplElements = elements[tmplIndex];

    if (tmplElements) {
      const phKeys = Object.keys(tmplElements);

      for (let i = 0; i < phKeys.length; i++) {
        const ph = phKeys[i];

        if (phAdded.indexOf(ph) === -1) {
          let index = tmplElements[ph];
          tmplInstructions.push(index | I18nFlags.RemoveNode);

          // TODO(ocombe): remove this once PR #24346 has landed
          // If the element is also a template container
          if (tmplContainers) {
            const containerIndex = tmplContainers.indexOf(ph) + 1;

            if (containerIndex > 0) {
              index = elements[containerIndex] ![ph];
              instructions[containerIndex] = [index | I18nFlags.RemoveNode];
            }
          }

          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }
  }

  if (expressions) {
    const tmplExpressions = expressions[tmplIndex];

    if (tmplExpressions) {
      const phKeys = Object.keys(tmplExpressions);

      for (let i = 0; i < phKeys.length; i++) {
        const ph = phKeys[i];

        if (phAdded.indexOf(ph) === -1) {
          let index = tmplExpressions[ph];
          tmplInstructions.push(index | I18nFlags.RemoveNode);

          if (index > maxIndex) {
            maxIndex = index;
          }
        }
      }
    }
  }

  if (typeof lastChildIndex !== 'undefined') {
    const lcIndex = lastChildIndex[tmplIndex];

    if (typeof lcIndex === 'number' && maxIndex < lcIndex) {
      // The current parent has more children, we need to append them at the end to keep the order
      for (let i = maxIndex + 1; i <= lcIndex; i++) {
        // We consider those additional placeholders as expressions because we don't care about
        // their
        // children, all we need to do is to append them at the end
        tmplInstructions.push(i | I18nFlags.Expression);
      }
    }
  }

  return index;
}

/**
 * Takes a translation string and the initial list of placeholders (elements and expressions)
 * and returns a list of instructions that will be used to translate the template.
 *
 * @param translation A translation string
 * @param elements A map of element placeholders and their indexes
 * @param expressions A map of expression placeholders and their indexes
 * @param tmplContainers An array of template container placeholders whose content should be ignored
 * @param lastChildIndex The index of the last child of the i18n node.
 * We are in a ng-template if it is different from the max index listed in the placeholders map
 *
 * @returns a list of instructions for each template
 */
export function i18nMapping(
    translation: string, elements: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, tmplContainers?: string[] | null,
    lastChildIndex?: (number | null)[]): I18nInstruction[][] {
  const msgList = translation.split(tagRegex);
  const instructions: I18nInstruction[][] = [];

  // Call the recursive function that will update the instructions
  generateInstructions(
      0, instructions, msgList, elements, expressions, tmplContainers, lastChildIndex);

  return instructions;
}

/**
 * Takes a translation string and the initial list of expressions and returns a list of instructions
 * that will be used to translate an attribute.
 * Even indexes contain static strings, while odd indexes contain the index of the expression whose
 * value will be concatenated into the final translation.
 */
export function i18nExpMapping(
    translation: string, placeholders: PlaceholderMap): I18nExpInstruction[] {
  const staticText: I18nExpInstruction[] = translation.split(tagRegex);
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
    instructions: I18nInstruction[], numberOfExp: number, v0: any, v1?: any, v2?: any, v3?: any,
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
export function i18nInterpolationV(msg: string, placeholders: string[], values: any[]): string|
    NO_CHANGE {
  if (ngDevMode) {
    assertEqual(placeholders.length, values.length, 'should have a value for each expression');
  }

  let different = false;
  for (let i = 0; i < values.length; i++) {
    // Check if bindings have changed
    bindingUpdated(values[i]) && (different = true);
  }

  // Build the updated content
  return different ? msg.replace(tagRegex, (match: string, p1: string) => {
    return stringify(values[placeholders.indexOf(p1)]);
  }) : NO_CHANGE;
}
