import {describe, xit, it, expect} from 'test_lib/test_lib';
import {ProtoView} from 'core/compiler/view';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {DOM, Element} from 'facade/dom';

class Directive {
}

export function main() {
  describe('view', function() {
    describe('ProtoView', function() {
      it('should create view instance and locate basic parts', function() {
        var template = DOM.createTemplate(
            '<section class="ng-binding">' +
               'Hello {}!' +
               '<div directive class="ng-binding">' +
                 '<span class="ng-binding">don\'t show me</span>' +
               '</div>' +
             '</section>');

        var diBindings = [];

        var sectionPI = new ProtoElementInjector(null, [], [0]);
        var divPI = new ProtoElementInjector(sectionPI, [Directive], []);
        var spanPI = new ProtoElementInjector(divPI, [], []);
        var protoElementInjectors = [sectionPI, divPI, spanPI];

        var protoWatchGroup = null;
        var hasSingleRoot = false;
        var pv = new ProtoView(template, diBindings, protoElementInjectors,
            protoWatchGroup, hasSingleRoot);

        var view = pv.instantiate();

        var section = DOM.firstChild(template.content);

        expect(DOM.getInnerHTML(DOM.firstChild(view.fragment))).toEqual(DOM.getInnerHTML(section)); // exclude top level <section>

        expect(view.elementInjectors.length).toEqual(3);
        expect(view.elementInjectors[0]).toBeNull();
        expect(view.elementInjectors[1]).toBeAnInstanceOf(ElementInjector);
        expect(view.elementInjectors[2]).toBeNull();

        expect(view.textNodes.length).toEqual(1);
        expect(view.textNodes[0].nodeValue).toEqual('Hello {}!');
      });

      it('should set root element injectors', function() {
        var template = DOM.createTemplate(
          '<section directive class="ng-binding">' +
            '<div directive class="ng-binding"></div>' +
          '</section>');

        var sectionPI = new ProtoElementInjector(null, [Directive], []);
        var divPI = new ProtoElementInjector(sectionPI, [Directive], []);

        var pv = new ProtoView(template, [], [sectionPI, divPI], null, false);
        var view = pv.instantiate();

        expect(view.rootElementInjectors.length).toEqual(1);
      });
    });
  });
}
