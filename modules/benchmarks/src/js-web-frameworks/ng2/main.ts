/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode, NgZone, ɵNoopNgZone} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {init} from './init';
import {JsWebFrameworksComponent} from './rows';

enableProdMode();
bootstrapApplication(JsWebFrameworksComponent, {
  providers: [{provide: NgZone, useClass: ɵNoopNgZone}],
}).then(init, (e) => console.error(e));
