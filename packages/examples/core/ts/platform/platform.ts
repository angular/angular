/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// #docregion componentSelector
@NgModule({imports: [BrowserModule], declarations: [ComponentOne, ComponentTwo]})
export class AppModule implements DoBootstrap {
  readonly componentMap = {'ComponentOne': ComponentOne, 'ComponentTwo': ComponentTwo};

  ngDoBootstrap(app: ApplicationRef) {
    this.fetchDataFromApi().then((componentName) => {
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

// #docregion domElement
ngDoBootstrap(app: ApplicationRef) {
  // it can be a CSS selector
  ...app.bootstrap(this.componentMap[componentName], '#root-element');
  ...

      // or it can be a reference to a DOM node
      ...const element = document.querySelector('#root-element');
  app.bootstrap(this.componentMap[componentName], element);
  ...
}
// #enddocregion
