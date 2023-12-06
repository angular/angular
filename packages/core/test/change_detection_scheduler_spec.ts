/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncPipe} from '@angular/common';
import {PLATFORM_BROWSER_ID} from '@angular/common/src/platform_id';
import {afterNextRender, ApplicationRef, ChangeDetectorRef, Component, ComponentRef, createComponent, DebugElement, ElementRef, EnvironmentInjector, ErrorHandler, getDebugNode, inject, Injectable, Input, NgZone, PLATFORM_ID, signal, TemplateRef, Type, ViewChild, ViewContainerRef, ɵChangeDetectionScheduler as ChangeDetectionScheduler, ɵNoopNgZone} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
class ChangeDetectionSchedulerImpl implements ChangeDetectionScheduler {
  private appRef = inject(ApplicationRef);
  private _hasPendingChangeDetection = false;
  get hasPendingChangeDetection() {
    return this._hasPendingChangeDetection;
  }

  notify(): void {
    if (this._hasPendingChangeDetection) return;

    this._hasPendingChangeDetection = true;
    setTimeout(() => {
      try {
        this.appRef.tick();
      } finally {
        this._hasPendingChangeDetection = false;
      }
    });
  }
}


describe('Angular with NoopNgZone', () => {
  function nextRender(): Promise<void> {
    const injector = TestBed.inject(EnvironmentInjector);
    return new Promise((resolve) => {
      afterNextRender(resolve, {injector});
    });
  }

  async function createAndAttachComponent<T>(type: Type<T>): Promise<ComponentRef<T>> {
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const component = createComponent(type, {environmentInjector});
    environmentInjector.get(ApplicationRef).attachView(component.hostView);
    await nextRender();
    return component;
  }

  describe('notifies scheduler', () => {
    let scheduler: ChangeDetectionSchedulerImpl;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: NgZone, useClass: ɵNoopNgZone},
          {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
          {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
        ]
      });
      scheduler = TestBed.inject(ChangeDetectionSchedulerImpl);
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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
      expect(scheduler.hasPendingChangeDetection).toBe(false);

      component.instance.createView();
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
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

      const fixture = await createAndAttachComponent(TestComponent);
      expect(scheduler.hasPendingChangeDetection).toBe(false);

      const component =
          createComponent(DynamicCmp, {environmentInjector: TestBed.inject(EnvironmentInjector)});
      fixture.instance.viewContainer.insert(component.hostView);
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
      expect(fixture.location.nativeElement.innerText).toEqual('binding');
    });

    it('when attaching view to ApplicationRef', async () => {
      @Component({
        template: '{{"binding"}}',
        standalone: true,
      })
      class DynamicCmp {
        elementRef = inject(ElementRef);
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const appRef = TestBed.inject(ApplicationRef);
      const component = createComponent(DynamicCmp, {environmentInjector});
      expect(scheduler.hasPendingChangeDetection).toBe(false);
      expect(component.instance.elementRef.nativeElement.innerText).toEqual('');

      appRef.attachView(component.hostView);
      expect(scheduler.hasPendingChangeDetection).toBe(true);
      await nextRender();
      expect(component.instance.elementRef.nativeElement.innerText).toEqual('binding');

      // Don't need to run CD on detach because DOM nodes are just removed
      // That said, queries need to be updated and currently only update during CD but that's an
      // unrelated change that needs to happen.
      appRef.detachView(component.hostView);
      expect(scheduler.hasPendingChangeDetection).toBe(false);
      // reattaching non-dirty view does not notify scheduler
      appRef.attachView(component.hostView);
      expect(scheduler.hasPendingChangeDetection).toBe(false);
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
        {provide: NgZone, useClass: ɵNoopNgZone},
        {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
        {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
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
    expect(async () => await nextRender()).not.toThrow();
    expect(component.location.nativeElement.innerText).toEqual('initial');

    throwError = false;
    await nextRender();
    expect(component.location.nativeElement.innerText).toEqual('new');
  });
});


function getDebugElement(component: ComponentRef<unknown>) {
  return getDebugNode(component.location.nativeElement) as DebugElement;
}
