/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ViewportScroller} from '@angular/common';
import {
  Injectable,
  inject,
  ApplicationRef,
  afterNextRender,
  EnvironmentInjector,
  Injector,
} from '@angular/core';
import {Scroll, Router} from '@angular/router';
import {filter, firstValueFrom, map, switchMap, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AppScroller {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  private _lastScrollEvent?: Scroll;
  private canScroll = false;
  private cancelScroll?: () => void;

  get lastScrollEvent(): Scroll | undefined {
    return this._lastScrollEvent;
  }

  constructor() {
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
          const info = this.router.lastSuccessfulNavigation?.extras.info as Record<
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
  }

  scroll(injector?: Injector) {
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
