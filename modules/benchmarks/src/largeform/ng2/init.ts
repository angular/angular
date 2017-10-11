/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction, getIntParameter, profile} from '../../util';

import {AppComponent, AppModule} from './app';

const copies = getIntParameter('copies');

export function init(moduleRef: NgModuleRef<AppModule>) {
  let app: AppComponent;
  let appRef: ApplicationRef;

  function destroyDom() {
    app.setCopies(0);
    appRef.tick();
  }

  function createDom() {
    app.setCopies(copies);
    appRef.tick();
  }

  function noop() {}

  const injector = moduleRef.injector;
  appRef = injector.get(ApplicationRef);

  app = appRef.components[0].instance;
  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
}
