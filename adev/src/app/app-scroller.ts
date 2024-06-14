/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ViewportScroller} from '@angular/common';
import {Injectable, inject, ApplicationRef} from '@angular/core';
import {Scroll, Router} from '@angular/router';
import {filter, firstValueFrom, map, switchMap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AppScroller {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly appRef = inject(ApplicationRef);
  disableScrolling = false;

  constructor() {
    this.viewportScroller.setHistoryScrollRestoration('manual');
    this.router.events
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        filter(() => !this.disableScrolling),
        switchMap((e) => {
          return firstValueFrom(
            this.appRef.isStable.pipe(
              filter((stable) => stable),
              map(() => e),
            ),
          );
        }),
      )
      .subscribe(({anchor, position}) => {
        if (position) {
          this.viewportScroller.scrollToPosition(position);
        } else if (anchor) {
          this.viewportScroller.scrollToAnchor(anchor);
        } else {
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
