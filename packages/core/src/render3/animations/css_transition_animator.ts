/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Animator, AnimatorState, RenderUtil, StylingEffect, Timing} from './interfaces';
import {AUTO_STYLE} from './tokens';
import {applyClassChanges, applyStyle, applyStyleChanges, now, readStyle} from './util';



/**
 * This file introduces a transition animator which is designed to
 * handle multiple class/style transitions on an element at the same
 * time.
 */

/**
 * When ALL transitions are cancelled then the styling below
 * will force every transition arc to be interupted.
 */
const CANCEL_ALL_TRANSITIONS_VALUE = '0s none';

/**
 * This will force the very next styles that are applied to
 * be applied IMMEDIATELY to the element (so long as a reflow
 * is issued before the transition value is changed afterwards)
 */
const CANCEL_NEXT_TRANSITION_VALUE = '0s all';

/**
 * Special, internal-only version of StylingEffect
 * which is specific to the transition animator.
 *
 * The preComputedStyles member value (which is
 * either specific dimensional styles or any
 * styles marked with an AUTO_STYLE value) are
 * picked up by the transition animator and
 * evaluated just as the effects are processed.
 */
const enum InstructionType {
  Snapshot = 1,
  Animation = 2,
}

interface Instruction {
  effect: StylingEffect;
  type: InstructionType;
  transitionStyle: string;
}

interface AnimationInstruction extends Instruction {
  type: InstructionType.Animation;
  styles: {[key: string]: any}|null;
  classes: {[key: string]: any}|null;
  computeStyles: string[]|null;
  isPropMultiTransition: boolean;
}

interface SnapshotInstruction extends Instruction {
  type: InstructionType.Snapshot;
  computeStyles: string[];
}

const DEFAULT_TRANSITION_PROP = 'all';

/**
 * The CssTransitionAnimator is primarily (in modern browsers) used
 * to animate CSS class (which can ONLY be animated using transitions
 * and inline style transitions together in the same animation arcs.
 *
 * CSS transitions (when interfaced with in JavaScript) do not have a
 * straightforward API. The only way to detect if a transition ends
 * (when the animation finishes) is by use of the `transitionend` event.
 * Despite the event being supported by all browsers, the behavior of
 * the event is very limited because it will only fire on CSS property
 * changes and NOT on CSS class changes. This means that to properly rely
 * on the event then each of the CSS styles need to be known (which is
 * impossible to know upfront since CSS classes are hidden within CSS
 * stylesheets and may change based on media queries and DOM state).
 *
 * Despite this limitation, the transition animator class below still
 * uses the `transitionend` event to detect for animations that
 * end. It will wait for the largest-timed `transitionend` event to
 * fire and capture that and then end all the transitions afterwards.
 * For this to work, all the styles and classes are applied onto the
 * element using various, comma-separated transition strings (one for
 * each style/class effect that is added to the animator).
 *
 * The reason all classes/styles on the same element are combined together
 * into the animator for the same element are due to the following reasons:
 *
 * 1. To figure out what the maximum wait time is for the full transition
 *    and then to check against that after every `transitionend` event
 *    fires.
 * 2. To setup a `setTimeout` fallback that will fire in the event that
 *    `transitionend` fails to fire (which can happen if there are no
 *    styles set to animate due to a missing class or no style changes)
 * 3. To apply the transition timing styles one by one onto the element
 *    with a reflow frame in between (this causes one set of classes/styles
 *    to animate before another which inturn allows for multiple CSS
 *    transitions to fire on a single element at the same time).
 *
 * Once the animator starts and the transitions are applied, each
 * transition string value is applied in the following way.
 *
 * 1. Apply first transition (e.g. style="transition: 1s all")
 * 2. Apply the classes and/or styles present in the queued transition
 *    (this kicks off the transition for that given styles/classes effect)
 * 3. Run a reflow (which uses measurement computation + RAF)
 * 4. Then repeat from step 1 and apply the next transition effect
 *
 * Once the classes/styles and transition strings have all been applied
 * then the player code will wait for `transitionend` and will then
 * only finish the transition animation once the longest transition
 * animation has finished (or the timer runs out).
 *
 * Only once all the transitions are finished then the underlying transition
 * style string will be removed from the element.
 */
