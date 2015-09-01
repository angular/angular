import {Injectable} from 'angular2/src/core/di/decorators';
import {
  RenderDirectiveMetadata,
  ProtoViewDto,
  ViewDefinition,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping,
  RenderCompiler
} from 'angular2/src/core/render/api';
import {RENDER_COMPILER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {bind} from './bind';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';

@Injectable()
export class MessageBasedRenderCompiler {
  constructor(private _brokerFactory: ServiceMessageBrokerFactory,
              private _renderCompiler: RenderCompiler) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(RENDER_COMPILER_CHANNEL);
    broker.registerMethod("compileHost", [RenderDirectiveMetadata],
                          bind(this._renderCompiler.compileHost, this._renderCompiler),
                          ProtoViewDto);
    broker.registerMethod("compile", [ViewDefinition],
                          bind(this._renderCompiler.compile, this._renderCompiler), ProtoViewDto);
    broker.registerMethod(
        "mergeProtoViewsRecursively", [RenderProtoViewRef],
        bind(this._renderCompiler.mergeProtoViewsRecursively, this._renderCompiler),
        RenderProtoViewMergeMapping);
  }
}
