library core.spies;

import 'package:angular2/core.dart';
import 'package:angular2/src/core/di/injector.dart';
import 'package:angular2/src/core/change_detection/change_detection.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/core/linker/directive_resolver.dart';
import 'package:angular2/src/core/linker/view.dart';
import 'package:angular2/src/core/linker/element_ref.dart';
import 'package:angular2/src/core/linker/view_manager.dart';
import 'package:angular2/src/platform/dom/dom_adapter.dart';
import 'package:angular2/testing_internal.dart';

@proxy
class SpyDependencyProvider extends SpyObject implements DependencyProvider {}

@proxy
class SpyChangeDetector extends SpyObject implements ChangeDetector {}

@proxy
class SpyChangeDispatcher extends SpyObject implements ChangeDispatcher {}

@proxy
class SpyIterableDifferFactory extends SpyObject
    implements IterableDifferFactory {}

@proxy
class SpyInjector extends SpyObject implements Injector {}

@proxy
class SpyDirectiveResolver extends SpyObject implements DirectiveResolver {}

@proxy
class SpyView extends SpyObject implements AppView {}

@proxy
class SpyProtoView extends SpyObject implements AppProtoView {}

@proxy
class SpyHostViewFactory extends SpyObject implements HostViewFactory {}

@proxy
class SpyElementRef extends SpyObject implements ElementRef {}

@proxy
class SpyAppViewManager extends SpyObject implements AppViewManager_ {}

@proxy
class SpyRenderer extends SpyObject implements Renderer {}

@proxy
class SpyRootRenderer extends SpyObject implements RootRenderer {}

@proxy
class SpyDomAdapter extends SpyObject implements DomAdapter {}
