library angular2.src.core.linker.element_binder;

import "package:angular2/src/facade/lang.dart" show isBlank;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "element_injector.dart" as eiModule;
import "element_injector.dart" show DirectiveProvider;
import "view.dart" as viewModule;

class ElementBinder {
  num index;
  ElementBinder parent;
  num distanceToParent;
  eiModule.ProtoElementInjector protoElementInjector;
  DirectiveProvider componentDirective;
  viewModule.AppProtoView nestedProtoView;
  ElementBinder(
      this.index,
      this.parent,
      this.distanceToParent,
      this.protoElementInjector,
      this.componentDirective,
      this.nestedProtoView) {
    if (isBlank(index)) {
      throw new BaseException("null index not allowed.");
    }
  }
}
