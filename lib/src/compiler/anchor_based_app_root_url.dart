library angular2.src.compiler.anchor_based_app_root_url;

import "package:angular2/src/compiler/app_root_url.dart" show AppRootUrl;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/core/di.dart" show Injectable;

/**
 * Extension of [AppRootUrl] that uses a DOM anchor tag to set the root url to
 * the current page's url.
 */
@Injectable()
class AnchorBasedAppRootUrl extends AppRootUrl {
  AnchorBasedAppRootUrl() : super("") {
    /* super call moved to initializer */;
    // compute the root url to pass to AppRootUrl
    var a = DOM.createElement("a");
    DOM.resolveAndSetHref(a, "./", null);
    this.value = DOM.getHref(a);
  }
}
