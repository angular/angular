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
 * Entry point for all APIs of the compiler package.
 *
 * <div class="callout is-critical">
 *   <header>Unstable APIs</header>
 *   <p>
 *     All compiler apis are currently considered experimental and private!
 *   </p>
 *   <p>
 *     We expect the APIs in this package to keep on changing. Do not rely on them.
 *   </p>
 * </div>
 */
export {VERSION} from './src/version';
export * from './src/template_parser/template_ast';
export {TEMPLATE_TRANSFORMS} from './src/template_parser/template_parser';
export {CompilerConfig, RenderTypes} from './src/config';
export * from './src/compile_metadata';
export * from './src/aot/compiler_factory';
export * from './src/aot/compiler';
export * from './src/aot/compiler_host';
export * from './src/aot/static_reflector';
export * from './src/aot/static_reflection_capabilities';
export * from './src/aot/static_symbol';
export * from './src/aot/static_symbol_resolver';
export * from './src/aot/summary_resolver';
export * from './src/summary_resolver';
export {JitCompiler} from './src/jit/compiler';
export * from './src/jit/compiler_factory';
export * from './src/url_resolver';
export * from './src/resource_loader';
export {DirectiveResolver} from './src/directive_resolver';
export {PipeResolver} from './src/pipe_resolver';
export {NgModuleResolver} from './src/ng_module_resolver';
export {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './src/ml_parser/interpolation_config';
export * from './src/schema/element_schema_registry';
export * from './src/i18n/index';
export * from './src/directive_normalizer';
export * from './src/expression_parser/lexer';
export * from './src/expression_parser/parser';
export * from './src/metadata_resolver';
export * from './src/ml_parser/html_parser';
export * from './src/ml_parser/interpolation_config';
export {NgModuleCompiler} from './src/ng_module_compiler';
export {DirectiveWrapperCompiler} from './src/directive_wrapper_compiler';
export * from './src/output/path_util';
export * from './src/output/ts_emitter';
export * from './src/parse_util';
export * from './src/schema/dom_element_schema_registry';
export * from './src/selector';
export * from './src/style_compiler';
export * from './src/template_parser/template_parser';
export {ViewCompiler} from './src/view_compiler/view_compiler';
export {AnimationParser} from './src/animation/animation_parser';
export {SyntaxError} from './src/util';
// This file only reexports content of the `src` folder. Keep it that way.
