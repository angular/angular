/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, Optional, ɵRuntimeError as RuntimeError} from '@angular/core';
import {NEVER, Observable, Subject} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';

import {RuntimeErrorCode} from './errors';
import {ERR_SW_NOT_SUPPORTED, NgswCommChannel, PushEvent} from './low_level';

/**
 * Subscribe and listen to
 * [Web Push
 * Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API/Best_Practices) through
 * Angular Service Worker.
 *
 * @usageNotes
 *
 * You can inject a `SwPush` instance into any component or service
 * as a dependency.
 *
 * <code-example path="service-worker/push/module.ts" region="inject-sw-push"
 * header="app.component.ts"></code-example>
 *
 * To subscribe, call `SwPush.requestSubscription()`, which asks the user for permission.
 * The call returns a `Promise` with a new
 * [`PushSubscription`](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)
 * instance.
 *
 * <code-example path="service-worker/push/module.ts" region="subscribe-to-push"
 * header="app.component.ts"></code-example>
 *
 * A request is rejected if the user denies permission, or if the browser
 * blocks or does not support the Push API or ServiceWorkers.
 * Check `SwPush.isEnabled` to confirm status.
 *
 * Invoke Push Notifications by pushing a message with the following payload.
 *
 * ```ts
 * {
 *   "notification": {
 *     "actions": NotificationAction[],
 *     "badge": USVString,
 *     "body": DOMString,
 *     "data": any,
 *     "dir": "auto"|"ltr"|"rtl",
 *     "icon": USVString,
 *     "image": USVString,
 *     "lang": DOMString,
 *     "renotify": boolean,
 *     "requireInteraction": boolean,
 *     "silent": boolean,
 *     "tag": DOMString,
 *     "timestamp": DOMTimeStamp,
 *     "title": DOMString,
 *     "vibrate": number[]
 *   }
 * }
 * ```
 *
 * Only `title` is required. See `Notification`
 * [instance
 * properties](https://developer.mozilla.org/en-US/docs/Web/API/Notification#Instance_properties).
 *
 * While the subscription is active, Service Worker listens for
 * [PushEvent](https://developer.mozilla.org/en-US/docs/Web/API/PushEvent)
 * occurrences and creates
 * [Notification](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
 * instances in response.
 *
 * Unsubscribe using `SwPush.unsubscribe()`.
 *
 * An application can subscribe to `SwPush.notificationClicks` observable to be notified when a user
 * clicks on a notification. For example:
 *
 * <code-example path="service-worker/push/module.ts" region="subscribe-to-notification-clicks"
 * header="app.component.ts"></code-example>
 *
 * You can read more on handling notification clicks in the [Service worker notifications
 * guide](ecosystem/service-workers/push-notifications).
 *
 * @see [Push Notifications](https://developers.google.com/web/fundamentals/codelabs/push-notifications/)
 * @see [Angular Push Notifications](https://blog.angular-university.io/angular-push-notifications/)
 * @see [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
 * @see [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
 * @see [MDN: Web Push API Notifications best practices](https://developer.mozilla.org/en-US/docs/Web/API/Push_API/Best_Practices)
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class SwPush {
  /**
   * Emits the payloads of the received push notification messages.
   */
  readonly messages: Observable<object>;

  /**
   * Emits the payloads of the received push notification messages as well as the action the user
   * interacted with. If no action was used the `action` property contains an empty string `''`.
   *
   * Note that the `notification` property does **not** contain a
   * [Notification][Mozilla Notification] object but rather a
   * [NotificationOptions](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
   * object that also includes the `title` of the [Notification][Mozilla Notification] object.
   *
   * [Mozilla Notification]: https://developer.mozilla.org/en-US/docs/Web/API/Notification
   */
  readonly notificationClicks: Observable<{
    action: string;
    notification: NotificationOptions & {
      title: string;
    };
  }>;

  /**
   * Emits the payloads of notifications that were closed, along with the action (if any)
   * associated with the close event. If no action was used, the `action` property contains
   * an empty string `''`.
   *
   * Note that the `notification` property does **not** contain a
   * [Notification][Mozilla Notification] object but rather a
   * [NotificationOptions](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
   * object that also includes the `title` of the [Notification][Mozilla Notification] object.
   *
   * [Mozilla Notification]: https://developer.mozilla.org/en-US/docs/Web/API/Notification
   */
  readonly notificationCloses: Observable<{
    action: string;
    notification: NotificationOptions & {
      title: string;
    };
  }>;

  /**
   * Emits updates to the push subscription, including both the previous (`oldSubscription`)
   * and current (`newSubscription`) values. Either subscription may be `null`, depending on
   * the context:
   *
   * - `oldSubscription` is `null` if no previous subscription existed.
   * - `newSubscription` is `null` if the subscription was invalidated and not replaced.
   *
   * This stream allows clients to react to automatic changes in push subscriptions,
   * such as those triggered by browser expiration or key rotation.
   *
   * [Push API]: https://w3c.github.io/push-api
   */
  readonly pushSubscriptionChanges: Observable<{
    oldSubscription: PushSubscription | null;
    newSubscription: PushSubscription | null;
  }>;

  /**
   * Emits the currently active
   * [PushSubscription](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)
   * associated to the Service Worker registration or `null` if there is no subscription.
   */
  readonly subscription: Observable<PushSubscription | null>;

  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled(): boolean {
    return this.sw.isEnabled;
  }

  private pushManager: Observable<PushManager> | null = null;
  private subscriptionChanges = new Subject<PushSubscription | null>();

  constructor(
    // Since `SwUpdate` is provided in the root to be tree-shakable,
    // it might be available for injection on the server.
    // However, `provideServiceWorker` might not be present in the server's
    // provider configuration. In that case, we fall back to an object with
    // a single property: `isEnabled: false`.
    @Optional()
    @Inject(NgswCommChannel)
    private sw: NgswCommChannel = <NgswCommChannel>{isEnabled: false},
  ) {
    if (!this.sw.isEnabled) {
      this.messages = NEVER;
      this.notificationClicks = NEVER;
      this.notificationCloses = NEVER;
      this.pushSubscriptionChanges = NEVER;
      this.subscription = NEVER;
      return;
    }

    this.messages = this.sw.eventsOfType<PushEvent>('PUSH').pipe(map((message) => message.data));

    this.notificationClicks = this.sw
      .eventsOfType('NOTIFICATION_CLICK')
      .pipe(map((message: any) => message.data));

    this.notificationCloses = this.sw
      .eventsOfType('NOTIFICATION_CLOSE')
      .pipe(map((message: any) => message.data));

    this.pushSubscriptionChanges = this.sw
      .eventsOfType('PUSH_SUBSCRIPTION_CHANGE')
      .pipe(map((message: any) => message.data));

    this.pushManager = this.sw.registration.pipe(map((registration) => registration.pushManager));

    const workerDrivenSubscriptions = this.pushManager.pipe(
      switchMap((pm) => pm.getSubscription()),
    );
    this.subscription = new Observable((subscriber) => {
      const workerDrivenSubscription = workerDrivenSubscriptions.subscribe(subscriber);
      const subscriptionChanges = this.subscriptionChanges.subscribe(subscriber);
      return () => {
        workerDrivenSubscription.unsubscribe();
        subscriptionChanges.unsubscribe();
      };
    });
  }

  /**
   * Subscribes to Web Push Notifications,
   * after requesting and receiving user permission.
   *
   * @param options An object containing the `serverPublicKey` string.
   * @returns A Promise that resolves to the new subscription object.
   */
  requestSubscription(options: {serverPublicKey: string}): Promise<PushSubscription> {
    if (!this.sw.isEnabled || this.pushManager === null) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const pushOptions: PushSubscriptionOptionsInit = {userVisibleOnly: true};
    let key = this.decodeBase64(options.serverPublicKey.replace(/_/g, '/').replace(/-/g, '+'));
    let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
    for (let i = 0; i < key.length; i++) {
      applicationServerKey[i] = key.charCodeAt(i);
    }
    pushOptions.applicationServerKey = applicationServerKey;

    return new Promise((resolve, reject) => {
      this.pushManager!.pipe(
        switchMap((pm) => pm.subscribe(pushOptions)),
        take(1),
      ).subscribe({
        next: (sub) => {
          this.subscriptionChanges.next(sub);
          resolve(sub);
        },
        error: reject,
      });
    });
  }

  /**
   * Unsubscribes from Service Worker push notifications.
   *
   * @returns A Promise that is resolved when the operation succeeds, or is rejected if there is no
   *          active subscription or the unsubscribe operation fails.
   */
  unsubscribe(): Promise<void> {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }

    const doUnsubscribe = (sub: PushSubscription | null) => {
      if (sub === null) {
        throw new RuntimeError(
          RuntimeErrorCode.NOT_SUBSCRIBED_TO_PUSH_NOTIFICATIONS,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            'Not subscribed to push notifications.',
        );
      }

      return sub.unsubscribe().then((success) => {
        if (!success) {
          throw new RuntimeError(
            RuntimeErrorCode.PUSH_SUBSCRIPTION_UNSUBSCRIBE_FAILED,
            (typeof ngDevMode === 'undefined' || ngDevMode) && 'Unsubscribe failed!',
          );
        }

        this.subscriptionChanges.next(null);
      });
    };

    return new Promise((resolve, reject) => {
      this.subscription
        .pipe(take(1), switchMap(doUnsubscribe))
        .subscribe({next: resolve, error: reject});
    });
  }

  private decodeBase64(input: string): string {
    return atob(input);
  }
}
