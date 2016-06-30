/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NG_VALIDATORS} from '@angular/common';
import {bootstrap} from '@angular/platform-browser-dynamic';

class MyApp {}
let myValidator: any = null;

// #docregion ng_validators
bootstrap(MyApp, [{provide: NG_VALIDATORS, useValue: myValidator, multi: true}]);
// #enddocregion
