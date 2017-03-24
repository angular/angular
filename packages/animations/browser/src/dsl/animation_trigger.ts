/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationSequenceMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata, ɵStyleData} from '@angular/animations';

import {copyStyles, normalizeStyles} from '../util';

import {AnimationDslVisitor, visitAnimationNode} from './animation_dsl_visitor';
import {parseTransitionExpr} from './animation_transition_expr';
import {AnimationTransitionFactory} from './animation_transition_factory';
import {AnimationTransitionInstruction, createTransitionInstruction} from './animation_transition_instruction';
import {validateAnimationSequence} from './animation_validator_visitor';


/**
 * @experimental Animation support is experimental.
 */
export function buildTrigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger {
  return new AnimationTriggerVisitor().buildTrigger(name, definitions);
}

/**
* @experimental Animation support is experimental.
*/
export class AnimationTrigger {
  public transitionFactories: AnimationTransitionFactory[] = [];
  public states: {[stateName: string]: ɵStyleData} = {};

  constructor(
      public name: string, states: {[stateName: string]: ɵStyleData},
      private _transitionAsts: AnimationTransitionMetadata[]) {
    Object.keys(states).forEach(
        stateName => { this.states[stateName] = copyStyles(states[stateName], false); });

    const errors: string[] = [];
    _transitionAsts.forEach(ast => {
      const exprs = parseTransitionExpr(ast.expr, errors);
      const sequenceErrors = validateAnimationSequence(ast);
      if (sequenceErrors.length) {
        errors.push(...sequenceErrors);
      } else {
        this.transitionFactories.push(
            new AnimationTransitionFactory(this.name, ast, exprs, states));
      }
    });

    if (errors.length) {
      const LINE_START = '\n - ';
      throw new Error(
          `Animation parsing for the ${name} trigger have failed:${LINE_START}${errors.join(LINE_START)}`);
    }
  }

  createFallbackInstruction(currentState: any, nextState: any): AnimationTransitionInstruction {
    const backupStateStyles = this.states['*'] || {};
    const currentStateStyles = this.states[currentState] || backupStateStyles;
    const nextStateStyles = this.states[nextState] || backupStateStyles;
    return createTransitionInstruction(
        this.name, currentState, nextState, nextState == 'void', currentStateStyles,
        nextStateStyles, []);
  }

  matchTransition(currentState: any, nextState: any): AnimationTransitionInstruction|null {
    for (let i = 0; i < this.transitionFactories.length; i++) {
      let result = this.transitionFactories[i].match(currentState, nextState);
      if (result) return result;
    }
    return null;
  }
}

class AnimationTriggerContext {
  public errors: string[] = [];
  public states: {[stateName: string]: ɵStyleData} = {};
  public transitions: AnimationTransitionMetadata[] = [];
}

class AnimationTriggerVisitor implements AnimationDslVisitor {
  buildTrigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger {
    const context = new AnimationTriggerContext();
    definitions.forEach(def => visitAnimationNode(this, def, context));
    return new AnimationTrigger(name, context.states, context.transitions);
  }

  visitState(ast: AnimationStateMetadata, context: any): any {
    const styles = normalizeStyles(ast.styles.styles);
    ast.name.split(/\s*,\s*/).forEach(name => { context.states[name] = styles; });
  }

  visitTransition(ast: AnimationTransitionMetadata, context: any): any {
    context.transitions.push(ast);
  }

  visitSequence(ast: AnimationSequenceMetadata, context: any) {
    // these values are not visited in this AST
  }

  visitGroup(ast: AnimationGroupMetadata, context: any) {
    // these values are not visited in this AST
  }

  visitAnimate(ast: AnimationAnimateMetadata, context: any) {
    // these values are not visited in this AST
  }

  visitStyle(ast: AnimationStyleMetadata, context: any) {
    // these values are not visited in this AST
  }

  visitKeyframeSequence(ast: AnimationKeyframesSequenceMetadata, context: any) {
    // these values are not visited in this AST
  }
}
