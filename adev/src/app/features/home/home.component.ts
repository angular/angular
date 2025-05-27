/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Renderer2,
  signal,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {WINDOW} from '@angular/docs';

import {HomeAnimationComponent} from './components/home-animation/home-animation.component';
import {CodeEditorComponent} from './components/home-editor.component';

export const TUTORIALS_HOMEPAGE_DIRECTORY = 'homepage';

@Component({
  selector: 'adev-home',
  imports: [HomeAnimationComponent, CodeEditorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly win = inject(WINDOW);
  private readonly doc = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tutorialFiles = TUTORIALS_HOMEPAGE_DIRECTORY;
  protected readonly isUwu = 'uwu' in this.activatedRoute.snapshot.queryParams;

  private scrollProgress = signal<number>(0);

  prefetchEditor = computed(() => this.scrollProgress() > 0.25);
  showEditor = computed(() => this.scrollProgress() > 0.35);

  animationReady = signal<boolean>(false);

  constructor() {
    const scrollListenerCleanupFn = this.renderer.listen(this.win, 'scroll', () =>
      // Keep track of the scroll progress since the home animation uses
      // different mechanics for the standard and reduced-motion animations.
      this.scrollProgress.set(this.win.scrollY / this.doc.body.scrollHeight),
    );
    this.destroyRef.onDestroy(() => scrollListenerCleanupFn());
  }

  onAnimationReady(ready: boolean) {
    this.animationReady.set(ready);
  }
}
