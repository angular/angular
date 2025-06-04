/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PropType} from '../../../../protocol';

import {isSignal} from '../utils';

const commonTypes = {
  boolean: PropType.Boolean,
  bigint: PropType.BigInt,
  function: PropType.Function,
  number: PropType.Number,
  string: PropType.String,
  symbol: PropType.Symbol,
};

/**
 * Determines the devtools-PropType of a component's property
 * @param prop component's property
 * @returns PropType
 * @see `devtools/projects/protocol`
 */
export const getPropType = (prop: unknown): PropType => {
  if (isSignal(prop)) {
    prop = prop();
  }

  if (prop === undefined) {
    return PropType.Undefined;
  }
  if (prop === null) {
    return PropType.Null;
  }
  if (prop instanceof HTMLElement) {
    return PropType.HTMLNode;
  }
  const type = typeof prop;
  if (type in commonTypes) {
    return commonTypes[type as keyof typeof commonTypes];
  }
  if (type === 'object') {
    if (Array.isArray(prop)) {
      return PropType.Array;
    } else if (prop instanceof Set) {
      return PropType.Set;
    } else if (prop instanceof Map) {
      return PropType.Map;
    } else if (Object.prototype.toString.call(prop) === '[object Date]') {
      return PropType.Date;
    } else if (prop instanceof Node) {
      return PropType.HTMLNode;
    } else {
      return PropType.Object;
    }
  }
  return PropType.Unknown;
};
