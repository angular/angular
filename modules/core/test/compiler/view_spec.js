import {describe, xit, it, expect} from 'test_lib/test_lib';
import {ProtoWatchGroup} from 'change_detection/watch_group';
import {ProtoView, View} from 'core/compiler/view';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {DOM, Element} from 'facade/dom';
import {Module} from 'di/di';

export function main() {
  describe('view', function() {
    describe('ProtoView', function() {
      it('should create an instance of view', function() {
        var template = DOM.createTemplate('Hello <b>world</b>!');
        var pv = new ProtoView(template, null, null, null, false);
        var view:View = pv.instantiate();
        expect(view instanceof View).toBe(true);
      });


      xit('should create view instance and locate basic parts', function() {
        var template = DOM.createTemplate(
            '<section class="ng-binding" no-injector>' +
               'Hello {}!' +
               '<div directive class="ng-binding" injector>' +
                 '<span class="ng-binding" [hidden]="exp" no-injector>don\'t show me</span>' +
               '</div>' +
             '</section>');
        var module:Module = null;
        var sectionPI = new ProtoElementInjector(null);
        sectionPI.textNodes = [0];
        var divPI = new ProtoElementInjector(null);
        var spanPI = new ProtoElementInjector(null);
        spanPI.hasProperties = true;
        var protoElementInjector:List<ProtoElementInjector> = [sectionPI, divPI, spanPI];
        var protoWatchGroup:ProtoWatchGroup = null;
        var hasSingleRoot:boolean = false;
        var pv = new ProtoView(template, module, protoElementInjector, protoWatchGroup, hasSingleRoot);
        var view:View = pv.instantiate();
        var section:Element = template.content.firstChild;
        var div:Element = DOM.getElementsByTagName(section, 'div');
        var span:Element = DOM.getElementsByTagName(div, 'span');
        expect(DOM.getInnerHTML(view.fragment)).toEqual(DOM.getInnerHTML(section)); // exclude top level <section>
        expect(view.nodes).toEqual([view.fragment.firstChild.childNodes]); // TextNode(Hello...), <div>
        var elementInjector:ElementInjector = view.elementInjectors[1];
        expect(view.elementInjectors).toEqual([null, elementInjector, null]); // only second one has directive
        expect(view.bindElements).toEqual([span]);
        expect(view.textNodes).toEqual([section.childNodes[0]]);
      });
    });
  });
}
