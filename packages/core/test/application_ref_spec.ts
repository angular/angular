/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {ResourceLoader} from '@angular/compiler';
import {APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, Compiler, CompilerFactory, Component, InjectionToken, LOCALE_ID, NgModule, NgZone, PlatformRef, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {ApplicationRef} from '@angular/core/src/application_ref';
import {ErrorHandler} from '@angular/core/src/error_handler';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {getLocaleId} from '@angular/core/src/render3';
import {BrowserModule} from '@angular/platform-browser';
import {createTemplate, dispatchEvent, getContent} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

import {NoopNgZone} from '../src/zone/ng_zone';
import {ComponentFixtureNoNgZone, inject, TestBed, waitForAsync, withModule} from '../testing';

@Component({selector: 'bootstrap-app', template: 'hello'})
class SomeComponent {
}

{
  describe('bootstrap', () => {
    let mockConsole: MockConsole;

    beforeEach(() => {
      mockConsole = new MockConsole();
    });

    function createRootEl(selector = 'bootstrap-app') {
      const doc = TestBed.inject(DOCUMENT);
      const rootEl =
          <HTMLElement>getContent(createTemplate(`<${selector}></${selector}>`)).firstChild;
      const oldRoots = doc.querySelectorAll(selector);
      for (let i = 0; i < oldRoots.length; i++) {
        getDOM().remove(oldRoots[i]);
      }
      doc.body.appendChild(rootEl);
    }

    type CreateModuleOptions =
        {providers?: any[], ngDoBootstrap?: any, bootstrap?: any[], component?: Type<any>};

    function createModule(providers?: any[]): Type<any>;
    function createModule(options: CreateModuleOptions): Type<any>;
    function createModule(providersOrOptions: any[]|CreateModuleOptions|undefined): Type<any> {
      let options: CreateModuleOptions = {};
      if (Array.isArray(providersOrOptions)) {
        options = {providers: providersOrOptions};
      } else {
        options = providersOrOptions || {};
      }
      const errorHandler = new ErrorHandler();
      (errorHandler as any)._console = mockConsole as any;

      const platformModule = getDOM().supportsDOMEvents ?
          BrowserModule :
          require('@angular/platform-server').ServerModule;

      @NgModule({
        providers: [{provide: ErrorHandler, useValue: errorHandler}, options.providers || []],
        imports: [platformModule],
        declarations: [options.component || SomeComponent],
        entryComponents: [options.component || SomeComponent],
        bootstrap: options.bootstrap || []
      })
      class MyModule {
      }
      if (options.ngDoBootstrap !== false) {
        (<any>MyModule.prototype).ngDoBootstrap = options.ngDoBootstrap || (() => {});
      }
      return MyModule;
    }

    it('should bootstrap a component from a child module',
       waitForAsync(
           inject([ApplicationRef, Compiler], (app: ApplicationRef, compiler: Compiler) => {
             @Component({
               selector: 'bootstrap-app',
               template: '',
             })
             class SomeComponent {
             }

             const helloToken = new InjectionToken<string>('hello');

             @NgModule({
               providers: [{provide: helloToken, useValue: 'component'}],
               declarations: [SomeComponent],
               entryComponents: [SomeComponent],
             })
             class SomeModule {
             }

             createRootEl();
             const modFactory = compiler.compileModuleSync(SomeModule);
             const module = modFactory.create(TestBed);
             const cmpFactory =
                 module.componentFactoryResolver.resolveComponentFactory(SomeComponent)!;
             const component = app.bootstrap(cmpFactory);

             // The component should see the child module providers
             expect(component.injector.get(helloToken)).toEqual('component');
           })));

    it('should bootstrap a component with a custom selector',
       waitForAsync(
           inject([ApplicationRef, Compiler], (app: ApplicationRef, compiler: Compiler) => {
             @Component({
               selector: 'bootstrap-app',
               template: '',
             })
             class SomeComponent {
             }

             const helloToken = new InjectionToken<string>('hello');

             @NgModule({
               providers: [{provide: helloToken, useValue: 'component'}],
               declarations: [SomeComponent],
               entryComponents: [SomeComponent],
             })
             class SomeModule {
             }

             createRootEl('custom-selector');
             const modFactory = compiler.compileModuleSync(SomeModule);
             const module = modFactory.create(TestBed);
             const cmpFactory =
                 module.componentFactoryResolver.resolveComponentFactory(SomeComponent)!;
             const component = app.bootstrap(cmpFactory, 'custom-selector');

             // The component should see the child module providers
             expect(component.injector.get(helloToken)).toEqual('component');
           })));

    describe('ApplicationRef', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({imports: [createModule()]});
      });

      it('should throw when reentering tick', () => {
        @Component({template: '{{reenter()}}'})
        class ReenteringComponent {
          reenterCount = 1;
          reenterErr: any;

          constructor(private appRef: ApplicationRef) {}

          reenter() {
            if (this.reenterCount--) {
              try {
                this.appRef.tick();
              } catch (e) {
                this.reenterErr = e;
              }
            }
          }
        }

        const fixture = TestBed.configureTestingModule({declarations: [ReenteringComponent]})
                            .createComponent(ReenteringComponent);
        const appRef = TestBed.inject(ApplicationRef);
        appRef.attachView(fixture.componentRef.hostView);
        appRef.tick();
        expect(fixture.componentInstance.reenterErr.message)
            .toBe('ApplicationRef.tick is called recursively');
      });

      describe('APP_BOOTSTRAP_LISTENER', () => {
        let capturedCompRefs: ComponentRef<any>[];
        beforeEach(() => {
          capturedCompRefs = [];
          TestBed.configureTestingModule({
            providers: [{
              provide: APP_BOOTSTRAP_LISTENER,
              multi: true,
              useValue: (compRef: any) => {
                capturedCompRefs.push(compRef);
              }
            }]
          });
        });

        it('should be called when a component is bootstrapped',
           inject([ApplicationRef], (ref: ApplicationRef) => {
             createRootEl();
             const compRef = ref.bootstrap(SomeComponent);
             expect(capturedCompRefs).toEqual([compRef]);
           }));
      });

      describe('bootstrap', () => {
        it('should throw if an APP_INITIIALIZER is not yet resolved',
           withModule(
               {
                 providers: [
                   {provide: APP_INITIALIZER, useValue: () => new Promise(() => {}), multi: true}
                 ]
               },
               inject([ApplicationRef], (ref: ApplicationRef) => {
                 createRootEl();
                 expect(() => ref.bootstrap(SomeComponent))
                     .toThrowError(
                         'Cannot bootstrap as there are still asynchronous initializers running. Bootstrap components in the `ngDoBootstrap` method of the root module.');
               })));
      });
    });

    describe('bootstrapModule', () => {
      let defaultPlatform: PlatformRef;
      beforeEach(inject([PlatformRef], (_platform: PlatformRef) => {
        createRootEl();
        defaultPlatform = _platform;
      }));

      it('should wait for asynchronous app initializers', waitForAsync(() => {
           let resolve: (result: any) => void;
           const promise: Promise<any> = new Promise((res) => {
             resolve = res;
           });
           let initializerDone = false;
           setTimeout(() => {
             resolve(true);
             initializerDone = true;
           }, 1);

           defaultPlatform
               .bootstrapModule(
                   createModule([{provide: APP_INITIALIZER, useValue: () => promise, multi: true}]))
               .then(_ => {
                 expect(initializerDone).toBe(true);
               });
         }));

      it('should rethrow sync errors even if the exceptionHandler is not rethrowing',
         waitForAsync(() => {
           defaultPlatform
               .bootstrapModule(createModule([{
                 provide: APP_INITIALIZER,
                 useValue: () => {
                   throw 'Test';
                 },
                 multi: true
               }]))
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 // Error rethrown will be seen by the exception handler since it's after
                 // construction.
                 expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
               });
         }));

      it('should rethrow promise errors even if the exceptionHandler is not rethrowing',
         waitForAsync(() => {
           defaultPlatform
               .bootstrapModule(createModule([
                 {provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true}
               ]))
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
               });
         }));

      it('should throw useful error when ApplicationRef is not configured', waitForAsync(() => {
           @NgModule()
           class EmptyModule {
           }

           return defaultPlatform.bootstrapModule(EmptyModule)
               .then(() => fail('expecting error'), (error) => {
                 expect(error.message)
                     .toEqual('No ErrorHandler. Is platform module (BrowserModule) included?');
               });
         }));

      it('should call the `ngDoBootstrap` method with `ApplicationRef` on the main module',
         waitForAsync(() => {
           const ngDoBootstrap = jasmine.createSpy('ngDoBootstrap');
           defaultPlatform.bootstrapModule(createModule({ngDoBootstrap: ngDoBootstrap}))
               .then((moduleRef) => {
                 const appRef = moduleRef.injector.get(ApplicationRef);
                 expect(ngDoBootstrap).toHaveBeenCalledWith(appRef);
               });
         }));

      it('should auto bootstrap components listed in @NgModule.bootstrap', waitForAsync(() => {
           defaultPlatform.bootstrapModule(createModule({bootstrap: [SomeComponent]}))
               .then((moduleRef) => {
                 const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
                 expect(appRef.componentTypes).toEqual([SomeComponent]);
               });
         }));

      it('should error if neither `ngDoBootstrap` nor @NgModule.bootstrap was specified',
         waitForAsync(() => {
           defaultPlatform.bootstrapModule(createModule({ngDoBootstrap: false}))
               .then(() => expect(false).toBe(true), (e) => {
                 const expectedErrMsg =
                     `The module MyModule was bootstrapped, but it does not declare "@NgModule.bootstrap" components nor a "ngDoBootstrap" method. Please define one of these.`;
                 expect(e.message).toEqual(expectedErrMsg);
                 expect(mockConsole.res[0].join('#')).toEqual('ERROR#Error: ' + expectedErrMsg);
               });
         }));

      it('should add bootstrapped module into platform modules list', waitForAsync(() => {
           defaultPlatform.bootstrapModule(createModule({bootstrap: [SomeComponent]}))
               .then(module => expect((<any>defaultPlatform)._modules).toContain(module));
         }));

      it('should bootstrap with NoopNgZone', waitForAsync(() => {
           defaultPlatform
               .bootstrapModule(createModule({bootstrap: [SomeComponent]}), {ngZone: 'noop'})
               .then((module) => {
                 const ngZone = module.injector.get(NgZone);
                 expect(ngZone instanceof NoopNgZone).toBe(true);
               });
         }));

      it('should resolve component resources when creating module factory', async () => {
        @Component({
          selector: 'with-templates-app',
          templateUrl: '/test-template.html',
        })
        class WithTemplateUrlComponent {
        }

        const loadResourceSpy = jasmine.createSpy('load resource').and.returnValue('fakeContent');
        const testModule = createModule({component: WithTemplateUrlComponent});

        await defaultPlatform.bootstrapModule(testModule, {
          providers: [
            {provide: ResourceLoader, useValue: {get: loadResourceSpy}},
          ]
        });

        expect(loadResourceSpy).toHaveBeenCalledTimes(1);
        expect(loadResourceSpy).toHaveBeenCalledWith('/test-template.html');
      });

      onlyInIvy('We only need to define `LOCALE_ID` for runtime i18n')
          .it('should define `LOCALE_ID`', async () => {
            @Component({
              selector: 'i18n-app',
              templateUrl: '',
            })
            class I18nComponent {
            }

            const testModule = createModule(
                {component: I18nComponent, providers: [{provide: LOCALE_ID, useValue: 'ro'}]});
            await defaultPlatform.bootstrapModule(testModule);

            expect(getLocaleId()).toEqual('ro');
          });

      it('should wait for APP_INITIALIZER to set providers for `LOCALE_ID`', async () => {
        let locale: string = '';

        const testModule = createModule({
          providers: [
            {provide: APP_INITIALIZER, useValue: () => locale = 'fr-FR', multi: true},
            {provide: LOCALE_ID, useFactory: () => locale}
          ]
        });
        const app = await defaultPlatform.bootstrapModule(testModule);
        expect(app.injector.get(LOCALE_ID)).toEqual('fr-FR');
      });
    });

    describe('bootstrapModuleFactory', () => {
      let defaultPlatform: PlatformRef;
      beforeEach(inject([PlatformRef], (_platform: PlatformRef) => {
        createRootEl();
        defaultPlatform = _platform;
      }));
      it('should wait for asynchronous app initializers', waitForAsync(() => {
           let resolve: (result: any) => void;
           const promise: Promise<any> = new Promise((res) => {
             resolve = res;
           });
           let initializerDone = false;
           setTimeout(() => {
             resolve(true);
             initializerDone = true;
           }, 1);

           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null)!;
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(
               createModule([{provide: APP_INITIALIZER, useValue: () => promise, multi: true}]));
           defaultPlatform.bootstrapModuleFactory(moduleFactory).then(_ => {
             expect(initializerDone).toBe(true);
           });
         }));

      it('should rethrow sync errors even if the exceptionHandler is not rethrowing',
         waitForAsync(() => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null)!;
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(createModule([{
             provide: APP_INITIALIZER,
             useValue: () => {
               throw 'Test';
             },
             multi: true
           }]));
           expect(() => defaultPlatform.bootstrapModuleFactory(moduleFactory)).toThrow('Test');
           // Error rethrown will be seen by the exception handler since it's after
           // construction.
           expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
         }));

      it('should rethrow promise errors even if the exceptionHandler is not rethrowing',
         waitForAsync(() => {
           const compilerFactory: CompilerFactory =
               defaultPlatform.injector.get(CompilerFactory, null)!;
           const moduleFactory = compilerFactory.createCompiler().compileModuleSync(createModule(
               [{provide: APP_INITIALIZER, useValue: () => Promise.reject('Test'), multi: true}]));
           defaultPlatform.bootstrapModuleFactory(moduleFactory)
               .then(() => expect(false).toBe(true), (e) => {
                 expect(e).toBe('Test');
                 expect(mockConsole.res[0].join('#')).toEqual('ERROR#Test');
               });
         }));
    });

    describe('attachView / detachView', () => {
      @Component({template: '{{name}}'})
      class MyComp {
        name = 'Initial';
      }

      @Component({template: '<ng-container #vc></ng-container>'})
      class ContainerComp {
        // TODO(issue/24571): remove '!'.
        @ViewChild('vc', {read: ViewContainerRef}) vc!: ViewContainerRef;
      }

      @Component({template: '<ng-template #t>Dynamic content</ng-template>'})
      class EmbeddedViewComp {
        // TODO(issue/24571): remove '!'.
        @ViewChild(TemplateRef, {static: true}) tplRef!: TemplateRef<Object>;
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [MyComp, ContainerComp, EmbeddedViewComp],
          providers: [{provide: ComponentFixtureNoNgZone, useValue: true}]
        });
      });

      it('should dirty check attached views', () => {
        const comp = TestBed.createComponent(MyComp);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
        expect(appRef.viewCount).toBe(0);

        appRef.tick();
        expect(comp.nativeElement).toHaveText('');

        appRef.attachView(comp.componentRef.hostView);
        appRef.tick();
        expect(appRef.viewCount).toBe(1);
        expect(comp.nativeElement).toHaveText('Initial');
      });

      it('should not dirty check detached views', () => {
        const comp = TestBed.createComponent(MyComp);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

        appRef.attachView(comp.componentRef.hostView);
        appRef.tick();
        expect(comp.nativeElement).toHaveText('Initial');

        appRef.detachView(comp.componentRef.hostView);
        comp.componentInstance.name = 'New';
        appRef.tick();
        expect(appRef.viewCount).toBe(0);
        expect(comp.nativeElement).toHaveText('Initial');
      });

      it('should detach attached views if they are destroyed', () => {
        const comp = TestBed.createComponent(MyComp);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

        appRef.attachView(comp.componentRef.hostView);
        comp.destroy();

        expect(appRef.viewCount).toBe(0);
      });

      it('should detach attached embedded views if they are destroyed', () => {
        const comp = TestBed.createComponent(EmbeddedViewComp);
        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

        const embeddedViewRef = comp.componentInstance.tplRef.createEmbeddedView({});

        appRef.attachView(embeddedViewRef);
        embeddedViewRef.destroy();

        expect(appRef.viewCount).toBe(0);
      });


      it('should not allow to attach a view to both, a view container and the ApplicationRef',
         () => {
           const comp = TestBed.createComponent(MyComp);
           let hostView = comp.componentRef.hostView;
           const containerComp = TestBed.createComponent(ContainerComp);
           containerComp.detectChanges();
           const vc = containerComp.componentInstance.vc;
           const appRef: ApplicationRef = TestBed.inject(ApplicationRef);

           vc.insert(hostView);
           expect(() => appRef.attachView(hostView))
               .toThrowError('This view is already attached to a ViewContainer!');
           hostView = vc.detach(0)!;

           appRef.attachView(hostView);
           expect(() => vc.insert(hostView))
               .toThrowError('This view is already attached directly to the ApplicationRef!');
         });
    });
  });

  describe('AppRef', () => {
    @Component({selector: 'sync-comp', template: `<span>{{text}}</span>`})
    class SyncComp {
      text: string = '1';
    }

    @Component({selector: 'click-comp', template: `<span (click)="onClick()">{{text}}</span>`})
    class ClickComp {
      text: string = '1';

      onClick() {
        this.text += '1';
      }
    }

    @Component({selector: 'micro-task-comp', template: `<span>{{text}}</span>`})
    class MicroTaskComp {
      text: string = '1';

      ngOnInit() {
        Promise.resolve(null).then((_) => {
          this.text += '1';
        });
      }
    }

    @Component({selector: 'macro-task-comp', template: `<span>{{text}}</span>`})
    class MacroTaskComp {
      text: string = '1';

      ngOnInit() {
        setTimeout(() => {
          this.text += '1';
        }, 10);
      }
    }

    @Component({selector: 'micro-macro-task-comp', template: `<span>{{text}}</span>`})
    class MicroMacroTaskComp {
      text: string = '1';

      ngOnInit() {
        Promise.resolve(null).then((_) => {
          this.text += '1';
          setTimeout(() => {
            this.text += '1';
          }, 10);
        });
      }
    }

    @Component({selector: 'macro-micro-task-comp', template: `<span>{{text}}</span>`})
    class MacroMicroTaskComp {
      text: string = '1';

      ngOnInit() {
        setTimeout(() => {
          this.text += '1';
          Promise.resolve(null).then((_: any) => {
            this.text += '1';
          });
        }, 10);
      }
    }

    let stableCalled = false;

    beforeEach(() => {
      stableCalled = false;
      TestBed.configureTestingModule({
        declarations: [
          SyncComp, MicroTaskComp, MacroTaskComp, MicroMacroTaskComp, MacroMicroTaskComp, ClickComp
        ],
      });
    });

    afterEach(() => {
      expect(stableCalled).toBe(true, 'isStable did not emit true on stable');
    });

    function expectStableTexts(component: Type<any>, expected: string[]) {
      const fixture = TestBed.createComponent(component);
      const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
      const zone: NgZone = TestBed.inject(NgZone);
      appRef.attachView(fixture.componentRef.hostView);
      zone.run(() => appRef.tick());

      let i = 0;
      appRef.isStable.subscribe({
        next: (stable: boolean) => {
          if (stable) {
            expect(i).toBeLessThan(expected.length);
            expect(fixture.nativeElement).toHaveText(expected[i++]);
            stableCalled = true;
          }
        }
      });
    }

    it('isStable should fire on synchronous component loading', waitForAsync(() => {
         expectStableTexts(SyncComp, ['1']);
       }));

    it('isStable should fire after a microtask on init is completed', waitForAsync(() => {
         expectStableTexts(MicroTaskComp, ['11']);
       }));

    it('isStable should fire after a macrotask on init is completed', waitForAsync(() => {
         expectStableTexts(MacroTaskComp, ['11']);
       }));

    it('isStable should fire only after chain of micro and macrotasks on init are completed',
       waitForAsync(() => {
         expectStableTexts(MicroMacroTaskComp, ['111']);
       }));

    it('isStable should fire only after chain of macro and microtasks on init are completed',
       waitForAsync(() => {
         expectStableTexts(MacroMicroTaskComp, ['111']);
       }));

    describe('unstable', () => {
      let unstableCalled = false;

      afterEach(() => {
        expect(unstableCalled).toBe(true, 'isStable did not emit false on unstable');
      });

      function expectUnstable(appRef: ApplicationRef) {
        appRef.isStable.subscribe({
          next: (stable: boolean) => {
            if (stable) {
              stableCalled = true;
            }
            if (!stable) {
              unstableCalled = true;
            }
          }
        });
      }

      it('should be fired after app becomes unstable', waitForAsync(() => {
           const fixture = TestBed.createComponent(ClickComp);
           const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
           const zone: NgZone = TestBed.inject(NgZone);
           appRef.attachView(fixture.componentRef.hostView);
           zone.run(() => appRef.tick());

           fixture.whenStable().then(() => {
             expectUnstable(appRef);
             const element = fixture.debugElement.children[0];
             dispatchEvent(element.nativeElement, 'click');
           });
         }));
    });
  });
}

class MockConsole {
  res: any[][] = [];
  log(...args: any[]): void {
    // Logging from ErrorHandler should run outside of the Angular Zone.
    NgZone.assertNotInAngularZone();
    this.res.push(args);
  }
  error(...args: any[]): void {
    // Logging from ErrorHandler should run outside of the Angular Zone.
    NgZone.assertNotInAngularZone();
    this.res.push(args);
  }
}
