/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';
import {bindAction} from '../../util';
import {StaticLiteralsModule} from './app.module';

export function init(moduleRef: NgModuleRef<StaticLiteralsModule>) {
  const injector = moduleRef.injector;
  const appRef = injector.get(ApplicationRef);
  const componentRef = appRef.components[0];
  const component = componentRef.instance;
  const select = document.querySelector('#scenario-select')! as HTMLSelectElement;

  const empty: number[] = [];
  const items: number[] = [];
  for (let i = 0; i < 1000; i++) {
    items.push(i);
  }

  bindAction('#create', () => {
    component.scenarioIdx = select.selectedIndex;
    component.data = items;
    appRef.tick();
  });
  bindAction('#update', () => {
    component.val = component.val === 1 ? 2 : 1;
    appRef.tick();
  });
  bindAction('#destroy', () => {
    component.data = empty;
    appRef.tick();
  });
}
