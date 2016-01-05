library angular2.src.core.debug.debug_element;

import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, MapWrapper, Predicate;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/core/linker/element.dart" show AppElement;
import "package:angular2/src/core/linker/view.dart" show AppView;
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
  AppElement _appElement;
  DebugElement_(this._appElement) : super() {
    /* super call moved to initializer */;
  }
  dynamic get componentInstance {
    if (!isPresent(this._appElement)) {
      return null;
    }
    return this._appElement.getComponent();
  }

  dynamic get nativeElement {
    return this.elementRef.nativeElement;
  }

  ElementRef get elementRef {
    return this._appElement.ref;
  }

  dynamic getDirectiveInstance(num directiveIndex) {
    return this._appElement.getDirectiveAtIndex(directiveIndex);
  }

  List<DebugElement> get children {
    return this
        ._getChildElements(this._appElement.parentView, this._appElement);
  }

  List<DebugElement> get componentViewChildren {
    if (!isPresent(this._appElement.componentView)) {
      // The current element is not a component.
      return [];
    }
    return this._getChildElements(this._appElement.componentView, null);
  }

  void triggerEventHandler(String eventName, dynamic eventObj) {
    this._appElement.parentView.triggerEventHandlers(
        eventName, eventObj, this._appElement.proto.index);
  }

  bool hasDirective(Type type) {
    if (!isPresent(this._appElement)) {
      return false;
    }
    return this._appElement.hasDirective(type);
  }

  dynamic inject(Type type) {
    if (!isPresent(this._appElement)) {
      return null;
    }
    return this._appElement.get(type);
  }

  dynamic getLocal(String name) {
    return this._appElement.parentView.locals.get(name);
  }

  /** @internal */
  List<DebugElement> _getChildElements(
      AppView view, AppElement parentAppElement) {
    var els = [];
    for (var i = 0; i < view.appElements.length; ++i) {
      var appEl = view.appElements[i];
      if (appEl.parent == parentAppElement) {
        els.add(new DebugElement_(appEl));
        var views = appEl.nestedViews;
        if (isPresent(views)) {
          views.forEach((nextView) {
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
  return new DebugElement_(((elementRef as ElementRef_)).internalElement);
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
