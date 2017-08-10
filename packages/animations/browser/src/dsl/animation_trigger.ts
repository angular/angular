/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵStyleData} from '@angular/animations';

import {copyStyles, interpolateParams} from '../util';

import {SequenceAst, StyleAst, TransitionAst, TriggerAst} from './animation_ast';
import {AnimationStateStyles, AnimationTransitionFactory} from './animation_transition_factory';


/**
 * @experimental Animation support is experimental.
 */
export function buildTrigger(name: string, ast: TriggerAst): AnimationTrigger {
  return new AnimationTrigger(name, ast);
}

/**
* @experimental Animation support is experimental.
*/
export class AnimationTrigger {
  public transitionFactories: AnimationTransitionFactory[] = [];
  public fallbackTransition: AnimationTransitionFactory;
  public states: {[stateName: string]: AnimationStateStyles} = {};

  constructor(public name: string, public ast: TriggerAst) {
    ast.states.forEach(ast => {
      const defaultParams = (ast.options && ast.options.params) || {};
      this.states[ast.name] = new AnimationStateStyles(ast.style, defaultParams);
    });

    balanceProperties(this.states, 'true', '1');
    balanceProperties(this.states, 'false', '0');

    ast.transitions.forEach(ast => {
      this.transitionFactories.push(new AnimationTransitionFactory(name, ast, this.states));
    });

    this.fallbackTransition = createFallbackTransition(name, this.states);
  }

  get containsQueries() { return this.ast.queryCount > 0; }

  matchTransition(currentState: any, nextState: any): AnimationTransitionFactory|null {
    const entry = this.transitionFactories.find(f => f.match(currentState, nextState));
    return entry || null;
  }

  matchStyles(currentState: any, params: {[key: string]: any}, errors: any[]): ɵStyleData {
    return this.fallbackTransition.buildStyles(currentState, params, errors);
  }
}

function createFallbackTransition(
    triggerName: string,
    states: {[stateName: string]: AnimationStateStyles}): AnimationTransitionFactory {
  const matchers = [(fromState: any, toState: any) => true];
  const animation = new SequenceAst([]);
  const transition = new TransitionAst(matchers, animation);
  return new AnimationTransitionFactory(triggerName, transition, states);
}

function balanceProperties(obj: {[key: string]: any}, key1: string, key2: string) {
  if (obj.hasOwnProperty(key1)) {
    if (!obj.hasOwnProperty(key2)) {
      obj[key2] = obj[key1];
    }
  } else if (obj.hasOwnProperty(key2)) {
    obj[key1] = obj[key2];
  }
}
