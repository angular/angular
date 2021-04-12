/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {intersects, Range, SemVer} from 'semver';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {Logger} from '../../../../src/ngtsc/logging';
import {createGetSourceFile} from '../get_source_file';
import {LinkerEnvironment} from '../linker_environment';

import {PartialClassMetadataLinkerVersion1} from './partial_class_metadata_linker_1';
import {PartialComponentLinkerVersion1} from './partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from './partial_directive_linker_1';
import {PartialFactoryLinkerVersion1} from './partial_factory_linker_1';
import {PartialInjectableLinkerVersion1} from './partial_injectable_linker_1';
import {PartialInjectorLinkerVersion1} from './partial_injector_linker_1';
import {PartialLinker} from './partial_linker';
import {PartialNgModuleLinkerVersion1} from './partial_ng_module_linker_1';
import {PartialPipeLinkerVersion1} from './partial_pipe_linker_1';

export const ɵɵngDeclareDirective = 'ɵɵngDeclareDirective';
export const ɵɵngDeclareClassMetadata = 'ɵɵngDeclareClassMetadata';
export const ɵɵngDeclareComponent = 'ɵɵngDeclareComponent';
export const ɵɵngDeclareFactory = 'ɵɵngDeclareFactory';
export const ɵɵngDeclareInjectable = 'ɵɵngDeclareInjectable';
export const ɵɵngDeclareInjector = 'ɵɵngDeclareInjector';
export const ɵɵngDeclareNgModule = 'ɵɵngDeclareNgModule';
export const ɵɵngDeclarePipe = 'ɵɵngDeclarePipe';
export const declarationFunctions = [
  ɵɵngDeclareDirective, ɵɵngDeclareClassMetadata, ɵɵngDeclareComponent, ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable, ɵɵngDeclareInjector, ɵɵngDeclareNgModule, ɵɵngDeclarePipe
];

export interface LinkerRange<TExpression> {
  range: Range;
  linker: PartialLinker<TExpression>;
}

/**
 * Create a map of partial-linkers by declaration name and version.
 *
 * If a new declaration version is defined, which needs a different linker implementation, then
 * the old linker implementation should be added to the end of the array.
 *
 * Versions should be sorted in ascending order. The most recent partial-linker will be used as the
 * fallback linker if none of the other version ranges match. For example:
 *
 * ```
 * {range: getRange('<=', '13.0.0'), linker PartialDirectiveLinkerVersion2(...) },
 * {range: getRange('<=', '13.1.0'), linker PartialDirectiveLinkerVersion3(...) },
 * {range: getRange('<=', '14.0.0'), linker PartialDirectiveLinkerVersion4(...) },
 * {range: latestLinkerRange, linker: new PartialDirectiveLinkerVersion1(...)},
 * ```
 */
export function createLinkerMap<TStatement, TExpression>(
    environment: LinkerEnvironment<TStatement, TExpression>, sourceUrl: AbsoluteFsPath,
    code: string): Map<string, LinkerRange<TExpression>[]> {
  const linkers = new Map<string, LinkerRange<TExpression>[]>();
  const LATEST_VERSION_RANGE = getRange('<=', '0.0.0-PLACEHOLDER');

  linkers.set(ɵɵngDeclareDirective, [
    {range: LATEST_VERSION_RANGE, linker: new PartialDirectiveLinkerVersion1(sourceUrl, code)},
  ]);
  linkers.set(ɵɵngDeclareClassMetadata, [
    {range: LATEST_VERSION_RANGE, linker: new PartialClassMetadataLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareComponent, [
    {
      range: LATEST_VERSION_RANGE,
      linker: new PartialComponentLinkerVersion1(
          createGetSourceFile(sourceUrl, code, environment.sourceFileLoader), sourceUrl, code)
    },
  ]);
  linkers.set(ɵɵngDeclareFactory, [
    {range: LATEST_VERSION_RANGE, linker: new PartialFactoryLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareInjectable, [
    {range: LATEST_VERSION_RANGE, linker: new PartialInjectableLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareInjector, [
    {range: LATEST_VERSION_RANGE, linker: new PartialInjectorLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareNgModule, [
    {
      range: LATEST_VERSION_RANGE,
      linker: new PartialNgModuleLinkerVersion1(environment.options.linkerJitMode)
    },
  ]);
  linkers.set(ɵɵngDeclarePipe, [
    {range: LATEST_VERSION_RANGE, linker: new PartialPipeLinkerVersion1()},
  ]);

  return linkers;
}

/**
 * A helper that selects the appropriate `PartialLinker` for a given declaration.
 *
 * The selection is made from a database of linker instances, chosen if their given semver range
 * satisfies the version found in the code to be linked.
 *
 * Note that the ranges are checked in order, and the first matching range will be selected, so
 * ranges should be most restrictive first.
 *
 * Also, ranges are matched to include "pre-releases", therefore if the range is `>=11.1.0-next.1`
 * then this includes `11.1.0-next.2` and also `12.0.0-next.1`.
 *
 * Finally, note that we always start with the current version (i.e. `0.0.0-PLACEHOLDER`). This
 * allows the linker to work on local builds effectively.
 */
export class PartialLinkerSelector<TStatement, TExpression> {
  constructor(
      private readonly linkers: Map<string, LinkerRange<TExpression>[]>,
      private readonly logger: Logger,
      private unknownDeclarationVersionHandling: 'ignore'|'warn'|'error') {}

  /**
   * Returns true if there are `PartialLinker` classes that can handle functions with this name.
   */
  supportsDeclaration(functionName: string): boolean {
    return this.linkers.has(functionName);
  }

  /**
   * Returns the `PartialLinker` that can handle functions with the given name and version.
   * Throws an error if there is none.
   */
  getLinker(functionName: string, minVersion: string, version: string): PartialLinker<TExpression> {
    if (!this.linkers.has(functionName)) {
      throw new Error(`Unknown partial declaration function ${functionName}.`);
    }
    const linkerRanges = this.linkers.get(functionName)!;
    const declarationRange = getRange('>=', minVersion);
    for (const {range: linkerRange, linker} of linkerRanges) {
      if (intersects(declarationRange, linkerRange)) {
        return linker;
      }
    }

    const message = `Unsupported partial declaration version ${version} for ${functionName}.\n` +
        `The minimum supported partial-linker for this declaration is ${minVersion}.\n` +
        'Partial-linker version ranges available are:\n' +
        linkerRanges.map(v => ` - ${v.range}`).join('\n');

    if (this.unknownDeclarationVersionHandling === 'error') {
      throw new Error(message);
    } else if (this.unknownDeclarationVersionHandling === 'warn') {
      this.logger.warn(`${message}\nFalling back to the most recent partial-linker.`);
    }

    // No linker was matched for this declaration, so just use the first one.
    return linkerRanges[linkerRanges.length - 1].linker;
  }
}

/**
 * Compute a semver Range from the `version` and comparator.
 *
 * The range is computed as any version greater/less than or equal to the given `version`
 * depending upon the `comparator` (ignoring any prerelease versions).
 *
 * @param comparator a string that determines whether the version specifies a minimum or a maximum
 *     range.
 * @param version the version given in the partial declaration
 * @returns A semver range for the provided `version` and comparator.
 */
function getRange(comparator: '<='|'>=', versionStr: string): Range {
  const version = new SemVer(versionStr);
  // Wipe out any prerelease versions
  version.prerelease = [];
  return new Range(`${comparator}${version.format()}`);
}
