/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../../util/ng_dev_mode';
import '../../util/ng_i18n_closure_mode';

import {prepareI18nBlockForHydration} from '../../hydration/i18n';
import {assertDefined} from '../../util/assert';
import {bindingUpdated} from '../bindings';
import {applyCreateOpCodes, applyI18n, setMaskBit} from '../i18n/i18n_apply';
import {i18nAttributesFirstPass, i18nStartFirstCreatePass} from '../i18n/i18n_parse';
import {i18nPostprocess} from '../i18n/i18n_postprocess';
import {TI18n} from '../interfaces/i18n';
import {TElementNode, TNodeType} from '../interfaces/node';
import {
  DECLARATION_COMPONENT_VIEW,
  FLAGS,
  HEADER_OFFSET,
  LViewFlags,
  T_HOST,
  TViewType,
} from '../interfaces/view';
import {getClosestRElement} from '../node_manipulation';
import {
  getCurrentParentTNode,
  getLView,
  getTView,
  nextBindingIndex,
  setInI18nBlock,
} from '../state';
import {getConstant} from '../util/view_utils';

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
 * @param messageIndex An index of the translation message from the `def.consts` array.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 *
 * @codeGenApi
 */
export function ɵɵi18nStart(
  index: number,
  messageIndex: number,
  subTemplateIndex: number = -1,
): void {
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = HEADER_OFFSET + index;
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const message = getConstant<string>(tView.consts, messageIndex)!;
  const parentTNode = getCurrentParentTNode() as TElementNode | null;
  if (tView.firstCreatePass) {
    i18nStartFirstCreatePass(
      tView,
      parentTNode === null ? 0 : parentTNode.index,
      lView,
      adjustedIndex,
      message,
      subTemplateIndex,
    );
  }

  // Set a flag that this LView has i18n blocks.
  // The flag is later used to determine whether this component should
  // be hydrated (currently hydration is not supported for i18n blocks).
  if (tView.type === TViewType.Embedded) {
    // Annotate host component's LView (not embedded view's LView),
    // since hydration can be skipped on per-component basis only.
    const componentLView = lView[DECLARATION_COMPONENT_VIEW];
    componentLView[FLAGS] |= LViewFlags.HasI18n;
  } else {
    lView[FLAGS] |= LViewFlags.HasI18n;
  }

  const tI18n = tView.data[adjustedIndex] as TI18n;
  const sameViewParentTNode = parentTNode === lView[T_HOST] ? null : parentTNode;
  const parentRNode = getClosestRElement(tView, sameViewParentTNode, lView);
  // If `parentTNode` is an `ElementContainer` than it has `<!--ng-container--->`.
  // When we do inserts we have to make sure to insert in front of `<!--ng-container--->`.
  const insertInFrontOf =
    parentTNode && parentTNode.type & TNodeType.ElementContainer ? lView[parentTNode.index] : null;
  prepareI18nBlockForHydration(lView, adjustedIndex, parentTNode, subTemplateIndex);
  applyCreateOpCodes(lView, tI18n.create, parentRNode, insertInFrontOf);
  setInI18nBlock(true);
}

/**
 * Translates a translation block marked by `i18nStart` and `i18nEnd`. It inserts the text/ICU nodes
 * into the render tree, moves the placeholder nodes and removes the deleted nodes.
 *
 * @codeGenApi
 */
export function ɵɵi18nEnd(): void {
  setInI18nBlock(false);
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
 * @param messageIndex An index of the translation message from the `def.consts` array.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 *
 * @codeGenApi
 */
export function ɵɵi18n(index: number, messageIndex: number, subTemplateIndex?: number): void {
  ɵɵi18nStart(index, messageIndex, subTemplateIndex);
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
export function ɵɵi18nAttributes(index: number, attrsIndex: number): void {
  const tView = getTView();
  ngDevMode && assertDefined(tView, `tView should be defined`);
  const attrs = getConstant<string[]>(tView.consts, attrsIndex)!;
  i18nAttributesFirstPass(tView, index + HEADER_OFFSET, attrs);
}

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
export function ɵɵi18nExp<T>(value: T): typeof ɵɵi18nExp {
  const lView = getLView();
  setMaskBit(bindingUpdated(lView, nextBindingIndex(), value));
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
  applyI18n(getTView(), getLView(), index + HEADER_OFFSET);
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
  message: string,
  replacements: {[key: string]: string | string[]} = {},
): string {
  return i18nPostprocess(message, replacements);
}
