/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
import {
  Component,
  createEnvironmentInjector,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('DestroyRef', () => {
  describe('for environnement injector', () => {
    it('should inject cleanup context in services', () => {
      let destroyed = false;
      const envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      envInjector.get(DestroyRef).onDestroy(() => (destroyed = true));
      expect(destroyed).toBe(false);

      envInjector.destroy();
      expect(destroyed).toBe(true);
    });

    it('should allow removal of destroy callbacks', () => {
      let destroyed = false;
      const envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      const unRegFn = envInjector.get(DestroyRef).onDestroy(() => (destroyed = true));
      expect(destroyed).toBe(false);

      // explicitly unregister before destroy
      unRegFn();
      envInjector.destroy();
      expect(destroyed).toBe(false);
    });

    it('should removal single destroy callback if many identical ones are registered', () => {
      let onDestroyCalls = 0;
      const onDestroyCallback = () => onDestroyCalls++;
      const envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      const destroyRef = envInjector.get(DestroyRef);

      // Register the same fn 3 times:
      const unregFn = destroyRef.onDestroy(onDestroyCallback);
      destroyRef.onDestroy(onDestroyCallback);
      destroyRef.onDestroy(onDestroyCallback);

      // Unregister the fn 1 time:
      unregFn();

      envInjector.destroy();

      // Check that the callback was invoked only 2 times
      // (since we've unregistered one of the callbacks)
      expect(onDestroyCalls).toBe(2);
    });

    it('should throw when trying to register destroy callback on destroyed injector', () => {
      const envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      const destroyRef = envInjector.get(DestroyRef);

      envInjector.destroy();

      expect(() => {
        destroyRef.onDestroy(() => {});
      }).toThrowError('NG0205: Injector has already been destroyed.');
    });
  });

  describe('for node injector', () => {
    it('should inject cleanup context in components', () => {
      let destroyed = false;

      @Component({
        selector: 'test',
        template: ``,
      })
      class TestCmp {
        constructor(destroyCtx: DestroyRef) {
          destroyCtx.onDestroy(() => (destroyed = true));
        }
      }

      const fixture = TestBed.createComponent(TestCmp);
      expect(destroyed).toBe(false);

      fixture.componentRef.destroy();
      expect(destroyed).toBe(true);
    });

    it('should allow using cleanup context with views that store cleanup internally', () => {
      let destroyed = false;

      @Directive({
        selector: '[withCleanup]',
      })
      class WithCleanupDirective {
        constructor() {
          inject(DestroyRef).onDestroy(() => (destroyed = true));
        }
      }

      @Component({
        selector: 'test',
        imports: [WithCleanupDirective],
        // note: we are trying to register a LView-level cleanup _before_ TView-level one (event
        // listener)
        template: `<div withCleanup></div><button (click)="noop()"></button>`,
      })
      class TestCmp {
        noop() {}
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(destroyed).toBe(false);

      fixture.componentRef.destroy();
      expect(destroyed).toBe(true);
    });

    it('should scope destroy context to a view level', () => {
      let destroyed = false;

      @Directive({
        selector: '[withCleanup]',
      })
      class WithCleanupDirective {
        constructor() {
          inject(DestroyRef).onDestroy(() => (destroyed = true));
        }
      }

      @Component({
        selector: 'test',
        imports: [WithCleanupDirective, NgIf],
        template: `<ng-template [ngIf]="show"><div withCleanup></div></ng-template>`,
      })
      class TestCmp {
        show = true;
      }

      const fixture = TestBed.createComponent(TestCmp);
      fixture.detectChanges();
      expect(destroyed).toBe(false);

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(destroyed).toBe(true);
    });

    it('can inject into a child component', () => {
      const onDestroySpy = jasmine.createSpy('destroy spy');
      @Component({
        selector: 'child',
        template: '',
      })
      class Child {
        constructor() {
          inject(DestroyRef).onDestroy(onDestroySpy);
        }
      }
      @Component({
        imports: [Child, NgIf],
        template: '<child *ngIf="showChild"></child>',
      })
      class Parent {
        showChild = true;
      }
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(onDestroySpy).not.toHaveBeenCalled();
      fixture.componentInstance.showChild = false;
      fixture.detectChanges();
      expect(onDestroySpy).toHaveBeenCalled();
    });
  });

  it('should allow removal of view-scoped destroy callbacks', () => {
    let destroyed = false;

    @Component({
      selector: 'test',
      template: ``,
    })
    class TestCmp {
      unRegFn: () => void;
      constructor(destroyCtx: DestroyRef) {
        this.unRegFn = destroyCtx.onDestroy(() => (destroyed = true));
      }
    }

    const fixture = TestBed.createComponent(TestCmp);
    expect(destroyed).toBe(false);

    // explicitly unregister before destroy
    fixture.componentInstance.unRegFn();

    fixture.componentRef.destroy();
    expect(destroyed).toBe(false);
  });

  it('should removal single destroy callback if many identical ones are registered', () => {
    let onDestroyCalls = 0;
    const onDestroyCallback = () => onDestroyCalls++;

    @Component({
      selector: 'test',
      template: ``,
    })
    class TestCmp {
      unRegFn: () => void;
      constructor(destroyCtx: DestroyRef) {
        // Register the same fn 3 times:
        this.unRegFn = destroyCtx.onDestroy(onDestroyCallback);
        this.unRegFn = destroyCtx.onDestroy(onDestroyCallback);
        this.unRegFn = destroyCtx.onDestroy(onDestroyCallback);
      }
    }

    const fixture = TestBed.createComponent(TestCmp);
    expect(onDestroyCalls).toBe(0);

    // explicitly unregister 1-time before destroy
    fixture.componentInstance.unRegFn();

    fixture.componentRef.destroy();
    // Check that the callback was invoked only 2 times
    // (since we've unregistered one of the callbacks)
    expect(onDestroyCalls).toBe(2);
  });

  it('should allow unregistration while destroying', () => {
    const destroyedLog: string[] = [];

    @Component({
      selector: 'test',
      template: ``,
    })
    class TestCmp {
      constructor(destroyCtx: DestroyRef) {
        const unregister = destroyCtx.onDestroy(() => {
          destroyedLog.push('first');
          unregister();
        });
        destroyCtx.onDestroy(() => {
          destroyedLog.push('second');
        });
      }
    }

    const fixture = TestBed.createComponent(TestCmp);
    expect(destroyedLog).toEqual([]);

    fixture.componentRef.destroy();
    expect(destroyedLog).toEqual(['first', 'second']);
  });
});
