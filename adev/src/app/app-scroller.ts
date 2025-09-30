/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isPlatformBrowser, ViewportScroller} from '@angular/common';
import {
  Injectable,
  inject,
  ApplicationRef,
  afterNextRender,
  EnvironmentInjector,
  Injector,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import {Scroll, Router} from '@angular/router';
import {filter, firstValueFrom, map, switchMap, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AppScroller {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _lastScrollEvent?: Scroll;
  private canScroll = false;
  private cancelScroll?: () => void;

  get lastScrollEvent(): Scroll | undefined {
    return this._lastScrollEvent;
  }

  constructor() {
    if (this.isBrowser) {
      this.setupScrollRestoration();
    }
  }

  private setupScrollRestoration(): void {
    let windowWidth = window.innerWidth;
    // Setting up a ResizeObserver to update the width on resize. (without triggering a reflow)
    const windowSizeObserver = new ResizeObserver((entries) => {
      windowWidth = entries[0].contentRect.width;
    });
    windowSizeObserver.observe(document.documentElement);
    inject(DestroyRef).onDestroy(() => windowSizeObserver.disconnect());

    const root = document.documentElement; // or any element with the variable
    const styles = getComputedStyle(root);
    // slice to drop the 'px'
    const xsBreakpoint = +styles.getPropertyValue('--screen-xs').slice(0, -2);
    const mdBreakpoint = +styles.getPropertyValue('--screen-md').slice(0, -2);

    this.viewportScroller.setHistoryScrollRestoration('manual');
    this.router.events
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        tap((e) => {
          this.cancelScroll?.();
          this.canScroll = true;
          this._lastScrollEvent = e;
        }),
        filter(() => {
          const info = this.router.lastSuccessfulNavigation()?.extras.info as Record<
            'disableScrolling',
            boolean
          >;
          return !info?.['disableScrolling'];
        }),
        switchMap((e) => {
          return firstValueFrom(
            this.appRef.isStable.pipe(
              filter((stable) => stable),
              map(() => e),
            ),
          );
        }),
      )
      .subscribe(() => {
        this.scroll();
      });

    if (windowWidth < xsBreakpoint) {
      this.viewportScroller.setOffset([0, 64]);
    } else if (windowWidth <= mdBreakpoint) {
      this.viewportScroller.setOffset([0, 140]);
    } else {
      this.viewportScroller.setOffset([0, 24]);
    }
  }

  private scroll(injector?: Injector) {
    if (!this._lastScrollEvent || !this.canScroll) {
      return;
    }
    // Prevent double scrolling on the same event
    this.canScroll = false;
    const {anchor, position} = this._lastScrollEvent;

    // Don't scroll during rendering
    const ref = afterNextRender(
      {
        write: () => {
          if (position) {
            this.viewportScroller.scrollToPosition(position);
          } else if (anchor) {
            this.viewportScroller.scrollToAnchor(anchor);
          } else {
            this.viewportScroller.scrollToPosition([0, 0]);
          }
        },
      },
      // Use the component injector when provided so that the manager can
      // deregister the sequence once the component is destroyed.
      {injector: injector ?? this.injector},
    );
    this.cancelScroll = () => {
      ref.destroy();
    };
  }
}
