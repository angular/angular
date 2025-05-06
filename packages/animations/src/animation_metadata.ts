/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Represents a set of CSS styles for use in an animation style as a generic.
 */
export interface ɵStyleData {
  [key: string]: string | number;
}

/**
 * Represents a set of CSS styles for use in an animation style as a Map.
 */
export type ɵStyleDataMap = Map<string, string | number>;

/**
 * Represents animation-step timing parameters for an animation step.
 * @see {@link animate}
 *
 * @publicApi
 */
export declare type AnimateTimings = {
  /**
   * The full duration of an animation step. A number and optional time unit,
   * such as "1s" or "10ms" for one second and 10 milliseconds, respectively.
   * The default unit is milliseconds.
   */
  duration: number;
  /**
   * The delay in applying an animation step. A number and optional time unit.
   * The default unit is milliseconds.
   */
  delay: number;
  /**
   * An easing style that controls how an animations step accelerates
   * and decelerates during its run time. An easing function such as `cubic-bezier()`,
   * or one of the following constants:
   * - `ease-in`
   * - `ease-out`
   * - `ease-in-and-out`
   */
  easing: string | null;
};

/**
 * @description Options that control animation styling and timing.
 *
 * The following animation functions accept `AnimationOptions` data:
 *
 * - `transition()`
 * - `sequence()`
 * - `group()`
 * - `query()`
 * - `animation()`
 * - `useAnimation()`
 * - `animateChild()`
 *
 * Programmatic animations built using the `AnimationBuilder` service also
 * make use of `AnimationOptions`.
 *
 * @publicApi
 */
export declare interface AnimationOptions {
  /**
   * Sets a time-delay for initiating an animation action.
   * A number and optional time unit, such as "1s" or "10ms" for one second
   * and 10 milliseconds, respectively.The default unit is milliseconds.
   * Default value is 0, meaning no delay.
   */
  delay?: number | string;
  /**
   * A set of developer-defined parameters that modify styling and timing
   * when an animation action starts. An array of key-value pairs, where the provided value
   * is used as a default.
   */
  params?: {[name: string]: any};
}

/**
 * Adds duration options to control animation styling and timing for a child animation.
 *
 * @see {@link animateChild}
 *
 * @publicApi
 */
export declare interface AnimateChildOptions extends AnimationOptions {
  duration?: number | string;
}

/**
 * @description Constants for the categories of parameters that can be defined for animations.
 *
 * A corresponding function defines a set of parameters for each category, and
 * collects them into a corresponding `AnimationMetadata` object.
 *
 * @publicApi
 */
export enum AnimationMetadataType {
  /**
   * Associates a named animation state with a set of CSS styles.
   * See [`state()`](api/animations/state)
   */
  State = 0,
  /**
   * Data for a transition from one animation state to another.
   * See `transition()`
   */
  Transition = 1,
  /**
   * Contains a set of animation steps.
   * See `sequence()`
   */
  Sequence = 2,
  /**
   * Contains a set of animation steps.
   * See `group()`
   */
  Group = 3,
  /**
   * Contains an animation step.
   * See `animate()`
   */
  Animate = 4,
  /**
   * Contains a set of animation steps.
   * See `keyframes()`
   */
  Keyframes = 5,
  /**
   * Contains a set of CSS property-value pairs into a named style.
   * See `style()`
   */
  Style = 6,
  /**
   * Associates an animation with an entry trigger that can be attached to an element.
   * See `trigger()`
   */
  Trigger = 7,
  /**
   * Contains a re-usable animation.
   * See `animation()`
   */
  Reference = 8,
  /**
   * Contains data to use in executing child animations returned by a query.
   * See `animateChild()`
   */
  AnimateChild = 9,
  /**
   * Contains animation parameters for a re-usable animation.
   * See `useAnimation()`
   */
  AnimateRef = 10,
  /**
   * Contains child-animation query data.
   * See `query()`
   */
  Query = 11,
  /**
   * Contains data for staggering an animation sequence.
   * See `stagger()`
   */
  Stagger = 12,
}

/**
 * Specifies automatic styling.
 *
 * @publicApi
 */
export const AUTO_STYLE = '*';

/**
 * Base for animation data structures.
 *
 * @publicApi
 */
export interface AnimationMetadata {
  type: AnimationMetadataType;
}

