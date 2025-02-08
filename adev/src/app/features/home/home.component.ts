/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WINDOW, shouldReduceMotion, isIos} from '@angular/docs';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {from} from 'rxjs';

import {injectAsync} from '../../core/services/inject-async';

import {CodeEditorComponent} from './components/home-editor.component';

import {HEADER_CLASS_NAME} from './home-animation-constants';
import type {HomeAnimation} from './services/home-animation.service';

export const TUTORIALS_HOMEPAGE_DIRECTORY = 'homepage';

@Component({
  selector: 'adev-home',
  imports: [RouterLink, CodeEditorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  @ViewChild('home') home!: ElementRef<HTMLDivElement>;

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly window = inject(WINDOW);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tutorialFiles = TUTORIALS_HOMEPAGE_DIRECTORY;
  protected readonly isUwu = 'uwu' in this.activatedRoute.snapshot.queryParams;
  private element!: HTMLDivElement;
  private homeAnimation?: HomeAnimation;
  private intersectionObserver: IntersectionObserver | undefined;

  readonly ctaLink = isIos ? 'overview' : 'tutorials/learn-angular';

  constructor() {
    afterNextRender(() => {
      this.element = this.home.nativeElement;

      // Always scroll to top on home page (even for navigating back)
      this.window.scrollTo({top: 0, left: 0, behavior: 'instant'});

      // Create a single intersection observer used for disabling the animation
      // at the end of the page, and to load the embedded editor.
      this.initIntersectionObserver();

      if (this.isWebGLAvailable() && !shouldReduceMotion() && !this.isUwu) {
        this.loadHomeAnimation();
      }
    });

    this.destroyRef.onDestroy(() => {
      // Stop observing and disconnect
      this.intersectionObserver?.disconnect();
      this.homeAnimation?.destroy();
    });
  }

  private initIntersectionObserver(): void {
    const header = this.document.querySelector('.adev-top');
    const footer = this.document.querySelector('footer');

    this.intersectionObserver = new IntersectionObserver((entries) => {
      const headerEntry = entries.find((entry) => entry.target === header);
      const footerEntry = entries.find((entry) => entry.target === footer);

      // CTA and arrow animation
      this.headerTop(headerEntry);

      // Disable animation at end of page
      this.homeAnimation?.disableEnd(footerEntry);
    });

    // Start observing
    this.intersectionObserver.observe(header!);
    this.intersectionObserver.observe(footer!);
  }

  private headerTop(headerEntry: IntersectionObserverEntry | undefined): void {
    if (!headerEntry) {
      return;
    }

    if (headerEntry.isIntersecting) {
      this.element.classList.add(HEADER_CLASS_NAME);
    } else {
      this.element.classList.remove(HEADER_CLASS_NAME);
    }
  }

  private loadHomeAnimation() {
    from(
      injectAsync(this.injector, () =>
        import('./services/home-animation.service').then((c) => c.HomeAnimation),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((homeAnimation) => {
        this.homeAnimation = homeAnimation;
        this.homeAnimation.init(this.element);
      });
  }

  private isWebGLAvailable() {
    try {
      return !!document
        .createElement('canvas')
        .getContext('webgl', {failIfMajorPerformanceCaveat: true});
    } catch (e) {
      return false;
    }
  }
}
