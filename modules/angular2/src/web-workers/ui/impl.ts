/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/

import {createInjector} from "./di_bindings";
import {
  Renderer,
  RenderCompiler,
  RenderDirectiveMetadata,
  ProtoViewDto,
  ViewDefinition,
  RenderProtoViewRef,
  RenderProtoViewMergeMapping,
  RenderViewRef,
  RenderEventDispatcher,
  RenderFragmentRef
} from "angular2/src/render/api";
import {Type, print, BaseException, isFunction} from "angular2/src/facade/lang";
import {Promise, PromiseWrapper} from "angular2/src/facade/async";
import {StringMapWrapper, SetWrapper} from 'angular2/src/facade/collection';
import {Serializer} from "angular2/src/web-workers/shared/serializer";
import {MessageBus, MessageBusSink} from "angular2/src/web-workers/shared/message_bus";
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';
import {createNgZone} from 'angular2/src/core/application_common';
import {WebWorkerElementRef} from 'angular2/src/web-workers/shared/api';
import {AnchorBasedAppRootUrl} from 'angular2/src/services/anchor_based_app_root_url';
import {Injectable} from 'angular2/di';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {XHR} from 'angular2/src/render/xhr';
import {
  serializeMouseEvent,
  serializeKeyboardEvent,
  serializeGenericEvent,
  serializeEventWithTarget
} from 'angular2/src/web-workers/ui/event_serializer';
import {wtfInit} from 'angular2/src/profile/wtf_init';

/**
 * Creates a zone, sets up the DI bindings
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus: MessageBus) {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone();
  wtfInit();
  zone.run(() => {
    var injector = createInjector(zone);
    var webWorkerMain = injector.get(WebWorkerMain);
    webWorkerMain.attachToWebWorker(bus);
  });
}

@Injectable()
export class WebWorkerMain {
  private _rootUrl: string;
  private _bus: MessageBus;

  constructor(private _renderCompiler: RenderCompiler, private _renderer: Renderer,
              private _renderViewWithFragmentsStore: RenderViewWithFragmentsStore,
              private _serializer: Serializer, rootUrl: AnchorBasedAppRootUrl, private _xhr: XHR) {
    this._rootUrl = rootUrl.value;
  }

  /**
   * Attach's this WebWorkerMain instance to the given MessageBus
   * This instance will now listen for all messages from the worker and handle them appropriately
   * Note: Don't attach more than one WebWorkerMain instance to the same MessageBus.
   */
  attachToWebWorker(bus: MessageBus) {
    this._bus = bus;
    this._bus.source.addListener((message) => { this._handleWebWorkerMessage(message); });
  }

  private _sendInitMessage() { this._sendWebWorkerMessage("init", {"rootUrl": this._rootUrl}); }

  /*
   * Sends an error back to the worker thread in response to an opeartion on the UI thread
   */
  private _sendWebWorkerError(id: string, error: any) {
    this._sendWebWorkerMessage("error", {"error": error}, id);
  }

  private _sendWebWorkerMessage(type: string, value: StringMap<string, any>, id?: string) {
    this._bus.sink.send({'type': type, 'id': id, 'value': value});
  }

  // TODO: Transfer the types with the serialized data so this can be automated?
  private _handleCompilerMessage(data: ReceivedMessage) {
    var promise: Promise<any>;
    switch (data.method) {
      case "compileHost":
        var directiveMetadata = this._serializer.deserialize(data.args[0], RenderDirectiveMetadata);
        promise = this._renderCompiler.compileHost(directiveMetadata);
        this._wrapWebWorkerPromise(data.id, promise, ProtoViewDto);
        break;
      case "compile":
        var view = this._serializer.deserialize(data.args[0], ViewDefinition);
        promise = this._renderCompiler.compile(view);
        this._wrapWebWorkerPromise(data.id, promise, ProtoViewDto);
        break;
      case "mergeProtoViewsRecursively":
        var views = this._serializer.deserialize(data.args[0], RenderProtoViewRef);
        promise = this._renderCompiler.mergeProtoViewsRecursively(views);
        this._wrapWebWorkerPromise(data.id, promise, RenderProtoViewMergeMapping);
        break;
      default:
        throw new BaseException("not implemented");
    }
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

  private _handleRendererMessage(data: ReceivedMessage) {
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
        var dispatcher = new EventDispatcher(viewRef, this._bus.sink, this._serializer);
        this._renderer.setEventDispatcher(viewRef, dispatcher);
        break;
      default:
        throw new BaseException("Not Implemented");
    }
  }

  private _handleXhrMessage(data: ReceivedMessage) {
    var args = data.args;
    switch (data.method) {
      case "get":
        var url = args[0];
        var promise = this._xhr.get(url);
        this._wrapWebWorkerPromise(data.id, promise, String);
        break;
      default:
        throw new BaseException(data.method + " Not Implemented");
    }
  }

  // TODO(jteplitz602): Create message type enum #3044
  private _handleWebWorkerMessage(message: StringMap<string, any>) {
    var data: ReceivedMessage = new ReceivedMessage(message['data']);
    // TODO(jteplitz602): Replace these with MessageBUs channels #3661
    switch (data.type) {
      case "ready":
        return this._sendInitMessage();
      case "compiler":
        return this._handleCompilerMessage(data);
      case "renderer":
        return this._handleRendererMessage(data);
      case "xhr":
        return this._handleXhrMessage(data);
    }
  }

  private _wrapWebWorkerPromise(id: string, promise: Promise<any>, type: Type): void {
    PromiseWrapper.then(promise, (result: any) => {
      try {
        this._sendWebWorkerMessage("result", this._serializer.serialize(result, type), id);
      } catch (e) {
        print(e);
      }
    }, (error: any) => { this._sendWebWorkerError(id, error); });
  }
}

