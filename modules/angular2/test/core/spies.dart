library core.spies;

import 'package:angular2/core.dart';
import 'package:angular2/src/core/di/injector.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/core/compiler/directive_resolver.dart';
import 'package:angular2/src/core/compiler/view.dart';
import 'package:angular2/src/core/compiler/element_ref.dart';
import 'package:angular2/src/core/compiler/view_manager.dart';
import 'package:angular2/src/core/compiler/proto_view_factory.dart';
import 'package:angular2/src/core/compiler/view_pool.dart';
import 'package:angular2/src/core/compiler/view_listener.dart';
import 'package:angular2/src/core/compiler/element_injector.dart';
import 'package:angular2/src/core/dom/dom_adapter.dart';
import 'package:angular2/test_lib.dart';
import 'package:angular2/src/core/render/xhr.dart';

@proxy
class SpyDependencyProvider extends SpyObject implements DependencyProvider {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyChangeDetector extends SpyObject implements ChangeDetector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyChangeDispatcher extends SpyObject implements ChangeDispatcher {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyIterableDifferFactory extends SpyObject
    implements IterableDifferFactory {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyInjector extends SpyObject implements Injector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyDirectiveResolver extends SpyObject implements DirectiveResolver {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyView extends SpyObject implements AppView {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyElementRef extends SpyObject implements ElementRef {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyAppViewManager extends SpyObject implements AppViewManager {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyRenderer extends SpyObject implements Renderer {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyAppViewPool extends SpyObject implements AppViewPool {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyAppViewListener extends SpyObject implements AppViewListener {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyProtoViewFactory extends SpyObject implements ProtoViewFactory {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyProtoElementInjector extends SpyObject implements ProtoElementInjector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyElementInjector extends SpyObject implements ElementInjector {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyPreBuiltObjects extends SpyObject implements PreBuiltObjects {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyDomAdapter extends SpyObject implements DomAdapter {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyXHR extends SpyObject implements XHR {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyRenderEventDispatcher extends SpyObject implements RenderEventDispatcher {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyNgControl extends SpyObject implements NgControl {
  noSuchMethod(m) => super.noSuchMethod(m);
}

@proxy
class SpyValueAccessor extends SpyObject implements ControlValueAccessor {
  noSuchMethod(m) => super.noSuchMethod(m);
}
