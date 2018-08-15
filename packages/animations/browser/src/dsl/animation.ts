/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType, AnimationOptions, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {ENTER_CLASSNAME, LEAVE_CLASSNAME, normalizeStyles} from '../util';

import {Ast} from './animation_ast';
import {buildAnimationAst} from './animation_ast_builder';
import {buildAnimationTimelines} from './animation_timeline_builder';
import {AnimationTimelineInstruction} from './animation_timeline_instruction';
import {ElementInstructionMap} from './element_instruction_map';

export class Animation {
  private _animationAst: Ast<AnimationMetadataType>;
  constructor(private _driver: AnimationDriver, input: AnimationMetadata|AnimationMetadata[]) {
    const errors: any[] = [];
    const ast = buildAnimationAst(_driver, input, errors);
    if (errors.length) {
      const errorMessage = `animation validation failed:\n${errors.join('\n')}`;
      throw new Error(errorMessage);
    }
    this._animationAst = ast;
  }

  buildTimelines(
      element: any, startingStyles: ɵStyleData|ɵStyleData[],
      destinationStyles: ɵStyleData|ɵStyleData[], options: AnimationOptions,
      subInstructions?: ElementInstructionMap): AnimationTimelineInstruction[] {
    const start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) :
                                                  <ɵStyleData>startingStyles;
    const dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) :
                                                    <ɵStyleData>destinationStyles;
    const errors: any = [];
    subInstructions = subInstructions || new ElementInstructionMap();
    const result = buildAnimationTimelines(
        this._driver, element, this._animationAst, ENTER_CLASSNAME, LEAVE_CLASSNAME, start, dest,
        options, subInstructions, errors);
    if (errors.length) {
      const errorMessage = `animation building failed:\n${errors.join('\n')}`;
      throw new Error(errorMessage);
    }
    return result;
  }
}
