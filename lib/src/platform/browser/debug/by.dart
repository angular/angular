library angular2.src.platform.browser.debug.by;

import "package:angular2/src/facade/lang.dart" show Type, isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show Predicate;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart" show DebugElement;

class By {
  static Function all() {
    return (debugElement) => true;
  }

  static Predicate<DebugElement> css(String selector) {
    return (debugElement) {
      return isPresent(debugElement.nativeElement)
          ? DOM.elementMatches(debugElement.nativeElement, selector)
          : false;
    };
  }

  static Predicate<DebugElement> directive(Type type) {
    return (debugElement) {
      return debugElement.hasDirective(type);
    };
  }
}
