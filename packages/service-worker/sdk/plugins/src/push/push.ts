/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FsaMessage, Operation, Plugin, PluginFactory, VersionWorker, makeBroadcastFsa} from '@angular/service-worker/sdk';

interface PushManifest {
  showNotifications?: boolean;
}
const EMPTY_MANIFEST: PushManifest = {};

const NOTIFICATION_OPTION_NAMES = [
  'actions', 'body', 'dir', 'icon', 'lang', 'renotify', 'requireInteraction', 'tag', 'vibrate',
  'data'
];

const FSA_PUSH_MESSAGE = 'PUSH_MESSAGE';

interface PushMessagePayload {
  data: string|Object;
}

/**
 * @experimental
 */
export function Push(): PluginFactory<PushImpl> {
  return (worker: VersionWorker) => new PushImpl(worker);
}

/**
 * @experimental
 */
export class PushImpl implements Plugin<PushImpl> {
  constructor(private worker: VersionWorker) {}

  private get pushManifest(): PushManifest {
    return this.worker.manifest['push'] as PushManifest || EMPTY_MANIFEST;
  }

  setup(ops: Operation[]): void {}

  push(data: any): Promise<any> {
    let message: any;
    try {
      message = JSON.parse(data);
    } catch (e) {
      // If the string can't be parsed, display it verbatim.
      message = {
        notification: {
          title: data,
        },
      };
    }
    this.maybeShowNotification(message);
    this.worker.driver.broadcast(makeBroadcastFsa(FSA_PUSH_MESSAGE, {
      data: message,
    }));
    return Promise.resolve();
  }

  maybeShowNotification(data: any) {
    if (!data.notification || !data.notification.title) {
      return;
    }
    const manifest = this.pushManifest;
    if (!manifest.showNotifications) {
      return;
    }
    const desc: any = data.notification;
    let options: any = {};
    NOTIFICATION_OPTION_NAMES.filter(name => desc.hasOwnProperty(name))
        .forEach(name => options[name] = desc[name]);
    this.worker.showNotification(desc['title'], options);
  }
}
