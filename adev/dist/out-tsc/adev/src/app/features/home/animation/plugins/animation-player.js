/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AnimationPlayerComponent} from './animation-player.component';
export class AnimationPlayer {
  hostVcr;
  alignment;
  cmpRef;
  /**
   * USED FOR ANIMATION DEVELOPMENT.
   * Remove imports to this file before shipping the animation.
   *
   * Animation player.
   *
   * @param hostVcr VCR of the animation host component.
   * @param alignment Alignment of the player. Default: `center`
   */
  constructor(hostVcr, alignment) {
    this.hostVcr = hostVcr;
    this.alignment = alignment;
  }
  init(animation) {
    this.cmpRef = this.hostVcr.createComponent(AnimationPlayerComponent);
    this.cmpRef.instance.animation.set(animation);
    this.cmpRef.instance.alignment.set(this.alignment || 'center');
  }
  destroy() {
    this.cmpRef?.destroy();
  }
}
//# sourceMappingURL=animation-player.js.map
