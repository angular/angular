/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @experimental
 */
export type UrlMatchType = 'exact' | 'prefix' | 'regex';

/**
 * @experimental
 */
export interface UrlConfig { match?: UrlMatchType; }

/**
 * @experimental
 */
export class UrlMatcher {
  match: UrlMatchType;

  private _regex: RegExp;

  constructor(public pattern: string, config: UrlConfig = {}, public scope: string) {
    this.match = config.match || 'exact';
    if (this.match === 'regex') {
      this._regex = new RegExp(pattern);
    }
  }

  matches(url: string): boolean {
    // Strip the scope from the URL if present.
    if (url.startsWith(this.scope)) {
      url = url.substr(this.scope.length);
    }
    switch (this.match) {
      case 'exact':
        return this.pattern === url;
      case 'prefix':
        return url.startsWith(this.pattern);
      case 'regex':
        return this._regex.test(url);
    }
  }
}
