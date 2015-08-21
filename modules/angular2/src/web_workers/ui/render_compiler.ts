import {Injectable} from 'angular2/di';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {
  RenderDirectiveMetadata,
  ProtoViewDto,
  ViewDefinition,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping,
  RenderCompiler
} from 'angular2/src/render/api';
import {EventEmitter, ObservableWrapper, PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {RENDER_COMPILER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {ReceivedMessage} from 'angular2/src/web_workers/ui/impl';
import {BaseException, Type} from 'angular2/src/facade/lang';

// TODO(jteplitz602): Create parent UIComponent class #3703
@Injectable()
export class MessageBasedRenderCompiler {
  private _sink: EventEmitter;
  private _source: EventEmitter;

  constructor(bus: MessageBus, private _serializer: Serializer,
              private _renderCompiler: RenderCompiler) {
    this._sink = bus.to(RENDER_COMPILER_CHANNEL);
    this._source = bus.from(RENDER_COMPILER_CHANNEL);
    ObservableWrapper.subscribe(this._source,
                                (message: StringMap<string, any>) => this._handleMessage(message));
  }

  private _handleMessage(map: StringMap<string, any>): void {
    var message = new ReceivedMessage(map);
    var args = message.args;
    var promise: Promise<any>;
    switch (message.method) {
      case "compileHost":
        var directiveMetadata = this._serializer.deserialize(args[0], RenderDirectiveMetadata);
        promise = this._renderCompiler.compileHost(directiveMetadata);
        this._wrapWebWorkerPromise(message.id, promise, ProtoViewDto);
        break;
      case "compile":
        var view = this._serializer.deserialize(args[0], ViewDefinition);
        promise = this._renderCompiler.compile(view);
        this._wrapWebWorkerPromise(message.id, promise, ProtoViewDto);
        break;
      case "mergeProtoViewsRecursively":
        var views = this._serializer.deserialize(args[0], RenderProtoViewRef);
        promise = this._renderCompiler.mergeProtoViewsRecursively(views);
        this._wrapWebWorkerPromise(message.id, promise, RenderProtoViewMergeMapping);
        break;
      default:
        throw new BaseException("not implemented");
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
