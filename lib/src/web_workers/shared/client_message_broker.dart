library angular2.src.web_workers.shared.client_message_broker;

import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/lang.dart"
    show print, isPresent, DateWrapper, stringify;
import "package:angular2/src/facade/async.dart"
    show
        Future,
        PromiseCompleter,
        PromiseWrapper,
        ObservableWrapper,
        EventEmitter;
import "package:angular2/src/facade/collection.dart"
    show StringMapWrapper, MapWrapper;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/lang.dart" show Type, StringWrapper;
export "package:angular2/src/facade/lang.dart" show Type;

abstract class ClientMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new [ClientMessageBroker] to it.
   */
  ClientMessageBroker createMessageBroker(String channel, [bool runInZone]);
}

@Injectable()
class ClientMessageBrokerFactory_ extends ClientMessageBrokerFactory {
  MessageBus _messageBus;
  /** @internal */
  Serializer _serializer;
  ClientMessageBrokerFactory_(this._messageBus, Serializer _serializer)
      : super() {
    /* super call moved to initializer */;
    this._serializer = _serializer;
  }
  /**
   * Initializes the given channel and attaches a new [ClientMessageBroker] to it.
   */
  ClientMessageBroker createMessageBroker(String channel,
      [bool runInZone = true]) {
    this._messageBus.initChannel(channel, runInZone);
    return new ClientMessageBroker_(
        this._messageBus, this._serializer, channel);
  }
}

abstract class ClientMessageBroker {
  Future<dynamic> runOnService(UiArguments args, Type returnType);
}

class ClientMessageBroker_ extends ClientMessageBroker {
  var channel;
  Map<String, PromiseCompleter<dynamic>> _pending =
      new Map<String, PromiseCompleter<dynamic>>();
  EventEmitter<dynamic> _sink;
  /** @internal */
  Serializer _serializer;
  ClientMessageBroker_(
      MessageBus messageBus, Serializer _serializer, this.channel)
      : super() {
    /* super call moved to initializer */;
    this._sink = messageBus.to(channel);
    this._serializer = _serializer;
    var source = messageBus.from(channel);
    ObservableWrapper.subscribe(
        source, (Map<String, dynamic> message) => this._handleMessage(message));
  }
  String _generateMessageId(String name) {
    String time = stringify(DateWrapper.toMillis(DateWrapper.now()));
    num iteration = 0;
    String id = name + time + stringify(iteration);
    while (isPresent(this._pending[id])) {
      id = '''${ name}${ time}${ iteration}''';
      iteration++;
    }
    return id;
  }

  Future<dynamic> runOnService(UiArguments args, Type returnType) {
    var fnArgs = [];
    if (isPresent(args.args)) {
      args.args.forEach((argument) {
        if (argument.type != null) {
          fnArgs.add(this._serializer.serialize(argument.value, argument.type));
        } else {
          fnArgs.add(argument.value);
        }
      });
    }
    Future<dynamic> promise;
    String id = null;
    if (returnType != null) {
      PromiseCompleter<dynamic> completer = PromiseWrapper.completer();
      id = this._generateMessageId(args.method);
      this._pending[id] = completer;
      PromiseWrapper.catchError(completer.promise, (err, [stack]) {
        print(err);
        completer.reject(err, stack);
      });
      promise = PromiseWrapper.then(completer.promise, (dynamic value) {
        if (this._serializer == null) {
          return value;
        } else {
          return this._serializer.deserialize(value, returnType);
        }
      });
    } else {
      promise = null;
    }
    // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap #3685
    var message = {"method": args.method, "args": fnArgs};
    if (id != null) {
      message["id"] = id;
    }
    ObservableWrapper.callEmit(this._sink, message);
    return promise;
  }

  void _handleMessage(Map<String, dynamic> message) {
    var data = new MessageData(message);
    // TODO(jteplitz602): replace these strings with messaging constants #3685
    if (StringWrapper.equals(data.type, "result") ||
        StringWrapper.equals(data.type, "error")) {
      var id = data.id;
      if (this._pending.containsKey(id)) {
        if (StringWrapper.equals(data.type, "result")) {
          this._pending[id].resolve(data.value);
        } else {
          this._pending[id].reject(data.value, null);
        }
        (this._pending.containsKey(id) &&
            (this._pending.remove(id) != null || true));
      }
    }
  }
}

class MessageData {
  String type;
  dynamic value;
  String id;
  MessageData(Map<String, dynamic> data) {
    this.type = StringMapWrapper.get(data, "type");
    this.id = this._getValueIfPresent(data, "id");
    this.value = this._getValueIfPresent(data, "value");
  }
  /**
   * Returns the value from the StringMap if present. Otherwise returns null
   * @internal
   */
  _getValueIfPresent(Map<String, dynamic> data, String key) {
    if (StringMapWrapper.contains(data, key)) {
      return StringMapWrapper.get(data, key);
    } else {
      return null;
    }
  }
}

class FnArg {
  var value;
  Type type;
  FnArg(this.value, this.type) {}
}

class UiArguments {
  String method;
  List<FnArg> args;
  UiArguments(this.method, [this.args]) {}
}
