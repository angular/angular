/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// asset:<package-name>/<realm>/<path-to-module>
var _ASSET_URL_RE = /asset:([^\/]+)\/([^\/]+)\/(.+)/;

/**
 * Interface that defines how import statements should be generated.
 */
export abstract class ImportGenerator {
  static parseAssetUrl(url: string): AssetUrl { return AssetUrl.parse(url); }

  abstract getImportPath(moduleUrlStr: string, importedUrlStr: string): string;
}

export class AssetUrl {
  static parse(url: string, allowNonMatching: boolean = true): AssetUrl {
    const match = url.match(_ASSET_URL_RE);
    if (match !== null) {
      return new AssetUrl(match[1], match[2], match[3]);
    }
    if (allowNonMatching) {
      return null;
    }
    throw new Error(`Url ${url} is not a valid asset: url`);
  }

  constructor(public packageName: string, public firstLevelDir: string, public modulePath: string) {
  }
}
