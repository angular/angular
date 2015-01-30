import {describe, xit, it, expect, beforeEach, ddescribe, iit, el} from 'angular2/test_lib';
import {NativeShadowDomStrategy, EmulatedShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {DOM} from 'angular2/src/facade/dom';
import {Component} from 'angular2/src/core/annotations/annotations';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';

export function main() {
  describe('Shadow DOM strategy', () => {
    var strategy,
        component = new Component({selector: 'mycmp'}),
        metadata = new DirectiveMetadata(null, component, null);

    describe('Native', () => {
      beforeEach(() => {
        strategy = new NativeShadowDomStrategy();
      });

      it('should leave the styles in the template', () => {
        var tpl = DOM.createTemplate('<style>.s1{}</style><div>content</div>');
        strategy.processTemplate(tpl, metadata);
        expect(tpl.content).toHaveText('.s1{}content');
      });

      it('should not modify the content of the template', () => {
        var html = '<p>content<span></span></p>';
        var tpl = DOM.createTemplate(html);
        strategy.processTemplate(tpl, metadata);
        expect(DOM.getInnerHTML(tpl)).toEqual(html);
      });
    });

    describe('Emulated', () => {
      var root;
      beforeEach(() => {
        root = el('<div>');
        strategy = new EmulatedShadowDomStrategy(root);
      });

      it('should move the styles from the template to the root', () => {
        var tpl = DOM.createTemplate('<style>.s1{}</style><div>content</div><style>.s2{}</style>');
        strategy.processTemplate(tpl, metadata);
        expect(root).toHaveText('.s1[mycmp] {}.s2[mycmp] {}');
        expect(tpl.content).toHaveText('content');
      });

      it('should insert the styles as the first children of the host', () => {
        DOM.setInnerHTML(root, '<p>root content</p>')
        var tpl = DOM.createTemplate('<style>.s1{}</style><style>.s2{}</style>');
        strategy.processTemplate(tpl, metadata);
        expect(root).toHaveText('.s1[mycmp] {}.s2[mycmp] {}root content');
      });

      it('should add the component selector to all template children', () => {
        var html = '<p>content<span></span></p>';
        var processedHtml = '<p mycmp="">content<span mycmp=""></span></p>';
        var tpl = DOM.createTemplate(html);
        strategy.processTemplate(tpl, metadata);
        expect(DOM.getInnerHTML(tpl)).toEqual(processedHtml);
      });
    });
  });
}
