/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Contains glue code which enables render3 JIT for the @angular/core annotations.
 */

import {defineInjectable} from '../../di/defs';
import {Injectable} from '../../di/injectable';
import {Component} from '../../metadata/directives';
import {NgModule} from '../../metadata/ng_module';

import {awaitCurrentlyCompilingComponents, compileComponentDecorator} from './directive';
import {compileInjectable} from './injectable';
import {compileNgModule} from './module';


/**
 * Enables JIT of the @angular/core annotations.
 */
export function enableRender3Jit(): void {
  Component.compile = compileComponentDecorator;
  Injectable.compile = compileInjectable;
  NgModule.compile = compileNgModule;
}

/**
 * A token representing an `APP_INITIALIZER` which awaits render3 component JIT compilation (which
 * is asynchronous due to template loading) before allowing bootstrap to proceed.
 */
export abstract class R3JitInitializer {
  /**
   * This token has a manual `ngInjectableDef`
   */
  static ngInjectableDef = defineInjectable({
    providedIn: 'root',
    factory: () => (() => awaitCurrentlyCompilingComponents()),
  });
}
