/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {applyChanges} from '../../src/render3/util/change_detection_utils';
import {
  getComponent,
  getContext,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getInjector,
  getListeners,
  getOwningComponent,
  getRootComponents,
} from '../../src/render3/util/discovery_utils';
import {
  GLOBAL_PUBLISH_EXPANDO_KEY,
  GlobalDevModeUtils,
  publishDefaultGlobalUtils,
  publishGlobalUtil,
} from '../../src/render3/util/global_utils';
import {setProfiler} from '../../src/render3/profiler';
import {getDeferBlocks} from '../../src/render3/util/defer';
import {global} from '../../src/util/global';

type GlobalUtilFunctions = keyof GlobalDevModeUtils['ng'];

describe('global utils', () => {
  describe('publishGlobalUtil', () => {
    it('should publish a function to the window', () => {
      const w = global as any as GlobalDevModeUtils;
      const foo = 'foo' as GlobalUtilFunctions;
      expect(w[GLOBAL_PUBLISH_EXPANDO_KEY][foo]).toBeFalsy();
      const fooFn = () => {};
      publishGlobalUtil(foo, fooFn);
      expect(w[GLOBAL_PUBLISH_EXPANDO_KEY][foo]).toBe(fooFn);
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

    it('should publish getDirectiveMetadata', () => {
      assertPublished('getDirectiveMetadata', getDirectiveMetadata);
    });

    it('should publish ɵsetProfiler', () => {
      assertPublished('ɵsetProfiler', setProfiler);
    });

    it('should publish ɵgetDeferBlocks', () => {
      assertPublished('ɵgetDeferBlocks', getDeferBlocks);
    });
  });
});

function assertPublished(name: GlobalUtilFunctions, value: Function) {
  const w = global as any as GlobalDevModeUtils;
  expect(w[GLOBAL_PUBLISH_EXPANDO_KEY][name]).toBe(value);
}
