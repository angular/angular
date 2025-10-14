/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {compileNgModule} from '../render3/jit/module';
import {makeDecorator} from '../util/decorators';
/**
 * @Annotation
 */
export const NgModule = makeDecorator(
  'NgModule',
  (ngModule) => ngModule,
  undefined,
  undefined,
  /**
   * Decorator that marks the following class as an NgModule, and supplies
   * configuration metadata for it.
   *
   * * The `declarations` option configures the compiler
   * with information about what belongs to the NgModule.
   * * The `providers` options configures the NgModule's injector to provide
   * dependencies the NgModule members.
   * * The `imports` and `exports` options bring in members from other modules, and make
   * this module's members available to others.
   */
  (type, meta) => compileNgModule(type, meta),
);
//# sourceMappingURL=ng_module.js.map
