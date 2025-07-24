/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-root',
  template: 'Hello World!',
})
class HelloWorld {}

bootstrapApplication(HelloWorld, {providers: [provideZonelessChangeDetection()]});
