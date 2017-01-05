/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {AotCompilerHost, AotCompilerHost as StaticReflectorHost, StaticReflector, StaticSymbol} from '@angular/compiler';
export {CodeGenerator} from './src/codegen';
export {CompilerHost, CompilerHostContext, ModuleResolutionHostAdapter, NodeCompilerHostContext} from './src/compiler_host';
export {Extractor} from './src/extractor';
export * from '@angular/tsc-wrapped';
export {VERSION} from './src/version';


// TODO(hansl): moving to Angular 4 need to update this API.
export {NgTools_InternalApi_NG_2 as __NGTOOLS_PRIVATE_API_2} from './src/ngtools_api'
