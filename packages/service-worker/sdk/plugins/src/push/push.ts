import {Operation, Plugin, PluginFactory, VersionWorker,} from '@angular/service-worker/sdk';

interface PushManifest {
  showNotifications?: boolean;
  backgroundOnly?: boolean;
}
const EMPTY_MANIFEST: PushManifest = {};

const NOTIFICATION_OPTION_NAMES = [
  'actions', 'body', 'dir', 'icon', 'lang', 'renotify', 'requireInteraction', 'tag', 'vibrate',
  'data'
];

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
  private streams: number[] = [];
  private buffer: Object[] = [];

  private get pushManifest(): PushManifest {
    return this.worker.manifest['push'] as PushManifest || EMPTY_MANIFEST;
  }

  constructor(private worker: VersionWorker) {}

  setup(ops: Operation[]): void {}

  message(message: any, id: number): Promise<any> {
    switch (message['cmd']) {
      case 'push':
        this.streams.push(id);
        if (this.buffer !== null) {
          this.buffer.forEach(message => this.worker.sendToStream(id, message));
          this.buffer = null !;
        }
        break;
    }
    return Promise.resolve();
  }

  messageClosed(id: number): void {
    const index = this.streams.indexOf(id);
    if (index === -1) {
      return;
    }
    this.streams.splice(index, 1);
    if (this.streams.length === 0) {
      this.buffer = [];
    }
  }

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
    if (this.buffer !== null) {
      this.buffer.push(message);
    } else {
      this.streams.forEach(id => { this.worker.sendToStream(id, message); })
    }
    return Promise.resolve();
  }

  maybeShowNotification(data: any) {
    if (!data.notification || !data.notification.title) {
      return;
    }
    const manifest = this.pushManifest;
    if (!manifest.showNotifications || (!!manifest.backgroundOnly && this.buffer === null)) {
      return;
    }
    const desc: any = data.notification;
    let options: any = {};
    NOTIFICATION_OPTION_NAMES.filter(name => desc.hasOwnProperty(name))
        .forEach(name => options[name] = desc[name]);
    this.worker.showNotification(desc['title'], options);
  }
}
