/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// tslint:disable: no-duplicate-imports
import {Component} from '@angular/core';

// #docregion inject-sw-push
import {SwPush} from '@angular/service-worker';
// #enddocregion inject-sw-push
// tslint:enable: no-duplicate-imports

const PUBLIC_VAPID_KEY_OF_SERVER = '...';

@Component({
  selector: 'example-app',
  template: 'SW enabled: {{ swPush.isEnabled }}',
})
// #docregion inject-sw-push
export class AppComponent {
  constructor(readonly swPush: SwPush) {}
  // #enddocregion inject-sw-push

  // #docregion subscribe-to-push
  private async subscribeToPush() {
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: PUBLIC_VAPID_KEY_OF_SERVER,
      });
      // TODO: Send to server.
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }
  // #enddocregion subscribe-to-push

  private subscribeToNotificationClicks() {
    // #docregion subscribe-to-notification-clicks
    this.swPush.notificationClicks.subscribe(({action, notification}) => {
      // TODO: Do something in response to notification click.
    });
    // #enddocregion subscribe-to-notification-clicks
  }
  // #docregion inject-sw-push
}
// #enddocregion inject-sw-push
