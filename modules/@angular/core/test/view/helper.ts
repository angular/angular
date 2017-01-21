/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RootRenderer} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

export function isBrowser() {
  return getDOM().supportsDOMEvents();
}

export function setupAndCheckRenderer(config: {directDom: boolean}) {
  let rootRenderer: any;
  if (config.directDom) {
    beforeEach(() => {
      rootRenderer = <any>{
        renderComponent: jasmine.createSpy('renderComponent')
                             .and.throwError('Renderer should not have been called!')
      };
      TestBed.configureTestingModule(
          {providers: [{provide: RootRenderer, useValue: rootRenderer}]});
    });
    afterEach(() => { expect(rootRenderer.renderComponent).not.toHaveBeenCalled(); });
  } else {
    beforeEach(() => {
      rootRenderer = TestBed.get(RootRenderer);
      spyOn(rootRenderer, 'renderComponent').and.callThrough();
    });
    afterEach(() => { expect(rootRenderer.renderComponent).toHaveBeenCalled(); });
  }
}
