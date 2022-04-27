/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType, AnimationOptions, ɵStyleDataMap} from '@angular/animations';

import {buildingFailed, validationFailed} from '../error_helpers.js';
import {AnimationDriver} from '../render/animation_driver.js';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME, normalizeStyles} from '../util.js';
import {warnValidation} from '../warning_helpers.js';

import {Ast} from './animation_ast.js';
import {buildAnimationAst} from './animation_ast_builder.js';
import {buildAnimationTimelines} from './animation_timeline_builder.js';
import {AnimationTimelineInstruction} from './animation_timeline_instruction.js';
import {ElementInstructionMap} from './element_instruction_map.js';

export class Animation {
  private _animationAst: Ast<AnimationMetadataType>;
  constructor(private _driver: AnimationDriver, input: AnimationMetadata|AnimationMetadata[]) {
    const errors: Error[] = [];
    const warnings: string[] = [];
    const ast = buildAnimationAst(_driver, input, errors, warnings);
    if (errors.length) {
      throw validationFailed(errors);
    }
    if (warnings.length) {
      warnValidation(warnings);
    }
    this._animationAst = ast;
  }

  buildTimelines(
      element: any, startingStyles: ɵStyleDataMap|Array<ɵStyleDataMap>,
      destinationStyles: ɵStyleDataMap|Array<ɵStyleDataMap>, options: AnimationOptions,
      subInstructions?: ElementInstructionMap): AnimationTimelineInstruction[] {
    const start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) :
                                                  <ɵStyleDataMap>startingStyles;
    const dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) :
                                                    <ɵStyleDataMap>destinationStyles;
    const errors: any = [];
    subInstructions = subInstructions || new ElementInstructionMap();
    const result = buildAnimationTimelines(
        this._driver, element, this._animationAst, ENTER_CLASSNAME, LEAVE_CLASSNAME, start, dest,
        options, subInstructions, errors);
    if (errors.length) {
      throw buildingFailed(errors);
    }
    return result;
  }
}
