/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationQueryAst} from "../animation/animation_ast";
import {CompileQueryMetadata, CompileTokenMetadata} from "../compile_metadata";

const ANIMATE_PROP_PREFIX = 'animate-';

export function generateDelayedDetachPropName(nodeIndex: number): string {
  return `_delayedDetach_${nodeIndex}`;
}

export function buildQueryMetadataFromAnimation(queryAst: AnimationQueryAst): CompileQueryMetadata {
  return <CompileQueryMetadata>{
    isAnimationQuery: true,
    first: false,
    propertyName: '',
    read: null,
    descendants: false,
    selectors: [
      <CompileTokenMetadata>{value: queryAst.criteria}
    ]
  };
}

export function getAnimationPrefixLength(propName: string): number {
  if (propName[0] == '@') return 1;
  const l = ANIMATE_PROP_PREFIX.length;
  if (propName.substring(0, l) == ANIMATE_PROP_PREFIX) return l;
  return 0;
}
