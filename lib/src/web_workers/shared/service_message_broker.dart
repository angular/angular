library angular2.src.web_workers.shared.service_message_broker;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, Map, MapWrapper;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/facade/lang.dart"
    show isPresent, Type, FunctionWrapper;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, Future, PromiseWrapper, ObservableWrapper;

abstract class ServiceMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new [ServiceMessageBroker] to it.
   */
  ServiceMessageBroker createMessageBroker(String channel, [bool runInZone]);
}

@Injectable()
class ServiceMessageBrokerFactory_ extends ServiceMessageBrokerFactory {
  MessageBus _messageBus;
  /** @internal */
  Serializer _serializer;
  ServiceMessageBrokerFactory_(this._messageBus, Serializer _serializer)
      : super() {
    /* super call moved to initializer */;
    this._serializer = _serializer;
  }
  ServiceMessageBroker createMessageBroker(String channel,
      [bool runInZone = true]) {
    this._messageBus.initChannel(channel, runInZone);
    return new ServiceMessageBroker_(
        this._messageBus, this._serializer, channel);
  }
}

abstract class ServiceMessageBroker {
  void registerMethod(String methodName, List<Type> signature, Function method,
      [Type returnType]);
}

/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 */
class ServiceMessageBroker_ extends ServiceMessageBroker {
  Serializer _serializer;
  var channel;
  EventEmitter<dynamic> _sink;
  Map<String, Function> _methods = new Map<String, Function>();
  ServiceMessageBroker_(MessageBus messageBus, this._serializer, this.channel)
      : super() {
    /* super call moved to initializer */;
    this._sink = messageBus.to(channel);
    var source = messageBus.from(channel);
    ObservableWrapper.subscribe(
        source, (message) => this._handleMessage(message));
  }
  void registerMethod(String methodName, List<Type> signature, Function method,
      [Type returnType]) {
    this._methods[methodName] = (ReceivedMessage message) {
      var serializedArgs = message.args;
      List<dynamic> deserializedArgs =
          ListWrapper.createFixedSize(signature.length);
      for (var i = 0; i < signature.length; i++) {
        var serializedArg = serializedArgs[i];
        deserializedArgs[i] =
            this._serializer.deserialize(serializedArg, signature[i]);
      }
      var promise = FunctionWrapper.apply(method, deserializedArgs);
      if (isPresent(returnType) && isPresent(promise)) {
        this._wrapWebWorkerPromise(message.id, promise, returnType);
      }
    };
  }

  void _handleMessage(Map<String, dynamic> map) {
    var message = new ReceivedMessage(map);
    if (this._methods.containsKey(message.method)) {
      this._methods[message.method](message);
    }
  }

  void _wrapWebWorkerPromise(String id, Future<dynamic> promise, Type type) {
    PromiseWrapper.then(promise, (dynamic result) {
      ObservableWrapper.callEmit(this._sink, {
        "type": "result",
        "value": this._serializer.serialize(result, type),
        "id": id
      });
    });
  }
}

class ReceivedMessage {
  String method;
  List<dynamic> args;
  String id;
  String type;
  ReceivedMessage(Map<String, dynamic> data) {
    this.method = data["method"];
    this.args = data["args"];
    this.id = data["id"];
    this.type = data["type"];
  }
}
