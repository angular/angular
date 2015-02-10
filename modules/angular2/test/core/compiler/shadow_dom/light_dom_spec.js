import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject, el, proxy} from 'angular2/test_lib';
import {IMPLEMENTS, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/facade/dom';
import {Content} from 'angular2/src/core/compiler/shadow_dom_emulation/content_tag';
import {NgElement} from 'angular2/src/core/dom/element';
import {LightDom} from 'angular2/src/core/compiler/shadow_dom_emulation/light_dom';
import {View} from 'angular2/src/core/compiler/view';
import {ViewPort} from 'angular2/src/core/compiler/viewport';
import {ElementInjector} from 'angular2/src/core/compiler/element_injector';
import {ProtoRecordRange} from 'angular2/change_detection';

@proxy
@IMPLEMENTS(ElementInjector)
class FakeElementInjector {
  content;
  viewPort;
  element;

  constructor(content = null, viewPort = null, element = null) {
    this.content = content;
    this.viewPort = viewPort;
    this.element = element;
  }

  hasDirective(type) {
    return this.content != null;
  }

  hasPreBuiltObject(type) {
    return this.viewPort != null;
  }

  forElement(n) {
    return this.element == n;
  }

  get(t) {
    if (t === Content) return this.content;
    if (t === ViewPort) return this.viewPort;
    return null;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

@proxy
@IMPLEMENTS(View)
class FakeView {
  elementInjectors;

  constructor(elementInjectors = null) {
    this.elementInjectors = elementInjectors;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

@proxy
@IMPLEMENTS(ViewPort)
class FakeViewPort {
  _nodes;
  _contentTagContainers;

  constructor(nodes = null, views = null) {
    this._nodes = nodes;
    this._contentTagContainers = views;
  }

  nodes(){
    return this._nodes;
  }

  contentTagContainers(){
    return this._contentTagContainers;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}


@proxy
@IMPLEMENTS(Content)
class FakeContentTag {
  select;
  _nodes;

  constructor(select = null, nodes = null) {
    this.select = select;
    this._nodes = nodes;
  }

  insert(nodes){
    this._nodes = ListWrapper.clone(nodes);
  }

  nodes() {
    return this._nodes;
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}


export function main() {
  describe('LightDom', function() {
    var lightDomView;

    beforeEach(() => {
      lightDomView = new FakeView([]);
    });

    describe("contentTags", () => {
      it("should collect content tags from element injectors", () => {
        var tag = new FakeContentTag();
        var shadowDomView = new FakeView([new FakeElementInjector(tag)]);

        var lightDom = new LightDom(lightDomView, shadowDomView, el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });

      it("should collect content tags from view ports", () => {
        var tag = new FakeContentTag();
        var vp = new FakeViewPort(null, [
          new FakeView([new FakeElementInjector(tag, null)])
        ]);

        var shadowDomView = new FakeView([new FakeElementInjector(null, vp)]);

        var lightDom = new LightDom(lightDomView, shadowDomView, el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });
    });

    describe("expanded roots", () => {
      it("should contain root nodes", () => {
        var lightDomEl = el("<div><a></a></div>")
        var lightDom = new LightDom(lightDomView, new FakeView(), lightDomEl);
        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include view port nodes", () => {
        var lightDomEl = el("<div><template></template></div>")

        var lightDomView = new FakeView([
          new FakeElementInjector(
            null,
            new FakeViewPort([el("<a></a>")]),
            DOM.firstChild(lightDomEl))]);

        var lightDom = new LightDom(
          lightDomView,
          new FakeView(),
          lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include content nodes", () => {
        var lightDomEl = el("<div><content></content></div>")

        var lightDomView = new FakeView([
          new FakeElementInjector(
            new FakeContentTag(null, [el("<a></a>")]),
            null,
            DOM.firstChild(lightDomEl))]);

        var lightDom = new LightDom(
          lightDomView,
          new FakeView(),
          lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });
    });

    describe("redistribute", () => {
      it("should redistribute nodes between content tags with select property set", () => {
        var contentA = new FakeContentTag("a");
        var contentB = new FakeContentTag("b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          new FakeElementInjector(contentA, null),
          new FakeElementInjector(contentB, null)
        ]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(contentA.nodes())).toEqual(["<a>1</a>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes())).toEqual(["<b>2</b>"]);
      });

      it("should support wildcard content tags", () => {
        var wildcard = new FakeContentTag(null);
        var contentB = new FakeContentTag("b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          new FakeElementInjector(wildcard, null),
          new FakeElementInjector(contentB, null)
        ]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(wildcard.nodes())).toEqual(["<a>1</a>", "<b>2</b>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes())).toEqual([]);
      });
    });
  });
}

function toHtml(nodes) {
  if (isBlank(nodes)) return [];
  return ListWrapper.map(nodes, DOM.getOuterHTML);
}