export { PLATFORM_DIRECTIVES, PLATFORM_PIPES } from 'angular2/src/core/platform_directives_and_pipes';
export * from 'angular2/src/compiler/template_ast';
export { TEMPLATE_TRANSFORMS } from 'angular2/src/compiler/template_parser';
export { CompilerConfig, RenderTypes } from './config';
export * from './compile_metadata';
export * from './offline_compiler';
export { RuntimeCompiler } from './runtime_compiler';
export * from 'angular2/src/compiler/url_resolver';
export * from 'angular2/src/compiler/xhr';
export { ViewResolver } from './view_resolver';
export { DirectiveResolver } from './directive_resolver';
export { PipeResolver } from './pipe_resolver';
import { Type } from 'angular2/src/facade/lang';
/**
 * A set of providers that provide `RuntimeCompiler` and its dependencies to use for
 * template compilation.
 */
export declare const COMPILER_PROVIDERS: Array<any | Type | {
    [k: string]: any;
} | any[]>;
