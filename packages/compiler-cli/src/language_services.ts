/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*

The API from compiler-cli that language-service can see.
It is important that none the exported modules require anything other than
Angular modules and Typescript as this will indirectly add a dependency
to the language service.

*/
export {MetadataCollector, ModuleMetadata} from './metadata';
export {CompilerOptions} from './transformers/api';
export {createMetadataReaderCache, MetadataReaderCache, MetadataReaderHost, readMetadata} from './transformers/metadata_reader';
