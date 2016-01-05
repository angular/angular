library angular2.src.platform.dom.dom_renderer;

import "package:angular2/src/core/di.dart" show Inject, Injectable, OpaqueToken;
import "package:angular2/src/animate/animation_builder.dart"
    show AnimationBuilder;
import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
        isBlank,
        Json,
        RegExpWrapper,
        stringify,
        StringWrapper,
        isArray;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "shared_styles_host.dart" show DomSharedStylesHost;
import "package:angular2/core.dart"
    show Renderer, RootRenderer, RenderComponentType;
import "events/event_manager.dart" show EventManager;
import "dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/core/metadata.dart" show ViewEncapsulation;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "util.dart" show camelCaseToDashCase;

const NAMESPACE_URIS = const {
  "xlink": "http://www.w3.org/1999/xlink",
  "svg": "http://www.w3.org/2000/svg"
};
const TEMPLATE_COMMENT_TEXT = "template bindings={}";
var TEMPLATE_BINDINGS_EXP = new RegExp(r'^template bindings=(.*)$');

abstract class DomRootRenderer implements RootRenderer {
  dynamic document;
  EventManager eventManager;
  DomSharedStylesHost sharedStylesHost;
  AnimationBuilder animate;
  Map<String, DomRenderer> _registeredComponents =
      new Map<String, DomRenderer>();
  DomRootRenderer(
      this.document, this.eventManager, this.sharedStylesHost, this.animate) {}
  Renderer renderComponent(RenderComponentType componentProto) {
    var renderer = this._registeredComponents[componentProto.id];
    if (isBlank(renderer)) {
      renderer = new DomRenderer(this, componentProto);
      this._registeredComponents[componentProto.id] = renderer;
    }
    return renderer;
  }
}

@Injectable()
class DomRootRenderer_ extends DomRootRenderer {
  DomRootRenderer_(
      @Inject(DOCUMENT) dynamic _document,
      EventManager _eventManager,
      DomSharedStylesHost sharedStylesHost,
      AnimationBuilder animate)
      : super(_document, _eventManager, sharedStylesHost, animate) {
    /* super call moved to initializer */;
  }
}

class DomRenderer implements Renderer {
  DomRootRenderer _rootRenderer;
  RenderComponentType componentProto;
  String _contentAttr;
  String _hostAttr;
  List<String> _styles;
  DomRenderer(this._rootRenderer, this.componentProto) {
    this._styles = _flattenStyles(componentProto.id, componentProto.styles, []);
    if (!identical(componentProto.encapsulation, ViewEncapsulation.Native)) {
      this._rootRenderer.sharedStylesHost.addStyles(this._styles);
    }
    if (identical(
        this.componentProto.encapsulation, ViewEncapsulation.Emulated)) {
      this._contentAttr = _shimContentAttribute(componentProto.id);
      this._hostAttr = _shimHostAttribute(componentProto.id);
    } else {
      this._contentAttr = null;
      this._hostAttr = null;
    }
  }
  Renderer renderComponent(RenderComponentType componentProto) {
    return this._rootRenderer.renderComponent(componentProto);
  }

  dynamic selectRootElement(String selector) {
    var el = DOM.querySelector(this._rootRenderer.document, selector);
    if (isBlank(el)) {
      throw new BaseException(
          '''The selector "${ selector}" did not match any elements''');
    }
    DOM.clearNodes(el);
    return el;
  }

