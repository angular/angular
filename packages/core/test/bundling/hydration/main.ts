/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {bootstrapApplication, provideClientHydration} from '@angular/platform-browser';

import {DeferComponent} from './defer.component';

@Component({
  selector: 'hello-world',
  imports: [DeferComponent],
  template: `
    <h1>Hello World!</h1>

    @defer (hydrate on interaction) {
      <defer-cmp />
    } @placeholder {
      <p>Placeholder</p>
    }
  `,
})
class HelloWorld {}

bootstrapApplication(HelloWorld, {providers: [provideClientHydration()]});
