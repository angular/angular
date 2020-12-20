/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A token representing the a reference to a static type.
 *
 * This token is unique for a filePath and name and can be used as a hash table key.
 */
export class StaticSymbol {
  constructor(public filePath: string, public name: string, public members: string[]) {}

  assertNoMembers() {
    if (this.members.length) {
      throw new Error(
          `Illegal state: symbol without members expected, but got ${JSON.stringify(this)}.`);
    }
  }
}

/**
 * A cache of static symbol used by the StaticReflector to return the same symbol for the
 * same symbol values.
 */
export class StaticSymbolCache {
  private cache = new Map<string, StaticSymbol>();

  get(declarationFile: string, name: string, members?: string[]): StaticSymbol {
    members = members || [];
    const memberSuffix = members.length ? `.${members.join('.')}` : '';
    const key = `"${declarationFile}".${name}${memberSuffix}`;
    let result = this.cache.get(key);
    if (!result) {
      result = new StaticSymbol(declarationFile, name, members);
      this.cache.set(key, result);
    }
    return result;
  }
}
