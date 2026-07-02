/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createComponent,
  ElementRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {ViewRef as InternalViewRef} from '../../src/render3/view_ref';
import {TestBed} from '../../testing';

describe('ViewRef', () => {
  it('should remove nodes from DOM when the view is detached from app ref', () => {
    @Component({
      selector: 'dynamic-cpt',
      template: '<div></div>',
      standalone: false,
    })
    class DynamicComponent {
      constructor(public elRef: ElementRef) {}
    }

    @Component({
      template: `<span></span>`,
      standalone: false,
    })
    class App {
      componentRef!: ComponentRef<DynamicComponent>;
      constructor(
        public appRef: ApplicationRef,
        private injector: EnvironmentInjector,
      ) {}

      create() {
        this.componentRef = createComponent(DynamicComponent, {environmentInjector: this.injector});
        (this.componentRef.hostView as InternalViewRef<unknown>).attachToAppRef(this.appRef);
        document.body.appendChild(this.componentRef.instance.elRef.nativeElement);
      }

      destroy() {
        (this.componentRef.hostView as InternalViewRef<unknown>).detachFromAppRef();
      }
    }

    TestBed.configureTestingModule({declarations: [App, DynamicComponent]});
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

  it('should invoke the onDestroy callback of a view ref', () => {
    let called = false;

    @Component({
      template: '',
      standalone: false,
    })
    class App {
      constructor(changeDetectorRef: ChangeDetectorRef) {
        (changeDetectorRef as InternalViewRef<unknown>).onDestroy(() => (called = true));
      }
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.destroy();

    expect(called).toBe(true);
  });

  it('should remove view ref from view container when destroyed', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class DynamicComponent {
      constructor(public viewContainerRef: ViewContainerRef) {}
    }

    @Component({
      template: `<ng-template>Hello</ng-template>`,
      standalone: false,
    })
    class App {
      @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;
      componentRef!: ComponentRef<DynamicComponent>;
      viewRef!: EmbeddedViewRef<any>;
      constructor(private _viewContainerRef: ViewContainerRef) {}

      create() {
        this.viewRef = this.templateRef.createEmbeddedView(null);
        this.componentRef = this._viewContainerRef.createComponent(DynamicComponent);
        this.componentRef.instance.viewContainerRef.insert(this.viewRef);
      }
    }

    TestBed.configureTestingModule({declarations: [App, DynamicComponent]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.componentInstance.create();
    const viewContainerRef = fixture.componentInstance.componentRef.instance.viewContainerRef;

    expect(viewContainerRef.length).toBe(1);
    fixture.componentInstance.viewRef.destroy();
    expect(viewContainerRef.length).toBe(0);
  });

  it('should mark a ViewRef as destroyed when the host view is destroyed', () => {
    @Component({
      template: '',
      standalone: false,
    })
    class DynamicComponent {
      constructor(public viewContainerRef: ViewContainerRef) {}
    }

    @Component({
      template: `<ng-template>Hello</ng-template>`,
      standalone: false,
    })
    class App {
      @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;
      componentRef!: ComponentRef<DynamicComponent>;
      viewRef!: EmbeddedViewRef<any>;
      constructor(private _viewContainerRef: ViewContainerRef) {}

      create() {
        this.viewRef = this.templateRef.createEmbeddedView(null);
        this.componentRef = this._viewContainerRef.createComponent(DynamicComponent);
        this.componentRef.instance.viewContainerRef.insert(this.viewRef);
      }
    }

    TestBed.configureTestingModule({declarations: [App, DynamicComponent]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    fixture.componentInstance.create();
    const {componentRef, viewRef} = fixture.componentInstance;

    expect(viewRef.destroyed).toBe(false);
    componentRef.hostView.destroy();
    expect(viewRef.destroyed).toBe(true);
  });
});
