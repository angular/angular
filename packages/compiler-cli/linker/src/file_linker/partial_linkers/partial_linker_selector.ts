/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PartialComponentLinkerVersion1} from './partial_component_linker_1';
import {PartialDirectiveLinkerVersion1} from './partial_directive_linker_1';
import {PartialLinker} from './partial_linker';

export class PartialLinkerSelector<TStatement, TExpression> {
  private linkers: Record<string, Record<number, PartialLinker<TStatement, TExpression>>> = {
    '$ngDeclareDirective': {
      1: new PartialDirectiveLinkerVersion1(),
    },
    '$ngDeclareComponent': {
      1: new PartialComponentLinkerVersion1(),
    },
  };

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
  getLinker(functionName: string, version: number): PartialLinker<TStatement, TExpression> {
    const versions = this.linkers[functionName];
    if (versions === undefined) {
      throw new Error(`Unknown partial declaration function ${functionName}.`);
    }
    const linker = versions[version];
    if (linker === undefined) {
      throw new Error(`Unsupported partial declaration version ${version} for ${functionName}.`);
    }
    return linker;
  }
}
