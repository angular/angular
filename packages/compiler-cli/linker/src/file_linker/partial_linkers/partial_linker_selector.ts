/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import semver from 'semver';

import {Logger} from '../../../../src/ngtsc/logging';
import {createGetSourceFile} from '../get_source_file';
import {LinkerEnvironment} from '../linker_environment';

import {PartialClassMetadataAsyncLinkerVersion1} from './partial_class_metadata_async_linker_1';
import {PartialClassMetadataLinkerVersion1} from './partial_class_metadata_linker_1';
import {PartialComponentLinkerVersion1} from './partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from './partial_directive_linker_1';
import {PartialFactoryLinkerVersion1} from './partial_factory_linker_1';
import {PartialInjectableLinkerVersion1} from './partial_injectable_linker_1';
import {PartialInjectorLinkerVersion1} from './partial_injector_linker_1';
import {PartialLinker} from './partial_linker';
import {PartialNgModuleLinkerVersion1} from './partial_ng_module_linker_1';
import {PartialPipeLinkerVersion1} from './partial_pipe_linker_1';
import {PLACEHOLDER_VERSION} from './util';
import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system/src/types';

export const ɵɵngDeclareDirective = 'ɵɵngDeclareDirective';
export const ɵɵngDeclareClassMetadata = 'ɵɵngDeclareClassMetadata';
export const ɵɵngDeclareComponent = 'ɵɵngDeclareComponent';
export const ɵɵngDeclareFactory = 'ɵɵngDeclareFactory';
export const ɵɵngDeclareInjectable = 'ɵɵngDeclareInjectable';
export const ɵɵngDeclareInjector = 'ɵɵngDeclareInjector';
export const ɵɵngDeclareNgModule = 'ɵɵngDeclareNgModule';
export const ɵɵngDeclarePipe = 'ɵɵngDeclarePipe';
export const ɵɵngDeclareClassMetadataAsync = 'ɵɵngDeclareClassMetadataAsync';
export const declarationFunctions = [
  ɵɵngDeclareDirective,
  ɵɵngDeclareClassMetadata,
  ɵɵngDeclareComponent,
  ɵɵngDeclareFactory,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule,
  ɵɵngDeclarePipe,
  ɵɵngDeclareClassMetadataAsync,
];

export interface LinkerRange<TExpression> {
  range: semver.Range;
  linker: PartialLinker<TExpression>;
}

/**
 * Create a mapping between partial-declaration call name and collections of partial-linkers.
 *
 * Each collection of partial-linkers will contain a version range that will be matched against the
 * `minVersion` of the partial-declaration. (Additionally, a partial-linker may modify its behaviour
 * internally based on the `version` property of the declaration.)
 *
 * Versions should be sorted in ascending order. The most recent partial-linker will be used as the
 * fallback linker if none of the other version ranges match. For example:
 *
 * ```
 * {range: getRange('<=', '13.0.0'), linker PartialDirectiveLinkerVersion2(...) },
 * {range: getRange('<=', '13.1.0'), linker PartialDirectiveLinkerVersion3(...) },
 * {range: getRange('<=', '14.0.0'), linker PartialDirectiveLinkerVersion4(...) },
 * {range: LATEST_VERSION_RANGE, linker: new PartialDirectiveLinkerVersion1(...)},
 * ```
 *
 * If the `LATEST_VERSION_RANGE` is `<=15.0.0` then the fallback linker would be
 * `PartialDirectiveLinkerVersion1` for any version greater than `15.0.0`.
 *
 * When there is a change to a declaration interface that requires a new partial-linker, the
 * `minVersion` of the partial-declaration should be updated, the new linker implementation should
 * be added to the end of the collection, and the version of the previous linker should be updated.
 */
