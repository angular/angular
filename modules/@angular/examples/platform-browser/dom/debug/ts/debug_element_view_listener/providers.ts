/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';

@Component({selector: 'my-component'})
class MyAppComponent {
}

// #docregion providers
bootstrap(MyAppComponent);
// #enddocregion
