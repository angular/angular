/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface ɵStyleData { [key: string]: string|number; }

/**
 * Metadata representing the entry of animations. Instances of this interface are created internally
 * within the Angular animation DSL.
 *
 * @experimental Animation support is experimental.
 */
export declare type AnimateTimings = {
  duration: number,
  delay: number,
  easing: string | null
};

/**
 * `AnimationOptions` represents options that can be passed into most animation DSL methods.
 * When options are provided, the delay value of an animation can be changed and animation input
 * parameters can be passed in to change styling and timing data when an animation is started.
 *
 * The following animation DSL functions are able to accept animation option data:
 *
 * - {@link transition transition()}
 * - {@link sequence sequence()}
 * - {@link group group()}
 * - {@link query query()}
 * - {@link animation animation()}
 * - {@link useAnimation useAnimation()}
 * - {@link animateChild animateChild()}
 *
 * Programmatic animations built using {@link AnimationBuilder the AnimationBuilder service} also
 * make use of AnimationOptions.
 *
 * @experimental Animation support is experimental.
 */
export declare interface AnimationOptions {
  delay?: number|string;
  params?: {[name: string]: any};
}

/**
 * Metadata representing the entry of animations. Instances of this interface are created internally
 * within the Angular animation DSL when {@link animateChild animateChild()} is used.
 *
 * @experimental Animation support is experimental.
 */
export declare interface AnimateChildOptions extends AnimationOptions { duration?: number|string; }

/**
 * Metadata representing the entry of animations. Usages of this enum are created
 * each time an animation DSL function is used.
 *
 * @experimental Animation support is experimental.
 */
