/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

// The token for the live announcer element is defined in a separate file from LiveAnnouncer
// as a workaround for https://github.com/angular/angular/issues/22559

export const LIVE_ANNOUNCER_ELEMENT_TOKEN =
    new InjectionToken<HTMLElement | null>('liveAnnouncerElement', {
      providedIn: 'root',
      factory: LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY,
    });

/** @docs-private */
export function LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY(): null {
  return null;
}
