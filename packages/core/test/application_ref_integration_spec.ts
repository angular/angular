/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {ApplicationRef, Component, DoCheck, NgModule, OnInit, TestabilityRegistry} from '@angular/core';
import {getTestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

import {NgModuleFactory} from '../src/render3/ng_module_ref';

describe('ApplicationRef bootstrap', () => {
  @Component({
    selector: 'hello-world',
    template: '<div>Hello {{ name }}</div>',
  })
  class HelloWorldComponent implements OnInit, DoCheck {
    log: string[] = [];
    name = 'World';

    ngOnInit(): void {
      this.log.push('OnInit');
    }
    ngDoCheck(): void {
      this.log.push('DoCheck');
    }
  }

  @NgModule({
    declarations: [HelloWorldComponent],
    bootstrap: [HelloWorldComponent],
    imports: [BrowserModule],
    providers: [{provide: DOCUMENT, useFactory: () => document}]
  })
  class MyAppModule {
  }

  it('should bootstrap hello world', withBody('<hello-world></hello-world>', async () => {
       const MyAppModuleFactory = new NgModuleFactory(MyAppModule);
       const moduleRef =
           await getTestBed().platform.bootstrapModuleFactory(MyAppModuleFactory, {ngZone: 'noop'});
       const appRef = moduleRef.injector.get(ApplicationRef);
       const helloWorldComponent = appRef.components[0].instance as HelloWorldComponent;
       expect(document.body.innerHTML)
           .toEqual(
               '<hello-world ng-version="0.0.0-PLACEHOLDER"><div>Hello World</div></hello-world>');
       expect(helloWorldComponent.log).toEqual(['OnInit', 'DoCheck']);

       helloWorldComponent.name = 'Mundo';
       appRef.tick();
       expect(document.body.innerHTML)
           .toEqual(
               '<hello-world ng-version="0.0.0-PLACEHOLDER"><div>Hello Mundo</div></hello-world>');
       expect(helloWorldComponent.log).toEqual(['OnInit', 'DoCheck', 'DoCheck']);

       // Cleanup TestabilityRegistry
       const registry: TestabilityRegistry = getTestBed().get(TestabilityRegistry);
       registry.unregisterAllApplications();
     }));

  it('should expose the `window.ng` global utilities',
     withBody('<hello-world></hello-world>', async () => {
       const MyAppModuleFactory = new NgModuleFactory(MyAppModule);
       const moduleRef =
           await getTestBed().platform.bootstrapModuleFactory(MyAppModuleFactory, {ngZone: 'noop'});

       const glob = typeof global !== 'undefined' ? global : window;
       const ngUtils = (glob as any).ng;
       expect(ngUtils.getComponent).toBeTruthy();
     }));
});
