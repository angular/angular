/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, inject, Injectable, signal, Signal, untracked} from '@angular/core';
import {Terminal} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {InteractiveTerminal} from './interactive-terminal';
import {WINDOW} from '@angular/docs';
import {CommandValidator} from './command-validator.service';

export enum TerminalType {
  READONLY,
  INTERACTIVE,
}

@Injectable({providedIn: 'root'})
export class TerminalHandler {
  private readonly window = inject(WINDOW);
  private readonly commandValidator = inject(CommandValidator);

  private terminals = {
    // Passing a theme with CSS custom properties colors does not work
    // Because colors are parsed
    // See https://github.com/xtermjs/xterm.js/blob/854e2736f66ca3e5d3ab5a7b65bf3fd6fba8b707/src/browser/services/ThemeService.ts#L125
    [TerminalType.READONLY]: signal({
      instance: new Terminal({convertEol: true, disableStdin: true}),
      fitAddon: new FitAddon(),
    }),
    [TerminalType.INTERACTIVE]: signal({
      instance: new InteractiveTerminal(this.window, this.commandValidator),
      fitAddon: new FitAddon(),
    }),
  };

  constructor() {
    // Load fitAddon for each terminal instance
    for (const val of Object.values(this.terminals)) {
      const {instance, fitAddon} = untracked(val);
      instance.loadAddon(fitAddon);
    }
  }

  get readonlyTerminalInstance(): Signal<Terminal> {
    return computed(() => this.terminals[TerminalType.READONLY]().instance);
  }

  get interactiveTerminalInstance(): Signal<InteractiveTerminal> {
    return computed(() => this.terminals[TerminalType.INTERACTIVE]().instance);
  }

  registerTerminal(type: TerminalType, element: HTMLElement): void {
    let {instance, fitAddon} = untracked(this.terminals[type]);
    if (instance.element && element !== instance.element) {
      instance.dispose();
      fitAddon = new FitAddon();
      if (type === TerminalType.READONLY) {
        instance = new Terminal({convertEol: true, disableStdin: true});
        this.terminals[type].set({instance, fitAddon});
      } else {
        const newInstance = new InteractiveTerminal(this.window, this.commandValidator);
        instance = newInstance;
        this.terminals[type].set({instance: newInstance, fitAddon});
      }
      instance.loadAddon(fitAddon);
    }
    this.mapTerminalToElement(instance, fitAddon, element);
  }

  resizeToFitParent(type: TerminalType): void {
    untracked(this.terminals[type])?.fitAddon.fit();
  }

  clearTerminals() {
    untracked(() => {
      this.terminals[TerminalType.READONLY]().instance.clear();
      this.terminals[TerminalType.INTERACTIVE]().instance.clear();
    });
  }

  private mapTerminalToElement(terminal: Terminal, fitAddon: FitAddon, element: HTMLElement): void {
    terminal.open(element);
    fitAddon.fit();
  }
}
