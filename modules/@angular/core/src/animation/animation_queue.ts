/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '../di/metadata';
import {NgZone} from '../zone/ng_zone';
import {AnimationPlayer} from './animation_player';
import {Renderer} from "../render/api";

@Injectable()
export class AnimationQueue {
  public entries = new Map<any, AnimationPlayer[]>();

  constructor(private _zone: NgZone) {}

  flagViewAsQueried(view: any) {
    view.flaggedForQuery = true;
    if (!this.entries.has(view)) {
      this.entries.set(view, []);
    }
  }

  enqueue(view: any, player: AnimationPlayer) {
    let players = this.entries.get(view);
    if (!players) {
      this.entries.set(view, players = []);
    }
    players.push(player);
  }

  flush(renderer: Renderer) {
    // given that each animation player may set aside
    // microtasks and rely on DOM-based events, this
    // will cause Angular to run change detection after
    // each request. This sidesteps the issue. If a user
    // hooks into an animation via (@anim.start) or (@anim.done)
    // then those methods will automatically trigger change
    // detection by wrapping themselves inside of a zone
    if (this.entries.size) {
      this._zone.runOutsideAngular(() => {
        // this code is wrapped into a single promise such that the
        // onStart and onDone player callbacks are triggered outside
        // of the digest cycle of animations
        Promise.resolve(null).then(() => this._triggerAnimations(renderer));
      });
    }
  }

  private _triggerAnimations(renderer: Renderer) {
    NgZone.assertNotInAngularZone();
    const views = Array.from(this.entries.keys());
    const viewPlayers = Array.from(this.entries.values());

    views.forEach(view => {
      if (view.flaggedForQuery && view.delayDetachPlayer) {
        //renderer.renderDetach(view.parentElement, true);
      }
    });

    viewPlayers.forEach(players => {
      players.forEach(player => {
        player.init();
      });
    });

    /*
     views.forEach(view => {
     if (view.flaggedForQuery) {
     if (view.delayDetach) {
     renderer.renderDetach(view.parentElement, false);
     }
     view.flaggedForQuery = false;
     }
     });
     */

    for (let i = viewPlayers.length - 1; i >= 0; i--) {
      const players = viewPlayers[i];
      for (let j = 0; j < players.length; j++) {
        const player = players[j];
        player.play();
        // we do a play/pause for queried animations such that
        // the queried animations themselves render and pause
        // on the very first frame of the animation...
        if (player.flaggedForQuery) {
          player.pause();
        }
      }
    }

    this.entries.clear();
  }
}
