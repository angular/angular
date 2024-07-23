/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, signal} from '@angular/core';

export const IS_SEARCH_DIALOG_OPEN = new InjectionToken('', {
  providedIn: 'root',
  factory: () => signal(false),
});
