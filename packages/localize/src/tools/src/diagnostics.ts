/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This class is used to collect and then report warnings and errors that occur during the execution
 * of the tools.
 */
export class Diagnostics {
  readonly messages: {type: 'warning' | 'error', message: string}[] = [];
  get hasErrors() { return this.messages.some(m => m.type === 'error'); }
  warn(message: string) { this.messages.push({type: 'warning', message}); }
  error(message: string) { this.messages.push({type: 'error', message}); }
  formatDiagnostics(message: string): string {
    const errors = this.messages !.filter(d => d.type === 'error').map(d => ' - ' + d.message);
    const warnings = this.messages !.filter(d => d.type === 'warning').map(d => ' - ' + d.message);
    if (errors.length) {
      message += '\nERRORS:\n' + errors.join('\n');
    }
    if (warnings.length) {
      message += '\nWARNINGS:\n' + warnings.join('\n');
    }
    return message;
  }
}
