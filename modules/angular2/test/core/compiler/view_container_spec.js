import {describe, xit, it, expect, beforeEach, ddescribe, iit, el, proxy} from 'angular2/test_lib';
import {View, ProtoView} from 'angular2/src/core/compiler/view';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {Injector} from 'angular2/di';
import {ProtoElementInjector, ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {NativeShadowDomStrategy} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {DynamicProtoChangeDetector, ChangeDetector, Lexer, Parser} from 'angular2/change_detection';

function createView(nodes) {
  var view = new View(null, nodes, MapWrapper.create());
  var cd = new DynamicProtoChangeDetector(null).instantiate(view, [], null, []);
  view.init(cd, [], [], [], [], [], [], [], [], []);
  return view;
}

@proxy
@IMPLEMENTS(ChangeDetector)
class AttachableChangeDetector {
  parent;
  constructor() {
  }
  remove() {
    this.parent = null;
  }
  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

@proxy
@IMPLEMENTS(View)
class HydrateAwareFakeView {
  isHydrated: boolean;
  nodes: List;
  changeDetector: ChangeDetector;
  rootElementInjectors;
  constructor(isHydrated) {
    this.isHydrated = isHydrated;
    this.nodes = [DOM.createElement('div')];
    this.rootElementInjectors = [];
    this.changeDetector = new AttachableChangeDetector();
  }

  hydrated() {
    return this.isHydrated;
  }


  hydrate(_, __, ___, ____, _____) {
    this.isHydrated = true;
  }

  dehydrate() {
    this.isHydrated = false;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

export function main() {
  describe('ViewContainer', () => {
    var viewContainer, parentView, protoView, dom, customViewWithOneNode,
        customViewWithTwoNodes, elementInjector;

    beforeEach(() => {
      dom = el(`<div><stuff></stuff><div insert-after-me></div><stuff></stuff></div>`);
      var insertionElement = dom.childNodes[1];
      parentView = createView([dom.childNodes[0]]);
      protoView = new ProtoView(el('<div>hi</div>'), new DynamicProtoChangeDetector(null),
        new NativeShadowDomStrategy(null));
      elementInjector = new ElementInjector(null, null, null);
      viewContainer = new ViewContainer(parentView, insertionElement, protoView, elementInjector,
        null);
      customViewWithOneNode = createView([el('<div>single</div>')]);
      customViewWithTwoNodes = createView([el('<div>one</div>'), el('<div>two</div>')]);
    });

    describe('when dehydrated', () => {
      it('should throw if create is called', () => {
        expect(() => viewContainer.create()).toThrowError();
      });
    });

    describe('when hydrated', () => {
      function textInViewContainer() {
        var out = '';
        // skipping starting filler, insert-me and final filler.
        for (var i = 2; i < dom.childNodes.length - 1; i++) {
          if (i != 2) out += ' ';
          out += DOM.getInnerHTML(dom.childNodes[i]);
        }
        return out;
      }

      beforeEach(() => {
        viewContainer.hydrate(new Injector([]), null, null);
        var fillerView = createView([el('<filler>filler</filler>')]);
        viewContainer.insert(fillerView);
      });

      it('should create new views from protoView', () => {
        viewContainer.create();
        expect(textInViewContainer()).toEqual('filler hi');
        expect(viewContainer.length).toBe(2);
      });

      it('should create new views from protoView at index', () => {
        viewContainer.create(0);
        expect(textInViewContainer()).toEqual('hi filler');
        expect(viewContainer.length).toBe(2);
      });

      it('should insert new views at the end by default', () => {
        viewContainer.insert(customViewWithOneNode);
        expect(textInViewContainer()).toEqual('filler single');
        expect(viewContainer.get(1)).toBe(customViewWithOneNode);
        expect(viewContainer.length).toBe(2);
      });

      it('should insert new views at the given index', () => {
        viewContainer.insert(customViewWithOneNode, 0);
        expect(textInViewContainer()).toEqual('single filler');
        expect(viewContainer.get(0)).toBe(customViewWithOneNode);
        expect(viewContainer.length).toBe(2);
      });

      it('should remove the last view by default', () => {
        viewContainer.insert(customViewWithOneNode);

        viewContainer.remove();

        expect(textInViewContainer()).toEqual('filler');
        expect(viewContainer.length).toBe(1);
      });

      it('should remove the view at a given index', () => {
        viewContainer.insert(customViewWithOneNode);
        viewContainer.insert(customViewWithTwoNodes);

        viewContainer.remove(1);

        expect(textInViewContainer()).toEqual('filler one two');
        expect(viewContainer.get(1)).toBe(customViewWithTwoNodes);
        expect(viewContainer.length).toBe(2);
      });

      it('should detach the last view by default', () => {
        viewContainer.insert(customViewWithOneNode);
        expect(viewContainer.length).toBe(2);

        var detachedView = viewContainer.detach();

        expect(detachedView).toBe(customViewWithOneNode);
        expect(textInViewContainer()).toEqual('filler');
        expect(viewContainer.length).toBe(1);
      });

      it('should detach the view at a given index', () => {
        viewContainer.insert(customViewWithOneNode);
        viewContainer.insert(customViewWithTwoNodes);
        expect(viewContainer.length).toBe(3);

        var detachedView = viewContainer.detach(1);
        expect(detachedView).toBe(customViewWithOneNode);
        expect(textInViewContainer()).toEqual('filler one two');
        expect(viewContainer.length).toBe(2);
      });

      it('should keep views hydration state during insert', () => {
        var hydratedView = new HydrateAwareFakeView(true);
        var dehydratedView = new HydrateAwareFakeView(false);
        viewContainer.insert(hydratedView);
        viewContainer.insert(dehydratedView);

        expect(hydratedView.hydrated()).toBe(true);
        expect(dehydratedView.hydrated()).toBe(false);
      });

      it('should dehydrate on remove', () => {
        var hydratedView = new HydrateAwareFakeView(true);
        viewContainer.insert(hydratedView);
        viewContainer.remove();

        expect(hydratedView.hydrated()).toBe(false);
      });

      it('should keep views hydration state during detach', () => {
        var hydratedView = new HydrateAwareFakeView(true);
        var dehydratedView = new HydrateAwareFakeView(false);
        viewContainer.insert(hydratedView);
        viewContainer.insert(dehydratedView);

        expect(viewContainer.detach().hydrated()).toBe(false);
        expect(viewContainer.detach().hydrated()).toBe(true);
      });

      it('should support adding/removing views with more than one node', () => {
        viewContainer.insert(customViewWithTwoNodes);
        viewContainer.insert(customViewWithOneNode);

        expect(textInViewContainer()).toEqual('filler one two single');

        viewContainer.remove(1);
        expect(textInViewContainer()).toEqual('filler single');
      });
    });

    describe('should update injectors and parent views.', () => {
      var fancyView;
      beforeEach(() => {
        var parser = new Parser(new Lexer());
        viewContainer.hydrate(new Injector([]), null, null);

        var pv = new ProtoView(el('<div class="ng-binding">{{}}</div>'),
          new DynamicProtoChangeDetector(null), new NativeShadowDomStrategy(null));
        pv.bindElement(null, 0, new ProtoElementInjector(null, 1, [SomeDirective]));
        pv.bindTextNode(0, parser.parseBinding('foo', null));
        fancyView = pv.instantiate(null, null);
      });

      it('hydrating should update rootElementInjectors and parent change detector', () => {
        viewContainer.insert(fancyView);
        ListWrapper.forEach(fancyView.rootElementInjectors, (inj) =>
            expect(inj.parent).toBe(elementInjector));

        expect(parentView.changeDetector.lightDomChildren.length).toBe(1);
      });

      it('dehydrating should update rootElementInjectors and parent change detector', () => {
        viewContainer.insert(fancyView);
        viewContainer.remove();
        ListWrapper.forEach(fancyView.rootElementInjectors, (inj) =>
            expect(inj.parent).toBe(null));
        expect(parentView.changeDetector.lightDomChildren.length).toBe(0);
        expect(viewContainer.length).toBe(0);
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
