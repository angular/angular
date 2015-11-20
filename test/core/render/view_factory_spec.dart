library angular2.test.core.render.view_factory_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xit,
        stringifyElement;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, ListWrapper;
import "package:angular2/src/core/linker/template_commands.dart" as appCmds;
import "package:angular2/src/core/render/view_factory.dart"
    show createRenderView, encapsulateStyles, NodeFactory;
import "package:angular2/src/core/render/api.dart"
    show RenderTemplateCmd, RenderBeginElementCmd, RenderComponentTemplate;
import "../spies.dart" show SpyRenderEventDispatcher;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/metadata.dart" show ViewEncapsulation;

RenderBeginElementCmd beginElement(String name, List<String> attrNameAndValues,
    List<String> eventTargetAndNames, bool isBound, num ngContentIndex) {
  return new appCmds.BeginElementCmd(name, attrNameAndValues,
      eventTargetAndNames, [], [], isBound, ngContentIndex);
}

endElement() {
  return new appCmds.EndElementCmd();
}

text(String value, bool isBound, num ngContentIndex) {
  return new appCmds.TextCmd(value, isBound, ngContentIndex);
}

embeddedTemplate(List<String> attrNameAndValues, bool isMerged,
    num ngContentIndex, List<dynamic> children) {
  return new appCmds.EmbeddedTemplateCmd(
      attrNameAndValues, [], [], isMerged, ngContentIndex, null, children);
}

beginComponent(String name, List<String> attrNameAndValues,
    List<String> eventTargetAndNames, num ngContentIndex, String templateId) {
  return new appCmds.BeginComponentCmd(
      name,
      attrNameAndValues,
      eventTargetAndNames,
      [],
      [],
      null,
      ngContentIndex,
      () =>
          new appCmds.CompiledComponentTemplate(templateId, null, null, null));
}

endComponent() {
  return new appCmds.EndComponentCmd();
}

ngContent(num index, num ngContentIndex) {
  return new appCmds.NgContentCmd(index, ngContentIndex);
}

