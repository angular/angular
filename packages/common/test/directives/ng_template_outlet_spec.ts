/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '@angular/compiler';
import {
  Component,
  ContentChildren,
  Directive,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  OnDestroy,
  Optional,
  Provider,
  QueryList,
  SkipSelf,
  TemplateRef,
  inject,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {expect} from '@angular/private/testing/matchers';
import {NgTemplateOutlet} from '../../index';

describe('NgTemplateOutlet', () => {
  let fixture: ComponentFixture<any>;

  function setTplRef(value: any): void {
    fixture.componentInstance.currentTplRef = value;
  }

  async function waitForStableAndExpectText(text: string): Promise<void> {
    await fixture.whenStable();
    expect(fixture.debugElement.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null as any;
  });

  // https://github.com/angular/angular/issues/14778
  it('should accept the component as the context', async () => {
    const template =
      `<ng-container *ngTemplateOutlet="tpl; context: this"></ng-container>` +
      `<ng-template #tpl>{{context.foo}}</ng-template>`;

    fixture = createTestComponent(template);
    await waitForStableAndExpectText('bar');
  });

  it('should do nothing if templateRef is `null`', async () => {
    const template = `<ng-container [ngTemplateOutlet]="null"></ng-container>`;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('');
  });

  it('should do nothing if templateRef is `undefined`', async () => {
    const template = `<ng-container [ngTemplateOutlet]="undefined"></ng-container>`;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('');
  });

  it('should insert content specified by TemplateRef', async () => {
    const template =
      `<ng-template #tpl>foo</ng-template>` +
      `<ng-container [ngTemplateOutlet]="tpl"></ng-container>`;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('foo');
  });

  it('should clear content if TemplateRef becomes `null`', async () => {
    const template =
      `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
      `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
    fixture = createTestComponent(template);
    await fixture.whenStable();
    const refs = fixture.debugElement.children[0].references!['refs'];

    setTplRef(refs.tplRefs.first);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('foo');

    setTplRef(null);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
  });

  it('should clear content if TemplateRef becomes `undefined`', async () => {
    const template =
      `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
      `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
    fixture = createTestComponent(template);
    await fixture.whenStable();
    const refs = fixture.debugElement.children[0].references!['refs'];

    setTplRef(refs.tplRefs.first);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('foo');

    setTplRef(undefined);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
  });

  it('should swap content if TemplateRef changes', async () => {
    const template =
      `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template><ng-template>bar</ng-template></tpl-refs>` +
      `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
    fixture = createTestComponent(template);

    await fixture.whenStable();
    const refs = fixture.debugElement.children[0].references!['refs'];

    setTplRef(refs.tplRefs.first);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('foo');

    setTplRef(refs.tplRefs.last);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('bar');
  });

  it('should display template if context is `null`', async () => {
    const template =
      `<ng-template #tpl>foo</ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; context: null"></ng-container>`;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('foo');
  });

  it('should display template if context is `undefined`', async () => {
    const template =
      `<ng-template #tpl>foo</ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; context: undefined"></ng-container>`;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('foo');
  });

  it('should reflect initial context and changes', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
    fixture = createTestComponent(template);

    await waitForStableAndExpectText('bar');

    fixture.componentInstance.context.foo = 'alter-bar';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('alter-bar');
  });

  it('should reflect user defined `$implicit` property in the context', async () => {
    const template =
      `<ng-template let-ctx #tpl>{{ctx.foo}}</ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.context = {$implicit: {foo: 'bra'}};
    await waitForStableAndExpectText('bra');
  });

  it('should reflect context re-binding', async () => {
    const template =
      `<ng-template let-shawshank="shawshank" #tpl>{{shawshank}}</ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; context: context"></ng-container>`;
    fixture = createTestComponent(template);

    fixture.componentInstance.context = {shawshank: 'brooks'};
    await waitForStableAndExpectText('brooks');

    fixture.componentInstance.context = {shawshank: 'was here'};
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('was here');
  });

  it('should update but not destroy embedded view when context values change', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    await waitForStableAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.value = 'baz';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('Content to destroy:baz');
    expect(spyService.destroyed).toBeFalsy();
  });

  it('should update but not destroy embedded view when context shape changes', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="context"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    await waitForStableAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.context = {foo: 'baz', other: true};
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('Content to destroy:baz');
    expect(spyService.destroyed).toBeFalsy();
  });

  it('should destroy embedded view when context value changes and templateRef becomes undefined', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl><destroyable-cmpt></destroyable-cmpt>:{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="value === 'bar' ? tpl : undefined" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    const spyService = fixture.debugElement.injector.get(DestroyedSpyService);

    await waitForStableAndExpectText('Content to destroy:bar');
    expect(spyService.destroyed).toBeFalsy();

    fixture.componentInstance.value = 'baz';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
    expect(spyService.destroyed).toBeTruthy();
  });

  it('should not try to update null / undefined context when context changes but template stays the same', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="value === 'bar' ? null : undefined"></ng-template>`;

    fixture = createTestComponent(template);
    await waitForStableAndExpectText('');

    fixture.componentInstance.value = 'baz';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
  });

  it('should not try to update null / undefined context when template changes', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl1>{{foo}}</ng-template>` +
      `<ng-template let-foo="foo" #tpl2>{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="value === 'bar' ? tpl1 : tpl2" [ngTemplateOutletContext]="value === 'bar' ? null : undefined"></ng-template>`;

    fixture = createTestComponent(template);
    await waitForStableAndExpectText('');

    fixture.componentInstance.value = 'baz';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
  });

  it('should not try to update context on undefined view', async () => {
    const template =
      `<ng-template let-foo="foo" #tpl>{{foo}}</ng-template>` +
      `<ng-template [ngTemplateOutlet]="value === 'bar' ? null : undefined" [ngTemplateOutletContext]="{foo: value}"></ng-template>`;

    fixture = createTestComponent(template);
    await waitForStableAndExpectText('');

    fixture.componentInstance.value = 'baz';
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');
  });

  // https://github.com/angular/angular/issues/30801
  it('should not throw if the context is left blank', async () => {
    const template = `
      <ng-template #testTemplate>test</ng-template>
      <ng-template [ngTemplateOutlet]="testTemplate" [ngTemplateOutletContext]=""></ng-template>
    `;

    fixture = createTestComponent(template);
    await expectAsync(waitForStableAndExpectText('test')).toBeResolved();
  });

  it('should not throw when switching from template to null and back to template', async () => {
    const template =
      `<tpl-refs #refs="tplRefs"><ng-template>foo</ng-template></tpl-refs>` +
      `<ng-container [ngTemplateOutlet]="currentTplRef"></ng-container>`;
    fixture = createTestComponent(template);
    await fixture.whenStable();
    const refs = fixture.debugElement.children[0].references!['refs'];

    setTplRef(refs.tplRefs.first);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('foo');

    setTplRef(null);
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('');

    setTplRef(refs.tplRefs.first);
    fixture.changeDetectorRef.markForCheck();
    await expectAsync(waitForStableAndExpectText('foo')).toBeResolved();
  });

  it('should not mutate context object if two contexts with an identical shape are swapped', async () => {
    fixture = TestBed.createComponent(MultiContextComponent);
    const {componentInstance, nativeElement} = fixture;
    componentInstance.context1 = {name: 'one'};
    componentInstance.context2 = {name: 'two'};
    await fixture.whenStable();

    expect(nativeElement.textContent.trim()).toBe('one | two');
    expect(componentInstance.context1).toEqual({name: 'one'});
    expect(componentInstance.context2).toEqual({name: 'two'});

    const temp = componentInstance.context1;
    componentInstance.context1 = componentInstance.context2;
    componentInstance.context2 = temp;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(nativeElement.textContent.trim()).toBe('two | one');
    expect(componentInstance.context1).toEqual({name: 'two'});
    expect(componentInstance.context2).toEqual({name: 'one'});
  });

  it('should be able to specify an injector', async () => {
    const template =
      `<ng-template #tpl><inject-value></inject-value></ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: templateToken, useValue: 'world'}],
    });
    await waitForStableAndExpectText('Hello world');
  });

  it('should re-render if the injector changes', async () => {
    const template =
      `<ng-template #tpl><inject-value></inject-value></ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
    fixture = createTestComponent(template);
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: templateToken, useValue: 'world'}],
    });
    await waitForStableAndExpectText('Hello world');

    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: templateToken, useValue: 'there'}],
    });
    fixture.changeDetectorRef.markForCheck();
    await waitForStableAndExpectText('Hello there');
  });

  it('should override providers from parent component using custom injector', async () => {
    const template =
      `<ng-template #tpl><inject-value></inject-value></ng-template>` +
      `<ng-container *ngTemplateOutlet="tpl; injector: injector"></ng-container>`;
    fixture = createTestComponent(template, [{provide: templateToken, useValue: 'parent'}]);
    fixture.componentInstance.injector = Injector.create({
      providers: [{provide: templateToken, useValue: 'world'}],
    });
    await waitForStableAndExpectText('Hello world');
  });

  it('should be able to inherit outlet injector', async () => {
    const template = `
      <ng-template #tpl><inject-value></inject-value></ng-template>
      <provide-value>
        <ng-container *ngTemplateOutlet="tpl; injector: 'outlet'"></ng-container>
      </provide-value>
    `;
    fixture = createTestComponent(template, [{provide: templateToken, useValue: 'root'}]);
    await waitForStableAndExpectText('Hello provide-value');
  });

  it('should be able to inherit outlet injector in a deeply nested structure', async () => {
    // This template should create the following rendered structure
    // (Spaces & newlines added for readability):
    // <nesting-counter> 1
    //   <nesting counter> 2
    //     <nesting-counter> 3
    //       <nesting-counter> 4 </nesting-counter>
    //     </nesting-counter>
    //   </nesting-counter>
    //   <nesting-counter> 2 </nesting-counter>
    // </nesting-counter>
    const template = `
      <ng-container *ngTemplateOutlet="node; context: {$implicit: [[[[]]], []]}" />

      <ng-template #node let-data>
        <nesting-counter>
          @for (item of data; track $index) {
            <ng-container *ngTemplateOutlet="node; context: {$implicit: item}; injector: 'outlet'" />
          } 
        </nesting-counter>
      </ng-template>
    `;
    fixture = createTestComponent(template);
    await waitForStableAndExpectText('12342');
  });

  it('should be available as a standalone directive', async () => {
    @Component({
      selector: 'test-component',
      imports: [NgTemplateOutlet],
      template: `
        <ng-template #tpl>Hello World</ng-template>
        <ng-container *ngTemplateOutlet="tpl"></ng-container>
      `,
    })
    class TestComponent {}

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Hello World');
  });

  it('should properly bind context if context is unset initially', async () => {
    @Component({
      imports: [NgTemplateOutlet],
      template: `
        <ng-template #tpl let-name>Name:{{ name }}</ng-template>
        <ng-template [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="ctx"></ng-template>
      `,
      changeDetection: ChangeDetectionStrategy.Eager,
    })
    class TestComponent {
      ctx: {$implicit: string} | undefined = undefined;
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Name:');

    fixture.componentInstance.ctx = {$implicit: 'Angular'};
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('Name:Angular');
  });
});

