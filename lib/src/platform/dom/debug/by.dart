library angular2.src.platform.dom.debug.by;

import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show Predicate;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart" show DebugElement;

/**
 * Predicates for use with [DebugElement]'s query functions.
 */
class By {
  /**
   * Match all elements.
   *
   * ## Example
   *
   * {@example platform/dom/debug/ts/by/by.ts region='by_all'}
   */
  static Predicate<DebugElement> all() {
    return (debugElement) => true;
  }

  /**
   * Match elements by the given CSS selector.
   *
   * ## Example
   *
   * {@example platform/dom/debug/ts/by/by.ts region='by_css'}
   */
  static Predicate<DebugElement> css(String selector) {
    return (debugElement) {
      return isPresent(debugElement.nativeElement)
          ? DOM.elementMatches(debugElement.nativeElement, selector)
          : false;
    };
  }

  /**
   * Match elements that have the given directive present.
   *
   * ## Example
   *
   * {@example platform/dom/debug/ts/by/by.ts region='by_directive'}
   */
  static Predicate<DebugElement> directive(Type type) {
    return (debugElement) {
      return debugElement.hasDirective(type);
    };
  }
}
