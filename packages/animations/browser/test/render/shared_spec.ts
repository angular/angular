/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computeStyle} from '../../src/render/shared';

describe('shared animations code', () => {
  if (isNode) return;

  describe('computeStyle', () => {
    it('should compute the margin style into the form top,right,bottom,left', () => {
      const div = buildActualElement();

      div.style.setProperty('margin', '1px 2px 3px 4px');
      expect(computeStyle(div, 'margin')).toEqual('1px 2px 3px 4px');

      div.style.setProperty('margin', '0px');
      div.style.setProperty('margin-top', '10px');
      div.style.setProperty('margin-right', '20px');
      div.style.setProperty('margin-bottom', '30px');
      div.style.setProperty('margin-left', '40px');
      expect(computeStyle(div, 'margin')).toEqual('10px 20px 30px 40px');
    });

    it('should compute the padding style into the form top,right,bottom,left', () => {
      const div = buildActualElement();

      div.style.setProperty('padding', '1px 2px 3px 4px');
      expect(computeStyle(div, 'padding')).toEqual('1px 2px 3px 4px');

      div.style.setProperty('padding', '0px');
      div.style.setProperty('padding-top', '10px');
      div.style.setProperty('padding-right', '20px');
      div.style.setProperty('padding-bottom', '30px');
      div.style.setProperty('padding-left', '40px');
      expect(computeStyle(div, 'padding')).toEqual('10px 20px 30px 40px');
    });
  });
});

/**
 * Returns a div element that's attached to the body.
 *
 * The reason why this function exists is because in order to
 * compute style values on an element is must be attached within
 * the body of a webpage.
 */
function buildActualElement() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}
