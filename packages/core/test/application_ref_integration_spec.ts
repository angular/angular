/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationModule, ApplicationRef, DoCheck, InjectFlags, InjectorType, Input, OnInit, PlatformRef, TestabilityRegistry, Type, defineInjector, inject, ɵE as elementStart, ɵNgModuleDef as NgModuleDef, ɵRenderFlags as RenderFlags, ɵT as text, ɵdefineComponent as defineComponent, ɵe as elementEnd, ɵi1 as interpolation1, ɵt as textBinding} from '@angular/core';
import {getTestBed, withBody} from '@angular/core/testing';
import {BrowserModule, EVENT_MANAGER_PLUGINS, platformBrowser} from '@angular/platform-browser';

import {BROWSER_MODULE_PROVIDERS} from '../../platform-browser/src/browser';
import {APPLICATION_MODULE_PROVIDERS} from '../src/application_module';
import {NgModuleFactory} from '../src/render3/ng_module_ref';

describe('ApplicationRef bootstrap', () => {
  class HelloWorldComponent implements OnInit, DoCheck {
    log: string[] = [];
    name = 'World';
    static ngComponentDef = defineComponent({
      type: HelloWorldComponent,
      selectors: [['hello-world']],
      factory: () => new HelloWorldComponent(),
      template: function(rf: RenderFlags, ctx: HelloWorldComponent): void {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div');
          text(1);
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, interpolation1('Hello ', ctx.name, ''));
        }
      }
    });

    ngOnInit(): void { this.log.push('OnInit'); }

    ngDoCheck(): void { this.log.push('DoCheck'); }
  }

  class MyAppModule {
    static ngInjectorDef =
        defineInjector({factory: () => new MyAppModule(), imports: [BrowserModule]});
    static ngModuleDef = defineNgModule({bootstrap: [HelloWorldComponent]});
  }

  it('should bootstrap hello world', withBody('<hello-world></hello-world>', async() => {
       const MyAppModuleFactory = new NgModuleFactory(MyAppModule);
       const moduleRef =
           await getTestBed().platform.bootstrapModuleFactory(MyAppModuleFactory, {ngZone: 'noop'});
       const appRef = moduleRef.injector.get(ApplicationRef);
       const helloWorldComponent = appRef.components[0].instance as HelloWorldComponent;
       expect(document.body.innerHTML).toEqual('<hello-world><div>Hello World</div></hello-world>');
       // TODO(jasonaden): Get with Kara on lifecycle hooks
       //  expect(helloWorldComponent.log).toEqual(['OnInit', 'DoCheck']);
       helloWorldComponent.name = 'Mundo';
       appRef.tick();
       expect(document.body.innerHTML).toEqual('<hello-world><div>Hello Mundo</div></hello-world>');
       // TODO(jasonaden): Get with Kara on lifecycle hooks
       //  expect(helloWorldComponent.log).toEqual(['OnInit', 'DoCheck', 'DoCheck']);

       // Cleanup TestabilityRegistry
       const registry: TestabilityRegistry = getTestBed().get(TestabilityRegistry);
       registry.unregisterAllApplications();
     }));

});

/////////////////////////////////////////////////////////

// These go away when Compiler is ready

(BrowserModule as any as InjectorType<BrowserModule>).ngInjectorDef = defineInjector({
  factory: function BrowserModule_Factory() {
    return new BrowserModule(inject(BrowserModule, InjectFlags.Optional | InjectFlags.SkipSelf));
  },
  imports: [ApplicationModule],
  providers: BROWSER_MODULE_PROVIDERS
});

(ApplicationModule as any as InjectorType<ApplicationModule>).ngInjectorDef = defineInjector({
  factory: function ApplicationModule_Factory() {
    return new ApplicationModule(inject(ApplicationRef));
  },
  providers: APPLICATION_MODULE_PROVIDERS
});

export function defineNgModule({bootstrap}: {bootstrap?: Type<any>[]}):
    NgModuleDef<any, any, any, any> {
  return ({ bootstrap: bootstrap || [], } as any);
}

/////////////////////////////////////////////////////////
