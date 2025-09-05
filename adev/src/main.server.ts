/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {bootstrapServerApplication} from '@angular/platform-server';
import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

export default bootstrap;
