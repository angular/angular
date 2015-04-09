import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject, el, proxy} from 'angular2/test_lib';
import {IMPLEMENTS, isBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Content} from 'angular2/src/render/dom/shadow_dom/content_tag';
import {LightDom} from 'angular2/src/render/dom/shadow_dom/light_dom';
import {RenderView} from 'angular2/src/render/dom/view/view';
import {ViewContainer} from 'angular2/src/render/dom/view/view_container';

@proxy
@IMPLEMENTS(RenderView)
class FakeView {
  contentTags;
  viewContainers;

  constructor(containers = null) {
    this.contentTags = [];
    this.viewContainers = [];
    if (isPresent(containers)) {
      ListWrapper.forEach(containers, (c) => {
        if (c instanceof FakeContentTag) {
          ListWrapper.push(this.contentTags, c);
        } else {
          ListWrapper.push(this.contentTags, null);
        }
        if (c instanceof FakeViewContainer) {
          ListWrapper.push(this.viewContainers, c);
        } else {
          ListWrapper.push(this.viewContainers, null);
        }
      });
    }
  }

  noSuchMethod(i) {
    super.noSuchMethod(i);
  }
}

@proxy
@IMPLEMENTS(ViewContainer)
class FakeViewContainer {
  templateElement;
  _nodes;
  _contentTagContainers;

  constructor(templateEl, nodes = null, views = null) {
    this.templateElement = templateEl;
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
  contentStartElement;

  constructor(contentEl, select = '', nodes = null) {
    this.contentStartElement = contentEl;
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
      lightDomView = new FakeView();
    });

    describe("contentTags", () => {
      it("should collect content tags from element injectors", () => {
        var tag = new FakeContentTag(el('<script></script>'));
        var shadowDomView = new FakeView([tag]);

        var lightDom = new LightDom(lightDomView, shadowDomView,
            el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });

      it("should collect content tags from ViewContainers", () => {
        var tag = new FakeContentTag(el('<script></script>'));
        var vc = new FakeViewContainer(null, null, [
          new FakeView([tag])
        ]);
        var shadowDomView = new FakeView([vc]);
        var lightDom = new LightDom(lightDomView, shadowDomView,
            el("<div></div>"));

        expect(lightDom.contentTags()).toEqual([tag]);
      });
    });

    describe("expandedDomNodes", () => {
      it("should contain root nodes", () => {
        var lightDomEl = el("<div><a></a></div>")
        var lightDom = new LightDom(lightDomView, new FakeView(), lightDomEl);
        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include view container nodes", () => {
        var lightDomEl = el("<div><template></template></div>");
        var lightDom = new LightDom(
          new FakeView([
            new FakeViewContainer(
              DOM.firstChild(lightDomEl),  // template element
              [el('<a></a>')]              // light DOM nodes of view container
            )
          ]),
          null,
          lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should include content nodes", () => {
        var lightDomEl = el("<div><content></content></div>");
        var lightDom = new LightDom(
          new FakeView([
            new FakeContentTag(
              DOM.firstChild(lightDomEl),  // content element
              '',                          // selector
              [el('<a></a>')]              // light DOM nodes of content tag
            )
          ]),
          null,
          lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });

      it("should work when the element injector array contains nulls", () => {
        var lightDomEl = el("<div><a></a></div>")

        var lightDomView = new FakeView();

        var lightDom = new LightDom(
          lightDomView,
          new FakeView(),
          lightDomEl);

        expect(toHtml(lightDom.expandedDomNodes())).toEqual(["<a></a>"]);
      });
    });

    describe("redistribute", () => {
      it("should redistribute nodes between content tags with select property set", () => {
        var contentA = new FakeContentTag(null, "a");
        var contentB = new FakeContentTag(null, "b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          contentA,
          contentB
        ]), lightDomEl);

        lightDom.redistribute();

        expect(toHtml(contentA.nodes())).toEqual(["<a>1</a>", "<a>3</a>"]);
        expect(toHtml(contentB.nodes())).toEqual(["<b>2</b>"]);
      });

      it("should support wildcard content tags", () => {
        var wildcard = new FakeContentTag(null, '');
        var contentB = new FakeContentTag(null, "b");

        var lightDomEl = el("<div><a>1</a><b>2</b><a>3</a></div>")

        var lightDom = new LightDom(lightDomView, new FakeView([
          wildcard,
          contentB
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
