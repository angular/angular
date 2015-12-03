library angular2.src.mock.location_mock;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/router/location.dart" show Location;

@Injectable()
class SpyLocation implements Location {
  List<String> urlChanges = [];
  /** @internal */
  String _path = "";
  /** @internal */
  String _query = "";
  /** @internal */
  EventEmitter<dynamic> _subject = new EventEmitter();
  /** @internal */
  String _baseHref = "";
  setInitialPath(String url) {
    this._path = url;
  }

  setBaseHref(String url) {
    this._baseHref = url;
  }

  String path() {
    return this._path;
  }

  simulateUrlPop(String pathname) {
    ObservableWrapper.callEmit(this._subject, {"url": pathname});
  }

  String prepareExternalUrl(String url) {
    if (url.length > 0 && !url.startsWith("/")) {
      url = "/" + url;
    }
    return this._baseHref + url;
  }

  go(String path, [String query = ""]) {
    path = this.prepareExternalUrl(path);
    if (this._path == path && this._query == query) {
      return;
    }
    this._path = path;
    this._query = query;
    var url = path + (query.length > 0 ? ("?" + query) : "");
    this.urlChanges.add(url);
  }

  forward() {}
  back() {}
  Object subscribe(dynamic /* (value: any) => void */ onNext,
      [dynamic /* (error: any) => void */ onThrow = null,
      dynamic /* () => void */ onReturn = null]) {
    return ObservableWrapper.subscribe(
        this._subject, onNext, onThrow, onReturn);
  }

  // TODO: remove these once Location is an interface, and can be implemented cleanly
  dynamic platformStrategy = null;
  String normalize(String url) {
    return null;
  }
}
