/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export * from './src/api';
export {DtsMetadataReader} from './src/dts';
export {flattenInheritedDirectiveMetadata} from './src/inheritance';
export {CompoundMetadataRegistry, LocalMetadataRegistry} from './src/registry';
export {ResourceRegistry, isExternalResource} from './src/resource_registry';
export {
  extractDirectiveTypeCheckMeta,
  hasInjectableFields,
  CompoundMetadataReader,
  isHostDirectiveMetaForGlobalMode,
} from './src/util';
export {ClassPropertyMapping} from './src/property_mapping';
export {ExportedProviderStatusResolver} from './src/providers';
export {HostDirectivesResolver} from './src/host_directives_resolver';
//# sourceMappingURL=index.js.map
