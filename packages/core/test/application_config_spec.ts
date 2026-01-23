/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationConfig, InjectionToken, mergeApplicationConfig} from '../src/core';

describe('ApplicationConfig', () => {
  describe('mergeApplicationConfig', () => {
    const FOO_TOKEN = new InjectionToken('foo');
    const BAR_TOKEN = new InjectionToken('bar');
    const BUZ_TOKEN = new InjectionToken('buz');

    const BASE_CONFIG: ApplicationConfig = {
      providers: [{provide: FOO_TOKEN, useValue: 'foo'}],
    };

    const APP_CONFIG_EXPECT: ApplicationConfig = {
      providers: [
        {provide: FOO_TOKEN, useValue: 'foo'},
        {provide: BAR_TOKEN, useValue: 'bar'},
        {provide: BUZ_TOKEN, useValue: 'buz'},
      ],
    };

    it('should merge 2 configs from left to right', () => {
      const extraConfig: ApplicationConfig = {
        providers: [
          {provide: BAR_TOKEN, useValue: 'bar'},
          {provide: BUZ_TOKEN, useValue: 'buz'},
        ],
      };

      const config = mergeApplicationConfig(BASE_CONFIG, extraConfig);
      expect(config).toEqual(APP_CONFIG_EXPECT);
    });

    it('should merge more than 2 configs from left to right', () => {
      const extraConfigOne: ApplicationConfig = {
        providers: [{provide: BAR_TOKEN, useValue: 'bar'}],
      };
      const extraConfigTwo: ApplicationConfig = {
        providers: [{provide: BUZ_TOKEN, useValue: 'buz'}],
      };

      const config = mergeApplicationConfig(BASE_CONFIG, extraConfigOne, extraConfigTwo);
      expect(config).toEqual(APP_CONFIG_EXPECT);
    });
  });
});
