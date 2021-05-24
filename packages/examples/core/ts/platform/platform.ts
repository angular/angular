/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Component, DoBootstrap, NgModule, Type} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: ` <h1>Component One</h1> `,
})
export class ComponentOne {}

@Component({
  selector: 'app-root',
  template: ` <h1>Component Two</h1> `,
})
export class ComponentTwo {}

// #docregion componentSelector
@NgModule({imports: [BrowserModule], declarations: [ComponentOne, ComponentTwo]})
export class AppModule implements DoBootstrap {
  readonly componentMap: {[key: string]: Type<unknown>} = {
    'ComponentOne': ComponentOne,
    'ComponentTwo': ComponentTwo,
  };

  ngDoBootstrap(app: ApplicationRef) {
    this.fetchDataFromApi().then((componentName: string) => {
      app.bootstrap(this.componentMap[componentName]);
    });
  }

  fetchDataFromApi(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('ComponentTwo');
      }, 2000);
    });
  }
}
// #enddocregion