  dynamic createElement(dynamic parent, String name) {
    var nsAndName = splitNamespace(name);
    var el = isPresent(nsAndName[0])
        ? DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1])
        : DOM.createElement(nsAndName[1]);
    if (isPresent(this._contentAttr)) {
      DOM.setAttribute(el, this._contentAttr, "");
    }
    if (isPresent(parent)) {
      DOM.appendChild(parent, el);
    }
    return el;
  }

  dynamic createViewRoot(dynamic hostElement) {
    var nodesParent;
    if (identical(
        this.componentProto.encapsulation, ViewEncapsulation.Native)) {
      nodesParent = DOM.createShadowRoot(hostElement);
      this._rootRenderer.sharedStylesHost.addHost(nodesParent);
      for (var i = 0; i < this._styles.length; i++) {
        DOM.appendChild(nodesParent, DOM.createStyleElement(this._styles[i]));
      }
    } else {
      if (isPresent(this._hostAttr)) {
        DOM.setAttribute(hostElement, this._hostAttr, "");
      }
      nodesParent = hostElement;
    }
    return nodesParent;
  }

  dynamic createTemplateAnchor(dynamic parentElement) {
    var comment = DOM.createComment(TEMPLATE_COMMENT_TEXT);
    if (isPresent(parentElement)) {
      DOM.appendChild(parentElement, comment);
    }
    return comment;
  }

  dynamic createText(dynamic parentElement, String value) {
    var node = DOM.createTextNode(value);
    if (isPresent(parentElement)) {
      DOM.appendChild(parentElement, node);
    }
    return node;
  }

  projectNodes(dynamic parentElement, List<dynamic> nodes) {
    if (isBlank(parentElement)) return;
    appendNodes(parentElement, nodes);
  }

  attachViewAfter(dynamic node, List<dynamic> viewRootNodes) {
    moveNodesAfterSibling(node, viewRootNodes);
    for (var i = 0;
        i < viewRootNodes.length;
        i++) this.animateNodeEnter(viewRootNodes[i]);
  }

  detachView(List<dynamic> viewRootNodes) {
    for (var i = 0; i < viewRootNodes.length; i++) {
      var node = viewRootNodes[i];
      DOM.remove(node);
      this.animateNodeLeave(node);
    }
  }

  destroyView(dynamic hostElement, List<dynamic> viewAllNodes) {
    if (identical(
            this.componentProto.encapsulation, ViewEncapsulation.Native) &&
        isPresent(hostElement)) {
      this
          ._rootRenderer
          .sharedStylesHost
          .removeHost(DOM.getShadowRoot(hostElement));
    }
  }

  listen(dynamic renderElement, String name, Function callback) {
    this._rootRenderer.eventManager.addEventListener(
        renderElement, name, decoratePreventDefault(callback));
  }

  Function listenGlobal(String target, String name, Function callback) {
    return this
        ._rootRenderer
        .eventManager
        .addGlobalEventListener(target, name, decoratePreventDefault(callback));
  }

  void setElementProperty(
      dynamic renderElement, String propertyName, dynamic propertyValue) {
    DOM.setProperty(renderElement, propertyName, propertyValue);
  }

  void setElementAttribute(
      dynamic renderElement, String attributeName, String attributeValue) {
    var attrNs;
    var nsAndName = splitNamespace(attributeName);
    if (isPresent(nsAndName[0])) {
      attributeName = nsAndName[0] + ":" + nsAndName[1];
      attrNs = NAMESPACE_URIS[nsAndName[0]];
    }
    if (isPresent(attributeValue)) {
      if (isPresent(attrNs)) {
        DOM.setAttributeNS(
            renderElement, attrNs, attributeName, attributeValue);
      } else {
        DOM.setAttribute(renderElement, nsAndName[1], attributeValue);
      }
    } else {
      DOM.removeAttribute(renderElement, attributeName);
    }
  }

  void setBindingDebugInfo(
      dynamic renderElement, String propertyName, String propertyValue) {
    var dashCasedPropertyName = camelCaseToDashCase(propertyName);
    if (DOM.isCommentNode(renderElement)) {
      var existingBindings = RegExpWrapper.firstMatch(
          TEMPLATE_BINDINGS_EXP,
          StringWrapper.replaceAll(
              DOM.getText(renderElement), new RegExp(r'\n'), ""));
      var parsedBindings = Json.parse(existingBindings[1]);
      parsedBindings[dashCasedPropertyName] = propertyValue;
      DOM.setText(
          renderElement,
          StringWrapper.replace(
              TEMPLATE_COMMENT_TEXT, "{}", Json.stringify(parsedBindings)));
    } else {
      this.setElementAttribute(renderElement, propertyName, propertyValue);
    }
  }

  void setElementClass(dynamic renderElement, String className, bool isAdd) {
    if (isAdd) {
      DOM.addClass(renderElement, className);
    } else {
      DOM.removeClass(renderElement, className);
    }
  }

  void setElementStyle(
      dynamic renderElement, String styleName, String styleValue) {
    if (isPresent(styleValue)) {
      DOM.setStyle(renderElement, styleName, stringify(styleValue));
    } else {
      DOM.removeStyle(renderElement, styleName);
    }
  }

  void invokeElementMethod(
      dynamic renderElement, String methodName, List<dynamic> args) {
    DOM.invoke(renderElement, methodName, args);
  }

  void setText(dynamic renderNode, String text) {
    DOM.setText(renderNode, text);
  }

  /**
   * Performs animations if necessary
   * @param node
   */
  animateNodeEnter(dynamic node) {
    if (DOM.isElementNode(node) && DOM.hasClass(node, "ng-animate")) {
      DOM.addClass(node, "ng-enter");
      this
          ._rootRenderer
          .animate
          .css()
          .addAnimationClass("ng-enter-active")
          .start((node as dynamic))
          .onComplete(() {
        DOM.removeClass(node, "ng-enter");
      });
    }
  }

  /**
   * If animations are necessary, performs animations then removes the element; otherwise, it just
   * removes the element.
   * @param node
   */
  animateNodeLeave(dynamic node) {
    if (DOM.isElementNode(node) && DOM.hasClass(node, "ng-animate")) {
      DOM.addClass(node, "ng-leave");
      this
          ._rootRenderer
          .animate
          .css()
          .addAnimationClass("ng-leave-active")
          .start((node as dynamic))
          .onComplete(() {
        DOM.removeClass(node, "ng-leave");
        DOM.remove(node);
      });
    } else {
      DOM.remove(node);
    }
  }
}

