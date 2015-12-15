library angular2.src.core.console;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show print;

@Injectable()
class Console {
  void log(String message) {
    print(message);
  }
}
