/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './src/api.js';
export {DtsMetadataReader} from './src/dts.js';
export {flattenInheritedDirectiveMetadata} from './src/inheritance.js';
export {CompoundMetadataRegistry, LocalMetadataRegistry, InjectableClassRegistry} from './src/registry.js';
export {ResourceRegistry, Resource, ComponentResources, isExternalResource, ExternalResource} from './src/resource_registry.js';
export {extractDirectiveTypeCheckMeta, CompoundMetadataReader} from './src/util.js';
export {BindingPropertyName, ClassPropertyMapping, ClassPropertyName, InputOrOutput} from './src/property_mapping.js';
