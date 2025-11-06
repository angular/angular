/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isNode} from '@angular/private/testing';
import {asStyleRoot} from '../../src/render/api';

describe('api', () => {
  describe('asStyleRoot', () => {
    it('returns an input `Document`', () => {
      expect(asStyleRoot(document)).toBe(document);
    });

    it('returns an input `ShadowRoot`', () => {
      // Shadow DOM isn't implemented in DOM emulation.
      if (isNode) {
        expect().nothing();
        return;
      }

      const shadowRoot = document.createElement('div').attachShadow({mode: 'open'});

      expect(asStyleRoot(shadowRoot)).toBe(shadowRoot);
    });

    it('returns `undefined` for a detached node', () => {
      expect(asStyleRoot(document.createElement('div'))).toBeUndefined();
    });
  });
});
