/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component as _Component, ComponentFactoryResolver, ElementRef, Injectable as _Injectable, InjectFlags, InjectionToken, InjectorType, Provider, RendererFactory2, Type, ViewContainerRef, ɵɵdefineInjectable, ɵɵdefineInjector, ɵɵdefineNgModule, ɵɵinject} from '../../src/core';
import {forwardRef} from '../../src/di/forward_ref';
import {createInjector} from '../../src/di/r3_injector';
import {injectComponentFactoryResolver, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdirectiveInject, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵgetInheritedFactory, ɵɵProvidersFeature, ɵɵtext, ɵɵtextInterpolate1} from '../../src/render3/index';
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
    abstract class Greeter {
      abstract greet: string;
    }

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
            expect(ɵɵdirectiveInject(GreeterClass).greet).toEqual('Class');
          }
        }
      });
    });

    it('ValueProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useValue: {greet: 'Value'}}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Value');
          }
        }
      });
    });

    it('ClassProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: GREETER, useClass: GreeterClass}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class');
          }
        }
      });
    });

    it('ExistingProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useExisting: GreeterClass}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class');
          }
        }
      });
    });

    it('FactoryProvider', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterClass, {provide: GREETER, useFactory: () => new GreeterClass()}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class');
          }
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message');
          }
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message from PARENT');
          }
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message');
          }
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Message from PARENT');
          }
        }
      });
    });

    it('ClassProvider with injectable', () => {
      expectProvidersScenario({
        parent: {
          providers: [GreeterProvider, {provide: GREETER, useClass: GreeterInj}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Provided');
          }
        }
      });
    });

    describe('forwardRef', () => {
      it('forwardRef resolves later', (done) => {
        setTimeout(() => {
          expectProvidersScenario({
            parent: {
              providers: [forwardRef(() => ForLater)],
              componentAssertion: () => {
                expect(ɵɵdirectiveInject(ForLater) instanceof ForLater).toBeTruthy();
              }
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
            providers: [{
              provide: GREETER,
              useValue: forwardRef(() => {
                return {greet: 'Value'};
              })
            }],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Value');
            }
          }
        });
      });

      it('ClassProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: GREETER, useClass: forwardRef(() => GreeterClass)}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class');
            }
          }
        });
      });

      it('ExistingProvider wrapped in forwardRef', () => {
        expectProvidersScenario({
          parent: {
            providers:
                [GreeterClass, {provide: GREETER, useExisting: forwardRef(() => GreeterClass)}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(GREETER).greet).toEqual('Class');
            }
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('viewProviders should override providers', () => {
      expectProvidersScenario({
        parent: {
          providers: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('viewProviders should override directiveProviders', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders: [{provide: String, useValue: 'Message 1'}],
          viewProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('last declared directive should override other directives', () => {
      expectProvidersScenario({
        parent: {
          directive2Providers: [{provide: String, useValue: 'Message 1'}],
          directiveProviders: [{provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('last provider should override previous one in component providers', () => {
      expectProvidersScenario({
        parent: {
          providers:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('last provider should override previous one in component view providers', () => {
      expectProvidersScenario({
        parent: {
          viewProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });

    it('last provider should override previous one in directive providers', () => {
      expectProvidersScenario({
        parent: {
          directiveProviders:
              [{provide: String, useValue: 'Message 1'}, {provide: String, useValue: 'Message 2'}],
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(String)).toEqual('Message 2');
          }
        }
      });
    });
  });

  describe('single', () => {
    class MyModule {
      static ɵinj = ɵɵdefineInjector({providers: [{provide: String, useValue: 'From module'}]});
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From module');
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with both providers and viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers'}],
            viewProviders: [{provide: String, useValue: 'From viewProviders'}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From providers');
            }
          },
          ngModule: MyModule
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
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
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
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
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
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
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
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From viewProviders');
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual('From directive');
            }
          },
          ngModule: MyModule
        });
      });
    });
  });

  describe('multi', () => {
    class MyModule {
      static ɵinj =
          ɵɵdefineInjector({providers: [{provide: String, useValue: 'From module', multi: true}]});
    }

    describe('without directives', () => {
      it('should work without providers nor viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only providers in component', () => {
        expectProvidersScenario({
          parent: {
            providers: [{provide: String, useValue: 'From providers', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            }
          },
          ngModule: MyModule
        });
      });

      it('should work with only viewProviders in component', () => {
        expectProvidersScenario({
          parent: {
            viewProviders: [{provide: String, useValue: 'From viewProviders', multi: true}],
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            }
          },
          viewChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From viewProviders']);
            }
          },
          contentChild: {
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From module']);
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
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers', 'From viewProviders']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            }
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
            componentAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            },
            directiveAssertion: () => {
              expect(ɵɵdirectiveInject(String)).toEqual(['From providers']);
            }
          },
          ngModule: MyModule
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
        static ɵprov = ɵɵdefineInjectable({
          token: FooForRoot,
          factory: () => new FooForRoot(),
          providedIn: 'root',
        });
      }

      expectProvidersScenario({
        parent: {
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(FooForRoot) instanceof FooForRoot).toBeTruthy();
          }
        }
      });
    });

    it('should work with a module', () => {
      class MyModule {
        static ɵinj = ɵɵdefineInjector({providers: [{provide: String, useValue: 'From module'}]});
      }

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
            expect(ɵɵdirectiveInject(FooForModule) instanceof FooForModule).toBeTruthy();
          }
        },
        ngModule: MyModule
      });
    });
  });

  describe('- dynamic components dependency resolution', () => {
    let hostComponent: HostComponent|null = null;

    @Component({
      template: `{{s}}`,
    })
    class EmbeddedComponent {
      constructor(private s: String) {}

      static ɵfac = () => new EmbeddedComponent(ɵɵdirectiveInject(String));
      static ɵcmp = ɵɵdefineComponent({
        type: EmbeddedComponent,
        selectors: [['embedded-cmp']],
        decls: 1,
        vars: 1,
        template:
            (rf: RenderFlags, cmp: EmbeddedComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵtext(0);
              }
              if (rf & RenderFlags.Update) {
                ɵɵtextInterpolate1('', cmp.s, '');
              }
            }
      });
    }

    @Component({template: `foo`, providers: [{provide: String, useValue: 'From host component'}]})
    class HostComponent {
      constructor(public vcref: ViewContainerRef, public cfr: ComponentFactoryResolver) {}

      static ɵfac = () => hostComponent = new HostComponent(
          ɵɵdirectiveInject(ViewContainerRef as any), injectComponentFactoryResolver())

          static ɵcmp = ɵɵdefineComponent({
            type: HostComponent,
            selectors: [['host-cmp']],
            decls: 1,
            vars: 0,
            template:
                (rf: RenderFlags, cmp: HostComponent) => {
                  if (rf & RenderFlags.Create) {
                    ɵɵtext(0, 'foo');
                  }
                },
            features:
                [
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

      static ɵfac = () => new AppComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: AppComponent,
        selectors: [['app-cmp']],
        decls: 1,
        vars: 0,
        template:
            (rf: RenderFlags, cmp: AppComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'host-cmp');
              }
            },
        features:
            [
              ɵɵProvidersFeature([{provide: String, useValue: 'From app component'}]),
            ],
        directives: [HostComponent]
      });
    }

    it('should not cross the root view boundary, and use the root view injector', () => {
      const fixture = new ComponentFixture(AppComponent);
      expect(fixture.html).toEqual('<host-cmp>foo</host-cmp>');

      hostComponent!.vcref.createComponent(
          hostComponent!.cfr.resolveComponentFactory(EmbeddedComponent), undefined, {
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
           static ɵinj = ɵɵdefineInjector({
             imports: [],
             providers:
                 [
                   {provide: RendererFactory2, useValue: getRendererFactory2(document)},
                   {provide: String, useValue: 'From module injector'}
                 ]
           });
           static ɵmod = ɵɵdefineNgModule({type: MyAppModule});
         }
         const myAppModuleFactory = new NgModuleFactory(MyAppModule);
         const ngModuleRef = myAppModuleFactory.create(null);

         hostComponent!.vcref.createComponent(
             hostComponent!.cfr.resolveComponentFactory(EmbeddedComponent), undefined,
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

         hostComponent!.vcref.createComponent(
             hostComponent!.cfr.resolveComponentFactory(EmbeddedComponent));
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

           static ɵprov = ɵɵdefineInjectable({
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
        static ɵprov = ɵɵdefineInjectable({
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
          componentAssertion: () => {
            expect(ɵɵdirectiveInject(Greeter).greeting).toEqual('parent');
          },
        },
      });
    });
  });

  describe('injection flags', () => {
    class MyModule {
      static ɵinj = ɵɵdefineInjector({providers: [{provide: String, useValue: 'Module'}]});
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
    abstract class Some {
      abstract location: String;
    }

    class SomeInj implements Some {
      constructor(public location: String) {}

      static ɵprov = ɵɵdefineInjectable({
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

      static ɵfac = () => new MyComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: MyComponent,
        selectors: [['my-cmp']],
        decls: 1,
        vars: 0,
        template:
            (rf: RenderFlags, cmp: MyComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'p');
              }
            },
        features:
            [
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

      static ɵfac = () => new AppComponent();
      static ɵcmp = ɵɵdefineComponent({
        type: AppComponent,
        selectors: [['app-cmp']],
        decls: 1,
        vars: 0,
        template:
            (rf: RenderFlags, cmp: AppComponent) => {
              if (rf & RenderFlags.Create) {
                ɵɵelement(0, 'my-cmp');
              }
            },
        features:
            [
              ɵɵProvidersFeature([
                {provide: String, useValue: 'From app component'},
                {provide: Some, useClass: SomeInj}
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

  // Note: these tests check the behavior of `getInheritedFactory` specifically.
  // Since `getInheritedFactory` is only generated in AOT, the tests can't be
  // ported directly to TestBed while running in JIT mode.
  describe('getInheritedFactory on class with custom decorator', () => {
    function addFoo() {
      return (constructor: Type<any>): any => {
        const decoratedClass = class Extender extends constructor { foo = 'bar'; };
        return decoratedClass;
      };
    }

    it('should find the correct factories if a parent class has a custom decorator', () => {
      class GrandParent {
        static ɵfac = function GrandParent_Factory() {};
      }

      @addFoo()
      class Parent extends GrandParent {
        static ɵfac = function Parent_Factory() {};
      }

      class Child extends Parent {
        static ɵfac = function Child_Factory() {};
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
        static ɵfac = function Parent_Factory() {};
      }

      @addFoo()
      class Child extends Parent {
        static ɵfac = function Child_Factory() {};
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
        static ɵfac = function Parent_Factory() {};
      }

      class Child extends Parent {
        static ɵfac = function Child_Factory() {};
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
        static ɵfac = function Parent_Factory() {};
      }

      @addFoo()
      class Child extends Parent {
        static ɵfac = function Child_Factory() {};
      }

      expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
      expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
      expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
    });

    it('should find the correct factories if parent and grandparent classes have a custom decorator',
       () => {
         @addFoo()
         class GrandParent {
           static ɵfac = function GrandParent_Factory() {};
         }

         @addFoo()
         class Parent extends GrandParent {
           static ɵfac = function Parent_Factory() {};
         }

         class Child extends Parent {
           static ɵfac = function Child_Factory() {};
         }

         expect(ɵɵgetInheritedFactory(Child).name).toBe('Parent_Factory');
         expect(ɵɵgetInheritedFactory(Parent).name).toBe('GrandParent_Factory');
         expect(ɵɵgetInheritedFactory(GrandParent).name).toBeFalsy();
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
  function testComponentInjection<T>(def: ComponentTest|undefined, instance: T): T {
    if (def) {
      def.componentAssertion && def.componentAssertion();
    }
    return instance;
  }

  function testDirectiveInjection<T>(def: ComponentTest|undefined, instance: T): T {
    if (def) {
      def.directiveAssertion && def.directiveAssertion();
    }
    return instance;
  }

  class ViewChildComponent {
    static ɵfac = () => testComponentInjection(defs.viewChild, new ViewChildComponent());
    static ɵcmp = ɵɵdefineComponent({
      type: ViewChildComponent,
      selectors: [['view-child']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ViewChildComponent) {
            if (fs & RenderFlags.Create) {
              ɵɵtext(0, 'view-child');
            }
          },
      features: defs.viewChild &&
          [ɵɵProvidersFeature(defs.viewChild.providers || [], defs.viewChild.viewProviders || [])]
    });
  }

  class ViewChildDirective {
    static ɵfac = () => testDirectiveInjection(defs.viewChild, new ViewChildDirective());
    static ɵdir = ɵɵdefineDirective({
      type: ViewChildDirective,
      selectors: [['view-child']],
      features: defs.viewChild && [ɵɵProvidersFeature(defs.viewChild.directiveProviders || [])],
    });
  }

  class ContentChildComponent {
    static ɵfac =
        () => {
          return testComponentInjection(defs.contentChild, new ContentChildComponent());
        }

    static ɵcmp = ɵɵdefineComponent({
      type: ContentChildComponent,
      selectors: [['content-child']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ParentComponent) {
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
    static ɵfac =
        () => {
          return testDirectiveInjection(defs.contentChild, new ContentChildDirective());
        }

    static ɵdir = ɵɵdefineDirective({
      type: ContentChildDirective,
      selectors: [['content-child']],
      features: defs.contentChild &&
          [ɵɵProvidersFeature(defs.contentChild.directiveProviders || [])],
    });
  }


  class ParentComponent {
    static ɵfac = () => testComponentInjection(defs.parent, new ParentComponent());
    static ɵcmp = ɵɵdefineComponent({
      type: ParentComponent,
      selectors: [['parent']],
      decls: 1,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: ParentComponent) {
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
    static ɵfac = () => testDirectiveInjection(defs.parent, new ParentDirective());
    static ɵdir = ɵɵdefineDirective({
      type: ParentDirective,
      selectors: [['parent']],
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directiveProviders || [])],
    });
  }

  class ParentDirective2 {
    static ɵfac = () => testDirectiveInjection(defs.parent, new ParentDirective2());
    static ɵdir = ɵɵdefineDirective({
      type: ParentDirective2,
      selectors: [['parent']],
      features: defs.parent && [ɵɵProvidersFeature(defs.parent.directive2Providers || [])],
    });
  }


  class App {
    static ɵfac = () => testComponentInjection(defs.app, new App());
    static ɵcmp = ɵɵdefineComponent({
      type: App,
      selectors: [['app']],
      decls: 2,
      vars: 0,
      template:
          function(fs: RenderFlags, ctx: App) {
            if (fs & RenderFlags.Create) {
              ɵɵelementStart(0, 'parent');
              ɵɵelement(1, 'content-child');
              ɵɵelementEnd();
            }
          },
      features: defs.app &&
          [ɵɵProvidersFeature(defs.app.providers || [], defs.app.viewProviders || [])],
      directives:
          [
            ParentComponent, ParentDirective2, ParentDirective, ContentChildComponent,
            ContentChildDirective
          ]
    });
  }


  const fixture = new ComponentFixture(
      App, {injector: defs.ngModule ? createInjector(defs.ngModule) : undefined});
  expect(fixture.html).toEqual('<parent><view-child>view-child</view-child></parent>');
}