export class CssTransitionAnimator implements Animator {
  state: AnimatorState = AnimatorState.Idle;

  private _listeners: (() => any)[] = [];
  private _pendingInstructions: Instruction[] = [];
  private _activeAnimationInstructions: AnimationInstruction[] = [];
  private _collectedClasses: {[className: string]: boolean}|null;
  private _collectedStyles: {[key: string]: any}|null;
  private _activeComputedStyles: {[key: string]: any}|null = null;
  private _captureFn: (event: AnimationEvent) => any;
  private _startTime = 0;
  private _maxTime = 0;
  private _timer: any;
  private _currentTransitionStr: string = '';
  private _waitingForFrameFns: (() => any)[] = [];
  private _lastTransitionToken: string = '';
  private _pendingFrame = false;

  constructor(
      private _element: HTMLElement, private _renderUtil: RenderUtil, collectStyling?: boolean) {
    this._captureFn = (event: AnimationEvent) => {
      const totalTime = event.timeStamp - this._startTime;
      if (event.target === this._element) {
        event.stopPropagation();
        if (totalTime >= this._maxTime) {
          this._onAllEffectsFinished();
        }
      }
    };
    this._element.addEventListener('transitionend', this._captureFn, {capture: true});
    this._collectedClasses = collectStyling ? {} : null;
    this._collectedStyles = collectStyling ? {} : null;
  }

  onAllEffectsDone(cb: () => any) { this._listeners.push(cb); }

  addEffect(effect: StylingEffect) {
    const {classes, timing} = effect;
    const time = this._computeTransitionTime(timing);
    this._maxTime = Math.max(this._maxTime, time);

    // if and when styles are used we want to figure out what properties
    // are set to auto style animate and which ones are being removed.
    // If either is true then we need to signal the animator to pre-compute
    // the missing/auto style values once the effects are processed.
    let computeStylesDuringEffect: string[]|null = null;
    let computeStylesBeforeEffect: string[]|null = null;

    let singleTransitionProp = null;
    let styles: {[key: string]: any}|null = null;
    if (effect.styles) {
      styles = {};
      computeStylesDuringEffect = [];
      computeStylesBeforeEffect = [];
      const props = Object.keys(effect.styles);
      singleTransitionProp = props.length == 1 ? props[0] : null;
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        let value = effect.styles[prop];
        const computeStatus = determineWhetherToCompute(prop, value);
        switch (computeStatus) {
          case -1:
            computeStylesBeforeEffect.push(prop);
            break;
          case 1:
            computeStylesDuringEffect.push(prop);
            value = AUTO_STYLE;
            break;
        }
        styles[prop] = value;
      }
    }

    const transitionProp = (!classes && singleTransitionProp) || DEFAULT_TRANSITION_PROP;
    if (computeStylesBeforeEffect && computeStylesBeforeEffect.length) {
      this._pendingInstructions.push({
        effect, type: InstructionType.Snapshot, computeStyles: computeStylesBeforeEffect,
            transitionStyle: `0s ${transitionProp}`
      } as SnapshotInstruction);
    }

