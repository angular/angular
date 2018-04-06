/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {elementAttribute, elementClass, elementEnd, elementProperty, elementStart, elementStyle, elementStyleNamed, renderTemplate} from '../../src/render3/instructions';
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
    it('should use sanitizer function when available', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementProperty(0, 'title', 'javascript:true', sanitizeUrl));
      expect(t.html).toEqual('<div title="unsafe:javascript:true"></div>');

      t.update(
          () => elementProperty(
              0, 'title', bypassSanitizationTrustUrl('javascript:false'), sanitizeUrl));
      expect(t.html).toEqual('<div title="javascript:false"></div>');
    });

    it('should not stringify non string values', () => {
      const t = new TemplateFixture(createDiv);

      t.update(() => elementProperty(0, 'hidden', false));
      // The hidden property would be true if `false` was stringified into `"false"`.
      expect((t.hostNode.native as HTMLElement).querySelector('div') !.hidden).toEqual(false);
    });
  });

  describe('elementStyleNamed', () => {
    it('should use sanitizer function', () => {
      const t = new TemplateFixture(createDiv);
      t.update(
          () => elementStyleNamed(0, 'background-image', 'url("http://server")', sanitizeStyle));
      // nothing is set because sanitizer suppresses it.
      expect(t.html).toEqual('<div></div>');

      t.update(
          () => elementStyleNamed(
              0, 'background-image', bypassSanitizationTrustStyle('url("http://server")'),
              sanitizeStyle));
      expect((t.hostElement.firstChild as HTMLElement).style.getPropertyValue('background-image'))
          .toEqual('url("http://server")');
    });
  });

  describe('elementStyle', () => {
    function createDivWithStyle() {
      elementStart(0, 'div', ['style', 'height: 10px']);
      elementEnd();
    }
    const fixture = new TemplateFixture(createDivWithStyle);

    it('should add style', () => {
      fixture.update(() => elementStyle(0, {'background-color': 'red'}));
      expect(fixture.html).toEqual('<div style="height: 10px; background-color: red;"></div>');
    });
  });

  describe('elementClass', () => {
    const fixture = new TemplateFixture(createDiv);

    it('should add class', () => {
      fixture.update(() => elementClass(0, 'multiple classes'));
      expect(fixture.html).toEqual('<div class="multiple classes"></div>');
    });
  });
});
