/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined, assertEqual, assertGreaterThan, assertLessThan} from './assert';
import {icu, icuMapping} from './icu';
import {NO_CHANGE, _getViewData, adjustBlueprintForNewNode, bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4, createNodeAtIndex, getRenderer, getTNode, load, loadElement, resetComponentState, setPreviousOrParentTNode} from './instructions';
import {RENDER_PARENT} from './interfaces/container';
import {I18nAttrInstruction, I18nInstruction, PlaceholderMap} from './interfaces/i18n';
import {IcuExpression, IcuType} from './interfaces/icu';
import {LContainerNode, LNode, TElementNode, TNode, TNodeType} from './interfaces/node';
import {BINDING_INDEX, HEADER_OFFSET, HOST_NODE, PARENT, TVIEW} from './interfaces/view';
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
  ICU = 4 << 29,
  TemplateRoot = 5 << 29,
  Any = 6 << 29,
  CloseNode = 7 << 29,
  RemoveNode = 8 << 29,
  /** Used to decode the number encoded with the instruction. */
  IndexMask = (1 << 29) - 1,
  /** Used to test the type of instruction. */
  InstructionMask = ~((1 << 29) - 1),
}

const ICU_BLOCK_REGEX = /^\s*(\w+)\s*,\s*(select|plural)\s*,/;
const ICU_BINDING = /^\$([^}]+)/;

// The current index in `translationParts`.
let partIndex: number;

/**
 * Takes a translation string, the initial list of placeholders (elements and expressions) and the
 * indexes of their corresponding expression nodes to return a list of instructions for each
 * template function.
 *
 * Because embedded templates have different indexes for each placeholder, each parameter (except
 * the translation) is an array, where each value corresponds to a different template, by order of
 * appearance.
 *
 * @param mappingIndex Index of this mapping in `tView.i18nMapping`
 * @param translation A translation string where placeholders are represented by `{$name}`
 * @param elements An array containing, for each template, the maps of element placeholders and
 * their indexes.
 * @param expressions An array containing, for each template, the maps of expression placeholders
 * and their indexes.
 * @param icuBindings An array containing a list of bindings used in ICU expressions.
 * The order should match the order of the parameters of `icuBindingX` (with X being a number from
 * 1 to 8).
 * @param templateRoots An array of template roots whose content should be ignored when
 * generating the instructions for their parent template.
 * @param lastChildIndex The index of the last child of the i18n node. Used when the i18n block is
 * an ng-container.
 * @returns A list of instructions used to translate each template.
 */
export function i18nMapping(
    mappingIndex: number, translation: string, elements?: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, icuBindings?: string[] | null,
    templateRoots?: string[] | null, lastChildIndex?: number | null): void {
  const tView = _getViewData()[TVIEW];
  if (tView.i18nInstructions && tView.i18nInstructions[mappingIndex]) {
    return;
  }
  if (!tView.i18nInstructions) {
    tView.i18nInstructions = [];
  }

  partIndex = 0;

  const translationParts = extractParts(translation, icuBindings || null, false) || [];
  const nbTemplates = templateRoots ? templateRoots.length + 1 : 1;
  const instructions: I18nInstruction[][] = (new Array(nbTemplates)).fill(undefined);
  generateMappingInstructions(
      0, translationParts, instructions, elements, expressions, templateRoots, lastChildIndex);

  tView.i18nInstructions[mappingIndex] = instructions;
}

const enum BlockType {
  Text = 0,
  Binding = 1,
  ICU = 2,
}

/**
 * Breaks pattern into strings and top level {...} blocks.
 *
 * @param pattern (sub)Pattern to be broken.
 * @param icuBindings An array containing a list of bindings used in ICU expressions.
 * The order should match the order of the parameters of `icuBindingX` (with X being a number from
 * 1 to 8).
 * @param inICU In ICU expressions we need to keep the bindings as strings because we will replace
 * them later inside of the generated templates
 */
