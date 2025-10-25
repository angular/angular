/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgFor, NgIf} from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  Input,
  provideZoneChangeDetection,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {ReactiveNode, SIGNAL} from '../../primitives/signals';
import {TestBed} from '../../testing';

describe('CheckAlways components', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('can read a signal', () => {
    @Component({
      template: `{{value()}}`,
    })
    class CheckAlwaysCmp {
      value = signal('initial');
    }
    const fixture = TestBed.createComponent(CheckAlwaysCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    instance.value.set('new');
    fixture.detectChanges();
    expect(instance.value()).toBe('new');
  });

  it('should properly remove stale dependencies from the signal graph', () => {
    @Component({
      template: `{{show() ? name() + ' aged ' + age() : 'anonymous'}}`,
    })
    class CheckAlwaysCmp {
      name = signal('John');
      age = signal(25);
      show = signal(true);
    }

    const fixture = TestBed.createComponent(CheckAlwaysCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('John aged 25');

    instance.show.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('anonymous');

    instance.name.set('Bob');

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('anonymous');

    instance.show.set(true);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('Bob aged 25');
  });

  it('is not "shielded" by a non-dirty OnPush parent', () => {
    const value = signal('initial');
    @Component({
      template: `{{value()}}`,
      selector: 'check-always',
    })
    class CheckAlwaysCmp {
      value = value;
    }
    @Component({
      template: `<check-always />`,
      imports: [CheckAlwaysCmp],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OnPushParent {}
    const fixture = TestBed.createComponent(OnPushParent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    value.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('new');
  });

  it('continues to refresh views until none are dirty', () => {
    const aVal = signal('initial');
    const bVal = signal('initial');
    let updateAValDuringAChangeDetection = false;

    @Component({
      template: '{{val()}}',
      selector: 'a-comp',
    })
    class A {
      val = aVal;
    }
    @Component({
      template: '{{val()}}',
      selector: 'b-comp',
    })
    class B {
      val = bVal;
      ngAfterViewChecked() {
        // Set value in parent view after this view is checked
        // Without signals, this is ExpressionChangedAfterItWasChecked
        if (updateAValDuringAChangeDetection) {
          aVal.set('new');
        }
      }
    }

    @Component({template: '<a-comp />-<b-comp />', imports: [A, B]})
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('initial-initial');

    bVal.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('initial-new');

    updateAValDuringAChangeDetection = true;
    bVal.set('newer');
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('new-newer');
  });

  it('refreshes root view until it is no longer dirty', () => {
    const val = signal(0);
    let incrementAfterCheckedUntil = 0;
    @Component({
      template: '',
      selector: 'child',
    })
    class Child {
      ngDoCheck() {
        // Update signal in parent view every time we check the child view
        // (ExpressionChangedAfterItWasCheckedError but not for signals)
        if (val() < incrementAfterCheckedUntil) {
          val.update((v) => ++v);
        }
      }
    }
    @Component({template: '{{val()}}<child />', imports: [Child]})
    class App {
      val = val;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('0');

    incrementAfterCheckedUntil = 10;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('10');

    incrementAfterCheckedUntil = Number.MAX_SAFE_INTEGER;
    expect(() => fixture.detectChanges()).toThrowError(/Infinite/);
  });

  it('refreshes all views attached to ApplicationRef until no longer dirty', () => {
    const val = signal(0);
    @Component({
      template: '{{val()}}',
    })
    class App {
      val = val;
      ngOnInit() {
        this.val.update((v) => v + 1);
      }
    }
    const fixture = TestBed.createComponent(App);
    const fixture2 = TestBed.createComponent(App);
    const appRef = TestBed.inject(ApplicationRef);
    appRef.attachView(fixture.componentRef.hostView);
    appRef.attachView(fixture2.componentRef.hostView);

    appRef.tick();
    expect(fixture.nativeElement.innerText).toEqual('2');
    expect(fixture2.nativeElement.innerText).toEqual('2');
  });
});

describe('OnPush components with signals', () => {
  it('marks view dirty', () => {
    @Component({
      template: `{{value()}}{{incrementTemplateExecutions()}}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OnPushCmp {
      numTemplateExecutions = 0;
      value = signal('initial');
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }
    const fixture = TestBed.createComponent(OnPushCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    fixture.detectChanges();
    // Should not be dirty, should not execute template
    expect(instance.numTemplateExecutions).toBe(1);

    instance.value.set('new');
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(2);
    expect(instance.value()).toBe('new');
  });

  it("does not refresh a component when a signal notifies but isn't actually updated", () => {
    @Component({
      template: `{{memo()}}{{incrementTemplateExecutions()}}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OnPushCmp {
      numTemplateExecutions = 0;
      value = signal({value: 'initial'});
      memo = computed(() => this.value().value, {equal: Object.is});
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }
    const fixture = TestBed.createComponent(OnPushCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial');

    instance.value.update((v) => ({...v}));
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);

    instance.value.update((v) => ({value: 'new'}));
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(2);
    expect(fixture.nativeElement.textContent.trim()).toEqual('new');
  });

  it('should not mark components as dirty when signal is read in a constructor of a child component', () => {
    const state = signal('initial');

    @Component({
      selector: 'child',
      template: `child`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChildReadingSignalCmp {
      constructor() {
        state();
      }
    }

    @Component({
      template: `
            {{incrementTemplateExecutions()}}
            <!-- Template constructed to execute child component constructor in the update pass of a host component -->
            <ng-template [ngIf]="true"><child></child></ng-template>
          `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [NgIf, ChildReadingSignalCmp],
    })
    class OnPushCmp {
      numTemplateExecutions = 0;
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }

    const fixture = TestBed.createComponent(OnPushCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('child');

    // The "state" signal is not accesses in the template's update function anywhere so it
    // shouldn't mark components as dirty / impact change detection.
    state.set('new');
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
  });

  it('should not mark components as dirty when signal is read in an input of a child component', () => {
    const state = signal('initial');

    @Component({
      selector: 'with-input-setter',
      template: '{{test}}',
    })
    class WithInputSetter {
      test = '';

      @Input()
      set testInput(newValue: string) {
        this.test = state() + ':' + newValue;
      }
    }

    @Component({
      template: `
            {{incrementTemplateExecutions()}}
            <!-- Template constructed to execute child component constructor in the update pass of a host component -->
            <ng-template [ngIf]="true"><with-input-setter [testInput]="'input'" /></ng-template>
          `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [NgIf, WithInputSetter],
    })
    class OnPushCmp {
      numTemplateExecutions = 0;
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }

    const fixture = TestBed.createComponent(OnPushCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial:input');

    // The "state" signal is not accesses in the template's update function anywhere so it
    // shouldn't mark components as dirty / impact change detection.
    state.set('new');
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('initial:input');
  });

  it('should not mark components as dirty when signal is read in a query result setter', () => {
    const state = signal('initial');

    @Component({
      selector: 'with-query-setter',
      template: '<div #el>child</div>',
    })
    class WithQuerySetter {
      el: unknown;
      @ViewChild('el', {static: true})
      set elQuery(result: unknown) {
        // read a signal in a setter
        state();
        this.el = result;
      }
    }

    @Component({
      template: `
         {{incrementTemplateExecutions()}}
         <!-- Template constructed to execute child component constructor in the update pass of a host component -->
         <ng-template [ngIf]="true"><with-query-setter /></ng-template>
       `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [NgIf, WithQuerySetter],
    })
    class OnPushCmp {
      numTemplateExecutions = 0;
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }

    const fixture = TestBed.createComponent(OnPushCmp);
    const instance = fixture.componentInstance;

    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
    expect(fixture.nativeElement.textContent.trim()).toEqual('child');

    // The "state" signal is not accesses in the template's update function anywhere so it
    // shouldn't mark components as dirty / impact change detection.
    state.set('new');
    fixture.detectChanges();
    expect(instance.numTemplateExecutions).toBe(1);
  });

  it('can read a signal in a host binding in root view', () => {
    const useBlue = signal(false);
    @Component({
      template: `{{incrementTemplateExecutions()}}`,
      selector: 'child',
      host: {'[class.blue]': 'useBlue()'},
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class MyCmp {
      useBlue = useBlue;

      numTemplateExecutions = 0;
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }

    const fixture = TestBed.createComponent(MyCmp);

    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).not.toContain('blue');
    expect(fixture.componentInstance.numTemplateExecutions).toBe(1);

    useBlue.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).toContain('blue');
    expect(fixture.componentInstance.numTemplateExecutions).toBe(1);
  });

  it('can read a signal in a host binding', () => {
    @Component({
      template: `{{incrementTemplateExecutions()}}`,
      selector: 'child',
      host: {'[class.blue]': 'useBlue()'},
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChildCmp {
      useBlue = signal(false);

      numTemplateExecutions = 0;
      incrementTemplateExecutions() {
        this.numTemplateExecutions++;
        return '';
      }
    }

    @Component({
      template: `<child />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [ChildCmp],
    })
    class ParentCmp {}
    const fixture = TestBed.createComponent(ParentCmp);
    const child = fixture.debugElement.query((p) => p.componentInstance instanceof ChildCmp);
    const childInstance = child.componentInstance as ChildCmp;

    fixture.detectChanges();
    expect(childInstance.numTemplateExecutions).toBe(1);
    expect(child.nativeElement.outerHTML).not.toContain('blue');

    childInstance.useBlue.set(true);
    fixture.detectChanges();
    // We should not re-execute the child template. It didn't change, the host bindings did.
    expect(childInstance.numTemplateExecutions).toBe(1);
    expect(child.nativeElement.outerHTML).toContain('blue');
  });

  it('can have signals in both template and host bindings', () => {
    @Component({
      template: ``,
      selector: 'child',
      host: {'[class.blue]': 'useBlue()'},
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class ChildCmp {
      useBlue = signal(false);
    }

    @Component({
      template: `<child /> {{parentSignalValue()}}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [ChildCmp],
      selector: 'parent',
    })
    class ParentCmp {
      parentSignalValue = signal('initial');
    }

    // Wrapper component so we can effectively test ParentCmp being marked dirty
    @Component({
      template: `<parent />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [ParentCmp],
    })
    class TestWrapper {}

    const fixture = TestBed.createComponent(TestWrapper);
    const parent = fixture.debugElement.query((p) => p.componentInstance instanceof ParentCmp)
      .componentInstance as ParentCmp;
    const child = fixture.debugElement.query((p) => p.componentInstance instanceof ChildCmp)
      .componentInstance as ChildCmp;

    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).toContain('initial');
    expect(fixture.nativeElement.outerHTML).not.toContain('blue');

    child.useBlue.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).toContain('blue');

    // Set the signal in the parent again and ensure it gets updated
    parent.parentSignalValue.set('new');
    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).toContain('new');

    // Set the signal in the child host binding again and ensure it is still updated
    child.useBlue.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.outerHTML).not.toContain('blue');
  });

  it('should be able to write to signals during change-detecting a given template, in advance()', () => {
    const counter = signal(0);

    @Directive({
      selector: '[misunderstood]',
    })
    class MisunderstoodDir {
      ngOnInit(): void {
        counter.update((c) => c + 1);
      }
    }

    @Component({
      selector: 'test-component',
      imports: [MisunderstoodDir],
      template: `
          {{counter()}}<div misunderstood></div>{{ 'force advance()' }}
        `,
    })
    class TestCmp {
      counter = counter;
    }

    const fixture = TestBed.createComponent(TestCmp);
    // CheckNoChanges should not throw ExpressionChanged error
    // and signal value is updated to latest value with 1 `detectChanges`
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toContain('1');
    expect(fixture.nativeElement.innerText).toContain('force advance()');
  });

  it('should allow writing to signals during change-detecting a given template, at the end', () => {
    const counter = signal(0);

    @Directive({
      selector: '[misunderstood]',
    })
    class MisunderstoodDir {
      ngOnInit(): void {
        counter.update((c) => c + 1);
      }
    }

    @Component({
      selector: 'test-component',
      imports: [MisunderstoodDir],
      template: `
          {{counter()}}<div misunderstood></div>
        `,
    })
    class TestCmp {
      counter = counter;
    }

    const fixture = TestBed.createComponent(TestCmp);
    // CheckNoChanges should not throw ExpressionChanged error
    // and signal value is updated to latest value with 1 `detectChanges`
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toBe('1');
  });

  it('should allow writing to signals in afterViewInit', () => {
    @Component({
      template: '{{loading()}}',
    })
    class MyComp {
      loading = signal(true);
      // Classic example of what would have caused ExpressionChanged...Error
      ngAfterViewInit() {
        this.loading.set(false);
      }
    }

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toBe('false');
  });

  it('does not refresh view if signal marked dirty but did not change', () => {
    const val = signal('initial', {equal: () => true});

    @Component({
      template: '{{val()}}{{incrementChecks()}}',
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class App {
      val = val;
      templateExecutions = 0;
      incrementChecks() {
        this.templateExecutions++;
      }
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance.templateExecutions).toBe(1);
    expect(fixture.nativeElement.innerText).toContain('initial');

    val.set('new');
    fixture.detectChanges();
    expect(fixture.componentInstance.templateExecutions).toBe(1);
    expect(fixture.nativeElement.innerText).toContain('initial');
  });

  describe('embedded views', () => {
    describe('with a signal read after view creation during an update pass', () => {
      it('should work with native control flow', () => {
        @Component({
          template: `
        @if (true) { }
        {{val()}}
        `,
          changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class MyComp {
          val = signal('initial');
        }

        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        fixture.componentInstance.val.set('new');
        fixture.detectChanges();
        expect(fixture.nativeElement.innerText).toBe('new');
      });

      it('should work with createEmbeddedView', () => {
        @Component({
          template: `
        <ng-template #template></ng-template>
        {{createEmbeddedView(template)}}
        {{val()}}
        `,
          changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class MyComp {
          val = signal('initial');
          vcr = inject(ViewContainerRef);
          createEmbeddedView(ref: TemplateRef<{}>) {
            this.vcr.createEmbeddedView(ref);
          }
        }

        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        fixture.componentInstance.val.set('new');
        fixture.detectChanges();
        expect(fixture.nativeElement.innerText).toBe('new');
      });
    });

    it('refreshes an embedded view in a component', () => {
      @Component({
        selector: 'signal-component',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [NgIf],
        template: `<div *ngIf="true"> {{value()}} </div>`,
      })
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    it('refreshes multiple embedded views in a component', () => {
      @Component({
        selector: 'signal-component',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [NgFor],
        template: `<div *ngFor="let i of [1,2,3]"> {{value()}} </div>`,
      })
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new new new');
    });

    it('refreshes entire component, including embedded views, when signal updates', () => {
      @Component({
        selector: 'signal-component',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [NgIf],
        template: `
          {{componentSignal()}}
          <div *ngIf="true"> {{incrementExecutions()}} </div>
        `,
      })
      class SignalComponent {
        embeddedViewExecutions = 0;
        componentSignal = signal('initial');
        incrementExecutions() {
          this.embeddedViewExecutions++;
          return '';
        }
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.embeddedViewExecutions).toEqual(1);

      fixture.componentInstance.componentSignal.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
      // OnPush/Default components are checked as a whole so the embedded view is also checked again
      expect(fixture.componentInstance.embeddedViewExecutions).toEqual(2);
    });

    it('re-executes deep embedded template if signal updates', () => {
      @Component({
        selector: 'signal-component',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [NgIf],
        template: `
          <div *ngIf="true">
            <div *ngIf="true">
              <div *ngIf="true">
                {{value()}}
              </div>
            </div>
          </div>
        `,
      })
      class SignalComponent {
        value = signal('initial');
      }

      const fixture = TestBed.createComponent(SignalComponent);
      fixture.detectChanges();

      fixture.componentInstance.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    it('tracks signal updates if embedded view is change detected directly', () => {
      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
            <ng-template #template>{{value()}}</ng-template>
          `,
      })
      class Test {
        value = signal('initial');
        @ViewChild('template', {static: true, read: TemplateRef})
        template!: TemplateRef<{}>;
        @ViewChild('template', {static: true, read: ViewContainerRef})
        vcr!: ViewContainerRef;
      }

      const fixture = TestBed.createComponent(Test);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      appRef.tick();

      const viewRef = fixture.componentInstance.vcr.createEmbeddedView(
        fixture.componentInstance.template,
      );
      viewRef.detectChanges();
      expect(fixture.nativeElement.innerText).toContain('initial');

      fixture.componentInstance.value.set('new');
      appRef.tick();
      expect(fixture.nativeElement.innerText).toContain('new');
    });

    it('tracks signal updates if embedded view is change detected directly before attaching', () => {
      @Component({
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
            <ng-template #template>{{value()}}</ng-template>
          `,
      })
      class Test {
        value = signal('initial');
        @ViewChild('template', {static: true, read: TemplateRef})
        template!: TemplateRef<{}>;
        @ViewChild('template', {static: true, read: ViewContainerRef})
        vcr!: ViewContainerRef;
        element = inject(ElementRef);
      }

      const fixture = TestBed.createComponent(Test);
      const appRef = TestBed.inject(ApplicationRef);
      appRef.attachView(fixture.componentRef.hostView);
      appRef.tick();

      const viewRef = fixture.componentInstance.template.createEmbeddedView(
        fixture.componentInstance.template,
      );
      fixture.componentInstance.element.nativeElement.appendChild(viewRef.rootNodes[0]);
      viewRef.detectChanges();
      expect(fixture.nativeElement.innerText).toContain('initial');
      fixture.componentInstance.vcr.insert(viewRef);

      fixture.componentInstance.value.set('new');
      appRef.tick();
      expect(fixture.nativeElement.innerText).toContain('new');
    });
  });

  describe('shielded by non-dirty OnPush', () => {
    @Component({
      selector: 'signal-component',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `{{value()}}`,
    })
    class SignalComponent {
      value = signal('initial');
      afterViewCheckedRuns = 0;
      constructor(readonly cdr: ChangeDetectorRef) {}
      ngAfterViewChecked() {
        this.afterViewCheckedRuns++;
      }
    }

    @Component({
      selector: 'on-push-parent',
      template: `
      <signal-component></signal-component>
      {{incrementChecks()}}`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [SignalComponent],
    })
    class OnPushParent {
      @ViewChild(SignalComponent) signalChild!: SignalComponent;
      viewExecutions = 0;

      constructor(readonly cdr: ChangeDetectorRef) {}
      incrementChecks() {
        this.viewExecutions++;
      }
    }

    it('refreshes when signal changes, but does not refresh non-dirty parent', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      expect(fixture.componentInstance.viewExecutions).toEqual(1);
      fixture.componentInstance.signalChild.value.set('new');
      fixture.detectChanges();
      expect(fixture.componentInstance.viewExecutions).toEqual(1);
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    it('does not refresh when detached', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      fixture.componentInstance.signalChild.value.set('new');
      fixture.componentInstance.signalChild.cdr.detach();
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('initial');
    });

    it('refreshes when reattached if already dirty', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      fixture.componentInstance.signalChild.value.set('new');
      fixture.componentInstance.signalChild.cdr.detach();
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('initial');
      fixture.componentInstance.signalChild.cdr.reattach();
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
    });

    // Note: Design decision for signals because that's how the hooks work today
    // We have considered actually running a component's `afterViewChecked` hook if it's refreshed
    // in targeted mode (meaning the parent did not refresh) and could change this decision.
    it('does not run afterViewChecked hooks because parent view was not dirty (those hooks are executed by the parent)', () => {
      const fixture = TestBed.createComponent(OnPushParent);
      fixture.detectChanges();
      // hook run once on initialization
      expect(fixture.componentInstance.signalChild.afterViewCheckedRuns).toBe(1);
      fixture.componentInstance.signalChild.value.set('new');
      fixture.detectChanges();
      expect(trim(fixture.nativeElement.textContent)).toEqual('new');
      // hook did not run again because host view was not refreshed
      expect(fixture.componentInstance.signalChild.afterViewCheckedRuns).toBe(1);
    });
  });

  it('can refresh the root of change detection if updated after checked', () => {
    const val = signal(1);
    @Component({
      template: '',
      selector: 'child',
    })
    class Child {
      ngOnInit() {
        val.set(2);
      }
    }

    @Component({
      template: '{{val()}} <child />',
      imports: [Child],
    })
    class SignalComponent {
      val = val;
      cdr = inject(ChangeDetectorRef);
    }

    const fixture = TestBed.createComponent(SignalComponent);
    fixture.componentInstance.cdr.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('2');
  });

  it('destroys all signal consumers when destroying the view tree', () => {
    const val = signal(1);
    const double = computed(() => val() * 2);

    @Component({
      template: '{{double()}}',
      selector: 'child',
    })
    class Child {
      double = double;
    }

    @Component({
      template: '|{{double()}}|<child />|',
      imports: [Child],
    })
    class SignalComponent {
      double = double;
    }

    const fixture = TestBed.createComponent(SignalComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerText).toEqual('|2|2|');

    const node = double[SIGNAL] as ReactiveNode;
    expect(node.dirty).toBe(false);

    // Change the signal to verify that the computed is dirtied while being read from the template.
    val.set(2);
    expect(node.dirty).toBe(true);
    fixture.detectChanges();
    expect(node.dirty).toBe(false);
    expect(fixture.nativeElement.innerText).toEqual('|4|4|');

    // Destroy the view tree to verify that the computed is unconnected from the graph for all
    // views.
    fixture.destroy();
    expect(node.dirty).toBe(false);

    // Writing further updates to the signal should not cause the computed to become dirty, since it
    // is no longer being observed.
    val.set(3);
    expect(node.dirty).toBe(false);
  });
});

function trim(text: string | null): string {
  return text ? text.replace(/[\s\n]+/gm, ' ').trim() : '';
}
