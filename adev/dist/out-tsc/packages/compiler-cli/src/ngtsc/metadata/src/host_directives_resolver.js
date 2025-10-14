/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MatchSource} from '../../metadata/src/api';
import {ClassPropertyMapping} from '../src/property_mapping';
import {flattenInheritedDirectiveMetadata} from './inheritance';
import {isHostDirectiveMetaForGlobalMode} from './util';
const EMPTY_ARRAY = [];
/** Resolves the host directives of a directive to a flat array of matches. */
export class HostDirectivesResolver {
  metaReader;
  cache = new Map();
  constructor(metaReader) {
    this.metaReader = metaReader;
  }
  /** Resolves all of the host directives that apply to a directive. */
  resolve(metadata) {
    if (this.cache.has(metadata.ref.node)) {
      return this.cache.get(metadata.ref.node);
    }
    const results =
      metadata.hostDirectives && metadata.hostDirectives.length > 0
        ? this.walkHostDirectives(metadata.hostDirectives, [])
        : EMPTY_ARRAY;
    this.cache.set(metadata.ref.node, results);
    return results;
  }
  /**
   * Traverses all of the host directive chains and produces a flat array of
   * directive metadata representing the host directives that apply to the host.
   */
  walkHostDirectives(directives, results) {
    for (const current of directives) {
      if (!isHostDirectiveMetaForGlobalMode(current)) {
        throw new Error('Impossible state: resolving code path in local compilation mode');
      }
      const hostMeta = flattenInheritedDirectiveMetadata(this.metaReader, current.directive);
      // This case has been checked for already and produces a diagnostic
      if (hostMeta === null) {
        continue;
      }
      if (hostMeta.hostDirectives) {
        this.walkHostDirectives(hostMeta.hostDirectives, results);
      }
      results.push({
        ...hostMeta,
        matchSource: MatchSource.HostDirective,
        inputs: ClassPropertyMapping.fromMappedObject(
          this.filterMappings(hostMeta.inputs, current.inputs, resolveInput),
        ),
        outputs: ClassPropertyMapping.fromMappedObject(
          this.filterMappings(hostMeta.outputs, current.outputs, resolveOutput),
        ),
      });
    }
    return results;
  }
  /**
   * Filters the class property mappings so that only the allowed ones are present.
   * @param source Property mappings that should be filtered.
   * @param allowedProperties Property mappings that are allowed in the final results.
   * @param valueResolver Function used to resolve the value that is assigned to the final mapping.
   */
  filterMappings(source, allowedProperties, valueResolver) {
    const result = {};
    if (allowedProperties !== null) {
      for (const publicName in allowedProperties) {
        if (allowedProperties.hasOwnProperty(publicName)) {
          const bindings = source.getByBindingPropertyName(publicName);
          if (bindings !== null) {
            for (const binding of bindings) {
              result[binding.classPropertyName] = valueResolver(
                allowedProperties[publicName],
                binding,
              );
            }
          }
        }
      }
    }
    return result;
  }
}
function resolveInput(bindingName, binding) {
  return {
    bindingPropertyName: bindingName,
    classPropertyName: binding.classPropertyName,
    required: binding.required,
    transform: binding.transform,
    isSignal: binding.isSignal,
  };
}
function resolveOutput(bindingName) {
  return bindingName;
}
//# sourceMappingURL=host_directives_resolver.js.map
