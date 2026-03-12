/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, input, signal} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatTooltip} from '@angular/material/tooltip';
import {IconComponent} from '../icon/icon.component';

export const CONFIRMATION_DISPLAY_TIME_MS = 1000;

@Component({
  selector: 'docs-copy-link-button',
  template: `<docs-icon>{{ showCopySuccess() ? 'check' : 'link' }}</docs-icon>`,
  styles: `
    :host {
      cursor: pointer;
      padding: 0;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      color: var(--quaternary-contrast);
      vertical-align: middle;
    }
    :host(.docs-copy-link-success) {
      color: var(--bright-blue);
    }
  `,
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: ['matTooltip'],
    },
  ],
  host: {
    '[ariaLabel]': '"Copy link to " + label()',
    '(click)': 'copyLink()',
    'matTooltipPosition': 'above',
    '[class.docs-copy-link-success]': 'showCopySuccess()',
  },
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyLinkButton {
  readonly href = input.required<string>();
  readonly label = input.required<string>();

  protected readonly showCopySuccess = signal(false);

  private readonly clipboard = inject(Clipboard);

  copyLink(): void {
    const link = `${window.location.origin}${this.href()}`;
    this.clipboard.copy(link);
    this.showCopySuccess.set(true);
    setTimeout(() => {
      this.showCopySuccess.set(false);
    }, CONFIRMATION_DISPLAY_TIME_MS);
  }
}
