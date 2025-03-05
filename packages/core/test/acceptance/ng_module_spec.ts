/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  Component,
  createNgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  destroyPlatform,
  Directive,
  Injectable,
  InjectionToken,
  NgModule,
  NgModuleRef,
  NO_ERRORS_SCHEMA,
  Pipe,
  ɵsetClassMetadata as setClassMetadata,
  ɵɵdefineComponent as defineComponent,
  ɵɵdefineInjector as defineInjector,
  ɵɵdefineNgModule as defineNgModule,
  ɵɵelement as element,
  ɵɵproperty as property,
} from '../../src/core';
import {KNOWN_CONTROL_FLOW_DIRECTIVES} from '../../src/render3/instructions/element_validation';
import {TestBed} from '../../testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {withBody} from '@angular/private/testing';

describe('NgModule', () => {
  @Component({
    template: 'hello',
    standalone: false,
  })
  class TestCmp {}

  @Component({
    template: 'hello',
    standalone: false,
  })
  class TestCmp2 {}

  describe('bootstrap', () => {
    it('should throw when specified bootstrap component is not added to a module', () => {
      @NgModule({bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(TestCmp);
        TestBed.createComponent(TestCmp2);
      }).toThrowError(/not part of any NgModule/);
    });

    it('should not throw when specified bootstrap component is added to a module', () => {
      @NgModule({declarations: [TestCmp, TestCmp2], bootstrap: [TestCmp, [TestCmp2]]})
      class MyModule {}

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

  describe('standalone components, directives, and pipes', () => {
    it('should throw when a standalone component is added to NgModule declarations', () => {
      @Component({
        selector: 'my-comp',
        template: '',
      })
      class MyComp {}

      @NgModule({
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(MyComp);
      }).toThrowError(
        `Unexpected "MyComp" found in the "declarations" array of the "MyModule" NgModule, "MyComp" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`,
      );
    });

    it('should throw when a standalone directive is added to NgModule declarations', () => {
      @Directive({
        selector: '[my-dir]',
      })
      class MyDir {}

      @Component({
        selector: 'my-comp',
        template: '',
        standalone: false,
      })
      class MyComp {}

      @NgModule({
        declarations: [MyDir],
      })
      class MyModule {}

      TestBed.configureTestingModule({declarations: [MyComp], imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(MyComp);
      }).toThrowError(
        `Unexpected "MyDir" found in the "declarations" array of the "MyModule" NgModule, "MyDir" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`,
      );
    });

    it('should throw when a standalone pipe is added to NgModule declarations', () => {
      @Pipe({
        name: 'my-pipe',
      })
      class MyPipe {}

      @Component({
        selector: 'my-comp',
        template: '',
        standalone: false,
      })
      class MyComp {}

      @NgModule({
        declarations: [MyPipe],
      })
      class MyModule {}

      TestBed.configureTestingModule({declarations: [MyComp], imports: [MyModule]});

      expect(() => {
        TestBed.createComponent(MyComp);
      }).toThrowError(
        `Unexpected "MyPipe" found in the "declarations" array of the "MyModule" NgModule, "MyPipe" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`,
      );
    });

    it('should throw a testing specific error when a standalone component is added to the configureTestingModule declarations', () => {
      @Component({
        selector: 'my-comp',
        template: '',
      })
      class MyComp {}

      expect(() => {
        TestBed.configureTestingModule({declarations: [MyComp]});
      }).toThrowError(
        `Unexpected "MyComp" found in the "declarations" array of the "TestBed.configureTestingModule" call, "MyComp" is marked as standalone and can't be declared in any NgModule - did you intend to import it instead (by adding it to the "imports" array)?`,
      );
    });
  });

  describe('destroy', () => {
    beforeEach(destroyPlatform);
    afterEach(destroyPlatform);

    it(
      'should clear bootstrapped component contents',
      withBody('<div>before</div><button></button><div>after</div>', async () => {
        let wasOnDestroyCalled = false;
        @Component({
          selector: 'button',
          template: 'button content',
          standalone: false,
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
        class AppModule {}
        const ngModuleRef = await platformBrowserDynamic().bootstrapModule(AppModule);

        const button = document.body.querySelector('button')!;
        expect(button.textContent).toEqual('button content');
        expect(document.body.childNodes.length).toEqual(3);

        ngModuleRef.destroy();

        expect(wasOnDestroyCalled).toEqual(true);
        expect(document.body.querySelector('button')).toBeFalsy(); // host element is removed
        expect(document.body.childNodes.length).toEqual(2); // other elements are preserved
      }),
    );
  });

  describe('schemas', () => {
    it('should log an error on unknown props if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toMatch(
        /Can't bind to 'unknown-prop' since it isn't a known property of 'div' \(used in the 'MyComp' component template\)/,
      );
    });

    it('should log an error on unknown props of `ng-template` if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: ` <ng-template *ngIf="condition"></ng-template> `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(spy.calls.mostRecent().args[0]).toMatch(
        /Can't bind to 'ngIf' since it isn't a known property of 'ng-template' \(used in the 'MyComp' component template\)/,
      );
    });

    it('should log an error on unknown props of `ng-container` if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: ` <ng-container *ngIf="condition"></ng-container> `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(spy.calls.mostRecent().args[0]).toMatch(
        /Can't bind to 'ngIf' since it isn't a known property of 'ng-container' \(used in the 'MyComp' component template\)/,
      );
    });

    it('should log an error on unknown props of `ng-content` if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: ` <ng-content *ngIf="condition"></ng-content> `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      expect(spy.calls.mostRecent().args[0]).toMatch(
        /Can't bind to 'ngIf' since it isn't a known property of 'ng-content' \(used in the 'MyComp' component template\)/,
      );
    });

    it('should throw an error with errorOnUnknownProperties on unknown props if NO_ERRORS_SCHEMA is absent', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule], errorOnUnknownProperties: true});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).toThrowError(
        /NG0303: Can't bind to 'unknown-prop' since it isn't a known property of 'div' \(used in the 'MyComp' component template\)/g,
      );
    });

    it('should not throw on unknown props if NO_ERRORS_SCHEMA is present', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not throw on unknown props with errorOnUnknownProperties if NO_ERRORS_SCHEMA is present', () => {
      @Component({
        selector: 'my-comp',
        template: `
          <ng-container *ngIf="condition">
            <div [unknown-prop]="true"></div>
          </ng-container>
        `,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        imports: [CommonModule],
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [MyComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule], errorOnUnknownProperties: true});

      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should log an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element with dash in tag name', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toMatch(/'custom-el' is not a known element/);
    });

    it('should log an error about unknown element for a standalone component without CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({imports: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toMatch(/'custom-el' is not a known element/);
    });

    it('should not log an error about unknown element for a standalone component with CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({imports: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should throw an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element with dash in tag name', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [MyComp], errorOnUnknownElements: true});
      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).toThrowError(/NG0304: 'custom-el' is not a known element/g);
    });

    it('should log an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element without dash in tag name', () => {
      @Component({
        template: `<custom></custom>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({declarations: [MyComp]});
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy.calls.mostRecent().args[0]).toMatch(/'custom' is not a known element/);
    });

    it('should throw an error about unknown element without CUSTOM_ELEMENTS_SCHEMA for element without dash in tag name', () => {
      @Component({
        template: `<custom></custom>`,
        standalone: false,
      })
      class MyComp {}

      TestBed.configureTestingModule({declarations: [MyComp], errorOnUnknownElements: true});
      expect(() => {
        const fixture = TestBed.createComponent(MyComp);
        fixture.detectChanges();
      }).toThrowError(/NG0304: 'custom' is not a known element/g);
    });

    it('should report unknown property bindings on ng-content', () => {
      @Component({
        template: `<ng-content *unknownProp="123"></ng-content>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(spy.calls.mostRecent()?.args[0]).toMatch(
        /Can't bind to 'unknownProp' since it isn't a known property of 'ng-content' \(used in the 'App' component template\)/,
      );
    });

    it('should throw an error on unknown property bindings on ng-content when errorOnUnknownProperties is enabled', () => {
      @Component({
        template: `<ng-content *unknownProp="123"></ng-content>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App], errorOnUnknownProperties: true});
      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(
        /NG0303: Can't bind to 'unknownProp' since it isn't a known property of 'ng-content' \(used in the 'App' component template\)/g,
      );
    });

    it('should report unknown property bindings on ng-container', () => {
      @Component({
        template: `<ng-container [unknown-prop]="123"></ng-container>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App]});
      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(spy.calls.mostRecent()?.args[0]).toMatch(
        /Can't bind to 'unknown-prop' since it isn't a known property of 'ng-container' \(used in the 'App' component template\)/,
      );
    });

    it('should throw error on unknown property bindings on ng-container when errorOnUnknownProperties is enabled', () => {
      @Component({
        template: `<ng-container [unknown-prop]="123"></ng-container>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({declarations: [App], errorOnUnknownProperties: true});
      expect(() => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
      }).toThrowError(
        /NG0303: Can't bind to 'unknown-prop' since it isn't a known property of 'ng-container' \(used in the 'App' component template\)/g,
      );
    });

    it('should log an error on unknown props and include a note on Web Components', () => {
      @Component({
        selector: 'may-be-web-component',
        template: `...`,
        standalone: false,
      })
      class MaybeWebComp {}

      @Component({
        selector: 'my-comp',
        template: `<may-be-web-component [unknownProp]="condition"></may-be-web-component>`,
        standalone: false,
      })
      class MyComp {
        condition = true;
      }

      @NgModule({
        declarations: [MyComp, MaybeWebComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const spy = spyOn(console, 'error');
      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      const errorMessage = spy.calls.mostRecent().args[0];

      // Split the error message into chunks, so it's easier to debug if needed.
      const lines = [
        `NG0303: Can't bind to 'unknownProp' since it isn't a known property of 'may-be-web-component' \\(used in the 'MyComp' component template\\).`,
        `1. If 'may-be-web-component' is an Angular component and it has the 'unknownProp' input, then verify that it is a part of an @NgModule where this component is declared.`,
        `2. If 'may-be-web-component' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`,
        `3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`,
      ];
      lines.forEach((line) => expect(errorMessage).toMatch(line));
    });

    KNOWN_CONTROL_FLOW_DIRECTIVES.forEach((correspondingImport, directive) => {
      it(
        `should produce a warning when the '${directive}' directive ` +
          `is used in a template, but not imported in corresponding NgModule`,
        () => {
          @Component({
            template: `<div *${directive}="expr"></div>`,
            standalone: false,
          })
          class App {
            expr = true;
          }

          @NgModule({
            declarations: [App],
          })
          class Module {}

          TestBed.configureTestingModule({imports: [Module]});
          const spy = spyOn(console, 'error');
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const errorMessage = spy.calls.mostRecent()?.args[0];

          // Split the error message into chunks, so it's easier to debug if needed.
          const lines = [
            `NG0303: Can't bind to '${directive}' since it isn't a known property of 'div' \\(used in the 'App' component template\\).`,
            `If the '${directive}' is an Angular control flow directive, please make sure ` +
              `that either the '${correspondingImport}' directive or the 'CommonModule' is a part of an @NgModule where this component is declared.`,
          ];
          lines.forEach((line) => expect(errorMessage).toMatch(line));
        },
      );

      it(
        `should produce a warning when the '${directive}' directive ` +
          `is used in a template, but not imported in a standalone component`,
        () => {
          @Component({
            template: `<div *${directive}="expr"></div>`,
          })
          class App {
            expr = true;
          }

          const spy = spyOn(console, 'error');
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const errorMessage = spy.calls.mostRecent()?.args[0];

          // Split the error message into chunks, so it's easier to debug if needed.
          const lines = [
            `NG0303: Can't bind to '${directive}' since it isn't a known property of 'div' \\(used in the 'App' component template\\).`,
            `If the '${directive}' is an Angular control flow directive, please make sure ` +
              `that either the '${correspondingImport}' directive or the 'CommonModule' is included in the '@Component.imports' of this component.`,
          ];
          lines.forEach((line) => expect(errorMessage).toMatch(line));
        },
      );
    });

    describe('AOT-compiled components', () => {
      function createComponent(
        template: (rf: any) => void,
        vars: number,
        consts?: (number | string)[][],
      ) {
        class Comp {
          static ɵfac = () => new Comp();
          static ɵcmp = defineComponent({
            type: Comp,
            selectors: [['comp']],
            decls: 1,
            vars,
            consts,
            template,
            encapsulation: 2,
          });
        }
        setClassMetadata(
          Comp,
          [
            {
              type: Component,
              args: [{selector: 'comp', template: '...'}],
            },
          ],
          null,
          null,
        );
        return Comp;
      }

      function createNgModule(Comp: any) {
        class Module {
          static ɵmod = defineNgModule({type: Module});
          static ɵinj = defineInjector({});
        }
        setClassMetadata(
          Module,
          [
            {
              type: NgModule,
              args: [
                {
                  declarations: [Comp],
                  schemas: [NO_ERRORS_SCHEMA],
                },
              ],
            },
          ],
          null,
          null,
        );
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
        const MyComp = createComponent(
          (rf: any) => {
            if (rf & 1) {
              element(0, 'div', 0);
            }
            if (rf & 2) {
              property('foo', true);
            }
          },
          1,
          [[3, 'foo']],
        );

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

    it('should not log an error about unknown elements with CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({
        declarations: [MyComp],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not throw an error about unknown elements with CUSTOM_ELEMENTS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({
        declarations: [MyComp],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        errorOnUnknownElements: true,
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      // We do not expect any errors being thrown or logged in a console,
      // since the `CUSTOM_ELEMENTS_SCHEMA` is applied.
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not log an error about unknown elements with NO_ERRORS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({
        declarations: [MyComp],
        schemas: [NO_ERRORS_SCHEMA],
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not throw an error about unknown elements with NO_ERRORS_SCHEMA', () => {
      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({
        declarations: [MyComp],
        schemas: [NO_ERRORS_SCHEMA],
        errorOnUnknownElements: true,
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      // We do not expect any errors being thrown or logged in a console,
      // since the `NO_ERRORS_SCHEMA` is applied.
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not log an error about unknown elements if element matches a directive', () => {
      @Component({
        selector: 'custom-el',
        template: '',
        standalone: false,
      })
      class CustomEl {}

      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({declarations: [MyComp, CustomEl]});

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not throw an error about unknown elements if element matches a directive', () => {
      @Component({
        selector: 'custom-el',
        template: '',
        standalone: false,
      })
      class CustomEl {}

      @Component({
        template: `<custom-el></custom-el>`,
        standalone: false,
      })
      class MyComp {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({
        declarations: [MyComp, CustomEl],
        errorOnUnknownElements: true,
      });

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      // We do not expect any errors being thrown or logged in a console,
      // since the element matches a directive.
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not log an error for HTML elements inside an SVG foreignObject', () => {
      @Component({
        template: `
          <svg>
            <svg:foreignObject>
              <xhtml:div>Hello</xhtml:div>
            </svg:foreignObject>
          </svg>
        `,
        standalone: false,
      })
      class MyComp {}

      @NgModule({declarations: [MyComp]})
      class MyModule {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({imports: [MyModule]});

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not throw an error for HTML elements inside an SVG foreignObject', () => {
      @Component({
        template: `
          <svg>
            <svg:foreignObject>
              <xhtml:div>Hello</xhtml:div>
            </svg:foreignObject>
          </svg>
        `,
        standalone: false,
      })
      class MyComp {}

      @NgModule({declarations: [MyComp]})
      class MyModule {}

      const spy = spyOn(console, 'error');
      TestBed.configureTestingModule({imports: [MyModule], errorOnUnknownElements: true});

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();
      // We do not expect any errors being thrown or logged in a console,
      // since the element is inside an SVG foreignObject.
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('createNgModule function', () => {
    it('should create an NgModuleRef instance', () => {
      const TOKEN_A = new InjectionToken('A');
      const TOKEN_B = new InjectionToken('B');
      @NgModule({
        providers: [{provide: TOKEN_A, useValue: 'TokenValueA'}],
      })
      class AppModule {}

      @NgModule({
        providers: [{provide: TOKEN_B, useValue: 'TokenValueB'}],
      })
      class ChildModule {}

      // Simple case, just passing NgModule class.
      const ngModuleRef = createNgModule(AppModule);
      expect(ngModuleRef).toBeInstanceOf(NgModuleRef);
      expect(ngModuleRef.injector.get(TOKEN_A)).toBe('TokenValueA');
      expect(ngModuleRef.injector.get(TOKEN_B, null)).toBe(null);

      // Both NgModule and parent Injector are present.
      const ngModuleRef2 = createNgModule(ChildModule, ngModuleRef.injector /* parent injector */);
      expect(ngModuleRef2).toBeInstanceOf(NgModuleRef);
      expect(ngModuleRef2.injector.get(TOKEN_A)).toBe('TokenValueA');
      expect(ngModuleRef2.injector.get(TOKEN_B)).toBe('TokenValueB');
    });
  });

  it('should be able to use DI through the NgModuleRef inside the module constructor', () => {
    const token = new InjectionToken<string>('token');
    let value: string | undefined;

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

  it('should be able to create a component through the ComponentFactoryResolver of an NgModuleRef in a module constructor', () => {
    let componentInstance: TestCmp | undefined;

    @NgModule({
      declarations: [TestCmp],
      exports: [TestCmp],
    })
    class MyModule {
      constructor(ngModuleRef: NgModuleRef<any>) {
        const factory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(TestCmp);
        componentInstance = factory.create(ngModuleRef.injector).instance;
      }
    }

    TestBed.configureTestingModule({imports: [MyModule]});
    TestBed.createComponent(TestCmp);
    expect(componentInstance).toBeInstanceOf(TestCmp);
  });
});
