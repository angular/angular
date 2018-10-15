/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {getContext} from '../context_discovery';
import {ACTIVE_INDEX, LContainer} from '../interfaces/container';
import {LContext} from '../interfaces/context';
import {LElementNode} from '../interfaces/node';
import {PlayerContext} from '../interfaces/player';
import {InitialStyles, StylingContext, StylingIndex} from '../interfaces/styling';
import {FLAGS, HEADER_OFFSET, HOST, LViewData} from '../interfaces/view';
import {getTNode} from '../util';

export const EMPTY_ARR: any[] = [];
export const EMPTY_OBJ: {[key: string]: any} = {};

export function createEmptyStylingContext(
    element?: LElementNode | null, sanitizer?: StyleSanitizeFn | null,
    initialStylingValues?: InitialStyles): StylingContext {
  return [
    null,                            // PlayerContext
    sanitizer || null,               // StyleSanitizer
    initialStylingValues || [null],  // InitialStyles
    0,                               // MasterFlags
    0,                               // ClassOffset
    element || null,                 // Element
    null,                            // PreviousMultiClassValue
    null                             // PreviousMultiStyleValue
  ];
}

/**
 * Used clone a copy of a pre-computed template of a styling context.
 *
 * A pre-computed template is designed to be computed once for a given element
 * (instructions.ts has logic for caching this).
 */
export function allocStylingContext(
    lElement: LElementNode | null, templateStyleContext: StylingContext): StylingContext {
  // each instance gets a copy
  const context = templateStyleContext.slice() as any as StylingContext;
  context[StylingIndex.ElementPosition] = lElement;
  return context;
}

/**
 * Retrieve the `StylingContext` at a given index.
 *
 * This method lazily creates the `StylingContext`. This is because in most cases
 * we have styling without any bindings. Creating `StylingContext` eagerly would mean that
 * every style declaration such as `<div style="color: red">` would result `StyleContext`
 * which would create unnecessary memory pressure.
 *
 * @param index Index of the style allocation. See: `elementStyling`.
 * @param viewData The view to search for the styling context
 */
export function getStylingContext(index: number, viewData: LViewData): StylingContext {
  let storageIndex = index + HEADER_OFFSET;
  let slotValue: LContainer|LViewData|StylingContext|LElementNode = viewData[storageIndex];
  let wrapper: LContainer|LViewData|StylingContext = viewData;

  while (Array.isArray(slotValue)) {
    wrapper = slotValue;
    slotValue = slotValue[HOST] as LViewData | StylingContext | LElementNode;
  }

  if (isStylingContext(wrapper)) {
    return wrapper as StylingContext;
  } else {
    // This is an LViewData or an LContainer
    const stylingTemplate = getTNode(index, viewData).stylingTemplate;

    if (wrapper !== viewData) storageIndex = HOST;
    return wrapper[storageIndex] = stylingTemplate ?
        allocStylingContext(slotValue, stylingTemplate) :
        createEmptyStylingContext(slotValue);
  }
}

function isStylingContext(value: LViewData | LContainer | StylingContext) {
  // Not an LViewData or an LContainer
  return typeof value[FLAGS] !== 'number' && typeof value[ACTIVE_INDEX] !== 'number';
}

export function getOrCreatePlayerContext(target: {}, context?: LContext | null): PlayerContext {
  context = context || getContext(target) !;
  if (ngDevMode && !context) {
    throw new Error(
        'Only elements that exist in an Angular application can be used for player access');
  }

  const {lViewData, nodeIndex} = context;
  const stylingContext = getStylingContext(nodeIndex - HEADER_OFFSET, lViewData);
  return stylingContext[StylingIndex.PlayerContext] || allocPlayerContext(stylingContext);
}

function allocPlayerContext(data: StylingContext): PlayerContext {
  return data[StylingIndex.PlayerContext] = [];
}
