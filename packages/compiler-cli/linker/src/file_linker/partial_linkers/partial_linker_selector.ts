/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {satisfies} from 'semver';

import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {createGetSourceFile} from '../get_source_file';
import {LinkerEnvironment} from '../linker_environment';

import {PartialComponentLinkerVersion1} from './partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from './partial_directive_linker_1';
import {PartialFactoryLinkerVersion1} from './partial_factory_linker_1';
import {PartialInjectorLinkerVersion1} from './partial_injector_linker_1';
import {PartialLinker} from './partial_linker';
import {PartialNgModuleLinkerVersion1} from './partial_ng_module_linker_1';
import {PartialPipeLinkerVersion1} from './partial_pipe_linker_1';

export const ɵɵngDeclareDirective = 'ɵɵngDeclareDirective';
export const ɵɵngDeclareComponent = 'ɵɵngDeclareComponent';
export const ɵɵngDeclareFactory = 'ɵɵngDeclareFactory';
export const ɵɵngDeclareInjector = 'ɵɵngDeclareInjector';
export const ɵɵngDeclareNgModule = 'ɵɵngDeclareNgModule';
export const ɵɵngDeclarePipe = 'ɵɵngDeclarePipe';
export const declarationFunctions = [
  ɵɵngDeclareDirective, ɵɵngDeclareComponent, ɵɵngDeclareFactory, ɵɵngDeclareInjector,
  ɵɵngDeclareNgModule, ɵɵngDeclarePipe
];

interface LinkerRange<TExpression> {
  range: string;
  linker: PartialLinker<TExpression>;
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
  private readonly linkers: Map<string, LinkerRange<TExpression>[]>;

  constructor(
      environment: LinkerEnvironment<TStatement, TExpression>, sourceUrl: AbsoluteFsPath,
      code: string) {
    this.linkers = this.createLinkerMap(environment, sourceUrl, code);
  }

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
  getLinker(functionName: string, version: string): PartialLinker<TExpression> {
    if (!this.linkers.has(functionName)) {
      throw new Error(`Unknown partial declaration function ${functionName}.`);
    }
    const versions = this.linkers.get(functionName)!;
    for (const {range, linker} of versions) {
      if (satisfies(version, range, {includePrerelease: true})) {
        return linker;
      }
    }
    throw new Error(
        `Unsupported partial declaration version ${version} for ${functionName}.\n` +
        'Valid version ranges are:\n' + versions.map(v => ` - ${v.range}`).join('\n'));
  }

  private createLinkerMap(
      environment: LinkerEnvironment<TStatement, TExpression>, sourceUrl: AbsoluteFsPath,
      code: string): Map<string, LinkerRange<TExpression>[]> {
    const partialDirectiveLinkerVersion1 = new PartialDirectiveLinkerVersion1(sourceUrl, code);
    const partialComponentLinkerVersion1 = new PartialComponentLinkerVersion1(
        environment, createGetSourceFile(sourceUrl, code, environment.sourceFileLoader), sourceUrl,
        code);
    const partialFactoryLinkerVersion1 = new PartialFactoryLinkerVersion1();
    const partialInjectorLinkerVersion1 = new PartialInjectorLinkerVersion1();
    const partialNgModuleLinkerVersion1 =
        new PartialNgModuleLinkerVersion1(environment.options.linkerJitMode);
    const partialPipeLinkerVersion1 = new PartialPipeLinkerVersion1();

    const linkers = new Map<string, LinkerRange<TExpression>[]>();
    linkers.set(ɵɵngDeclareDirective, [
      {range: '0.0.0-PLACEHOLDER', linker: partialDirectiveLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialDirectiveLinkerVersion1},
    ]);
    linkers.set(ɵɵngDeclareComponent, [
      {range: '0.0.0-PLACEHOLDER', linker: partialComponentLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialComponentLinkerVersion1},
    ]);
    linkers.set(ɵɵngDeclareFactory, [
      {range: '0.0.0-PLACEHOLDER', linker: partialFactoryLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialFactoryLinkerVersion1},
    ]);
    linkers.set(ɵɵngDeclareInjector, [
      {range: '0.0.0-PLACEHOLDER', linker: partialInjectorLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialInjectorLinkerVersion1},
    ]);
    linkers.set(ɵɵngDeclareNgModule, [
      {range: '0.0.0-PLACEHOLDER', linker: partialNgModuleLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialNgModuleLinkerVersion1},
    ]);
    linkers.set(ɵɵngDeclarePipe, [
      {range: '0.0.0-PLACEHOLDER', linker: partialPipeLinkerVersion1},
      {range: '>=11.1.0-next.1', linker: partialPipeLinkerVersion1},
    ]);
    return linkers;
  }
}