export const enum AnimationMetadataType {
  State = 0,
  Transition = 1,
  Sequence = 2,
  Group = 3,
  Animate = 4,
  Keyframes = 5,
  Style = 6,
  Trigger = 7,
  Reference = 8,
  AnimateChild = 9,
  AnimateRef = 10,
  Query = 11,
  Stagger = 12
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
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link trigger trigger animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationTriggerMetadata extends AnimationMetadata {
  name: string;
  definitions: AnimationMetadata[];
  options: {params?: {[name: string]: any}}|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link state state animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationStateMetadata extends AnimationMetadata {
  name: string;
  styles: AnimationStyleMetadata;
  options?: {params: {[name: string]: any}};
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link transition transition animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationTransitionMetadata extends AnimationMetadata {
  expr: string;
  animation: AnimationMetadata|AnimationMetadata[];
  options: AnimationOptions|null;
}

/**
 * @experimental Animation support is experimental.
 */
export interface AnimationReferenceMetadata extends AnimationMetadata {
  animation: AnimationMetadata|AnimationMetadata[];
  options: AnimationOptions|null;
}

/**
 * @experimental Animation support is experimental.
 */
export interface AnimationQueryMetadata extends AnimationMetadata {
  selector: string;
  animation: AnimationMetadata|AnimationMetadata[];
  options: AnimationQueryOptions|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link keyframes keyframes animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
  steps: AnimationStyleMetadata[];
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link style style animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationStyleMetadata extends AnimationMetadata {
  styles: '*'|{[key: string]: string | number}|Array<{[key: string]: string | number}|'*'>;
  offset: number|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link animate animate animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationAnimateMetadata extends AnimationMetadata {
  timings: string|number|AnimateTimings;
  styles: AnimationStyleMetadata|AnimationKeyframesSequenceMetadata|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link animateChild animateChild animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationAnimateChildMetadata extends AnimationMetadata {
  options: AnimationOptions|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link useAnimation useAnimation animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationAnimateRefMetadata extends AnimationMetadata {
  animation: AnimationReferenceMetadata;
  options: AnimationOptions|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link sequence sequence animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationSequenceMetadata extends AnimationMetadata {
  steps: AnimationMetadata[];
  options: AnimationOptions|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link group group animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export interface AnimationGroupMetadata extends AnimationMetadata {
  steps: AnimationMetadata[];
  options: AnimationOptions|null;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link query query animation function} is called.
 *
 * @experimental Animation support is experimental.
 */
export declare interface AnimationQueryOptions extends AnimationOptions {
  optional?: boolean;
  limit?: number;
}

/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {@link stagger stagger animation function} is called.
 *
* @experimental Animation support is experimental.
*/
export interface AnimationStaggerMetadata extends AnimationMetadata {
  timings: string|number;
  animation: AnimationMetadata|AnimationMetadata[];
}

/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better
 * understanding of how animations in Angular are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and
 * {@link transition transition} entries that will be evaluated when the expression
 * bound to the trigger changes.
 *
 * Triggers are registered within the component annotation data under the
 * {@link Component#animations animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that
 the
 * trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {@link state state} and
 * {@link transition transition} declarations.
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
 * ```
 *
 * ## Disable Animations
 * A special animation control binding called `@.disabled` can be placed on an element which will
 then disable animations for any inner animation triggers situated within the element as well as
 any animations on the element itself.
 *
 * When true, the `@.disabled` binding will prevent all animations from rendering. The example
 below shows how to use this feature:
 *
 * ```ts
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     <div [@.disabled]="isDisabled">
 *       <div [@childAnimation]="exp"></div>
 *     </div>
 *   `,
 *   animations: [
 *     trigger("childAnimation", [
 *       // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   isDisabled = true;
 *   exp = '...';
 * }
 * ```
 *
 * The `@childAnimation` trigger will not animate because `@.disabled` prevents it from happening
 (when true).
 *
 * Note that `@.disbled` will only disable all animations (this means any animations running on
 * the same element will also be disabled).
 *
 * ### Disabling Animations Application-wide
 * When an area of the template is set to have animations disabled, **all** inner components will
 also have their animations disabled as well. This means that all animations for an angular
 application can be disabled by placing a host binding set on `@.disabled` on the topmost Angular
 component.
 *
 * ```ts
 * import {Component, HostBinding} from '@angular/core';
 *
 * @Component({
 *   selector: 'app-component',
 *   templateUrl: 'app.component.html',
 * })
 * class AppComponent {
 *   @HostBinding('@.disabled')
 *   public animationsDisabled = true;
 * }
 * ```
 *
 * ### What about animations that us `query()` and `animateChild()`?
 * Despite inner animations being disabled, a parent animation can {@link query query} for inner
 elements located in disabled areas of the template and still animate them as it sees fit. This is
 also the case for when a sub animation is queried by a parent and then later animated using {@link
 animateChild animateChild}.
 *
 * @experimental Animation support is experimental.
 */
export function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata {
  return {type: AnimationMetadataType.Trigger, name, definitions, options: {}};
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
  return {type: AnimationMetadataType.Animate, styles, timings};
}

/**
 * `group` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different starting/ending times.
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
export function group(
    steps: AnimationMetadata[], options: AnimationOptions | null = null): AnimationGroupMetadata {
  return {type: AnimationMetadataType.Group, steps, options};
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
export function sequence(steps: AnimationMetadata[], options: AnimationOptions | null = null):
    AnimationSequenceMetadata {
  return {type: AnimationMetadataType.Sequence, steps, options};
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
    tokens: '*' | {[key: string]: string | number} |
    Array<'*'|{[key: string]: string | number}>): AnimationStyleMetadata {
  return {type: AnimationMetadataType.Style, styles: tokens, offset: null};
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
export function state(
    name: string, styles: AnimationStyleMetadata,
    options?: {params: {[name: string]: any}}): AnimationStateMetadata {
  return {type: AnimationMetadataType.State, name, styles, options};
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
  return {type: AnimationMetadataType.Keyframes, steps};
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
 * ### Using :enter and :leave
 *
 * Given that enter (insertion) and leave (removal) animations are so common, the `transition`
 * function accepts both `:enter` and `:leave` values which are aliases for the `void => *` and `*
 * => void` state changes.
 *
 * ```
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 * ]),
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 * ])
 * ```
 *
 * ### Using :increment and :decrement
 * In addition to the :enter and :leave transition aliases, the :increment and :decrement aliases
 * can be used to kick off a transition when a numeric value has increased or decreased in value.
 *
 * ```
 * import {group, animate, query, transition, style, trigger} from '@angular/animations';
 * import {Component} from '@angular/core';
 *
 * @Component({
 *   selector: 'banner-carousel-component',
 *   styles: [`
 *     .banner-container {
 *        position:relative;
 *        height:500px;
 *        overflow:hidden;
 *      }
 *     .banner-container > .banner {
 *        position:absolute;
 *        left:0;
 *        top:0;
 *        font-size:200px;
 *        line-height:500px;
 *        font-weight:bold;
 *        text-align:center;
 *        width:100%;
 *      }
 *   `],
 *   template: `
 *     <button (click)="previous()">Previous</button>
 *     <button (click)="next()">Next</button>
 *     <hr>
 *     <div [@bannerAnimation]="selectedIndex" class="banner-container">
 *       <div class="banner"> {{ banner }} </div>
 *     </div>
 *   `
 *   animations: [
 *     trigger('bannerAnimation', [
 *       transition(":increment", group([
 *         query(':enter', [
 *           style({ left: '100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '-100%' }))
 *         ])
 *       ])),
 *       transition(":decrement", group([
 *         query(':enter', [
 *           style({ left: '-100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '100%' }))
 *         ])
 *       ])),
 *     ])
 *   ]
 * })
 * class BannerCarouselComponent {
 *   allBanners: string[] = ['1', '2', '3', '4'];
 *   selectedIndex: number = 0;
 *
 *   get banners() {
 *      return [this.allBanners[this.selectedIndex]];
 *   }
 *
 *   previous() {
 *     this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
 *   }
 *
 *   next() {
 *     this.selectedIndex = Math.min(this.selectedIndex + 1, this.allBanners.length - 1);
 *   }
 * }
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function transition(
    stateChangeExpr: string, steps: AnimationMetadata | AnimationMetadata[],
    options: AnimationOptions | null = null): AnimationTransitionMetadata {
  return {type: AnimationMetadataType.Transition, expr: stateChangeExpr, animation: steps, options};
}

/**
 * `animation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * `var myAnimation = animation(...)` is designed to produce a reusable animation that can be later
 * invoked in another animation or sequence. Reusable animations are designed to make use of
 * animation parameters and the produced animation can be used via the `useAnimation` method.
 *
 * ```
 * var fadeAnimation = animation([
 *   style({ opacity: '{{ start }}' }),
 *   animate('{{ time }}',
 *     style({ opacity: '{{ end }}'))
 * ], { params: { time: '1000ms', start: 0, end: 1 }});
 * ```
 *
 * If parameters are attached to an animation then they act as **default parameter values**. When an
 * animation is invoked via `useAnimation` then parameter values are allowed to be passed in
 * directly. If any of the passed in parameter values are missing then the default values will be
 * used.
 *
 * ```
 * useAnimation(fadeAnimation, {
 *   params: {
 *     time: '2s',
 *     start: 1,
 *     end: 0
 *   }
 * })
 * ```
 *
 * If one or more parameter values are missing before animated then an error will be thrown.
 *
 * @experimental Animation support is experimental.
 */
export function animation(
    steps: AnimationMetadata | AnimationMetadata[],
    options: AnimationOptions | null = null): AnimationReferenceMetadata {
  return {type: AnimationMetadataType.Reference, animation: steps, options};
}

/**
 * `animateChild` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It works by allowing a queried element to execute its own
 * animation within the animation sequence.
 *
 * Each time an animation is triggered in angular, the parent animation
 * will always get priority and any child animations will be blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations and then allow the animations to run using `animateChild`.
 *
 * The example HTML code below shows both parent and child elements that have animation
 * triggers that will execute at the same time.
 *
 * ```html
 * <!-- parent-child.component.html -->
 * <button (click)="exp =! exp">Toggle</button>
 * <hr>
 *
 * <div [@parentAnimation]="exp">
 *   <header>Hello</header>
 *   <div [@childAnimation]="exp">
 *       one
 *   </div>
 *   <div [@childAnimation]="exp">
 *       two
 *   </div>
 *   <div [@childAnimation]="exp">
 *       three
 *   </div>
 * </div>
 * ```
 *
 * Now when the `exp` value changes to true, only the `parentAnimation` animation will animate
 * because it has priority. However, using `query` and `animateChild` each of the inner animations
 * can also fire:
 *
 * ```ts
 * // parent-child.component.ts
 * import {trigger, transition, animate, style, query, animateChild} from '@angular/animations';
 * @Component({
 *   selector: 'parent-child-component',
 *   animations: [
 *     trigger('parentAnimation', [
 *       transition('false => true', [
 *         query('header', [
 *           style({ opacity: 0 }),
 *           animate(500, style({ opacity: 1 }))
 *         ]),
 *         query('@childAnimation', [
 *           animateChild()
 *         ])
 *       ])
 *     ]),
 *     trigger('childAnimation', [
 *       transition('false => true', [
 *         style({ opacity: 0 }),
 *         animate(500, style({ opacity: 1 }))
 *       ])
 *     ])
 *   ]
 * })
 * class ParentChildCmp {
 *   exp: boolean = false;
 * }
 * ```
 *
 * In the animation code above, when the `parentAnimation` transition kicks off it first queries to
 * find the header element and fades it in. It then finds each of the sub elements that contain the
 * `@childAnimation` trigger and then allows for their animations to fire.
 *
 * This example can be further extended by using stagger:
 *
 * ```ts
 * query('@childAnimation', stagger(100, [
 *   animateChild()
 * ]))
 * ```
 *
 * Now each of the sub animations start off with respect to the `100ms` staggering step.
 *
 * ## The first frame of child animations
 * When sub animations are executed using `animateChild` the animation engine will always apply the
 * first frame of every sub animation immediately at the start of the animation sequence. This way
 * the parent animation does not need to set any initial styling data on the sub elements before the
 * sub animations kick off.
 *
 * In the example above the first frame of the `childAnimation`'s `false => true` transition
 * consists of a style of `opacity: 0`. This is applied immediately when the `parentAnimation`
 * animation transition sequence starts. Only then when the `@childAnimation` is queried and called
 * with `animateChild` will it then animate to its destination of `opacity: 1`.
 *
 * Note that this feature designed to be used alongside {@link query query()} and it will only work
 * with animations that are assigned using the Angular animation DSL (this means that CSS keyframes
 * and transitions are not handled by this API).
 *
 * @experimental Animation support is experimental.
 */
export function animateChild(options: AnimateChildOptions | null = null):
    AnimationAnimateChildMetadata {
  return {type: AnimationMetadataType.AnimateChild, options};
}

/**
 * `useAnimation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is used to kick off a reusable animation that is created using {@link
 * animation animation()}.
 *
 * @experimental Animation support is experimental.
 */
export function useAnimation(
    animation: AnimationReferenceMetadata,
    options: AnimationOptions | null = null): AnimationAnimateRefMetadata {
  return {type: AnimationMetadataType.AnimateRef, animation, options};
}

/**
 * `query` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * query() is used to find one or more inner elements within the current element that is
 * being animated within the sequence. The provided animation steps are applied
 * to the queried element (by default, an array is provided, then this will be
 * treated as an animation sequence).
 *
 * ### Usage
 *
 * query() is designed to collect mutiple elements and works internally by using
 * `element.querySelectorAll`. An additional options object can be provided which
 * can be used to limit the total amount of items to be collected.
 *
 * ```js
 * query('div', [
 *   animate(...),
 *   animate(...)
 * ], { limit: 1 })
 * ```
 *
 * query(), by default, will throw an error when zero items are found. If a query
 * has the `optional` flag set to true then this error will be ignored.
 *
 * ```js
 * query('.some-element-that-may-not-be-there', [
 *   animate(...),
 *   animate(...)
 * ], { optional: true })
 * ```
 *
 * ### Special Selector Values
 *
 * The selector value within a query can collect elements that contain angular-specific
 * characteristics
 * using special pseudo-selectors tokens.
 *
 * These include:
 *
 *  - Querying for newly inserted/removed elements using `query(":enter")`/`query(":leave")`
 *  - Querying all currently animating elements using `query(":animating")`
 *  - Querying elements that contain an animation trigger using `query("@triggerName")`
 *  - Querying all elements that contain an animation triggers using `query("@*")`
 *  - Including the current element into the animation sequence using `query(":self")`
 *
 *
 *  Each of these pseudo-selector tokens can be merged together into a combined query selector
 * string:
 *
 *  ```
 *  query(':self, .record:enter, .record:leave, @subTrigger', [...])
 *  ```
 *
 * ### Demo
 *
 * ```
 * @Component({
 *   selector: 'inner',
 *   template: `
 *     <div [@queryAnimation]="exp">
 *       <h1>Title</h1>
 *       <div class="content">
 *         Blah blah blah
 *       </div>
 *     </div>
 *   `,
 *   animations: [
 *    trigger('queryAnimation', [
 *      transition('* => goAnimate', [
 *        // hide the inner elements
 *        query('h1', style({ opacity: 0 })),
 *        query('.content', style({ opacity: 0 })),
 *
 *        // animate the inner elements in, one by one
 *        query('h1', animate(1000, style({ opacity: 1 })),
 *        query('.content', animate(1000, style({ opacity: 1 })),
 *      ])
 *    ])
 *  ]
 * })
 * class Cmp {
 *   exp = '';
 *
 *   goAnimate() {
 *     this.exp = 'goAnimate';
 *   }
 * }
 * ```
 *
 * @experimental Animation support is experimental.
 */
export function query(
    selector: string, animation: AnimationMetadata | AnimationMetadata[],
    options: AnimationQueryOptions | null = null): AnimationQueryMetadata {
  return {type: AnimationMetadataType.Query, selector, animation, options};
}

/**
 * `stagger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is designed to be used inside of an animation {@link query query()}
 * and works by issuing a timing gap between after each queried item is animated.
 *
 * ### Usage
 *
 * In the example below there is a container element that wraps a list of items stamped out
 * by an ngFor. The container element contains an animation trigger that will later be set
 * to query for each of the inner items.
 *
 * ```html
 * <!-- list.component.html -->
 * <button (click)="toggle()">Show / Hide Items</button>
 * <hr />
 * <div [@listAnimation]="items.length">
 *   <div *ngFor="let item of items">
 *     {{ item }}
 *   </div>
 * </div>
 * ```
 *
 * The component code for this looks as such:
 *
 * ```ts
 * import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
 * @Component({
 *   templateUrl: 'list.component.html',
 *   animations: [
 *     trigger('listAnimation', [
 *        //...
 *     ])
 *   ]
 * })
 * class ListComponent {
 *   items = [];
 *
 *   showItems() {
 *     this.items = [0,1,2,3,4];
 *   }
 *
 *   hideItems() {
 *     this.items = [];
 *   }
 *
 *   toggle() {
 *     this.items.length ? this.hideItems() : this.showItems();
 *   }
 * }
 * ```
 *
 * And now for the animation trigger code:
 *
 * ```ts
 * trigger('listAnimation', [
 *   transition('* => *', [ // each time the binding value changes
 *     query(':leave', [
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 0 }))
 *       ])
 *     ]),
 *     query(':enter', [
 *       style({ opacity: 0 }),
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 1 }))
 *       ])
 *     ])
 *   ])
 * ])
 * ```
 *
 * Now each time the items are added/removed then either the opacity
 * fade-in animation will run or each removed item will be faded out.
 * When either of these animations occur then a stagger effect will be
 * applied after each item's animation is started.
 *
 * @experimental Animation support is experimental.
 */
export function stagger(
    timings: string | number,
    animation: AnimationMetadata | AnimationMetadata[]): AnimationStaggerMetadata {
  return {type: AnimationMetadataType.Stagger, timings, animation};
}
