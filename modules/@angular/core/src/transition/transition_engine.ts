/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, NoOpAnimationPlayer} from '../animation/animation_player';
import {TransitionInstruction} from '../triggers';


/**
 * @experimental Transition support is experimental.
 */
export abstract class TransitionEngine {
  abstract insertNode(container: any, element: any): void;
  abstract removeNode(element: any): void;
  abstract process(element: any, instructions: TransitionInstruction[]): AnimationPlayer;
  abstract triggerAnimations(): void;
}

/**
 * @experimental Transition support is experimental.
 */
export class NoOpTransitionEngine extends TransitionEngine {
  constructor() { super(); }

  insertNode(container: any, element: any): void { container.appendChild(element); }

  removeNode(element: any): void { remove(element); }

  process(element: any, instructions: TransitionInstruction[]): AnimationPlayer {
    return new NoOpAnimationPlayer();
  }

  triggerAnimations(): void {}
}

function remove(element: any) {
  element.parentNode.removeChild(element);
}
