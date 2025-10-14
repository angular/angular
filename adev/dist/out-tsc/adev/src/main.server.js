/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';
const bootstrap = (context) => bootstrapApplication(AppComponent, config, context);
export default bootstrap;
//# sourceMappingURL=main.server.js.map
