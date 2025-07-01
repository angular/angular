/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, Provider} from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<typeof localStorage>('LOCAL_STORAGE');

export const provideLocalStorage = (): Provider => ({
  provide: LOCAL_STORAGE,
  useValue: localStorage,
});