main() {
  describe("createRenderView", () {
    DomNodeFactory nodeFactory;
    SpyRenderEventDispatcher eventDispatcher;
    var componentTemplates = new Map<String,
        dynamic /* RenderComponentTemplate | List < RenderTemplateCmd > */ >();
    RenderComponentTemplate defaultCmpTpl;
    beforeEach(() {
      nodeFactory = new DomNodeFactory(componentTemplates);
      eventDispatcher = new SpyRenderEventDispatcher();
      defaultCmpTpl = new RenderComponentTemplate(
          "someId", "shortid", ViewEncapsulation.None, [], []);
    });
    describe("primitives", () {
      it("should create elements with attributes", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("div", ["attr1", "value1"], [], false, null),
              endElement()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<div attr1=\"value1\"></div>");
      });
      it("should create host elements with attributes", () {
        componentTemplates["0"] = [];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("a-comp", ["attr1", "value1"], [], null, "0"),
              endElement()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<a-comp attr1=\"value1\"></a-comp>");
      });
      it("should create embedded templates with attributes", () {
        componentTemplates["0"] = [];
        var view = createRenderView(
            defaultCmpTpl,
            [
              embeddedTemplate(["attr1", "value1"], false, null, [])
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<template attr1=\"value1\"></template>");
      });
      it("should store bound elements", () {
        componentTemplates["0"] = [];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("div", ["id", "1"], [], false, null),
              endElement(),
              beginElement("span", ["id", "2"], [], true, null),
              endElement(),
              beginComponent("a-comp", ["id", "3"], [], null, "0"),
              endElement(),
              embeddedTemplate(["id", "4"], false, null, [])
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id")).toEqual(["2", "3", "4"]);
      });
      it("should use the inplace element for the first create element", () {
        var el = DOM.createElement("span");
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("div", ["attr1", "value1"], [], false, null),
              endElement(),
              beginElement("div", [], [], false, null),
              endElement()
            ],
            el,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<span attr1=\"value1\"></span><div></div>");
      });
      it("should create text nodes", () {
        var view = createRenderView(
            defaultCmpTpl, [text("someText", false, null)], null, nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes)).toEqual("someText");
      });
      it("should store bound text nodes", () {
        var view = createRenderView(defaultCmpTpl,
            [text("1", false, null), text("2", true, null)], null, nodeFactory);
        expect(stringifyElement(view.boundTextNodes[0])).toEqual("2");
      });
      it("should register element event listeners", () {
        componentTemplates["0"] = [];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("div", [], [null, "click"], true, null),
              endElement(),
              beginComponent("a-comp", [], [null, "click"], null, "0"),
              endElement()
            ],
            null,
            nodeFactory);
        view.setEventDispatcher((eventDispatcher as dynamic));
        var event = {};
        nodeFactory.triggerLocalEvent(view.boundElements[0], "click", event);
        nodeFactory.triggerLocalEvent(view.boundElements[1], "click", event);
        expect(eventDispatcher.spy("dispatchRenderEvent")).toHaveBeenCalledWith(
            0, "click", MapWrapper.createFromStringMap({"\$event": event}));
        expect(eventDispatcher.spy("dispatchRenderEvent")).toHaveBeenCalledWith(
            1, "click", MapWrapper.createFromStringMap({"\$event": event}));
      });
      it("should register element global event listeners", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("div", [], ["window", "scroll"], true, null),
              endElement(),
              beginComponent("a-comp", [], ["window", "scroll"], null, "0"),
              endElement()
            ],
            null,
            nodeFactory);
        view.hydrate();
        view.setEventDispatcher((eventDispatcher as dynamic));
        var event = {};
        nodeFactory.triggerGlobalEvent("window", "scroll", event);
        expect(eventDispatcher.spy("dispatchRenderEvent")).toHaveBeenCalledWith(
            0,
            "window:scroll",
            MapWrapper.createFromStringMap({"\$event": event}));
        expect(eventDispatcher.spy("dispatchRenderEvent")).toHaveBeenCalledWith(
            1,
            "window:scroll",
            MapWrapper.createFromStringMap({"\$event": event}));
      });
    });
    describe("nested nodes", () {
      it("should create nested node", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("a", [], [], false, null),
              beginElement("b", [], [], false, null),
              text("someText", false, null),
              endElement(),
              endElement()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<a><b>someText</b></a>");
      });
      it("should store bound elements in depth first order", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("a", ["id", "1"], [], false, null),
              endElement(),
              beginElement("a", ["id", "2"], [], true, null),
              beginElement("a", ["id", "3"], [], false, null),
              endElement(),
              beginElement("a", ["id", "4"], [], true, null),
              endElement(),
              endElement(),
              beginElement("a", ["id", "5"], [], false, null),
              endElement(),
              beginElement("a", ["id", "6"], [], true, null),
              endElement()
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id")).toEqual(["2", "4", "6"]);
      });
      it("should store bound text nodes in depth first order", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              text("1", false, null),
              text("2", true, null),
              beginElement("a", [], [], false, null),
              text("3", false, null),
              text("4", true, null),
              endElement(),
              text("5", false, null),
              text("6", true, null)
            ],
            null,
            nodeFactory);
        expect(mapText(view.boundTextNodes)).toEqual(["2", "4", "6"]);
      });
    });
    describe("merged embedded templates", () {
      it("should create separate fragments", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              embeddedTemplate(["attr1", "value1"], true, null,
                  [text("someText", false, null)])
            ],
            null,
            nodeFactory);
        expect(view.fragments.length).toBe(2);
        expect(stringifyFragment(view.fragments[1].nodes)).toEqual("someText");
      });
      it("should store bound elements after the bound elements of earlier fragments",
          () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("a", ["id", "1.1"], [], true, null),
              endElement(),
              embeddedTemplate(
                  ["id", "1.2"],
                  true,
                  null,
                  [
                    embeddedTemplate(
                        ["id", "2.1"],
                        true,
                        null,
                        [
                          beginElement("a", ["id", "3.1"], [], true, null),
                          endElement()
                        ]),
                    beginElement("a", ["id", "2.2"], [], true, null),
                    endElement()
                  ]),
              beginElement("a", ["id", "1.3"], [], true, null),
              endElement()
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id"))
            .toEqual(["1.1", "1.2", "1.3", "2.1", "2.2", "3.1"]);
      });
      it("should store bound text nodes after the bound text nodes of earlier fragments",
          () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              text("1.1", true, null),
              embeddedTemplate(
                  ["id", "1.2"],
                  true,
                  null,
                  [
                    text("2.1", true, null),
                    embeddedTemplate(
                        ["id", "2.1"], true, null, [text("3.1", true, null)]),
                    text("2.2", true, null)
                  ]),
              text("1.2", true, null)
            ],
            null,
            nodeFactory);
        expect(mapText(view.boundTextNodes))
            .toEqual(["1.1", "1.2", "2.1", "2.2", "3.1"]);
      });
    });
    describe("non merged embedded templates", () {
      it("should only create the anchor element", () {
        var view = createRenderView(
            defaultCmpTpl,
            [
              embeddedTemplate(
                  ["id", "1.1"],
                  false,
                  null,
                  [
                    text("someText", true, null),
                    beginElement("a", ["id", "2.1"], [], true, null),
                    endElement()
                  ])
            ],
            null,
            nodeFactory);
        expect(view.fragments.length).toBe(1);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<template id=\"1.1\"></template>");
        expect(view.boundTextNodes.length).toBe(0);
        expect(mapAttrs(view.boundElements, "id")).toEqual(["1.1"]);
      });
    });
    describe("components", () {
      it("should store the component template in the same fragment", () {
        componentTemplates["0"] = [text("hello", false, null)];
        var view = createRenderView(
            defaultCmpTpl,
            [beginComponent("my-comp", [], [], null, "0"), endComponent()],
            null,
            nodeFactory);
        expect(view.fragments.length).toBe(1);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<my-comp>hello</my-comp>");
      });
      it("should use native shadow DOM", () {
        componentTemplates["0"] = new RenderComponentTemplate(
            "someId",
            "shortid",
            ViewEncapsulation.Native,
            [text("hello", false, null)],
            []);
        var view = createRenderView(
            defaultCmpTpl,
            [beginComponent("my-comp", [], [], null, "0"), endComponent()],
            null,
            nodeFactory);
        expect(view.fragments.length).toBe(1);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<my-comp><shadow-root>hello</shadow-root></my-comp>");
      });
      it("should store bound elements after the bound elements of the main template",
          () {
        componentTemplates["0"] = [
          beginComponent("b-comp", ["id", "2.1"], [], null, "1"),
          endComponent(),
          beginComponent("b-comp", ["id", "2.2"], [], null, "1"),
          endComponent()
        ];
        componentTemplates["1"] = [
          beginElement("a", ["id", "3.1"], [], true, null),
          endElement()
        ];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginElement("a", ["id", "1.1"], [], true, null),
              endElement(),
              beginComponent("a-comp", ["id", "1.2"], [], null, "0"),
              beginElement("a", ["id", "1.3"], [], true, null),
              endElement(),
              endComponent(),
              beginElement("a", ["id", "1.4"], [], true, null),
              endElement()
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id"))
            .toEqual(["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "3.1", "3.1"]);
      });
      it("should store bound elements from the view before bound elements from content components",
          () {
        componentTemplates["0"] = [
          beginElement("a", ["id", "2.1"], [], true, null),
          endElement()
        ];
        componentTemplates["1"] = [
          beginElement("a", ["id", "3.1"], [], true, null),
          endElement()
        ];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("a-comp", ["id", "1.1"], [], null, "0"),
              beginComponent("b-comp", ["id", "1.2"], [], null, "1"),
              endComponent(),
              endComponent()
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id"))
            .toEqual(["1.1", "1.2", "2.1", "3.1"]);
      });
      it("should process nested components in depth first order", () {
        componentTemplates["0"] = [
          beginComponent("b11-comp", ["id", "2.1"], [], null, "2"),
          endComponent(),
          beginComponent("b12-comp", ["id", "2.2"], [], null, "3"),
          endComponent()
        ];
        componentTemplates["1"] = [
          beginComponent("b21-comp", ["id", "3.1"], [], null, "4"),
          endComponent(),
          beginComponent("b22-comp", ["id", "3.2"], [], null, "5"),
          endComponent()
        ];
        componentTemplates["2"] = [
          beginElement("b11", ["id", "4.11"], [], true, null),
          endElement()
        ];
        componentTemplates["3"] = [
          beginElement("b12", ["id", "4.12"], [], true, null),
          endElement()
        ];
        componentTemplates["4"] = [
          beginElement("b21", ["id", "4.21"], [], true, null),
          endElement()
        ];
        componentTemplates["5"] = [
          beginElement("b22", ["id", "4.22"], [], true, null),
          endElement()
        ];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("a1-comp", ["id", "1.1"], [], null, "0"),
              endComponent(),
              beginComponent("a2-comp", ["id", "1.2"], [], null, "1"),
              endComponent()
            ],
            null,
            nodeFactory);
        expect(mapAttrs(view.boundElements, "id")).toEqual([
          "1.1",
          "1.2",
          "2.1",
          "2.2",
          "4.11",
          "4.12",
          "3.1",
          "3.2",
          "4.21",
          "4.22"
        ]);
      });
      it("should store bound text nodes after the bound text nodes of the main template",
          () {
        componentTemplates["0"] = [
          text("2.1", true, null),
          beginComponent("b-comp", [], [], null, "1"),
          endComponent(),
          beginComponent("b-comp", [], [], null, "1"),
          endComponent(),
          text("2.2", true, null)
        ];
        componentTemplates["1"] = [text("3.1", true, null)];
        var view = createRenderView(
            defaultCmpTpl,
            [
              text("1.1", true, null),
              beginComponent("a-comp", [], [], null, "0"),
              text("1.2", true, null),
              endComponent(),
              text("1.3", true, null)
            ],
            null,
            nodeFactory);
        expect(mapText(view.boundTextNodes))
            .toEqual(["1.1", "1.2", "1.3", "2.1", "2.2", "3.1", "3.1"]);
      });
    });
    it("should store bound text nodes from the view before bound text nodes from content components",
        () {
      componentTemplates["0"] = [text("2.1", true, null)];
      componentTemplates["1"] = [text("3.1", true, null)];
      var view = createRenderView(
          defaultCmpTpl,
          [
            beginComponent("a-comp", [], [], null, "0"),
            beginComponent("b-comp", [], [], null, "1"),
            endComponent(),
            endComponent()
          ],
          null,
          nodeFactory);
      expect(mapText(view.boundTextNodes)).toEqual(["2.1", "3.1"]);
    });
    describe("content projection", () {
      it("should remove non projected nodes", () {
        componentTemplates["0"] = [];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("my-comp", [], [], null, "0"),
              text("hello", false, null),
              endComponent()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<my-comp></my-comp>");
      });
      it("should keep non projected nodes in the light dom when using native shadow dom",
          () {
        componentTemplates["0"] = new RenderComponentTemplate(
            "someId", "shortid", ViewEncapsulation.Native, [], []);
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("my-comp", [], [], null, "0"),
              text("hello", false, null),
              endComponent()
            ],
            null,
            nodeFactory);
        var rootEl = view.fragments[0].nodes[0];
        expect(stringifyElement(rootEl))
            .toEqual("<my-comp><shadow-root></shadow-root>hello</my-comp>");
      });
      it("should project commands based on their ngContentIndex", () {
        componentTemplates["0"] = [
          text("(", false, null),
          ngContent(0, null),
          text(",", false, null),
          ngContent(1, null),
          text(")", false, null)
        ];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("my-comp", [], [], null, "0"),
              text("2", false, 1),
              text("1", false, 0),
              endComponent()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<my-comp>(1,2)</my-comp>");
      });
      it("should reproject nodes over multiple ng-content commands", () {
        componentTemplates["0"] = [
          beginComponent("b-comp", [], [], null, "1"),
          ngContent(0, 0),
          endComponent()
        ];
        componentTemplates["1"] = [
          text("(", false, null),
          ngContent(0, null),
          text(")", false, null)
        ];
        var view = createRenderView(
            defaultCmpTpl,
            [
              beginComponent("a-comp", [], [], null, "0"),
              text("hello", false, 0),
              endComponent()
            ],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<a-comp><b-comp>(hello)</b-comp></a-comp>");
      });
      it("should store content injection points for root component in a view",
          () {
        componentTemplates["0"] = [ngContent(0, null)];
        var view = createRenderView(
            defaultCmpTpl,
            [beginComponent("a-comp", [], [], null, "0"), endComponent()],
            DOM.createElement("root"),
            nodeFactory);
        expect(stringifyFragment(view.rootContentInsertionPoints)).toEqual(
            "<root-content-insertion-point></root-content-insertion-point>");
      });
    });
    describe("view encapsulation", () {
      it("should not add attributes to elements in template with ViewEncapsulation.None",
          () {
        var tpl = new RenderComponentTemplate(
            "someId", "shortid", ViewEncapsulation.None, [], []);
        var view = createRenderView(
            tpl,
            [beginElement("div", [], [], false, null), endElement()],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<div></div>");
      });
      it("should not add attributes to elements in template with ViewEncapsulation.Native",
          () {
        var tpl = new RenderComponentTemplate(
            "someId", "shortid", ViewEncapsulation.Native, [], []);
        var view = createRenderView(
            tpl,
            [beginElement("div", [], [], false, null), endElement()],
            null,
            nodeFactory);
        expect(stringifyFragment(view.fragments[0].nodes))
            .toEqual("<div></div>");
      });
      describe("ViewEncapsulation.Emulated", () {
        var encapsulatedTpl;
        beforeEach(() {
          encapsulatedTpl = new RenderComponentTemplate(
              "someId", "shortid", ViewEncapsulation.Emulated, [], []);
        });
        it("should add marker attributes to content elements", () {
          var view = createRenderView(
              encapsulatedTpl,
              [beginElement("div", [], [], false, null), endElement()],
              null,
              nodeFactory);
          expect(stringifyFragment(view.fragments[0].nodes))
              .toEqual("<div _ngcontent-shortid=\"\"></div>");
        });
        it("should add marker attributes to content elements in merged embedded templates",
            () {
          var view = createRenderView(
              encapsulatedTpl,
              [
                embeddedTemplate([], true, null,
                    [beginElement("div", [], [], false, null), endElement()])
              ],
              null,
              nodeFactory);
          expect(stringifyFragment(view.fragments[0].nodes))
              .toEqual("<template></template>");
          expect(stringifyFragment(view.fragments[1].nodes))
              .toEqual("<div _ngcontent-shortid=\"\"></div>");
        });
        it("should add marker attributes to host elements and content elements of nested components",
            () {
          componentTemplates["0"] = new RenderComponentTemplate(
              "innerComp",
              "innerid",
              ViewEncapsulation.Emulated,
              [beginElement("div", [], [], false, null), endElement()],
              []);
          var view = createRenderView(
              defaultCmpTpl,
              [beginComponent("my-comp", [], [], null, "0"), endComponent()],
              null,
              nodeFactory);
          expect(stringifyFragment(view.fragments[0].nodes)).toEqual(
              "<my-comp _nghost-innerid=\"\"><div _ngcontent-innerid=\"\"></div></my-comp>");
        });
      });
    });
  });
  describe("encapsulateStyles", () {
    const input = "div[%COMP%] {}";
    it("should not change styles for ViewEncapsulation.Native", () {
      var tpl = new RenderComponentTemplate(
          "someId", "shortid", ViewEncapsulation.Native, [], [input]);
      expect(encapsulateStyles(tpl)).toEqual([input]);
    });
    it("should not change styles for ViewEncapsulation.None", () {
      var tpl = new RenderComponentTemplate(
          "someId", "shortid", ViewEncapsulation.None, [], [input]);
      expect(encapsulateStyles(tpl)).toEqual([input]);
    });
    it("should change styles for ViewEncapsulation.Emulated", () {
      var tpl = new RenderComponentTemplate(
          "someId", "shortid", ViewEncapsulation.Emulated, [], [input]);
      expect(encapsulateStyles(tpl)).toEqual(["div[shortid] {}"]);
    });
  });
}

