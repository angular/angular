library angular2.src.compiler.app_root_url;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show isBlank;

/**
 * Specifies app root url for the application.
 *
 * Used by the [Compiler] when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See [Compiler]
 */
@Injectable()
class AppRootUrl {
  String value;
  AppRootUrl(this.value) {}
}
