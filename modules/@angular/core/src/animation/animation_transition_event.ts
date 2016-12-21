/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ElementRef} from '../linker/element_ref';

/**
 * An instance of this class is returned as an event parameter when an animation
 * callback is captured for an animation either during the start or done phase.
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
 *   captureStartEvent(event: AnimationTransitionEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 *
 *   captureDoneEvent(event: AnimationTransitionEvent) {
 *     // the toState, fromState and totalTime data is accessible from the event variable
 *   }
 * }
 * ```
 *
 * @experimental Animation support is experimental.
 */
export class AnimationTransitionEvent {
  public fromState: string;
  public toState: string;
  public totalTime: number;
  public phaseName: string;
  public element: ElementRef;
  public triggerName: string;

  constructor({fromState, toState, totalTime, phaseName, element, triggerName}: {
    fromState: string,
    toState: string,
    totalTime: number,
    phaseName: string,
    element: any,
    triggerName: string
  }) {
    this.fromState = fromState;
    this.toState = toState;
    this.totalTime = totalTime;
    this.phaseName = phaseName;
    this.element = new ElementRef(element);
    this.triggerName = triggerName;
  }
}
