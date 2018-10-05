/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StyleSanitizeFn} from '../../sanitization/style_sanitizer';
import {LContext, getContext} from '../context_discovery';
import {LElementNode} from '../interfaces/node';
import {PlayerContext} from '../interfaces/player';
import {InitialStyles, StylingContext, StylingIndex} from '../interfaces/styling';

export const EMPTY_ARR: any[] = [];
export const EMPTY_OBJ: {[key: string]: any} = {};

export function createEmptyStylingContext(
    element?: LElementNode | null, sanitizer?: StyleSanitizeFn | null,
    initialStylingValues?: InitialStyles): StylingContext {
  return [
    element || null, null, sanitizer || null, initialStylingValues || [null], 0, 0, null, null
  ];
}

export function getOrCreatePlayerContext(target: {}, context?: LContext | null): PlayerContext {
  context = context || getContext(target) !;
  if (ngDevMode && !context) {
    throw new Error(
        'Only elements that exist in an Angular application can be used for player access');
  }

  const {lViewData, nodeIndex} = context;
  const value = lViewData[nodeIndex];
  let stylingContext = value as StylingContext;
  if (!Array.isArray(value)) {
    stylingContext = lViewData[nodeIndex] = createEmptyStylingContext(value as LElementNode);
  }
  return stylingContext[StylingIndex.PlayerContext] || allocPlayerContext(stylingContext);
}

function allocPlayerContext(data: StylingContext): PlayerContext {
  return data[StylingIndex.PlayerContext] = [];
}
