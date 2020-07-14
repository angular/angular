/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Adapter} from './adapter';
import {Debuggable, DebugLogger} from './api';

const DEBUG_LOG_BUFFER_SIZE = 100;

interface DebugMessage {
  time: number;
  value: string;
  context: string;
}

export class DebugHandler implements DebugLogger {
  // There are two debug log message arrays. debugLogA records new debugging messages.
  // Once it reaches DEBUG_LOG_BUFFER_SIZE, the array is moved to debugLogB and a new
  // array is assigned to debugLogA. This ensures that insertion to the debug log is
  // always O(1) no matter the number of logged messages, and that the total number
  // of messages in the log never exceeds 2 * DEBUG_LOG_BUFFER_SIZE.
  private debugLogA: DebugMessage[] = [];
  private debugLogB: DebugMessage[] = [];

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

Debug log:
${this.formatDebugLog(this.debugLogB)}
${this.formatDebugLog(this.debugLogA)}
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

  log(value: string|Error, context: string = ''): void {
    // Rotate the buffers if debugLogA has grown too large.
    if (this.debugLogA.length === DEBUG_LOG_BUFFER_SIZE) {
      this.debugLogB = this.debugLogA;
      this.debugLogA = [];
    }

    // Convert errors to string for logging.
    if (typeof value !== 'string') {
      value = this.errorToString(value);
    }

    // Log the message.
    this.debugLogA.push({value, time: this.adapter.time, context});
  }

  private errorToString(err: Error): string {
    return `${err.name}(${err.message}, ${err.stack})`;
  }

  private formatDebugLog(log: DebugMessage[]): string {
    return log.map(entry => `[${this.since(entry.time)}] ${entry.value} ${entry.context}`)
        .join('\n');
  }
}
