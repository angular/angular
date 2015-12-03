library angular2.src.mock.mock_location_strategy;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/src/router/location_strategy.dart"
    show LocationStrategy;

@Injectable()
class MockLocationStrategy extends LocationStrategy {
  String internalBaseHref = "/";
  String internalPath = "/";
  String internalTitle = "";
  List<String> urlChanges = [];
  /** @internal */
  EventEmitter<dynamic> _subject = new EventEmitter();
  MockLocationStrategy() : super() {
    /* super call moved to initializer */;
  }
  void simulatePopState(String url) {
    this.internalPath = url;
    ObservableWrapper.callEmit(this._subject, null);
  }

  String path() {
    return this.internalPath;
  }

  String prepareExternalUrl(String internal) {
    if (internal.startsWith("/") && this.internalBaseHref.endsWith("/")) {
      return this.internalBaseHref + internal.substring(1);
    }
    return this.internalBaseHref + internal;
  }

  void simulateUrlPop(String pathname) {
    ObservableWrapper.callEmit(this._subject, {"url": pathname});
  }

  void pushState(dynamic ctx, String title, String path, String query) {
    this.internalTitle = title;
    var url = path + (query.length > 0 ? ("?" + query) : "");
    this.internalPath = url;
    var external = this.prepareExternalUrl(url);
    this.urlChanges.add(external);
  }

  void onPopState(dynamic /* (value: any) => void */ fn) {
    ObservableWrapper.subscribe(this._subject, fn);
  }

  String getBaseHref() {
    return this.internalBaseHref;
  }

  void back() {
    if (this.urlChanges.length > 0) {
      this.urlChanges.removeLast();
      var nextUrl = this.urlChanges.length > 0
          ? this.urlChanges[this.urlChanges.length - 1]
          : "";
      this.simulatePopState(nextUrl);
    }
  }

  void forward() {
    throw "not implemented";
  }
}
