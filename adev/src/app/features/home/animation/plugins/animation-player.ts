/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentRef, ViewContainerRef} from '@angular/core';
import {Animation} from '../animation';
import {AnimationPlugin} from './types';
import {AnimationPlayerComponent, ComponentAlignment} from './animation-player.component';

export class AnimationPlayer implements AnimationPlugin {
  private cmpRef?: ComponentRef<AnimationPlayerComponent>;

  /**
   * USED FOR ANIMATION DEVELOPMENT.
   * Remove imports to this file before shipping the animation.
   *
   * Animation player.
   *
   * @param hostVcr VCR of the animation host component.
   * @param alignment Alignment of the player. Default: `center`
   */
  constructor(
    private hostVcr: ViewContainerRef,
    private alignment?: ComponentAlignment,
  ) {}

  init(animation: Animation) {
    this.cmpRef = this.hostVcr.createComponent(AnimationPlayerComponent);
    this.cmpRef.instance.animation.set(animation);
    this.cmpRef.instance.alignment.set(this.alignment || 'center');
  }

  destroy() {
    this.cmpRef?.destroy();
  }
}
