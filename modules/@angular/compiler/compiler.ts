/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Starting point to import all compiler APIs.
 */
export {COMPILER_PROVIDERS, CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileFactoryMetadata, CompileIdentifierMetadata, CompileMetadataWithIdentifier, CompilePipeMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTemplateMetadata, CompileTokenMetadata, CompileTypeMetadata, CompilerConfig, DEFAULT_PACKAGE_URL_PROVIDER, DirectiveResolver, NgModuleResolver, OfflineCompiler, PipeResolver, RenderTypes, RuntimeCompiler, SourceModule, TEMPLATE_TRANSFORMS, UrlResolver, XHR, analyzeAppProvidersForDeprecatedConfiguration, createOfflineCompileUrlResolver, platformCoreDynamic} from './src/compiler';
export {ElementSchemaRegistry} from './src/schema/element_schema_registry';

export * from './src/template_parser/template_ast';
export * from './private_export';
