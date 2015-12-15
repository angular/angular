library angular2.src.mock.mock_application_ref;

import "package:angular2/src/core/application_ref.dart" show ApplicationRef;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show ComponentRef;
import "package:angular2/src/core/di.dart" show Provider, Injector;
import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/async.dart" show Future;

/**
 * A no-op implementation of [ApplicationRef], useful for testing.
 */
@Injectable()
class MockApplicationRef extends ApplicationRef {
  void registerBootstrapListener(
      dynamic /* (ref: ComponentRef) => void */ listener) {}
  void registerDisposeListener(dynamic /* () => void */ dispose) {}
  Future<ComponentRef> bootstrap(Type componentType,
      [List<dynamic /* Type | Provider | List < dynamic > */ > bindings]) {
    return null;
  }

  Injector get injector {
    return null;
  }

  NgZone get zone {
    return null;
  }

  void dispose() {}
  void tick() {}
  List<Type> get componentTypes {
    return null;
  }
}
