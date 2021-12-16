/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformBrowser} from '@angular/platform-browser';

import {AppModule} from './app/app.module';

platformBrowser().bootstrapModule(AppModule).catch((err) => console.error(err));
