/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {getComponent, getDirectives, getHostComponent, getInjector, getRootComponents} from '../../src/render3/discovery_utils';
import {GLOBAL_PUBLISH_EXPANDO_KEY, GlobalDevModeContainer, publishDefaultGlobalUtils, publishGlobalUtil} from '../../src/render3/global_utils';
import {getPlayers} from '../../src/render3/players';
import {global} from '../../src/util';

describe('global utils', () => {
  describe('publishGlobalUtil', () => {
    it('should publish a function to the window', () => {
      const w = global as any as GlobalDevModeContainer;
      expect(w[GLOBAL_PUBLISH_EXPANDO_KEY]['foo']).toBeFalsy();
      const fooFn = () => {};
      publishGlobalUtil('foo', fooFn);
      expect(w[GLOBAL_PUBLISH_EXPANDO_KEY]['foo']).toBe(fooFn);
    });
  });

  describe('publishDefaultGlobalUtils', () => {
    beforeEach(() => publishDefaultGlobalUtils());

    it('should publish getComponent', () => { assertPublished('getComponent', getComponent); });

    it('should publish getRootComponents',
       () => { assertPublished('getRootComponents', getRootComponents); });

    it('should publish getDirectives', () => { assertPublished('getDirectives', getDirectives); });

    it('should publish getHostComponent',
       () => { assertPublished('getHostComponent', getHostComponent); });

    it('should publish getInjector', () => { assertPublished('getInjector', getInjector); });

    it('should publish getPlayers', () => { assertPublished('getPlayers', getPlayers); });
  });
});

function assertPublished(name: string, value: {}) {
  const w = global as any as GlobalDevModeContainer;
  expect(w[GLOBAL_PUBLISH_EXPANDO_KEY][name]).toBe(value);
}
