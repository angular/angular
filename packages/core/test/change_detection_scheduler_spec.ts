/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AsyncPipe, ɵPLATFORM_BROWSER_ID as PLATFORM_BROWSER_ID} from '@angular/common';
import {bootstrapApplication} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs';
import {filter, take, tap} from 'rxjs/operators';
import {toSignal} from '../rxjs-interop';
import {
  afterEveryRender,
  afterNextRender,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  createComponent,
  destroyPlatform,
  ElementRef,
  EnvironmentInjector,
  ErrorHandler,
  EventEmitter,
  inject,
  Input,
  NgZone,
  Output,
  PLATFORM_ID,
  provideZoneChangeDetection,
  provideZonelessChangeDetection,
  signal,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '../src/core';
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '../testing';

import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {isBrowser, isNode, withBody} from '@angular/private/testing';
import {ChangeDetectionSchedulerImpl} from '../src/change_detection/scheduling/zoneless_scheduling_impl';
import {RuntimeError, RuntimeErrorCode} from '../src/errors';
import {scheduleCallbackWithRafRace} from '../src/util/callback_scheduler';
import {global} from '../src/util/global';

function isStable(injector = TestBed.inject(EnvironmentInjector)): boolean {
  return toSignal(injector.get(ApplicationRef).isStable, {requireSync: true, injector})();
}

describe('Angular with zoneless enabled', () => {
  async function createFixture<T>(type: Type<T>): Promise<ComponentFixture<T>> {
    const fixture = TestBed.createComponent(type);
    await fixture.whenStable();
    return fixture;
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
      ],
    });
  });

  describe('notifies scheduler', () => {
    it('contributes to application stableness', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}'})
      class TestComponent {
        val = val;
      }
      const fixture = await createFixture(TestComponent);

      // Cause another pending CD immediately after render and verify app has not stabilized
      await fixture.whenStable().then(() => {
        val.set('new');
      });
      expect(fixture.isStable()).toBeFalse();

      await fixture.whenStable();
      expect(fixture.isStable()).toBeTrue();
    });

    it('when signal updates', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}'})
      class TestComponent {
        val = val;
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      val.set('new');
      expect(fixture.isStable()).toBeFalse();
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('when using markForCheck()', async () => {
      @Component({template: '{{val}}'})
      class TestComponent {
        cdr = inject(ChangeDetectorRef);
        val = 'initial';
        setVal(val: string) {
          this.val = val;
          this.cdr.markForCheck();
        }
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      fixture.componentInstance.setVal('new');
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('on input binding', async () => {
      @Component({template: '{{val}}'})
      class TestComponent {
        @Input() val = 'initial';
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      fixture.componentRef.setInput('val', 'new');
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('on event listener bound in template', async () => {
      @Component({template: '<div (click)="updateVal()">{{val}}</div>'})
      class TestComponent {
        val = 'initial';

        updateVal() {
          this.val = 'new';
        }
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      fixture.debugElement
        .query((p) => p.nativeElement.tagName === 'DIV')
        .triggerEventHandler('click');
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('on event listener bound in host', async () => {
      @Component({host: {'(click)': 'updateVal()'}, template: '{{val}}'})
      class TestComponent {
        val = 'initial';

        updateVal() {
          this.val = 'new';
        }
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      fixture.debugElement.triggerEventHandler('click');
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('with async pipe', async () => {
      @Component({template: '{{val | async}}', imports: [AsyncPipe]})
      class TestComponent {
        val = new BehaviorSubject('initial');
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      fixture.componentInstance.val.next('new');
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('new');
    });

    it('when creating a view', async () => {
      @Component({
        template: '<ng-template #ref>{{"binding"}}</ng-template>',
      })
      class TestComponent {
        @ViewChild(TemplateRef) template!: TemplateRef<unknown>;
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;

        createView(): any {
          this.viewContainer.createEmbeddedView(this.template);
        }
      }

      const fixture = await createFixture(TestComponent);

      fixture.componentInstance.createView();
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('binding');
    });

    it('when inserting a view', async () => {
      @Component({
        template: '{{"binding"}}',
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }
      @Component({
        template: '<ng-template #ref></ng-template>',
      })
      class TestComponent {
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      }

      const fixture = await createFixture(TestComponent);

      const otherComponent = createComponent(DynamicCmp, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });
      fixture.componentInstance.viewContainer.insert(otherComponent.hostView);
      expect(fixture.isStable()).toBe(false);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('binding');
    });

    it('when destroying a view (with animations)', async () => {
      @Component({
        template: '{{"binding"}}',
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }
      @Component({
        template: '<ng-template #ref></ng-template>',
      })
      class TestComponent {
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      }

      const fixture = await createFixture(TestComponent);
      const component = createComponent(DynamicCmp, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });

      fixture.componentInstance.viewContainer.insert(component.hostView);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('binding');
      fixture.componentInstance.viewContainer.remove();
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('');

      const component2 = createComponent(DynamicCmp, {
        environmentInjector: TestBed.inject(EnvironmentInjector),
      });
      fixture.componentInstance.viewContainer.insert(component2.hostView);
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('binding');
      component2.destroy();
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('');
    });

    function whenStable(): Promise<void> {
      return TestBed.inject(ApplicationRef).whenStable();
    }

    it(
      'when destroying a view (*no* animations)',
      withBody('<app></app>', async () => {
        destroyPlatform();
        let doCheckCount = 0;
        let renderHookCalls = 0;
        @Component({
          template: '{{"binding"}}',
        })
        class DynamicCmp {
          elementRef = inject(ElementRef);
        }
        @Component({
          selector: 'app',
          template: '<ng-template #ref></ng-template>',
        })
        class App {
          @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
          unused = afterEveryRender(() => {
            renderHookCalls++;
          });

          ngDoCheck() {
            doCheckCount++;
          }
        }
        const applicationRef = await bootstrapApplication(App, {
          providers: [
            provideZonelessChangeDetection(),
            {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          ],
        });
        const appViewRef = (applicationRef as any)._views[0] as {context: App; rootNodes: any[]};
        await applicationRef.whenStable();

        const component2 = createComponent(DynamicCmp, {
          environmentInjector: applicationRef.injector,
        });
        appViewRef.context.viewContainer.insert(component2.hostView);
        expect(isStable(applicationRef.injector)).toBe(false);
        await applicationRef.whenStable();
        component2.destroy();

        // destroying the view synchronously removes element from DOM when not using animations
        expect(appViewRef.rootNodes[0].innerText).toEqual('');
        // Destroying the view notifies scheduler because render hooks need to run
        expect(isStable(applicationRef.injector)).toBe(false);

        let checkCountBeforeStable = doCheckCount;
        let renderCountBeforeStable = renderHookCalls;
        await applicationRef.whenStable();
        // The view should not have refreshed
        expect(doCheckCount).toEqual(checkCountBeforeStable);
        // but render hooks should have run
        expect(renderHookCalls).toEqual(renderCountBeforeStable + 1);

        destroyPlatform();
      }),
    );

    it('when attaching view to ApplicationRef', async () => {
      @Component({
        selector: 'dynamic-cmp',
        template: '{{"binding"}}',
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const appRef = TestBed.inject(ApplicationRef);
      const component = createComponent(DynamicCmp, {environmentInjector});
      const host = document.createElement('div');
      host.appendChild(component.instance.elementRef.nativeElement);
      expect(host.innerHTML).toEqual('<dynamic-cmp></dynamic-cmp>');

      appRef.attachView(component.hostView);
      await whenStable();
      expect(host.innerHTML).toEqual('<dynamic-cmp>binding</dynamic-cmp>');

      const component2 = createComponent(DynamicCmp, {environmentInjector});
      appRef.attachView(component2.hostView);
      appRef.detachView(component.hostView);
      expect(isStable()).toBe(false);
      await whenStable();
      expect(host.innerHTML).toEqual('');
      host.appendChild(component.instance.elementRef.nativeElement);
      // reattaching non-dirty view notifies scheduler because afterRender hooks must run
      appRef.attachView(component.hostView);
      expect(isStable()).toBe(false);
    });

    it(
      'when attaching view to ApplicationRef with animations',
      withBody('<app></app>', async () => {
        destroyPlatform();

        @Component({
          standalone: true,
          template: `<p>Component created</p>`,
        })
        class DynamicComponent {
          cdr = inject(ChangeDetectorRef);
        }

        @Component({
          selector: 'app',
          standalone: true,
          template: `<main #outlet></main>`,
        })
        class App {
          @ViewChild('outlet') outlet!: ElementRef<HTMLElement>;

          envInjector = inject(EnvironmentInjector);
          appRef = inject(ApplicationRef);
          elementRef = inject(ElementRef);

          createComponent() {
            const host = document.createElement('div');
            this.outlet.nativeElement.appendChild(host);

            const ref = createComponent(DynamicComponent, {
              environmentInjector: this.envInjector,
              hostElement: host,
            });

            this.appRef.attachView(ref.hostView);

            return ref;
          }
        }

        const applicationRef = await bootstrapApplication(App, {
          providers: [
            provideZonelessChangeDetection(),
            provideNoopAnimations(),
            {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          ],
        });

        const component = applicationRef.components[0] as ComponentRef<App>;
        const appNativeElement = component.instance.elementRef.nativeElement;

        await applicationRef.whenStable();
        expect(appNativeElement.innerHTML).toEqual('<main></main>');

        const ref: ComponentRef<DynamicComponent> = component.instance.createComponent();
        await applicationRef.whenStable();
        expect(appNativeElement.innerHTML).toContain('<p>Component created</p>');

        // Similating a case where invoking destroy also schedules a CD.
        ref.instance.cdr.markForCheck();
        ref.destroy();

        // DOM is not synchronously removed because change detection hasn't run
        expect(appNativeElement.innerHTML).toContain('<p>Component created</p>');
        await applicationRef.whenStable();

        expect(isStable()).toBe(true);
        expect(appNativeElement.innerHTML).toEqual('<main></main>');
      }),
    );

    it('when a stable subscription synchronously causes another notification', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}'})
      class TestComponent {
        val = val;
      }

      const fixture = await createFixture(TestComponent);
      expect(fixture.nativeElement.innerText).toEqual('initial');

      val.set('new');
      await TestBed.inject(ApplicationRef)
        .isStable.pipe(
          filter((stable) => stable),
          take(1),
          tap(() => val.set('newer')),
        )
        .toPromise();
      await fixture.whenStable();
      expect(fixture.nativeElement.innerText).toEqual('newer');
    });

    it('executes render hooks when a new one is registered', async () => {
      let resolveFn: Function;
      let calledPromise = new Promise((resolve) => {
        resolveFn = resolve;
      });
      TestBed.runInInjectionContext(() => {
        afterNextRender(() => {
          resolveFn();
        });
      });
      await expectAsync(calledPromise).toBeResolved();
    });

    it('executes render hooks without refreshing CheckAlways views', async () => {
      let checks = 0;
      @Component({
        template: '',
      })
      class Dummy {
        ngDoCheck() {
          checks++;
        }
      }

      const fixture = TestBed.createComponent(Dummy);
      await fixture.whenStable();
      expect(checks).toBe(1);

      let resolveFn: Function;
      let calledPromise = new Promise((resolve) => {
        resolveFn = resolve;
      });
      TestBed.runInInjectionContext(() => {
        afterNextRender(() => {
          resolveFn();
        });
      });
      await expectAsync(calledPromise).toBeResolved();
      // render hooks was called but component was not refreshed
      expect(checks).toBe(1);
    });
  });

  it('can recover when an error is re-thrown by the ErrorHandler', async () => {
    const val = signal('initial');
    let throwError = false;
    @Component({template: '{{val()}}{{maybeThrow()}}'})
    class TestComponent {
      val = val;
      maybeThrow() {
        if (throwError) {
          throw new Error('e');
        } else {
          return '';
        }
      }
    }
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ErrorHandler,
          useClass: class extends ErrorHandler {
            override handleError(error: any): void {
              throw error;
            }
          },
        },
      ],
    });

    const fixture = await createFixture(TestComponent);
    expect(fixture.nativeElement.innerText).toEqual('initial');

    val.set('new');
    throwError = true;
    // error is thrown in a timeout and can't really be "caught".
    // Still need to wrap in expect so it happens in the expect context and doesn't fail the test.
    expect(async () => await fixture.whenStable()).not.toThrow();
    expect(fixture.nativeElement.innerText).toEqual('initial');

    throwError = false;
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toEqual('new');
  });

  it('change detects embedded view when attached to a host on ApplicationRef and declaration is marked for check', async () => {
    @Component({
      template: '<ng-template #template><div>{{thing}}</div></ng-template>',
    })
    class DynamicCmp {
      @ViewChild('template') templateRef!: TemplateRef<{}>;
      thing = 'initial';
    }
    @Component({
      template: '',
    })
    class Host {
      readonly vcr = inject(ViewContainerRef);
    }

    const fixture = TestBed.createComponent(DynamicCmp);
    const host = createComponent(Host, {environmentInjector: TestBed.inject(EnvironmentInjector)});
    TestBed.inject(ApplicationRef).attachView(host.hostView);
    await fixture.whenStable();

    const embeddedViewRef = fixture.componentInstance.templateRef.createEmbeddedView({});
    host.instance.vcr.insert(embeddedViewRef);
    await fixture.whenStable();
    expect(embeddedViewRef.rootNodes[0].innerHTML).toContain('initial');

    fixture.componentInstance.thing = 'new';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(embeddedViewRef.rootNodes[0].innerHTML).toContain('new');
  });

  it('change detects embedded view when attached directly to ApplicationRef and declaration is marked for check', async () => {
    @Component({
      template: '<ng-template #template><div>{{thing}}</div></ng-template>',
    })
    class DynamicCmp {
      @ViewChild('template') templateRef!: TemplateRef<{}>;
      thing = 'initial';
    }

    const fixture = TestBed.createComponent(DynamicCmp);
    await fixture.whenStable();

    const embeddedViewRef = fixture.componentInstance.templateRef.createEmbeddedView({});
    TestBed.inject(ApplicationRef).attachView(embeddedViewRef);
    await fixture.whenStable();
    expect(embeddedViewRef.rootNodes[0].innerHTML).toContain('initial');

    fixture.componentInstance.thing = 'new';
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(embeddedViewRef.rootNodes[0].innerHTML).toContain('new');
  });

  it('does not fail when global timing functions are patched and unpatched', async () => {
    @Component({template: ''})
    class App {
      cdr = inject(ChangeDetectorRef);
    }

    let patched = false;
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = (handler: any) => {
      if (!patched) {
        throw new Error('no longer patched');
      }
      originalSetTimeout(handler);
    };
    patched = true;
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    global.setTimeout = originalSetTimeout;
    patched = false;
    expect(() => {
      // cause another scheduler notification. This should not fail due to `setTimeout` being
      // unpatched.
      fixture.componentInstance.cdr.markForCheck();
    }).not.toThrow();
    await fixture.whenStable();
  });

  it('should not run change detection twice if manual tick called when CD was scheduled', async () => {
    let changeDetectionRuns = 0;
    TestBed.runInInjectionContext(() => {
      afterEveryRender(() => {
        changeDetectionRuns++;
      });
    });
    @Component({template: ''})
    class MyComponent {
      cdr = inject(ChangeDetectorRef);
    }
    const fixture = TestBed.createComponent(MyComponent);
    await fixture.whenStable();
    expect(changeDetectionRuns).toEqual(1);

    // notify the scheduler
    fixture.componentInstance.cdr.markForCheck();
    // call tick manually
    TestBed.inject(ApplicationRef).tick();
    await fixture.whenStable();
    // ensure we only ran render hook 1 more time rather than once for tick and once for the
    // scheduled run
    expect(changeDetectionRuns).toEqual(2);
  });

  it('coalesces microtasks that happen during change detection into a single paint', async () => {
    if (!isBrowser) {
      return;
    }
    @Component({
      template: '{{thing}}',
    })
    class App {
      thing = 'initial';
      cdr = inject(ChangeDetectorRef);
      ngAfterViewInit() {
        queueMicrotask(() => {
          this.thing = 'new';
          this.cdr.markForCheck();
        });
      }
    }
    const fixture = TestBed.createComponent(App);
    await new Promise<void>((resolve) => scheduleCallbackWithRafRace(resolve));
    expect(fixture.nativeElement.innerText).toContain('new');
  });

  it('throws a nice error when notifications prevent exiting the event loop (infinite CD)', async () => {
    let caughtError: unknown;
    let previousHandle = (Zone.root as any)._zoneDelegate.handleError;
    (Zone.root as any)._zoneDelegate.handleError = (zone: ZoneSpec, e: unknown) => {
      caughtError = e;
    };
    @Component({
      template: '',
    })
    class App {
      cdr = inject(ChangeDetectorRef);
      ngDoCheck() {
        queueMicrotask(() => {
          this.cdr.markForCheck();
        });
      }
    }
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(caughtError).toBeInstanceOf(RuntimeError);
    const runtimeError = caughtError as RuntimeError;
    expect(runtimeError.code).toEqual(RuntimeErrorCode.INFINITE_CHANGE_DETECTION);
    expect(runtimeError.message).toContain('markForCheck');
    expect(runtimeError.message).toContain('notify');

    (Zone.root as any)._zoneDelegate.handleError = previousHandle;
  });

  it('runs inside fakeAsync zone', fakeAsync(() => {
    let didRun = false;
    @Component({template: ''})
    class App {
      ngOnInit() {
        didRun = true;
      }
    }

    TestBed.createComponent(App);
    expect(didRun).toBe(false);
    tick();
    expect(didRun).toBe(true);

    didRun = false;
    TestBed.createComponent(App);
    expect(didRun).toBe(false);
    flush();
    expect(didRun).toBe(true);
  }));

  it('can run inside fakeAsync zone', fakeAsync(() => {
    let didRun = false;
    @Component({template: ''})
    class App {
      ngDoCheck() {
        didRun = true;
      }
    }

    // create component runs inside the zone and triggers CD as a result
    const fixture = TestBed.createComponent(App);
    didRun = false;

    // schedules change detection
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    expect(didRun).toBe(false);
    tick();
    expect(didRun).toBe(true);
  }));
});

describe('Angular with scheduler and ZoneJS', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: ComponentFixtureAutoDetect, useValue: true},
        {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
      ],
    });
  });

  it('requires updates inside Angular zone when using ngZoneOnly', async () => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection({ignoreChangesOutsideZone: true})],
    });
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');

    TestBed.inject(NgZone).runOutsideAngular(() => {
      fixture.componentInstance.thing.set('new');
    });
    expect(fixture.isStable()).toBe(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');
  });

  it('will not schedule change detection if listener callback is outside the zone', async () => {
    let renders = 0;
    TestBed.runInInjectionContext(() => {
      afterEveryRender(() => {
        renders++;
      });
    });

    @Component({selector: 'component-with-output', template: ''})
    class ComponentWithOutput {
      @Output() out = new EventEmitter();
    }
    let called = false;
    @Component({
      imports: [ComponentWithOutput],
      template: '<component-with-output (out)="onOut()" />',
    })
    class App {
      onOut() {
        called = true;
      }
    }
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const outComponent = fixture.debugElement.query(
      (debugNode) => debugNode.providerTokens!.indexOf(ComponentWithOutput) !== -1,
    ).componentInstance as ComponentWithOutput;
    TestBed.inject(NgZone).runOutsideAngular(() => {
      outComponent.out.emit();
    });
    await fixture.whenStable();

    expect(renders).toBe(1);
    expect(called).toBe(true);
    expect(renders).toBe(1);
  });

  it('updating signal outside of zone still schedules update when in hybrid mode', async () => {
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');

    TestBed.inject(NgZone).runOutsideAngular(() => {
      fixture.componentInstance.thing.set('new');
    });
    expect(fixture.isStable()).toBe(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('new');
  });

  it('updating signal in another "Angular" zone schedules update when in hybrid mode', async () => {
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');
    const differentAngularZone: NgZone = Zone.root.run(() => new NgZone({}));
    differentAngularZone.run(() => {
      fixture.componentInstance.thing.set('new');
    });

    expect(fixture.isStable()).toBe(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('new');
  });

  it('updating signal in a child zone of Angular does not schedule extra CD', async () => {
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');
    const childZone = TestBed.inject(NgZone).run(() => Zone.current.fork({name: 'child'}));

    childZone.run(() => {
      fixture.componentInstance.thing.set('new');
      expect(TestBed.inject(ChangeDetectionSchedulerImpl)['cancelScheduledCallback']).toBeNull();
    });
  });

  it('updating signal in a child Angular zone of Angular does not schedule extra CD', async () => {
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerText).toContain('initial');
    const childAngularZone = TestBed.inject(NgZone).run(() => new NgZone({}));

    childAngularZone.run(() => {
      fixture.componentInstance.thing.set('new');
      expect(TestBed.inject(ChangeDetectionSchedulerImpl)['cancelScheduledCallback']).toBeNull();
    });
  });

  it('should not run change detection twice if notified during AppRef.tick', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection({ignoreChangesOutsideZone: false}),
        {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
      ],
    });

    let changeDetectionRuns = 0;
    TestBed.runInInjectionContext(() => {
      afterEveryRender(() => {
        changeDetectionRuns++;
      });
    });
    @Component({template: ''})
    class MyComponent {
      cdr = inject(ChangeDetectorRef);
      ngDoCheck() {
        // notify scheduler every time this component is checked
        this.cdr.markForCheck();
      }
    }
    const fixture = TestBed.createComponent(MyComponent);
    await fixture.whenStable();
    expect(changeDetectionRuns).toEqual(1);

    // call tick manually
    TestBed.inject(ApplicationRef).tick();
    await fixture.whenStable();
    // ensure we only ran render hook 1 more time rather than once for tick and once for the
    // scheduled run
    expect(changeDetectionRuns).toEqual(2);
  });

  it('does not cause double change detection with run coalescing', async () => {
    if (isNode) {
      return;
    }

    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection({runCoalescing: true, ignoreChangesOutsideZone: false}),
      ],
    });
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    let ticks = 0;
    TestBed.runInInjectionContext(() => {
      afterEveryRender(() => {
        ticks++;
      });
    });
    fixture.componentInstance.thing.set('new');
    await fixture.whenStable();
    expect(ticks).toBe(1);
  });

  it('does not cause double change detection with run coalescing when both schedulers are notified', async () => {
    if (isNode) {
      return;
    }

    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection({runCoalescing: true, ignoreChangesOutsideZone: false}),
      ],
    });
    @Component({template: '{{thing()}}'})
    class App {
      thing = signal('initial');
    }
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    let ticks = 0;
    TestBed.runInInjectionContext(() => {
      afterEveryRender(() => {
        ticks++;
      });
    });
    // notifies the zoneless scheduler
    fixture.componentInstance.thing.set('new');
    // notifies the zone scheduler
    TestBed.inject(NgZone).run(() => {});
    await fixture.whenStable();
    expect(ticks).toBe(1);
  });

  it('can run inside fakeAsync zone', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection({scheduleInRootZone: false} as any)],
    });
    let didRun = false;
    @Component({template: ''})
    class App {
      ngDoCheck() {
        didRun = true;
      }
    }

    // create component runs inside the zone and triggers CD as a result
    const fixture = TestBed.createComponent(App);
    didRun = false;

    // schedules change detection
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    expect(didRun).toBe(false);
    tick();
    expect(didRun).toBe(true);
  }));
});
