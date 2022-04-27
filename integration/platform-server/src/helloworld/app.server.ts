/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';

import {HelloWorldModule} from './app.js';
import {HelloWorldComponent} from './hello-world.component.js';

@NgModule({
  bootstrap: [HelloWorldComponent],
  imports: [HelloWorldModule, ServerModule],
})
export class HelloWorldServerModule {
}
