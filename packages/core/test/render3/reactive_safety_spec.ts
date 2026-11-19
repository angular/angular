/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {of} from 'rxjs';
import {getActiveConsumer} from '../../primitives/signals';
import {
  computed,
  Component,
  Directive,
  createComponent,
  createEnvironmentInjector,
  effect,
  ENVIRONMENT_INITIALIZER,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  Output,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {createInjector} from '../../src/di/create_injector';
import {toSignal} from '../../rxjs-interop';
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

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      expectNotToThrowInReactiveContext(() => {
        createComponent(TestCmp, {environmentInjector});
      });
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
        fix.changeDetectorRef.detectChanges();
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

    it('should be safe to inject a node-level provider', () => {
      @Injectable()
      class Service {
        constructor() {
          expect(getActiveConsumer()).toBe(null);
        }
      }

      @Component({template: '', providers: [Service]})
      class TestCmp {
        injector = inject(Injector);
      }

      const fix = TestBed.createComponent(TestCmp);
      expectNotToThrowInReactiveContext(() => fix.componentInstance.injector.get(Service));
    });

    it('should be safe to inject a node-level provider during the update pass', () => {
      @Injectable()
      class Service {
        label = signal('');
        constructor() {
          this.label.set('service');
        }
      }

      @Component({template: '{{ label }}', providers: [Service]})
      class TestCmp {
        private injector = inject(Injector);

        get label() {
          return this.injector.get(Service).label();
        }
      }

      const fix = TestBed.createComponent(TestCmp);
      expect(() => fix.detectChanges()).not.toThrow();
      expect(fix.nativeElement.textContent).toBe('service');
    });

    it('should be safe to inject a view provider created with a factory', () => {
      const token = new InjectionToken<string>('');

      @Directive({
        selector: '[child]',
      })
      class Child {
        injector = inject(Injector);
      }

      @Component({
        imports: [Child],
        template: '<div child></div>',
        viewProviders: [
          {
            provide: token,
            useFactory: () => {
              expect(getActiveConsumer()).toBe(null);
              return 'value';
            },
          },
        ],
      })
      class TestCmp {
        @ViewChild(Child) child!: Child;
      }

      const fix = TestBed.createComponent(TestCmp);
      fix.detectChanges();

      const child = fix.componentInstance.child;
      expectNotToThrowInReactiveContext(() => {
        expect(child.injector.get(token)).toBe('value');
      });
    });

    it('should be safe to call toSignal in a node-level provider field initializer', () => {
      @Injectable()
      class Service {
        value = toSignal(of('sync'), {requireSync: true});
      }

      @Component({template: '{{ value }}', providers: [Service]})
      class TestCmp {
        private injector = inject(Injector);

        get value() {
          return this.injector.get(Service).value();
        }
      }

      const fix = TestBed.createComponent(TestCmp);
      expect(() => fix.detectChanges()).not.toThrow();
      expect(fix.nativeElement.textContent).toBe('sync');
    });

    it('should not track signals read while creating a node-level provider', () => {
      const source = signal('a');
      let computations = 0;

      @Injectable()
      class Service {
        value = source();
      }

      @Component({template: '', providers: [Service]})
      class TestCmp {
        injector = inject(Injector);
      }

      const fix = TestBed.createComponent(TestCmp);
      const value = computed(() => {
        computations++;
        return fix.componentInstance.injector.get(Service).value;
      });

      expect(value()).toBe('a');
      expect(computations).toBe(1);

      source.set('b');

      expect(value()).toBe('a');
      expect(computations).toBe(1);
    });

    it('should restore the reactive context after creating a node-level provider', () => {
      const tracked = signal('a');
      let computations = 0;

      @Injectable()
      class Service {}

      @Component({template: '', providers: [Service]})
      class TestCmp {
        injector = inject(Injector);
      }

      const fix = TestBed.createComponent(TestCmp);
      const value = computed(() => {
        computations++;
        fix.componentInstance.injector.get(Service);
        return tracked();
      });

      expect(value()).toBe('a');
      expect(computations).toBe(1);

      tracked.set('b');

      expect(value()).toBe('b');
      expect(computations).toBe(2);
    });

    it('should restore the reactive context when a node-level provider throws', () => {
      const tracked = signal('a');
      let computations = 0;

      @Injectable()
      class Failing {
        constructor() {
          throw new Error('cannot construct');
        }
      }

      @Component({template: '', providers: [Failing]})
      class TestCmp {
        injector = inject(Injector);
      }

      const fix = TestBed.createComponent(TestCmp);
      const value = computed(() => {
        computations++;
        expect(() => fix.componentInstance.injector.get(Failing)).toThrowError(/cannot construct/);
        return tracked();
      });

      expect(value()).toBe('a');
      expect(computations).toBe(1);

      tracked.set('b');

      expect(value()).toBe('b');
      expect(computations).toBe(2);
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
