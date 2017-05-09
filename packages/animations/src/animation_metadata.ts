/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface ɵStyleData { [key: string]: string|number; }

/**
 * @experimental Animation support is experimental.
 */
export declare type AnimateTimings = {
  duration: number,
  delay: number,
  easing: string | null
};

/**
 * @experimental Animation support is experimental.
 */
export const enum AnimationMetadataType {
  State,
  Transition,
  Sequence,
  Group,
  Animate,
  KeyframeSequence,
  Style
}

/**
 * @experimental Animation support is experimental.
 */
export const AUTO_STYLE = '*';

/**
 * @experimental Animation support is experimental.
 */
export interface AnimationMetadata { type: AnimationMetadataType; }

/**
 * @experimental Animation support is experimental.
 */
export interface AnimationTriggerMetadata {
  name: string;
  definitions: AnimationMetadata[];
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link state state animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationStateMetadata extends AnimationMetadata {
  name: string;
  styles: AnimationStyleMetadata;
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link transition transition animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationTransitionMetadata extends AnimationMetadata {
  expr: string|((fromState: string, toState: string) => boolean);
  animation: AnimationMetadata|AnimationMetadata[];
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link keyframes keyframes animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
  steps: AnimationStyleMetadata[];
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link style style animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationStyleMetadata extends AnimationMetadata {
  styles: {[key: string]: string | number}|{[key: string]: string | number}[];
  offset?: number;
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link animate animate animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationAnimateMetadata extends AnimationMetadata {
  timings: string|number|AnimateTimings;
  styles: AnimationStyleMetadata|AnimationKeyframesSequenceMetadata|null;
}

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link sequence sequence animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationSequenceMetadata extends AnimationMetadata { steps: AnimationMetadata[]; }

/**
 * Metadata representing the entry of animations. Instances of this class are provided via the
 * animation DSL when the {@link group group animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationGroupMetadata extends AnimationMetadata { steps: AnimationMetadata[]; }

/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular's
 animation DSL language. If this information is new, please navigate to the {@link
 Component#animations component animations metadata page} to gain a better understanding of
 how animations in Angular are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and {@link
 transition transition} entries that will be evaluated when the expression bound to the trigger
 changes.
 *
 * Triggers are registered within the component annotation data under the {@link
 Component#animations animations section}. An animation trigger can be placed on an element
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
export function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata {
  return {name, definitions};
}

/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {@link sequence an animation sequence}, {@link group group}, or {@link
 * transition transition}.
 *
 * ### Usage
 *
 * The `animate` function accepts two input parameters: `timing` and `styles`:
 *
 * - `timing` is a string based value that can be a combination of a duration with optional delay
 * and easing values. The format for the expression breaks down to `duration delay easing`
 * (therefore a value such as `1s 100ms ease-out` will be parse itself into `duration=1000,
 * delay=100, easing=ease-out`. If a numeric value is provided then that will be used as the
 * `duration` value in millisecond form.
 * - `styles` is the style input data which can either be a call to {@link style style} or {@link
 * keyframes keyframes}. If left empty then the styles from the destination state will be collected
 * and used (this is useful when describing an animation step that will complete an animation by
 * {@link transition#the-final-animate-call animating to the final state}).
 *
 * ```typescript
 * // various functions for specifying timing data
 * animate(500, style(...))
 * animate("1s", style(...))
 * animate("100ms 0.5s", style(...))
 * animate("5s ease", style(...))
 * animate("5s 10ms cubic-bezier(.17,.67,.88,.1)", style(...))
 *
 * // either style() of keyframes() can be used
 * animate(500, style({ background: "red" }))
 * animate(500, keyframes([
 *   style({ background: "blue" })),
 *   style({ background: "red" }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function animate(
    timings: string | number, styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata |
        null = null): AnimationAnimateMetadata {
  return {type: AnimationMetadataType.Animate, styles: styles, timings: timings};
}

/**
 * `group` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different statrting/ending times.
 *
 * The `group` function can either be used within a {@link sequence sequence} or a {@link transition
 * transition} and it will only continue to the next instruction once all of the inner animation
 * steps have completed.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `group` animation function can either consist of {@link
 * style style} or {@link animate animate} function calls. Each call to `style()` or `animate()`
 * within a group will be executed instantly (use {@link keyframes keyframes} or a {@link
 * animate#usage animate() with a delay value} to offset styles to be applied at a later time).
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function group(steps: AnimationMetadata[]): AnimationGroupMetadata {
  return {type: AnimationMetadataType.Group, steps: steps};
}

/**
 * `sequence` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used by
 * default when an array is passed as animation data into {@link transition transition}.)
 *
 * The `sequence` function can either be used within a {@link group group} or a {@link transition
 * transition} and it will only continue to the next instruction once each of the inner animation
 * steps have completed.
 *
 * To perform animation styling in parallel with other animation steps then have a look at the
 * {@link group group} animation function.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `sequence` animation function can either consist of
 * {@link style style} or {@link animate animate} function calls. A call to `style()` will apply the
 * provided styling data immediately while a call to `animate()` will apply its styling data over a
 * given time depending on its timing data.
 *
 * ```typescript
 * sequence([
 *   style({ opacity: 0 })),
 *   animate("1s", { opacity: 1 }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata {
  return {type: AnimationMetadataType.Sequence, steps: steps};
}

/**
 * `style` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {@link state animation states}, within an {@link sequence animation sequence}, or as styling data
 * for both {@link animate animate} and {@link keyframes keyframes}.
 *
 * ### Usage
 *
 * `style` takes in a key/value string map as data and expects one or more CSS property/value pairs
 * to be defined.
 *
 * ```typescript
 * // string values are used for css properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical (pixel) values are also supported
 * style({ width: 100, height: 0 })
 * ```
 *
 * #### Auto-styles (using `*`)
 *
 * When an asterix (`*`) character is used as a value then it will be detected from the element
 * being animated and applied as animation data when the animation starts.
 *
 * This feature proves useful for a state depending on layout and/or environment factors; in such
 * cases the styles are calculated just before the animation starts.
 *
 * ```typescript
 * // the steps below will animate from 0 to the
 * // actual height of the element
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function style(
    tokens: {[key: string]: string | number} |
    Array<{[key: string]: string | number}>): AnimationStyleMetadata {
  return {type: AnimationMetadataType.Style, styles: tokens};
}

/**
 * `state` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `state` declares an animation state within the given trigger. When a state is active within a
 * component then its associated styles will persist on the element that the trigger is attached to
 * (even when the animation ends).
 *
 * To animate between states, have a look at the animation {@link transition transition} DSL
 * function. To register states to an animation trigger please have a look at the {@link trigger
 * trigger} function.
 *
 * #### The `void` state
 *
 * The `void` state value is a reserved word that angular uses to determine when the element is not
 * apart of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
 * associated element is void).
 *
 * #### The `*` (default) state
 *
 * The `*` state (when styled) is a fallback state that will be used if the state that is being
 * animated is not declared within the trigger.
 *
 * ### Usage
 *
 * `state` will declare an animation state with its associated styles
 * within the given trigger.
 *
 * - `stateNameExpr` can be one or more state names separated by commas.
 * - `styles` refers to the {@link style styling data} that will be persisted on the element once
 * the state has been reached.
 *
 * ```typescript
 * // "void" is a reserved name for a state and is used to represent
 * // the state in which an element is detached from from the application.
 * state("void", style({ height: 0 }))
 *
 * // user-defined states
 * state("closed", style({ height: 0 }))
 * state("open, visible", style({ height: "*" }))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function state(name: string, styles: AnimationStyleMetadata): AnimationStateMetadata {
  return {type: AnimationMetadataType.State, name: name, styles: styles};
}

/**
 * `keyframes` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `keyframes` specifies a collection of {@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * ### Usage
 *
 * The `keyframes` animation function is designed to be used alongside the {@link animate animate}
 * animation function. Instead of applying animations from where they are currently to their
 * destination, keyframes can describe how each style entry is applied and at what point within the
 * animation arc (much like CSS Keyframe Animations do).
 *
 * For each `style()` entry an `offset` value can be set. Doing so allows to specifiy at what
 * percentage of the animate time the styles will be applied.
 *
 * ```typescript
 * // the provided offset values describe when each backgroundColor value is applied.
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * Alternatively, if there are no `offset` values used within the style entries then the offsets
 * will be calculated automatically.
 *
 * ```typescript
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata {
  return {type: AnimationMetadataType.KeyframeSequence, steps: steps};
}

/**
 * `transition` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `transition` declares the {@link sequence sequence of animation steps} that will be run when the
 * provided `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 =>
 * state2` which consists of two known states (use an asterix (`*`) to refer to a dynamic starting
 * and/or ending state).
 *
 * A function can also be provided as the `stateChangeExpr` argument for a transition and this
 * function will be executed each time a state change occurs. If the value returned within the
 * function is true then the associated animation will be run.
 *
 * Animation transitions are placed within an {@link trigger animation trigger}. For an transition
 * to animate to a state value and persist its styles then one or more {@link state animation
 * states} is expected to be defined.
 *
 * ### Usage
 *
 * An animation transition is kicked off the `stateChangeExpr` predicate evaluates to true based on
 * what the previous state is and what the current state has become. In other words, if a transition
 * is defined that matches the old/current state criteria then the associated animation will be
 * triggered.
 *
 * ```typescript
 * // all transition/state changes are defined within an animation trigger
 * trigger("myAnimationTrigger", [
 *   // if a state is defined then its styles will be persisted when the
 *   // animation has fully completed itself
 *   state("on", style({ background: "green" })),
 *   state("off", style({ background: "grey" })),
 *
 *   // a transition animation that will be kicked off when the state value
 *   // bound to "myAnimationTrigger" changes from "on" to "off"
 *   transition("on => off", animate(500)),
 *
 *   // it is also possible to do run the same animation for both directions
 *   transition("on <=> off", animate(500)),
 *
 *   // or to define multiple states pairs separated by commas
 *   transition("on => off, off => void", animate(500)),
 *
 *   // this is a catch-all state change for when an element is inserted into
 *   // the page and the destination state is unknown
 *   transition("void => *", [
 *     style({ opacity: 0 }),
 *     animate(500)
 *   ]),
 *
 *   // this will capture a state change between any states
 *   transition("* => *", animate("1s 0s")),
 *
 *   // you can also go full out and include a function
 *   transition((fromState, toState) => {
 *     // when `true` then it will allow the animation below to be invoked
 *     return fromState == "off" && toState == "on";
 *   }, animate("1s 0s"))
 * ])
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * #### The final `animate` call
 *
 * If the final step within the transition steps is a call to `animate()` that **only** uses a
 * timing value with **no style data** then it will be automatically used as the final animation arc
 * for the element to animate itself to the final state. This involves an automatic mix of
 * adding/removing CSS styles so that the element will be in the exact state it should be for the
 * applied state to be presented correctly.
 *
 * ```
 * // start off by hiding the element, but make sure that it animates properly to whatever state
 * // is currently active for "myAnimationTrigger"
 * transition("void => *", [
 *   style({ opacity: 0 }),
 *   animate(500)
 * ])
 * ```
 *
 * ### Transition Aliases (`:enter` and `:leave`)
 *
 * Given that enter (insertion) and leave (removal) animations are so common, the `transition`
 * function accepts both `:enter` and `:leave` values which are aliases for the `void => *` and `*
 * => void` state changes.
 *
 * ```
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 * ])
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function transition(
    stateChangeExpr: string | ((fromState: string, toState: string) => boolean),
    steps: AnimationMetadata | AnimationMetadata[]): AnimationTransitionMetadata {
  return {type: AnimationMetadataType.Transition, expr: stateChangeExpr, animation: steps};
}
