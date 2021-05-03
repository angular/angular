/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, CUSTOM_ELEMENTS_SCHEMA, destroyPlatform, Injectable, InjectionToken, NgModule, NgModuleRef, NO_ERRORS_SCHEMA, ɵsetClassMetadata as setClassMetadata, ɵɵdefineComponent as defineComponent, ɵɵdefineInjector as defineInjector, ɵɵdefineNgModule as defineNgModule, ɵɵelement as element, ɵɵproperty as property} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {modifiedInIvy, onlyInIvy, withBody} from '@angular/private/testing';

describe('NgModule', () => {
  @Component({template: 'hello'})
  class TestCmp {
  }

  @Component({template: 'hello'})
  class TestCmp2 {
  }

  describe('entryComponents', () => {
    it('should throw when specified entry component is not added to a module', () => {
      @NgModule({entryComponents: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).toThrowError(/not part of any NgModule/);
    });

    it('should not throw when specified entry component is added to a module', () => {
      @NgModule({declarations: [TestCmp, TestCmp2], entryComponents: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).not.toThrow();
    });
  });

  describe('bootstrap', () => {
    it('should throw when specified bootstrap component is not added to a module', () => {
      @NgModule({bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).toThrowError(/not part of any NgModule/);
    });

    it('should not throw when specified bootstrap component is added to a module', () => {
      @NgModule({declarations: [TestCmp, TestCmp2], bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).not.toThrow();
    });
  });

  it('initializes the module imports before the module itself', () => {
    @Injectable()
    class Service {
      initializations: string[] = [];
    }
    @NgModule({providers: [Service]})
    class RoutesModule {
      constructor(service: Service) {
        service.initializations.push('RoutesModule');
      }
    }

    @NgModule({imports: [RoutesModule]})
    class AppModule {
      constructor(service: Service) {
        service.initializations.push('AppModule');
      }
    }

    TestBed.configureTestingModule({imports: [AppModule]});
    expect(TestBed.inject(Service).initializations).toEqual(['RoutesModule', 'AppModule']);
  });

  describe('destroy', () => {
    beforeEach(destroyPlatform);
    afterEach(destroyPlatform);

    it('should clear bootstrapped component contents',
       withBody('<div>before</div><button></button><div>after</div>', async () => {
         let wasOnDestroyCalled = false;
         @Component({
           selector: 'button',
           template: 'button content',
         })
         class App {
           ngOnDestroy() {
             wasOnDestroyCalled = true;
           }
         }

         @NgModule({
           imports: [BrowserModule],
           declarations: [App],
           bootstrap: [App],
         })
         class AppModule {
         }
         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(AppModule);

         const button = document.body.querySelector('button')!;
         expect(button.textContent).toEqual('button content');
         expect(document.body.childNodes.length).toEqual(3);

         ngModuleRef.destroy();

         expect(wasOnDestroyCalled).toEqual(true);
         expect(document.body.querySelector('button')).toBeFalsy();  // host element is removed
         expect(document.body.childNodes.length).toEqual(2);         // other elements are preserved
       }));
  });

  describe('schemas', () => {
    onlyInIvy('Unknown property logs an error message instead of throwing')
        .it('should throw on unknown props if NO_ERRORS_SCHEMA is absent', () => {
          @Component({
            selector: 'my-comp',
            template: `
              <ng-container *ngIf="condition">
                <div [unknown-prop]="true"></div>
              </ng-container>
            `,
          })
          class MyComp {
            condition = true;
          }

          @NgModule({
            imports: [CommonModule],
            declarations: [MyComp],
          })
          class MyModule {
          }

          TestBed.configureTestingModule({imports: [MyModule]});

          const spy = spyOn(console, 'error');
          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(spy.calls.mostRecent().args[0])
              .toMatch(/Can't bind to 'unknown-prop' since it isn't a known property of 'div'/);
        });

    modifiedInIvy('Unknown properties throw an error instead of logging a warning')
        .it('should throw on unknown props if NO_ERRORS_SCHEMA is absent', () => {
          @Component({
            selector: 'my-comp',
            template: `
              <ng-container *ngIf="condition">
                <div [unknown-prop]="true"></div>
              </ng-container>
            `,
          })
          class MyComp {
            condition = true;
          }

          @NgModule({
            imports: [CommonModule],
            declarations: [MyComp],
          })
          class MyModule {
          }

          TestBed.configureTestingModule({imports: [MyModule]});

          expect(() => {
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
          }).toThrowError(/Can't bind to 'unknown-prop' since it isn't a known property of 'div'/);
        });

    it('should not throw on unknown props if NO_ERRORS_SCHEMA is present', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [MyComp],
      })
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).not.toThrow();
    });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should log an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element with dash in tag name',
            () => {
              @Component({template: `<custom-el></custom-el>`})
              class MyComp {
              }

              const spy = spyOn(console, 'error');
              TestBed.configureTestingModule({declarations: [MyComp]});
              const fixture = TestBed.createComponent(MyComp);
              fixture.detectChanges();
              expect(spy.calls.mostRecent().args[0]).toMatch(/'custom-el' is not a known element/);
            });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should throw unknown element error without CUSTOM_ELEMENTS_SCHEMA for element with dash in tag name',
            () => {
              @Component({template: `<custom-el></custom-el>`})
              class MyComp {
              }

              TestBed.configureTestingModule({declarations: [MyComp]});

              expect(() => {
                const fixture = TestBed.createComponent(MyComp);
                fixture.detectChanges();
              }).toThrowError(/'custom-el' is not a known element/);
            });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should log an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element without dash in tag name',
            () => {
              @Component({template: `<custom></custom>`})
              class MyComp {
              }

              const spy = spyOn(console, 'error');
              TestBed.configureTestingModule({declarations: [MyComp]});
              const fixture = TestBed.createComponent(MyComp);
              fixture.detectChanges();
              expect(spy.calls.mostRecent().args[0]).toMatch(/'custom' is not a known element/);
            });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should throw unknown element error without CUSTOM_ELEMENTS_SCHEMA for element without dash in tag name',
            () => {
              @Component({template: `<custom></custom>`})
              class MyComp {
              }

              TestBed.configureTestingModule({declarations: [MyComp]});

              expect(() => {
                const fixture = TestBed.createComponent(MyComp);
                fixture.detectChanges();
              }).toThrowError(/'custom' is not a known element/);
            });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should report unknown property bindings on ng-content', () => {
          @Component({template: `<ng-content *unknownProp="123"></ng-content>`})
          class App {
          }

          TestBed.configureTestingModule({declarations: [App]});
          const spy = spyOn(console, 'error');
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(spy.calls.mostRecent()?.args[0])
              .toMatch(
                  /Can't bind to 'unknownProp' since it isn't a known property of 'ng-content'/);
        });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should throw for unknown property bindings on ng-content', () => {
          @Component({template: `<ng-content *unknownProp="123"></ng-content>`})
          class App {
          }

          TestBed.configureTestingModule({declarations: [App]});

          expect(() => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
          })
              .toThrowError(
                  /Can't bind to 'unknownProp' since it isn't a known property of 'ng-content'/);
        });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should report unknown property bindings on ng-container', () => {
          @Component({template: `<ng-container [unknown-prop]="123"></ng-container>`})
          class App {
          }

          TestBed.configureTestingModule({declarations: [App]});
          const spy = spyOn(console, 'error');
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(spy.calls.mostRecent()?.args[0])
              .toMatch(
                  /Can't bind to 'unknown-prop' since it isn't a known property of 'ng-container'/);
        });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should throw for unknown property bindings on ng-container', () => {
          @Component({template: `<ng-container [unknown-prop]="123"></ng-container>`})
          class App {
          }

          TestBed.configureTestingModule({declarations: [App]});

          expect(() => {
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
          })
              .toThrowError(
                  /Can't bind to 'unknown-prop' since it isn't a known property of 'ng-container'/);
        });

    onlyInIvy('test relies on Ivy-specific AOT format').describe('AOT-compiled components', () => {
      function createComponent(
          template: (rf: any) => void, vars: number, consts?: (number|string)[][]) {
        class Comp {
          static ɵfac = () => new Comp();
          static ɵcmp = defineComponent({
            type: Comp,
            selectors: [['comp']],
            decls: 1,
            vars,
            consts,
            template,
            encapsulation: 2
          });
        }
        setClassMetadata(
            Comp, [{
              type: Component,
              args: [
                {selector: 'comp', template: '...'},
              ]
            }],
            null, null);
        return Comp;
      }

      function createNgModule(Comp: any) {
        class Module {
          static ɵmod = defineNgModule({type: Module});
          static ɵinj = defineInjector({});
        }
        setClassMetadata(
            Module, [{
              type: NgModule,
              args: [{
                declarations: [Comp],
                schemas: [NO_ERRORS_SCHEMA],
              }]
            }],
            null, null);
        return Module;
      }

      it('should not log unknown element warning for AOT-compiled components', () => {
        const spy = spyOn(console, 'warn');

        /*
         *  @Component({
         *    selector: 'comp',
         *    template: '<custom-el></custom-el>',
         *  })
         *  class MyComp {}
         */
        const MyComp = createComponent((rf: any) => {
          if (rf & 1) {
            element(0, 'custom-el');
          }
        }, 0);

        /*
         *  @NgModule({
         *    declarations: [MyComp],
         *    schemas: [NO_ERRORS_SCHEMA],
         *  })
         *  class MyModule {}
         */
        const MyModule = createNgModule(MyComp);

        TestBed.configureTestingModule({
          imports: [MyModule],
        });

        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
        expect(spy).not.toHaveBeenCalled();
      });

      it('should not log unknown property warning for AOT-compiled components', () => {
        const spy = spyOn(console, 'warn');

        /*
         *  @Component({
         *    selector: 'comp',
         *    template: '<div [foo]="1"></div>',
         *  })
         *  class MyComp {}
         */
        const MyComp = createComponent((rf: any) => {
          if (rf & 1) {
            element(0, 'div', 0);
          }
          if (rf & 2) {
            property('foo', true);
          }
        }, 1, [[3, 'foo']]);

        /*
         *  @NgModule({
         *    declarations: [MyComp],
         *    schemas: [NO_ERRORS_SCHEMA],
         *  })
         *  class MyModule {}
         */
        const MyModule = createNgModule(MyComp);

        TestBed.configureTestingModule({
          imports: [MyModule],
        });

        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();

        expect(spy).not.toHaveBeenCalled();
      });
    });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should not log an error about unknown elements with CUSTOM_ELEMENTS_SCHEMA', () => {
          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          const spy = spyOn(console, 'error');
          TestBed.configureTestingModule({
            declarations: [MyComp],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
          });

          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(spy).not.toHaveBeenCalled();
        });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should not throw unknown element error with CUSTOM_ELEMENTS_SCHEMA', () => {
          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          TestBed.configureTestingModule({
            declarations: [MyComp],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
          });

          expect(() => {
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
          }).not.toThrow();
        });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should not log an error about unknown elements with NO_ERRORS_SCHEMA', () => {
          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          const spy = spyOn(console, 'error');
          TestBed.configureTestingModule({
            declarations: [MyComp],
            schemas: [NO_ERRORS_SCHEMA],
          });

          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(spy).not.toHaveBeenCalled();
        });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should not throw unknown element error with NO_ERRORS_SCHEMA', () => {
          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          TestBed.configureTestingModule({
            declarations: [MyComp],
            schemas: [NO_ERRORS_SCHEMA],
          });

          expect(() => {
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
          }).not.toThrow();
        });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should not log an error about unknown elements if element matches a directive', () => {
          @Component({
            selector: 'custom-el',
            template: '',
          })
          class CustomEl {
          }

          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          const spy = spyOn(console, 'error');
          TestBed.configureTestingModule({declarations: [MyComp, CustomEl]});

          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(spy).not.toHaveBeenCalled();
        });

    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should not throw unknown element error if element matches a directive', () => {
          @Component({
            selector: 'custom-el',
            template: '',
          })
          class CustomEl {
          }

          @Component({template: `<custom-el></custom-el>`})
          class MyComp {
          }

          TestBed.configureTestingModule({declarations: [MyComp, CustomEl]});

          expect(() => {
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
          }).not.toThrow();
        });

    onlyInIvy('unknown element check logs an error message rather than throwing')
        .it('should not log an error for HTML elements inside an SVG foreignObject', () => {
          @Component({
            template: `
          <svg>
            <svg:foreignObject>
              <xhtml:div>Hello</xhtml:div>
            </svg:foreignObject>
          </svg>
        `,
          })
          class MyComp {
          }

          @NgModule({declarations: [MyComp]})
          class MyModule {
          }

          const spy = spyOn(console, 'error');
          TestBed.configureTestingModule({imports: [MyModule]});

          const fixture = TestBed.createComponent(MyComp);
          fixture.detectChanges();
          expect(spy).not.toHaveBeenCalled();
        });


    modifiedInIvy('unknown element error thrown instead of warning')
        .it('should not throw for HTML elements inside an SVG foreignObject', () => {
          @Component({
            template: `
          <svg>
            <svg:foreignObject>
              <xhtml:div>Hello</xhtml:div>
            </svg:foreignObject>
          </svg>
        `,
          })
          class MyComp {
          }

          @NgModule({declarations: [MyComp]})
          class MyModule {
          }

          TestBed.configureTestingModule({imports: [MyModule]});

          expect(() => {
            const fixture = TestBed.createComponent(MyComp);
            fixture.detectChanges();
          }).not.toThrow();
        });
  });

  it('should be able to use DI through the NgModuleRef inside the module constructor', () => {
    const token = new InjectionToken<string>('token');
    let value: string|undefined;

    @NgModule({
      imports: [CommonModule],
      providers: [{provide: token, useValue: 'foo'}],
    })
    class TestModule {
      constructor(ngRef: NgModuleRef<TestModule>) {
        value = ngRef.injector.get(token);
      }
    }

    TestBed.configureTestingModule({imports: [TestModule], declarations: [TestCmp]});
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();

    expect(value).toBe('foo');
  });

  it('should be able to create a component through the ComponentFactoryResolver of an NgModuleRef in a module constructor',
     () => {
       let componentInstance: TestCmp|undefined;

       @NgModule({
         declarations: [TestCmp],
         exports: [TestCmp],
         entryComponents: [TestCmp]  // Only necessary for ViewEngine
       })
       class MyModule {
         constructor(ngModuleRef: NgModuleRef<any>) {
           const factory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(TestCmp);
           componentInstance = factory.create(ngModuleRef.injector).instance;
         }
       }

       TestBed.configureTestingModule({imports: [MyModule]});
       TestBed.createComponent(TestCmp);
       expect(componentInstance).toBeAnInstanceOf(TestCmp);
     });
});
