/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationTriggerNames} from '@angular/compiler';

import {ResolvedValue} from '../../../partial_evaluator';

/**
 * Collect the animation names from the static evaluation result.
 * @param value the static evaluation result of the animations
 * @param animationTriggerNames the animation names collected and whether some names could not be
 *     statically evaluated.
 */
export function collectAnimationNames(
    value: ResolvedValue, animationTriggerNames: AnimationTriggerNames) {
  if (value instanceof Map) {
    const name = value.get('name');
    if (typeof name === 'string') {
      animationTriggerNames.staticTriggerNames.push(name);
    } else {
      animationTriggerNames.includesDynamicAnimations = true;
    }
  } else if (Array.isArray(value)) {
    for (const resolvedValue of value) {
      collectAnimationNames(resolvedValue, animationTriggerNames);
    }
  } else {
    animationTriggerNames.includesDynamicAnimations = true;
  }
}
