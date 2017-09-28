/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {merge as obs_merge} from 'rxjs/observable/merge';

import {map as op_map} from 'rxjs/operator/map';
import {switchMap as op_switchMap} from 'rxjs/operator/switchMap';
import {take as op_take} from 'rxjs/operator/take';
import {toPromise as op_toPromise} from 'rxjs/operator/toPromise';

import {NgswCommChannel} from './low_level';

/**
 * Subscribe and listen to push notifications from the Service Worker.
 *
 * @experimental
 */
export class SwPush {
  readonly messages: Observable<object>;
  readonly subscription: Observable<PushSubscription|null>;

  private pushManager: Observable<PushManager>;
  private subscriptionChanges: Subject<PushSubscription|null> =
      new Subject<PushSubscription|null>();

  constructor(private sw: NgswCommChannel) {
    this.messages =
        op_map.call(this.sw.eventsOfType('PUSH'), (message: {data: object}) => message.data);

    this.pushManager = <Observable<PushManager>>(op_map.call(
        this.sw.registration,
        (registration: ServiceWorkerRegistration) => { return registration.pushManager; }));

    const workerDrivenSubscriptions = <Observable<PushSubscription|null>>(op_switchMap.call(
        this.pushManager, (pm: PushManager) => pm.getSubscription().then(sub => { return sub; })));
    this.subscription = obs_merge.call(workerDrivenSubscriptions, this.subscriptionChanges);
  }

  requestSubscription(options: {serverPublicKey: string}): Promise<PushSubscription> {
    const pushOptions: PushSubscriptionOptionsInit = {userVisibleOnly: true};
    let key = atob(options.serverPublicKey.replace(/_/g, '/').replace(/-/g, '+'));
    let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
    for (let i = 0; i < key.length; i++) {
      applicationServerKey[i] = key.charCodeAt(i);
    }
    pushOptions.applicationServerKey = applicationServerKey;
    const subscribe = <Observable<PushSubscription>>(
        op_switchMap.call(this.pushManager, (pm: PushManager) => pm.subscribe(pushOptions)));
    const subscribeOnce = op_take.call(subscribe, 1);
    return (op_toPromise.call(subscribeOnce) as Promise<PushSubscription>).then(sub => {
      this.subscriptionChanges.next(sub);
      return sub;
    });
  }

  unsubscribe(): Promise<void> {
    const unsubscribe = op_switchMap.call(this.subscription, (sub: PushSubscription | null) => {
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
    });
    const unsubscribeOnce = op_take.call(unsubscribe, 1);
    return op_toPromise.call(unsubscribeOnce) as Promise<void>;
  }
}