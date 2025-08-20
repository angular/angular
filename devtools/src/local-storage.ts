/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<typeof localStorage>('LOCAL_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});
