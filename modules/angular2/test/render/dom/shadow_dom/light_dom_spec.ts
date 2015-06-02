import {
  describe,
  beforeEach,
  it,
  expect,
  ddescribe,
  iit,
  SpyObject,
  el,
  proxy,
  stringifyElement
} from 'angular2/test_lib';
import {IMPLEMENTS, isBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Content} from 'angular2/src/render/dom/shadow_dom/content_tag';
import {LightDom} from 'angular2/src/render/dom/shadow_dom/light_dom';
import {DomView} from 'angular2/src/render/dom/view/view';
import {DomProtoView} from 'angular2/src/render/dom/view/proto_view';
import {DomViewContainer} from 'angular2/src/render/dom/view/view_container';
import {DomElement} from 'angular2/src/render/dom/view/element';

@proxy
@IMPLEMENTS(DomProtoView)
class FakeProtoView extends SpyObject {
  constructor(public transitiveContentTagCount: number) { super(DomProtoView); }

  noSuchMethod(i) { super.noSuchMethod(i); }
}

@proxy
@IMPLEMENTS(DomView)
class FakeView extends SpyObject {
  boundElements;
  proto;

  constructor(containers = null, transitiveContentTagCount: number = 1) {
    super(DomView);
    this.proto = new FakeProtoView(transitiveContentTagCount);
    this.boundElements = [];
    if (isPresent(containers)) {
      ListWrapper.forEach(containers, (c) => {
        var element = null;
        var contentTag = null;
        var vc = null;
        if (c instanceof FakeContentTag) {
          contentTag = c;
          element = c.contentStartElement;
        }
        if (c instanceof FakeViewContainer) {
          vc = c;
          element = c.templateElement;
        }
        var boundElement = new DomElement(null, element, contentTag);
        boundElement.viewContainer = vc;
        ListWrapper.push(this.boundElements, boundElement);
      });
    }
  }

  noSuchMethod(i) { super.noSuchMethod(i); }
}

@proxy
@IMPLEMENTS(DomViewContainer)
class FakeViewContainer extends SpyObject {
  _nodes;
  _contentTagContainers;
  templateElement;

  constructor(templateEl, nodes = null, views = null) {
    super(DomViewContainer);
    this.templateElement = templateEl;
    this._nodes = nodes;
    this._contentTagContainers = views;
  }

  nodes() { return this._nodes; }

  contentTagContainers() { return this._contentTagContainers; }

  noSuchMethod(i) { super.noSuchMethod(i); }
}


@proxy
@IMPLEMENTS(Content)
class FakeContentTag extends SpyObject {
  select;
  _nodes;
  contentStartElement;

  constructor(contentEl, select = '', nodes = null) {
    super(Content);
    this.contentStartElement = contentEl;
    this.select = select;
    this._nodes = nodes;
  }

  insert(nodes) { this._nodes = nodes; }

  nodes() { return this._nodes; }

  noSuchMethod(i) { super.noSuchMethod(i); }
}

function createLightDom(hostView, shadowView, el) {
  var lightDom = new LightDom(hostView, el);
  lightDom.attachShadowDomView(shadowView);
  return lightDom;
}

export function main() {
  describe('LightDom', function() {
    var lightDomView;

    beforeEach(() => { lightDomView = new FakeView(); });

    describe("contentTags", () => {
      it("should collect unconditional content tags", () => {
        var tag = new FakeContentTag(el('<script></script>'));
        var shadowDomView = new FakeView([tag]);

        var lightDom = createLightDom(lightDomView, shadowDomView, el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });

      it("should collect content tags from ViewContainers", () => {
        var tag = new FakeContentTag(el('<script></script>'));
        var vc = new FakeViewContainer(null, null, [new FakeView([tag])]);
        var shadowDomView = new FakeView([vc]);
        var lightDom = createLightDom(lightDomView, shadowDomView, el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });

      it("should not walk views that can't have content tags", () => {
        var tag = new FakeContentTag(el('<script></script>'));
        var shadowDomView = new FakeView([tag], 0);

        var lightDom = createLightDom(lightDomView, shadowDomView, el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([]);
      });
    });

    describe("expandedDomNodes", () => {
      it("should contain root nodes", () => {
        var lightDomEl = el("<div><a></a></div>");
        var lightDom = createLightDom(lightDomView, new FakeView(), lightDomEl);
        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include view container nodes", () => {
        var lightDomEl = el("<div><template></template></div>");
        var lightDom = createLightDom(
            new FakeView([
              new FakeViewContainer(DOM.firstChild(lightDomEl),  // template element
                                    [el('<a></a>')]  // light DOM nodes of view container
                                    )
            ]),
            null, lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include content nodes", () => {
        var lightDomEl = el("<div><content></content></div>");
        var lightDom =
            createLightDom(new FakeView([
                             new FakeContentTag(DOM.firstChild(lightDomEl),  // content element
                                                '',                          // selector
                                                [el('<a></a>')]  // light DOM nodes of content tag
                                                )
                           ]),
                           null, lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should work when the element injector array contains nulls", () => {
        var lightDomEl = el("<div><a></a></div>")

            var lightDomView = new FakeView();

        var lightDom = createLightDom(lightDomView, new FakeView(), lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });
    });

    describe("redistribute", () => {
      it("should redistribute nodes between content tags with select property set", () => {
        var contentA = new FakeContentTag(null, "a");
        var contentB = new FakeContentTag(null, "b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

            var lightDom =
                createLightDom(lightDomView, new FakeView([contentA, contentB]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(contentA.nodes())).toEqual(["<a>1</a>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes())).toEqual(["<b>2</b>"]);
      });

      it("should support wildcard content tags", () => {
        var wildcard = new FakeContentTag(null, '');
        var contentB = new FakeContentTag(null, "b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

            var lightDom =
                createLightDom(lightDomView, new FakeView([wildcard, contentB]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(wildcard.nodes())).toEqual(["<a>1</a>", "<b>2</b>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes())).toEqual([]);
      });

      it("should remove all nodes if there are no content tags", () => {
        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

            var lightDom = createLightDom(lightDomView, new FakeView([]), lightDomEl);

        lightDom.redistribute();

        expect(DOM.childNodes(lightDomEl).length).toBe(0);
      });

      it("should remove all not projected nodes", () => {
        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>");
        var bNode = DOM.childNodes(lightDomEl)[1];

        var lightDom =
            createLightDom(lightDomView, new FakeView([new FakeContentTag(null, "a")]), lightDomEl);

        lightDom.redistribute();

        expect(bNode.parentNode).toBe(null);
      });

    });
  });
}

function toHtml(nodes) {
  if (isBlank(nodes)) return [];
  return ListWrapper.map(nodes, stringifyElement);
}
