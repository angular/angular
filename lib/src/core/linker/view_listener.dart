library angular2.src.core.linker.view_listener;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type;
import "view.dart" as viewModule;

/**
 * Listener for view creation / destruction.
 */
@Injectable()
class AppViewListener {
  onViewCreated(viewModule.AppView view) {}
  onViewDestroyed(viewModule.AppView view) {}
}

/**
 * Proxy that allows to intercept component view factories.
 * This also works for precompiled templates, if they were
 * generated in development mode.
 */
@Injectable()
class ViewFactoryProxy {
  Function getComponentViewFactory(
      Type component, Function originalViewFactory) {
    return originalViewFactory;
  }
}