const templateToken = new InjectionToken<string>('templateToken');

@Injectable()
class DestroyedSpyService {
  destroyed = false;
}

@Component({
  selector: 'destroyable-cmpt',
  template: 'Content to destroy',
})
class DestroyableCmpt implements OnDestroy {
  constructor(private _spyService: DestroyedSpyService) {}

  ngOnDestroy(): void {
    this._spyService.destroyed = true;
  }
}

@Directive({
  selector: 'tpl-refs',
  exportAs: 'tplRefs',
})
class CaptureTplRefs {
  @ContentChildren(TemplateRef) tplRefs?: QueryList<TemplateRef<any>>;
}

@Component({
  selector: 'provide-value',
  template: '<ng-content />',
  providers: [{provide: templateToken, useValue: 'provide-value'}],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ProvideValueComponent {}

@Component({
  selector: 'inject-value',
  template: 'Hello {{tokenValue}}',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class InjectValueComponent {
  constructor(@Inject(templateToken) public tokenValue: string) {}
}

@Component({
  template: `
    <ng-template #template let-name="name">{{ name }}</ng-template>
    <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context1"></ng-template>
    |
    <ng-template [ngTemplateOutlet]="template" [ngTemplateOutletContext]="context2"></ng-template>
  `,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MultiContextComponent {
  context1: {name: string} | undefined;
  context2: {name: string} | undefined;
}

const NESTING_DEPTH = new InjectionToken<number>('NESTING_DEPTH');

@Component({
  selector: 'nesting-counter',
  template: '{{depth}}<ng-content />',
  providers: [
    {
      provide: NESTING_DEPTH,
      useFactory: (l: number) => (l ? l + 1 : 1),
      deps: [[new Optional(), new SkipSelf(), NESTING_DEPTH]],
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class NestingCounter {
  depth = inject(NESTING_DEPTH);
}

@Component({
  selector: 'test-cmp',
  template: '',
  imports: [
    CaptureTplRefs,
    DestroyableCmpt,
    InjectValueComponent,
    NestingCounter,
    NgTemplateOutlet,
    ProvideValueComponent,
  ],
  providers: [DestroyedSpyService],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
  currentTplRef?: TemplateRef<any>;
  context: any = {foo: 'bar'};
  value = 'bar';
  injector: Injector | null = null;
}

function createTestComponent(
  template: string,
  providers: Provider[] = [],
): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {
    set: {template, providers: [DestroyedSpyService, ...providers]},
  }).createComponent(TestComponent);
}
