/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {computed, inject, Injectable, signal, untracked} from '@angular/core';
import {Terminal} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {InteractiveTerminal} from './interactive-terminal';
import {WINDOW} from '@angular/docs';
import {CommandValidator} from './command-validator.service';
export var TerminalType;
(function (TerminalType) {
  TerminalType[(TerminalType['READONLY'] = 0)] = 'READONLY';
  TerminalType[(TerminalType['INTERACTIVE'] = 1)] = 'INTERACTIVE';
})(TerminalType || (TerminalType = {}));
let TerminalHandler = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TerminalHandler = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TerminalHandler = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    window = inject(WINDOW);
    commandValidator = inject(CommandValidator);
    terminals = {
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
    get readonlyTerminalInstance() {
      return computed(() => this.terminals[TerminalType.READONLY]().instance);
    }
    get interactiveTerminalInstance() {
      return computed(() => this.terminals[TerminalType.INTERACTIVE]().instance);
    }
    registerTerminal(type, element) {
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
    resizeToFitParent(type) {
      untracked(this.terminals[type])?.fitAddon.fit();
    }
    clearTerminals() {
      untracked(() => {
        this.terminals[TerminalType.READONLY]().instance.clear();
        this.terminals[TerminalType.INTERACTIVE]().instance.clear();
      });
    }
    mapTerminalToElement(terminal, fitAddon, element) {
      terminal.open(element);
      fitAddon.fit();
    }
  };
  return (TerminalHandler = _classThis);
})();
export {TerminalHandler};
//# sourceMappingURL=terminal-handler.service.js.map
