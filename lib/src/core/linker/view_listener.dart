library angular2.src.core.linker.view_listener;

import "package:angular2/src/core/di.dart" show Injectable;
import "view.dart" as viewModule;

/**
 * Listener for view creation / destruction.
 */
@Injectable()
class AppViewListener {
  onViewCreated(viewModule.AppView view) {}
  onViewDestroyed(viewModule.AppView view) {}
}
