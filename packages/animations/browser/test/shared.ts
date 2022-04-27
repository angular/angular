/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {trigger} from '@angular/animations';

import {TriggerAst} from '../src/dsl/animation_ast.js';
import {buildAnimationAst} from '../src/dsl/animation_ast_builder.js';
import {AnimationTrigger, buildTrigger} from '../src/dsl/animation_trigger.js';
import {NoopAnimationStyleNormalizer} from '../src/dsl/style_normalization/animation_style_normalizer.js';
import {triggerParsingFailed} from '../src/error_helpers.js';
import {triggerParsingWarnings} from '../src/warning_helpers.js';
import {MockAnimationDriver} from '../testing/src/mock_animation_driver.js';

export function makeTrigger(
    name: string, steps: any, skipErrors: boolean = false): AnimationTrigger {
  const driver = new MockAnimationDriver();
  const errors: Error[] = [];
  const warnings: string[] = [];
  const triggerData = trigger(name, steps);
  const triggerAst = buildAnimationAst(driver, triggerData, errors, warnings) as TriggerAst;
  if (!skipErrors && errors.length) {
    throw triggerParsingFailed(name, errors);
  }
  if (warnings.length) {
    triggerParsingWarnings(name, warnings);
  }
  return buildTrigger(name, triggerAst, new NoopAnimationStyleNormalizer());
}
