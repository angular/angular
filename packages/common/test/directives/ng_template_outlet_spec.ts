/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChildren, Directive, Injectable, NO_ERRORS_SCHEMA, OnDestroy, QueryList, TemplateRef} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('NgTemplateOutlet', () => {
  let fixture: ComponentFixture<any>;

  function setTplRef(value: any): void { fixture.componentInstance.currentTplRef = value; }

  function detectChangesAndExpectText(text: string): void {
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement).toHaveText(text);
  }

  afterEach(() => { fixture = null as any; });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, CaptureTplRefs, DestroyableCmpt],
      imports: [CommonModule],
      providers: [DestroyedSpyService]
    });
  });

  // https://github.com/angular/angular/issues/14778
  it('should accept the component as the context', async(() => {
       const template = `<ng-container *ngTemplateOutlet="tpl; context: this"></ng-container>` +
           `<ng-template #tpl>{{context.foo}}</ng-template>`;

       fixture = createTestComponent(template);
       detectChangesAndExpectText('bar');
     }));

  it('should do nothing if templateRef is `null`', async(() => {
       const template = `<ng-container [ngTemplateOutlet]="null"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('');
     }));

  it('should insert content specified by TemplateRef', async(() => {
       const template = `<ng-template #tpl>foo</ng-template>` +
           `<ng-container [ngTemplateOutlet]="tpl"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('foo');
     }));

  it('should clear content if TemplateRef becomes `null`', async(() => {
       const template = `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
           `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.detectChanges();
       const refs = fixture.debugElement.children[0].references !['refs'];

       setTplRef(refs.tplRefs.first);
       detectChangesAndExpectText('foo');

       setTplRef(null);
       detectChangesAndExpectText('');
     }));

  it('should swap content if TemplateRef changes', async(() => {
       const template =
           `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template><ng-template>bar</ng-template></tpl-refs>` +
           `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
       fixture = createTestComponent(template);

       fixture.detectChanges();
       const refs = fixture.debugElement.children[0].references !['refs'];

       setTplRef(refs.tplRefs.first);
       detectChangesAndExpectText('foo');

       setTplRef(refs.tplRefs.last);
       detectChangesAndExpectText('bar');
     }));

  it('should display template if context is `null`', async(() => {
       const template = `<ng-template #tpl>foo</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: null"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('foo');
     }));

  it('should reflect initial context and changes', async(() => {
       const template = `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
       fixture = createTestComponent(template);

       fixture.detectChanges();
       detectChangesAndExpectText('bar');

       fixture.componentInstance.context.foo = 'alter-bar';
       detectChangesAndExpectText('alter-bar');
     }));

  it('should reflect user defined `$implicit` property in the context', async(() => {
       const template = `<ng-template let-ctx #tpl>{{ctx.foo}}</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.componentInstance.context = {$implicit: {foo: 'bra'}};
       detectChangesAndExpectText('bra');
     }));

  it('should reflect context re-binding', async(() => {
       const template = `<ng-template let-shawshank="shawshank" #tpl>{{shawshank}}</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
       fixture = createTestComponent(template);

       fixture.componentInstance.context = {shawshank: 'brooks'};
       detectChangesAndExpectText('brooks');

       fixture.componentInstance.context = {shawshank: 'was here'};
       detectChangesAndExpectText('was here');
     }));

  it('should update but not destroy embedded view when context values change', () => {
    const template =
        `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    detectChangesAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.value = 'baz';
    detectChangesAndExpectText('Content to destroy:baz');
    expect(spyService.destroyed).toBeFalsy();
  });

  it('should recreate embedded view when context shape changes', () => {
    const template =
        `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="context"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    detectChangesAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.context = {foo: 'baz', other: true};
    detectChangesAndExpectText('Content to destroy:baz');
    expect(spyService.destroyed).toBeTruthy();
  });

  it('should destroy embedded view when context value changes and templateRef becomes undefined', () => {
    const template =
        `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="value === 'bar' ? tpl : undefined" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    detectChangesAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.value = 'baz';
    detectChangesAndExpectText('');
    expect(spyService.destroyed).toBeTruthy();
  });

  it('should not try to update null / undefined context when context changes but template stays the same',
     () => {
       const template = `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
           `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="value === 'bar' ? null : undefined"></ng-template>`;

       fixture = createTestComponent(template);
       detectChangesAndExpectText('');

       fixture.componentInstance.value = 'baz';
       detectChangesAndExpectText('');
     });

  it('should not try to update null / undefined context when template changes', () => {
    const template = `<ng-template let-foo="foo" #tpl1>{{foo}}</ng-template>` +
        `<ng-template let-foo="foo" #tpl2>{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="value === 'bar' ? tpl1 : tpl2" [ngTemplateOutletContext]="value === 'bar' ? null : undefined"></ng-template>`;

    fixture = createTestComponent(template);
    detectChangesAndExpectText('');

    fixture.componentInstance.value = 'baz';
    detectChangesAndExpectText('');
  });

  it('should not try to update context on undefined view', () => {
    const template = `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="value === 'bar' ? null : undefined" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    detectChangesAndExpectText('');

    fixture.componentInstance.value = 'baz';
    detectChangesAndExpectText('');
  });
});

@Injectable()
class DestroyedSpyService {
  destroyed = false;
}

@Component({selector: 'destroyable-cmpt', template: 'Content to destroy'})
class DestroyableCmpt implements OnDestroy {
  constructor(private _spyService: DestroyedSpyService) {}

  ngOnDestroy(): void { this._spyService.destroyed = true; }
}

@Directive({selector: 'tpl-refs', exportAs: 'tplRefs'})
class CaptureTplRefs {
  // TODO(issue/24571): remove '!'.
  @ContentChildren(TemplateRef) tplRefs !: QueryList<TemplateRef<any>>;
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  // TODO(issue/24571): remove '!'.
  currentTplRef !: TemplateRef<any>;
  context: any = {foo: 'bar'};
  value = 'bar';
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
      .createComponent(TestComponent);
}
