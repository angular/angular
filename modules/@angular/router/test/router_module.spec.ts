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

      const elRootApp = doc.createElement('app-root');
      doc.body.appendChild(elRootApp);

      const elBootComp = doc.createElement('bootstrappable-component');
      doc.body.appendChild(elBootComp);

    }));
    it('should not init router navigation listeners if a non root component is bootstrapped',
       () => {

         const appRef: ApplicationRef = TestBed.get(ApplicationRef);
         const r: Router = TestBed.get(Router);

         const spy = spyOn(r, 'resetRootComponentType').and.callThrough();

         appRef.bootstrap(AppRootComponent);
         expect(r.resetRootComponentType).toHaveBeenCalled();

         spy.calls.reset();

         appRef.bootstrap(BootstrappableComponent);
         expect(r.resetRootComponentType).not.toHaveBeenCalled();
       });
    it('should reinit router navigation listeners if a previously bootstrapped root component is destroyed',
       (done) => {

         const appRef: ApplicationRef = TestBed.get(ApplicationRef);
         const r: Router = TestBed.get(Router);

         const spy = spyOn(r, 'resetRootComponentType').and.callThrough();

         const compRef = appRef.bootstrap(AppRootComponent);
         expect(r.resetRootComponentType).toHaveBeenCalled();

         spy.calls.reset();

         compRef.onDestroy(() => {

           appRef.bootstrap(BootstrappableComponent);
           expect(r.resetRootComponentType).toHaveBeenCalled();

           done();
         });

         compRef.destroy();
       });
  });

});
