/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {platformServer} from '@angular/platform-server';
import {bootstrapApplication, BootstrapContext} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';

const bootstrap = (context: BootstrapContext|undefined) => {
  const platformRef = context?.platformRef ?? platformServer();

  return bootstrapApplication(AppComponent, config, { platformRef });
}

export default bootstrap;
