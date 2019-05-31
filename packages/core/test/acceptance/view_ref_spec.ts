/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, Injector, NgModule} from '@angular/core';
import {InternalViewRef} from '@angular/core/src/linker/view_ref';
import {TestBed} from '@angular/core/testing';


describe('ViewRef', () => {
  it('should remove nodes from DOM when the view is detached from app ref', () => {

    @Component({selector: 'dynamic-cpt', template: '<div></div>'})
    class DynamicComponent {
      constructor(public elRef: ElementRef) {}
    }

    @Component({template: `<span></span>`})
    class App {
      componentRef !: ComponentRef<DynamicComponent>;
      constructor(
          public appRef: ApplicationRef, private cfr: ComponentFactoryResolver,
          private injector: Injector) {}

      create() {
        const componentFactory = this.cfr.resolveComponentFactory(DynamicComponent);
        this.componentRef = componentFactory.create(this.injector);
        (this.componentRef.hostView as InternalViewRef).attachToAppRef(this.appRef);
        document.body.appendChild(this.componentRef.instance.elRef.nativeElement);
      }

      destroy() { (this.componentRef.hostView as InternalViewRef).detachFromAppRef(); }
    }

    @NgModule({declarations: [App, DynamicComponent], entryComponents: [DynamicComponent]})
    class MyTestModule {
    }

    TestBed.configureTestingModule({imports: [MyTestModule]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const appComponent = fixture.componentInstance;
    appComponent.create();
    fixture.detectChanges();
    expect(document.body.querySelector('dynamic-cpt')).not.toBeFalsy();

    appComponent.destroy();
    fixture.detectChanges();
    expect(document.body.querySelector('dynamic-cpt')).toBeFalsy();
  });
});
