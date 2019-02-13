/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ApplicationRef, ChangeDetectionStrategy, Component, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, NgModule, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('change detection', () => {

  describe('embedded views', () => {

    @Directive({selector: '[viewManipulation]', exportAs: 'vm'})
    class ViewManipulation {
      constructor(
          private _tplRef: TemplateRef<{}>, private _vcRef: ViewContainerRef,
          private _appRef: ApplicationRef) {}

      insertIntoVcRef() { this._vcRef.createEmbeddedView(this._tplRef); }

      insertIntoAppRef(): EmbeddedViewRef<{}> {
        const viewRef = this._tplRef.createEmbeddedView({});
        this._appRef.attachView(viewRef);
        return viewRef;
      }
    }

    @Component({
      selector: 'test-cmp',
      template: `
        <ng-template #vm="vm" viewManipulation>{{'change-detected'}}</ng-template>
      `
    })
    class TestCmpt {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestCmpt, ViewManipulation]});
    });

    it('should detect changes for embedded views inserted through ViewContainerRef', () => {
      const fixture = TestBed.createComponent(TestCmpt);
      const vm = fixture.debugElement.childNodes[0].references['vm'] as ViewManipulation;

      vm.insertIntoVcRef();
      fixture.detectChanges();

      expect(fixture.nativeElement).toHaveText('change-detected');
    });

    it('should detect changes for embedded views attached to ApplicationRef', () => {
      const fixture = TestBed.createComponent(TestCmpt);
      const vm = fixture.debugElement.childNodes[0].references['vm'] as ViewManipulation;

      const viewRef = vm.insertIntoAppRef();

      // A newly created view was attached to the CD tree via ApplicationRef so should be also
      // change detected when ticking root component
      fixture.detectChanges();

      expect(viewRef.rootNodes[0]).toHaveText('change-detected');
    });

  });

  describe('markForCheck', () => {

    it('should mark OnPush ancestor of dynamically created component views as dirty', () => {

      @Component({
        selector: `test-cmpt`,
        template: `{{counter}}|<ng-template #vc></ng-template>`,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class TestCmpt {
        counter = 0;
        @ViewChild('vc', {read: ViewContainerRef}) vcRef !: ViewContainerRef;

        constructor(private _cfr: ComponentFactoryResolver) {}

        createComponentView<T>(cmptType: Type<T>): ComponentRef<T> {
          const cf = this._cfr.resolveComponentFactory(cmptType);
          return this.vcRef.createComponent(cf);
        }
      }

      @Component({
        selector: 'dynamic-cmpt',
        template: `dynamic`,
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class DynamicCmpt {
      }

      @NgModule({declarations: [DynamicCmpt], entryComponents: [DynamicCmpt]})
      class DynamicModule {
      }

      TestBed.configureTestingModule({imports: [DynamicModule], declarations: [TestCmpt]});

      const fixture = TestBed.createComponent(TestCmpt);

      // initial CD to have query results
      // NOTE: we call change detection without checkNoChanges to have clearer picture
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|');

      // insert a dynamic component
      const dynamicCmptRef = fixture.componentInstance.createComponentView(DynamicCmpt);
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|dynamic');

      // update model in the OnPush component - should not update UI
      fixture.componentInstance.counter = 1;
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('0|dynamic');

      // now mark the dynamically inserted component as dirty
      dynamicCmptRef.changeDetectorRef.markForCheck();
      fixture.detectChanges(false);
      expect(fixture.nativeElement).toHaveText('1|dynamic');
    });
  });

});