/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationStyles, Trigger} from '@angular/core';
import {StyleData} from '../common/style_data';
import {copyStyles, normalizeStyles} from '../common/util';
import {AnimationDslVisitor, visitAnimationNode} from './animation_dsl_visitor';
import {AnimationAnimateMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationSequenceMetadata, AnimationStateMetadata, AnimationStyleMetadata, AnimationTransitionMetadata} from './animation_metadata';
import {parseTransitionExpr} from './animation_transition_expr';
import {AnimationTransitionFactory} from './animation_transition_factory';
import {AnimationTransitionInstruction} from './animation_transition_instruction';
import {validateAnimationSequence} from './animation_validator_visitor';


/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular2's
 animation DSL language. If this information is new, please navigate to the {@link
 Component#animations-anchor component animations metadata page} to gain a better understanding of
 how animations in Angular2 are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and {@link
 transition transition} entries that will be evaluated when the expression bound to the trigger
 changes.
 *
 * Triggers are registered within the component annotation data under the {@link
 Component#animations-anchor animations section}. An animation trigger can be placed on an element
 within a template by referencing the name of the trigger followed by the expression value that the
 trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 provided `animation` value is expected to be an array consisting of {@link state state} and {@link
 transition transition} declarations.
 *
 * ```typescript
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *       state(...),
 *       state(...),
 *       transition(...),
 *       transition(...)
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "something";
 * }
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 tools/gulp-tasks/validate-commit-message.js ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function trigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger {
  return new AnimationTriggerVisitor().buildTrigger(name, definitions);
}

/**
* @experimental Animation support is experimental.
*/
export class AnimationTrigger implements Trigger {
  public transitionFactories: AnimationTransitionFactory[] = [];
  public states: {[stateName: string]: StyleData} = {};

  constructor(
      public name: string, states: {[stateName: string]: StyleData},
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

  matchTransition(currentState: any, nextState: any): AnimationTransitionInstruction {
    for (let i = 0; i < this.transitionFactories.length; i++) {
      let result = this.transitionFactories[i].match(currentState, nextState);
      if (result) return result;
    }
    return null;
  }
}

class AnimationTriggerContext {
  public errors: string[] = [];
  public states: {[stateName: string]: StyleData} = {};
  public transitions: AnimationTransitionMetadata[] = [];
}

class AnimationTriggerVisitor implements AnimationDslVisitor {
  buildTrigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger {
    const context = new AnimationTriggerContext();
    definitions.forEach(def => visitAnimationNode(this, def, context));
    return new AnimationTrigger(name, context.states, context.transitions);
  }

  visitState(ast: AnimationStateMetadata, context: any): any {
    context.states[ast.name] = normalizeStyles(new AnimationStyles(ast.styles.styles));
  }

  visitTransition(ast: AnimationTransitionMetadata, context: any): any {
    context.transitions.push(ast);
  }

  visitSequence(ast: AnimationSequenceMetadata, context: any) {}
  visitGroup(ast: AnimationGroupMetadata, context: any) {}
  visitAnimate(ast: AnimationAnimateMetadata, context: any) {}
  visitStyle(ast: AnimationStyleMetadata, context: any) {}
  visitKeyframeSequence(ast: AnimationKeyframesSequenceMetadata, context: any) {}
}
