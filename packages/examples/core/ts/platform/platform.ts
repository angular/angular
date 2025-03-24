/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Component, DoBootstrap, NgModule, Type} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: ` <h1>Component One</h1> `,
  standalone: false,
})
export class ComponentOne {}

@Component({
  selector: 'app-root',
  template: ` <h1>Component Two</h1> `,
  standalone: false,
})
export class ComponentTwo {}

@Component({
  selector: 'app-root',
  template: ` <h1>Component Three</h1> `,
  standalone: false,
})
export class ComponentThree {}

@Component({
  selector: 'app-root',
  template: ` <h1>Component Four</h1> `,
  standalone: false,
})
export class ComponentFour {}

@NgModule({imports: [BrowserModule], declarations: [ComponentOne, ComponentTwo]})
export class AppModule implements DoBootstrap {
  // #docregion componentSelector
  ngDoBootstrap(appRef: ApplicationRef) {
    this.fetchDataFromApi().then((componentName: string) => {
      if (componentName === 'ComponentOne') {
        appRef.bootstrap(ComponentOne);
      } else {
        appRef.bootstrap(ComponentTwo);
      }
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
}

@NgModule({imports: [BrowserModule], declarations: [ComponentThree]})
export class AppModuleTwo implements DoBootstrap {
  // #docregion cssSelector
  ngDoBootstrap(appRef: ApplicationRef) {
    appRef.bootstrap(ComponentThree, '#root-element');
  }
  // #enddocregion cssSelector
}

@NgModule({imports: [BrowserModule], declarations: [ComponentFour]})
export class AppModuleThree implements DoBootstrap {
  // #docregion domNode
  ngDoBootstrap(appRef: ApplicationRef) {
    const element = document.querySelector('#root-element');
    appRef.bootstrap(ComponentFour, element);
  }
  // #enddocregion domNode
}
