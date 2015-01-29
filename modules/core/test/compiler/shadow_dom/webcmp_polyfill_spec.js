import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'test_lib/test_lib';
import {WebComponentPolyfill} from 'core/compiler/shadow_dom_emulation/webcmp_polyfill';
import {JS} from 'facade/js_interop';
import {DOM} from 'facade/dom';
import {CONST} from 'facade/lang';
import {ShadowDomStrategy, ShadowDomNative, ShadowDomEmulated} from 'core/compiler/shadow_dom';
import {DirectiveMetadata} from 'core/compiler/directive_metadata';
import {Component} from 'core/annotations/annotations'


export function main() {
  describe('WebComponentPolyfill', () => {

    function createFakeContext(polyfillEnabled:boolean) {
      if (polyfillEnabled) {
        return JS.jsify({
          'WebComponents': {
            'ShadowCSS': {
              'strictStyling': false
            }
          }
        });
      } else {
        return JS.jsify({
          'WebComponents': {}
        });
      }
    }

    it('should detect when the polyfill is enabled', () => {
      var context = createFakeContext(true);
      var polyfill = new WebComponentPolyfill(context);
      expect(polyfill.isEnabled()).toBe(true);
    });

    it('should force strict styling', () => {
      var context = createFakeContext(true);
      expect(context['WebComponents']['ShadowCSS']['strictStyling']).toBe(false);
      new WebComponentPolyfill(context);
      expect(context['WebComponents']['ShadowCSS']['strictStyling']).toBe(true);
    });

    it('should detect when the polyfill not enabled', () => {
      var context = createFakeContext(false);
      var polyfill = new WebComponentPolyfill(context);
      expect(polyfill.isEnabled()).toBe(false);
    });

  });
}
