/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {HelloWorldComponent} from './app/app.component';

bootstrapApplication(HelloWorldComponent, {
  providers: [provideProtractorTestingSupport()],
}).catch((err) => console.error(err));
