library angular2.src.core.services.ruler;

import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/core/dom/dom_adapter.dart" show DomAdapter;
import "package:angular2/src/core/linker/element_ref.dart" show ElementRef;

class Rectangle {
  var left;
  var right;
  var top;
  var bottom;
  var height;
  var width;
  Rectangle(left, top, width, height) {
    this.left = left;
    this.right = left + width;
    this.top = top;
    this.bottom = top + height;
    this.height = height;
    this.width = width;
  }
}

class Ruler {
  DomAdapter domAdapter;
  Ruler(DomAdapter domAdapter) {
    this.domAdapter = domAdapter;
  }
  Future<Rectangle> measure(ElementRef el) {
    var clntRect =
        (this.domAdapter.getBoundingClientRect(el.nativeElement) as dynamic);
    // even if getBoundingClientRect is synchronous we use async API in preparation for further

    // changes
    return PromiseWrapper.resolve(new Rectangle(
        clntRect.left, clntRect.top, clntRect.width, clntRect.height));
  }
}
