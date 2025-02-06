/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementRef, Injector, Renderer2, RendererFactory2} from '@angular/core';
import {WINDOW} from '@angular/docs';
import {Animation} from '../animation';
import {AnimationPlugin} from './types';

const RESIZE_DEBOUNCE = 500;

export class AnimationScrollHandler implements AnimationPlugin {
  private win: Window;
  private renderer: Renderer2;
  private unlisteners: (() => void)[] = [];
  private scrollHeight: number = 0;
  private spacer?: HTMLElement;
  private resizeDebounceTimeout?: ReturnType<typeof setTimeout>;

  /**
   * Enables page scroll control over the animation.
   *
   * @param hostElementRef `ElementRef` of the animation host component.
   * @param injector
   * @param addSpacer Enabled by default. Use when the position of the animation is `fixed`.
   */
  constructor(
    private hostElementRef: ElementRef,
    injector: Injector,
    private addSpacer: boolean = true,
  ) {
    this.win = injector.get(WINDOW);
    this.renderer = injector.get(RendererFactory2).createRenderer(null, null);
  }

  init(animation: Animation) {
    // Calculate the total scroll height needed for the animation.
    this.scrollHeight = animation.duration / animation.timestep;

    this.unlisteners.push(
      this.renderer.listen(this.win, 'scroll', () => {
        if (animation.isPlaying()) {
          animation.pause();
        }
        const progress = this.win.scrollY / this.scrollHeight;
        animation.seek(progress);
      }),
    );

    if (this.addSpacer) {
      this.createSpacer();

      this.unlisteners.push(
        this.renderer.listen(this.win, 'resize', () => {
          if (this.resizeDebounceTimeout) {
            clearTimeout(this.resizeDebounceTimeout);
          }
          this.resizeDebounceTimeout = setTimeout(() => this.updateSpacerHeight(), RESIZE_DEBOUNCE);
        }),
      );
    }
  }

  destroy() {
    for (const unlisten of this.unlisteners) {
      unlisten();
    }
  }

  /** Creates and stores a spacer that occupies/creates the scrollable space needed for the animation. */
  private createSpacer() {
    this.spacer = this.renderer.createElement('div');
    this.renderer.addClass(this.spacer, 'anim-scroll-spacer');
    this.updateSpacerHeight();

    this.hostElementRef.nativeElement.appendChild(this.spacer);
  }

  /** Update stored spacer's height. */
  private updateSpacerHeight() {
    const spacerHeight = this.scrollHeight + this.win.innerHeight;
    this.renderer.setStyle(this.spacer, 'height', spacerHeight + 'px');
  }
}
