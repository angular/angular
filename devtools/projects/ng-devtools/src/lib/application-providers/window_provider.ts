/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Provider} from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WINDOW');

export const WINDOW_PROVIDER: Provider = {
  provide: WINDOW,
  useValue: window,
};
