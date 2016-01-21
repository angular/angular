import {Injectable} from 'angular2/src/core/di';
import {ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {Serializer} from "angular2/src/web_workers/shared/serializer";
import {isPresent, Type, FunctionWrapper} from "angular2/src/facade/lang";
import {MessageBus} from "angular2/src/web_workers/shared/message_bus";
import {EventEmitter, Promise, PromiseWrapper, ObservableWrapper} from 'angular2/src/facade/async';

export abstract class ServiceMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new {@link ServiceMessageBroker} to it.
   */
  abstract createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

@Injectable()
export class ServiceMessageBrokerFactory_ extends ServiceMessageBrokerFactory {
  /** @internal */
  public _serializer: Serializer;

  constructor(private _messageBus: MessageBus, _serializer: Serializer) {
    super();
    this._serializer = _serializer;
  }

  createMessageBroker(channel: string, runInZone: boolean = true): ServiceMessageBroker {
    this._messageBus.initChannel(channel, runInZone);
    return new ServiceMessageBroker_(this._messageBus, this._serializer, channel);
  }
}

export abstract class ServiceMessageBroker {
  abstract registerMethod(methodName: string, signature: Type[], method: Function,
                          returnType?: Type): void;
}

/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 */
export class ServiceMessageBroker_ extends ServiceMessageBroker {
  private _sink: EventEmitter<any>;
  private _methods: Map<string, Function> = new Map<string, Function>();

  constructor(messageBus: MessageBus, private _serializer: Serializer, public channel) {
    super();
    this._sink = messageBus.to(channel);
    var source = messageBus.from(channel);
    ObservableWrapper.subscribe(source, (message) => this._handleMessage(message));
  }

  registerMethod(methodName: string, signature: Type[], method: (..._: any[]) => Promise<any>| void,
                 returnType?: Type): void {
    this._methods.set(methodName, (message: ReceivedMessage) => {
      var serializedArgs = message.args;
      let numArgs = signature === null ? 0 : signature.length;
      var deserializedArgs: any[] = ListWrapper.createFixedSize(numArgs);
      for (var i = 0; i < numArgs; i++) {
        var serializedArg = serializedArgs[i];
        deserializedArgs[i] = this._serializer.deserialize(serializedArg, signature[i]);
      }

      var promise = FunctionWrapper.apply(method, deserializedArgs);
      if (isPresent(returnType) && isPresent(promise)) {
        this._wrapWebWorkerPromise(message.id, promise, returnType);
      }
    });
  }

  private _handleMessage(map: {[key: string]: any}): void {
    var message = new ReceivedMessage(map);
    if (this._methods.has(message.method)) {
      this._methods.get(message.method)(message);
    }
  }

  private _wrapWebWorkerPromise(id: string, promise: Promise<any>, type: Type): void {
    PromiseWrapper.then(promise, (result: any) => {
      ObservableWrapper.callEmit(
          this._sink,
          {'type': 'result', 'value': this._serializer.serialize(result, type), 'id': id});
    });
  }
}

export class ReceivedMessage {
  method: string;
  args: any[];
  id: string;
  type: string;

  constructor(data: {[key: string]: any}) {
    this.method = data['method'];
    this.args = data['args'];
    this.id = data['id'];
    this.type = data['type'];
  }
}