class DomNodeFactory implements NodeFactory<dynamic> {
  Map<String,
      dynamic /* RenderComponentTemplate | List < RenderTemplateCmd > */ > _components;
  List<GlobalEventListener> _globalEventListeners = [];
  List<LocalEventListener> _localEventListeners = [];
  DomNodeFactory(this._components) {}
  triggerLocalEvent(dynamic el, String eventName, dynamic event) {
    this._localEventListeners.forEach((listener) {
      if (listener.eventName == eventName) {
        listener.callback(event);
      }
    });
  }

  triggerGlobalEvent(String target, String eventName, dynamic event) {
    this._globalEventListeners.forEach((listener) {
      if (listener.eventName == eventName && listener.target == target) {
        listener.callback(event);
      }
    });
  }

  RenderComponentTemplate resolveComponentTemplate(String templateId) {
    var data = this._components[templateId];
    if (data is RenderComponentTemplate) {
      return data;
    } else {
      return new RenderComponentTemplate(templateId, templateId,
          ViewEncapsulation.None, (data as List<RenderTemplateCmd>), []);
    }
  }

  dynamic createTemplateAnchor(List<String> attrNameAndValues) {
    var el = DOM.createElement("template");
    this._setAttributes(el, attrNameAndValues);
    return el;
  }

