/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="node" />

export {
  createForwardRefResolver,
  findAngularDecorator,
  getAngularDecorators,
  isAngularDecorator,
  NoopReferencesRegistry,
  ReferencesRegistry,
  ResourceLoader,
  ResourceLoaderContext,
  JitDeclarationRegistry,
} from './common';
export {ComponentDecoratorHandler} from './component';
export {
  DirectiveDecoratorHandler,
  InitializerApiFunction,
  INPUT_INITIALIZER_FN,
  MODEL_INITIALIZER_FN,
  OUTPUT_INITIALIZER_FNS,
  QUERY_INITIALIZER_FNS,
  queryDecoratorNames,
  QueryFunctionName,
  tryParseInitializerApi,
  tryParseInitializerBasedOutput,
  tryParseSignalInputMapping,
  tryParseSignalModelMapping,
  tryParseSignalQueryFromInitializer,
} from './directive';
export {NgModuleDecoratorHandler} from './ng_module';
export {InjectableDecoratorHandler} from './src/injectable';
export {PipeDecoratorHandler} from './src/pipe';
