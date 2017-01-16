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

@Injectable()
export class AnimationQueue {
  public entries: AnimationPlayer[] = [];

  constructor(private _zone: NgZone) {}

  enqueue(player: AnimationPlayer) { this.entries.push(player); }

  flush() {
    // given that each animation player may set aside
    // microtasks and rely on DOM-based events, this
    // will cause Angular to run change detection after
    // each request. This sidesteps the issue. If a user
    // hooks into an animation via (@anim.start) or (@anim.done)
    // then those methods will automatically trigger change
    // detection by wrapping themselves inside of a zone
    if (this.entries.length) {
      this._zone.runOutsideAngular(() => {
        // this code is wrapped into a single promise such that the
        // onStart and onDone player callbacks are triggered outside
        // of the digest cycle of animations
        Promise.resolve(null).then(() => this._triggerAnimations());
      });
    }
  }

  private _triggerAnimations() {
    NgZone.assertNotInAngularZone();

    while (this.entries.length) {
      const player = this.entries.shift();
      // in the event that an animation throws an error then we do
      // not want to re-run animations on any previous animations
      // if they have already been kicked off beforehand
      if (!player.hasStarted()) {
        player.play();
      }
    }
  }
}
