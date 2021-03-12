/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setProfiler} from '@angular/core/src/render3/profiler';
import {applyChanges} from '../../src/render3/util/change_detection_utils';
import {getComponent, getContext, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents} from '../../src/render3/util/discovery_utils';
import {GLOBAL_PUBLISH_EXPANDO_KEY, GlobalDevModeContainer, publishDefaultGlobalUtils, publishGlobalUtil} from '../../src/render3/util/global_utils';
import {global} from '../../src/util/global';

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

    it('should publish getComponent', () => {
      assertPublished('getComponent', getComponent);
    });

    it('should publish getContext', () => {
      assertPublished('getContext', getContext);
    });

    it('should publish getListeners', () => {
      assertPublished('getListeners', getListeners);
    });

    it('should publish getOwningComponent', () => {
      assertPublished('getOwningComponent', getOwningComponent);
    });

    it('should publish getRootComponents', () => {
      assertPublished('getRootComponents', getRootComponents);
    });

    it('should publish getDirectives', () => {
      assertPublished('getDirectives', getDirectives);
    });

    it('should publish getHostComponent', () => {
      assertPublished('getHostElement', getHostElement);
    });

    it('should publish getInjector', () => {
      assertPublished('getInjector', getInjector);
    });

    it('should publish applyChanges', () => {
      assertPublished('applyChanges', applyChanges);
    });

    it('should publish ɵsetProfiler', () => {
      assertPublished('ɵsetProfiler', setProfiler);
    });
  });
});

function assertPublished(name: string, value: Function) {
  const w = global as any as GlobalDevModeContainer;
  expect(w[GLOBAL_PUBLISH_EXPANDO_KEY][name]).toBe(value);
}
