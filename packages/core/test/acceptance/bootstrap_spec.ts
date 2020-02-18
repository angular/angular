/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {COMPILER_OPTIONS, Component, NgModule, ViewEncapsulation, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {onlyInIvy, withBody} from '@angular/private/testing';

describe('bootstrap', () => {

  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  it('should bootstrap using #id selector',
     withBody('<div>before|</div><button id="my-app"></button>', async() => {
       try {
         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(IdSelectorAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));

  it('should bootstrap using one of selectors from the list',
     withBody('<div>before|</div><div class="bar"></div>', async() => {
       try {
         const ngModuleRef =
             await platformBrowserDynamic().bootstrapModule(MultipleSelectorsAppModule);
         expect(document.body.textContent).toEqual('before|works!');
         ngModuleRef.destroy();
       } catch (err) {
         console.error(err);
       }
     }));

  describe('options', () => {
    function createComponentAndModule(
        options: {encapsulation?: ViewEncapsulation; preserveWhitespaces?: boolean} = {}) {
      @Component({
        selector: 'my-app',
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
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('<span _ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should allow setting defaultEncapsulation using bootstrap option',
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {defaultEncapsulation: ViewEncapsulation.None});
         expect(document.body.innerHTML).toContain('<span>');
         expect(document.body.innerHTML).not.toContain('_ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should allow setting defaultEncapsulation using compiler option',
       withBody('<my-app></my-app>', async() => {
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
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule({encapsulation: ViewEncapsulation.Emulated});

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {defaultEncapsulation: ViewEncapsulation.None});
         expect(document.body.innerHTML).toContain('<span _ngcontent-');
         ngModuleRef.destroy();
       }));

    it('should use preserveWhitespaces: false as default',
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('a b');
         ngModuleRef.destroy();
       }));

    it('should allow setting preserveWhitespaces using bootstrap option',
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule();

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {preserveWhitespaces: true});
         expect(document.body.innerHTML).toContain('a    b');
         ngModuleRef.destroy();
       }));

    it('should allow setting preserveWhitespaces using compiler option',
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule();

         const ngModuleRef =
             await platformBrowserDynamic([
               {provide: COMPILER_OPTIONS, useValue: {preserveWhitespaces: true}, multi: true}
             ]).bootstrapModule(TestModule);
         expect(document.body.innerHTML).toContain('a    b');
         ngModuleRef.destroy();
       }));

    it('should prefer preserveWhitespaces on component over bootstrap option',
       withBody('<my-app></my-app>', async() => {
         const TestModule = createComponentAndModule({preserveWhitespaces: false});

         const ngModuleRef = await platformBrowserDynamic().bootstrapModule(
             TestModule, {preserveWhitespaces: true});
         expect(document.body.innerHTML).toContain('a b');
         ngModuleRef.destroy();
       }));

    onlyInIvy('options cannot be changed in Ivy').describe('changing bootstrap options', () => {
      it('should throw when changing defaultEncapsulation bootstrap options',
         withBody('<my-app></my-app>', async() => {
           const TestModule = createComponentAndModule();
           const platformRef = platformBrowserDynamic();

           const ngModuleRef = await platformRef.bootstrapModule(
               TestModule, {defaultEncapsulation: ViewEncapsulation.None});
           ngModuleRef.destroy();

           try {
             await platformRef.bootstrapModule(
                 TestModule, {defaultEncapsulation: ViewEncapsulation.ShadowDom});
             fail('expected exception');
           } catch (err) {
             expect(err.message)
                 .toEqual(
                     'Provided value for `defaultEncapsulation` can not be changed once it has been set.');
           }
         }));

      it('should throw when changing preserveWhitespaces bootstrap options',
         withBody('<my-app></my-app>', async() => {
           const TestModule = createComponentAndModule();
           const platformRef = platformBrowserDynamic();

           const ngModuleRef =
               await platformRef.bootstrapModule(TestModule, {preserveWhitespaces: true});
           ngModuleRef.destroy();

           try {
             await platformRef.bootstrapModule(TestModule, {preserveWhitespaces: false});
             fail('expected exception');
           } catch (err) {
             expect(err.message)
                 .toEqual(
                     'Provided value for `preserveWhitespaces` can not be changed once it has been set.');
           }
         }));

      it('should throw when changing defaultEncapsulation to its default',
         withBody('<my-app></my-app>', async() => {
           const TestModule = createComponentAndModule();
           const platformRef = platformBrowserDynamic();

           const ngModuleRef = await platformRef.bootstrapModule(TestModule);
           ngModuleRef.destroy();

           try {
             await platformRef.bootstrapModule(
                 TestModule, {defaultEncapsulation: ViewEncapsulation.Emulated});
             fail('expected exception');
           } catch (err) {
             // Although the configured value may be identical to the default, the provided set of
             // options has still been changed compared to the previously provided options.
             expect(err.message)
                 .toEqual(
                     'Provided value for `defaultEncapsulation` can not be changed once it has been set.');
           }
         }));

      it('should throw when changing preserveWhitespaces to its default',
         withBody('<my-app></my-app>', async() => {
           const TestModule = createComponentAndModule();
           const platformRef = platformBrowserDynamic();

           const ngModuleRef = await platformRef.bootstrapModule(TestModule);
           ngModuleRef.destroy();

           try {
             await platformRef.bootstrapModule(TestModule, {preserveWhitespaces: false});
             fail('expected exception');
           } catch (err) {
             // Although the configured value may be identical to the default, the provided set of
             // options has still been changed compared to the previously provided options.
             expect(err.message)
                 .toEqual(
                     'Provided value for `preserveWhitespaces` can not be changed once it has been set.');
           }
         }));

      it('should not throw when passing identical bootstrap options',
         withBody('<my-app></my-app>', async() => {
           const TestModule = createComponentAndModule();
           const platformRef = platformBrowserDynamic();

           const ngModuleRef1 = await platformRef.bootstrapModule(
               TestModule,
               {defaultEncapsulation: ViewEncapsulation.None, preserveWhitespaces: true});
           ngModuleRef1.destroy();

           // Bootstrapping multiple modules using the exact same options should be allowed.
           const ngModuleRef2 = await platformRef.bootstrapModule(
               TestModule,
               {defaultEncapsulation: ViewEncapsulation.None, preserveWhitespaces: true});
           ngModuleRef2.destroy();
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