    const transitionStyle = buildTransitionStr(timing, transitionProp);
    this._pendingInstructions.push({
      effect, type: InstructionType.Animation, styles, transitionStyle,
          classes: classes ? {...classes} : null,
          computeStyles: (computeStylesDuringEffect && computeStylesDuringEffect !.length) ?
          computeStylesDuringEffect :
          null,
          isPropMultiTransition: transitionProp === DEFAULT_TRANSITION_PROP
    } as AnimationInstruction);
  }

  private _computeTransitionTime(timing: Timing) {
    // the goal is to figure out the total time of this transitions
    // when mixed together with the existing or soon-to-run transitions
    // because `transitionend` events are not 100% reliable (this is
    // explained at the top of this file). Having the total time allows
    // for a fallback timer to be scheduled/replaced so that the final
    // styling can be cleaned up and the transition can be explitly finished.
    const elapsedTimeSoFar = this.state === AnimatorState.Running ? (now() - this._startTime) : 0;
    return elapsedTimeSoFar + timing.duration + timing.delay;
  }

  finishEffect(effect: StylingEffect) { this._finishOrDestroyEffect(effect, false); }

  destroyEffect(effect: StylingEffect) { this._finishOrDestroyEffect(effect, true); }

  private _finishOrDestroyEffect(effect: StylingEffect, destroy: boolean) {
    // we wait for a frame in the event that the effect (or any other effects)
    // have been scheduled to be flushed
    this._waitForFrame(() => {
      this._applyTransition(CANCEL_NEXT_TRANSITION_VALUE);
      this._applyStyling(effect, true);

      if (destroy) {
        this._waitForFrame(() => this._cleanupEffect(effect));
      } else {
        this._waitForFrame(() => {
          this._applyStyling(effect);
          this._waitForFrame(() => this._cleanupEffect(effect));
        });
      }
    });
  }

  private _cleanupComputedStyles(computedStyles: string[]) {
    for (let i = 0; i < computedStyles.length; i++) {
      const prop = computedStyles[i];
      const computedValue = this._activeComputedStyles && this._activeComputedStyles[prop];
      const activeValue = readStyle(this._element, prop);
      if (computedValue && computedValue === activeValue) {
        // if exactly the same then this means that the AUTO_STYLE was
        // the final styling for the element which means that it was never
        // intended to stick around once the animation is over
        this._activeComputedStyles ![prop] = null;
        applyStyle(this._element, prop, null);
      }
    }
  }

  private _cleanupEffect(effect: StylingEffect) {
    const effectIndex = findMatchingEffect(this._activeAnimationInstructions, effect);
    if (effectIndex >= 0) {
      const activeEffect = this._activeAnimationInstructions[effectIndex];
      this._activeAnimationInstructions.splice(effectIndex, 1);
      if (activeEffect.computeStyles) {
        this._cleanupComputedStyles(activeEffect.computeStyles);
      }
    }

    this._flushNextEffect();
    const time = this._computeTransitionTime(effect.timing);
    if (time >= this._maxTime) {
      this._onAllEffectsFinished();
    }
  }

  private _applyStyling(
      effect: StylingEffect|AnimationInstruction, revert?: boolean,
      preComputedStyles?: {[key: string]: any}|null) {
    effect.classes &&
        applyClassChanges(this._element, effect.classes, revert, this._collectedClasses);
    effect.styles &&
        applyStyleChanges(
            this._element, effect.styles, null, revert, preComputedStyles, this._collectedStyles);
  }

  private _waitForFrame(cb?: () => any) {
    if (!this._pendingFrame) {
      this._pendingFrame = true;
      let flushFn: Function;
      this._renderUtil.fireReflow(this._element, flushFn = () => {
        this._pendingFrame = false;
        // this is eagerly assigned to avoid having
        // the frames grow (those are scheduled later)
        const framesToIterate = this._waitingForFrameFns;
        this._waitingForFrameFns = [];
        for (let i = 0; i < framesToIterate.length; i++) {
          framesToIterate[i]();
        }
        if (this._waitingForFrameFns.length && !this._pendingFrame) {
          this._pendingFrame = true;
          this._renderUtil.fireReflow(this._element, flushFn);
        } else {
          this._pendingFrame = false;
        }
      });
    }
    cb && this._waitingForFrameFns.push(cb);
  }

  private _computeStyles(instruction: AnimationInstruction) {
    const computeStyles = instruction.computeStyles !;
    const duration = instruction.effect.timing.duration;
    const currentStyles: {[key: string]: any} = {};
    computeStyles.forEach(prop => {
      currentStyles[prop] = this._renderUtil.getComputedStyle(this._element, prop);
      this._element.style.removeProperty(prop);
    });

    const propToBlock = computeStyles.length === 1 ? computeStyles[0] : DEFAULT_TRANSITION_PROP;
    const timing = {duration, delay: -duration, easing: null, fill: null};
    const transitionPrefix =
        this._currentTransitionStr + (this._currentTransitionStr.length ? ', ' : '');
    const transitionStr = transitionPrefix + buildTransitionStr(timing, propToBlock);
    this._renderUtil.setTransition(this._element, transitionStr);

    const computedStyles: {[key: string]: any} = {};
    computeStyles.forEach(prop => {
      computedStyles ![prop] = this._renderUtil.getComputedStyle(this._element, prop);
      this._element.style.setProperty(prop, currentStyles[prop]);
    });

    this._renderUtil.fireReflow(this._element, null);
    return computedStyles;
  }

  /**
   * This method is responsible for applying each style/class effect
   * onto the element with its associated transition timing string.
   *
   * The main point to take from this is that each effect MUST be applied
   * in between reflows so that the browser can kick off each style/class
   * rendering. Otherwise if everything is applied at once synchronously
   * then each subsequent class/style effect would be animated after the
   * last transition style is applied.
   *
   * It's pretty uncommon that multiple classes/styles are applied with
   * different transition timing values. Therefore it's only when this
   * occurs that reflows + requestAnimationFrame calls are used.
   */
  private _flushNextEffect() {
    this.state = AnimatorState.ProcessingEffects;
    let doIssueReflow = false;

    if (this._pendingInstructions.length) {
      const instruction = this._pendingInstructions.shift() !;
      if (instruction.type === InstructionType.Snapshot) {
        const stylesToCompute = (instruction as SnapshotInstruction).computeStyles;
        for (let i = 0; i < stylesToCompute.length; i++) {
          const prop = stylesToCompute[i];
          let value = readStyle(this._element, prop);
          if (!value) {
            value = this._renderUtil.getComputedStyle(this._element, prop);
            applyStyle(this._element, prop, value);
            doIssueReflow = true;
          }
        }
        if (doIssueReflow) {
          // if all computed styles were detected directly on the element
          // then there is no need to trigger a reflow to run since there
          // was no style computation. This means the next instruction can
          // immediately take place.
          this._applyTransition(instruction.transitionStyle);
        }
      } else if (instruction.type === InstructionType.Animation) {
        const animationInstruction = instruction as AnimationInstruction;
        const computedStyles =
            animationInstruction.computeStyles ? this._computeStyles(animationInstruction) : null;
        if (computedStyles || animationInstruction.transitionStyle != this._lastTransitionToken) {
          this._applyTransition(animationInstruction.transitionStyle);
          if (computedStyles) {
            if (this._activeComputedStyles == null) {
              this._activeComputedStyles = {};
            }
            this._activeComputedStyles = {...this._activeComputedStyles, ...computedStyles};
          }
        }
        this._applyStyling(animationInstruction, false, computedStyles);
        this._activeAnimationInstructions.push(animationInstruction);
        doIssueReflow = animationInstruction.isPropMultiTransition;
      }
    }

    // all the effects have been applied ... Now set the element
    // into place so that a follow-up transition can be applied
    if (this._pendingInstructions.length) {
      if (doIssueReflow) {
        this._renderUtil.fireReflow(this._element, () => this._flushNextEffect());
      } else {
        this._flushNextEffect();
      }
    } else {
      this.state = AnimatorState.Running;
    }
  }

  private _applyTransition(transitionToken: string) {
    this._lastTransitionToken = transitionToken;
    const transitionPrefix =
        this._currentTransitionStr + (this._currentTransitionStr.length ? ', ' : '');
    this._currentTransitionStr = transitionPrefix + transitionToken;
    this._renderUtil.setTransition(this._element, this._currentTransitionStr);
  }

  private _updateTimer() {
    // Sometimes a transition animation may not animate anything at all
    // due to missing classes or there being zero change in styling (
    // the element already has the same styling that is being animated).
    // There is no way for JS code to detect for this and the ONLY way
    // to guarantee that the player finishes is to setup a timer that acts
    // as a fallback incase this happens. The reason why the variable below
    // has an extra buffer value is because the browser usually isn't quick
    // enough to trigger a transition and fire the ending callback in the
    // exact amount of time that the transition lasts for (therefore the
    // buffer allows for the animation to properly do its job in time).
    if (this._timer) {
      this._renderUtil ? this._renderUtil.clearTimeout(this._timer) : clearTimeout(this._timer);
    }

    const HALF_A_SECOND = 500;
    const maxTimeWithBuffer = this._maxTime + HALF_A_SECOND;
    const cb = () => this._onAllEffectsFinished();
    this._timer = this._renderUtil ? this._renderUtil.setTimeout(cb, maxTimeWithBuffer) :
                                     setTimeout(cb, maxTimeWithBuffer);
  }

  private _onAllEffectsFinished() {
    if (this.state >= AnimatorState.Running && this.state <= AnimatorState.Exiting) {
      if (this._activeComputedStyles) {
        this._cleanupComputedStyles(Object.keys(this._activeComputedStyles));
        this._activeComputedStyles = null;
      }
      this._maxTime = 0;
      this._currentTransitionStr = '';
      this._lastTransitionToken = '';
      this._activeAnimationInstructions.length = 0;
      this._renderUtil.setTransition(this._element, null);
      this.state = AnimatorState.Idle;
      for (let i = 0; i < this._listeners.length; i++) {
        this._listeners[i]();
      }
      this._listeners.length = 0;
    }
  }

  scheduleFlush() {
    if (this.state !== AnimatorState.WaitingForFlush) {
      this._waitForFrame(() => this.flushEffects());
    }
  }

  flushEffects(): boolean {
    if (this.state !== AnimatorState.ProcessingEffects && this._pendingInstructions.length) {
      this._startTime = now();
      this._flushNextEffect();
      this._updateTimer();
      return true;
    }
    return false;
  }

  finishAll() {
    this._renderUtil.setTransition(this._element, CANCEL_ALL_TRANSITIONS_VALUE);
    this.state = AnimatorState.Exiting;
    this._renderUtil.fireReflow(this._element, () => this._onAllEffectsFinished());
  }

  destroy() {
    if (this.state < AnimatorState.Exiting) {
      this.state = AnimatorState.Exiting;
      this._renderUtil.setTransition(this._element, CANCEL_ALL_TRANSITIONS_VALUE);
      this._element.removeEventListener('transitionend', this._captureFn);

      this._renderUtil.fireReflow(this._element, () => {
        this._onAllEffectsFinished();
        this.state = AnimatorState.Destroyed;
        this._collectedClasses && applyClassChanges(this._element, this._collectedClasses, true);
        this._collectedStyles &&
            applyStyleChanges(this._element, this._collectedStyles, null, true, null);
      });
    }
  }
}

function buildTransitionStr(timing: Timing, props: string): string {
  return `${timing.duration}ms ${props} ${timing.delay}ms${timing.easing ? (' ' + timing.easing) : ''}`;
}

function determineWhetherToCompute(prop: string, value: string): -1|0|1 {
  if (value === AUTO_STYLE) return 1;
  switch (prop) {
    case 'width':
    case 'height':
      return value ? -1 : 1;
  }
  return 0;
}

function findMatchingEffect(instructions: AnimationInstruction[], effect: StylingEffect): number {
  for (let i = 0; i < instructions.length; i++) {
    if (instructions[i].effect === effect) return i;
  }
  return -1;
}
