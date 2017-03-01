/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationPlayer, AnimationStyleMetadata, sequence, ɵStyleData} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {DomAnimationEngine} from '../render/dom_animation_engine';
import {normalizeStyles} from '../util';

import {AnimationTimelineInstruction} from './animation_timeline_instruction';
import {buildAnimationKeyframes} from './animation_timeline_visitor';
import {validateAnimationSequence} from './animation_validator_visitor';
import {AnimationStyleNormalizer} from './style_normalization/animation_style_normalizer';

export class Animation {
  private _animationAst: AnimationMetadata;
  constructor(input: AnimationMetadata|AnimationMetadata[]) {
    const ast =
        Array.isArray(input) ? sequence(<AnimationMetadata[]>input) : <AnimationMetadata>input;
    const errors = validateAnimationSequence(ast);
    if (errors.length) {
      const errorMessage = `animation validation failed:\n${errors.join("\n")}`;
      throw new Error(errorMessage);
    }
    this._animationAst = ast;
  }

  buildTimelines(
      startingStyles: ɵStyleData|ɵStyleData[],
      destinationStyles: ɵStyleData|ɵStyleData[]): AnimationTimelineInstruction[] {
    const start = Array.isArray(startingStyles) ? normalizeStyles(startingStyles) :
                                                  <ɵStyleData>startingStyles;
    const dest = Array.isArray(destinationStyles) ? normalizeStyles(destinationStyles) :
                                                    <ɵStyleData>destinationStyles;
    return buildAnimationKeyframes(this._animationAst, start, dest);
  }

  // this is only used for development demo purposes for now
  private create(
      injector: any, element: any, startingStyles: ɵStyleData = {},
      destinationStyles: ɵStyleData = {}): AnimationPlayer {
    const instructions = this.buildTimelines(startingStyles, destinationStyles);

    // note the code below is only here to make the tests happy (once the new renderer is
    // within core then the code below will interact with Renderer.transition(...))
    const driver: AnimationDriver = injector.get(AnimationDriver);
    const normalizer: AnimationStyleNormalizer = injector.get(AnimationStyleNormalizer);
    const engine = new DomAnimationEngine(driver, normalizer);
    return engine.animateTimeline(element, instructions);
  }
}
