/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {NgIf} from '@angular/common';
import {LOCAL_STORAGE} from '../../providers';

export const STORAGE_KEY = 'docs-accepts-cookies';

@Component({
  selector: 'docs-cookie-popup',
  standalone: true,
  imports: [NgIf],
  templateUrl: './cookie-popup.component.html',
  styleUrls: ['./cookie-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiePopup {
  private readonly localStorage = inject(LOCAL_STORAGE);

  /** Whether the user has accepted the cookie disclaimer. */
  hasAccepted = signal<boolean>(false);

  constructor() {
    // Needs to be in a try/catch, because some browsers will
    // throw when using `localStorage` in private mode.
    try {
      this.hasAccepted.set(this.localStorage?.getItem(STORAGE_KEY) === 'true');
    } catch {
      this.hasAccepted.set(false);
    }
  }

  /** Accepts the cookie disclaimer. */
  protected accept(): void {
    try {
      this.localStorage?.setItem(STORAGE_KEY, 'true');
    } catch {}

    this.hasAccepted.set(true);
  }
}
