/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';

// #docregion bootstrap
@Component({selector: 'my-app', template: 'Hello {{ name }}!'})
class MyApp {
  name: string = 'World';
}

function main() {
  return bootstrap(MyApp);
}
// #enddocregion
