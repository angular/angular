/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../diagnostics';
import {DirectiveMeta, HostDirectiveMeta, MatchSource, MetadataReader} from '../../metadata/src/api';
import {BindingPropertyName, ClassPropertyMapping, ClassPropertyName} from '../src/property_mapping';

import {flattenInheritedDirectiveMetadata} from './inheritance';

const EMPTY_ARRAY: any[] = [];

/** Resolves the host directives of a directive to a flat array of matches. */
export class HostDirectivesResolver {
  constructor(private metaReader: MetadataReader) {}

  /** Resolves all of the host directives that apply to a directive. */
  resolve(metadata: DirectiveMeta): ReadonlyArray<DirectiveMeta> {
    return metadata.hostDirectives && metadata.hostDirectives.length > 0 ?
        this.walkHostDirectives(metadata.hostDirectives, []) :
        EMPTY_ARRAY;
  }

  /** Validates that the passed in array of host directives is correct. */
  validate(hostDirectives: HostDirectiveMeta[]): ts.DiagnosticWithLocation[] {
    if (!hostDirectives.length) {
      return EMPTY_ARRAY;
    }

    const diagnostics: ts.DiagnosticWithLocation[] = [];

    for (const current of hostDirectives) {
      // Note that we don't need to go through `flattenInheritedDirectiveMetadata` here,
      // because we're only validating fields that can't be inherited.
      const hostMeta = this.metaReader.getDirectiveMetadata(current.directive);

      if (hostMeta === null) {
        diagnostics.push(makeDiagnostic(
            ErrorCode.UNRESOLVED_HOST_DIRECTIVE,
            current.directive.getOriginForDiagnostics(current.origin),
            `Could not resolve host directive metadata of ${current.directive.debugName}`));
        continue;
      }

      if (!hostMeta.isStandalone) {
        diagnostics.push(makeDiagnostic(
            ErrorCode.HOST_DIRECTIVE_NOT_STANDALONE,
            current.directive.getOriginForDiagnostics(current.origin),
            `Host directive ${hostMeta.name} must be standalone`));
      }

      if (hostMeta.isComponent) {
        diagnostics.push(makeDiagnostic(
            ErrorCode.HOST_DIRECTIVE_COMPONENT,
            current.directive.getOriginForDiagnostics(current.origin),
            `Host directive ${hostMeta.name} cannot be a component`));
      }
    }

    return diagnostics;
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

      // This case is already handled in `validate`, but we keep the assertion here so that the
      // user gets a better error message than "Cannot read property foo of null" in case something
      // slipped through.
      if (hostMeta === null) {
        throw new Error(
            `Could not resolve host directive metadata of ${current.directive.debugName}`);
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
