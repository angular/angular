/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {PLATFORM_BROWSER_ID} from '@angular/common/src/platform_id';
import {ApplicationRef, ChangeDetectorRef, Component, ComponentRef, createComponent, DebugElement, destroyPlatform, ElementRef, EnvironmentInjector, ErrorHandler, getDebugNode, inject, Injectable, Input, NgZone, PLATFORM_ID, signal, TemplateRef, Type, ViewChild, ViewContainerRef, ɵprovideZonelessChangeDetection as provideZonelessChangeDetection} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {TestBed} from '@angular/core/testing';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {filter, take, tap} from 'rxjs/operators';

describe('Angular with NoopNgZone', () => {
  function whenStable(applicationRef = TestBed.inject(ApplicationRef)): Promise<boolean> {
    return firstValueFrom(applicationRef.isStable.pipe(filter(stable => stable)));
  }

  function isStable(injector = TestBed.inject(EnvironmentInjector)): boolean {
    return toSignal(injector.get(ApplicationRef).isStable, {requireSync: true, injector})();
  }

  async function createAndAttachComponent<T>(type: Type<T>): Promise<ComponentRef<T>> {
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const component = createComponent(type, {environmentInjector});
    environmentInjector.get(ApplicationRef).attachView(component.hostView);
    expect(isStable()).toBeFalse();
    await whenStable();
    return component;
  }

  describe('notifies scheduler', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
    });

    it('contributes to application stableness', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}', standalone: true})
      class TestComponent {
        val = val;
      }
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const component = createComponent(TestComponent, {environmentInjector});
      const appRef = environmentInjector.get(ApplicationRef);

      appRef.attachView(component.hostView);
      expect(isStable()).toBeFalse();

      // Cause another pending CD immediately after render and verify app has not stabilized
      await whenStable().then(() => {
        val.set('new');
      });
      expect(isStable()).toBeFalse();

      await whenStable();
      expect(isStable()).toBeTrue();
    });

    it('when signal updates', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}', standalone: true})
      class TestComponent {
        val = val;
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      val.set('new');
      expect(isStable()).toBeFalse();
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('when using markForCheck()', async () => {
      @Component({template: '{{val}}', standalone: true})
      class TestComponent {
        cdr = inject(ChangeDetectorRef);
        val = 'initial';
        setVal(val: string) {
          this.val = val;
          this.cdr.markForCheck();
        }
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      component.instance.setVal('new');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('on input binding', async () => {
      @Component({template: '{{val}}', standalone: true})
      class TestComponent {
        @Input() val = 'initial';
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      component.setInput('val', 'new');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('on event listener bound in template', async () => {
      @Component({template: '<div (click)="updateVal()">{{val}}</div>', standalone: true})
      class TestComponent {
        val = 'initial';

        updateVal() {
          this.val = 'new';
        }
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      getDebugElement(component)
          .query(p => p.nativeElement.tagName === 'DIV')
          .triggerEventHandler('click');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('on event listener bound in host', async () => {
      @Component({host: {'(click)': 'updateVal()'}, template: '{{val}}', standalone: true})
      class TestComponent {
        val = 'initial';

        updateVal() {
          this.val = 'new';
        }
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      getDebugElement(component).triggerEventHandler('click');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('with async pipe', async () => {
      @Component({template: '{{val | async}}', standalone: true, imports: [AsyncPipe]})
      class TestComponent {
        val = new BehaviorSubject('initial');
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      component.instance.val.next('new');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('new');
    });

    it('when creating a view', async () => {
      @Component({
        template: '<ng-template #ref>{{"binding"}}</ng-template>',
        standalone: true,
      })
      class TestComponent {
        @ViewChild(TemplateRef) template!: TemplateRef<unknown>;
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;

        createView(): any {
          this.viewContainer.createEmbeddedView(this.template);
        }
      }

      const component = await createAndAttachComponent(TestComponent);

      component.instance.createView();
      expect(isStable()).toBe(false);
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('binding');
    });

    it('when inserting a view', async () => {
      @Component({
        template: '{{"binding"}}',
        standalone: true,
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }
      @Component({
        template: '<ng-template #ref></ng-template>',
        standalone: true,
      })
      class TestComponent {
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      }

      const componentRef = await createAndAttachComponent(TestComponent);

      const otherComponent =
          createComponent(DynamicCmp, {environmentInjector: TestBed.inject(EnvironmentInjector)});
      componentRef.instance.viewContainer.insert(otherComponent.hostView);
      expect(isStable()).toBe(false);
      await whenStable();
      expect(componentRef.location.nativeElement.innerText).toEqual('binding');
    });

    it('when destroying a view (with animations)', async () => {
      @Component({
        template: '{{"binding"}}',
        standalone: true,
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }
      @Component({
        template: '<ng-template #ref></ng-template>',
        standalone: true,
      })
      class TestComponent {
        @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
      }

      const fixture = await createAndAttachComponent(TestComponent);
      const component =
          createComponent(DynamicCmp, {environmentInjector: TestBed.inject(EnvironmentInjector)});

      fixture.instance.viewContainer.insert(component.hostView);
      await whenStable();
      expect(fixture.location.nativeElement.innerText).toEqual('binding');
      fixture.instance.viewContainer.remove();
      await whenStable();
      expect(fixture.location.nativeElement.innerText).toEqual('');

      const component2 =
          createComponent(DynamicCmp, {environmentInjector: TestBed.inject(EnvironmentInjector)});
      fixture.instance.viewContainer.insert(component2.hostView);
      await whenStable();
      expect(fixture.location.nativeElement.innerText).toEqual('binding');
      component2.destroy();
      expect(isStable()).toBe(false);
      await whenStable();
      expect(fixture.location.nativeElement.innerText).toEqual('');
    });

    it('when destroying a view (*no* animations)', withBody('<app></app>', async () => {
         destroyPlatform();
         @Component({
           template: '{{"binding"}}',
           standalone: true,
         })
         class DynamicCmp {
           elementRef = inject(ElementRef);
         }
         @Component({
           selector: 'app',
           template: '<ng-template #ref></ng-template>',
           standalone: true,
         })
         class App {
           @ViewChild('ref', {read: ViewContainerRef}) viewContainer!: ViewContainerRef;
         }
         const applicationRef = await bootstrapApplication(App, {
           providers: [
             provideZonelessChangeDetection(),
             {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
           ]
         });
         const appViewRef = (applicationRef as any)._views[0] as {context: App, rootNodes: any[]};
         await whenStable(applicationRef);

         const component2 =
             createComponent(DynamicCmp, {environmentInjector: applicationRef.injector});
         appViewRef.context.viewContainer.insert(component2.hostView);
         expect(isStable(applicationRef.injector)).toBe(false);
         await whenStable(applicationRef);
         component2.destroy();
         expect(isStable(applicationRef.injector)).toBe(true);
         expect(appViewRef.rootNodes[0].innerText).toEqual('');
         destroyPlatform();
       }));

    it('when attaching view to ApplicationRef', async () => {
      @Component({
        selector: 'dynamic-cmp',
        template: '{{"binding"}}',
        standalone: true,
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
      // TODO(atscott): Only needed because renderFactory will not run if ApplicationRef has no
      // views This should likely be fixed in ApplicationRef
      appRef.attachView(component2.hostView);
      appRef.detachView(component.hostView);
      // DOM is not synchronously removed because change detection hasn't run
      expect(host.innerHTML).toEqual('<dynamic-cmp>binding</dynamic-cmp>');
      expect(isStable()).toBe(false);
      await whenStable();
      expect(host.innerHTML).toEqual('');
      host.appendChild(component.instance.elementRef.nativeElement);
      // reattaching non-dirty view does not notify scheduler
      appRef.attachView(component.hostView);
      expect(isStable()).toBe(true);
    });

    it('when a stable subscription synchronously causes another notification', async () => {
      const val = signal('initial');
      @Component({template: '{{val()}}', standalone: true})
      class TestComponent {
        val = val;
      }

      const component = await createAndAttachComponent(TestComponent);
      expect(component.location.nativeElement.innerText).toEqual('initial');

      val.set('new');
      await TestBed.inject(ApplicationRef)
          .isStable
          .pipe(
              filter(stable => stable),
              take(1),
              tap(() => val.set('newer')),
              )
          .toPromise();
      await whenStable();
      expect(component.location.nativeElement.innerText).toEqual('newer');
    });
  });

  it('can recover when an error is re-thrown by the ErrorHandler', async () => {
    const val = signal('initial');
    let throwError = false;
    @Component({template: '{{val()}}{{maybeThrow()}}', standalone: true})
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
        provideZonelessChangeDetection(),
        {
          provide: ErrorHandler, useClass: class extends ErrorHandler {
            override handleError(error: any): void {
              throw error;
            }
          }
        },
      ]
    });

    const component = await createAndAttachComponent(TestComponent);
    expect(component.location.nativeElement.innerText).toEqual('initial');

    val.set('new');
    throwError = true;
    // error is thrown in a timeout and can't really be "caught".
    // Still need to wrap in expect so it happens in the expect context and doesn't fail the test.
    expect(async () => await whenStable()).not.toThrow();
    expect(component.location.nativeElement.innerText).toEqual('initial');

    throwError = false;
    await whenStable();
    expect(component.location.nativeElement.innerText).toEqual('new');
  });
});


function getDebugElement(component: ComponentRef<unknown>) {
  return getDebugNode(component.location.nativeElement) as DebugElement;
}
