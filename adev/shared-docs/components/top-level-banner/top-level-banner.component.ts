/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, input, linkedSignal} from '@angular/core';
import {ExternalLink} from '../../directives';
import {LOCAL_STORAGE} from '../../providers';
import {IconComponent} from '../icon/icon.component';

export const STORAGE_KEY_PREFIX = 'docs-was-closed-top-banner-';

@Component({
  selector: 'docs-top-level-banner',
  imports: [ExternalLink, IconComponent],
  templateUrl: './top-level-banner.component.html',
  styleUrl: './top-level-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopLevelBannerComponent {
  private readonly localStorage = inject(LOCAL_STORAGE);

  /**
   * Unique identifier for the banner. This ID is required to ensure that
   * the state of the banner (e.g., whether it has been closed) is tracked
   * separately for different events or instances. Without a unique ID,
   * closing one banner could inadvertently hide other banners for different events.
   */
  readonly id = input.required<string>();
  // Optional URL link that the banner should navigate to when clicked.
  readonly link = input<string>();
  // Text content to be displayed in the banner.
  readonly text = input.required<string>();
  // Optional expiry date. Setting the default expiry as a future date so we
  // don't have to deal with undefined signal values.
  readonly expiry = input(new Date('3000-01-01'), {transform: parseDate});
  // Whether the user has closed the banner or the survey has expired.
  readonly hasClosed = linkedSignal(() => {
    const expired = Date.now() > this.expiry().getTime();

    // Needs to be in a try/catch, because some browsers will
    // throw when using `localStorage` in private mode.
    try {
      return this.localStorage?.getItem(this.getBannerStorageKey()) === 'true' || expired;
    } catch {
      return false;
    }
  });

  close(): void {
    this.localStorage?.setItem(this.getBannerStorageKey(), 'true');
    this.hasClosed.set(true);
  }

  private getBannerStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.id()}`;
  }
}

const parseDate = (inputDate: string | Date): Date => {
  if (inputDate instanceof Date) {
    return inputDate;
  }
  const outputDate = new Date(inputDate);
  if (isNaN(outputDate.getTime())) {
    throw new Error(`Invalid date string: ${inputDate}`);
  }
  return outputDate;
};
