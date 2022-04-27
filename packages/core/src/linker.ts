/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Public API for compiler
export {Compiler, COMPILER_OPTIONS, CompilerFactory, CompilerOptions, ModuleWithComponentFactories} from './linker/compiler.js';
export {ComponentFactory, ComponentRef} from './linker/component_factory.js';
export {ComponentFactoryResolver} from './linker/component_factory_resolver.js';
export {ElementRef} from './linker/element_ref.js';
export {NgModuleFactory, NgModuleRef} from './linker/ng_module_factory.js';
export {getModuleFactory, getNgModuleById} from './linker/ng_module_factory_loader.js';
export {QueryList} from './linker/query_list.js';
export {TemplateRef} from './linker/template_ref.js';
export {ViewContainerRef} from './linker/view_container_ref.js';
export {EmbeddedViewRef, ViewRef} from './linker/view_ref.js';
