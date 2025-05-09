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
} from '@angular/core';

import {TerminalHandler, TerminalType} from './terminal-handler.service';

@Component({
  selector: 'docs-tutorial-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ViewEncapsulation is disabled to allow Xterm.js's styles to be applied
  // to the terminal element.
  encapsulation: ViewEncapsulation.None,
})
export class Terminal {
  readonly type = input.required<TerminalType>();
  readonly terminalElementRef = viewChild.required<ElementRef<HTMLElement>>('terminalOutput');

  private readonly terminalHandler = inject(TerminalHandler);

  constructor() {
    afterNextRender({
      read: () => {
        this.terminalHandler.registerTerminal(this.type(), this.terminalElementRef().nativeElement);
      },
    });
  }
}
