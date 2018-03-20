/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {NEVER, Observable, Subject, merge} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';

import {ERR_SW_NOT_SUPPORTED, NgswCommChannel} from './low_level';



/**
 * Subscribe and listen to push notifications from the Service Worker.
 *
 * @experimental
 */
@Injectable()
export class SwPush {
  readonly messages: Observable<object>;
  readonly subscription: Observable<PushSubscription|null>;

  private pushManager: Observable<PushManager>;
  private subscriptionChanges: Subject<PushSubscription|null> =
      new Subject<PushSubscription|null>();

  constructor(private sw: NgswCommChannel) {
    if (!sw.isEnabled) {
      this.messages = NEVER;
      this.subscription = NEVER;
      return;
    }
    this.messages = this.sw.eventsOfType('PUSH').pipe(map((message: any) => message.data));

    this.pushManager = this.sw.registration.pipe(
        map((registration: ServiceWorkerRegistration) => { return registration.pushManager; }));

    const workerDrivenSubscriptions = this.pushManager.pipe(
        switchMap((pm: PushManager) => pm.getSubscription().then(sub => { return sub; })));
    this.subscription = merge(workerDrivenSubscriptions, this.subscriptionChanges);
  }

  /**
   * Returns true if the Service Worker is enabled (supported by the browser and enabled via
   * ServiceWorkerModule).
   */
  get isEnabled(): boolean { return this.sw.isEnabled; }

  requestSubscription(options: {serverPublicKey: string}): Promise<PushSubscription> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const pushOptions: PushSubscriptionOptionsInit = {userVisibleOnly: true};
    let key = atob(options.serverPublicKey.replace(/_/g, '/').replace(/-/g, '+'));
    let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
    for (let i = 0; i < key.length; i++) {
      applicationServerKey[i] = key.charCodeAt(i);
    }
    pushOptions.applicationServerKey = applicationServerKey;

    return this.pushManager.pipe(switchMap((pm: PushManager) => pm.subscribe(pushOptions)), take(1))
        .toPromise()
        .then(sub => {
          this.subscriptionChanges.next(sub);
          return sub;
        });
  }

  unsubscribe(): Promise<void> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const unsubscribe = this.subscription.pipe(switchMap((sub: PushSubscription | null) => {
      if (sub !== null) {
        return sub.unsubscribe().then(success => {
          if (success) {
            this.subscriptionChanges.next(null);
            return undefined;
          } else {
            throw new Error('Unsubscribe failed!');
          }
        });
      } else {
        throw new Error('Not subscribed to push notifications.');
      }
    }));
    return unsubscribe.pipe(take(1)).toPromise();
  }
}
