/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * How to handle potential diagnostics.
 */
export type DiagnosticHandlingStrategy = 'error'|'warning'|'ignore';

/**
 * This class is used to collect and then report warnings and errors that occur during the execution
 * of the tools.
 *
 * @publicApi used by CLI
 */
export class Diagnostics {
  readonly messages: {type: 'warning'|'error', message: string}[] = [];
  get hasErrors() {
    return this.messages.some(m => m.type === 'error');
  }
  add(type: DiagnosticHandlingStrategy, message: string) {
    if (type !== 'ignore') {
      this.messages.push({type, message});
    }
  }
  warn(message: string) {
    this.messages.push({type: 'warning', message});
  }
  error(message: string) {
    this.messages.push({type: 'error', message});
  }
  merge(other: Diagnostics) {
    this.messages.push(...other.messages);
  }
  formatDiagnostics(message: string): string {
    const errors = this.messages.filter(d => d.type === 'error').map(d => ' - ' + d.message);
    const warnings = this.messages.filter(d => d.type === 'warning').map(d => ' - ' + d.message);
    if (errors.length) {
      message += '\nERRORS:\n' + errors.join('\n');
    }
    if (warnings.length) {
      message += '\nWARNINGS:\n' + warnings.join('\n');
    }
    return message;
  }
}
