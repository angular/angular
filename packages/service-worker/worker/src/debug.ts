/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {Debuggable} from './api';

export class DebugHandler {
  constructor(readonly driver: Debuggable, readonly adapter: Adapter) {}

  async handleFetch(req: Request): Promise<Response> {
    const [state, versions, idle] = await Promise.all([
      this.driver.debugState(),
      this.driver.debugVersions(),
      this.driver.debugIdleState(),
    ]);

    const msgState = `NGSW Debug Info:

Driver state: ${state.state} (${state.why})
Latest manifest hash: ${state.latestHash || 'none'}
Last update check: ${this.since(state.lastUpdateCheck)}`;

    const msgVersions = versions
                            .map(version => `=== Version ${version.hash} ===

Clients: ${version.clients.join(', ')}`)
                            .join('\n\n');

    const msgIdle = `=== Idle Task Queue ===
Last update tick: ${this.since(idle.lastTrigger)}
Last update run: ${this.since(idle.lastRun)}
Task queue:
${idle.queue.map(v => ' * ' + v).join('\n')}
`;

    return this.adapter.newResponse(
        `${msgState}

${msgVersions}

${msgIdle}`,
        {headers: this.adapter.newHeaders({'Content-Type': 'text/plain'})});
  }

  since(time: number|null): string {
    if (time === null) {
      return 'never';
    }
    let age = this.adapter.time - time;
    const days = Math.floor(age / 86400000);
    age = age % 86400000;
    const hours = Math.floor(age / 3600000);
    age = age % 3600000;
    const minutes = Math.floor(age / 60000);
    age = age % 60000;
    const seconds = Math.floor(age / 1000);
    const millis = age % 1000;

    return '' + (days > 0 ? `${days}d` : '') + (hours > 0 ? `${hours}h` : '') +
        (minutes > 0 ? `${minutes}m` : '') + (seconds > 0 ? `${seconds}s` : '') +
        (millis > 0 ? `${millis}u` : '');
  }
}