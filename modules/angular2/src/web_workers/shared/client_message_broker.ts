import {MessageBus} from "angular2/src/web_workers/shared/message_bus";
import {print, isPresent, DateWrapper, stringify} from "angular2/src/facade/lang";
import {
  PromiseCompleter,
  PromiseWrapper,
  ObservableWrapper,
  EventEmitter
} from "angular2/src/facade/async";
import {StringMapWrapper, MapWrapper} from "angular2/src/facade/collection";
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {Injectable} from "angular2/src/core/di";
import {Type, StringWrapper} from "angular2/src/facade/lang";
export {Type} from "angular2/src/facade/lang";

export abstract class ClientMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
   */
  abstract createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

@Injectable()
export class ClientMessageBrokerFactory_ extends ClientMessageBrokerFactory {
  /** @internal */
  public _serializer: Serializer;
  constructor(private _messageBus: MessageBus, _serializer: Serializer) {
    super();
    this._serializer = _serializer;
  }

  /**
   * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
   */
  createMessageBroker(channel: string, runInZone: boolean = true): ClientMessageBroker {
    this._messageBus.initChannel(channel, runInZone);
    return new ClientMessageBroker_(this._messageBus, this._serializer, channel);
  }
}

export abstract class ClientMessageBroker {
  abstract runOnService(args: UiArguments, returnType: Type): Promise<any>;
}

export class ClientMessageBroker_ extends ClientMessageBroker {
  private _pending: Map<string, PromiseCompleter<any>> = new Map<string, PromiseCompleter<any>>();
  private _sink: EventEmitter<any>;
  /** @internal */
  public _serializer: Serializer;

  constructor(messageBus: MessageBus, _serializer: Serializer, public channel) {
    super();
    this._sink = messageBus.to(channel);
    this._serializer = _serializer;
    var source = messageBus.from(channel);
    ObservableWrapper.subscribe(source,
                                (message: {[key: string]: any}) => this._handleMessage(message));
  }

  private _generateMessageId(name: string): string {
    var time: string = stringify(DateWrapper.toMillis(DateWrapper.now()));
    var iteration: number = 0;
    var id: string = name + time + stringify(iteration);
    while (isPresent(this._pending[id])) {
      id = `${name}${time}${iteration}`;
      iteration++;
    }
    return id;
  }

  runOnService(args: UiArguments, returnType: Type): Promise<any> {
    var fnArgs = [];
    if (isPresent(args.args)) {
      args.args.forEach(argument => {
        if (argument.type != null) {
          fnArgs.push(this._serializer.serialize(argument.value, argument.type));
        } else {
          fnArgs.push(argument.value);
        }
      });
    }

    var promise: Promise<any>;
    var id: string = null;
    if (returnType != null) {
      var completer: PromiseCompleter<any> = PromiseWrapper.completer();
      id = this._generateMessageId(args.method);
      this._pending.set(id, completer);
      PromiseWrapper.catchError(completer.promise, (err, stack?) => {
        print(err);
        completer.reject(err, stack);
      });

      promise = PromiseWrapper.then(completer.promise, (value: any) => {
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
    var message = {'method': args.method, 'args': fnArgs};
    if (id != null) {
      message['id'] = id;
    }
    ObservableWrapper.callEmit(this._sink, message);

    return promise;
  }

  private _handleMessage(message: {[key: string]: any}): void {
    var data = new MessageData(message);
    // TODO(jteplitz602): replace these strings with messaging constants #3685
    if (StringWrapper.equals(data.type, "result") || StringWrapper.equals(data.type, "error")) {
      var id = data.id;
      if (this._pending.has(id)) {
        if (StringWrapper.equals(data.type, "result")) {
          this._pending.get(id).resolve(data.value);
        } else {
          this._pending.get(id).reject(data.value, null);
        }
        this._pending.delete(id);
      }
    }
  }
}

class MessageData {
  type: string;
  value: any;
  id: string;

  constructor(data: {[key: string]: any}) {
    this.type = StringMapWrapper.get(data, "type");
    this.id = this._getValueIfPresent(data, "id");
    this.value = this._getValueIfPresent(data, "value");
  }

  /**
   * Returns the value from the StringMap if present. Otherwise returns null
   * @internal
   */
  _getValueIfPresent(data: {[key: string]: any}, key: string) {
    if (StringMapWrapper.contains(data, key)) {
      return StringMapWrapper.get(data, key);
    } else {
      return null;
    }
  }
}

export class FnArg {
  constructor(public value, public type: Type) {}
}

export class UiArguments {
  constructor(public method: string, public args?: FnArg[]) {}
}
