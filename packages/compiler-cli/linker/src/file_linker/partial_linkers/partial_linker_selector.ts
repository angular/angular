/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {satisfies} from 'semver';
import {LinkerOptions} from '../linker_options';

import {PartialComponentLinkerVersion1} from './partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from './partial_directive_linker_1';
import {PartialLinker} from './partial_linker';

export class PartialLinkerSelector<TExpression> {
  /**
   * A database of linker instances that should be used if their given semver range satisfies the
   * version found in the code to be linked.
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
  private linkers: Record<string, {range: string, linker: PartialLinker<TExpression>}[]> = {
    'ɵɵngDeclareDirective': [
      {range: '0.0.0-PLACEHOLDER', linker: new PartialDirectiveLinkerVersion1()},
      {range: '>=11.1.0-next.1', linker: new PartialDirectiveLinkerVersion1()},
    ],
    'ɵɵngDeclareComponent':
        [
          {range: '0.0.0-PLACEHOLDER', linker: new PartialComponentLinkerVersion1(this.options)},
          {range: '>=11.1.0-next.1', linker: new PartialComponentLinkerVersion1(this.options)},
        ],
  };

  constructor(private options: LinkerOptions) {}

  /**
   * Returns true if there are `PartialLinker` classes that can handle functions with this name.
   */
  supportsDeclaration(functionName: string): boolean {
    return this.linkers[functionName] !== undefined;
  }

  /**
   * Returns the `PartialLinker` that can handle functions with the given name and version.
   * Throws an error if there is none.
   */
  getLinker(functionName: string, version: string): PartialLinker<TExpression> {
    const versions = this.linkers[functionName];
    if (versions === undefined) {
      throw new Error(`Unknown partial declaration function ${functionName}.`);
    }
    for (const {range, linker} of versions) {
      if (satisfies(version, range, {includePrerelease: true})) {
        return linker;
      }
    }
    throw new Error(
        `Unsupported partial declaration version ${version} for ${functionName}.\n` +
        'Valid version ranges are:\n' + versions.map(v => ` - ${v.range}`).join('\n'));
  }
}
