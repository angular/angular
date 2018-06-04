/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, Directive, Injectable, Injector, Input, NgModule, NgModuleFactory, NgModuleRef, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewContainerRef, defineInjector} from '../../../src/core';
import * as r3 from '../../../src/render3/index';

const details_elided = {
  type: Object,
} as any;
export type $ComponentDef$ = any;

///////////
// Lib A - Compiled pre-Ivy
//    "enableIvy": false
//////////

// BEGIN FILE: node_modules/libA/module.ts (Compiled without Ivy)
@Component({})
export class LibAComponent {
}

@NgModule({declarations: [LibAComponent], imports: []})
export class LibAModule {
}
// END FILE: node_modules/libA/module.ts
// BEGIN FILE: node_modules/libA/module.metadata.json
// Abridged version of metadata
const node_modules_libA_module_metadata = {
  'LibAModule': {
    refs: ['LibAComponent'],
    constructorDes: [],
  },
  'LibAComponent': {
    constructorDes: [],
  }
};
// END FILE: node_modules/libA/module.metadata.json


///////////
// Lib B - Compiled with Ivy
//    "enableIvy": true
//////////


// BEGIN FILE: node_modules/libB/module.ts (Compiled with Ivy)
@Component({})
export class LibBComponent {
  // COMPILER GENERATED
  static ngComponentDef: $ComponentDef$ = r3.defineComponent(details_elided);
}

@NgModule({declarations: [LibAComponent], imports: []})
export class LibBModule {
  // COMPILER GENERATED
  static ngInjectorDef = defineInjector(details_elided);
}
// END FILE: node_modules/libB/module.ts
// BEGIN FILE: node_modules/libB/module.metadata.json
// Abridged version of metadata
// Must still generate metadata in case it should be consumed with non-ivy application
// Must mark the metadata with `hasNgDef: true` so that Ivy knows to ignore it.
const node_modules_libB_module_metadata = {
  'LibBModule': {refs: ['LibBComponent'], constructorDes: [], hasNgDef: true},
  'LibBComponent': {constructorDes: [], hasNgDef: true}
};
// END FILE: node_modules/libA/module.metadata.json



///////////
// Lib B - Compiled with Ivy
//    "enableIvy": true
//    "enableIvyBackPatch": true
//////////


// BEGIN FILE: src/app.ts (Compiled with Ivy)
@Component({})
export class AppComponent {
  // COMPILER GENERATED
  static ngComponentDef: $ComponentDef$ = r3.defineComponent(details_elided);
}

@NgModule({declarations: [LibAComponent], imports: []})
export class AppModule {
  // COMPILER GENERATED
  static ngInjectorDef = defineInjector(details_elided);
}
// END FILE: src/app.ts

// BEGIN FILE: src/main.ts
// platformBrowserDynamic().bootstrapModule(AppModule);
// CLI rewrites it later to:
// platformBrowser().bootstrapModuleFactory(AppModuleFactory);
// END FILE: src/main.ts

// BEGIN FILE: src/app.ngfactory.ts
function ngBackPatch_node_modules_libB_module() {
  ngBackPatch_node_modules_libB_module_LibAComponent();
  ngBackPatch_node_modules_libB_module_LibAModule();
}

function ngBackPatch_node_modules_libB_module_LibAComponent() {
  (LibAComponent as any).ngComponentDef = r3.defineComponent(details_elided);
}

function ngBackPatch_node_modules_libB_module_LibAModule() {
  (LibAModule as any).ngInjectorDef = defineInjector(details_elided);
}

export const AppModuleFactory: NgModuleFactory<AppModule>&{patchedDeps: boolean} = {
  moduleType: AppModule,
  patchedDeps: false,
  create(parentInjector: Injector | null): NgModuleRef<AppModule>{
      this.patchedDeps && ngBackPatch_node_modules_libB_module() && (this.patchedDeps = true);
      return details_elided;}
};
// BEGIN FILE: src/app.ngfactory.ts


// ISSUE: I don't think this works. The issue is that multiple modules get flattened into single
// module and hence we can't patch transitively.
// ISSUE: can non-ivy @NgModule import Ivy @NgModule? I assume no, since the flattening of modules
// happens during compilation.

// BEGIN FILE: src/main.ts
// platformBrowserDynamic().bootstrapModule(AppModule);
// CLI rewrites it to:
// platformBrowser().bootstrapModuleFactory(AppModuleFactory);
// END FILE: src/main.ts
