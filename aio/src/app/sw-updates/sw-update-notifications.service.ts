import { Inject, Injectable } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig, MdSnackBarRef } from '@angular/material';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';

import { Global } from './global.value';
import { SwUpdatesService } from './sw-updates.service';


/**
 * SwUpdateNotificationsService
 *
 * @description
 * Once enabled:
 * 1. Subscribes to ServiceWorker updates and prompts the user to update.
 * 2. When the user confirms, it activates the update and reloads the page upon activation success.
 * 3. Continues to listen for available ServiceWorker updates.
 *
 * @method
 * `disable()` {() => void} - Dismiss any open notifications and stop listening for ServiceWorker
 * updates.
 *
 * @method
 * `enable()` {() => void} - Start listening for ServiceWorker updates.
 */
@Injectable()
export class SwUpdateNotificationsService {
  private onDisable = new Subject();
  private snackBars: MdSnackBarRef<any>[] = [];
  private enabled = false;

  constructor(@Inject(Global) private global: any,
              private snackBarService: MdSnackBar,
              private swUpdates: SwUpdatesService) {
    this.onDisable.subscribe(() => this.snackBars.forEach(sb => sb.dismiss()));
  }

  disable() {
    if (this.enabled) {
      this.enabled = false;
      this.onDisable.next();
    }
  }

  enable() {
    if (!this.enabled) {
      this.enabled = true;
      this.swUpdates.isUpdateAvailable
          .filter(v => v)
          .takeUntil(this.onDisable)
          .subscribe(() => this.notifyForUpdate());
    }
  }

  private activateUpdate() {
    this.swUpdates.activateUpdate().then(success => {
      if (success) {
        this.onActivateSuccess();
      } else {
        this.onActivateFailure();
      }
    });
  }

  private notifyForUpdate() {
    this.openSnackBar('New update for angular.io is available.', 'Update now')
        .onAction().subscribe(() => this.activateUpdate());
  }

  private onActivateFailure() {
    const snackBar = this.openSnackBar('Update activation failed :(', 'Dismiss', {duration: 5000});
    snackBar.onAction().subscribe(() => snackBar.dismiss());
  }

  private onActivateSuccess() {
    this.reloadPage();
  }

  private openSnackBar(message: string, action?: string, config?: MdSnackBarConfig): MdSnackBarRef<any> {
    const snackBar = this.snackBarService.open(message, action, config);
    snackBar.afterDismissed().subscribe(() => this.snackBars = this.snackBars.filter(sb => sb !== snackBar));

    this.snackBars.push(snackBar);

    return snackBar;
  }

  private reloadPage() {
    const location = this.global && (this.global as Window).location;
    if (location && location.reload) {
      location.reload();
    }
  }
}
