/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
  afterNextRender,
  inject,
  viewChild,
  DestroyRef,
} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime} from 'rxjs/operators';
import {TerminalHandler} from './terminal-handler.service';
let Terminal = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-tutorial-terminal',
      template: '<div #terminalOutput class="adev-terminal-output"></div>',
      styleUrls: ['./terminal.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      // ViewEncapsulation is disabled to allow Xterm.js's styles to be applied
      // to the terminal element.
      encapsulation: ViewEncapsulation.None,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Terminal = class {
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
      Terminal = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    type = input.required();
    terminalElementRef = viewChild.required('terminalOutput');
    destroyRef = inject(DestroyRef);
    terminalHandler = inject(TerminalHandler);
    constructor() {
      afterNextRender({
        read: () => {
          this.terminalHandler.registerTerminal(
            this.type(),
            this.terminalElementRef().nativeElement,
          );
          this.setResizeObserver();
        },
      });
    }
    setResizeObserver() {
      const resize = new Subject();
      resize
        .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => void this.terminalHandler.resizeToFitParent(this.type()));
      const resizeObserver = new ResizeObserver(() => void resize.next());
      resizeObserver.observe(this.terminalElementRef().nativeElement);
      this.destroyRef.onDestroy(() => void resizeObserver.disconnect());
    }
  };
  return (Terminal = _classThis);
})();
export {Terminal};
//# sourceMappingURL=terminal.component.js.map
