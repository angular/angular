library angular2.src.web_workers.worker.platform_location;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/router/platform_location.dart"
    show PlatformLocation, UrlChangeEvent, UrlChangeListener;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show FnArg, UiArguments, ClientMessageBroker, ClientMessageBrokerFactory;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show ROUTER_CHANNEL;
import "package:angular2/src/web_workers/shared/serialized_types.dart"
    show LocationType;
import "package:angular2/src/facade/async.dart"
    show Future, PromiseWrapper, EventEmitter, ObservableWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show PRIMITIVE, Serializer;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/facade/lang.dart" show StringWrapper;
import "event_deserializer.dart" show deserializeGenericEvent;

@Injectable()
class WebWorkerPlatformLocation extends PlatformLocation {
  Serializer _serializer;
  ClientMessageBroker _broker;
  List<Function> _popStateListeners = [];
  List<Function> _hashChangeListeners = [];
  LocationType _location = null;
  EventEmitter<Object> _channelSource;
  WebWorkerPlatformLocation(ClientMessageBrokerFactory brokerFactory,
      MessageBus bus, this._serializer)
      : super() {
    /* super call moved to initializer */;
    this._broker = brokerFactory.createMessageBroker(ROUTER_CHANNEL);
    this._channelSource = bus.from(ROUTER_CHANNEL);
    ObservableWrapper.subscribe(this._channelSource,
        (Map<String, dynamic> msg) {
      List<Function> listeners = null;
      if (StringMapWrapper.contains(msg, "event")) {
        String type = msg["event"]["type"];
        if (StringWrapper.equals(type, "popstate")) {
          listeners = this._popStateListeners;
        } else if (StringWrapper.equals(type, "hashchange")) {
          listeners = this._hashChangeListeners;
        }
        if (!identical(listeners, null)) {
          var e = deserializeGenericEvent(msg["event"]);
          // There was a popState or hashChange event, so the location object thas been updated
          this._location =
              this._serializer.deserialize(msg["location"], LocationType);
          listeners.forEach((Function fn) => fn(e));
        }
      }
    });
  }
  /** @internal **/
  Future<bool> init() {
    UiArguments args = new UiArguments("getLocation");
    Future<LocationType> locationPromise =
        this._broker.runOnService(args, LocationType);
    return PromiseWrapper.then(locationPromise, /* bool */ (LocationType val) {
      this._location = val;
      return true;
    }, /* bool */ (err) {
      throw new BaseException(err);
    });
  }

  String getBaseHrefFromDOM() {
    throw new BaseException(
        "Attempt to get base href from DOM from WebWorker. You must either provide a value for the APP_BASE_HREF token through DI or use the hash location strategy.");
  }

  void onPopState(UrlChangeListener fn) {
    this._popStateListeners.add(fn);
  }

  void onHashChange(UrlChangeListener fn) {
    this._hashChangeListeners.add(fn);
  }

  String get pathname {
    if (identical(this._location, null)) {
      return null;
    }
    return this._location.pathname;
  }

  String get search {
    if (identical(this._location, null)) {
      return null;
    }
    return this._location.search;
  }

  String get hash {
    if (identical(this._location, null)) {
      return null;
    }
    return this._location.hash;
  }

  set pathname(String newPath) {
    if (identical(this._location, null)) {
      throw new BaseException(
          "Attempt to set pathname before value is obtained from UI");
    }
    this._location.pathname = newPath;
    var fnArgs = [new FnArg(newPath, PRIMITIVE)];
    var args = new UiArguments("setPathname", fnArgs);
    this._broker.runOnService(args, null);
  }

  void pushState(dynamic state, String title, String url) {
    var fnArgs = [
      new FnArg(state, PRIMITIVE),
      new FnArg(title, PRIMITIVE),
      new FnArg(url, PRIMITIVE)
    ];
    var args = new UiArguments("pushState", fnArgs);
    this._broker.runOnService(args, null);
  }

  void replaceState(dynamic state, String title, String url) {
    var fnArgs = [
      new FnArg(state, PRIMITIVE),
      new FnArg(title, PRIMITIVE),
      new FnArg(url, PRIMITIVE)
    ];
    var args = new UiArguments("replaceState", fnArgs);
    this._broker.runOnService(args, null);
  }

  void forward() {
    var args = new UiArguments("forward");
    this._broker.runOnService(args, null);
  }

  void back() {
    var args = new UiArguments("back");
    this._broker.runOnService(args, null);
  }
}
