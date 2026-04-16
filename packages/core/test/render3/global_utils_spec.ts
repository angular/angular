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
  ExternalCoreGlobalUtils,
  publishDefaultGlobalUtils,
  publishGlobalUtil,
} from '../../src/render3/util/global_utils';
import {setProfiler} from '../../src/render3/profiler';
import {global} from '../../src/util/global';
import {getControlFlowBlocks} from '../../src/render3/util/control_flow';

describe('global utils', () => {
  describe('publishGlobalUtil', () => {
    it('should publish a function to the window', () => {
      const ng = (global as any).ng as ExternalCoreGlobalUtils;
      const foo = 'foo' as keyof ExternalCoreGlobalUtils;
      expect(ng[foo]).toBeFalsy();
      const fooFn = () => {};
      publishGlobalUtil(foo, fooFn);
      expect(ng[foo]).toBe(fooFn);
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

    it('should publish ɵgetControlFlowBlocks', () => {
      assertPublished('ɵgetControlFlowBlocks', getControlFlowBlocks);
    });
  });
});

function assertPublished(name: keyof ExternalCoreGlobalUtils, value: Function) {
  const w = (global as any).ng as ExternalCoreGlobalUtils;
  expect(w[name]).toBe(value);
}
