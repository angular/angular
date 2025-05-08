/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Subject} from 'rxjs';
import {Terminal} from '@xterm/xterm';

import {CommandValidator} from './command-validator.service';

export const NOT_VALID_COMMAND_MSG = 'Angular Documentation - Not allowed command!';
export const ALLOWED_KEYS: Array<KeyboardEvent['key']> = [
  // Allow Backspace to delete what was typed
  'Backspace',
  // Allow ArrowUp to interact with CLI
  'ArrowUp',
  // Allow ArrowDown to interact with CLI
  'ArrowDown',
];

export class InteractiveTerminal extends Terminal {
  private readonly breakProcess = new Subject<void>();

  // Using this stream, the webcontainer shell can break current process.
  breakProcess$ = this.breakProcess.asObservable();

  constructor(
    readonly window: Window,
    readonly commandValidator: CommandValidator,
  ) {
    super({convertEol: true, disableStdin: false});

    // bypass command validation if sudo=true is present in the query string
    if (!this.window.location.search.includes('sudo=true')) {
      this.handleCommandExecution();
    }
  }

  breakCurrentProcess(): void {
    this.breakProcess.next();
  }

  override dispose(): void {
    super.dispose();
    this.breakProcess.complete();
  }

  // Method validate if provided command by user is on the list of the allowed commands.
  // If so, then command is executed, otherwise error message is displayed in the terminal.
  private handleCommandExecution(): void {
    const commandLinePrefix = '❯';
    const xtermRed = '\x1b[1;31m';

    this.attachCustomKeyEventHandler((event) => {
      if (ALLOWED_KEYS.includes(event.key)) {
        return true;
      }

      // While user is typing, then do not validate command.
      if (['keydown', 'keyup'].includes(event.type)) {
        return false;
      }

      // When user pressed enter, then verify if command is on the list of the allowed ones.
      if (event.key === 'Enter') {
        // Xterm does not have API to receive current text/command.
        // In that case we can read it using DOM methods.
        // As command to execute we can treat the last line in terminal which starts with '❯'.
        // Hack: excluding `.xterm-fg-6` is required to run i.e `ng e2e`, `ng add @angular/material`.
        // Some steps with selecting options also starts with '❯'.
        let terminalContent = Array.from(this.element!.querySelectorAll('.xterm-rows>div'))
          .map((lines) =>
            Array.from(lines.querySelectorAll('span:not(.xterm-fg-6)'))
              .map((part) => part.textContent)
              .join('')
              .trim(),
          )
          .filter((line) => !!line && line.startsWith(commandLinePrefix));

        let command =
          terminalContent.length > 0
            ? terminalContent[terminalContent.length - 1].replace(commandLinePrefix, '').trim()
            : '';

        // If command exist and is invalid, then write line with error message and block execution.
        if (command && !this.commandValidator.validate(command)) {
          this.writeln(`\n${xtermRed}${NOT_VALID_COMMAND_MSG}`);
          this.breakCurrentProcess();
          return false;
        }
      }

      return true;
    });
  }
}
