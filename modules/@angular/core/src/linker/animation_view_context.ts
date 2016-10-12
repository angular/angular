/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationGroupPlayer} from '../animation/animation_group_player';
import {AnimationPlayer} from '../animation/animation_player';
import {queueAnimation as queueAnimationGlobally} from '../animation/animation_queue';
import {AnimationTransitionEvent} from '../animation/animation_transition_event';
import {ViewAnimationMap} from '../animation/view_animation_map';

export class AnimationViewContext {
  private _players = new ViewAnimationMap();
  private _listeners = new Map<any, _AnimationOutputHandler[]>();

  onAllActiveAnimationsDone(callback: () => any): void {
    var activeAnimationPlayers = this._players.getAllPlayers();
    // we check for the length to avoid having GroupAnimationPlayer
    // issue an unnecessary microtask when zero players are passed in
    if (activeAnimationPlayers.length) {
      new AnimationGroupPlayer(activeAnimationPlayers).onDone(() => callback());
    } else {
      callback();
    }
  }

  queueAnimation(
      element: any, animationName: string, player: AnimationPlayer,
      event: AnimationTransitionEvent): void {
    queueAnimationGlobally(player);

    this._players.set(element, animationName, player);
    player.onDone(() => {
      // TODO: add codegen to remove the need to store these values
      this._triggerOutputHandler(element, animationName, 'done', event);
      this._players.remove(element, animationName);
    });

    player.onStart(() => this._triggerOutputHandler(element, animationName, 'start', event));
  }

  cancelActiveAnimation(element: any, animationName: string, removeAllAnimations: boolean = false):
      void {
    if (removeAllAnimations) {
      this._players.findAllPlayersByElement(element).forEach(player => player.destroy());
    } else {
      var player = this._players.find(element, animationName);
      if (player) {
        player.destroy();
      }
    }
  }

  registerOutputHandler(
      element: any, eventName: string, eventPhase: string, eventHandler: Function): void {
    var animations = this._listeners.get(element);
    if (!animations) {
      this._listeners.set(element, animations = []);
    }
    animations.push(new _AnimationOutputHandler(eventName, eventPhase, eventHandler));
  }

  private _triggerOutputHandler(
      element: any, animationName: string, phase: string, event: AnimationTransitionEvent): void {
    const listeners = this._listeners.get(element);
    if (listeners && listeners.length) {
      for (let i = 0; i < listeners.length; i++) {
        let listener = listeners[i];
        // we check for both the name in addition to the phase in the event
        // that there may be more than one @trigger on the same element
        if (listener.eventName === animationName && listener.eventPhase === phase) {
          listener.handler(event);
          break;
        }
      }
    }
  }
}

class _AnimationOutputHandler {
  constructor(public eventName: string, public eventPhase: string, public handler: Function) {}
}
