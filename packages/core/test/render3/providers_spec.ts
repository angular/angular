/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component as _Component, ComponentFactoryResolver, ElementRef, InjectFlags, Injectable as _Injectable, InjectionToken, InjectorType, Provider, RendererFactory2, ViewContainerRef, ɵNgModuleDef as NgModuleDef, ɵɵdefineInjectable, ɵɵdefineInjector, ɵɵinject} from '../../src/core';
import {forwardRef} from '../../src/di/forward_ref';
import {createInjector} from '../../src/di/r3_injector';
import {injectComponentFactoryResolver, ɵɵProvidersFeature, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵselect, ɵɵtextInterpolate1} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgModuleFactory} from '../../src/render3/ng_module_ref';
import {getInjector} from '../../src/render3/util/discovery_utils';
import {getRendererFactory2} from './imported_renderer2';
import {ComponentFixture} from './render_util';

const Component: typeof _Component = function(...args: any[]): any {
  // In test we use @Component for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;
const Injectable: typeof _Injectable = function(...args: any[]): any {
  // In test we use @Injectable for documentation only so it's safe to mock out the implementation.
  return () => undefined;
} as any;


describe('providers', () => {
  describe('should support all types of Provider:', () => {
    abstract class Greeter { abstract greet: string; }

    const GREETER = new InjectionToken<Greeter>('greeter');

    class GreeterClass implements Greeter {
      greet = 'Class';
    }

    class GreeterDeps implements Greeter {
      constructor(public greet: string) {}
    }

    class GreeterBuiltInDeps implements Greeter {
      public greet: string;
      constructor(private message: string, private elementRef: ElementRef) {
        this.greet = this.message + ' from ' + this.elementRef.nativeElement.tagName;
      }
    }

    class GreeterProvider {
      provide() { return 'Provided'; }
    }

    @Injectable()
    class GreeterInj implements Greeter {
      public greet: string;
      constructor(private provider: GreeterProvider) { this.greet = this.provider.provide(); }

      static ngInjectableDef = ɵɵdefineInjectable({
        token: GreeterInj,
        factory: () => new GreeterInj(ɵɵinject(GreeterProvider as any)),
      });
    }

    it('TypeProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass],
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(GreeterClass).greet).toEqual('Class'); }
        }
      });
    });

    it('ValueProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Value'); }
        }
      });
    });

    it('ClassProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useClass: GreeterClass}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class'); }
        }
      });
    });

    it('ExistingProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useExisting: GreeterClass}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class'); }
        }
      });
    });

    it('FactoryProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useFactory: () => new GreeterClass()}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class'); }
        }
      });
    });

    const MESSAGE = new InjectionToken<string>('message');

    it('ClassProvider with deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useClass: GreeterDeps, deps: [MESSAGE]}
          ],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message'); }
        }
      });
    });

    it('ClassProvider with built-in deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useClass: GreeterBuiltInDeps, deps: [MESSAGE, ElementRef]}
          ],
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message from PARENT'); }
        }
      });
    });

    it('FactoryProvider with deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'},
            {provide: GREETER, useFactory: (msg: string) => new GreeterDeps(msg), deps: [MESSAGE]}
          ],
          componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message'); }
        }
      });
    });

    it('FactoryProvider with built-in deps', () => {
      expectProvidersScenario({
        parent: {
          providers: [
            {provide: MESSAGE, useValue: 'Message'}, {
              provide: GREETER,
              useFactory: (msg: string, elementRef: ElementRef) =>
                              new GreeterBuiltInDeps(msg, elementRef),
              deps: [MESSAGE, ElementRef]
            }
          ],
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message from PARENT'); }
        }
      });
    });

    it('ClassProvider with injectable', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterProvider, {provide: GREETER, useClass: GreeterInj}],
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Provided'); }
        }
      });
    });

    describe('forwardRef', () => {
      it('forwardRef resolves later', (done) => {
        setTimeout(() => {
          expectProvidersScenario({
            parent: {
              providers: [forwardRef(() => ForLater)],
              componentAssertion:
                  () => { expect(ɵɵdirectiveInject(ForLater) instanceof ForLater).toBeTruthy(); }
            }
          });
          done();
        }, 0);
      });

      class ForLater {}

      // The following test that forwardRefs are called, so we don't search for an anon fn
      it('ValueProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers:
                [{provide: GREETER, useValue: forwardRef(() => { return {greet: 'Value'}; })}],
            componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Value'); }
          }
        });
      });

      it('ClassProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useClass: forwardRef(() => GreeterClass)}],
            componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class'); }
          }
        });
      });

      it('ExistingProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers:
                [GreeterClass, {provide: GREETER, useExisting: forwardRef(() => GreeterClass)}],
            componentAssertion: () => { expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class'); }
          }
        });
      });

      it('@Inject annotation wrapped in forwardRef', () => {
        // @Inject(forwardRef(() => GREETER))
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(forwardRef(() => GREETER)).greet).toEqual('Value');
            }
          }
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
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('viewProviders should override providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('viewProviders should override directiveProviders', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last declared directive should override other directives', () => {
      expectProvidersScenario({
        parent: {
          directive2Providers: [{provide: String, useValue: 'Message 1'}],
          directiveProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in component providers', () => {
      expectProvidersScenario({
        parent: {
          providers:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in component view providers', () => {
      expectProvidersScenario({
        parent: {
          viewProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in directive providers', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('Message 2'); }
        }
      });
    });
  });

  describe('single', () => {
    class MyModule {
      static ngInjectorDef = ɵɵdefineInjector(
          {factory: () => new MyModule(), providers: [{provide: String, useValue: 'From module'}]});
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); }
          },
          viewChild: {
            componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); }
          },
          contentChild: {
            componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(ɵɵdirectiveInject(String)).toEqual('From module'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From providers'); }
          },
          ngModule: MyModule
        });
      });
    });

    describe('with directives (order in ngComponentDef.directives matters)', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            directiveProviders: [{provide: String, useValue: 'From directive'}],
            directive2Providers: [{provide: String, useValue: 'Never'}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual('From directive'); }
          },
          ngModule: MyModule
        });
      });
    });
  });

  describe('multi', () => {
    class MyModule {
      static ngInjectorDef = ɵɵdefineInjector({
        factory: () => new MyModule(),
        providers: [{provide: String, useValue: 'From module', multi: true}]
      });
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From module']); }
          },
          ngModule: MyModule
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            }
          },
          contentChild: {
            componentAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(ɵɵdirectiveInject(String)).toEqual(['From providers']); }
          },
          ngModule: MyModule
        });
      });
    });

    describe('with directives (order in ngComponentDef.directives matters)', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            directiveProviders: [{provide: String, useValue: 'From directive 1', multi: true}],
            directive2Providers: [{provide: String, useValue: 'From directive 2', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          ngModule: MyModule
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
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          ngModule: MyModule
        });
      });
    });
  });

  describe('tree-shakable injectables', () => {
    it('should work with root', () => {
      @Injectable({providedIn: 'root'})
      class FooForRoot {
        static ngInjectableDef = ɵɵdefineInjectable({
          token: FooForRoot,
          factory: () => new FooForRoot(),
          providedIn: 'root',
        });
      }

      expectProvidersScenario({
        parent: {
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(FooForRoot) instanceof FooForRoot).toBeTruthy(); }
        }
      });
    });

    it('should work with a module', () => {
      class MyModule {
        static ngInjectorDef = ɵɵdefineInjector({
          factory: () => new MyModule(),
          providers: [{provide: String, useValue: 'From module'}]
        });
      }

      @Injectable({providedIn: MyModule})
      class FooForModule {
        static ngInjectableDef = ɵɵdefineInjectable({
          token: FooForModule,
          factory: () => new FooForModule(),
          providedIn: MyModule,
        });
      }

      expectProvidersScenario({
        parent: {
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(FooForModule) instanceof FooForModule).toBeTruthy();
          }
        },
        ngModule: MyModule
      });
    });
  });

  describe('- embedded views', () => {
    it('should have access to viewProviders of the host component', () => {
      @Component({
        template: '{{s}}{{n}}',
      })
      class Repeated {
        constructor(private s: String, private n: Number) {}

        static ngComponentDef = ɵɵdefineComponent({
          type: Repeated,
          selectors: [['repeated']],
          factory: () => new Repeated(ɵɵdirectiveInject(String), ɵɵdirectiveInject(Number)),
          consts: 2,
          vars: 2,
          template: function(fs: RenderFlags, ctx: Repeated) {
            if (fs & RenderFlags.Create) {
              ɵɵtext(0);
              ɵɵtext(1);
            }
            if (fs & RenderFlags.Update) {
              ɵɵselect(0);
              ɵɵtextBinding(ctx.s);
              ɵɵselect(1);
              ɵɵtextBinding(ctx.n);
            }
          }
        });
      }

      @Component({
        template: `<div>
            % for (let i = 0; i < 3; i++) {
              <repeated></repeated>
            % }
          </div>`,
        providers: [{provide: Number, useValue: 1, multi: true}],
        viewProviders:
            [{provide: String, useValue: 'foo'}, {provide: Number, useValue: 2, multi: true}],
      })
      class ComponentWithProviders {
        static ngComponentDef = ɵɵdefineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(),
          consts: 2,
          vars: 0,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              ɵɵelementStart(0, 'div');
              { ɵɵcontainer(1); }
              ɵɵelementEnd();
            }
            if (fs & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              {
                for (let i = 0; i < 3; i++) {
                  let rf1 = ɵɵembeddedViewStart(1, 1, 0);
                  {
                    if (rf1 & RenderFlags.Create) {
                      ɵɵelement(0, 'repeated');
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
          },
          features: [
            ɵɵProvidersFeature(
                [{provide: Number, useValue: 1, multi: true}],
                [{provide: String, useValue: 'foo'}, {provide: Number, useValue: 2, multi: true}]),
          ],
          directives: [Repeated]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html)
          .toEqual(
              '<div><repeated>foo1,2</repeated><repeated>foo1,2</repeated><repeated>foo1,2</repeated></div>');
    });

    it('should have access to viewProviders of the repeated component', () => {
      @Component({
        template: '{{s}}{{n}}',
        providers: [{provide: Number, useValue: 1, multi: true}],
        viewProviders:
            [{provide: String, useValue: 'bar'}, {provide: Number, useValue: 2, multi: true}]
      })
      class Repeated {
        constructor(private s: String, private n: Number) {}

        static ngComponentDef = ɵɵdefineComponent({
          type: Repeated,
          selectors: [['repeated']],
          factory: () => new Repeated(ɵɵdirectiveInject(String), ɵɵdirectiveInject(Number)),
          consts: 2,
          vars: 2,
          template: function(fs: RenderFlags, ctx: Repeated) {
            if (fs & RenderFlags.Create) {
              ɵɵtext(0);
              ɵɵtext(1);
            }
            if (fs & RenderFlags.Update) {
              ɵɵselect(0);
              ɵɵtextBinding(ctx.s);
              ɵɵselect(1);
              ɵɵtextBinding(ctx.n);
            }
          },
          features: [
            ɵɵProvidersFeature(
                [{provide: Number, useValue: 1, multi: true}],
                [{provide: String, useValue: 'bar'}, {provide: Number, useValue: 2, multi: true}]),
          ],
        });
      }

      @Component({
        template: `<div>
            % for (let i = 0; i < 3; i++) {
              <repeated></repeated>
            % }
          </div>`,
        viewProviders: [{provide: toString, useValue: 'foo'}],
      })
      class ComponentWithProviders {
        static ngComponentDef = ɵɵdefineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(),
          consts: 2,
          vars: 0,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              ɵɵelementStart(0, 'div');
              { ɵɵcontainer(1); }
              ɵɵelementEnd();
            }
            if (fs & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              {
                for (let i = 0; i < 3; i++) {
                  let rf1 = ɵɵembeddedViewStart(1, 1, 0);
                  {
                    if (rf1 & RenderFlags.Create) {
                      ɵɵelement(0, 'repeated');
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
          },
          features: [ɵɵProvidersFeature([], [{provide: String, useValue: 'foo'}])],
          directives: [Repeated]
        });
      }

      const fixture = new ComponentFixture(ComponentWithProviders);
      expect(fixture.html)
          .toEqual(
              '<div><repeated>bar1,2</repeated><repeated>bar1,2</repeated><repeated>bar1,2</repeated></div>');
    });
  });

  describe('- dynamic components dependency resolution', () => {
    let hostComponent: HostComponent|null = null;

    @Component({
      template: `{{s}}`,
    })
    class EmbeddedComponent {
      constructor(private s: String) {}

      static ngComponentDef = ɵɵdefineComponent({
        type: EmbeddedComponent,
        selectors: [['embedded-cmp']],
        factory: () => new EmbeddedComponent(ɵɵdirectiveInject(String)),
        consts: 1,
        vars: 1,
        template: (rf: RenderFlags, cmp: EmbeddedComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0);
          }
          if (rf & RenderFlags.Update) {
            ɵɵselect(0);
            ɵɵtextInterpolate1('', cmp.s, '');
          }
        }
      });
    }

    @Component({template: `foo`, providers: [{provide: String, useValue: 'From host component'}]})
    class HostComponent {
      constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

      static ngComponentDef = ɵɵdefineComponent({
        type: HostComponent,
        selectors: [['host-cmp']],
        factory: () => hostComponent = new HostComponent(
                     ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: HostComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵtext(0, 'foo');
          }
        },
        features: [
          ɵɵProvidersFeature([{provide: String, useValue: 'From host component'}]),
        ],
      });
    }

    @Component({
      template: `<host-cmp></host-cmp>`,
      providers: [{provide: String, useValue: 'From app component'}]
    })
    class AppComponent {
      constructor() {}

      static ngComponentDef = ɵɵdefineComponent({
        type: AppComponent,
        selectors: [['app-cmp']],
        factory: () => new AppComponent(),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: AppComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'host-cmp');
          }
        },
        features: [
          ɵɵProvidersFeature([{provide: String, useValue: 'From app component'}]),
        ],
        directives: [HostComponent]
      });
    }

    it('should not cross the root view boundary, and use the root view injector', () => {
      const fixture = new ComponentFixture(AppComponent);
      expect(fixture.html).toEqual('<host-cmp>foo</host-cmp>');

      hostComponent !.vcref.createComponent(
          hostComponent !.cfr.resolveComponentFactory(EmbeddedComponent), undefined, {
            get: (token: any, notFoundValue?: any) => {
              return token === String ? 'From custom root view injector' : notFoundValue;
            }
          });
      fixture.update();
      expect(fixture.html)
          .toEqual(
              '<host-cmp>foo</host-cmp><embedded-cmp>From custom root view injector</embedded-cmp>');
    });

    it('should not cross the root view boundary, and use the module injector if no root view injector',
       () => {

         const fixture = new ComponentFixture(AppComponent);
         expect(fixture.html).toEqual('<host-cmp>foo</host-cmp>');

         class MyAppModule {
           static ngInjectorDef = ɵɵdefineInjector({
             factory: () => new MyAppModule(),
             imports: [],
             providers: [
               {provide: RendererFactory2, useValue: getRendererFactory2(document)},
               {provide: String, useValue: 'From module injector'}
             ]
           });
           static ngModuleDef: NgModuleDef<any> = { bootstrap: [] } as any;
         }
         const myAppModuleFactory = new NgModuleFactory(MyAppModule);
         const ngModuleRef = myAppModuleFactory.create(null);

         hostComponent !.vcref.createComponent(
             hostComponent !.cfr.resolveComponentFactory(EmbeddedComponent), undefined,
             {get: (token: any, notFoundValue?: any) => notFoundValue}, undefined, ngModuleRef);
         fixture.update();
         expect(fixture.html)
             .toMatch(
                 /<host-cmp>foo<\/host-cmp><embedded-cmp _nghost-[a-z]+-c(\d+)="">From module injector<\/embedded-cmp>/);
       });

    it('should cross the root view boundary to the parent of the host, thanks to the default root view injector',
       () => {
         const fixture = new ComponentFixture(AppComponent);
         expect(fixture.html).toEqual('<host-cmp>foo</host-cmp>');

         hostComponent !.vcref.createComponent(
             hostComponent !.cfr.resolveComponentFactory(EmbeddedComponent));
         fixture.update();
         expect(fixture.html)
             .toEqual('<host-cmp>foo</host-cmp><embedded-cmp>From app component</embedded-cmp>');
       });
  });

  describe('deps boundary:', () => {
    it('the deps of a token declared in providers should not be resolved with tokens from viewProviders',
       () => {
         @Injectable()
         class MyService {
           constructor(public value: String) {}

           static ngInjectableDef = ɵɵdefineInjectable({
             token: MyService,
             factory: () => new MyService(ɵɵinject(String)),
           });
         }

         expectProvidersScenario({
           parent: {
             providers: [MyService, {provide: String, useValue: 'providers'}],
             viewProviders: [{provide: String, useValue: 'viewProviders'}],
             componentAssertion: () => {
               expect(ɵɵdirectiveInject(String)).toEqual('viewProviders');
               expect(ɵɵdirectiveInject(MyService).value).toEqual('providers');
             }
           }
         });
       });

    it('should make sure that parent service does not see overrides in child directives', () => {
      class Greeter {
        static ngInjectableDef = ɵɵdefineInjectable({
          token: Greeter,
          factory: () => new Greeter(ɵɵinject(String)),
        });
        constructor(public greeting: String) {}
      }

      expectProvidersScenario({
        parent: {
          providers: [Greeter, {provide: String, useValue: 'parent'}],
        },
        viewChild: {
          providers: [{provide: String, useValue: 'view'}],
          componentAssertion:
              () => { expect(ɵɵdirectiveInject(Greeter).greeting).toEqual('parent'); },
        },
      });
    });
  });

  describe('injection flags', () => {
    class MyModule {
      static ngInjectorDef = ɵɵdefineInjector(
          {factory: () => new MyModule(), providers: [{provide: String, useValue: 'Module'}]});
    }
    it('should not fall through to ModuleInjector if flags limit the scope', () => {
      expectProvidersScenario({
        ngModule: MyModule,
        parent: {
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Module');
            expect(ɵɵdirectiveInject(String, InjectFlags.Optional | InjectFlags.Self)).toBeNull();
            expect(ɵɵdirectiveInject(String, InjectFlags.Optional | InjectFlags.Host)).toBeNull();
          }
        }
      });
    });
  });

  describe('from a node without injector', () => {
    abstract class Some { abstract location: String; }

    class SomeInj implements Some {
      constructor(public location: String) {}

      static ngInjectableDef = ɵɵdefineInjectable({
        token: SomeInj,
        factory: () => new SomeInj(ɵɵinject(String)),
      });
    }

    @Component({
      template: `<p></p>`,
      providers: [{provide: String, useValue: 'From my component'}],
      viewProviders: [{provide: Number, useValue: 123}]
    })
    class MyComponent {
      constructor() {}

      static ngComponentDef = ɵɵdefineComponent({
        type: MyComponent,
        selectors: [['my-cmp']],
        factory: () => new MyComponent(),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: MyComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'p');
          }
        },
        features: [
          ɵɵProvidersFeature(
              [{provide: String, useValue: 'From my component'}],
              [{provide: Number, useValue: 123}]),
        ],
      });
    }

    @Component({
      template: `<my-cmp></my-cmp>`,
      providers:
          [{provide: String, useValue: 'From app component'}, {provide: Some, useClass: SomeInj}]
    })
    class AppComponent {
      constructor() {}

      static ngComponentDef = ɵɵdefineComponent({
        type: AppComponent,
        selectors: [['app-cmp']],
        factory: () => new AppComponent(),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: AppComponent) => {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'my-cmp');
          }
        },
        features: [
          ɵɵProvidersFeature([
            {provide: String, useValue: 'From app component'}, {provide: Some, useClass: SomeInj}
          ]),
        ],
        directives: [MyComponent]
      });
    }

    it('should work from within the template', () => {
      const fixture = new ComponentFixture(AppComponent);
      expect(fixture.html).toEqual('<my-cmp><p></p></my-cmp>');

      const p = fixture.hostElement.querySelector('p');
      const injector = getInjector(p as any);
      expect(injector.get(Number)).toEqual(123);
      expect(injector.get(String)).toEqual('From my component');
      expect(injector.get(Some).location).toEqual('From app component');
    });

    it('should work from the host of the component', () => {
      const fixture = new ComponentFixture(AppComponent);
      expect(fixture.html).toEqual('<my-cmp><p></p></my-cmp>');

      const myCmp = fixture.hostElement.querySelector('my-cmp');
      const injector = getInjector(myCmp as any);
      expect(injector.get(Number)).toEqual(123);
      expect(injector.get(String)).toEqual('From my component');
      expect(injector.get(Some).location).toEqual('From app component');
    });
  });

  describe('lifecycles', () => {
    it('should execute ngOnDestroy hooks on providers (and only this one)', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithLifeCycleHooks {
        ngOnChanges() { logs.push('Injectable OnChanges'); }
        ngOnInit() { logs.push('Injectable OnInit'); }
        ngDoCheck() { logs.push('Injectable DoCheck'); }
        ngAfterContentInit() { logs.push('Injectable AfterContentInit'); }
        ngAfterContentChecked() { logs.push('Injectable AfterContentChecked'); }
        ngAfterViewInit() { logs.push('Injectable AfterViewInit'); }
        ngAfterViewChecked() { logs.push('Injectable gAfterViewChecked'); }
        ngOnDestroy() { logs.push('Injectable OnDestroy'); }
      }

      @Component({template: `<span></span>`, providers: [InjectableWithLifeCycleHooks]})
      class MyComponent {
        constructor(foo: InjectableWithLifeCycleHooks) {}

        static ngComponentDef = ɵɵdefineComponent({
          type: MyComponent,
          selectors: [['my-comp']],
          factory: () => new MyComponent(ɵɵdirectiveInject(InjectableWithLifeCycleHooks)),
          consts: 1,
          vars: 0,
          template: (rf: RenderFlags, ctx: MyComponent) => {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'span');
            }
          },
          features: [ɵɵProvidersFeature([InjectableWithLifeCycleHooks])]
        });
      }

      @Component({
        template: `
        <div>
        % if (ctx.condition) {
          <my-comp></my-comp>
        % }
        </div>
        `,
      })
      class App {
        public condition = true;

        static ngComponentDef = ɵɵdefineComponent({
          type: App,
          selectors: [['app-cmp']],
          factory: () => new App(),
          consts: 2,
          vars: 0,
          template: (rf: RenderFlags, ctx: App) => {
            if (rf & RenderFlags.Create) {
              ɵɵelementStart(0, 'div');
              { ɵɵcontainer(1); }
              ɵɵelementEnd();
            }
            if (rf & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(1);
              {
                if (ctx.condition) {
                  let rf1 = ɵɵembeddedViewStart(1, 2, 1);
                  {
                    if (rf1 & RenderFlags.Create) {
                      ɵɵelement(0, 'my-comp');
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
          },
          directives: [MyComponent]
        });
      }

      const fixture = new ComponentFixture(App);
      fixture.update();
      expect(fixture.html).toEqual('<div><my-comp><span></span></my-comp></div>');

      fixture.component.condition = false;
      fixture.update();
      expect(fixture.html).toEqual('<div></div>');
      expect(logs).toEqual(['Injectable OnDestroy']);
    });

  });
});
interface ComponentTest {
  providers?: Provider[];
  viewProviders?: Provider[];
  directiveProviders?: Provider[];
  directive2Providers?: Provider[];
  directiveAssertion?: () => void;
  componentAssertion?: () => void;
}

