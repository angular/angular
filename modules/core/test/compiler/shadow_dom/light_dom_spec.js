import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject} from 'test_lib/test_lib';
import {proxy, IMPLEMENTS, isBlank} from 'facade/lang';
import {ListWrapper, MapWrapper} from 'facade/collection';
import {DOM} from 'facade/dom';
import {Content} from 'core/compiler/shadow_dom_emulation/content_tag';
import {NgElement} from 'core/dom/element';
import {LightDom} from 'core/compiler/shadow_dom_emulation/light_dom';
import {View} from 'core/compiler/view';
import {ViewPort} from 'core/compiler/viewport';
import {ElementInjector} from 'core/compiler/element_injector';
import {ProtoRecordRange} from 'change_detection/change_detection';

@proxy
@IMPLEMENTS(ElementInjector)
class FakeElementInjector {
  content;
  viewPort;

  constructor(content, viewPort) {
    this.content = content;
    this.viewPort = viewPort;
  }

  hasDirective(type) {
    return this.content != null;
  }

  hasPreBuiltObject(type) {
    return this.viewPort != null;
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
  ports;

  constructor(elementInjectors = null, ports = null) {
    this.elementInjectors = elementInjectors;
    this.ports = ports;
  }

  getViewPortByTemplateElement(el) {
    if (isBlank(this.ports)) return null;
    return MapWrapper.get(this.ports, el);
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

  constructor(nodes, views) {
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
  nodes;

  constructor(select = null) {
    this.select = select;
  }

  insert(nodes){
    this.nodes = ListWrapper.clone(nodes);
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}


export function main() {
  describe('LightDom', function() {
    var lightDomView;

    beforeEach(() => {
      lightDomView = new FakeView([], MapWrapper.create());
    });

    describe("contentTags", () => {
      it("should collect content tags from element injectors", () => {
        var tag = new FakeContentTag();
        var shadowDomView = new FakeView([new FakeElementInjector(tag, null)]);

        var lightDom = new LightDom(lightDomView, shadowDomView, createElement("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });

      it("should collect content tags from view ports", () => {
        var tag = new FakeContentTag();
        var vp = new FakeViewPort(null, [
          new FakeView([new FakeElementInjector(tag, null)])
        ]);

        var shadowDomView = new FakeView([new FakeElementInjector(null, vp)]);

        var lightDom = new LightDom(lightDomView, shadowDomView, createElement("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });
    });

    describe("expanded roots", () => {
      it("should contain root nodes", () => {
        var lightDomEl = createElement("<div><a></a></div>")
        var lightDom = new LightDom(lightDomView, new FakeView(), lightDomEl);
        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include view port nodes", () => {
        var lightDomEl = createElement("<div><template></template></div>")
        var template = lightDomEl.childNodes[0];

        var lightDomView = new FakeView([],
          MapWrapper.createFromPairs([
            [template, new FakeViewPort([createElement("<a></a>")], null)]
          ])
        );

        var lightDom = new LightDom(lightDomView, new FakeView(), lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });
    });

    describe("redistribute", () => {
      it("should redistribute nodes between content tags with select property set", () => {
        var contentA = new FakeContentTag("a");
        var contentB = new FakeContentTag("b");

        var lightDomEl = createElement("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          new FakeElementInjector(contentA, null),
          new FakeElementInjector(contentB, null)
        ]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(contentA.nodes)).toEqual(["<a>1</a>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes)).toEqual(["<b>2</b>"]);
      });

      it("should support wildcard content tags", () => {
        var wildcard = new FakeContentTag(null);
        var contentB = new FakeContentTag("b");

        var lightDomEl = createElement("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          new FakeElementInjector(wildcard, null),
          new FakeElementInjector(contentB, null)
        ]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(wildcard.nodes)).toEqual(["<a>1</a>", "<b>2</b>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes)).toEqual([]);
      });
    });
  });
}

function toHtml(nodes) {
  if (isBlank(nodes)) return [];
  return ListWrapper.map(nodes, DOM.getOuterHTML);
}

function createElement(html) {
  return DOM.createTemplate(html).content.firstChild;
}
