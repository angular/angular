/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../facade/lang';
import {ComponentFactory} from './component_factory';

/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 *
 * @deprecated Use {@link ComponentFactoryResolver} together with {@link
 * NgModule}.precompile}/{@link Component}.precompile or
 * {@link ANALYZE_FOR_PRECOMPILE} provider for dynamic component creation.
 * Use {@link NgModuleFactoryLoader} for lazy loading.
 */
export abstract class ComponentResolver {
  static DynamicCompilationDeprecationMsg =
      'ComponentResolver is deprecated for dynamic compilation. Use ComponentFactoryResolver together with @NgModule/@Component.precompile or ANALYZE_FOR_PRECOMPILE provider instead. For runtime compile only, you can also use Compiler.compileComponentSync/Async.';
  static LazyLoadingDeprecationMsg =
      'ComponentResolver is deprecated for lazy loading. Use NgModuleFactoryLoader instead.';


  abstract resolveComponent(component: Type|string): Promise<ComponentFactory<any>>;
  abstract clearCache(): void;
}
