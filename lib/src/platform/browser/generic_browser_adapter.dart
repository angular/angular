library angular2.src.platform.browser.generic_browser_adapter;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/lang.dart" show isPresent, isFunction, Type;
import "package:angular2/src/platform/dom/dom_adapter.dart" show DomAdapter;
import "package:angular2/src/platform/browser/xhr_impl.dart" show XHRImpl;

/**
 * Provides DOM operations in any browser environment.
 */
abstract class GenericBrowserDomAdapter extends DomAdapter {
  String _animationPrefix = null;
  String _transitionEnd = null;
  GenericBrowserDomAdapter() : super() {
    /* super call moved to initializer */;
    try {
      var element = this.createElement("div", this.defaultDoc());
      if (isPresent(this.getStyle(element, "animationName"))) {
        this._animationPrefix = "";
      } else {
        var domPrefixes = ["Webkit", "Moz", "O", "ms"];
        for (var i = 0; i < domPrefixes.length; i++) {
          if (isPresent(
              this.getStyle(element, domPrefixes[i] + "AnimationName"))) {
            this._animationPrefix = "-" + domPrefixes[i].toLowerCase() + "-";
            break;
          }
        }
      }
      Map<String, String> transEndEventNames = {
        "WebkitTransition": "webkitTransitionEnd",
        "MozTransition": "transitionend",
        "OTransition": "oTransitionEnd otransitionend",
        "transition": "transitionend"
      };
      StringMapWrapper.forEach(transEndEventNames, (value, key) {
        if (isPresent(this.getStyle(element, key))) {
          this._transitionEnd = value;
        }
      });
    } catch (e, e_stack) {
      this._animationPrefix = null;
      this._transitionEnd = null;
    }
  }
  Type getXHR() {
    return XHRImpl;
  }

  List<dynamic> getDistributedNodes(dynamic el) {
    return ((el as dynamic)).getDistributedNodes();
  }

  resolveAndSetHref(dynamic el, String baseUrl, String href) {
    el.href = href == null ? baseUrl : baseUrl + "/../" + href;
  }

  bool supportsDOMEvents() {
    return true;
  }

  bool supportsNativeShadowDOM() {
    return isFunction(((this.defaultDoc().body as dynamic)).createShadowRoot);
  }

  String getAnimationPrefix() {
    return isPresent(this._animationPrefix) ? this._animationPrefix : "";
  }

  String getTransitionEnd() {
    return isPresent(this._transitionEnd) ? this._transitionEnd : "";
  }

  bool supportsAnimation() {
    return isPresent(this._animationPrefix) && isPresent(this._transitionEnd);
  }
}
