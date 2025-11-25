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
  afterNextRender,
  model,
  viewChild,
} from '@angular/core';
import {IconComponent} from '../icon/icon.component';
import {FormValueControl} from '@angular/forms/signals';

@Component({
  selector: 'docs-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  host: {
    class: 'docs-form-element',
  },
})
export class TextField implements FormValueControl<string> {
  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

  readonly placeholder = input<string | null>(null);
  readonly disabled = model<boolean>(false);
  readonly hideIcon = input<boolean>(false);
  readonly autofocus = input<boolean>(false);
  readonly resetLabel = input<string | null>(null);

  readonly value = model('');

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) {
        this.input().nativeElement.focus();
      }
    });
  }

  clearTextField() {
    this.value.set('');
  }
}
