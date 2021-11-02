/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

export {ResourceLoader, ResourceLoaderContext} from './src/api';
export {ComponentDecoratorHandler} from './src/component';
export {DirectiveDecoratorHandler} from './src/directive';
export {InjectableDecoratorHandler} from './src/injectable';
export {NgModuleDecoratorHandler} from './src/ng_module';
export {PipeDecoratorHandler} from './src/pipe';
export {NoopReferencesRegistry, ReferencesRegistry} from './src/references_registry';
export {forwardRefResolver} from './src/util';
