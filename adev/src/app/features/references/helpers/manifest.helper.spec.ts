/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApiManifestPackage} from '../interfaces/api-manifest';
import {getApiUrl} from './manifest.helper';

describe('ManiferHelper', () => {
  describe('getApiUrl', () => {
    it('should return the correct URL for a given package and API name', () => {
      const packageEntry: ApiManifestPackage = {
        moduleName: '@angular/common',
        moduleLabel: 'common',
        normalizedModuleName: 'angular_common',
        entries: [],
      };
      const apiName = 'DatePipe';
      const result = getApiUrl(packageEntry, apiName);
      expect(result).toBe('api/common/DatePipe');

      const packageEntry2: ApiManifestPackage = {
        moduleName: '@angular/animations/browser',
        moduleLabel: 'animations/browser',
        normalizedModuleName: 'angular_animations_browser',
        entries: [],
      };
      const result2 = getApiUrl(packageEntry2, apiName);
      expect(result2).toBe('api/animations/browser/DatePipe');

      const packageEntry3: ApiManifestPackage = {
        moduleName: '@angular/common/http/testing',
        moduleLabel: 'common/http/testing',
        normalizedModuleName: 'angular_common_http_testing',
        entries: [],
      };
      const result3 = getApiUrl(packageEntry3, apiName);
      expect(result3).toBe('api/common/http/testing/DatePipe');
    });
  });
});