function expectProvidersScenario(defs: {
  app?: ComponentTest,
  parent?: ComponentTest,
  viewChild?: ComponentTest,
  contentChild?: ComponentTest,
  ngModule?: InjectorType<any>,
}): void {
  function testComponentInjection<T>(def: ComponentTest | undefined, instance: T): T {
    if (def) {
      def.componentAssertion && def.componentAssertion();
    }
    return instance;
  }

  function testDirectiveInjection<T>(def: ComponentTest | undefined, instance: T): T {
    if (def) {
      def.directiveAssertion && def.directiveAssertion();
    }
    return instance;
  }

  class ViewChildComponent {
    static ngComponentDef = ɵɵdefineComponent({
      type: ViewChildComponent,
      selectors: [['view-child']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.viewChild, new ViewChildComponent()),
      template: function(fs: RenderFlags, ctx: ViewChildComponent) {
        if (fs & RenderFlags.Create) {
          ɵɵtext(0, 'view-child');
        }
      },
      features: defs.viewChild &&
          [
            ɵɵProvidersFeature(defs.viewChild.providers || [], defs.viewChild.viewProviders || []),
          ],
    });
  }

  class ViewChildDirective {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: ViewChildDirective,
      selectors: [['view-child']],
      factory: () => testDirectiveInjection(defs.viewChild, new ViewChildDirective()),
      features: defs.viewChild && [ɵɵProvidersFeature(defs.viewChild.directiveProviders || [])],
    });
  }

  class ContentChildComponent {
    static ngComponentDef = ɵɵdefineComponent({
      type: ContentChildComponent,
      selectors: [['content-child']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.contentChild, new ContentChildComponent()),
      template: function(fs: RenderFlags, ctx: ParentComponent) {
        if (fs & RenderFlags.Create) {
          ɵɵtext(0, 'content-child');
        }
      },
      features: defs.contentChild &&
          [ɵɵProvidersFeature(
              defs.contentChild.providers || [], defs.contentChild.viewProviders || [])],
    });
  }

  class ContentChildDirective {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: ContentChildDirective,
      selectors: [['content-child']],
      factory: () => testDirectiveInjection(defs.contentChild, new ContentChildDirective()),
      features:
          defs.contentChild && [ɵɵProvidersFeature(defs.contentChild.directiveProviders || [])],
    });
  }


  class ParentComponent {
    static ngComponentDef = ɵɵdefineComponent({
      type: ParentComponent,
      selectors: [['parent']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.parent, new ParentComponent()),
      template: function(fs: RenderFlags, ctx: ParentComponent) {
        if (fs & RenderFlags.Create) {
          ɵɵelement(0, 'view-child');
        }
      },
      features: defs.parent &&
          [ɵɵProvidersFeature(defs.parent.providers || [], defs.parent.viewProviders || [])],
      directives: [ViewChildComponent, ViewChildDirective]
    });
  }

  class ParentDirective {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: ParentDirective,
      selectors: [['parent']],
      factory: () => testDirectiveInjection(defs.parent, new ParentDirective()),
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directiveProviders || [])],
    });
  }

  class ParentDirective2 {
    static ngDirectiveDef = ɵɵdefineDirective({
      type: ParentDirective2,
      selectors: [['parent']],
      factory: () => testDirectiveInjection(defs.parent, new ParentDirective2()),
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directive2Providers || [])],
    });
  }


  class App {
    static ngComponentDef = ɵɵdefineComponent({
      type: App,
      selectors: [['app']],
      consts: 2,
      vars: 0,
      factory: () => testComponentInjection(defs.app, new App()),
      template: function(fs: RenderFlags, ctx: App) {
        if (fs & RenderFlags.Create) {
          ɵɵelementStart(0, 'parent');
          ɵɵelement(1, 'content-child');
          ɵɵelementEnd();
        }
      },
      features:
          defs.app && [ɵɵProvidersFeature(defs.app.providers || [], defs.app.viewProviders || [])],
      directives: [
        ParentComponent, ParentDirective2, ParentDirective, ContentChildComponent,
        ContentChildDirective
      ]
    });
  }


  const fixture = new ComponentFixture(
      App, {injector: defs.ngModule ? createInjector(defs.ngModule) : undefined});
  expect(fixture.html).toEqual('<parent><view-child>view-child</view-child></parent>');
}
