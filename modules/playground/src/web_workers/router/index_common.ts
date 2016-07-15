/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {Start} from './components/start';
import {About} from './components/about';
import {Contact} from './components/contact';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';

@Component({selector: 'app', directives: [ROUTER_DIRECTIVES], templateUrl: 'app.html'})
export class App {
  constructor(router: Router) {
    // this should not be required once web worker bootstrap method can use modules
    router.initialNavigation();
  }
}

export const ROUTES = [
  {path: '', component: Start},
  {path: 'contact', component: Contact},
  {path: 'about', component: About}
];