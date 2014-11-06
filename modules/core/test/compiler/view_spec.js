import {describe, xit, it, expect, beforeEach} from 'test_lib/test_lib';
import {ProtoView, ElementPropertyMemento, DirectivePropertyMemento} from 'core/compiler/view';
import {Record} from 'change_detection/record';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {ProtoWatchGroup} from 'change_detection/watch_group';
import {ChangeDetector} from 'change_detection/change_detector';
import {DOM, Element} from 'facade/dom';
import {FIELD} from 'facade/lang';
import {ImplicitReceiver, AccessMember} from 'change_detection/parser/ast';
import {ClosureMap} from 'change_detection/parser/closure_map';
import {ElementBinder} from 'core/compiler/element_binder';

class Directive {
  @FIELD('prop')
  constructor() {
    this.prop = 'foo';
  }
}

export function main() {
  var oneFieldAst = (fieldName) => {
    var cm = new ClosureMap();
    return new AccessMember(new ImplicitReceiver(), fieldName,
      cm.getter(fieldName), cm.setter(fieldName));
  };

  describe('view', function() {
    var tempalteWithThreeTypesOfBindings =
            '<section class="ng-binding">' +
               'Hello {}!' +
               '<div directive class="ng-binding">' +
                 '<span class="ng-binding" [id]="exp">don\'t show me</span>' +
               '</div>' +
             '</section>';

    function templateElementBinders() {
        var sectionPI = new ElementBinder(new ProtoElementInjector(null, []),
            [0], false);

        var divPI = new ElementBinder(new ProtoElementInjector(
            sectionPI.protoElementInjector, [Directive]), [], false);

        var spanPI = new ElementBinder(new ProtoElementInjector(
            divPI.protoElementInjector, []), [], true);
        return [sectionPI, divPI, spanPI];
    }

    describe('ProtoView', function() {
      it('should create view instance and locate basic parts', function() {
        var template = DOM.createTemplate(tempalteWithThreeTypesOfBindings);

        var hasSingleRoot = false;
        var pv = new ProtoView(template, templateElementBinders(),
            new ProtoWatchGroup(), hasSingleRoot);

        var view = pv.instantiate(null, null);

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

        var sectionPI = new ElementBinder(new ProtoElementInjector(
            null, [Directive]), [], false);
        var divPI = new ElementBinder(new ProtoElementInjector(
            sectionPI.protoElementInjector, [Directive]), [], false);

        var pv = new ProtoView(template, [sectionPI, divPI],
          new ProtoWatchGroup(), false);
        var view = pv.instantiate(null, null);

        expect(view.rootElementInjectors.length).toEqual(1);
      });

      describe('react to watch group changes', function() {
        var view;
        beforeEach(() => {
          var template = DOM.createTemplate(tempalteWithThreeTypesOfBindings);
          var pv = new ProtoView(template, templateElementBinders(),
            new ProtoWatchGroup(), false);
          view = pv.instantiate(null, null);
        });

        it('should consume text node changes', () => {
          var record = new Record(null, null);
          record.currentValue = 'Hello World!';
          view.onRecordChange(record , 0);
          expect(view.textNodes[0].nodeValue).toEqual('Hello World!');
        });

        it('should consume element binding changes', () => {
          var elementWithBinding = view.bindElements[0];
          expect(elementWithBinding.id).toEqual('');
          var record = new Record(null, null);
          var memento = new ElementPropertyMemento(0, 'id');
          record.currentValue = 'foo';
          view.onRecordChange(record, memento);
          expect(elementWithBinding.id).toEqual('foo');
        });

        it('should consume directive watch expression change.', () => {
          var elInj = view.elementInjectors[1];

          expect(elInj.get(Directive).prop).toEqual('foo');
          var record = new Record(null, null);
          var memento = new DirectivePropertyMemento(1, 0, 'prop',
              (o, v) => o.prop = v);
          record.currentValue = 'bar';
          view.onRecordChange(record, memento);
          expect(elInj.get(Directive).prop).toEqual('bar');
        });
      });

      describe('integration view update with change detector', () => {
        var view, cd, ctx;
        function setUp(memento) {
          var template = DOM.createTemplate(tempalteWithThreeTypesOfBindings);

          var protoWatchGroup = new ProtoWatchGroup();
          protoWatchGroup.watch(oneFieldAst('foo'), memento);

          var pv = new ProtoView(template, templateElementBinders(),
              protoWatchGroup, false);

          ctx = new MyEvaluationContext();
          view = pv.instantiate(ctx, null);

          cd = new ChangeDetector(view.watchGroup);
        }

        it('should consume text node changes', () => {
          setUp(0);

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(view.textNodes[0].nodeValue).toEqual('buz');
        });

        it('should consume element binding changes', () => {
          setUp(new ElementPropertyMemento(0, 'id'));

          var elementWithBinding = view.bindElements[0];
          expect(elementWithBinding.id).toEqual('');

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(elementWithBinding.id).toEqual('buz');
        });

        it('should consume directive watch expression change.', () => {
          var memento = new DirectivePropertyMemento(1, 0, 'prop',
              (o, v) => o.prop = v);
          setUp(memento);

          var elInj = view.elementInjectors[1];
          expect(elInj.get(Directive).prop).toEqual('foo');

          ctx.foo = 'buz';
          cd.detectChanges();
          expect(elInj.get(Directive).prop).toEqual('buz');
        });

      });
    });
  });
}

class MyEvaluationContext {
  @FIELD('foo')
  constructor() {
    this.foo = 'bar';
  };
}
