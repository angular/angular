/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  ComponentFactoryResolver,
  createComponent,
  createEnvironmentInjector,
  effect,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Injectable,
  InjectionToken,
  NgModule,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {getActiveConsumer} from '../../primitives/signals';
import {createInjector} from '../../src/di/create_injector';
import {TestBed} from '../../testing';

/*
 * Contains tests which validate that certain actions within the framework (for example, creating
 * new views) are automatically "untracked" when started in a reactive context.
 */

describe('reactive safety', () => {
  describe('view creation', () => {
    it('should be safe to call ViewContainerRef.createEmbeddedView', () => {
      @Component({
        template: `<ng-template #tmpl>Template</ng-template>`,
      })
      class TestCmp {
        vcr = inject(ViewContainerRef);
        @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;
      }

      const fix = TestBed.createComponent(TestCmp);
      fix.detectChanges();
      const cmp = fix.componentInstance;
      expectNotToThrowInReactiveContext(() => cmp.vcr.createEmbeddedView(cmp.tmpl));
    });

    it('should be safe to call TemplateRef.create', () => {
      @Component({
        template: `<ng-template #tmpl>Template</ng-template>`,
      })
      class TestCmp {
        @ViewChild('tmpl', {read: TemplateRef}) tmpl!: TemplateRef<unknown>;
      }

      const fix = TestBed.createComponent(TestCmp);
      fix.detectChanges();
      const cmp = fix.componentInstance;
      expectNotToThrowInReactiveContext(() => cmp.tmpl.createEmbeddedView(cmp.tmpl));
    });

    it('should be safe to call createComponent', () => {
      @Component({
        template: '',
      })
      class TestCmp {
        constructor() {
          expect(getActiveConsumer()).toBe(null);
        }
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      expectNotToThrowInReactiveContext(() => createComponent(TestCmp, {environmentInjector}));
    });

    it('should be safe to call ComponentFactory.create()', () => {
      @Component({
        template: '',
      })
      class TestCmp {
        constructor() {
          expect(getActiveConsumer()).toBe(null);
        }
      }

      const injector = TestBed.inject(EnvironmentInjector);
      const resolver = TestBed.inject(ComponentFactoryResolver);
      const factory = resolver.resolveComponentFactory(TestCmp);
      expectNotToThrowInReactiveContext(() => factory.create(injector));
    });

    it('should be safe to flip @if to true', () => {
      @Component({
        template: `
          @if (cond) {
            (creating this view should not throw)
          }
        `,
      })
      class TestCmp {
        cond = false;
      }

      const fix = TestBed.createComponent(TestCmp);
      fix.detectChanges();
      expectNotToThrowInReactiveContext(() => {
        fix.componentInstance.cond = true;
        fix.detectChanges();
      });
    });
  });

  describe('view destruction', () => {
    it('should be safe to destroy a ComponentRef', () => {
      @Component({
        template: '',
      })
      class HostCmp {
        vcr = inject(ViewContainerRef);
      }

      @Component({
        template: '',
      })
      class GuestCmp {
        ngOnDestroy(): void {
          expect(getActiveConsumer()).toBe(null);
        }
      }

      const fix = TestBed.createComponent(HostCmp);
      const guest = fix.componentInstance.vcr.createComponent(GuestCmp);
      fix.detectChanges();
      expectNotToThrowInReactiveContext(() => expect(() => guest.destroy()));
    });
  });

  describe('dependency injection', () => {
    it('should be safe to inject a provided service', () => {
      @Injectable()
      class Service {
        constructor() {
          expect(getActiveConsumer()).toBe(null);
        }
      }

      const injector = createEnvironmentInjector([Service], TestBed.inject(EnvironmentInjector));
      expectNotToThrowInReactiveContext(() => injector.get(Service));
    });

    it('should be safe to inject a token provided with a factory', () => {
      const token = new InjectionToken<string>('');
      const injector = createEnvironmentInjector(
        [
          {
            provide: token,
            useFactory: () => {
              expect(getActiveConsumer()).toBe(null);
              return '';
            },
          },
        ],
        TestBed.inject(EnvironmentInjector),
      );
      expectNotToThrowInReactiveContext(() => injector.get(token));
    });

    it('should be safe to use an ENVIRONMENT_INITIALIZER', () => {
      expectNotToThrowInReactiveContext(() =>
        createEnvironmentInjector(
          [
            {
              provide: ENVIRONMENT_INITIALIZER,
              useValue: () => expect(getActiveConsumer()).toBe(null),
              multi: true,
            },
          ],
          TestBed.inject(EnvironmentInjector),
        ),
      );
    });

    it('should be safe to use an NgModule initializer', () => {
      @NgModule({})
      class TestModule {
        constructor() {
          expect(getActiveConsumer()).toBe(null);
        }
      }
      expectNotToThrowInReactiveContext(() =>
        createInjector(TestModule, TestBed.inject(EnvironmentInjector)),
      );
    });

    it('should be safe to destroy an injector', () => {
      @Injectable()
      class Service {
        ngOnDestroy(): void {
          expect(getActiveConsumer()).toBe(null);
        }
      }
      const injector = createEnvironmentInjector([Service], TestBed.inject(EnvironmentInjector));
      injector.get(Service);
      expectNotToThrowInReactiveContext(() => injector.destroy());
    });
  });

  describe('outputs', () => {
    it('should be safe to emit an output', () => {
      @Component({
        template: '',
      })
      class TestCmp {
        @Output() output = new EventEmitter<string>();
      }

      const cmp = TestBed.createComponent(TestCmp).componentInstance;
      cmp.output.subscribe(() => {
        expect(getActiveConsumer()).toBe(null);
      });
      expectNotToThrowInReactiveContext(() => cmp.output.emit(''));
    });
  });
});

function expectNotToThrowInReactiveContext(fn: () => void): void {
  const injector = TestBed.inject(EnvironmentInjector);
  effect(
    () => {
      expect(fn).not.toThrow();
    },
    {injector},
  );
  TestBed.tick();
}