export function createLinkerMap<TStatement, TExpression>(
  environment: LinkerEnvironment<TStatement, TExpression>,
  sourceUrl: AbsoluteFsPath,
  code: string,
): Map<string, LinkerRange<TExpression>[]> {
  const linkers = new Map<string, LinkerRange<TExpression>[]>();
  const LATEST_VERSION_RANGE = getRange('<=', PLACEHOLDER_VERSION);

  linkers.set(ɵɵngDeclareDirective, [
    {range: LATEST_VERSION_RANGE, linker: new PartialDirectiveLinkerVersion1(sourceUrl, code)},
  ]);
  linkers.set(ɵɵngDeclareClassMetadataAsync, [
    {range: LATEST_VERSION_RANGE, linker: new PartialClassMetadataAsyncLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareClassMetadata, [
    {range: LATEST_VERSION_RANGE, linker: new PartialClassMetadataLinkerVersion1()},
  ]);
  linkers.set(ɵɵngDeclareComponent, [
    {
      range: LATEST_VERSION_RANGE,
      linker: new PartialComponentLinkerVersion1(
        createGetSourceFile(sourceUrl, code, environment.sourceFileLoader),
        sourceUrl,
        code,
      ),
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
      linker: new PartialNgModuleLinkerVersion1(environment.options.linkerJitMode),
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
 * satisfies the `minVersion` of the partial declaration to be linked.
 *
 * Note that the ranges are checked in order, and the first matching range will be selected. So
 * ranges should be most restrictive first. In practice, since ranges are always `<=X.Y.Z` this
 * means that ranges should be in ascending order.
 *
 * Note that any "pre-release" versions are stripped from ranges. Therefore if a `minVersion` is
 * `11.1.0-next.1` then this would match `11.1.0-next.2` and also `12.0.0-next.1`. (This is
 * different to standard semver range checking, where pre-release versions do not cross full version
 * boundaries.)
 */
export class PartialLinkerSelector<TExpression> {
  constructor(
    private readonly linkers: Map<string, LinkerRange<TExpression>[]>,
    private readonly logger: Logger,
    private readonly unknownDeclarationVersionHandling: 'ignore' | 'warn' | 'error',
  ) {}

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

    if (version === PLACEHOLDER_VERSION) {
      // Special case if the `version` is the same as the current compiler version.
      // This helps with compliance tests where the version placeholders have not been replaced.
      return linkerRanges[linkerRanges.length - 1].linker;
    }

    const declarationRange = getRange('>=', minVersion);
    for (const {range: linkerRange, linker} of linkerRanges) {
      if (semver.intersects(declarationRange, linkerRange)) {
        return linker;
      }
    }

    const message =
      `This application depends upon a library published using Angular version ${version}, ` +
      `which requires Angular version ${minVersion} or newer to work correctly.\n` +
      `Consider upgrading your application to use a more recent version of Angular.`;

    if (this.unknownDeclarationVersionHandling === 'error') {
      throw new Error(message);
    } else if (this.unknownDeclarationVersionHandling === 'warn') {
      this.logger.warn(`${message}\nAttempting to continue using this version of Angular.`);
    }

    // No linker was matched for this declaration, so just use the most recent one.
    return linkerRanges[linkerRanges.length - 1].linker;
  }
}

/**
 * Compute a semver Range from the `version` and comparator.
 *
 * The range is computed as any version greater/less than or equal to the given `versionStr`
 * depending upon the `comparator` (ignoring any prerelease versions).
 *
 * @param comparator a string that determines whether the version specifies a minimum or a maximum
 *     range.
 * @param versionStr the version given in the partial declaration
 * @returns A semver range for the provided `version` and comparator.
 */
function getRange(comparator: '<=' | '>=', versionStr: string): semver.Range {
  // If the provided version is exactly `0.0.0` then we are known to be running with an unpublished
  // version of angular and assume that all ranges are compatible.
  if (versionStr === '0.0.0' && (PLACEHOLDER_VERSION as string) === '0.0.0') {
    return new semver.Range('*.*.*');
  }
  const version = new semver.SemVer(versionStr);
  // Wipe out any prerelease versions
  version.prerelease = [];
  return new semver.Range(`${comparator}${version.format()}`);
}
