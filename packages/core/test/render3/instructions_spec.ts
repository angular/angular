/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {elementAttribute, elementEnd, elementProperty, elementStart, elementStyle, renderTemplate} from '../../src/render3/instructions';
import {LElementNode, LNode} from '../../src/render3/interfaces/node';
import {RElement, domRendererFactory3} from '../../src/render3/interfaces/renderer';
import {bypassSanitizationTrustStyle, bypassSanitizationTrustUrl, sanitizeStyle, sanitizeUrl} from '../../src/sanitization/sanitization';

import {TemplateFixture} from './render_util';

describe('instructions', () => {
  function createDiv() {
    elementStart(0, 'div');
    elementEnd();
  }

  describe('elementAttribute', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementAttribute(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementAttribute(
              0, 'title', bypassSanitizationTrustUrl('javascript:true'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:true"></div>');
    });
  });

  describe('elementProperty', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementProperty(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementProperty(
              0, 'title', bypassSanitizationTrustUrl('javascript:false'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:false"></div>');
    });
  });

  describe('elementStyle', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);
      t.update(() => elementStyle(0, 'background-image', 'url("http://server")', sanitizeStyle));
      // nothing is set because sanitizer suppresses it.
      expect(t.html).toEqual('<div></div>');

      t.update(
          () => elementStyle(
              0, 'background-image', bypassSanitizationTrustStyle('url("http://server")'),
              sanitizeStyle));
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server")');
    });
  });
});
