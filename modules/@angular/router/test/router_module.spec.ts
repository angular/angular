/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {APP_BASE_HREF} from '@angular/common';
import {ApplicationRef, Component, NgModule} from '@angular/core';
import {TestBed, inject} from '@angular/core/testing';
import {DOCUMENT} from '@angular/platform-browser';
import {Router, RouterModule, Routes} from '@angular/router';


@Component({selector: 'app-root', template: ''})
export class AppRootComponent {
}

@Component({selector: 'bootstrappable-component', template: ''})
export class BootstrappableComponent {
}

export const appRoutes: Routes = [{path: '**', redirectTo: ''}];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  declarations: [AppRootComponent, BootstrappableComponent],
  entryComponents: [AppRootComponent, BootstrappableComponent],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class RouterInitTestModule {
}


describe('RouterModule', () => {
  describe('RouterInitializer', () => {

    beforeEach(() => { TestBed.configureTestingModule({imports: [RouterInitTestModule]}); });

    beforeEach(inject([DOCUMENT], function(doc: HTMLDocument) {
      // create the dom elment for the root component
      const elRootApp = doc.createElement('app-root');
      doc.body.appendChild(elRootApp);
      // create the dom elment for the 2nd bootable component
      const elBootComp = doc.createElement('bootstrappable-component');
      doc.body.appendChild(elBootComp);
    }));

    it('should not init router navigation listeners if a non root component is bootstraped', () => {
      const appRef: ApplicationRef = TestBed.get(ApplicationRef);
      const r: Router = TestBed.get(Router);

      // register a spy on a function that is called on each init
      const spy = spyOn(r, 'resetRootComponentType').and.callThrough();

      // bootstrap the root app
      appRef.bootstrap(AppRootComponent);
      // router listener initialization should happen
      expect(r.resetRootComponentType).toHaveBeenCalled();

      // reset the calls to the spy
      spy.calls.reset();

      // bootstrap a component that is not the root compnent
      appRef.bootstrap(BootstrappableComponent);
      // router listener initialization should not happen
      expect(r.resetRootComponentType).not.toHaveBeenCalled();

    });
  });


});
