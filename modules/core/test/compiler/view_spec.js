import {describe, xit, it, expect, beforeEach} from 'test_lib/test_lib';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'core/compiler/view';
import {Record} from 'change_detection/record';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {DOM, Element} from 'facade/dom';
import {FIELD} from 'facade/lang';

class Directive {
  @FIELD('prop')
  constructor() {
    this.prop = 'foo';
  }
}

export function main() {
  describe('view', function() {
    var tempalteWithThreeTypesOfBindings =
            '<section class="ng-binding">' +
               'Hello {}!' +
               '<div directive class="ng-binding">' +
                 '<span class="ng-binding" [hidden]="exp">don\'t show me</span>' +
               '</div>' +
             '</section>';

    describe('ProtoView', function() {
      it('should create view instance and locate basic parts', function() {
        var template = DOM.createTemplate(tempalteWithThreeTypesOfBindings);

        var diBindings = [];

        var sectionPI = new ProtoElementInjector(null, [], [0], false);
        var divPI = new ProtoElementInjector(sectionPI, [Directive], [], false);
        var spanPI = new ProtoElementInjector(divPI, [], [], true);
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
        expect(view.bindElements.length).toEqual(1);
        expect(view.textNodes[0].nodeValue).toEqual('Hello {}!');
      });

      it('should set root element injectors', function() {
        var template = DOM.createTemplate(
          '<section directive class="ng-binding">' +
            '<div directive class="ng-binding"></div>' +
          '</section>');

        var sectionPI = new ProtoElementInjector(null, [Directive], [], false);
        var divPI = new ProtoElementInjector(sectionPI, [Directive], [], false);

        var pv = new ProtoView(template, [], [sectionPI, divPI], null, false);
        var view = pv.instantiate();

        expect(view.rootElementInjectors.length).toEqual(1);
      });

      describe('react to watch group changes', function() {
        var view;
        beforeEach(() => {
          var template = DOM.createTemplate(tempalteWithThreeTypesOfBindings);

          var diBindings = [];

          var sectionPI = new ProtoElementInjector(null, [], [0], false);
          var divPI = new ProtoElementInjector(sectionPI, [Directive], [], false);
          var spanPI = new ProtoElementInjector(divPI, [], [], true);
          var protoElementInjectors = [sectionPI, divPI, spanPI];

          var protoWatchGroup = null;
          var hasSingleRoot = false;
          var pv = new ProtoView(template, diBindings, protoElementInjectors,
              protoWatchGroup, hasSingleRoot);

          view = pv.instantiate();
        });

        it('should consume text node changes', () => {
          var record = new Record(null, null);
          record.currentValue = 'Hello World!';
          view.onRecordChange(record , 0);
          expect(view.textNodes[0].nodeValue).toEqual('Hello World!');
        });

        it('should consume element binding changes', () => {
          var elementWithBinding = view.bindElements[0];
          expect(elementWithBinding.hidden).toEqual(false);
          var record = new Record(null, null);
          var memento = new ElementPropertyMemento(0, 'hidden');
          record.currentValue = true;
          view.onRecordChange(record, memento);
          expect(elementWithBinding.hidden).toEqual(true);
        });

        it('should consume directive watch expression change.', () => {
          var elInj = view.elementInjectors[1];

          // TODO(rado): hook-up instantiateDirectives in implementation and
          // remove from here.
          elInj.instantiateDirectives(null);
          expect(elInj.get(Directive).prop).toEqual('foo');
          var record = new Record(null, null);
          var memento = new DirectivePropertyMemento(1, 0, 'prop',
              (o, v) => o.prop = v);
          record.currentValue = 'bar';
          view.onRecordChange(record, memento);
          expect(elInj.get(Directive).prop).toEqual('bar');
        });
      });
    });
  });
}
