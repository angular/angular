/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, AnimationStyles, Injector} from '@angular/core';
import {StyleData} from '../common/style_data';
import {normalizeStyles} from '../common/util';
import {AnimationDriver} from '../engine/animation_driver';
import {DomAnimationTransitionEngine} from '../engine/dom_animation_transition_engine';
import {AnimationMetadata, sequence} from './animation_metadata';
import {AnimationTimelineInstruction} from './animation_timeline_instruction';
import {buildAnimationKeyframes} from './animation_timeline_visitor';
import {validateAnimationSequence} from './animation_validator_visitor';
import {AnimationStyleNormalizer} from './style_normalization/animation_style_normalizer';

/**
 * @experimental Animation support is experimental.
 */
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

  buildTimelines(startingStyles: StyleData|StyleData[], destinationStyles: StyleData|StyleData[]):
      AnimationTimelineInstruction[] {
    const start = Array.isArray(startingStyles) ?
        normalizeStyles(new AnimationStyles(<StyleData[]>startingStyles)) :
        <StyleData>startingStyles;
    const dest = Array.isArray(destinationStyles) ?
        normalizeStyles(new AnimationStyles(<StyleData[]>destinationStyles)) :
        <StyleData>destinationStyles;
    return buildAnimationKeyframes(this._animationAst, start, dest);
  }

  // this is only used for development demo purposes for now
  private create(
      injector: Injector, element: any, startingStyles: StyleData = {},
      destinationStyles: StyleData = {}): AnimationPlayer {
    const instructions = this.buildTimelines(startingStyles, destinationStyles);

    // note the code below is only here to make the tests happy (once the new renderer is
    // within core then the code below will interact with Renderer.transition(...))
    const driver: AnimationDriver = injector.get(AnimationDriver);
    const normalizer: AnimationStyleNormalizer = injector.get(AnimationStyleNormalizer);
    const engine = new DomAnimationTransitionEngine(driver, normalizer);
    return engine.process(element, instructions);
  }
}
