/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {MyComponent} from './my_component';

enableProdMode();

bootstrapApplication(MyComponent, {
  providers: [
    // Add your global providers here
    // provideRouter(routes),
    // provideHttpClient(),
    // etc.
  ],
});
