/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '../../testing';

import {
  Component,
  createEnvironmentInjector,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  NgModule,
  Type,
  ViewContainerRef,
  ɵɵdefineInjectable,
  ɵɵinject,
} from '../../src/core';
import {forwardRef} from '../../src/di/forward_ref';
import {ɵɵgetInheritedFactory} from '../../src/render3/index';
import {getInjector} from '../../src/render3/util/discovery_utils';

import {expectProvidersScenario} from './providers_helper';

describe('providers', () => {
  describe('should support all types of Provider:', () => {
    abstract class Greeter {
      abstract greet: string;
    }

    const GREETER = new InjectionToken<Greeter>('greeter');

    class GreeterClass implements Greeter {
      greet = 'Class';
      hasBeenCleanedUp = false;

      ngOnDestroy() {
        this.hasBeenCleanedUp = true;
      }
    }

    class GreeterDeps implements Greeter {
      constructor(public greet: string) {}
    }

    class GreeterBuiltInDeps implements Greeter {
      public greet: string;
      constructor(
        private message: string,
        private elementRef: ElementRef,
      ) {
        this.greet = this.message + ' from ' + this.elementRef.nativeElement.tagName;
      }
    }

    class GreeterProvider {
      provide() {
        return 'Provided';
      }
    }

    @Injectable()
    class GreeterInj implements Greeter {
      public greet: string;
      constructor(private provider: GreeterProvider) {
        this.greet = this.provider.provide();
      }

      static ɵprov = ɵɵdefineInjectable({
        token: GreeterInj,
        factory: () => new GreeterInj(ɵɵinject(GreeterProvider as any)),
      });
    }

    it('TypeProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass],
          componentAssertion: () => {
            expect(inject(GreeterClass).greet).toEqual('Class');
          },
        },
      });
    });

    it('ValueProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Value');
          },
        },
      });
    });

    it('ClassProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useClass: GreeterClass}],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Class');
          },
        },
      });
    });

    it('ExistingProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useExisting: GreeterClass}],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Class');
          },
        },
      });
    });

    it('FactoryProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useFactory: () => new GreeterClass()}],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Class');
          },
        },
      });
    });

    const MESSAGE = new InjectionToken<string>('message');

    it('ClassProvider with deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useClass: GreeterDeps, deps: [MESSAGE]},
          ],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Message');
          },
        },
      });
    });

    it('ClassProvider with built-in deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useClass: GreeterBuiltInDeps, deps: [MESSAGE, ElementRef]},
          ],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Message from PARENT');
          },
        },
      });
    });

    it('FactoryProvider with deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useFactory: (msg: string) => new GreeterDeps(msg), deps: [MESSAGE]},
          ],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Message');
          },
        },
      });
    });

    it('FactoryProvider with built-in deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {
              provide: GREETER,
              useFactory: (msg: string, elementRef: ElementRef) =>
                new GreeterBuiltInDeps(msg, elementRef),
              deps: [MESSAGE, ElementRef],
            },
          ],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Message from PARENT');
          },
        },
      });
    });

    it('ClassProvider with injectable', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterProvider, {provide: GREETER, useClass: GreeterInj}],
          componentAssertion: () => {
            expect(inject(GREETER).greet).toEqual('Provided');
          },
        },
      });
    });

    describe('forwardRef', () => {
      it('forwardRef resolves later', (done) => {
        setTimeout(() => {
          expectProvidersScenario({
            parent: {
              providers: [forwardRef(() => ForLater)],
              componentAssertion: () => {
                expect(inject(ForLater) instanceof ForLater).toBeTruthy();
              },
            },
          });
          done();
        }, 0);
      });

      class ForLater {}

      // The following test that forwardRefs are called, so we don't search for an anon fn
      it('ValueProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers: [
              {
                provide: GREETER,
                useValue: forwardRef(() => {
                  return {greet: 'Value'};
                }),
              },
            ],
            componentAssertion: () => {
              expect(inject(GREETER).greet).toEqual('Value');
            },
          },
        });
      });

      it('ClassProvider wrapped in forwardRef', () => {
        let greeterInstance: GreeterClass | null = null;

        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useClass: forwardRef(() => GreeterClass)}],
            componentAssertion: () => {
              greeterInstance = inject(GREETER) as GreeterClass;
              expect(greeterInstance.greet).toEqual('Class');
            },
          },
        });

        expect(greeterInstance).not.toBeNull();
        expect(greeterInstance!.hasBeenCleanedUp).toBe(true);
      });

      it('ExistingProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers: [
              GreeterClass,
              {provide: GREETER, useExisting: forwardRef(() => GreeterClass)},
            ],
            componentAssertion: () => {
              expect(inject(GREETER).greet).toEqual('Class');
            },
          },
        });
      });

      it('@Inject annotation wrapped in forwardRef', () => {
        // @Inject(forwardRef(() => GREETER))
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
            componentAssertion: () => {
              expect(inject(forwardRef(() => GREETER)).greet).toEqual('Value');
            },
          },
        });
      });
    });
  });

  /*
   * All tests below assume this structure:
   * ```
   * <parent>
   *   <#VIEW#>
   *     <view-child>
   *     </view-child>
   *   </#VIEW#>
   *   <content-child>
   *   </content-child>
   * </parent>
   * ```
   */

  describe('override rules:', () => {
    it('directiveProviders should override providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: String, useValue: 'Message 1'}],
          directiveProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('viewProviders should override providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('viewProviders should override directiveProviders', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('last declared directive should override other directives', () => {
      expectProvidersScenario({
        parent: {
          directive2Providers: [{provide: String, useValue: 'Message 1'}],
          directiveProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('last provider should override previous one in component providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: String, useValue: 'Message 1'},
            {provide: String, useValue: 'Message 2'},
          ],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('last provider should override previous one in component view providers', () => {
      expectProvidersScenario({
        parent: {
          viewProviders: [
            {provide: String, useValue: 'Message 1'},
            {provide: String, useValue: 'Message 2'},
          ],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });

    it('last provider should override previous one in directive providers', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders: [
            {provide: String, useValue: 'Message 1'},
            {provide: String, useValue: 'Message 2'},
          ],
          componentAssertion: () => {
            expect(inject(String)).toEqual('Message 2');
          },
        },
      });
    });
  });

  describe('single', () => {
    @NgModule({
      providers: [{provide: String, useValue: 'From module'}],
    })
    class MyModule {}

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From module');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From providers');
            },
          },
          ngModule: MyModule,
        });
      });
    });

    describe('with directives (order in ɵcmp.directives matters)', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From viewProviders');
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual('From directive');
            },
          },
          ngModule: MyModule,
        });
      });
    });
  });

  describe('multi', () => {
    @NgModule({
      providers: [{provide: String, useValue: 'From module', multi: true}],
    })
    class MyModule {}

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From viewProviders']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From viewProviders']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From viewProviders']);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From module']);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers', 'From viewProviders']);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From providers']);
            },
          },
          ngModule: MyModule,
        });
      });
    });

    describe('with directives (order in ɵcmp.directives matters)', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
          },
          ngModule: MyModule,
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          viewChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From viewProviders',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          contentChild: {
            componentAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
            directiveAssertion: () => {
              expect(inject(String)).toEqual([
                'From providers',
                'From directive 2',
                'From directive 1',
              ]);
            },
          },
          ngModule: MyModule,
        });
      });
    });
  });

  describe('tree-shakable injectables', () => {
    it('should work with root', () => {
      @Injectable({providedIn: 'root'})
      class FooForRoot {
        static ɵprov = ɵɵdefineInjectable({
          token: FooForRoot,
          factory: () => new FooForRoot(),
          providedIn: 'root',
        });
      }

      expectProvidersScenario({
        parent: {
          componentAssertion: () => {
            expect(inject(FooForRoot) instanceof FooForRoot).toBeTruthy();
          },
        },
      });
    });

    it('should work with a module', () => {
      @NgModule({
        providers: [{provide: String, useValue: 'From module'}],
      })
      class MyModule {}

      @Injectable({providedIn: MyModule})
      class FooForModule {
        static ɵprov = ɵɵdefineInjectable({
          token: FooForModule,
          factory: () => new FooForModule(),
          providedIn: MyModule,
        });
      }

      expectProvidersScenario({
        parent: {
          componentAssertion: () => {
            expect(inject(FooForModule) instanceof FooForModule).toBeTruthy();
          },
        },
        ngModule: MyModule,
      });
    });
  });

  describe('- dynamic components dependency resolution', () => {
    let hostComponent: HostComponent | null = null;

    @Component({
      template: `{{s}}`,
      selector: 'embedded-cmp',
    })
    class EmbeddedComponent {
      constructor(private s: String) {}
    }

    @Component({
      selector: 'host-cmp',
      template: `foo`,
      providers: [{provide: String, useValue: 'From host component'}],
    })
    class HostComponent {
      constructor(public vcref: ViewContainerRef) {
        hostComponent = this;
      }
    }

    @Component({
      imports: [HostComponent],
      template: `<host-cmp></host-cmp>`,
      providers: [{provide: String, useValue: 'From app component'}],
    })
    class AppComponent {
      constructor() {}
    }

    afterEach(() => (hostComponent = null));

    it('should not cross the root view boundary, and use the root view injector', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('<host-cmp>foo</host-cmp><!--container-->');

      hostComponent!.vcref.createComponent(EmbeddedComponent, {
        injector: {
          get: (token: any, notFoundValue?: any) => {
            return token === String ? 'From custom root view injector' : notFoundValue;
          },
        },
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<host-cmp>foo</host-cmp><embedded-cmp>From custom root view injector</embedded-cmp><!--container-->',
      );
    });

    it('should not cross the root view boundary, and use the module injector if no root view injector', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('<host-cmp>foo</host-cmp><!--container-->');

      const environmentInjector = createEnvironmentInjector(
        [{provide: String, useValue: 'From module injector'}],
        TestBed.inject(EnvironmentInjector),
      );

      hostComponent!.vcref.createComponent(EmbeddedComponent, {
        injector: {get: (token: any, notFoundValue?: any) => notFoundValue},
        environmentInjector: environmentInjector,
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<host-cmp>foo</host-cmp><embedded-cmp>From module injector</embedded-cmp><!--container-->',
      );
    });

    it('should cross the root view boundary to the parent of the host, thanks to the default root view injector', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('<host-cmp>foo</host-cmp><!--container-->');

      hostComponent!.vcref.createComponent(EmbeddedComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<host-cmp>foo</host-cmp><embedded-cmp>From app component</embedded-cmp><!--container-->',
      );
    });
  });

  describe('deps boundary:', () => {
    it('the deps of a token declared in providers should not be resolved with tokens from viewProviders', () => {
      @Injectable()
      class MyService {
        constructor(public value: String) {}
      }

      expectProvidersScenario({
        parent: {
          providers: [MyService, {provide: String, useValue: 'providers'}],
          viewProviders: [{provide: String, useValue: 'viewProviders'}],
          componentAssertion: () => {
            expect(inject(String)).toEqual('viewProviders');
            expect(inject(MyService).value).toEqual('providers');
          },
        },
      });
    });

    it('should make sure that parent service does not see overrides in child directives', () => {
      @Injectable()
      class Greeter {
        constructor(public greeting: String) {}
      }

      expectProvidersScenario({
        parent: {
          providers: [Greeter, {provide: String, useValue: 'parent'}],
        },
        viewChild: {
          providers: [{provide: String, useValue: 'view'}],
          componentAssertion: () => {
            expect(inject(Greeter).greeting).toEqual('parent');
          },
        },
      });
    });
  });

  describe('injection flags', () => {
    @NgModule({
      providers: [{provide: String, useValue: 'Module'}],
    })
    class MyModule {}
    it('should not fall through to ModuleInjector if flags limit the scope', () => {
      expectProvidersScenario({
        ngModule: MyModule,
        parent: {
          componentAssertion: () => {
            expect(inject(String)).toEqual('Module');
            expect(inject(String, {optional: true, self: true})).toBeNull();
            expect(inject(String, {optional: true, host: true})).toBeNull();
          },
        },
      });
    });
  });

  describe('from a node without injector', () => {
    abstract class Some {
      abstract location: String;
    }

    @Injectable()
    class SomeInj implements Some {
      constructor(public location: String) {}
    }

    @Component({
      selector: 'my-cmp',
      template: `<p></p>`,
      providers: [{provide: String, useValue: 'From my component'}],
      viewProviders: [{provide: Number, useValue: 123}],
    })
    class MyComponent {}

    @Component({
      imports: [MyComponent],
      template: `<my-cmp></my-cmp>`,
      providers: [
        {provide: String, useValue: 'From app component'},
        {provide: Some, useClass: SomeInj},
      ],
    })
    class AppComponent {}

    it('should work from within the template', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('<my-cmp><p></p></my-cmp>');

      const p = fixture.nativeElement.querySelector('p');
      const injector = getInjector(p);
      expect(injector.get(Number)).toEqual(123);
      expect(injector.get(String)).toEqual('From my component');
      expect(injector.get(Some).location).toEqual('From app component');
    });

    it('should work from the host of the component', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual('<my-cmp><p></p></my-cmp>');

      const myCmp = fixture.nativeElement.querySelector('my-cmp');
      const injector = getInjector(myCmp as any);
      expect(injector.get(Number)).toEqual(123);
      expect(injector.get(String)).toEqual('From my component');
      expect(injector.get(Some).location).toEqual('From app component');
    });
  });

  // Note: these tests check the behavior of `getInheritedFactory` specifically.
  // Since `getInheritedFactory` is only generated in AOT, the tests can't be
  // ported directly to TestBed while running in JIT mode.
  describe('getInheritedFactory on class with custom decorator', () => {
    function addFoo() {
      return (constructor: Type<any>): any => {
        const decoratedClass = class Extender extends constructor {
          foo = 'bar';
        };
        return decoratedClass;
      };
    }

    it('should find the correct factories if a parent class has a custom decorator', () => {
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      @addFoo()
      class Parent extends GrandParent {
        static override ɵfac = function Parent_Factory() {};
      }

      class Child extends Parent {
        static override ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });

    it('should find the correct factories if a child class has a custom decorator', () => {
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      class Parent extends GrandParent {
        static override ɵfac = function Parent_Factory() {};
      }

      @addFoo()
      class Child extends Parent {
        static override ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });

    it('should find the correct factories if a grandparent class has a custom decorator', () => {
      @addFoo()
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      class Parent extends GrandParent {
        static override ɵfac = function Parent_Factory() {};
      }

      class Child extends Parent {
        static override ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });

    it('should find the correct factories if all classes have a custom decorator', () => {
      @addFoo()
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      @addFoo()
      class Parent extends GrandParent {
        static override ɵfac = function Parent_Factory() {};
      }

      @addFoo()
      class Child extends Parent {
        static override ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });

    it('should find the correct factories if parent and grandparent classes have a custom decorator', () => {
      @addFoo()
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      @addFoo()
      class Parent extends GrandParent {
        static override ɵfac = function Parent_Factory() {};
      }

      class Child extends Parent {
        static override ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });
  });
});