function extractParts(pattern: string, icuBindings: string[] | null, inICU: boolean):
    (string | IcuExpression)[]|null {
  if (!pattern) {
    return null;
  }
  let prevPos = 0;
  const braceStack = [];
  const results: any[] = [];

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
        switch (parseBlockType(block)) {
          case BlockType.Binding:
            if (inICU) {
              results.push(`{${block}}`);
            } else {
              // Remove the leading $ to only keep the binding name
              results.push(block.substr(1));
            }
            break;
          case BlockType.ICU:
            results.push(parseICUBlock(block, icuBindings !));
            break;
          case BlockType.Text:
            results.push(block);
            break;
          default:
            throw new Error(`Unknown block type for pattern: ${block}`);
        }

        prevPos = pos + 1;
      }
    } else {
      if (braceStack.length == 0) {
        const substring = pattern.substring(prevPos, pos);
        results.push(substring);
        // if (substring != '') {
        // }
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
 * Detects which type of a block is the pattern.
 *
 * @param pattern Content of the block.
 */
function parseBlockType(pattern: string): BlockType {
  if (ICU_BLOCK_REGEX.test(pattern)) {
    return BlockType.ICU;
  }

  if (ICU_BINDING.test(pattern)) {
    return BlockType.Binding;
  }

  return BlockType.Text;
}

/**
 * Parses a select type of a block and produces JSON object for it.
 *
 * @param pattern Subpattern that needs to be parsed as select pattern.
 * @param icuBindings An array containing a list of bindings used in ICU expressions.
 * The order should match the order of the parameters of `icuBindingX` (with X being a number from
 * 1 to 8).
 */
function parseICUBlock(pattern: string, icuBindings: string[]): IcuExpression {
  const keys = [];
  const values = [];
  let icuType: IcuType;
  let icuMainBinding: number;
  pattern =
      pattern.replace(ICU_BLOCK_REGEX, function(str: string, mainBinding: string, type: string) {
        if (type === 'select') {
          icuType = IcuType.Select;
        } else {
          icuType = IcuType.Plural;
        }
        icuMainBinding = icuBindings.indexOf(mainBinding);
        return '';
      });

  const parts = extractParts(pattern, icuBindings, true) as string[] | null;
  if (parts) {
    let pos = 0;
    // Looking for (key block)+ sequence. One of the keys has to be "other".
    while (pos < parts.length) {
      let key = parts[pos++];
      if (icuType ! === IcuType.Plural) {
        key = key.replace(/\s*(?:=)?(\w+)\s*/, '$1');
      } else {
        key = key.replace(/\s/g, '');
      }
      keys.push(key);

      const blockResult: (string | IcuExpression)[] = [];
      const block = extractParts(parts[pos++], icuBindings, true) as string[] | null;
      if (block) {
        if (Array.isArray(block)) {
          for (let i = 0; i < block.length; i++) {
            const blockType = parseBlockType(block[i]);

            switch (blockType) {
              case BlockType.ICU:
                blockResult.push(parseICUBlock(block[i], icuBindings));
                break;
              default:
                if (block[i]) {  // don't push empty strings
                  if (typeof block[i] === 'string' &&
                      typeof blockResult[blockResult.length - 1] === 'string') {
                    // extractParts will split strings and bindings, but we need to merge them for
                    // ICU expressions so that we don't break the html templates
                    blockResult[blockResult.length - 1] += block[i];
                  } else {
                    blockResult.push(block[i]);
                  }
                }
            }
          }
        }

        values.push(blockResult);
      }
    }
  }

  assertGreaterThan(keys.indexOf('other'), -1, 'Missing other key in ICU statement.');
  // TODO(ocombe): support ICU expressions in attributes, see #21615
  return icuMapping(icuType !, icuMainBinding !, keys, values, icuBindings);
}

/**
 * Internal function that reads the translation parts and generates a set of instructions for each
 * template.
 *
 * See `i18nMapping()` for more details.
 *
 * @param templateIndex The order of appearance of the template.
 * 0 for the root template, following indexes match the order in `templateRoots`.
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
    templateIndex: number, translationParts: (string | IcuExpression)[],
    instructions: I18nInstruction[][], elements?: (PlaceholderMap | null)[] | null,
    expressions?: (PlaceholderMap | null)[] | null, templateRoots?: string[] | null,
    lastChildIndex?: number | null): number {
  const tmplInstructions: I18nInstruction[] = [];
  const phVisited: string[] = [];
  let openedTagCount = 0;
  let maxIndex = 0;
  let currentElements: PlaceholderMap|null =
      elements && elements[templateIndex] ? elements[templateIndex] : null;
  let currentExpressions: PlaceholderMap|null =
      expressions && expressions[templateIndex] ? expressions[templateIndex] : null;

  instructions[templateIndex] = tmplInstructions;

  for (; partIndex < translationParts.length; partIndex++) {
    // The value can either be text or the name of a placeholder (element/template root/expression)
    const value = translationParts[partIndex];

    // Odd indexes are placeholders
    if (partIndex & 1) {
      let phIndex;
      if (typeof value === 'string') {
        if (currentElements && currentElements[value] !== undefined) {
          phIndex = currentElements[value];
          // The placeholder represents a DOM element, add an instruction to move it
          let templateRootIndex = templateRoots ? templateRoots.indexOf(value) : -1;
          if (templateRootIndex !== -1 && (templateRootIndex + 1) !== templateIndex) {
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

          if (templateIndex > 0) {
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
          const newtemplateIndex = templateRoots.indexOf(value) + 1;
          if (newtemplateIndex !== 0 && newtemplateIndex !== templateIndex) {
            partIndex = generateMappingInstructions(
                newtemplateIndex, translationParts, instructions, elements, expressions,
                templateRoots, lastChildIndex);
          }
        }
      } else {
        // The placeholder represents an ICU expression, create an icu node
        const tView = _getViewData()[TVIEW];
        if (!tView.icuExpressions) {
          tView.icuExpressions = [];
        }
        const icuIndex = tView.icuExpressions !.push(value as IcuExpression) - 1;
        tmplInstructions.push(icuIndex | I18nInstructions.ICU);
      }
    } else if (value) {
      // It's a non-empty string, create a text node
      tmplInstructions.push(I18nInstructions.Text, value as string);
    }
  }

  // Add instructions to remove elements that are not used in the translation
  if (elements) {
    const tmplElements = elements[templateIndex];

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
    const tmplExpressions = expressions[templateIndex];

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

  if (templateIndex === 0 && typeof lastChildIndex === 'number') {
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
 * If there is only text but no expression, you need to create an empty static text node with
 * `text(x)` in the template and use its index.
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param templateIndex Index of the template root that we are translating
 */
export function i18nApply(startIndex: number, mappingIndex: number, templateIndex: number): void {
  const viewData = _getViewData();
  if (ngDevMode) {
    assertEqual(
        viewData[BINDING_INDEX], viewData[TVIEW].bindingStartIndex,
        'i18nApply should be called before any binding');
  }

  let rootLViewData = _getViewData();
  while (!rootLViewData[TVIEW].i18nInstructions && rootLViewData[PARENT]) {
    rootLViewData = rootLViewData[PARENT] !;
  }

  if (ngDevMode) {
    assertDefined(
        rootLViewData[TVIEW].i18nInstructions,
        'i18nMapping should be defined before calling i18nApply');
  }

  const instructions =
      rootLViewData[TVIEW].i18nInstructions ![mappingIndex][templateIndex] as I18nInstructions[];
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
      case I18nInstructions.ICU:
        if (ngDevMode) {
          ngDevMode.rendererCreateICUNode++;
        }
        const icuDataIndex = instruction & I18nInstructions.IndexMask;
        // If we were to only create a `RNode` then projections won't move the icu.
        // Create icu node at the current end of viewData. Must subtract header offset because
        // createLNode takes a raw index (not adjusted by header offset).
        adjustBlueprintForNewNode(viewData);
        const icuNodeIndex = viewData.length - 1 - HEADER_OFFSET;
        const tIcuNode = icu(icuNodeIndex, icuDataIndex, rootLViewData);
        const lIcuNode: LNode = load(icuNodeIndex);
        localPreviousTNode =
            appendI18nNode(lIcuNode, tIcuNode, localParentTNode, localPreviousTNode);
        resetComponentState();
        setPreviousOrParentTNode(tIcuNode);
        break;
      case I18nInstructions.Text:
        if (ngDevMode) {
          ngDevMode.rendererCreateTextNode++;
        }
        const textValue = instructions[++i];
        const textRNode = createTextNode(textValue, renderer);
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
        setPreviousOrParentTNode(textTNode);
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
 * Takes a translation string and the initial list of bindings and returns a list of instructions
 * that will be used to translate an attribute.
 * Even indexes contain static strings, while odd indexes contain the index of the binding whose
 * value will be concatenated into the final translation.
 */
export function i18nAttrMapping(
    mappingIndex: number, translation: string, bindings: string[]): void {
  const tView = _getViewData()[TVIEW];
  if (tView.i18nInstructions && tView.i18nInstructions[mappingIndex]) {
    return;
  }
  if (!tView.i18nInstructions) {
    tView.i18nInstructions = [];
  }

  // TODO(ocombe): support ICU expressions in attributes, see #21615
  const staticText: I18nAttrInstruction[]|null = extractParts(translation, bindings, false);

  if (staticText) {
    // odd indexes are bindings & ICU expressions
    for (let i = 1; i < staticText.length; i += 2) {
      if (typeof staticText[i] === 'string') {
        staticText[i] = bindings.indexOf(staticText[i] as string);
      }
    }

    tView.i18nInstructions[mappingIndex] = staticText;
  }
}

function getI18nAttrInstructions(mappingIndex: number): I18nAttrInstruction[] {
  let rootLViewData = _getViewData();
  while (!rootLViewData[TVIEW].i18nInstructions && rootLViewData[PARENT]) {
    rootLViewData = rootLViewData[PARENT] !;
  }

  if (ngDevMode) {
    assertDefined(
        rootLViewData[TVIEW].i18nInstructions,
        'i18nMapping should be defined before calling i18nApply');
  }

  return rootLViewData[TVIEW].i18nInstructions ![mappingIndex] as I18nAttrInstruction[];
}

/**
 * Checks if the value of an expression has changed and replaces it by its value in a translation,
 * or returns NO_CHANGE.
 *
 * @param mappingIndex
 * @param v0 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation1(mappingIndex: number, v0: any): string|NO_CHANGE {
  const different = bindingUpdated(_getViewData()[BINDING_INDEX]++, v0);

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation2(mappingIndex: number, v0: any, v1: any): string|NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated2(viewData[BINDING_INDEX], v0, v1);
  viewData[BINDING_INDEX] += 2;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation3(mappingIndex: number, v0: any, v1: any, v2: any): string|
    NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated3(viewData[BINDING_INDEX], v0, v1, v2);
  viewData[BINDING_INDEX] += 3;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation4(
    mappingIndex: number, v0: any, v1: any, v2: any, v3: any): string|NO_CHANGE {
  const viewData = _getViewData();
  const different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  viewData[BINDING_INDEX] += 4;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function i18nInterpolation5(
    mappingIndex: number, v0: any, v1: any, v2: any, v3: any, v4: any): string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated(viewData[BINDING_INDEX] + 4, v4) || different;
  viewData[BINDING_INDEX] += 5;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
 * @param v0 value checked for change.
 * @param v1 value checked for change.
 * @param v2 value checked for change.
 * @param v3 value checked for change.
 * @param v4 value checked for change.
 * @param v5 value checked for change.
 *
 * @returns The concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */ export function
i18nInterpolation6(mappingIndex: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any):
    string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated2(viewData[BINDING_INDEX] + 4, v4, v5) || different;
  viewData[BINDING_INDEX] += 6;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
* @param mappingIndex Index of this mapping in `tView.I18nInstructions`
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
    mappingIndex: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any): string|
    NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated3(viewData[BINDING_INDEX] + 4, v4, v5, v6) || different;
  viewData[BINDING_INDEX] += 7;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
 * @param mappingIndex Index of this mapping in `tView.I18nInstructions`
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
    mappingIndex: number, v0: any, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any,
    v7: any): string|NO_CHANGE {
  const viewData = _getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated4(viewData[BINDING_INDEX] + 4, v4, v5, v6, v7) || different;
  viewData[BINDING_INDEX] += 8;

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
export function i18nInterpolationV(mappingIndex: number, values: any[]): string|NO_CHANGE {
  const viewData = _getViewData();
  let different = false;
  for (let i = 0; i < values.length; i++) {
    // Check if bindings have changed
    bindingUpdated(viewData[BINDING_INDEX]++, values[i]) && (different = true);
  }

  if (!different) {
    return NO_CHANGE;
  }

  const instructions = getI18nAttrInstructions(mappingIndex);
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
