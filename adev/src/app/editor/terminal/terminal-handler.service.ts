/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {Terminal} from '@xterm/xterm';
import {FitAddon} from 'xterm-addon-fit';
import {InteractiveTerminal} from './interactive-terminal';

export enum TerminalType {
  READONLY,
  INTERACTIVE,
}

@Injectable({providedIn: 'root'})
export class TerminalHandler {
  private terminals = {
    // Passing a theme with CSS custom properties colors does not work
    // Because colors are parsed
    // See https://github.com/xtermjs/xterm.js/blob/854e2736f66ca3e5d3ab5a7b65bf3fd6fba8b707/src/browser/services/ThemeService.ts#L125
    [TerminalType.READONLY]: {
      instance: new Terminal({convertEol: true, disableStdin: true}),
      fitAddon: new FitAddon(),
    },
    [TerminalType.INTERACTIVE]: {
      instance: new InteractiveTerminal(),
      fitAddon: new FitAddon(),
    },
  } as const;

  get readonlyTerminalInstance(): Terminal {
    return this.terminals[TerminalType.READONLY].instance;
  }

  get interactiveTerminalInstance(): InteractiveTerminal {
    return this.terminals[TerminalType.INTERACTIVE].instance;
  }

  registerTerminal(type: TerminalType, element: HTMLElement): void {
    const terminal = this.terminals[type];
    this.mapTerminalToElement(terminal.instance, terminal.fitAddon, element);
  }

  resizeToFitParent(type: TerminalType): void {
    this.terminals[type]?.fitAddon.fit();
  }

  clearTerminals() {
    this.terminals[TerminalType.READONLY].instance.clear();
    this.terminals[TerminalType.INTERACTIVE].instance.clear();
  }

  private mapTerminalToElement(terminal: Terminal, fitAddon: FitAddon, element: HTMLElement): void {
    terminal.open(element);
    fitAddon.fit();
  }
}
