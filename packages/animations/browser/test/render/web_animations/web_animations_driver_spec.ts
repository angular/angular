/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
      const element = createDiv();
      const driver = makeDriver();
      const player = driver.animate(element, [], 1000, 1000, '', []);
      expect(player instanceof WebAnimationsPlayer).toBeTruthy();
    });
  });

  describe('when animation is inside a shadow DOM', () => {
    it('should consider an element inside the shadow DOM to be contained by the document body', () => {
      const hostElement = createDiv();
      const shadowRoot = hostElement.attachShadow({mode: 'open'});
      const elementToAnimate = createForm();
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

function createDiv() {
  return document.createElement('div');
}

function createForm() {
  // Create form and inputs
  const form = document.createElement('form');
  const input1 = document.createElement('input');
  const input2 = document.createElement('input');
  // Make `form.parentNode` refer to `input1`.
  input1.setAttribute('name', 'parentNode');
  form.appendChild(input1);
  // Make `form.host` refer to `input2`.
  input2.setAttribute('name', 'host');
  form.appendChild(input2);
  return form;
}
