/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveMeta, MatchSource, MetadataReader} from '../../metadata/src/api';
import {ClassDeclaration} from '../../reflection';
import {BindingPropertyName, ClassPropertyMapping, ClassPropertyName} from '../src/property_mapping';

import {flattenInheritedDirectiveMetadata} from './inheritance';

const EMPTY_ARRAY: ReadonlyArray<any> = [];

/** Resolves the host directives of a directive to a flat array of matches. */
export class HostDirectivesResolver {
  private cache = new Map<ClassDeclaration, ReadonlyArray<DirectiveMeta>>();

  constructor(private metaReader: MetadataReader) {}

  /** Resolves all of the host directives that apply to a directive. */
  resolve(metadata: DirectiveMeta): ReadonlyArray<DirectiveMeta> {
    if (this.cache.has(metadata.ref.node)) {
      return this.cache.get(metadata.ref.node)!;
    }

    const results = metadata.hostDirectives && metadata.hostDirectives.length > 0 ?
        this.walkHostDirectives(metadata.hostDirectives, []) :
        EMPTY_ARRAY;
    this.cache.set(metadata.ref.node, results);
    return results;
  }

  /**
   * Traverses all of the host directive chains and produces a flat array of
   * directive metadata representing the host directives that apply to the host.
   */
  private walkHostDirectives(
      directives: NonNullable<DirectiveMeta['hostDirectives']>,
      results: DirectiveMeta[]): ReadonlyArray<DirectiveMeta> {
    for (const current of directives) {
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
        inputs: this.filterMappings(hostMeta.inputs, current.inputs),
        outputs: this.filterMappings(hostMeta.outputs, current.outputs),
      });
    }

    return results;
  }

  /**
   * Filters the class property mappings so that only the allowed ones are present.
   * @param source Property mappings that should be filtered.
   * @param allowedProperties Property mappings that are allowed in the final results.
   */
  private filterMappings(
      source: ClassPropertyMapping,
      allowedProperties: {[publicName: string]: string}|null): ClassPropertyMapping {
    const result: Record<string, BindingPropertyName|[ClassPropertyName, BindingPropertyName]> = {};

    if (allowedProperties !== null) {
      for (const publicName in allowedProperties) {
        if (allowedProperties.hasOwnProperty(publicName)) {
          const bindings = source.getByBindingPropertyName(publicName);

          if (bindings !== null) {
            for (const binding of bindings) {
              result[binding.classPropertyName] = allowedProperties[publicName];
            }
          }
        }
      }
    }

    return ClassPropertyMapping.fromMappedObject(result);
  }
}
