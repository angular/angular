/// <reference path="../../../globals.d.ts" />
import {MessageBus} from "angular2/src/web-workers/shared/message_bus";
import {print, isPresent, DateWrapper, stringify} from "../../facade/lang";
import {Promise, PromiseCompleter, PromiseWrapper} from "angular2/src/facade/async";
import {ListWrapper, StringMapWrapper, MapWrapper} from "../../facade/collection";
import {Serializer} from "angular2/src/web-workers/shared/serializer";
import {Injectable} from "angular2/di";
import {Type} from "angular2/src/facade/lang";
import {RenderViewRef, RenderEventDispatcher} from 'angular2/src/render/api';
import {NgZone} from 'angular2/src/core/zone/ng_zone';

@Injectable()
export class MessageBroker {
  private _pending: Map<string, PromiseCompleter<any>> = new Map<string, PromiseCompleter<any>>();
  private _eventDispatchRegistry: Map<RenderViewRef, RenderEventDispatcher> =
      new Map<RenderViewRef, RenderEventDispatcher>();

  constructor(private _messageBus: MessageBus, protected _serializer: Serializer,
              private _zone: NgZone) {
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
    if (data.type === "event") {
      this._dispatchEvent(new RenderEventData(data.value, this._serializer));
    } else if (data.type === "result" || data.type === "error") {
      var id = data.id;
      if (this._pending.has(id)) {
        if (data.type === "result") {
          this._pending.get(id).resolve(data.value);
        } else {
          this._pending.get(id).reject(data.value, null);
        }
        this._pending.delete(id);
      }
    }
  }

  private _dispatchEvent(eventData: RenderEventData): void {
    var dispatcher = this._eventDispatchRegistry.get(eventData.viewRef);
    this._zone.run(() => {
      dispatcher.dispatchRenderEvent(eventData.elementIndex, eventData.eventName, eventData.locals);
    });
  }

  registerEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void {
    this._eventDispatchRegistry.set(viewRef, dispatcher);
  }
}

class RenderEventData {
  viewRef: RenderViewRef;
  elementIndex: number;
  eventName: string;
  locals: Map<string, any>;

  constructor(message: StringMap<string, any>, serializer: Serializer) {
    this.viewRef = serializer.deserialize(message['viewRef'], RenderViewRef);
    this.elementIndex = message['elementIndex'];
    this.eventName = message['eventName'];
    this.locals = MapWrapper.createFromStringMap(message['locals']);
  }
}

class MessageData {
  type: string;
  value: any;
  id: string;

  constructor(data: StringMap<string, any>) {
    this.type = StringMapWrapper.get(data, "type");
    this.id = this._getValueIfPresent(data, "id");
    this.value = this._getValueIfPresent(data, "value");
  }

  /**
   * Returns the value from the StringMap if present. Otherwise returns null
   */
  _getValueIfPresent(data: StringMap<string, any>, key: string) {
    if (StringMapWrapper.contains(data, key)) {
      return StringMapWrapper.get(data, key);
    } else {
      return null;
    }
  }
}

export class FnArg {
  constructor(public value, public type) {}
}

export class UiArguments {
  constructor(public type: string, public method: string, public args?: List<FnArg>) {}
}