moveNodesAfterSibling(sibling, nodes) {
  var parent = DOM.parentElement(sibling);
  if (nodes.length > 0 && isPresent(parent)) {
    var nextSibling = DOM.nextSibling(sibling);
    if (isPresent(nextSibling)) {
      for (var i = 0; i < nodes.length; i++) {
        DOM.insertBefore(nextSibling, nodes[i]);
      }
    } else {
      for (var i = 0; i < nodes.length; i++) {
        DOM.appendChild(parent, nodes[i]);
      }
    }
  }
}

appendNodes(parent, nodes) {
  for (var i = 0; i < nodes.length; i++) {
    DOM.appendChild(parent, nodes[i]);
  }
}

Function decoratePreventDefault(Function eventHandler) {
  return (event) {
    var allowDefaultBehavior = eventHandler(event);
    if (identical(allowDefaultBehavior, false)) {
      // TODO(tbosch): move preventDefault into event plugins...
      DOM.preventDefault(event);
    }
  };
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

List<String> _flattenStyles(
    String compId,
    List<dynamic /* dynamic | List < dynamic > */ > styles,
    List<String> target) {
  for (var i = 0; i < styles.length; i++) {
    var style = styles[i];
    if (isArray(style)) {
      _flattenStyles(compId, style, target);
    } else {
      style = StringWrapper.replaceAll(style, COMPONENT_REGEX, compId);
      target.add(style);
    }
  }
  return target;
}

var NS_PREFIX_RE = new RegExp(r'^@([^:]+):(.+)');
List<String> splitNamespace(String name) {
  if (name[0] != "@") {
    return [null, name];
  }
  var match = RegExpWrapper.firstMatch(NS_PREFIX_RE, name);
  return [match[1], match[2]];
}
