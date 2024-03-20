/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, COMPILER_OPTIONS, Component, destroyPlatform, forwardRef, NgModule, NgZone, TestabilityRegistry, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {withBody} from '@angular/private/testing';

describe('bootstrap', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it('should bootstrap using #id selector',
     withBody('<div>before|</div><button id="my-app"></button>', async () => {
       try {
         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(IdSelectorAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));

  it('should bootstrap using one of selectors from the list',
     withBody('<div>before|</div><div class="bar"></div>', async () => {
       try {
         const ngModuleRef =
             await platformBrowserDynamic().bootstrapModule(MultipleSelectorsAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));


  it('should allow injecting VCRef into the root (bootstrapped) component',
     withBody('before|<test-cmp></test-cmp>|after', async () => {
       @Component({selector: 'dynamic-cmp', standalone: true, template: 'dynamic'})
       class DynamicCmp {
       }

       @Component({selector: 'test-cmp', standalone: true, template: '(test)'})
       class TestCmp {
         constructor(public vcRef: ViewContainerRef) {}
       }

       expect(document.body.textContent).toEqual('before||after');

       const appRef = await bootstrapApplication(TestCmp);
       expect(document.body.textContent).toEqual('before|(test)|after');

       appRef.components[0].instance.vcRef.createComponent(DynamicCmp);
       expect(document.body.textContent).toEqual('before|(test)dynamic|after');

       appRef.destroy();
       expect(document.body.textContent).toEqual('before||after');
     }));

  describe('options', () => {
    function createComponentAndModule(
        options:
            {encapsulation?: ViewEncapsulation; preserveWhitespaces?: boolean;
             selector?: string} = {}) {
      @Component({
        selector: options.selector || 'my-app',
        styles: [''],
        template: '<span>a    b</span>',
        encapsulation: options.encapsulation,
        preserveWhitespaces: options.preserveWhitespaces,
        jit: true,
      })
      class TestComponent {
      }

      @NgModule({
        imports: [BrowserModule],
        declarations: [TestComponent],
        bootstrap: [TestComponent],
        jit: true,
      })
      class TestModule {
      }

      return TestModule;
    }

    it('should use ViewEncapsulation.Emulated as default',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('<span _ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should allow setting defaultEncapsulation using bootstrap option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {defaultEncapsulation: ViewEncapsulation.None});
         expect(document.body.innerHTML).toContain('<span>');
         expect(document.body.innerHTML).not.toContain('_ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should allow setting defaultEncapsulation using compiler option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic([{
                               provide: COMPILER_OPTIONS,
                               useValue: {defaultEncapsulation: ViewEncapsulation.None},
                               multi: true
                             }]).bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('<span>');
         expect(document.body.innerHTML).not.toContain('_ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should prefer encapsulation on component over bootstrap option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule({encapsulation: ViewEncapsulation.Emulated});

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {defaultEncapsulation: ViewEncapsulation.None});
         expect(document.body.innerHTML).toContain('<span _ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should use preserveWhitespaces: false as default',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('a b');
         ngModuleRef.destroy();
       }));

    it('should allow setting preserveWhitespaces using bootstrap option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {preserveWhitespaces: true});
         expect(document.body.innerHTML).toContain('a    b');
         ngModuleRef.destroy();
       }));

    it('should allow setting preserveWhitespaces using compiler option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule();

         const ngModuleRef =
             await platformBrowserDynamic([
               {provide: COMPILER_OPTIONS, useValue: {preserveWhitespaces: true}, multi: true}
             ]).bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('a    b');
         ngModuleRef.destroy();
       }));

    it('should prefer preserveWhitespaces on component over bootstrap option',
       withBody('<my-app></my-app>', async () => {
         const TestModule = createComponentAndModule({preserveWhitespaces: false});

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {preserveWhitespaces: true});
         expect(document.body.innerHTML).toContain('a b');
         ngModuleRef.destroy();
       }));

    describe('ApplicationRef cleanup', () => {
      it('should cleanup ApplicationRef when Injector is destroyed',
         withBody('<my-app></my-app>', async () => {
           const TestModule = createComponentAndModule();

           const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
           const appRef = ngModuleRef.injector.get(ApplicationRef);
           const testabilityRegistry = ngModuleRef.injector.get(TestabilityRegistry);

           expect(appRef.components.length).toBe(1);
           expect(testabilityRegistry.getAllRootElements().length).toBe(1);

           ngModuleRef.destroy();  // also destroys an Injector instance.

           expect(appRef.components.length).toBe(0);
           expect(testabilityRegistry.getAllRootElements().length).toBe(0);
         }));

      it('should cleanup ApplicationRef when ComponentRef is destroyed',
         withBody('<my-app></my-app>', async () => {
           const TestModule = createComponentAndModule();

           const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
           const appRef = ngModuleRef.injector.get(ApplicationRef);
           const testabilityRegistry = ngModuleRef.injector.get(TestabilityRegistry);
           const componentRef = appRef.components[0];

           expect(appRef.components.length).toBe(1);
           expect(testabilityRegistry.getAllRootElements().length).toBe(1);

           componentRef.destroy();

           expect(appRef.components.length).toBe(0);
           expect(testabilityRegistry.getAllRootElements().length).toBe(0);
         }));

      it('should not throw in case ComponentRef is destroyed and Injector is destroyed after that',
         withBody('<my-app></my-app>', async () => {
           const TestModule = createComponentAndModule();

           const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
           const appRef = ngModuleRef.injector.get(ApplicationRef);
           const testabilityRegistry = ngModuleRef.injector.get(TestabilityRegistry);
           const componentRef = appRef.components[0];

           expect(appRef.components.length).toBe(1);
           expect(testabilityRegistry.getAllRootElements().length).toBe(1);

           componentRef.destroy();
           ngModuleRef.destroy();  // also destroys an Injector instance.

           expect(appRef.components.length).toBe(0);
           expect(testabilityRegistry.getAllRootElements().length).toBe(0);
         }));

      it('should not throw in case Injector is destroyed and ComponentRef is destroyed after that',
         withBody('<my-app></my-app>', async () => {
           const TestModule = createComponentAndModule();

           const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
           const appRef = ngModuleRef.injector.get(ApplicationRef);
           const testabilityRegistry = ngModuleRef.injector.get(TestabilityRegistry);
           const componentRef = appRef.components[0];

           expect(appRef.components.length).toBe(1);
           expect(testabilityRegistry.getAllRootElements().length).toBe(1);

           ngModuleRef.destroy();  // also destroys an Injector instance.
           componentRef.destroy();

           expect(appRef.components.length).toBe(0);
           expect(testabilityRegistry.getAllRootElements().length).toBe(0);
         }));

      it('should throw when standalone component is used in @NgModule.bootstrap',
         withBody('<my-app></my-app>', async () => {
           @Component({
             standalone: true,
             selector: 'standalone-comp',
             template: '...',
           })
           class StandaloneComponent {
           }

           @NgModule({
             bootstrap: [StandaloneComponent],
           })
           class MyModule {
           }

           try {
             await platformBrowserDynamic().bootstrapModule(MyModule);

             // This test tries to bootstrap a standalone component using NgModule-based bootstrap
             // mechanisms. We expect standalone components to be bootstrapped via
             // `bootstrapApplication` API instead.
             fail('Expected to throw');
           } catch (e: unknown) {
             const expectedErrorMessage =
                 'The `StandaloneComponent` class is a standalone component, ' +
                 'which can not be used in the `@NgModule.bootstrap` array.';
             expect(e).toBeInstanceOf(Error);
             expect((e as Error).message).toContain(expectedErrorMessage);
           }
         }));

      it('should throw when standalone component wrapped in `forwardRef` is used in @NgModule.bootstrap',
         withBody('<my-app></my-app>', async () => {
           @Component({
             standalone: true,
             selector: 'standalone-comp',
             template: '...',
           })
           class StandaloneComponent {
           }

           @NgModule({
             bootstrap: [forwardRef(() => StandaloneComponent)],
           })
           class MyModule {
           }

           try {
             await platformBrowserDynamic().bootstrapModule(MyModule);

             // This test tries to bootstrap a standalone component using NgModule-based bootstrap
             // mechanisms. We expect standalone components to be bootstrapped via
             // `bootstrapApplication` API instead.
             fail('Expected to throw');
           } catch (e: unknown) {
             const expectedErrorMessage =
                 'The `StandaloneComponent` class is a standalone component, which ' +
                 'can not be used in the `@NgModule.bootstrap` array. Use the `bootstrapApplication` ' +
                 'function for bootstrap instead.';
             expect(e).toBeInstanceOf(Error);
             expect((e as Error).message).toContain(expectedErrorMessage);
           }
         }));
    });

    describe('PlatformRef cleanup', () => {
      it('should unsubscribe from `onError` when Injector is destroyed',
         withBody('<my-app></my-app>', async () => {
           const TestModule = createComponentAndModule();

           const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
           const ngZone = ngModuleRef.injector.get(NgZone);

           expect(ngZone.onError.observers.length).toBe(1);

           ngModuleRef.destroy();

           expect(ngZone.onError.observers.length).toBe(0);
         }));
    });

    describe('changing bootstrap options', () => {
      beforeEach(() => {
        spyOn(console, 'error');
      });

      it('should log an error when changing defaultEncapsulation bootstrap options',
         withBody('<my-app-a></my-app-a><my-app-b></my-app-b>', async () => {
           const platformRef = platformBrowserDynamic();

           const TestModuleA = createComponentAndModule({selector: 'my-app-a'});
           const ngModuleRefA = await platformRef.bootstrapModule(
               TestModuleA, {defaultEncapsulation: ViewEncapsulation.None});
           ngModuleRefA.destroy();

           const TestModuleB = createComponentAndModule({selector: 'my-app-b'});
           const ngModuleRefB = await platformRef.bootstrapModule(
               TestModuleB, {defaultEncapsulation: ViewEncapsulation.ShadowDom});
           expect(console.error)
               .toHaveBeenCalledWith(
                   'Provided value for `defaultEncapsulation` can not be changed once it has been set.');

           // The options should not have been changed
           expect(document.body.innerHTML).not.toContain('_ngcontent-');

           ngModuleRefB.destroy();
         }));

      it('should log an error when changing preserveWhitespaces bootstrap options',
         withBody('<my-app-a></my-app-a><my-app-b></my-app-b>', async () => {
           const platformRef = platformBrowserDynamic();

           const TestModuleA = createComponentAndModule({selector: 'my-app-a'});
           const ngModuleRefA =
               await platformRef.bootstrapModule(TestModuleA, {preserveWhitespaces: true});
           ngModuleRefA.destroy();

           const TestModuleB = createComponentAndModule({selector: 'my-app-b'});
           const ngModuleRefB =
               await platformRef.bootstrapModule(TestModuleB, {preserveWhitespaces: false});
           expect(console.error)
               .toHaveBeenCalledWith(
                   'Provided value for `preserveWhitespaces` can not be changed once it has been set.');

           // The options should not have been changed
           expect(document.body.innerHTML).toContain('a    b');

           ngModuleRefB.destroy();
         }));

      it('should log an error when changing defaultEncapsulation to its default',
         withBody('<my-app-a></my-app-a><my-app-b></my-app-b>', async () => {
           const platformRef = platformBrowserDynamic();

           const TestModuleA = createComponentAndModule({selector: 'my-app-a'});
           const ngModuleRefA = await platformRef.bootstrapModule(TestModuleA);
           ngModuleRefA.destroy();

           const TestModuleB = createComponentAndModule({selector: 'my-app-b'});
           const ngModuleRefB = await platformRef.bootstrapModule(
               TestModuleB, {defaultEncapsulation: ViewEncapsulation.Emulated});
           // Although the configured value may be identical to the default, the provided set of
           // options has still been changed compared to the previously provided options.
           expect(console.error)
               .toHaveBeenCalledWith(
                   'Provided value for `defaultEncapsulation` can not be changed once it has been set.');

           ngModuleRefB.destroy();
         }));

      it('should log an error when changing preserveWhitespaces to its default',
         withBody('<my-app-a></my-app-a><my-app-b></my-app-b>', async () => {
           const platformRef = platformBrowserDynamic();

           const TestModuleA = createComponentAndModule({selector: 'my-app-a'});
           const ngModuleRefA = await platformRef.bootstrapModule(TestModuleA);
           ngModuleRefA.destroy();

           const TestModuleB = createComponentAndModule({selector: 'my-app-b'});
           const ngModuleRefB =
               await platformRef.bootstrapModule(TestModuleB, {preserveWhitespaces: false});
           // Although the configured value may be identical to the default, the provided set of
           // options has still been changed compared to the previously provided options.
           expect(console.error)
               .toHaveBeenCalledWith(
                   'Provided value for `preserveWhitespaces` can not be changed once it has been set.');

           ngModuleRefB.destroy();
         }));

      it('should not log an error when passing identical bootstrap options',
         withBody('<my-app-a></my-app-a><my-app-b></my-app-b>', async () => {
           const platformRef = platformBrowserDynamic();

           const TestModuleA = createComponentAndModule({selector: 'my-app-a'});
           const ngModuleRefA = await platformRef.bootstrapModule(
               TestModuleA,
               {defaultEncapsulation: ViewEncapsulation.None, preserveWhitespaces: true});
           ngModuleRefA.destroy();

           // Bootstrapping multiple modules using the exact same options should be allowed.
           const TestModuleB = createComponentAndModule({selector: 'my-app-b'});
           const ngModuleRefB = await platformRef.bootstrapModule(
               TestModuleB,
               {defaultEncapsulation: ViewEncapsulation.None, preserveWhitespaces: true});
           ngModuleRefB.destroy();
         }));
    });
  });
});

@Component({
  selector: '#my-app',
  template: 'works!',
})
export class IdSelectorAppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [IdSelectorAppComponent],
  bootstrap: [IdSelectorAppComponent],
})
export class IdSelectorAppModule {
}

@Component({
  selector: '[foo],span,.bar',
  template: 'works!',
})
export class MultipleSelectorsAppComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [MultipleSelectorsAppComponent],
  bootstrap: [MultipleSelectorsAppComponent],
})
export class MultipleSelectorsAppModule {
}
