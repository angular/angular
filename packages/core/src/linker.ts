/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Public API for compiler
export {
  Compiler,
  COMPILER_OPTIONS,
  CompilerFactory,
  CompilerOptions,
  ModuleWithComponentFactories,
} from './linker/compiler';
export {ComponentFactory, ComponentRef} from './linker/component_factory';
export {ComponentFactoryResolver} from './linker/component_factory_resolver';
export {DestroyRef} from './linker/destroy_ref';
export {ElementRef} from './linker/element_ref';
export {NgModuleFactory, NgModuleRef} from './linker/ng_module_factory';
export {getModuleFactory, getNgModuleById} from './linker/ng_module_factory_loader';
export {QueryList} from './linker/query_list';
export {TemplateRef} from './linker/template_ref';
export {ViewContainerRef} from './linker/view_container_ref';
export {EmbeddedViewRef, ViewRef} from './linker/view_ref';
