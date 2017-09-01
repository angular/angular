/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This index allows tsc-wrapped to be used with no dependency on tsickle.
// Short-term workaround until tsc-wrapped is removed entirely.
export {MetadataWriterHost} from './src/compiler_host';
export {CodegenExtension, UserError, createBundleIndexHost} from './src/main_no_tsickle';
export {default as AngularCompilerOptions} from './src/options';

export * from './src/bundler';
export * from './src/cli_options';
export * from './src/collector';
export * from './src/index_writer';
export * from './src/schema';
