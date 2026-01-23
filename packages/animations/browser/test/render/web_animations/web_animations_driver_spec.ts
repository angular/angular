/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isNode} from '@angular/private/testing';
import {WebAnimationsDriver} from '../../../src/render/web_animations/web_animations_driver';
import {WebAnimationsPlayer} from '../../../src/render/web_animations/web_animations_player';

describe('WebAnimationsDriver', () => {
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  describe('when web-animations are supported natively', () => {
    it('should return an instance of a WebAnimationsPlayer if scrubbing is not requested', () => {
      const element = createElement();
      const driver = makeDriver();
      const player = driver.animate(element, [], 1000, 1000, '', []);
      expect(player instanceof WebAnimationsPlayer).toBeTruthy();
    });
  });

  describe('when animation is inside a shadow DOM', () => {
    it('should consider an element inside the shadow DOM to be contained by the document body', () => {
      const hostElement = createElement();
      const shadowRoot = hostElement.attachShadow({mode: 'open'});
      const elementToAnimate = createElement();
      shadowRoot.appendChild(elementToAnimate);
      document.body.appendChild(hostElement);
      const animator = new WebAnimationsDriver();
      expect(animator.containsElement(document.body, elementToAnimate)).toBeTrue();
    });
  });
});

function makeDriver() {
  return new WebAnimationsDriver();
}

function createElement() {
  return document.createElement('div');
}
