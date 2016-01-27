library angular2.src.web_workers.ui.platform_location;

import "package:angular2/src/router/browser_platform_location.dart"
    show BrowserPlatformLocation;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show ROUTER_CHANNEL;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory, ServiceMessageBroker;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show PRIMITIVE, Serializer;
import "bind.dart" show bind;
import "package:angular2/src/web_workers/shared/serialized_types.dart"
    show LocationType;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/async.dart"
    show Future, EventEmitter, ObservableWrapper, PromiseWrapper;
import "package:angular2/src/router/platform_location.dart"
    show UrlChangeListener;

@Injectable()
class MessageBasedPlatformLocation {
  ServiceMessageBrokerFactory _brokerFactory;
  BrowserPlatformLocation _platformLocation;
  Serializer _serializer;
  EventEmitter<Object> _channelSink;
  ServiceMessageBroker _broker;
  MessageBasedPlatformLocation(this._brokerFactory, this._platformLocation,
      MessageBus bus, this._serializer) {
    this._platformLocation.onPopState(
        (bind(this._sendUrlChangeEvent, this) as UrlChangeListener));
    this._platformLocation.onHashChange(
        (bind(this._sendUrlChangeEvent, this) as UrlChangeListener));
    this._broker = this._brokerFactory.createMessageBroker(ROUTER_CHANNEL);
    this._channelSink = bus.to(ROUTER_CHANNEL);
  }
  void start() {
    this._broker.registerMethod(
        "getLocation", null, bind(this._getLocation, this), LocationType);
    this._broker.registerMethod(
        "setPathname", [PRIMITIVE], bind(this._setPathname, this));
    this._broker.registerMethod("pushState", [PRIMITIVE, PRIMITIVE, PRIMITIVE],
        bind(this._platformLocation.pushState, this._platformLocation));
    this._broker.registerMethod(
        "replaceState",
        [PRIMITIVE, PRIMITIVE, PRIMITIVE],
        bind(this._platformLocation.replaceState, this._platformLocation));
    this._broker.registerMethod("forward", null,
        bind(this._platformLocation.forward, this._platformLocation));
    this._broker.registerMethod("back", null,
        bind(this._platformLocation.back, this._platformLocation));
  }

  Future<dynamic> _getLocation() {
    return PromiseWrapper.resolve(this._platformLocation.location);
  }

  void _sendUrlChangeEvent(dynamic e) {
    var loc = this
        ._serializer
        .serialize(this._platformLocation.location, LocationType);
    var serializedEvent = {"type": e.type};
    ObservableWrapper.callEmit(
        this._channelSink, {"event": serializedEvent, "location": loc});
  }

  void _setPathname(String pathname) {
    this._platformLocation.pathname = pathname;
  }
}
