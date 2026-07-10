/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  DestroyRef,
  EnvironmentInjector,
  Service,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import {NavigationState} from '@angular/docs';

import {AngryAngieComponent} from '../layout/angry-angie/angry-angie.component';
import {DARK_MODE_CLASS_NAME, LIGHT_MODE_CLASS_NAME} from './theme-manager.service';

const TAP_THRESHOLD = 10;
const TAP_WINDOW_MS = 2000;
const VISIBLE_MS = 6000;
const STROBE_MS = 400;

/** The angry Angie theme-toggle easter egg. */
@Service()
export class AngryAngie {
  private readonly document = inject(DOCUMENT);
  private readonly navigationState = inject(NavigationState);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  readonly show = signal(false);

  private tapCount = 0;
  private tapResetTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private strobeTimer?: ReturnType<typeof setInterval>;
  private strobeWasDark = false;
  private overlayRef?: ComponentRef<AngryAngieComponent>;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.tapResetTimer);
      clearTimeout(this.hideTimer);
      this.stopStrobe();
      this.overlayRef?.destroy();
    });
  }

  registerTap(): void {
    if (this.show()) {
      return;
    }
    clearTimeout(this.tapResetTimer);
    this.tapResetTimer = setTimeout(() => (this.tapCount = 0), TAP_WINDOW_MS);
    if (++this.tapCount >= TAP_THRESHOLD) {
      this.tapCount = 0;
      this.mountOverlay();
      this.navigationState.setMobileNavigationListVisibility(false);
      this.show.set(true);
      this.startStrobe();
      this.hideTimer = setTimeout(() => {
        this.show.set(false);
        this.stopStrobe();
      }, VISIBLE_MS);
    }
  }

  private mountOverlay(): void {
    if (this.overlayRef) {
      return;
    }
    this.overlayRef = createComponent(AngryAngieComponent, {
      environmentInjector: this.environmentInjector,
    });
    this.appRef.attachView(this.overlayRef.hostView);
    this.document.body.appendChild(this.overlayRef.location.nativeElement);
  }

  private startStrobe(): void {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.strobeWasDark = this.document.documentElement.classList.contains(DARK_MODE_CLASS_NAME);
    let dark = true;
    this.strobeTimer = setInterval(() => {
      this.setDarkModeClass(dark);
      dark = !dark;
    }, STROBE_MS);
  }

  private stopStrobe(): void {
    if (this.strobeTimer === undefined) {
      return;
    }
    clearInterval(this.strobeTimer);
    this.strobeTimer = undefined;
    this.setDarkModeClass(this.strobeWasDark);
  }

  private setDarkModeClass(dark: boolean): void {
    const classList = this.document.documentElement.classList;
    classList.toggle(DARK_MODE_CLASS_NAME, dark);
    classList.toggle(LIGHT_MODE_CLASS_NAME, !dark);
  }
}
