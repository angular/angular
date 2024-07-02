/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PendingTasks} from '../pending_tasks';
import {Injectable} from '../di/injectable';
import {inject} from '../di/injector_compatibility';
import {BehaviorSubject} from 'rxjs';
import {NgZone} from '../zone/ng_zone';

@Injectable({providedIn: 'root'})
export class ApplicationStability {
  private readonly pendingTasks = inject(PendingTasks);
  private readonly ngZone = inject(NgZone);
  readonly isStable = new BehaviorSubject(!this.pendingTasks.hasPendingTasks.value);

  private readonly subscription = this.pendingTasks.hasPendingTasks.subscribe((hasPendingTasks) => {
    if (hasPendingTasks && this.isStable.value) {
      this.isStable.next(false);
    } else if (this.shouldStabilize()) {
      // stability is always asynchronous
      this.ngZone.runOutsideAngular(async () => {
        await Promise.resolve();
        if (this.shouldStabilize()) {
          this.isStable.next(true);
        }
      });
    }
  });

  private shouldStabilize() {
    return !this.pendingTasks.hasPendingTasks.value && !this.isStable.value;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
