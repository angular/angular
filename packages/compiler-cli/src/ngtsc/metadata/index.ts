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
export {
  ResourceRegistry,
  Resource,
  DirectiveResources,
  isExternalResource,
  ExternalResource,
} from './src/resource_registry';
export {
  extractDirectiveTypeCheckMeta,
  hasInjectableFields,
  CompoundMetadataReader,
  isHostDirectiveMetaForGlobalMode,
} from './src/util';
export {
  BindingPropertyName,
  ClassPropertyMapping,
  ClassPropertyName,
  InputOrOutput,
} from './src/property_mapping';
export {ExportedProviderStatusResolver} from './src/providers';
export {HostDirectivesResolver} from './src/host_directives_resolver';
