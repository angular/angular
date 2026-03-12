/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {FormCheckboxControl} from '@angular/forms/signals';

@Component({
  selector: 'docs-slide-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
})
export class SlideToggle implements FormCheckboxControl {
  readonly buttonId = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = model(false);

  readonly checked = model(false);

  // Toggles the checked state of the slide-toggle.
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.checked.update((checked) => !checked);
  }
}
