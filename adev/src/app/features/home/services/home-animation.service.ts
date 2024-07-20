/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {DestroyRef, Injectable, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RESIZE_EVENT_DELAY, WEBGL_LOADED_DELAY, WINDOW} from '@angular/docs';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {ThemeManager} from '../../../core/services/theme-manager.service';
import {Canvas} from '../components/canvas';
import {View} from '../components/views/view';
import {
  BREAKPOINT,
  BUILD_TEXT,
  CANVAS,
  LINES_DIV,
  LINES_TEXT,
  LOADED_CLASS_NAME,
  MAX_APP_WIDTH,
  MOVING_LOGO,
  SCALE_DIV,
  SCALE_TEXT,
  WEBGL_CLASS_NAME,
} from '../home-animation-constants';

/**
 * Injectable service for the WebGL animation of the home page.
 *
 * This class contains your usual script for GSAP animations, however it's been extended with a
 * number of classes and utilities that follow a simple MVC design pattern of views and programs
 * for OGL.
 *
 * A view is an OGL `Transform`, the `userData: View["userData"]` object is used for the GSAP animation,
 * and the `update` method applies the values to the `Transform`.
 *
 * @see {@link Canvas} for the controller class implementation.
 */
@Injectable()
export class HomeAnimation {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly window = inject(WINDOW);
  private readonly themeManager = inject(ThemeManager);

  private scale = 1;
  private progress = 0;
  private logoMovement = 0;
  private logoAnimation!: gsap.core.Timeline;
  private logoProgress = 0;
  private logoProgressTarget = 0;
  private lerpSpeed = 0.1;

  private canvas!: Canvas;
  private gradientView!: View['userData'];
  private gradient!: View['userData'];
  private angularView!: View['userData'];
  private wordmark!: View['userData'];
  private glyphs!: View[];
  private logo!: View['userData'];
  private logoInner!: View['userData'];
  private angular!: View['userData'];
  private linesContainer!: View['userData'];
  private lines!: View['userData'];
  private buildView!: View['userData'];

  private element!: HTMLDivElement;
  private animations: Array<gsap.core.Animation> = [];

  private refreshRate = 60;
  private playbackRate = 1;

  /**
   * Initialize CSS styles, GSAP, the WebGL canvas and animations.
   */
  async init(element: HTMLDivElement): Promise<void> {
    this.element = element;

    // CSS styles needed for the animation
    this.element.classList.add(WEBGL_CLASS_NAME);

    // Initialize ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.enable();
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    await this.initCanvas();
    this.getViews();

    // Call theme and resize handlers once before setting the animations
    this.onTheme();
    this.onResize();
    this.setAnimations();

    // Call update handler once before starting the animation
    this.onUpdate(0, 0, 0, 0);
    this.enable();

    // Workaround for the flash of white before the programs are ready
    setTimeout(() => {
      // Show the canvas
      this.element.classList.add(LOADED_CLASS_NAME);
    }, WEBGL_LOADED_DELAY);
  }

  /**
   * Initialize the canvas controller.
   */
  private async initCanvas(): Promise<void> {
    this.canvas = new Canvas(this.document.querySelector(CANVAS)!, this.document, this.window);

    await this.canvas.ready();
  }

  /**
   * Get the views.
   */
  private getViews(): void {
    this.gradientView = this.canvas.gradient.userData;
    this.gradient = this.canvas.gradient.background.userData;
    this.angularView = this.canvas.angular.userData;
    this.wordmark = this.canvas.angular.wordmark.userData;
    this.glyphs = this.canvas.angular.wordmark.children.slice();
    this.logo = this.glyphs[0].userData;
    this.logoInner = this.glyphs[1].userData;
    this.angular = this.glyphs.slice(2).map((glyph) => glyph.userData);

    this.linesContainer = this.canvas.lines.container.userData;
    this.lines = this.canvas.lines.container.children
      .slice(0, -1) // Skip the last child, the instanced mesh
      .map((line) => line.userData);

    this.buildView = this.canvas.build.userData;
  }

  /**
   * Set the animations.
   */
  private setAnimations(): void {
    this.animations = [
      ...this.setLogoAnimation(),
      this.setWorksAtAnyScaleAnimation(),
      ...this.setColorfulLinesAnimation(),
      this.setLovedByMillionsAnimation(),
      this.setBuildForEveryoneAnimation(),
      this.setBuildForEveryoneGradientAnimation(),
      this.setScrollProgressAnimation(),
    ];
  }

