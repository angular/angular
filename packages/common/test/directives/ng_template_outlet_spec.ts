/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgTemplateOutlet} from '@angular/common';
import {Component, ContentChildren, Directive, Inject, Injectable, InjectionToken, Injector, NO_ERRORS_SCHEMA, OnDestroy, Provider, QueryList, TemplateRef} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('NgTemplateOutlet', () => {
  let fixture: ComponentFixture<any>;

  function setTplRef(value: any): void {
    fixture.componentInstance.currentTplRef = value;
  }

  function detectChangesAndExpectText(text: string): void {
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        CaptureTplRefs,
        DestroyableCmpt,
        MultiContextComponent,
        InjectValueComponent,
      ],
      imports: [CommonModule],
      providers: [DestroyedSpyService]
    });
  });

  // https://github.com/angular/angular/issues/14778
  it('should accept the component as the context', waitForAsync(() => {
       const template = `<ng-container *ngTemplateOutlet="tpl; context: this"></ng-container>` +
           `<ng-template #tpl>{{context.foo}}</ng-template>`;

       fixture = createTestComponent(template);
       detectChangesAndExpectText('bar');
     }));

  it('should do nothing if templateRef is `null`', waitForAsync(() => {
       const template = `<ng-container [ngTemplateOutlet]="null"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('');
     }));

  it('should insert content specified by TemplateRef', waitForAsync(() => {
       const template = `<ng-template #tpl>foo</ng-template>` +
           `<ng-container [ngTemplateOutlet]="tpl"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('foo');
     }));

  it('should clear content if TemplateRef becomes `null`', waitForAsync(() => {
       const template = `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
           `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.detectChanges();
       const refs = fixture.debugElement.children[0].references!['refs'];

       setTplRef(refs.tplRefs.first);
       detectChangesAndExpectText('foo');

       setTplRef(null);
       detectChangesAndExpectText('');
     }));

  it('should swap content if TemplateRef changes', waitForAsync(() => {
       const template =
           `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template><ng-template>bar</ng-template></tpl-refs>` +
           `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
       fixture = createTestComponent(template);

       fixture.detectChanges();
       const refs = fixture.debugElement.children[0].references!['refs'];

       setTplRef(refs.tplRefs.first);
       detectChangesAndExpectText('foo');

       setTplRef(refs.tplRefs.last);
       detectChangesAndExpectText('bar');
     }));

  it('should display template if context is `null`', waitForAsync(() => {
       const template = `<ng-template #tpl>foo</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: null"></ng-container>`;
       fixture = createTestComponent(template);
       detectChangesAndExpectText('foo');
     }));

  it('should reflect initial context and changes', waitForAsync(() => {
       const template = `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
       fixture = createTestComponent(template);

       fixture.detectChanges();
       detectChangesAndExpectText('bar');

       fixture.componentInstance.context.foo = 'alter-bar';
       detectChangesAndExpectText('alter-bar');
     }));

  it('should reflect user defined `$implicit` property in the context', waitForAsync(() => {
       const template = `<ng-template let-ctx #tpl>{{ctx.foo}}</ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.componentInstance.context = {$implicit: {foo: 'bra'}};
       detectChangesAndExpectText('bra');
     }));

  it('should reflect context re-binding', waitForAsync(() => {
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

  it('should update but not destroy embedded view when context shape changes', () => {
    const template =
        `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
        `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="context"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    detectChangesAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.context = {foo: 'baz', other: true};
    detectChangesAndExpectText('Content to destroy:baz');
    expect(spyService.destroyed).toBeFalsy();
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

  // https://github.com/angular/angular/issues/30801
  it('should not throw if the context is left blank', () => {
    const template = `
      <ng-template #testTemplate>test</ng-template>
      <ng-template [ngTemplateOutlet]="testTemplate" [ngTemplateOutletContext]=""></ng-template>
    `;

    expect(() => {
      fixture = createTestComponent(template);
      detectChangesAndExpectText('test');
    }).not.toThrow();
  });

  it('should not throw when switching from template to null and back to template',
     waitForAsync(() => {
       const template = `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
           `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.detectChanges();
       const refs = fixture.debugElement.children[0].references!['refs'];

       setTplRef(refs.tplRefs.first);
       detectChangesAndExpectText('foo');

       setTplRef(null);
       detectChangesAndExpectText('');

       expect(() => {
         setTplRef(refs.tplRefs.first);
         detectChangesAndExpectText('foo');
       }).not.toThrow();
     }));

  it('should not mutate context object if two contexts with an identical shape are swapped', () => {
    fixture = TestBed.createComponent(MultiContextComponent);
    const {componentInstance, nativeElement} = fixture;
    componentInstance.context1 = {name: 'one'};
    componentInstance.context2 = {name: 'two'};
    fixture.detectChanges();

    expect(nativeElement.textContent.trim()).toBe('one | two');
    expect(componentInstance.context1).toEqual({name: 'one'});
    expect(componentInstance.context2).toEqual({name: 'two'});

    const temp = componentInstance.context1;
    componentInstance.context1 = componentInstance.context2;
    componentInstance.context2 = temp;
    fixture.detectChanges();

    expect(nativeElement.textContent.trim()).toBe('two | one');
    expect(componentInstance.context1).toEqual({name: 'two'});
    expect(componentInstance.context2).toEqual({name: 'one'});
  });

  it('should be able to specify an injector', waitForAsync(() => {
       const template = `<ng-template #tpl><inject-value></inject-value></ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.componentInstance.injector =
           Injector.create({providers: [{provide: templateToken, useValue: 'world'}]});
       detectChangesAndExpectText('Hello world');
     }));

  it('should re-render if the injector changes', waitForAsync(() => {
       const template = `<ng-template #tpl><inject-value></inject-value></ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
       fixture = createTestComponent(template);
       fixture.componentInstance.injector =
           Injector.create({providers: [{provide: templateToken, useValue: 'world'}]});
       detectChangesAndExpectText('Hello world');

       fixture.componentInstance.injector =
           Injector.create({providers: [{provide: templateToken, useValue: 'there'}]});
       detectChangesAndExpectText('Hello there');
     }));

  it('should override providers from parent component using custom injector', waitForAsync(() => {
       const template = `<ng-template #tpl><inject-value></inject-value></ng-template>` +
           `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
       fixture = createTestComponent(template, [{provide: templateToken, useValue: 'parent'}]);
       fixture.componentInstance.injector =
           Injector.create({providers: [{provide: templateToken, useValue: 'world'}]});
       detectChangesAndExpectText('Hello world');
     }));

  it('should be available as a standalone directive', () => {
    @Component({
      selector: 'test-component',
      imports: [NgTemplateOutlet],
      template: `
        <ng-template #tpl>Hello World</ng-template>
        <ng-container *ngTemplateOutlet="tpl"></ng-container>
      `,
      standalone: true,
    })
    class TestComponent {
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });
});

const templateToken = new InjectionToken<string>('templateToken');

@Injectable()
class DestroyedSpyService {
  destroyed = false;
}

@Component({selector: 'destroyable-cmpt', template: 'Content to destroy'})
class DestroyableCmpt implements OnDestroy {
  constructor(private _spyService: DestroyedSpyService) {}

  ngOnDestroy(): void {
    this._spyService.destroyed = true;
  }
}

@Directive({selector: 'tpl-refs', exportAs: 'tplRefs'})
class CaptureTplRefs {
  @ContentChildren(TemplateRef) tplRefs?: QueryList<TemplateRef<any>>;
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  currentTplRef?: TemplateRef<any>;
  context: any = {foo: 'bar'};
  value = 'bar';
  injector: Injector|null = null;
}

@Component({
  selector: 'inject-value',
  template: 'Hello {{tokenValue}}',
})
class InjectValueComponent {
  constructor(@Inject(templateToken) public tokenValue: string) {}
}

@Component({
  template: `
  <ng-template #template let-name="name">{{name}}</ng-template>
  <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context1"></ng-template>
  |
  <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context2"></ng-template>
  `
})
class MultiContextComponent {
  context1: {name: string}|undefined;
  context2: {name: string}|undefined;
}

function createTestComponent(
    template: string, providers: Provider[] = []): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template, providers}})
      .configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
      .createComponent(TestComponent);
}
