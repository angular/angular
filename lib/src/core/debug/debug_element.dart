library angular2.src.core.debug.debug_element;

import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, Predicate;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/core/linker/element_injector.dart"
    show ElementInjector;
import "package:angular2/src/core/linker/view.dart" show AppView, ViewType;
import "package:angular2/src/core/linker/view_ref.dart" show internalView;
import "package:angular2/src/core/linker/element_ref.dart"
    show ElementRef, ElementRef_;

/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 *
 * A DebugElement can be obtained from a [ComponentFixture] or from an
 * [ElementRef] via [inspectElement].
 */
abstract class DebugElement {
  /**
   * Return the instance of the component associated with this element, if any.
   */
  dynamic get componentInstance {
    return unimplemented();
  }

  /**
   * Return the native HTML element for this DebugElement.
   */
  dynamic get nativeElement {
    return unimplemented();
  }

  /**
   * Return an Angular [ElementRef] for this element.
   */
  ElementRef get elementRef {
    return unimplemented();
  }

  /**
   * Get the directive active for this element with the given index, if any.
   */
  dynamic getDirectiveInstance(num directiveIndex);
  /**
   * Get child DebugElements from within the Light DOM.
   *
   * @return {DebugElement[]}
   */
  List<DebugElement> get children {
    return unimplemented();
  }

  /**
   * Get the root DebugElement children of a component. Returns an empty
   * list if the current DebugElement is not a component root.
   *
   * @return {DebugElement[]}
   */
  List<DebugElement> get componentViewChildren {
    return unimplemented();
  }

  /**
   * Simulate an event from this element as if the user had caused
   * this event to fire from the page.
   */
  void triggerEventHandler(String eventName, dynamic eventObj);
  /**
   * Check whether the element has a directive with the given type.
   */
  bool hasDirective(Type type);
  /**
   * Inject the given type from the element injector.
   */
  dynamic inject(Type type);
  /**
   * Read a local variable from the element (e.g. one defined with `#variable`).
   */
  dynamic getLocal(String name);
  /**
   * Return the first descendant TestElement matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {DebugElement}
   */
  DebugElement query(Predicate<DebugElement> predicate,
      [Function scope = Scope.all]) {
    var results = this.queryAll(predicate, scope);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Return descendant TestElememts matching the given predicate
   * and scope.
   *
   * @param {Function: boolean} predicate
   * @param {Scope} scope
   *
   * @return {DebugElement[]}
   */
  List<DebugElement> queryAll(Predicate<DebugElement> predicate,
      [Function scope = Scope.all]) {
    List<dynamic> elementsInScope = scope(this);
    return elementsInScope.where(predicate).toList();
  }
}

class DebugElement_ extends DebugElement {
  AppView _parentView;
  num _boundElementIndex;
  /** @internal */
  ElementInjector _elementInjector;
  DebugElement_(this._parentView, this._boundElementIndex) : super() {
    /* super call moved to initializer */;
    this._elementInjector =
        this._parentView.elementInjectors[this._boundElementIndex];
  }
  dynamic get componentInstance {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.getComponent();
  }

  dynamic get nativeElement {
    return this.elementRef.nativeElement;
  }

  ElementRef get elementRef {
    return this._parentView.elementRefs[this._boundElementIndex];
  }

  dynamic getDirectiveInstance(num directiveIndex) {
    return this._elementInjector.getDirectiveAtIndex(directiveIndex);
  }

  List<DebugElement> get children {
    return this._getChildElements(this._parentView, this._boundElementIndex);
  }

  List<DebugElement> get componentViewChildren {
    var shadowView = this._parentView.getNestedView(this._boundElementIndex);
    if (!isPresent(shadowView) ||
        !identical(shadowView.proto.type, ViewType.COMPONENT)) {
      // The current element is not a component.
      return [];
    }
    return this._getChildElements(shadowView, null);
  }

  void triggerEventHandler(String eventName, dynamic eventObj) {
    this
        ._parentView
        .triggerEventHandlers(eventName, eventObj, this._boundElementIndex);
  }

  bool hasDirective(Type type) {
    if (!isPresent(this._elementInjector)) {
      return false;
    }
    return this._elementInjector.hasDirective(type);
  }

  dynamic inject(Type type) {
    if (!isPresent(this._elementInjector)) {
      return null;
    }
    return this._elementInjector.get(type);
  }

  dynamic getLocal(String name) {
    return this._parentView.locals.get(name);
  }

  /** @internal */
  List<DebugElement> _getChildElements(
      AppView view, num parentBoundElementIndex) {
    var els = [];
    var parentElementBinder = null;
    if (isPresent(parentBoundElementIndex)) {
      parentElementBinder = view.proto.elementBinders[
          parentBoundElementIndex - view.elementOffset];
    }
    for (var i = 0; i < view.proto.elementBinders.length; ++i) {
      var binder = view.proto.elementBinders[i];
      if (binder.parent == parentElementBinder) {
        els.add(new DebugElement_(view, view.elementOffset + i));
        var views = view.viewContainers[view.elementOffset + i];
        if (isPresent(views)) {
          views.views.forEach((nextView) {
            els = (new List.from(els)
              ..addAll(this._getChildElements(nextView, null)));
          });
        }
      }
    }
    return els;
  }
}

/**
 * Returns a [DebugElement] for an [ElementRef].
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
DebugElement inspectElement(ElementRef elementRef) {
  return new DebugElement_(
      internalView(((elementRef as ElementRef_)).parentView),
      ((elementRef as ElementRef_)).boundElementIndex);
}

/**
 * Maps an array of [DebugElement]s to an array of native DOM elements.
 */
List<dynamic> asNativeElements(List<DebugElement> arr) {
  return arr.map((debugEl) => debugEl.nativeElement).toList();
}

/**
 * Set of scope functions used with [DebugElement]'s query functionality.
 */
class Scope {
  /**
   * Scope queries to both the light dom and view of an element and its
   * children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_all'}
   */
  static List<DebugElement> all(DebugElement debugElement) {
    var scope = [];
    scope.add(debugElement);
    debugElement.children.forEach(
        (child) => scope = (new List.from(scope)..addAll(Scope.all(child))));
    debugElement.componentViewChildren.forEach(
        (child) => scope = (new List.from(scope)..addAll(Scope.all(child))));
    return scope;
  }

  /**
   * Scope queries to the light dom of an element and its children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_light'}
   */
  static List<DebugElement> light(DebugElement debugElement) {
    var scope = [];
    debugElement.children.forEach((child) {
      scope.add(child);
      scope = (new List.from(scope)..addAll(Scope.light(child)));
    });
    return scope;
  }

  /**
   * Scope queries to the view of an element of its children.
   *
   * ## Example
   *
   * {@example core/debug/ts/debug_element/debug_element.ts region='scope_view'}
   */
  static List<DebugElement> view(DebugElement debugElement) {
    var scope = [];
    debugElement.componentViewChildren.forEach((child) {
      scope.add(child);
      scope = (new List.from(scope)..addAll(Scope.light(child)));
    });
    return scope;
  }
}
