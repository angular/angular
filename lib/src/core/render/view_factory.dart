library angular2.src.core.render.view_factory;

import "package:angular2/src/facade/lang.dart"
    show isBlank, isPresent, StringWrapper;
import "api.dart"
    show
        RenderEventDispatcher,
        RenderTemplateCmd,
        RenderCommandVisitor,
        RenderBeginElementCmd,
        RenderBeginComponentCmd,
        RenderNgContentCmd,
        RenderTextCmd,
        RenderEmbeddedTemplateCmd,
        RenderComponentTemplate;
import "view.dart" show DefaultRenderView, DefaultRenderFragmentRef;
import "package:angular2/src/core/metadata.dart" show ViewEncapsulation;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

List<String> encapsulateStyles(RenderComponentTemplate componentTemplate) {
  var processedStyles = componentTemplate.styles;
  if (identical(componentTemplate.encapsulation, ViewEncapsulation.Emulated)) {
    processedStyles =
        ListWrapper.createFixedSize(componentTemplate.styles.length);
    for (var i = 0; i < componentTemplate.styles.length; i++) {
      processedStyles[i] = StringWrapper.replaceAll(componentTemplate.styles[i],
          COMPONENT_REGEX, componentTemplate.shortId);
    }
  }
  return processedStyles;
}

DefaultRenderView<dynamic> createRenderView(
    RenderComponentTemplate componentTemplate,
    List<RenderTemplateCmd> cmds,
    dynamic inplaceElement,
    NodeFactory<dynamic> nodeFactory) {
  DefaultRenderView<dynamic> view;
  var eventDispatcher = (num boundElementIndex, String eventName,
          dynamic event) =>
      view.dispatchRenderEvent(boundElementIndex, eventName, event);
  var context = new BuildContext(eventDispatcher, nodeFactory, inplaceElement);
  context.build(componentTemplate, cmds);
  List<DefaultRenderFragmentRef<dynamic>> fragments = [];
  for (var i = 0; i < context.fragments.length; i++) {
    fragments.add(new DefaultRenderFragmentRef(context.fragments[i]));
  }
  view = new DefaultRenderView<dynamic>(
      fragments,
      context.boundTextNodes,
      context.boundElements,
      context.nativeShadowRoots,
      context.globalEventAdders,
      context.rootContentInsertionPoints);
  return view;
}

abstract class NodeFactory<N> {
  RenderComponentTemplate resolveComponentTemplate(String templateId);
  N createTemplateAnchor(List<String> attrNameAndValues);
  N createElement(String name, List<String> attrNameAndValues);
  N createRootContentInsertionPoint();
  mergeElement(N existing, List<String> attrNameAndValues);
  N createShadowRoot(N host, String templateId);
  N createText(String value);
  appendChild(N parent, N child);
  on(N element, String eventName, Function callback);
  Function globalOn(String target, String eventName, Function callback);
}

class BuildContext<N> {
  Function _eventDispatcher;
  NodeFactory<N> factory;
  N _inplaceElement;
  BuildContext(this._eventDispatcher, this.factory, this._inplaceElement) {
    this.isHost = isPresent((_inplaceElement));
  }
  List<RenderViewBuilder<N>> _builders = [];
  List<Function> globalEventAdders = [];
  List<N> boundElements = [];
  List<N> boundTextNodes = [];
  List<N> nativeShadowRoots = [];
  List<List<N>> fragments = [];
  List<N> rootContentInsertionPoints = [];
  num componentCount = 0;
  bool isHost;
  build(RenderComponentTemplate template, List<RenderTemplateCmd> cmds) {
    this.enqueueRootBuilder(template, cmds);
    this._build(this._builders[0]);
  }

  _build(RenderViewBuilder<N> builder) {
    this._builders = [];
    builder.build(this);
    var enqueuedBuilders = this._builders;
    for (var i = 0; i < enqueuedBuilders.length; i++) {
      this._build(enqueuedBuilders[i]);
    }
  }

  enqueueComponentBuilder(Component<N> component) {
    this.componentCount++;
    this._builders.add(new RenderViewBuilder<N>(
        component, null, component.template, component.template.commands));
  }

  enqueueFragmentBuilder(
      Component<N> parentComponent,
      RenderComponentTemplate parentTemplate,
      List<RenderTemplateCmd> commands) {
    var rootNodes = [];
    this.fragments.add(rootNodes);
    this._builders.add(new RenderViewBuilder<N>(
        parentComponent, rootNodes, parentTemplate, commands));
  }

