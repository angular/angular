/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @description Defines an event object that is returned to an animation
 * callback is called for an animation during the start or done phase.
 * 
 * @param fromState The starting state for the animation.
 * @param toState The destination state for the animation.
 * @param totalTime The start-to-completion time.
 * @param phaseName The animation phase that triggered the event, one of "start" or "done".
 * @param element The element to which the animation trigger is attached.
 * @param triggerName The name of the animation trigger.
 * @param disabled True if the animation is disabled, false otherwise.
 * 
 * @usageNotes
 *
 * ```typescript
 * @Component({
 *   host: {
 *     '[@myAnimationTrigger]': 'someExpression',
 *     '(@myAnimationTrigger.start)': 'captureStartEvent($event)',
 *     '(@myAnimationTrigger.done)': 'captureDoneEvent($event)',
 *   },
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *        // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   someExpression: any = false;
 *   captureStartEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 *
 *   captureDoneEvent(event: AnimationEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 * }
 * ```
 *
 */
export interface AnimationEvent {
  fromState: string;
  toState: string;
  totalTime: number;
  phaseName: string;
  element: any;
  triggerName: string;
  disabled: boolean;
}
