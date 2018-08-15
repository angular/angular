/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Component, getPlatform, Injectable, Injector, NgModule, StaticProvider} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {downgradeComponent, downgradeModule} from '@angular/upgrade/static';


declare var angular: ng.IAngularStatic;

// An Angular service provided in root. Each instance of the service will get a new ID.
@Injectable({providedIn: 'root'})
export class Ng2Service {
  static nextId = 1;
  id = Ng2Service.nextId++;
}


// An Angular module that will act as "root" for all downgraded modules, so that injectables
// provided in root will be available to all.
@NgModule({
  imports: [BrowserModule],
})
export class Ng2RootModule {
  ngDoBootstrap() {}
}


// An Angular module that declares an Angular component,
// which in turn uses an Angular service from the root module.
@Component({
  selector: 'ng2A',
  template: 'Component A (Service ID: {{ service.id }})',
})
export class Ng2AComponent {
  constructor(public service: Ng2Service) {}
}

@NgModule({
  declarations: [Ng2AComponent],
  entryComponents: [Ng2AComponent],
})
export class Ng2AModule {
  ngDoBootstrap() {}
}


// Another Angular module that declares an Angular component, which uses the same service.
@Component({
  selector: 'ng2B',
  template: 'Component B (Service ID: {{ service.id }})',
})
export class Ng2BComponent {
  constructor(public service: Ng2Service) {}
}

@NgModule({
  declarations: [Ng2BComponent],
  entryComponents: [Ng2BComponent],
})
export class Ng2BModule {
  ngDoBootstrap() {}
}


// A third Angular module that declares an Angular component, which uses the same service.
@Component({
  selector: 'ng2C',
  template: 'Component C (Service ID: {{ service.id }})',
})
export class Ng2CComponent {
  constructor(public service: Ng2Service) {}
}

@NgModule({
  imports: [BrowserModule],
  declarations: [Ng2CComponent],
  entryComponents: [Ng2CComponent],
})
export class Ng2CModule {
  ngDoBootstrap() {}
}


// The downgraded Angular modules. Modules A and B share a common root module. Module C does not.
// #docregion shared-root-module
let rootInjectorPromise: Promise<Injector>|null = null;
const getRootInjector = (extraProviders: StaticProvider[]) => {
  if (!rootInjectorPromise) {
    rootInjectorPromise = platformBrowserDynamic(extraProviders)
                              .bootstrapModule(Ng2RootModule)
                              .then(moduleRef => moduleRef.injector);
  }
  return rootInjectorPromise;
};

const downgradedNg2AModule = downgradeModule(async (extraProviders: StaticProvider[]) => {
  const rootInjector = await getRootInjector(extraProviders);
  const moduleAFactory = await rootInjector.get(Compiler).compileModuleAsync(Ng2AModule);
  return moduleAFactory.create(rootInjector);
});
const downgradedNg2BModule = downgradeModule(async (extraProviders: StaticProvider[]) => {
  const rootInjector = await getRootInjector(extraProviders);
  const moduleBFactory = await rootInjector.get(Compiler).compileModuleAsync(Ng2BModule);
  return moduleBFactory.create(rootInjector);
});
// #enddocregion shared-root-module

const downgradedNg2CModule = downgradeModule(
    (extraProviders: StaticProvider[]) =>
        (getPlatform() || platformBrowserDynamic(extraProviders)).bootstrapModule(Ng2CModule));


// The AngularJS app including downgraded modules and components.
// #docregion shared-root-module
const appModule =
    angular
        .module(
            'exampleAppModule', [downgradedNg2AModule, downgradedNg2BModule, downgradedNg2CModule])
        // #enddocregion shared-root-module
        .component('exampleApp', {template: '<ng2-a></ng2-a> | <ng2-b></ng2-b> | <ng2-c></ng2-c>'})
        .directive('ng2A', downgradeComponent({
                     component: Ng2AComponent,
                     // Since there is more than one downgraded Angular module,
                     // specify which module this component belongs to.
                     downgradedModule: downgradedNg2AModule,
                     propagateDigest: false,
                   }))
        .directive('ng2B', downgradeComponent({
                     component: Ng2BComponent,
                     // Since there is more than one downgraded Angular module,
                     // specify which module this component belongs to.
                     downgradedModule: downgradedNg2BModule,
                     propagateDigest: false,
                   }))
        .directive('ng2C', downgradeComponent({
                     component: Ng2CComponent,
                     // Since there is more than one downgraded Angular module,
                     // specify which module this component belongs to.
                     downgradedModule: downgradedNg2CModule,
                     propagateDigest: false,
                   }));


// Bootstrap the AngularJS app.
angular.bootstrap(document.body, [appModule.name]);