  enqueueRootBuilder(
      RenderComponentTemplate template, List<RenderTemplateCmd> cmds) {
    var rootNodes = [];
    this.fragments.add(rootNodes);
    this
        ._builders
        .add(new RenderViewBuilder<N>(null, rootNodes, template, cmds));
  }

  N consumeInplaceElement() {
    var result = this._inplaceElement;
    this._inplaceElement = null;
    return result;
  }

  addEventListener(num boundElementIndex, String target, String eventName) {
    if (isPresent(target)) {
      var handler = createEventHandler(boundElementIndex,
          '''${ target}:${ eventName}''', this._eventDispatcher);
      this.globalEventAdders.add(
          createGlobalEventAdder(target, eventName, handler, this.factory));
    } else {
      var handler = createEventHandler(
          boundElementIndex, eventName, this._eventDispatcher);
      this
          .factory
          .on(this.boundElements[boundElementIndex], eventName, handler);
    }
  }
}

Function createEventHandler(
    num boundElementIndex, String eventName, Function eventDispatcher) {
  return ($event) => eventDispatcher(boundElementIndex, eventName, $event);
}

Function createGlobalEventAdder(String target, String eventName,
    Function eventHandler, NodeFactory<dynamic> nodeFactory) {
  return () => nodeFactory.globalOn(target, eventName, eventHandler);
}

class RenderViewBuilder<N> implements RenderCommandVisitor {
  Component<N> parentComponent;
  List<N> fragmentRootNodes;
  RenderComponentTemplate template;
  List<RenderTemplateCmd> cmds;
  List<dynamic /* N | Component < N > */ > parentStack;
  RenderViewBuilder(
      this.parentComponent, this.fragmentRootNodes, this.template, this.cmds) {
    var rootNodesParent =
        isPresent(fragmentRootNodes) ? null : parentComponent.shadowRoot;
    this.parentStack = [rootNodesParent];
  }
  build(BuildContext<N> context) {
    var cmds = this.cmds;
    for (var i = 0; i < cmds.length; i++) {
      cmds[i].visit(this, context);
    }
  }

  dynamic /* N | Component < N > */ get parent {
    return this.parentStack[this.parentStack.length - 1];
  }

  dynamic visitText(RenderTextCmd cmd, BuildContext<N> context) {
    var text = context.factory.createText(cmd.value);
    this._addChild(text, cmd.ngContentIndex, context);
    if (cmd.isBound) {
      context.boundTextNodes.add(text);
    }
    return null;
  }

  dynamic visitNgContent(RenderNgContentCmd cmd, BuildContext<N> context) {
    if (isPresent(this.parentComponent)) {
      if (this.parentComponent.isRoot) {
        var insertionPoint = context.factory.createRootContentInsertionPoint();
        if (this.parent is Component) {
          context.factory.appendChild(
              ((this.parent as Component<N>)).shadowRoot, insertionPoint);
        } else {
          context.factory.appendChild((this.parent as N), insertionPoint);
        }
        context.rootContentInsertionPoints.add(insertionPoint);
      } else {
        var projectedNodes = this.parentComponent.project(cmd.index);
        for (var i = 0; i < projectedNodes.length; i++) {
          var node = projectedNodes[i];
          this._addChild(node, cmd.ngContentIndex, context);
        }
      }
    }
    return null;
  }

  dynamic visitBeginElement(
      RenderBeginElementCmd cmd, BuildContext<N> context) {
    this.parentStack.add(this._beginElement(cmd, context, null));
    return null;
  }

  dynamic visitEndElement(BuildContext<N> context) {
    this._endElement();
    return null;
  }

  dynamic visitBeginComponent(
      RenderBeginComponentCmd cmd, BuildContext<N> context) {
    var templateId = cmd.templateId;
    var tpl = context.factory.resolveComponentTemplate(templateId);
    var el = this._beginElement(cmd, context, tpl);
    var root = el;
    if (identical(tpl.encapsulation, ViewEncapsulation.Native)) {
      root = context.factory.createShadowRoot(el, templateId);
      context.nativeShadowRoots.add(root);
    }
    var isRoot = identical(context.componentCount, 0) && context.isHost;
    var component = new Component(el, root, isRoot, tpl);
    context.enqueueComponentBuilder(component);
    this.parentStack.add(component);
    return null;
  }