/**
 * Contains an animation trigger. Instantiated and returned by the
 * `trigger()` function.
 *
 * @publicApi
 */
export interface AnimationTriggerMetadata extends AnimationMetadata {
  /**
   * The trigger name, used to associate it with an element. Unique within the component.
   */
  name: string;
  /**
   * An animation definition object, containing an array of state and transition declarations.
   */
  definitions: AnimationMetadata[];
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: {params?: {[name: string]: any}} | null;
}

/**
 * Encapsulates an animation state by associating a state name with a set of CSS styles.
 * Instantiated and returned by the [`state()`](api/animations/state) function.
 *
 * @publicApi
 */
export interface AnimationStateMetadata extends AnimationMetadata {
  /**
   * The state name, unique within the component.
   */
  name: string;
  /**
   *  The CSS styles associated with this state.
   */
  styles: AnimationStyleMetadata;
  /**
   * An options object containing
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation.
   */
  options?: {params: {[name: string]: any}};
}

/**
 * Encapsulates an animation transition. Instantiated and returned by the
 * `transition()` function.
 *
 * @publicApi
 */
export interface AnimationTransitionMetadata extends AnimationMetadata {
  /**
   * An expression that describes a state change.
   */
  expr:
    | string
    | ((
        fromState: string,
        toState: string,
        element?: any,
        params?: {[key: string]: any},
      ) => boolean);
  /**
   * One or more animation objects to which this transition applies.
   */
  animation: AnimationMetadata | AnimationMetadata[];
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates a reusable animation, which is a collection of individual animation steps.
 * Instantiated and returned by the `animation()` function, and
 * passed to the `useAnimation()` function.
 *
 * @publicApi
 */
export interface AnimationReferenceMetadata extends AnimationMetadata {
  /**
   *  One or more animation step objects.
   */
  animation: AnimationMetadata | AnimationMetadata[];
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates an animation query. Instantiated and returned by
 * the `query()` function.
 *
 * @publicApi
 */
export interface AnimationQueryMetadata extends AnimationMetadata {
  /**
   *  The CSS selector for this query.
   */
  selector: string;
  /**
   * One or more animation step objects.
   */
  animation: AnimationMetadata | AnimationMetadata[];
  /**
   * A query options object.
   */
  options: AnimationQueryOptions | null;
}

/**
 * Encapsulates a keyframes sequence. Instantiated and returned by
 * the `keyframes()` function.
 *
 * @publicApi
 */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
  /**
   * An array of animation styles.
   */
  steps: AnimationStyleMetadata[];
}

/**
 * Encapsulates an animation style. Instantiated and returned by
 * the `style()` function.
 *
 * @publicApi
 */
export interface AnimationStyleMetadata extends AnimationMetadata {
  /**
   * A set of CSS style properties.
   */
  styles: '*' | {[key: string]: string | number} | Array<{[key: string]: string | number} | '*'>;
  /**
   * A percentage of the total animate time at which the style is to be applied.
   */
  offset: number | null;
}

/**
 * Encapsulates an animation step. Instantiated and returned by
 * the `animate()` function.
 *
 * @publicApi
 */
export interface AnimationAnimateMetadata extends AnimationMetadata {
  /**
   * The timing data for the step.
   */
  timings: string | number | AnimateTimings;
  /**
   * A set of styles used in the step.
   */
  styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null;
}

/**
 * Encapsulates a child animation, that can be run explicitly when the parent is run.
 * Instantiated and returned by the `animateChild` function.
 *
 * @publicApi
 */
export interface AnimationAnimateChildMetadata extends AnimationMetadata {
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates a reusable animation.
 * Instantiated and returned by the `useAnimation()` function.
 *
 * @publicApi
 */
export interface AnimationAnimateRefMetadata extends AnimationMetadata {
  /**
   * An animation reference object.
   */
  animation: AnimationReferenceMetadata;
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates an animation sequence.
 * Instantiated and returned by the `sequence()` function.
 *
 * @publicApi
 */
export interface AnimationSequenceMetadata extends AnimationMetadata {
  /**
   *  An array of animation step objects.
   */
  steps: AnimationMetadata[];
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates an animation group.
 * Instantiated and returned by the `group()` function.
 *
 * @publicApi
 */
export interface AnimationGroupMetadata extends AnimationMetadata {
  /**
   * One or more animation or style steps that form this group.
   */
  steps: AnimationMetadata[];
  /**
   * An options object containing a delay and
   * developer-defined parameters that provide styling defaults and
   * can be overridden on invocation. Default delay is 0.
   */
  options: AnimationOptions | null;
}

/**
 * Encapsulates animation query options.
 * Passed to the `query()` function.
 *
 * @publicApi
 */
export declare interface AnimationQueryOptions extends AnimationOptions {
  /**
   * True if this query is optional, false if it is required. Default is false.
   * A required query throws an error if no elements are retrieved when
   * the query is executed. An optional query does not.
   *
   */
  optional?: boolean;
  /**
   * A maximum total number of results to return from the query.
   * If negative, results are limited from the end of the query list towards the beginning.
   * By default, results are not limited.
   */
  limit?: number;
}

/**
 * Encapsulates parameters for staggering the start times of a set of animation steps.
 * Instantiated and returned by the `stagger()` function.
 *
 * @publicApi
 **/
export interface AnimationStaggerMetadata extends AnimationMetadata {
  /**
   * The timing data for the steps.
   */
  timings: string | number;
  /**
   * One or more animation steps.
   */
  animation: AnimationMetadata | AnimationMetadata[];
}

/**
 * Creates a named animation trigger, containing a  list of [`state()`](api/animations/state)
 * and `transition()` entries to be evaluated when the expression
 * bound to the trigger changes.
 *
 * @param name An identifying string.
 * @param definitions  An animation definition object, containing an array of
 * [`state()`](api/animations/state) and `transition()` declarations.
 *
 * @return An object that encapsulates the trigger data.
 *
 * @usageNotes
 * Define an animation trigger in the `animations` section of `@Component` metadata.
 * In the template, reference the trigger by name and bind it to a trigger expression that
 * evaluates to a defined animation state, using the following format:
 *
 * `[@triggerName]="expression"`
 *
 * Animation trigger bindings convert all values to strings, and then match the
 * previous and current values against any linked transitions.
 * Booleans can be specified as `1` or `true` and `0` or `false`.
 *
 * ### Usage Example
 *
 * The following example creates an animation trigger reference based on the provided
 * name value.
 * The provided animation value is expected to be an array consisting of state and
 * transition declarations.
 *
 * ```ts
 * @Component({
 *   selector: "my-component",
 *   templateUrl: "my-component-tpl.html",
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
 * The template associated with this component makes use of the defined trigger
 * by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * ### Using an inline function
 * The `transition` animation method also supports reading an inline function which can decide
 * if its associated animation should be run.
 *
 * ```ts
 * // this method is run each time the `myAnimationTrigger` trigger value changes.
 * function myInlineMatcherFn(fromState: string, toState: string, element: any, params: {[key:
 string]: any}): boolean {
 *   // notice that `element` and `params` are also available here
 *   return toState == 'yes-please-animate';
 * }
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger('myAnimationTrigger', [
 *       transition(myInlineMatcherFn, [
 *         // the animation sequence code
 *       ]),
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "yes-please-animate";
 * }
 * ```
 *
 * ### Disabling Animations
 * When true, the special animation control binding `@.disabled` binding prevents
 * all animations from rendering.
 * Place the  `@.disabled` binding on an element to disable
 * animations on the element itself, as well as any inner animation triggers
 * within the element.
 *
 * The following example shows how to use this feature:
 *
 * ```angular-ts
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
 * When `@.disabled` is true, it prevents the `@childAnimation` trigger from animating,
 * along with any inner animations.
 *
 * ### Disable animations application-wide
 * When an area of the template is set to have animations disabled,
 * **all** inner components have their animations disabled as well.
 * This means that you can disable all animations for an app
 * by placing a host binding set on `@.disabled` on the topmost Angular component.
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
 * ### Overriding disablement of inner animations
 * Despite inner animations being disabled, a parent animation can `query()`
 * for inner elements located in disabled areas of the template and still animate
 * them if needed. This is also the case for when a sub animation is
 * queried by a parent and then later animated using `animateChild()`.
 *
 * ### Detecting when an animation is disabled
 * If a region of the DOM (or the entire application) has its animations disabled, the animation
 * trigger callbacks still fire, but for zero seconds. When the callback fires, it provides
 * an instance of an `AnimationEvent`. If animations are disabled,
 * the `.disabled` flag on the event is true.
 *
 * @publicApi
 */
export function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata {
  return {type: AnimationMetadataType.Trigger, name, definitions, options: {}};
}

/**
 * Defines an animation step that combines styling information with timing information.
 *
 * @param timings Sets `AnimateTimings` for the parent animation.
 * A string in the format "duration [delay] [easing]".
 *  - Duration and delay are expressed as a number and optional time unit,
 * such as "1s" or "10ms" for one second and 10 milliseconds, respectively.
 * The default unit is milliseconds.
 *  - The easing value controls how the animation accelerates and decelerates
 * during its runtime. Value is one of  `ease`, `ease-in`, `ease-out`,
 * `ease-in-out`, or a `cubic-bezier()` function call.
 * If not supplied, no easing is applied.
 *
 * For example, the string "1s 100ms ease-out" specifies a duration of
 * 1000 milliseconds, and delay of 100 ms, and the "ease-out" easing style,
 * which decelerates near the end of the duration.
 * @param styles Sets AnimationStyles for the parent animation.
 * A function call to either `style()` or `keyframes()`
 * that returns a collection of CSS style entries to be applied to the parent animation.
 * When null, uses the styles from the destination state.
 * This is useful when describing an animation step that will complete an animation;
 * see "Animating to the final state" in `transitions()`.
 * @returns An object that encapsulates the animation step.
 *
 * @usageNotes
 * Call within an animation `sequence()`, {@link /api/animations/group group()}, or
 * `transition()` call to specify an animation step
 * that applies given style data to the parent animation for a given amount of time.
 *
 * ### Syntax Examples
 * **Timing examples**
 *
 * The following examples show various `timings` specifications.
 * - `animate(500)` : Duration is 500 milliseconds.
 * - `animate("1s")` : Duration is 1000 milliseconds.
 * - `animate("100ms 0.5s")` : Duration is 100 milliseconds, delay is 500 milliseconds.
 * - `animate("5s ease-in")` : Duration is 5000 milliseconds, easing in.
 * - `animate("5s 10ms cubic-bezier(.17,.67,.88,.1)")` : Duration is 5000 milliseconds, delay is 10
 * milliseconds, easing according to a bezier curve.
 *
 * **Style examples**
 *
 * The following example calls `style()` to set a single CSS style.
 * ```ts
 * animate(500, style({ background: "red" }))
 * ```
 * The following example calls `keyframes()` to set a CSS style
 * to different values for successive keyframes.
 * ```ts
 * animate(500, keyframes(
 *  [
 *   style({ background: "blue" }),
 *   style({ background: "red" })
 *  ])
 * ```
 *
 * @publicApi
 */
export function animate(
  timings: string | number,
  styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null = null,
): AnimationAnimateMetadata {
  return {type: AnimationMetadataType.Animate, styles, timings};
}

/**
 * @description Defines a list of animation steps to be run in parallel.
 *
 * @param steps An array of animation step objects.
 * - When steps are defined by `style()` or `animate()`
 * function calls, each call within the group is executed instantly.
 * - To specify offset styles to be applied at a later time, define steps with
 * `keyframes()`, or use `animate()` calls with a delay value.
 * For example:
 *
 * ```ts
 * group([
 *   animate("1s", style({ background: "black" })),
 *   animate("2s", style({ color: "white" }))
 * ])
 * ```
 *
 * @param options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return An object that encapsulates the group data.
 *
 * @usageNotes
 * Grouped animations are useful when a series of styles must be
 * animated at different starting times and closed off at different ending times.
 *
 * When called within a `sequence()` or a
 * `transition()` call, does not continue to the next
 * instruction until all of the inner animation steps have completed.
 *
 * @publicApi
 */
export function group(
  steps: AnimationMetadata[],
  options: AnimationOptions | null = null,
): AnimationGroupMetadata {
  return {type: AnimationMetadataType.Group, steps, options};
}

/**
 * Defines a list of animation steps to be run sequentially, one by one.
 *
 * @param steps An array of animation step objects.
 * - Steps defined by `style()` calls apply the styling data immediately.
 * - Steps defined by `animate()` calls apply the styling data over time
 *   as specified by the timing data.
 *
 * ```ts
 * sequence([
 *   style({ opacity: 0 }),
 *   animate("1s", style({ opacity: 1 }))
 * ])
 * ```
 *
 * @param options An options object containing a delay and
 * developer-defined parameters that provide styling defaults and
 * can be overridden on invocation.
 *
 * @return An object that encapsulates the sequence data.
 *
 * @usageNotes
 * When you pass an array of steps to a
 * `transition()` call, the steps run sequentially by default.
 * Compare this to the  {@link /api/animations/group group()} call, which runs animation steps in
 *parallel.
 *
 * When a sequence is used within a  {@link /api/animations/group group()} or a `transition()` call,
 * execution continues to the next instruction only after each of the inner animation
 * steps have completed.
 *
 * @publicApi
 **/
export function sequence(
  steps: AnimationMetadata[],
  options: AnimationOptions | null = null,
): AnimationSequenceMetadata {
  return {type: AnimationMetadataType.Sequence, steps, options};
}

/**
 * Declares a key/value object containing CSS properties/styles that
 * can then be used for an animation [`state`](api/animations/state), within an animation
 *`sequence`, or as styling data for calls to `animate()` and `keyframes()`.
 *
 * @param tokens A set of CSS styles or HTML styles associated with an animation state.
 * The value can be any of the following:
 * - A key-value style pair associating a CSS property with a value.
 * - An array of key-value style pairs.
 * - An asterisk (*), to use auto-styling, where styles are derived from the element
 * being animated and applied to the animation when it starts.
 *
 * Auto-styling can be used to define a state that depends on layout or other
 * environmental factors.
 *
 * @return An object that encapsulates the style data.
 *
 * @usageNotes
 * The following examples create animation styles that collect a set of
 * CSS property values:
 *
 * ```ts
 * // string values for CSS properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical pixel values
 * style({ width: 100, height: 0 })
 * ```
 *
 * The following example uses auto-styling to allow an element to animate from
 * a height of 0 up to its full height:
 *
 * ```ts
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * @publicApi
 **/
export function style(
  tokens: '*' | {[key: string]: string | number} | Array<'*' | {[key: string]: string | number}>,
): AnimationStyleMetadata {
  return {type: AnimationMetadataType.Style, styles: tokens, offset: null};
}

/**
 * Declares an animation state within a trigger attached to an element.
 *
 * @param name One or more names for the defined state in a comma-separated string.
 * The following reserved state names can be supplied to define a style for specific use
 * cases:
 *
 * - `void` You can associate styles with this name to be used when
 * the element is detached from the application. For example, when an `ngIf` evaluates
 * to false, the state of the associated element is void.
 *  - `*` (asterisk) Indicates the default state. You can associate styles with this name
 * to be used as the fallback when the state that is being animated is not declared
 * within the trigger.
 *
 * @param styles A set of CSS styles associated with this state, created using the
 * `style()` function.
 * This set of styles persists on the element once the state has been reached.
 * @param options Parameters that can be passed to the state when it is invoked.
 * 0 or more key-value pairs.
 * @return An object that encapsulates the new state data.
 *
 * @usageNotes
 * Use the `trigger()` function to register states to an animation trigger.
 * Use the `transition()` function to animate between states.
 * When a state is active within a component, its associated styles persist on the element,
 * even when the animation ends.
 *
 * @publicApi
 **/
export function state(
  name: string,
  styles: AnimationStyleMetadata,
  options?: {params: {[name: string]: any}},
): AnimationStateMetadata {
  return {type: AnimationMetadataType.State, name, styles, options};
}

/**
 * Defines a set of animation styles, associating each style with an optional `offset` value.
 *
 * @param steps A set of animation styles with optional offset data.
 * The optional `offset` value for a style specifies a percentage of the total animation
 * time at which that style is applied.
 * @returns An object that encapsulates the keyframes data.
 *
 * @usageNotes
 * Use with the `animate()` call. Instead of applying animations
 * from the current state
 * to the destination state, keyframes describe how each style entry is applied and at what point
 * within the animation arc.
 * Compare [CSS Keyframe Animations](https://www.w3schools.com/css/css3_animations.asp).
 *
 * ### Usage
 *
 * In the following example, the offset values describe
 * when each `backgroundColor` value is applied. The color is red at the start, and changes to
 * blue when 20% of the total time has elapsed.
 *
 * ```ts
 * // the provided offset values
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * If there are no `offset` values specified in the style entries, the offsets
 * are calculated automatically.
 *
 * ```ts
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 *```

 * @publicApi
 */
export function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata {
  return {type: AnimationMetadataType.Keyframes, steps};
}

/**
 * Declares an animation transition which is played when a certain specified condition is met.
 *
 * @param stateChangeExpr A string with a specific format or a function that specifies when the
 * animation transition should occur (see [State Change Expression](#state-change-expression)).
 *
 * @param steps One or more animation objects that represent the animation's instructions.
 *
 * @param options An options object that can be used to specify a delay for the animation or provide
 * custom parameters for it.
 *
 * @returns An object that encapsulates the transition data.
 *
 * @usageNotes
 *
 * ### State Change Expression
 *
 * The State Change Expression instructs Angular when to run the transition's animations, it can
 *either be
 *  - a string with a specific syntax
 *  - or a function that compares the previous and current state (value of the expression bound to
 *    the element's trigger) and returns `true` if the transition should occur or `false` otherwise
 *
 * The string format can be:
 *  - `fromState => toState`, which indicates that the transition's animations should occur then the
 *    expression bound to the trigger's element goes from `fromState` to `toState`
 *
 *    _Example:_
 *      ```ts
 *        transition('open => closed', animate('.5s ease-out', style({ height: 0 }) ))
 *      ```
 *
 *  - `fromState <=> toState`, which indicates that the transition's animations should occur then
 *    the expression bound to the trigger's element goes from `fromState` to `toState` or vice versa
 *
 *    _Example:_
 *      ```ts
 *        transition('enabled <=> disabled', animate('1s cubic-bezier(0.8,0.3,0,1)'))
 *      ```
 *
 *  - `:enter`/`:leave`, which indicates that the transition's animations should occur when the
 *    element enters or exists the DOM
 *
 *    _Example:_
 *      ```ts
 *        transition(':enter', [
 *          style({ opacity: 0 }),
 *          animate('500ms', style({ opacity: 1 }))
 *        ])
 *      ```
 *
 *  - `:increment`/`:decrement`, which indicates that the transition's animations should occur when
 *    the numerical expression bound to the trigger's element has increased in value or decreased
 *
 *    _Example:_
 *      ```ts
 *        transition(':increment', query('@counter', animateChild()))
 *      ```
 *
 *  - a sequence of any of the above divided by commas, which indicates that transition's animations
 *    should occur whenever one of the state change expressions matches
 *
 *    _Example:_
 *      ```ts
 *        transition(':increment, * => enabled, :enter', animate('1s ease', keyframes([
 *          style({ transform: 'scale(1)', offset: 0}),
 *          style({ transform: 'scale(1.1)', offset: 0.7}),
 *          style({ transform: 'scale(1)', offset: 1})
 *        ]))),
 *      ```
 *
 * Also note that in such context:
 *  - `void` can be used to indicate the absence of the element
 *  - asterisks can be used as wildcards that match any state
 *  - (as a consequence of the above, `void => *` is equivalent to `:enter` and `* => void` is
 *    equivalent to `:leave`)
 *  - `true` and `false` also match expression values of `1` and `0` respectively (but do not match
 *    _truthy_ and _falsy_ values)
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 *  Be careful about entering end leaving elements as their transitions present a common
 *  pitfall for developers.
 *
 *  Note that when an element with a trigger enters the DOM its `:enter` transition always
 *  gets executed, but its `:leave` transition will not be executed if the element is removed
 *  alongside its parent (as it will be removed "without warning" before its transition has
 *  a chance to be executed, the only way that such transition can occur is if the element
 *  is exiting the DOM on its own).
 *
 *
 * </div>
 *
 * ### Animating to a Final State
 *
 * If the final step in a transition is a call to `animate()` that uses a timing value
 * with no `style` data, that step is automatically considered the final animation arc,
 * for the element to reach the final state, in such case Angular automatically adds or removes
 * CSS styles to ensure that the element is in the correct final state.
 *
 *
 * ### Usage Examples
 *
 *  - Transition animations applied based on
 *    the trigger's expression value
 *
 *   ```html
 *   <div [@myAnimationTrigger]="myStatusExp">
 *    ...
 *   </div>
 *   ```
 *
 *   ```ts
 *   trigger("myAnimationTrigger", [
 *     ..., // states
 *     transition("on => off, open => closed", animate(500)),
 *     transition("* <=> error", query('.indicator', animateChild()))
 *   ])
 *   ```
 *
 *  - Transition animations applied based on custom logic dependent
 *    on the trigger's expression value and provided parameters
 *
 *    ```html
 *    <div [@myAnimationTrigger]="{
 *     value: stepName,
 *     params: { target: currentTarget }
 *    }">
 *     ...
 *    </div>
 *    ```
 *
 *    ```ts
 *    trigger("myAnimationTrigger", [
 *      ..., // states
 *      transition(
 *        (fromState, toState, _element, params) =>
 *          ['firststep', 'laststep'].includes(fromState.toLowerCase())
 *          && toState === params?.['target'],
 *        animate('1s')
 *      )
 *    ])
 *    ```
 *
 * @publicApi
 **/
export function transition(
  stateChangeExpr:
    | string
    | ((
        fromState: string,
        toState: string,
        element?: any,
        params?: {[key: string]: any},
      ) => boolean),
  steps: AnimationMetadata | AnimationMetadata[],
  options: AnimationOptions | null = null,
): AnimationTransitionMetadata {
  return {type: AnimationMetadataType.Transition, expr: stateChangeExpr, animation: steps, options};
}

/**
 * Produces a reusable animation that can be invoked in another animation or sequence,
 * by calling the `useAnimation()` function.
 *
 * @param steps One or more animation objects, as returned by the `animate()`
 * or `sequence()` function, that form a transformation from one state to another.
 * A sequence is used by default when you pass an array.
 * @param options An options object that can contain a delay value for the start of the
 * animation, and additional developer-defined parameters.
 * Provided values for additional parameters are used as defaults,
 * and override values can be passed to the caller on invocation.
 * @returns An object that encapsulates the animation data.
 *
 * @usageNotes
 * The following example defines a reusable animation, providing some default parameter
 * values.
 *
 * ```ts
 * var fadeAnimation = animation([
 *   style({ opacity: '{{ start }}' }),
 *   animate('{{ time }}',
 *   style({ opacity: '{{ end }}'}))
 *   ],
 *   { params: { time: '1000ms', start: 0, end: 1 }});
 * ```
 *
 * The following invokes the defined animation with a call to `useAnimation()`,
 * passing in override parameter values.
 *
 * ```js
 * useAnimation(fadeAnimation, {
 *   params: {
 *     time: '2s',
 *     start: 1,
 *     end: 0
 *   }
 * })
 * ```
 *
 * If any of the passed-in parameter values are missing from this call,
 * the default values are used. If one or more parameter values are missing before a step is
 * animated, `useAnimation()` throws an error.
 *
 * @publicApi
 */
export function animation(
  steps: AnimationMetadata | AnimationMetadata[],
  options: AnimationOptions | null = null,
): AnimationReferenceMetadata {
  return {type: AnimationMetadataType.Reference, animation: steps, options};
}

/**
 * Executes a queried inner animation element within an animation sequence.
 *
 * @param options An options object that can contain a delay value for the start of the
 * animation, and additional override values for developer-defined parameters.
 * @return An object that encapsulates the child animation data.
 *
 * @usageNotes
 * Each time an animation is triggered in Angular, the parent animation
 * has priority and any child animations are blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations, and run them using this function.
 *
 * Note that this feature is designed to be used with `query()` and it will only work
 * with animations that are assigned using the Angular animation library. CSS keyframes
 * and transitions are not handled by this API.
 *
 * @publicApi
 */
export function animateChild(
  options: AnimateChildOptions | null = null,
): AnimationAnimateChildMetadata {
  return {type: AnimationMetadataType.AnimateChild, options};
}

/**
 * Starts a reusable animation that is created using the `animation()` function.
 *
 * @param animation The reusable animation to start.
 * @param options An options object that can contain a delay value for the start of
 * the animation, and additional override values for developer-defined parameters.
 * @return An object that contains the animation parameters.
 *
 * @publicApi
 */
export function useAnimation(
  animation: AnimationReferenceMetadata,
  options: AnimationOptions | null = null,
): AnimationAnimateRefMetadata {
  return {type: AnimationMetadataType.AnimateRef, animation, options};
}

/**
 * Finds one or more inner elements within the current element that is
 * being animated within a sequence. Use with `animate()`.
 *
 * @param selector The element to query, or a set of elements that contain Angular-specific
 * characteristics, specified with one or more of the following tokens.
 *  - `query(":enter")` or `query(":leave")` : Query for newly inserted/removed elements (not
 *     all elements can be queried via these tokens, see
 *     [Entering and Leaving Elements](#entering-and-leaving-elements))
 *  - `query(":animating")` : Query all currently animating elements.
 *  - `query("@triggerName")` : Query elements that contain an animation trigger.
 *  - `query("@*")` : Query all elements that contain an animation triggers.
 *  - `query(":self")` : Include the current element into the animation sequence.
 *
 * @param animation One or more animation steps to apply to the queried element or elements.
 * An array is treated as an animation sequence.
 * @param options An options object. Use the 'limit' field to limit the total number of
 * items to collect.
 * @return An object that encapsulates the query data.
 *
 * @usageNotes
 *
 * ### Multiple Tokens
 *
 * Tokens can be merged into a combined query selector string. For example:
 *
 * ```ts
 *  query(':self, .record:enter, .record:leave, @subTrigger', [...])
 * ```
 *
 * The `query()` function collects multiple elements and works internally by using
 * `element.querySelectorAll`. Use the `limit` field of an options object to limit
 * the total number of items to be collected. For example:
 *
 * ```js
 * query('div', [
 *   animate(...),
 *   animate(...)
 * ], { limit: 1 })
 * ```
 *
 * By default, throws an error when zero items are found. Set the
 * `optional` flag to ignore this error. For example:
 *
 * ```js
 * query('.some-element-that-may-not-be-there', [
 *   animate(...),
 *   animate(...)
 * ], { optional: true })
 * ```
 *
 * ### Entering and Leaving Elements
 *
 * Not all elements can be queried via the `:enter` and `:leave` tokens, the only ones
 * that can are those that Angular assumes can enter/leave based on their own logic
 * (if their insertion/removal is simply a consequence of that of their parent they
 * should be queried via a different token in their parent's `:enter`/`:leave` transitions).
 *
 * The only elements Angular assumes can enter/leave based on their own logic (thus the only
 * ones that can be queried via the `:enter` and `:leave` tokens) are:
 *  - Those inserted dynamically (via `ViewContainerRef`)
 *  - Those that have a structural directive (which, under the hood, are a subset of the above ones)
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 *  Note that elements will be successfully queried via `:enter`/`:leave` even if their
 *  insertion/removal is not done manually via `ViewContainerRef`or caused by their structural
 *  directive (e.g. they enter/exit alongside their parent).
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 *  There is an exception to what previously mentioned, besides elements entering/leaving based on
 *  their own logic, elements with an animation trigger can always be queried via `:leave` when
 * their parent is also leaving.
 *
 * </div>
 *
 * ### Usage Example
 *
 * The following example queries for inner elements and animates them
 * individually using `animate()`.
 *
 * ```angular-ts
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
 *        query('h1', animate(1000, style({ opacity: 1 }))),
 *        query('.content', animate(1000, style({ opacity: 1 }))),
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
 * @publicApi
 */
export function query(
  selector: string,
  animation: AnimationMetadata | AnimationMetadata[],
  options: AnimationQueryOptions | null = null,
): AnimationQueryMetadata {
  return {type: AnimationMetadataType.Query, selector, animation, options};
}

/**
 * Use within an animation `query()` call to issue a timing gap after
 * each queried item is animated.
 *
 * @param timings A delay value.
 * @param animation One ore more animation steps.
 * @returns An object that encapsulates the stagger data.
 *
 * @usageNotes
 * In the following example, a container element wraps a list of items stamped out
 * by an `ngFor`. The container element contains an animation trigger that will later be set
 * to query for each of the inner items.
 *
 * Each time items are added, the opacity fade-in animation runs,
 * and each removed item is faded out.
 * When either of these animations occur, the stagger effect is
 * applied after each item's animation is started.
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
 * Here is the component code:
 *
 * ```ts
 * import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
 * @Component({
 *   templateUrl: 'list.component.html',
 *   animations: [
 *     trigger('listAnimation', [
 *     ...
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
 *    }
 *  }
 * ```
 *
 * Here is the animation trigger code:
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
 * @publicApi
 */
export function stagger(
  timings: string | number,
  animation: AnimationMetadata | AnimationMetadata[],
): AnimationStaggerMetadata {
  return {type: AnimationMetadataType.Stagger, timings, animation};
}
