/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

let debugElement: DebugElement = undefined!;
class MyDirective {}

// #docregion by_all
debugElement.query(By.all());
// #enddocregion

// #docregion by_css
debugElement.query(By.css('[attribute]'));
// #enddocregion

// #docregion by_directive
debugElement.query(By.directive(MyDirective));
// #enddocregion
