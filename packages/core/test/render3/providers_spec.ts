/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component as _Component, ComponentFactoryResolver, ElementRef, InjectFlags, Injectable as _Injectable, InjectionToken, InjectorType, Provider, RendererFactory2, ViewContainerRef, createInjector, defineInjectable, defineInjector, inject, ɵNgModuleDef as NgModuleDef} from '../../src/core';
import {forwardRef} from '../../src/di/forward_ref';
import {ProvidersFeature, defineComponent, defineDirective, directiveInject, injectComponentFactoryResolver} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {NgModuleFactory} from '../../src/render3/ng_module_ref';

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

      static ngInjectableDef =
          defineInjectable({factory: () => new GreeterInj(inject(GreeterProvider as any))});
    }

    it('TypeProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass],
          componentAssertion:
              () => { expect(directiveInject(GreeterClass).greet).toEqual('Class'); }
        }
      });
    });

    it('ValueProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Value'); }
        }
      });
    });

    it('ClassProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useClass: GreeterClass}],
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Class'); }
        }
      });
    });

    it('ExistingProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useExisting: GreeterClass}],
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Class'); }
        }
      });
    });

    it('FactoryProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useFactory: () => new GreeterClass()}],
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Class'); }
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
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Message'); }
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
              () => { expect(directiveInject(GREETER).greet).toEqual('Message from PARENT'); }
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
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Message'); }
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
              () => { expect(directiveInject(GREETER).greet).toEqual('Message from PARENT'); }
        }
      });
    });

    it('ClassProvider with injectable', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterProvider, {provide: GREETER, useClass: GreeterInj}],
          componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Provided'); }
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
                  () => { expect(directiveInject(ForLater) instanceof ForLater).toBeTruthy(); }
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
            componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Value'); }
          }
        });
      });

      it('ClassProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useClass: forwardRef(() => GreeterClass)}],
            componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Class'); }
          }
        });
      });

      it('ExistingProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers:
                [GreeterClass, {provide: GREETER, useExisting: forwardRef(() => GreeterClass)}],
            componentAssertion: () => { expect(directiveInject(GREETER).greet).toEqual('Class'); }
          }
        });
      });

      it('@Inject annotation wrapped in forwardRef', () => {
        // @Inject(forwardRef(() => GREETER))
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
            componentAssertion:
                () => { expect(directiveInject(forwardRef(() => GREETER)).greet).toEqual('Value'); }
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
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('viewProviders should override providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('viewProviders should override directiveProviders', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last declared directive should override other directives', () => {
      expectProvidersScenario({
        parent: {
          directive2Providers: [{provide: String, useValue: 'Message 1'}],
          directiveProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in component providers', () => {
      expectProvidersScenario({
        parent: {
          providers:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in component view providers', () => {
      expectProvidersScenario({
        parent: {
          viewProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });

    it('last provider should override previous one in directive providers', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => { expect(directiveInject(String)).toEqual('Message 2'); }
        }
      });
    });
  });

  describe('single', () => {
    class MyModule {
      static ngInjectorDef = defineInjector(
          {factory: () => new MyModule(), providers: [{provide: String, useValue: 'From module'}]});
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From module'); }
          },
          viewChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From module'); }
          },
          contentChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From module'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From providers'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From providers'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From providers'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From providers'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From providers'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From providers'); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From module'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual('From module'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From module'); }
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
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From providers'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From providers'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From providers'); }
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
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
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
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
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
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
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
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual('From viewProviders'); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual('From directive'); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual('From directive'); }
          },
          ngModule: MyModule
        });
      });
    });
  });

  describe('multi', () => {
    class MyModule {
      static ngInjectorDef = defineInjector({
        factory: () => new MyModule(),
        providers: [{provide: String, useValue: 'From module', multi: true}]
      });
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); }
          },
          viewChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); }
          },
          contentChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From viewProviders']); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); }
          },
          viewChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From viewProviders']); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From viewProviders']); }
          },
          contentChild: {
            componentAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); },
            directiveAssertion: () => { expect(directiveInject(String)).toEqual(['From module']); }
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
              expect(directiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); }
          },
          viewChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            }
          },
          contentChild: {
            componentAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); },
            directiveAssertion:
                () => { expect(directiveInject(String)).toEqual(['From providers']); }
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
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
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
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
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
              expect(directiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual(['From directive 2', 'From directive 1']);
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
              expect(directiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From viewProviders', 'From directive 2', 'From directive 1'
              ]);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(directiveInject(String)).toEqual([
                'From providers', 'From directive 2', 'From directive 1'
              ]);
            },
            directiveAssertion: () => {
              expect(directiveInject(String)).toEqual([
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
        static ngInjectableDef =
            defineInjectable({factory: () => new FooForRoot(), providedIn: 'root'});
      }

      expectProvidersScenario({
        parent: {
          componentAssertion:
              () => { expect(directiveInject(FooForRoot) instanceof FooForRoot).toBeTruthy(); }
        }
      });
    });

    it('should work with a module', () => {
      class MyModule {
        static ngInjectorDef = defineInjector({
          factory: () => new MyModule(),
          providers: [{provide: String, useValue: 'From module'}]
        });
      }

      @Injectable({providedIn: MyModule})
      class FooForModule {
        static ngInjectableDef =
            defineInjectable({factory: () => new FooForModule(), providedIn: MyModule});
      }

      expectProvidersScenario({
        parent: {
          componentAssertion:
              () => { expect(directiveInject(FooForModule) instanceof FooForModule).toBeTruthy(); }
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

        static ngComponentDef = defineComponent({
          type: Repeated,
          selectors: [['repeated']],
          factory: () => new Repeated(directiveInject(String), directiveInject(Number)),
          consts: 2,
          vars: 2,
          template: function(fs: RenderFlags, ctx: Repeated) {
            if (fs & RenderFlags.Create) {
              text(0);
              text(1);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.s));
              textBinding(1, bind(ctx.n));
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
        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(),
          consts: 2,
          vars: 0,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              elementStart(0, 'div');
              { container(1); }
              elementEnd();
            }
            if (fs & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                for (let i = 0; i < 3; i++) {
                  let rf1 = embeddedViewStart(1, 1, 0);
                  {
                    if (rf1 & RenderFlags.Create) {
                      element(0, 'repeated');
                    }
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
          },
          features: [
            ProvidersFeature(
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

        static ngComponentDef = defineComponent({
          type: Repeated,
          selectors: [['repeated']],
          factory: () => new Repeated(directiveInject(String), directiveInject(Number)),
          consts: 2,
          vars: 2,
          template: function(fs: RenderFlags, ctx: Repeated) {
            if (fs & RenderFlags.Create) {
              text(0);
              text(1);
            }
            if (fs & RenderFlags.Update) {
              textBinding(0, bind(ctx.s));
              textBinding(1, bind(ctx.n));
            }
          },
          features: [
            ProvidersFeature(
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
        static ngComponentDef = defineComponent({
          type: ComponentWithProviders,
          selectors: [['component-with-providers']],
          factory: () => new ComponentWithProviders(),
          consts: 2,
          vars: 0,
          template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
            if (fs & RenderFlags.Create) {
              elementStart(0, 'div');
              { container(1); }
              elementEnd();
            }
            if (fs & RenderFlags.Update) {
              containerRefreshStart(1);
              {
                for (let i = 0; i < 3; i++) {
                  let rf1 = embeddedViewStart(1, 1, 0);
                  {
                    if (rf1 & RenderFlags.Create) {
                      element(0, 'repeated');
                    }
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
          },
          features: [ProvidersFeature([], [{provide: String, useValue: 'foo'}])],
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

      static ngComponentDef = defineComponent({
        type: EmbeddedComponent,
        selectors: [['embedded-cmp']],
        factory: () => new EmbeddedComponent(directiveInject(String)),
        consts: 1,
        vars: 1,
        template: (rf: RenderFlags, cmp: EmbeddedComponent) => {
          if (rf & RenderFlags.Create) {
            text(0);
          }
          if (rf & RenderFlags.Update) {
            textBinding(0, interpolation1('', cmp.s, ''));
          }
        }
      });
    }

    @Component({template: `foo`, providers: [{provide: String, useValue: 'From host component'}]})
    class HostComponent {
      constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

      static ngComponentDef = defineComponent({
        type: HostComponent,
        selectors: [['host-cmp']],
        factory: () => hostComponent = new HostComponent(
                     directiveInject(ViewContainerRef as any), injectComponentFactoryResolver()),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: HostComponent) => {
          if (rf & RenderFlags.Create) {
            text(0, 'foo');
          }
        },
        features: [
          ProvidersFeature([{provide: String, useValue: 'From host component'}]),
        ],
      });
    }

    @Component({
      template: `<host-cmp></host-cmp>`,
      providers: [{provide: String, useValue: 'From app component'}]
    })
    class AppComponent {
      constructor() {}

      static ngComponentDef = defineComponent({
        type: AppComponent,
        selectors: [['app-cmp']],
        factory: () => new AppComponent(),
        consts: 1,
        vars: 0,
        template: (rf: RenderFlags, cmp: AppComponent) => {
          if (rf & RenderFlags.Create) {
            element(0, 'host-cmp');
          }
        },
        features: [
          ProvidersFeature([{provide: String, useValue: 'From app component'}]),
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
           static ngInjectorDef = defineInjector({
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
                 /<host-cmp>foo<\/host-cmp><embedded-cmp _nghost-c(\d+)="">From module injector<\/embedded-cmp>/);
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

           static ngInjectableDef =
               defineInjectable({factory: () => new MyService(inject(String))});
         }

         expectProvidersScenario({
           parent: {
             providers: [MyService, {provide: String, useValue: 'providers'}],
             viewProviders: [{provide: String, useValue: 'viewProviders'}],
             componentAssertion: () => {
               expect(directiveInject(String)).toEqual('viewProviders');
               expect(directiveInject(MyService).value).toEqual('providers');
             }
           }
         });
       });

    it('should make sure that parent service does not see overrides in child directives', () => {
      class Greeter {
        static ngInjectableDef = defineInjectable({factory: () => new Greeter(inject(String))});
        constructor(public greeting: String) {}
      }

      expectProvidersScenario({
        parent: {
          providers: [Greeter, {provide: String, useValue: 'parent'}],
        },
        viewChild: {
          providers: [{provide: String, useValue: 'view'}],
          componentAssertion:
              () => { expect(directiveInject(Greeter).greeting).toEqual('parent'); },
        },
      });
    });
  });

  describe('injection flags', () => {
    class MyModule {
      static ngInjectorDef = defineInjector(
          {factory: () => new MyModule(), providers: [{provide: String, useValue: 'Module'}]});
    }
    it('should not fall through to ModuleInjector if flags limit the scope', () => {
      expectProvidersScenario({
        ngModule: MyModule,
        parent: {
          componentAssertion: () => {
            expect(directiveInject(String)).toEqual('Module');
            expect(directiveInject(String, InjectFlags.Optional | InjectFlags.Self)).toBeNull();
            expect(directiveInject(String, InjectFlags.Optional | InjectFlags.Host)).toBeNull();
          }
        }
      });
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
    static ngComponentDef = defineComponent({
      type: ViewChildComponent,
      selectors: [['view-child']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.viewChild, new ViewChildComponent()),
      template: function(fs: RenderFlags, ctx: ViewChildComponent) {
        if (fs & RenderFlags.Create) {
          text(0, 'view-child');
        }
      },
      features: defs.viewChild &&
          [
            ProvidersFeature(defs.viewChild.providers || [], defs.viewChild.viewProviders || []),
          ],
    });
  }

  class ViewChildDirective {
    static ngComponentDef = defineDirective({
      type: ViewChildDirective,
      selectors: [['view-child']],
      factory: () => testDirectiveInjection(defs.viewChild, new ViewChildDirective()),
      features: defs.viewChild && [ProvidersFeature(defs.viewChild.directiveProviders || [])],
    });
  }

  class ContentChildComponent {
    static ngComponentDef = defineComponent({
      type: ContentChildComponent,
      selectors: [['content-child']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.contentChild, new ContentChildComponent()),
      template: function(fs: RenderFlags, ctx: ParentComponent) {
        if (fs & RenderFlags.Create) {
          text(0, 'content-child');
        }
      },
      features: defs.contentChild &&
          [ProvidersFeature(
              defs.contentChild.providers || [], defs.contentChild.viewProviders || [])],
    });
  }

  class ContentChildDirective {
    static ngComponentDef = defineDirective({
      type: ContentChildDirective,
      selectors: [['content-child']],
      factory: () => testDirectiveInjection(defs.contentChild, new ContentChildDirective()),
      features: defs.contentChild && [ProvidersFeature(defs.contentChild.directiveProviders || [])],
    });
  }


  class ParentComponent {
    static ngComponentDef = defineComponent({
      type: ParentComponent,
      selectors: [['parent']],
      consts: 1,
      vars: 0,
      factory: () => testComponentInjection(defs.parent, new ParentComponent()),
      template: function(fs: RenderFlags, ctx: ParentComponent) {
        if (fs & RenderFlags.Create) {
          element(0, 'view-child');
        }
      },
      features: defs.parent &&
          [ProvidersFeature(defs.parent.providers || [], defs.parent.viewProviders || [])],
      directives: [ViewChildComponent, ViewChildDirective]
    });
  }

  class ParentDirective {
    static ngComponentDef = defineDirective({
      type: ParentDirective,
      selectors: [['parent']],
      factory: () => testDirectiveInjection(defs.parent, new ParentDirective()),
      features: defs.parent && [ProvidersFeature(defs.parent.directiveProviders || [])],
    });
  }

  class ParentDirective2 {
    static ngComponentDef = defineDirective({
      type: ParentDirective2,
      selectors: [['parent']],
      factory: () => testDirectiveInjection(defs.parent, new ParentDirective2()),
      features: defs.parent && [ProvidersFeature(defs.parent.directive2Providers || [])],
    });
  }


  class App {
    static ngComponentDef = defineComponent({
      type: App,
      selectors: [['app']],
      consts: 2,
      vars: 0,
      factory: () => testComponentInjection(defs.app, new App()),
      template: function(fs: RenderFlags, ctx: App) {
        if (fs & RenderFlags.Create) {
          elementStart(0, 'parent');
          element(1, 'content-child');
          elementEnd();
        }
      },
      features:
          defs.app && [ProvidersFeature(defs.app.providers || [], defs.app.viewProviders || [])],
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
