/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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

import {TerminalHandler, TerminalType} from './terminal-handler.service';

@Component({
  selector: 'docs-tutorial-terminal',
  template: '<div #terminalOutput class="adev-terminal-output"></div>',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ViewEncapsulation is disabled to allow Xterm.js's styles to be applied
  // to the terminal element.
  encapsulation: ViewEncapsulation.None,
})
export class Terminal {
  readonly type = input.required<TerminalType>();
  private readonly terminalElementRef =
    viewChild.required<ElementRef<HTMLElement>>('terminalOutput');

  private readonly destroyRef = inject(DestroyRef);
  private readonly terminalHandler = inject(TerminalHandler);

  constructor() {
    afterNextRender({
      read: () => {
        this.terminalHandler.registerTerminal(this.type(), this.terminalElementRef().nativeElement);
        this.setResizeObserver();
      },
    });
  }

  private setResizeObserver(): void {
    const resize = new Subject<void>();
    resize
      .pipe(debounceTime(50), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.terminalHandler.resizeToFitParent(this.type()));

    const resizeObserver = new ResizeObserver(() => void resize.next());
    resizeObserver.observe(this.terminalElementRef().nativeElement);
    this.destroyRef.onDestroy(() => void resizeObserver.disconnect());
  }
}
