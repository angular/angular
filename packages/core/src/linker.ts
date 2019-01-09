/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Public API for compiler
export {COMPILER_OPTIONS, Compiler, CompilerFactory, CompilerOptions, ModuleWithComponentFactories} from './linker/compiler';
export {ComponentFactory, ComponentRef} from './linker/component_factory';
export {ComponentFactoryResolver} from './linker/component_factory_resolver';
export {NgModuleFactory, NgModuleRef} from './linker/ng_module_factory';
export {NgModuleFactoryLoader, getModuleFactory} from './linker/ng_module_factory_loader';
export {SystemJsNgModuleLoader, SystemJsNgModuleLoaderConfig} from './linker/system_js_ng_module_factory_loader';
export {ViewContainerRef} from './linker/view_container_ref';
export {QueryList} from './primitives/query_list';
export {ElementRef} from './ref/element_ref';
export {TemplateRef} from './ref/template_ref';
export {EmbeddedViewRef, ViewRef} from './ref/view_ref';