  dynamic visitEndComponent(BuildContext<N> context) {
    this._endElement();
    return null;
  }

  dynamic visitEmbeddedTemplate(
      RenderEmbeddedTemplateCmd cmd, BuildContext<N> context) {
    var el = context.factory.createTemplateAnchor(cmd.attrNameAndValues);
    this._addChild(el, cmd.ngContentIndex, context);
    context.boundElements.add(el);
    if (cmd.isMerged) {
      context.enqueueFragmentBuilder(
          this.parentComponent, this.template, cmd.children);
    }
    return null;
  }

  N _beginElement(RenderBeginElementCmd cmd, BuildContext<N> context,
      RenderComponentTemplate componentTemplate) {
    N el = context.consumeInplaceElement();
    var attrNameAndValues = cmd.attrNameAndValues;
    if (identical(this.template.encapsulation, ViewEncapsulation.Emulated)) {
      // Note: Need to clone attrNameAndValues to make it writable!
      if (isPresent(componentTemplate)) {
        attrNameAndValues = (new List.from(attrNameAndValues)
          ..addAll([
            _shimContentAttribute(this.template.shortId),
            "",
            _shimHostAttribute(componentTemplate.shortId),
            ""
          ]));
      } else {
        attrNameAndValues = (new List.from(attrNameAndValues)
          ..addAll([_shimContentAttribute(this.template.shortId), ""]));
      }
    }
    if (isPresent(el)) {
      context.factory.mergeElement(el, attrNameAndValues);
      this.fragmentRootNodes.add(el);
    } else {
      el = context.factory.createElement(cmd.name, attrNameAndValues);
      this._addChild(el, cmd.ngContentIndex, context);
    }
    if (cmd.isBound) {
      var boundElementIndex = context.boundElements.length;
      context.boundElements.add(el);
      for (var i = 0; i < cmd.eventTargetAndNames.length; i += 2) {
        var target = cmd.eventTargetAndNames[i];
        var eventName = cmd.eventTargetAndNames[i + 1];
        context.addEventListener(boundElementIndex, target, eventName);
      }
    }
    return el;
  }

  _endElement() {
    this.parentStack.removeLast();
  }

  _addChild(N node, num ngContentIndex, BuildContext<N> context) {
    var parent = this.parent;
    if (isPresent(parent)) {
      if (parent is Component) {
        parent.addContentNode(ngContentIndex, node, context);
      } else {
        context.factory.appendChild((parent as N), node);
      }
    } else {
      this.fragmentRootNodes.add(node);
    }
  }
}

class Component<N> {
  N hostElement;
  N shadowRoot;
  bool isRoot;
  RenderComponentTemplate template;
  List<List<N>> contentNodesByNgContentIndex = [];
  Component(this.hostElement, this.shadowRoot, this.isRoot, this.template) {}
  addContentNode(num ngContentIndex, N node, BuildContext<N> context) {
    if (isBlank(ngContentIndex)) {
      if (identical(this.template.encapsulation, ViewEncapsulation.Native)) {
        context.factory.appendChild(this.hostElement, node);
      }
    } else {
      while (this.contentNodesByNgContentIndex.length <= ngContentIndex) {
        this.contentNodesByNgContentIndex.add([]);
      }
      this.contentNodesByNgContentIndex[ngContentIndex].add(node);
    }
  }

  List<N> project(num ngContentIndex) {
    return ngContentIndex < this.contentNodesByNgContentIndex.length
        ? this.contentNodesByNgContentIndex[ngContentIndex]
        : [];
  }
}

var COMPONENT_REGEX = new RegExp(r'%COMP%');
const COMPONENT_VARIABLE = "%COMP%";
const HOST_ATTR = '''_nghost-${ COMPONENT_VARIABLE}''';
const CONTENT_ATTR = '''_ngcontent-${ COMPONENT_VARIABLE}''';
String _shimContentAttribute(String componentShortId) {
  return StringWrapper.replaceAll(
      CONTENT_ATTR, COMPONENT_REGEX, componentShortId);
}

String _shimHostAttribute(String componentShortId) {
  return StringWrapper.replaceAll(HOST_ATTR, COMPONENT_REGEX, componentShortId);
}