  /**
   * Gradient, logo icon and "Angular" letters animation.
   */
  private setLogoAnimation(): Array<gsap.core.Animation> {
    // Gradient and logo movement to the right
    const movementAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: MOVING_LOGO,
        start: 'center bottom',
        end: 'center center',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    movementAnimation.fromTo(
      [this.gradientView, this.wordmark],
      {
        x: 0,
      },
      {
        x: () => this.logoMovement,
        ease: 'none',
      },
    );

    // "Angular" letters
    const lettersAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: MOVING_LOGO,
        start: 'center bottom',
        end: 'center center',
        scrub: 0.5,
      },
    });

    lettersAnimation.fromTo(
      this.angular,
      {
        opacity: 1,
      },
      {
        opacity: 0,
        stagger: {
          each: 0.2,
          from: 'end',
        },
        ease: 'none',
      },
    );

    // Logo icon "explosion"
    const logoAnimation = gsap
      .timeline({paused: true})
      .to(this.gradientView, {scale: 10, duration: 1, ease: 'power1.in'})
      .to(this.logo, {scale: 40, duration: 1, ease: 'power1.in'}, 0)
      .to(this.logo, {rotation: -270, duration: 1, ease: 'power1.in'}, 0)
      .to(this.logo, {progress: 1, duration: 0.25, ease: 'power1.in'}, 0)
      .to(this.logoInner, {scale: 0, opacity: 0, duration: 0.25, ease: 'power1.out'}, 0)
      .set(this.angularView, {visible: false}, 0.8);

    // Logo progress used for icon "transformation"
    const logoProgressAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: MOVING_LOGO,
        start: 'center center',
        end: () => `bottom+=${this.document.body.clientHeight} bottom`,
        scrub: 0.5,
        onUpdate: ({progress}) => {
          if (progress > 0.25) {
            this.logoProgressTarget = progress;
          } else if (progress > 0.125) {
            this.logoProgressTarget = 0.25;
          } else {
            this.logoProgressTarget = 0;
          }
        },
      },
    });

    // Logo animation is scrubbed by the `onUpdate` method
    this.logoAnimation = logoAnimation;

    return [movementAnimation, lettersAnimation, logoAnimation, logoProgressAnimation];
  }

  /**
   * "Works at any scale" animation.
   */
  private setWorksAtAnyScaleAnimation(): gsap.core.Animation {
    const scaleTextAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: MOVING_LOGO,
        start: 'center+=10% center',
        end: () => `bottom+=${this.document.body.clientHeight} bottom`,
        scrub: 0.5,
      },
    });

    scaleTextAnimation.fromTo(
      SCALE_TEXT,
      {scale: 0.1, opacity: 0},
      {scale: 1, opacity: 1, duration: 1, ease: 'power1.in'},
    );

    // "Works at any scale" fade out animation
    scaleTextAnimation.to(SCALE_TEXT, {scale: 1.3, opacity: 0, delay: 0.8});

    return scaleTextAnimation;
  }

  /**
   * Colorful lines animation.
   */
  private setColorfulLinesAnimation(): Array<gsap.core.Animation> {
    const linesAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: SCALE_DIV,
        start: 'top+=18% bottom',
        end: () => `bottom+=${this.document.body.clientHeight * 2} bottom`,
        scrub: 0.5,
      },
    });

    linesAnimation
      .fromTo(
        this.lines,
        {
          x: 3,
          y: 4,
          scale: 0,
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          stagger: {
            each: 0.05,
            from: 'random',
          },
          ease: 'power1.out',
        },
        0,
      )
      .set(this.linesContainer, {opacity: 1}, 0);

    // Lines fade out animation
    linesAnimation.to(this.linesContainer, {
      x: -1.5,
      y: -2,
      opacity: 0,
      ease: 'power1.in',
    });

    // Lines progress used for camera zoom
    const linesProgressAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: SCALE_DIV,
        start: 'top+=18% bottom',
        end: () => `bottom+=${this.document.body.clientHeight * 2} bottom`,
        scrub: 0.5,
      },
    });

    linesProgressAnimation.to(this.canvas, {linesProgress: 1, duration: 1, ease: 'none'});

    return [linesAnimation, linesProgressAnimation];
  }

  /**
   * "Loved by millions" animation.
   */
  private setLovedByMillionsAnimation(): gsap.core.Animation {
    const linesTextAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: SCALE_DIV,
        start: 'bottom bottom',
        end: () => `bottom+=${this.document.body.clientHeight * 2} bottom`,
        scrub: 0.5,
      },
    });

    linesTextAnimation.fromTo(LINES_TEXT, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1});

    // "Loved by millions" fade out animation
    linesTextAnimation.to(LINES_TEXT, {scale: 1.3, opacity: 0, delay: 0.8});

    return linesTextAnimation;
  }

  /**
   * "Build for everyone" animation.
   */
  private setBuildForEveryoneAnimation(): gsap.core.Animation {
    const buildTextAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: LINES_DIV,
        start: 'bottom bottom',
        end: () => `bottom+=${this.document.body.clientHeight * 2} bottom`,
        scrub: 0.5,
      },
    });

    buildTextAnimation
      .fromTo(BUILD_TEXT, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1})
      .fromTo(this.buildView, {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1}, 0);

    return buildTextAnimation;
  }

  /**
   * "Build for everyone" gradient animation.
   */
  private setBuildForEveryoneGradientAnimation(): gsap.core.Animation {
    const buildTextGradientAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: LINES_DIV,
        start: 'bottom bottom',
        end: () => `bottom+=${this.document.body.clientHeight * 2} bottom`,
        scrub: 0.5,
      },
    });

    buildTextGradientAnimation.fromTo(this.gradient, {progress: 0}, {progress: 1}, 0);

    return buildTextGradientAnimation;
  }

  /**
   * Scroll progress animation.
   */
  private setScrollProgressAnimation(): gsap.core.Animation {
    const scrollProgressAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: '.adev-home',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: ({progress}) => {
          this.progress = progress;
        },
      },
    });

    // Initial values
    scrollProgressAnimation.set(this.angularView, {visible: true, immediateRender: true});

    return scrollProgressAnimation;
  }

  /**
   * Add event handlers.
   */
  private addListeners(): void {
    // TODO: This doesn't unsubscribe because of https://github.com/angular/angular/issues/50221
    // We need to update angular
    this.themeManager.themeChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.onTheme();
    });

    fromEvent(this.window, 'resize')
      .pipe(debounceTime(RESIZE_EVENT_DELAY), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.onResize();
      });

    gsap.ticker.add(this.onUpdate);
  }

  /**
   * Remove event handlers.
   */
  private removeListeners(): void {
    gsap.ticker.remove(this.onUpdate);
  }

  /**
   * Theme event handler.
   */
  private onTheme(): void {
    this.canvas.theme();
  }

  /**
   * Resize event handler.
   */
  private onResize(): void {
    let width = this.window.innerWidth;
    const height = this.document.body.clientHeight;
    const dpr = this.window.devicePixelRatio;

    if (width > MAX_APP_WIDTH) {
      width = MAX_APP_WIDTH;
    }

    if (width < BREAKPOINT) {
      this.scale = 0.5;
    } else {
      this.scale = width / 1470;
    }

    this.canvas.resize(width, height, dpr, this.scale);

    if (width < BREAKPOINT) {
      this.logoMovement = 136;
    } else {
      this.logoMovement = 272 * this.scale;
    }

    // "Build for everyone" gradient is the same width as the heading
    gsap.set(this.gradient, {buildWidth: this.canvas.build.text.userData['width']});

    ScrollTrigger.refresh();
  }

  /**
   * Update event handler.
   * An arrow function is required for binding to the listener.
   */
  private onUpdate: gsap.TickerCallback = (time: number, deltaTime: number, frame: number) => {
    this.playbackRate = this.refreshRate / (1000 / deltaTime);

    this.logoProgress = gsap.utils.interpolate(
      this.logoProgress,
      this.logoProgressTarget,
      this.lerpSpeed * this.playbackRate,
    );
    this.logoAnimation.progress(this.logoProgress);

    this.canvas.update(time, deltaTime, frame, this.progress);
    // TODO: add support for class fields arrow function
    // Using disable-next-line to avoid tslint errors - An arrow function is required for binding to the listener
    // tslint:disable-next-line:semicolon
  };

  /**
   * Starts the WebGL animation.
   */
  private enable(): void {
    this.addListeners();
  }

  /**
   * Stops the WebGL animation.
   */
  private disable(): void {
    this.removeListeners();
  }

  /**
   * Disables the animation at the end of the page.
   */
  disableEnd(footerEntry: IntersectionObserverEntry | undefined): void {
    if (!footerEntry) {
      return;
    }

    // Note: the views disable themselves based on opacity:
    // `this.visible = this.userData['opacity'] > 0;`
    if (footerEntry.isIntersecting) {
      gsap?.set([this.gradientView, this.buildView], {opacity: 0});
    } else if (this.progress > 0.8) {
      gsap?.set([this.gradientView, this.buildView], {opacity: 1});
    }
  }

  /**
   * Destroys the animations, removes the listeners, CSS classes and releases the objects for
   * garbage collection.
   */
  destroy(): void {
    this.element.classList.remove(LOADED_CLASS_NAME);
    this.element.classList.remove(WEBGL_CLASS_NAME);

    this.disable();

    ScrollTrigger.disable();

    this.animations.forEach((animation) => animation.kill());
    this.animations = [];

    this.canvas.destroy();
  }
}
