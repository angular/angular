/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveMeta, MetadataReader} from './api';
import {BindingPropertyName, ClassPropertyMapping, ClassPropertyName} from './property_mapping';

const EMPTY_ARRAY: any[] = [];

/** Resolves the host directives of a directive to a flat array of matches. */
export class HostDirectivesResolver<T extends DirectiveMeta> {
  constructor(private metaReader: MetadataReader) {}

  /** Resolves all of the host directives that apply to a directive. */
  resolve(metadata: T): ReadonlyArray<T> {
    return metadata.hostDirectives ? this.walkHostDirectives(metadata.hostDirectives, []) :
                                     EMPTY_ARRAY;
  }

  /**
   * Traverses all of the host directive chains and produces a flat array of
   * directive metadata representing the host directives that apply to the host.
   */
  private walkHostDirectives(
      directives: NonNullable<DirectiveMeta['hostDirectives']>, results: T[]): ReadonlyArray<T> {
    for (const current of directives) {
      const hostMeta = this.metaReader.getDirectiveMetadata(current.directive);

      if (hostMeta === null) {
        throw new Error(
            `Could not resolve host directive metadata of ${current.directive.debugName}`);
      }

      if (!hostMeta.isStandalone) {
        throw new Error(`Host directive ${hostMeta.name} must be standalone`);
      }

      if (hostMeta.isComponent) {
        throw new Error(`Host directive ${hostMeta.name} cannot be a component`);
      }

      if (hostMeta.hostDirectives) {
        this.walkHostDirectives(hostMeta.hostDirectives, results);
      }

      results.push({
        ...hostMeta,
        inputs: this.filterMappings(hostMeta.inputs, current.inputs),
        outputs: this.filterMappings(hostMeta.outputs, current.outputs),
      } as T);
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
      allowedProperties: ClassPropertyMapping|null): ClassPropertyMapping {
    const result: Record<string, BindingPropertyName|[ClassPropertyName, BindingPropertyName]> = {};

    if (allowedProperties) {
      for (const [propertyName, inputOrOutputName] of allowedProperties) {
        if (source.hasBindingPropertyName(propertyName)) {
          result[propertyName] = inputOrOutputName;
        }
      }
    }

    return ClassPropertyMapping.fromMappedObject(result);
  }
}
