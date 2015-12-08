library angular2.src.router.platform_location;

import "package:angular2/src/platform/dom/dom_adapter.dart" show DOM;
import "package:angular2/core.dart" show Injectable;
import "package:angular2/src/facade/browser.dart"
    show EventListener, History, Location;

/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * [Location].
 */
@Injectable()
class PlatformLocation {
  Location _location;
  History _history;
  PlatformLocation() {
    this._init();
  }
  // This is moved to its own method so that `MockPlatformLocationStrategy` can overwrite it

  /** @internal */
  _init() {
    this._location = DOM.getLocation();
    this._history = DOM.getHistory();
  }

  String getBaseHrefFromDOM() {
    return DOM.getBaseHref();
  }

  void onPopState(EventListener fn) {
    DOM.getGlobalEventTarget("window").addEventListener("popstate", fn, false);
  }

  void onHashChange(EventListener fn) {
    DOM
        .getGlobalEventTarget("window")
        .addEventListener("hashchange", fn, false);
  }

  String get pathname {
    return this._location.pathname;
  }

  String get search {
    return this._location.search;
  }

  String get hash {
    return this._location.hash;
  }

  set pathname(String newPath) {
    this._location.pathname = newPath;
  }

  void pushState(dynamic state, String title, String url) {
    this._history.pushState(state, title, url);
  }

  void forward() {
    this._history.forward();
  }

  void back() {
    this._history.back();
  }
}
