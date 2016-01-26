library angular2.src.core.render.api;

import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;

class RenderComponentType {
  String id;
  ViewEncapsulation encapsulation;
  List<dynamic /* String | List < dynamic > */ > styles;
  RenderComponentType(this.id, this.encapsulation, this.styles) {}
}

abstract class ParentRenderer {
  Renderer renderComponent(RenderComponentType componentType);
}

abstract class Renderer implements ParentRenderer {
  Renderer renderComponent(RenderComponentType componentType);
  dynamic selectRootElement(String selector);
  dynamic createElement(dynamic parentElement, String name);
  dynamic createViewRoot(dynamic hostElement);
  dynamic createTemplateAnchor(dynamic parentElement);
  dynamic createText(dynamic parentElement, String value);
  projectNodes(dynamic parentElement, List<dynamic> nodes);
  attachViewAfter(dynamic node, List<dynamic> viewRootNodes);
  detachView(List<dynamic> viewRootNodes);
  destroyView(dynamic hostElement, List<dynamic> viewAllNodes);
  Function listen(dynamic renderElement, String name, Function callback);
  Function listenGlobal(String target, String name, Function callback);
  setElementProperty(
      dynamic renderElement, String propertyName, dynamic propertyValue);
  setElementAttribute(
      dynamic renderElement, String attributeName, String attributeValue);
  /**
   * Used only in debug mode to serialize property changes to comment nodes,
   * such as <template> placeholders.
   */
  setBindingDebugInfo(
      dynamic renderElement, String propertyName, String propertyValue);
  setElementClass(dynamic renderElement, String className, bool isAdd);
  setElementStyle(dynamic renderElement, String styleName, String styleValue);
  invokeElementMethod(
      dynamic renderElement, String methodName, List<dynamic> args);
  setText(dynamic renderNode, String text);
}

/**
 * Injectable service that provides a low-level interface for modifying the UI.
 *
 * Use this service to bypass Angular's templating and make custom UI changes that can't be
 * expressed declaratively. For example if you need to set a property or an attribute whose name is
 * not statically known, use [#setElementProperty] or [#setElementAttribute]
 * respectively.
 *
 * If you are implementing a custom renderer, you must implement this interface.
 *
 * The default Renderer implementation is `DomRenderer`. Also available is `WebWorkerRenderer`.
 */
abstract class RootRenderer implements ParentRenderer {
  Renderer renderComponent(RenderComponentType componentType);
}
