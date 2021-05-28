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
  template: ` <h1>App Component</h1> `,
})
export class AppComponent {
}

@Component({
  selector: 'app-root',
  template: ` <h1>Component One</h1> `,
})
export class ComponentOne {
}

@Component({
  selector: 'app-root',
  template: ` <h1>Component Two</h1> `,
})
export class ComponentTwo {
}

@NgModule({imports: [BrowserModule], declarations: [ComponentOne, ComponentTwo]})
// #docregion componentSelector
export class AppModule implements DoBootstrap {
  readonly componentMap: {[key: string]: Type<unknown>} = {
    'ComponentOne': ComponentOne,
    'ComponentTwo': ComponentTwo,
  };

  ngDoBootstrap(appRef: ApplicationRef) {
    this.fetchDataFromApi().then((componentName: string) => {
      appRef.bootstrap(this.componentMap[componentName]);
    });
  }
  // #enddocregion

  fetchDataFromApi(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('ComponentTwo');
      }, 2000);
    });
  }
  // #docregion componentSelector
}
// #enddocregion

export class AppModule2 extends AppModule {
  // #docregion cssSelector
  ngDoBootstrap(appRef: ApplicationRef) {
    appRef.bootstrap(AppComponent, '#root-element');
  }
  // #enddocregion cssSelector
}

export class AppModule3 extends AppModule {
  // #docregion domNode
  ngDoBootstrap(appRef: ApplicationRef) {
    const element = document.querySelector('#root-element');
    appRef.bootstrap(AppComponent, element);
  }
  // #enddocregion domNode
}
