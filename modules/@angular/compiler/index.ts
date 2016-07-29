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
import * as i18n from './src/i18n/index';

export {COMPILER_PROVIDERS, CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileFactoryMetadata, CompileIdentifierMetadata, CompileMetadataWithIdentifier, CompilePipeMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTemplateMetadata, CompileTokenMetadata, CompileTypeMetadata, CompilerConfig, DEFAULT_PACKAGE_URL_PROVIDER, DirectiveResolver, NgModuleResolver, OfflineCompiler, PipeResolver, RenderTypes, RuntimeCompiler, SourceModule, TEMPLATE_TRANSFORMS, UrlResolver, XHR, analyzeAppProvidersForDeprecatedConfiguration, createOfflineCompileUrlResolver, platformCoreDynamic} from './src/compiler';
export {InterpolationConfig} from './src/html_parser/interpolation_config';
export {ElementSchemaRegistry} from './src/schema/element_schema_registry';
export {i18n};

export * from './src/template_parser/template_ast';
export * from './private_export';
