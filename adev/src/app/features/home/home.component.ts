/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
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
export default class Home implements AfterViewInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly win = inject(WINDOW);
  private readonly doc = inject(DOCUMENT);

  private scrollListener?: () => void;
  protected readonly tutorialFiles = TUTORIALS_HOMEPAGE_DIRECTORY;
  protected readonly isUwu = 'uwu' in this.activatedRoute.snapshot.queryParams;

  private scrollProgress = signal<number>(0);

  prefetchEditor = computed(() => this.scrollProgress() > 0.25);
  showEditor = computed(() => this.scrollProgress() > 0.35);

  animationReady = signal<boolean>(false);

  ngAfterViewInit() {
    this.scrollListener = this.renderer.listen(this.win, 'scroll', () =>
      // Keep track of the scroll progress since the home animation uses
      // different mechanics for the standard and reduced-motion animations.
      this.scrollProgress.set(this.win.scrollY / this.doc.body.scrollHeight),
    );
  }

  ngOnDestroy() {
    // Unlisten the scroll event.
    if (this.scrollListener) {
      this.scrollListener();
    }
  }

  onAnimationReady(ready: boolean) {
    this.animationReady.set(ready);
  }
}
