/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, ApplicationRef} from '@angular/core';
import {Start} from './components/start';
import {About} from './components/about';
import {Contact} from './components/contact';
import {Router, RouterModule, provideRoutes} from '@angular/router';
import {WorkerAppModule, WORKER_APP_LOCATION_PROVIDERS} from '@angular/platform-browser';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';

@Component({selector: 'app', templateUrl: 'app.html'})
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

@NgModule({
  imports: [WorkerAppModule, RouterModule.forRoot(ROUTES, {useHash: true})],
  providers: [WORKER_APP_LOCATION_PROVIDERS],
  entryComponents: [App],
  declarations: [App, Start, Contact, About]
})
export class AppModule {
  constructor(appRef: ApplicationRef) {
    appRef.waitForAsyncInitializers().then( () => {
      appRef.bootstrap(App);
    });
  }
}
