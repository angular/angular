import {describe, xit, it, expect, beforeEach, ddescribe, iit} from 'test_lib/test_lib';
import {View, ProtoView} from 'core/compiler/view';
import {ViewPort} from 'core/compiler/viewport';
import {DOM} from 'facade/dom';
import {ListWrapper, MapWrapper} from 'facade/collection';
import {Injector} from 'di/di';
import {ProtoElementInjector, ElementInjector} from 'core/compiler/element_injector';
import {ProtoRecordRange} from 'change_detection/record_range';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}

function createView(nodes) {
  return new View(null, nodes, [], [], [], [], new ProtoRecordRange());
}

export function main() {
  describe('viewport', () => {
    var viewPort, parentView, protoView, dom, customViewWithOneNode,
        customViewWithTwoNodes, elementInjector;

    beforeEach(() => {
      dom = createElement(`<div><stuff></stuff><div insert-after-me></div><stuff></stuff></div>`);
      var insertionElement = dom.childNodes[1];
      parentView = createView([dom.childNodes[0]]);
      protoView = new ProtoView(createElement('<div>hi</div>'), new ProtoRecordRange());
      elementInjector = new ElementInjector(null, null, null);
      viewPort = new ViewPort(parentView, insertionElement, protoView, elementInjector);
      customViewWithOneNode = createView([createElement('<div>single</div>')]);
      customViewWithTwoNodes = createView([createElement('<div>one</div>'), createElement('<div>two</div>')]);
    });

    describe('when dehydrated', () => {
      it('should throw if create is called', () => {
        expect(() => viewPort.create()).toThrowError();
      });
    });

    describe('when hydrated', () => {
      function textInViewPort() {
        var out = '';
        // skipping starting filler, insert-me and final filler.
        for (var i = 2; i < dom.childNodes.length - 1; i++) {
          if (i != 2) out += ' ';
          out += DOM.getInnerHTML(dom.childNodes[i]);
        }
        return out;
      }

      beforeEach(() => {
        viewPort.hydrate(new Injector([]), null);
        var fillerView = createView([createElement('<filler>filler</filler>')]);
        viewPort.insert(fillerView);
      });

      it('should create new views from protoView', () => {
        viewPort.create();
        expect(textInViewPort()).toEqual('filler hi');
        expect(viewPort.length).toBe(2);
      });

      it('should create new views from protoView at index', () => {
        viewPort.create(0);
        expect(textInViewPort()).toEqual('hi filler');
        expect(viewPort.length).toBe(2);
      });

      it('should insert new views at the end by default', () => {
        viewPort.insert(customViewWithOneNode);
        expect(textInViewPort()).toEqual('filler single');
        expect(viewPort.get(1)).toBe(customViewWithOneNode);
        expect(viewPort.length).toBe(2);
      });

      it('should insert new views at the given index', () => {
        viewPort.insert(customViewWithOneNode, 0);
        expect(textInViewPort()).toEqual('single filler');
        expect(viewPort.get(0)).toBe(customViewWithOneNode);
        expect(viewPort.length).toBe(2);
      });

      it('should remove the last view by default', () => {
        viewPort.insert(customViewWithOneNode);

        var removedView = viewPort.remove();

        expect(textInViewPort()).toEqual('filler');
        expect(removedView).toBe(customViewWithOneNode);
        expect(viewPort.length).toBe(1);
      });

      it('should remove the view at a given index', () => {
        viewPort.insert(customViewWithOneNode);
        viewPort.insert(customViewWithTwoNodes);

        var removedView = viewPort.remove(1);
        expect(removedView).toBe(customViewWithOneNode);
        expect(textInViewPort()).toEqual('filler one two');
        expect(viewPort.get(1)).toBe(customViewWithTwoNodes);
        expect(viewPort.length).toBe(2);
      });

      it('should support adding/removing views with more than one node', () => {
        viewPort.insert(customViewWithTwoNodes);
        viewPort.insert(customViewWithOneNode);

        expect(textInViewPort()).toEqual('filler one two single');

        viewPort.remove(1);
        expect(textInViewPort()).toEqual('filler single');
      });
    });

    describe('should update injectors and parent views.', () => {
      var fancyView;
      beforeEach(() => {
        var parser = new Parser(new Lexer());
        viewPort.hydrate(new Injector([]), null);

        var pv = new ProtoView(createElement('<div class="ng-binding">{{}}</div>'),
          new ProtoRecordRange());
        pv.bindElement(new ProtoElementInjector(null, 1, [SomeDirective]));
        pv.bindTextNode(0, parser.parseBinding('foo').ast);
        fancyView = pv.instantiate(null);
      });

      it('hydrating should update rootElementInjectors and parent RR', () => {
        viewPort.insert(fancyView);
        ListWrapper.forEach(fancyView.rootElementInjectors, (inj) =>
            expect(inj.parent).toBe(elementInjector));
        expect(parentView.recordRange.findFirstEnabledRecord()).not.toBe(null);
      });

      it('dehydrating should update rootElementInjectors and parent RR', () => {
        viewPort.insert(fancyView);
        viewPort.remove();
        ListWrapper.forEach(fancyView.rootElementInjectors, (inj) =>
            expect(inj.parent).toBe(null));
        expect(parentView.recordRange.findFirstEnabledRecord()).toBe(null);
        expect(viewPort.length).toBe(0);
      });
    });
  });
}

class SomeDirective {
  prop;
  constructor() {
    this.prop = 'foo';
  }
}
