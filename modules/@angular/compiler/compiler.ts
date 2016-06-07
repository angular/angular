/**
 * @module
 * @description
 * Starting point to import all compiler APIs.
 */
export {ElementSchemaRegistry} from './src/schema/element_schema_registry';
export {
  COMPILER_PROVIDERS,
  TEMPLATE_TRANSFORMS,
  CompilerConfig,
  RenderTypes,
  UrlResolver,
  DEFAULT_PACKAGE_URL_PROVIDER,
  createOfflineCompileUrlResolver,
  XHR,
  ViewResolver,
  DirectiveResolver,
  PipeResolver,
  InjectorResolver,
  SourceModule,
  NormalizedComponentWithViewDirectives,
  OfflineCompiler,
  RuntimeCompiler,
  CompileMetadataWithIdentifier,
  CompileMetadataWithType,
  CompileIdentifierMetadata,
  CompileDiDependencyMetadata,
  CompileProviderMetadata,
  CompileFactoryMetadata,
  CompileTokenMetadata,
  CompileTypeMetadata,
  CompileQueryMetadata,
  CompileTemplateMetadata,
  CompileDirectiveMetadata,
  CompileInjectorMetadata,
  CompilePipeMetadata
} from './src/compiler';

export * from './src/template_ast';
export * from './private_export';