class EventDispatcher implements RenderEventDispatcher {
  constructor(private _viewRef: RenderViewRef, private _sink: MessageBusSink,
              private _serializer: Serializer) {}

  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>) {
    var e = locals.get('$event');
    var serializedEvent;
    // TODO (jteplitz602): support custom events #3350
    switch (e.type) {
      case "click":
      case "mouseup":
      case "mousedown":
      case "dblclick":
      case "contextmenu":
      case "mouseenter":
      case "mouseleave":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "show":
        serializedEvent = serializeMouseEvent(e);
        break;
      case "keydown":
      case "keypress":
      case "keyup":
        serializedEvent = serializeKeyboardEvent(e);
        break;
      case "input":
      case "change":
      case "blur":
        serializedEvent = serializeEventWithTarget(e);
        break;
      case "abort":
      case "afterprint":
      case "beforeprint":
      case "cached":
      case "canplay":
      case "canplaythrough":
      case "chargingchange":
      case "chargingtimechange":
      case "close":
      case "dischargingtimechange":
      case "DOMContentLoaded":
      case "downloading":
      case "durationchange":
      case "emptied":
      case "ended":
      case "error":
      case "fullscreenchange":
      case "fullscreenerror":
      case "invalid":
      case "languagechange":
      case "levelfchange":
      case "loadeddata":
      case "loadedmetadata":
      case "obsolete":
      case "offline":
      case "online":
      case "open":
      case "orientatoinchange":
      case "pause":
      case "pointerlockchange":
      case "pointerlockerror":
      case "play":
      case "playing":
      case "ratechange":
      case "readystatechange":
      case "reset":
      case "seeked":
      case "seeking":
      case "stalled":
      case "submit":
      case "success":
      case "suspend":
      case "timeupdate":
      case "updateready":
      case "visibilitychange":
      case "volumechange":
      case "waiting":
        serializedEvent = serializeGenericEvent(e);
        break;
      default:
        throw new BaseException(eventName + " not supported on WebWorkers");
    }
    var serializedLocals = StringMapWrapper.create();
    StringMapWrapper.set(serializedLocals, '$event', serializedEvent);

    this._sink.send({
      "type": "event",
      "value": {
        "viewRef": this._serializer.serialize(this._viewRef, RenderViewRef),
        "elementIndex": elementIndex,
        "eventName": eventName,
        "locals": serializedLocals
      }
    });
  }
}

class ReceivedMessage {
  method: string;
  args: List<any>;
  id: string;
  type: string;

  constructor(data: StringMap<string, any>) {
    this.method = data['method'];
    this.args = data['args'];
    this.id = data['id'];
    this.type = data['type'];
  }
}
