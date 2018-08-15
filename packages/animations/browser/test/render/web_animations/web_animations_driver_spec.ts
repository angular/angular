/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CssKeyframesPlayer} from '../../../src/render/css_keyframes/css_keyframes_player';
import {DOMAnimation} from '../../../src/render/web_animations/dom_animation';
import {WebAnimationsDriver} from '../../../src/render/web_animations/web_animations_driver';
import {WebAnimationsPlayer} from '../../../src/render/web_animations/web_animations_player';

{
  describe('WebAnimationsDriver', () => {
    if (isNode) return;

    describe('when web-animations are not supported natively', () => {
      it('should return an instance of a CssKeyframePlayer if scrubbing is not requested', () => {
        const element = createElement();
        const driver = makeDriver();
        driver.overrideWebAnimationsSupport(false);
        const player = driver.animate(element, [], 1000, 1000, '', [], false);
        expect(player instanceof CssKeyframesPlayer).toBeTruthy();
      });

      it('should return an instance of a WebAnimationsPlayer if scrubbing is not requested', () => {
        const element = createElement();
        const driver = makeDriver();
        driver.overrideWebAnimationsSupport(false);
        const player = driver.animate(element, [], 1000, 1000, '', [], true);
        expect(player instanceof WebAnimationsPlayer).toBeTruthy();
      });
    });

    describe('when web-animations are supported natively', () => {
      it('should return an instance of a WebAnimationsPlayer if scrubbing is not requested', () => {
        const element = createElement();
        const driver = makeDriver();
        driver.overrideWebAnimationsSupport(true);
        const player = driver.animate(element, [], 1000, 1000, '', [], false);
        expect(player instanceof WebAnimationsPlayer).toBeTruthy();
      });

      it('should return an instance of a WebAnimationsPlayer if scrubbing is requested', () => {
        const element = createElement();
        const driver = makeDriver();
        driver.overrideWebAnimationsSupport(true);
        const player = driver.animate(element, [], 1000, 1000, '', [], true);
        expect(player instanceof WebAnimationsPlayer).toBeTruthy();
      });
    });
  });
}

function makeDriver() {
  return new WebAnimationsDriver();
}

function createElement() {
  return document.createElement('div');
}
