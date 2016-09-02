/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationPlayer} from './animation_player';

var _queuedAnimations: AnimationPlayer[] = [];

/** @internal */
export function queueAnimation(player: AnimationPlayer) {
  _queuedAnimations.push(player);
}

/** @internal */
export function triggerQueuedAnimations() {
  for (var i = 0; i < _queuedAnimations.length; i++) {
    var player = _queuedAnimations[i];
    player.play();
  }
  _queuedAnimations = [];
}
