/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, NgModuleRef} from '@angular/core';

import {bindAction, profile} from '../../util';
import {numViews} from '../util';

import {DeclarationComponent, TransplantedViewsModule} from './transplanted_views';

export function init(moduleRef: NgModuleRef<TransplantedViewsModule>) {
  const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
  const declaration: DeclarationComponent = appRef.components[0].instance;

  bindAction('#destroyDom', destroyDom);
  bindAction('#createDom', createDom);
  bindAction('#markInsertionComponentForCheck', markInsertionComponentForCheck);
  bindAction('#detectChanges', detectChanges);
  bindAction('#detectChangesProfile', profile(detectChanges, noop, 'detectChanges'));

  // helpers
  function destroyDom() {
    declaration.viewCount = 0;
    appRef.tick();
    declaration.templateRefreshCount = 0;
    appRef.tick();
  }

  function createDom() {
    declaration.viewCount = numViews;
    appRef.tick();
  }

  function markInsertionComponentForCheck() {
    declaration.insertionComponent.changeDetector.markForCheck();
  }

  function detectChanges() {
    appRef.tick();
  }

  function noop() {}
}
