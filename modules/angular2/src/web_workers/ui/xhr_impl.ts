import {Injectable} from 'angular2/di';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {EventEmitter, ObservableWrapper, PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {XHR_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {ReceivedMessage} from 'angular2/src/web_workers/ui/impl';
import {BaseException, Type} from 'angular2/src/facade/lang';
import {XHR} from 'angular2/src/render/xhr';

// TODO(jteplitz602): Create parent UIComponent class #3703
@Injectable()
export class MessageBasedXHRImpl {
  private _sink: EventEmitter;
  private _source: EventEmitter;

  constructor(bus: MessageBus, private _serializer: Serializer, private _xhr: XHR) {
    this._sink = bus.to(XHR_CHANNEL);
    this._source = bus.from(XHR_CHANNEL);
    ObservableWrapper.subscribe(this._source,
                                (message: StringMap<string, any>) => this._handleMessage(message));
  }

  private _handleMessage(map: StringMap<string, any>) {
    var message = new ReceivedMessage(map);
    var args = message.args;
    switch (message.method) {
      case "get":
        var url = args[0];
        var promise = this._xhr.get(url);
        this._wrapWebWorkerPromise(message.id, promise, String);
        break;
      default:
        throw new BaseException(message.method + " Not Implemented");
    }
  }

  private _wrapWebWorkerPromise(id: string, promise: Promise<any>, type: Type): void {
    PromiseWrapper.then(promise, (result: any) => {
      ObservableWrapper.callNext(
          this._sink,
          {'type': 'result', 'value': this._serializer.serialize(result, type), 'id': id});
    });
  }
}
