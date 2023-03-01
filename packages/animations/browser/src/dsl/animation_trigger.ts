/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadataType, ɵStyleDataMap} from '@angular/animations';

import {SequenceAst, TransitionAst, TriggerAst} from './animation_ast';
import {AnimationStateStyles, AnimationTransitionFactory} from './animation_transition_factory';
import {AnimationStyleNormalizer} from './style_normalization/animation_style_normalizer';



export function buildTrigger(
    name: string, ast: TriggerAst, normalizer: AnimationStyleNormalizer): AnimationTrigger {
  return new AnimationTrigger(name, ast, normalizer);
}

export class AnimationTrigger {
  public transitionFactories: AnimationTransitionFactory[] = [];
  public fallbackTransition: AnimationTransitionFactory;
  public states = new Map<string, AnimationStateStyles>();

  constructor(
      public name: string, public ast: TriggerAst, private _normalizer: AnimationStyleNormalizer) {
    ast.states.forEach(ast => {
      const defaultParams = (ast.options && ast.options.params) || {};
      this.states.set(ast.name, new AnimationStateStyles(ast.style, defaultParams, _normalizer));
    });

    balanceProperties(this.states, 'true', '1');
    balanceProperties(this.states, 'false', '0');

    ast.transitions.forEach(ast => {
      this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
    });
    this.fallbackTransition = createFallbackTransition(name, this.states, this._normalizer);
  }

  get containsQueries() {
    return this.ast.queryCount > 0;
  }

  matchTransition(currentState: any, nextState: any, element: any, params: {[key: string]: any}):
      AnimationTransitionFactory|null {
    const entry =
        this.transitionFactories.find(f => f.match(currentState, nextState, element, params));
    return entry || null;
  }

  matchStyles(currentState: any, params: {[key: string]: any}, errors: Error[]): ɵStyleDataMap {
    return this.fallbackTransition.buildStyles(currentState, params, errors);
  }
}

function createFallbackTransition(
    triggerName: string, states: Map<string, AnimationStateStyles>,
    normalizer: AnimationStyleNormalizer): AnimationTransitionFactory {
  const matchers = [(fromState: any, toState: any) => true];
  const animation: SequenceAst = {type: AnimationMetadataType.Sequence, steps: [], options: null};
  const transition: TransitionAst = {
    type: AnimationMetadataType.Transition,
    animation,
    matchers,
    options: null,
    queryCount: 0,
    depCount: 0
  };
  return new AnimationTransitionFactory(triggerName, transition, states);
}

function balanceProperties(
    stateMap: Map<string, AnimationStateStyles>, key1: string, key2: string) {
  if (stateMap.has(key1)) {
    if (!stateMap.has(key2)) {
      stateMap.set(key2, stateMap.get(key1)!);
    }
  } else if (stateMap.has(key2)) {
    stateMap.set(key1, stateMap.get(key2)!);
  }
}
