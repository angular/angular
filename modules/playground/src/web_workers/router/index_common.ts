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
import {ROUTER_DIRECTIVES, RouteConfig, Route} from '@angular/router-deprecated';

@Component({selector: 'app', directives: [ROUTER_DIRECTIVES], templateUrl: 'app.html'})
@RouteConfig([
  new Route({path: '/', component: Start, name: "Start"}),
  new Route({path: '/contact', component: Contact, name: "Contact"}),
  new Route({path: '/about', component: About, name: "About"})
])
export class App {
}
