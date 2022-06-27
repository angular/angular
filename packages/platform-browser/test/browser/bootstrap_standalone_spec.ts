/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, ɵgetDOM as getDOM} from '@angular/common';
import {Component, destroyPlatform, ErrorHandler, Inject, Injectable, InjectionToken, NgModule} from '@angular/core';
import {inject} from '@angular/core/testing';

import {bootstrapApplication, BrowserModule} from '../../src/browser';

describe('bootstrapApplication for standalone components', () => {
  let rootEl: HTMLUnknownElement;
  beforeEach(inject([DOCUMENT], (doc: any) => {
    rootEl = getDOM().createElement('test-app', doc);
    getDOM().getDefaultDocument().body.appendChild(rootEl);
  }));

  afterEach(() => {
    destroyPlatform();
    rootEl?.remove();
  });

  class SilentErrorHandler extends ErrorHandler {
    override handleError() {
      // the error is already re-thrown by the application ref.
      // we don't want to print it, but instead catch it in tests.
    }
  }

  it('should create injector where ambient providers shadow explicit providers', async () => {
    const testToken = new InjectionToken('test token');

    @NgModule({
      providers: [
        {provide: testToken, useValue: 'Ambient'},
      ]
    })
    class AmbientModule {
    }

    @Component({
      selector: 'test-app',
      standalone: true,
      template: `({{testToken}})`,
      imports: [AmbientModule]
    })
    class StandaloneCmp {
      constructor(@Inject(testToken) readonly testToken: String) {}
    }

    const appRef = await bootstrapApplication(StandaloneCmp, {
      providers: [
        {provide: testToken, useValue: 'Bootstrap'},
      ]
    });

    appRef.tick();

    // make sure that ambient providers "shadow" ones explicitly provided during bootstrap
    expect(rootEl.textContent).toBe('(Ambient)');
  });

  /*
    This test verifies that ambient providers for the standalone component being bootstrapped
    (providers collected from the import graph of a standalone component) are instantiated in a
    dedicated standalone injector. As the result we are ending up with the following injectors
    hierarchy:
    - platform injector (platform specific providers go here);
    - application injector (providers specified in the bootstrap options go here);
    - standalone injector (ambient providers go here);
  */
  it('should create a standalone injector for standalone components with ambient providers',
     async () => {
       const ambientToken = new InjectionToken('ambient token');

       @NgModule({
         providers: [
           {provide: ambientToken, useValue: 'Only in AmbientNgModule'},
         ]
       })
       class AmbientModule {
       }

       @Injectable()
       class NeedsAmbientProvider {
         constructor(@Inject(ambientToken) readonly ambientToken: String) {}
       }

       @Component({
         selector: 'test-app',
         template: `({{service.ambientToken}})`,
         standalone: true,
         imports: [AmbientModule]
       })
       class StandaloneCmp {
         constructor(readonly service: NeedsAmbientProvider) {}
       }

       try {
         await bootstrapApplication(
             StandaloneCmp,
             {
               providers: [
                 {provide: ErrorHandler, useClass: SilentErrorHandler},
                 NeedsAmbientProvider,
               ]
             },
         );

         // we expect the bootstrap process to fail since the "NeedsAmbientProvider" service
         // (located in the application injector) can't "see" ambient providers (located in a
         // standalone injector that is a child of the application injector).
         fail('Expected to throw');
       } catch (e: unknown) {
         expect(e).toBeInstanceOf(Error);
         expect((e as Error).message).toContain('No provider for InjectionToken ambient token!');
       }
     });

  it('should throw if `BrowserModule` is imported in the standalone bootstrap scenario',
     async () => {
       @Component({
         selector: 'test-app',
         template: '...',
         standalone: true,
         imports: [BrowserModule],
       })
       class StandaloneCmp {
       }

       try {
         await bootstrapApplication(
             StandaloneCmp, {providers: [{provide: ErrorHandler, useClass: SilentErrorHandler}]});

         // The `bootstrapApplication` already includes the set of providers from the
         // `BrowserModule`, so including the `BrowserModule` again will bring duplicate providers
         // and we want to avoid it.
         fail('Expected to throw');
       } catch (e: unknown) {
         expect(e).toBeInstanceOf(Error);
         expect((e as Error).message)
             .toContain('Providers from the `BrowserModule` have already been loaded.');
       }
     });

  it('should throw if `BrowserModule` is imported indirectly in the standalone bootstrap scenario',
     async () => {
       @NgModule({
         imports: [BrowserModule],
       })
       class SomeDependencyModule {
       }

       @Component({
         selector: 'test-app',
         template: '...',
         standalone: true,
         imports: [SomeDependencyModule],
       })
       class StandaloneCmp {
       }

       try {
         await bootstrapApplication(
             StandaloneCmp, {providers: [{provide: ErrorHandler, useClass: SilentErrorHandler}]});

         // The `bootstrapApplication` already includes the set of providers from the
         // `BrowserModule`, so including the `BrowserModule` again will bring duplicate providers
         // and we want to avoid it.
         fail('Expected to throw');
       } catch (e: unknown) {
         expect(e).toBeInstanceOf(Error);
         expect((e as Error).message)
             .toContain('Providers from the `BrowserModule` have already been loaded.');
       }
     });
});
