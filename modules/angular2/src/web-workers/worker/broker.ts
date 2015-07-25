/// <reference path="../../../globals.d.ts" />
import {MessageBus} from "angular2/src/web-workers/shared/message_bus";
import {print, isPresent, DateWrapper, stringify} from "../../facade/lang";
import {Promise, PromiseCompleter, PromiseWrapper} from "angular2/src/facade/async";
import {ListWrapper, StringMapWrapper, MapWrapper} from "../../facade/collection";
import {Serializer} from "angular2/src/web-workers/shared/serializer";
import {Injectable} from "angular2/di";
import {Type} from "angular2/src/facade/lang";

@Injectable()
export class MessageBroker {
  private _pending: Map<string, Function> = new Map<string, Function>();

  constructor(private _messageBus: MessageBus, protected _serializer: Serializer) {
    this._messageBus.source.addListener((data) => this._handleMessage(data['data']));
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

  runOnUiThread(args: UiArguments, returnType: Type): Promise<any> {
    var fnArgs = [];
    if (isPresent(args.args)) {
      ListWrapper.forEach(args.args, (argument) => {
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
      id = this._generateMessageId(args.type + args.method);
      this._pending.set(id, completer.resolve);
      PromiseWrapper.catchError(completer.promise, (err, stack?) => {
        print(err);
        completer.reject(err, stack);
      });

      promise = PromiseWrapper.then(completer.promise, (data: MessageResult) => {
        if (this._serializer == null) {
          return data.value;
        } else {
          return this._serializer.deserialize(data.value, returnType);
        }
      });
    } else {
      promise = null;
    }

    // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap
    var message = {'type': args.type, 'method': args.method, 'args': fnArgs};
    if (id != null) {
      message['id'] = id;
    }
    this._messageBus.sink.send(message);

    return promise;
  }

  private _handleMessage(message: StringMap<string, any>): void {
    var data = new MessageData(message);
    // TODO(jteplitz602): replace these strings with messaging constants
    var id = data.value.id;
    if (this._pending.has(id)) {
      this._pending.get(id)(data.value);
      this._pending.delete(id);
    }
  }
}

class MessageData {
  type: string;
  value: MessageResult;

  constructor(data: StringMap<string, any>) {
    this.type = StringMapWrapper.get(data, "type");
    if (StringMapWrapper.contains(data, "value")) {
      this.value = new MessageResult(StringMapWrapper.get(data, "value"));
    } else {
      this.value = null;
    }
  }
}

class MessageResult {
  id: string;
  value: any;

  constructor(result: StringMap<string, any>) {
    this.id = StringMapWrapper.get(result, "id");
    this.value = StringMapWrapper.get(result, "value");
  }
}

export class FnArg {
  constructor(public value, public type) {}
}

export class UiArguments {
  constructor(public type: string, public method: string, public args?: List<FnArg>) {}
}
