/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgIf} from '@angular/common';
import {Component, createEnvironmentInjector, DestroyRef, Directive, EnvironmentInjector, inject} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('DestroyRef', () => {
  describe('for environnement injector', () => {
    it('should inject cleanup context in services', () => {
      let destroyed = false;
      const envInjector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));

      envInjector.get(DestroyRef).onDestroy(() => destroyed = true);
      expect(destroyed).toBe(false);

      envInjector.destroy();
      expect(destroyed).toBe(true);
    });
  });

  describe('for node injector', () => {
    it('should inject cleanup context in components', () => {
      let destroyed = false;

      @Component({
        selector: 'test',
        standalone: true,
        template: ``,
      })
      class TestCmp {
        constructor(destroyCtx: DestroyRef) {
          destroyCtx.onDestroy(() => destroyed = true);
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
        standalone: true,
      })
      class WithCleanupDirective {
        constructor() {
          inject(DestroyRef).onDestroy(() => destroyed = true);
        }
      }

      @Component({
        selector: 'test',
        standalone: true,
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
        standalone: true,
      })
      class WithCleanupDirective {
        constructor() {
          inject(DestroyRef).onDestroy(() => destroyed = true);
        }
      }

      @Component({
        selector: 'test',
        standalone: true,
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
        standalone: true,
        template: '',
      })
      class Child {
        constructor() {
          inject(DestroyRef).onDestroy(onDestroySpy);
        }
      }
      @Component({
        standalone: true,
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
});
