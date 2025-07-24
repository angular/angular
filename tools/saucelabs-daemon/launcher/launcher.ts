/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createConnection, Socket} from 'net';

import {Browser, getUniqueId} from '../browser';
import {IPC_PORT} from '../ipc-defaults';
import {BackgroundServiceSendMessages, EndTestMessage, StartTestMessage} from '../ipc-messages';

export function SaucelabsLauncher(
  this: any,
  args: Browser,
  config: unknown,
  logger: any,
  baseLauncherDecorator: any,
  captureTimeoutLauncherDecorator: any,
  retryLauncherDecorator: any,
) {
  // Apply base class mixins. This would be nice to have typed, but this is a low-priority now.
  baseLauncherDecorator(this);
  captureTimeoutLauncherDecorator(this);
  retryLauncherDecorator(this);

  const log = logger.create('SaucelabsLauncher');
  const browserDisplayName =
    args.browserName +
    (args.browserVersion ? ' ' + args.browserVersion : '') +
    (args.platformName ? ' (' + args.platformName + ')' : '');
  const testSuiteDescription = process.env['TEST_TARGET'] ?? '<unknown>';

  let daemonConnection: Socket | null = null;

  // Setup Browser name that will be printed out by Karma.
  this.name = browserDisplayName + ' on SauceLabs (daemon)';

  this.on('start', (pageUrl: string) => {
    daemonConnection = createConnection({port: IPC_PORT}, () => _startBrowserTest(pageUrl, args));

    daemonConnection.on('data', (b) =>
      _processMessage(JSON.parse(b.toString()) as BackgroundServiceSendMessages),
    );
    daemonConnection.on('error', (err) => {
      log.error(err);

      // Notify karma about the failure.
      this._done('failure');
    });
  });

  this.on('kill', async (doneFn: () => void) => {
    _endBrowserTest();
    daemonConnection?.end();
    doneFn();
  });

  const _processMessage = (message: BackgroundServiceSendMessages) => {
    switch (message.type) {
      case 'browser-not-ready':
        log.error(
          'Browser %s is not ready in the Saucelabs background service.',
          browserDisplayName,
        );
        this._done('failure');
    }
  };

  const _startBrowserTest = (pageUrl: string, browser: Browser) => {
    log.info('Starting browser %s test in daemon with URL: %s', browserDisplayName, pageUrl);
    daemonConnection!.write(
      JSON.stringify(new StartTestMessage(pageUrl, getUniqueId(browser), testSuiteDescription)),
    );
  };

  const _endBrowserTest = () => {
    log.info('Test for browser %s completed', browserDisplayName);
    daemonConnection!.write(JSON.stringify(new EndTestMessage()));
  };
}
