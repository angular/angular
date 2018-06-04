/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ContentChild, Directive, Injectable, Input, NgModule, OnDestroy, Optional, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewContainerRef, defineInjectable, defineInjector} from '../../../src/core';
import * as r3 from '../../../src/render3/index';


/**
 * GOALS:
 * - Patch types in tree shakable way
 * - Generate these types for files which have `metadata.json` (since those are the files which
 * have not been compiled with Ivy)
 * - Have build optimizer hoist the patch functions into corresponding types to allow tree-shaking.
 */

// File: node_modules/some_library/path/public.ts
// Implies metadata: node_modules/some_library/path/public.metadata.json
// Assume: node_modules/some_library/index.js re-exports ./path/public.ts#ThirdPartyClass
@Injectable()
class ThirdPartyClass {
}


@Injectable()
class CompiledWithIvy {
  // NORMATIVE
  static ngInjectableDef = defineInjectable(
      {factory: function CompileWithIvy_Factory() { return new CompiledWithIvy(); }});
  // /NORMATIVE
}

// import { CompiledWithIvy } from 'some_library';
@NgModule({providers: [ThirdPartyClass, CompiledWithIvy]})
class CompiledWithIvyModule {
  // NORMATIVE
  static ngInjectorDef = defineInjector({
    providers: [ThirdPartyClass, CompiledWithIvy],
    factory: function CompiledWithIvyModule_Factory() { return new CompiledWithIvyModule(); }
  });
  // /NORMATIVE
}

/**
 * Below is a function which should be generated right next to the `@NgModule` which
 * imports types which have `.metadata.json` files.
 *
 * # JIT Mode
 * - Because the `ngPatch_CompiledWithIvyModule` is invoked all parts get patched.
 *
 * # AOT Mode
 * - Build Optimizer detects `@__BUILD_OPTIMIZER_COLOCATE__` annotation and moves the
 * code from the current location to the destination.
 * - The resulting `ngPatch_CompiledWithIvyModule` becomes empty and eligible for tree-shaking.
 * - Uglify removes the `ngPatch_CompiledWithIvyModule` since it is empty.
 *
 * # AOT Closure Mode
 * - Option A: not supported. (Preferred option)
 *   - Externally very few people use closure they will just have to wait until all of their
 *     libraries are Ivy.
 *   - Internally (g3) we build from source hence everyone switches to Ivy at the same time.
 * - Option B: Write a closure pass similar to Build Optimizer which would move the code.
 */
// NORMATIVE
ngPatch_depsOf_CompiledWithIvyModule();
function ngPatch_depsOf_CompiledWithIvyModule() {
  ngPatch_node_modules_some_library_path_public_CompileWithIvy();
}
function ngPatch_node_modules_some_library_path_public_CompileWithIvy() {
  /** @__BUILD_OPTIMIZER_COLOCATE__ */
  (ThirdPartyClass as any).ngInjectableDef = defineInjectable(
      {factory: function CompileWithIvy_Factory() { return new ThirdPartyClass(); }});
}
// /NORMATIVE