  dynamic createElement(String name, List<String> attrNameAndValues) {
    var el = DOM.createElement(name);
    this._setAttributes(el, attrNameAndValues);
    return el;
  }

  mergeElement(dynamic existing, List<String> attrNameAndValues) {
    DOM.clearNodes(existing);
    this._setAttributes(existing, attrNameAndValues);
  }

  _setAttributes(dynamic el, List<String> attrNameAndValues) {
    for (var attrIdx = 0; attrIdx < attrNameAndValues.length; attrIdx += 2) {
      DOM.setAttribute(
          el, attrNameAndValues[attrIdx], attrNameAndValues[attrIdx + 1]);
    }
  }

  dynamic createShadowRoot(dynamic host, String templateId) {
    var root = DOM.createElement("shadow-root");
    DOM.appendChild(host, root);
    return root;
  }

  dynamic createText(String value) {
    return DOM.createTextNode(isPresent(value) ? value : "");
  }

  dynamic createRootContentInsertionPoint() {
    return DOM.createElement("root-content-insertion-point");
  }

  appendChild(dynamic parent, dynamic child) {
    DOM.appendChild(parent, child);
  }

  on(dynamic element, String eventName, Function callback) {
    this
        ._localEventListeners
        .add(new LocalEventListener(element, eventName, callback));
  }

  Function globalOn(String target, String eventName, Function callback) {
    var listener = new GlobalEventListener(target, eventName, callback);
    this._globalEventListeners.add(listener);
    return () {
      var index = this._globalEventListeners.indexOf(listener);
      if (!identical(index, -1)) {
        ListWrapper.splice(this._globalEventListeners, index, 1);
      }
    };
  }
}

class LocalEventListener {
  dynamic element;
  String eventName;
  Function callback;
  LocalEventListener(this.element, this.eventName, this.callback) {}
}

class GlobalEventListener {
  String target;
  String eventName;
  Function callback;
  GlobalEventListener(this.target, this.eventName, this.callback) {}
}

stringifyFragment(List<dynamic> nodes) {
  return nodes.map(stringifyElement).toList().join("");
}

List<String> mapAttrs(List<dynamic> nodes, attrName) {
  return nodes.map((node) => DOM.getAttribute(node, attrName)).toList();
}

List<String> mapText(List<dynamic> nodes) {
  return nodes.map((node) => DOM.getText(node)).toList();
}
