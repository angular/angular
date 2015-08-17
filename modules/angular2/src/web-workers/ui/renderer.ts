import {Injectable} from 'angular2/di';
import {MessageBus} from 'angular2/src/web-workers/shared/message_bus';
import {Serializer} from 'angular2/src/web-workers/shared/serializer';
import {
  RenderViewRef,
  RenderFragmentRef,
  RenderProtoViewRef,
  Renderer
} from 'angular2/src/render/api';
import {WebWorkerElementRef} from 'angular2/src/web-workers/shared/api';
import {EventEmitter, ObservableWrapper, PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {EVENT_CHANNEL, RENDERER_CHANNEL} from 'angular2/src/web-workers/shared/messaging_api';
import {ReceivedMessage} from 'angular2/src/web-workers/ui/impl';
import {BaseException, Type} from 'angular2/src/facade/lang';
import {EventDispatcher} from 'angular2/src/web-workers/ui/event_dispatcher';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';

@Injectable()
export class MessageBasedRenderer {
  constructor(private _bus: MessageBus, private _serializer: Serializer,
              private _renderViewWithFragmentsStore: RenderViewWithFragmentsStore,
              private _renderer: Renderer) {
    var source = _bus.from(RENDERER_CHANNEL);
    ObservableWrapper.subscribe(source,
                                (message: StringMap<string, any>) => this._handleMessage(message));
  }

  private _createViewHelper(args: List<any>, method) {
    var hostProtoView = this._serializer.deserialize(args[0], RenderProtoViewRef);
    var fragmentCount = args[1];
    var startIndex, renderViewWithFragments;
    if (method == "createView") {
      startIndex = args[2];
      renderViewWithFragments = this._renderer.createView(hostProtoView, fragmentCount);
    } else {
      var selector = args[2];
      startIndex = args[3];
      renderViewWithFragments =
          this._renderer.createRootHostView(hostProtoView, fragmentCount, selector);
    }
    this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
  }


  private _handleMessage(map: StringMap<string, any>): void {
    var data = new ReceivedMessage(map);
    var args = data.args;
    switch (data.method) {
      case "createRootHostView":
      case "createView":
        this._createViewHelper(args, data.method);
        break;
      case "destroyView":
        var viewRef = this._serializer.deserialize(args[0], RenderViewRef);
        this._renderer.destroyView(viewRef);
        break;
      case "attachFragmentAfterFragment":
        var previousFragment = this._serializer.deserialize(args[0], RenderFragmentRef);
        var fragment = this._serializer.deserialize(args[1], RenderFragmentRef);
        this._renderer.attachFragmentAfterFragment(previousFragment, fragment);
        break;
      case "attachFragmentAfterElement":
        var element = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var fragment = this._serializer.deserialize(args[1], RenderFragmentRef);
        this._renderer.attachFragmentAfterElement(element, fragment);
        break;
      case "detachFragment":
        var fragment = this._serializer.deserialize(args[0], RenderFragmentRef);
        this._renderer.detachFragment(fragment);
        break;
      case "hydrateView":
        var viewRef = this._serializer.deserialize(args[0], RenderViewRef);
        this._renderer.hydrateView(viewRef);
        break;
      case "dehydrateView":
        var viewRef = this._serializer.deserialize(args[0], RenderViewRef);
        this._renderer.dehydrateView(viewRef);
        break;
      case "setText":
        var viewRef = this._serializer.deserialize(args[0], RenderViewRef);
        var textNodeIndex = args[1];
        var text = args[2];
        this._renderer.setText(viewRef, textNodeIndex, text);
        break;
      case "setElementProperty":
        var elementRef = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var propName = args[1];
        var propValue = args[2];
        this._renderer.setElementProperty(elementRef, propName, propValue);
        break;
      case "setElementAttribute":
        var elementRef = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var attributeName = args[1];
        var attributeValue = args[2];
        this._renderer.setElementAttribute(elementRef, attributeName, attributeValue);
        break;
      case "setElementClass":
        var elementRef = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var className = args[1];
        var isAdd = args[2];
        this._renderer.setElementClass(elementRef, className, isAdd);
        break;
      case "setElementStyle":
        var elementRef = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var styleName = args[1];
        var styleValue = args[2];
        this._renderer.setElementStyle(elementRef, styleName, styleValue);
        break;
      case "invokeElementMethod":
        var elementRef = this._serializer.deserialize(args[0], WebWorkerElementRef);
        var methodName = args[1];
        var methodArgs = args[2];
        this._renderer.invokeElementMethod(elementRef, methodName, methodArgs);
        break;
      case "setEventDispatcher":
        var viewRef = this._serializer.deserialize(args[0], RenderViewRef);
        var dispatcher =
            new EventDispatcher(viewRef, this._bus.to(EVENT_CHANNEL), this._serializer);
        this._renderer.setEventDispatcher(viewRef, dispatcher);
        break;
      default:
        throw new BaseException("Not Implemented");
    }
  }
}
