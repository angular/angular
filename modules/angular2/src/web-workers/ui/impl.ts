/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
 * TODO: This class might need to be refactored to match application.ts...
*/

import {createInjector} from "./di_bindings";
import {
  Renderer,
  RenderCompiler,
  DirectiveMetadata,
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
import {WorkerElementRef} from 'angular2/src/web-workers/shared/api';
import {AnchorBasedAppRootUrl} from 'angular2/src/services/anchor_based_app_root_url';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {Injectable} from 'angular2/di';
import {BrowserDomAdapter} from 'angular2/src/dom/browser_adapter';
import {DOM} from 'angular2/src/dom/dom_adapter';

/**
 * Creates a zone, sets up the DI bindings
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus: MessageBus) {
  BrowserDomAdapter.makeCurrent();
  var zone = createNgZone(new ExceptionHandler(DOM));
  zone.run(() => {
    var injector = createInjector(zone);
    var webWorkerMain = injector.get(WebWorkerMain);
    webWorkerMain.attachToWorker(bus);
  });
}

@Injectable()
export class WebWorkerMain {
  private _rootUrl: string;
  private _bus: MessageBus;

  constructor(private _renderCompiler: RenderCompiler, private _renderer: Renderer,
              private _renderViewWithFragmentsStore: RenderViewWithFragmentsStore,
              private _serializer: Serializer, rootUrl: AnchorBasedAppRootUrl) {
    this._rootUrl = rootUrl.value;
  }

  /**
   * Attach's this WebWorkerMain instance to the given MessageBus
   * This instance will now listen for all messages from the worker and handle them appropriately
   * Note: Don't attach more than one WebWorkerMain instance to the same MessageBus.
   */
  attachToWorker(bus: MessageBus) {
    this._bus = bus;
    this._bus.source.addListener((message) => { this._handleWorkerMessage(message); });
  }

  private _sendInitMessage() { this._sendWorkerMessage("init", {"rootUrl": this._rootUrl}); }

  /*
   * Sends an error back to the worker thread in response to an opeartion on the UI thread
   */
  private _sendWorkerError(id: string, error: any) {
    this._sendWorkerMessage("error", {"error": error}, id);
  }

  private _sendWorkerMessage(type: string, value: StringMap<string, any>, id?: string) {
    this._bus.sink.send({'type': type, 'id': id, 'value': value});
  }

  // TODO: Transfer the types with the serialized data so this can be automated?
  private _handleCompilerMessage(data: ReceivedMessage) {
    var promise: Promise<any>;
    switch (data.method) {
      case "compileHost":
        var directiveMetadata = this._serializer.deserialize(data.args[0], DirectiveMetadata);
        promise = this._renderCompiler.compileHost(directiveMetadata);
        this._wrapWorkerPromise(data.id, promise, ProtoViewDto);
        break;
      case "compile":
        var view = this._serializer.deserialize(data.args[0], ViewDefinition);
        promise = this._renderCompiler.compile(view);
        this._wrapWorkerPromise(data.id, promise, ProtoViewDto);
        break;
      case "mergeProtoViewsRecursively":
        var views = this._serializer.deserialize(data.args[0], RenderProtoViewRef);
        promise = this._renderCompiler.mergeProtoViewsRecursively(views);
        this._wrapWorkerPromise(data.id, promise, RenderProtoViewMergeMapping);
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
        var element = this._serializer.deserialize(args[0], WorkerElementRef);
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
        var elementRef = this._serializer.deserialize(args[0], WorkerElementRef);
        var propName = args[1];
        var propValue = args[2];
        this._renderer.setElementProperty(elementRef, propName, propValue);
        break;
      case "setElementAttribute":
        var elementRef = this._serializer.deserialize(args[0], WorkerElementRef);
        var attributeName = args[1];
        var attributeValue = args[2];
        this._renderer.setElementAttribute(elementRef, attributeName, attributeValue);
        break;
      case "setElementClass":
        var elementRef = this._serializer.deserialize(args[0], WorkerElementRef);
        var className = args[1];
        var isAdd = args[2];
        this._renderer.setElementClass(elementRef, className, isAdd);
        break;
      case "setElementStyle":
        var elementRef = this._serializer.deserialize(args[0], WorkerElementRef);
        var styleName = args[1];
        var styleValue = args[2];
        this._renderer.setElementStyle(elementRef, styleName, styleValue);
        break;
      case "invokeElementMethod":
        var elementRef = this._serializer.deserialize(args[0], WorkerElementRef);
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

  // TODO: Create message type
  private _handleWorkerMessage(message: StringMap<string, any>) {
    var data: ReceivedMessage = new ReceivedMessage(message['data']);
    switch (data.type) {
      case "ready":
        return this._sendInitMessage();
      case "compiler":
        return this._handleCompilerMessage(data);
      case "renderer":
        return this._handleRendererMessage(data);
    }
  }

  private _wrapWorkerPromise(id: string, promise: Promise<any>, type: Type): void {
    PromiseWrapper.then(promise, (result: any) => {
      try {
        this._sendWorkerMessage("result", this._serializer.serialize(result, type), id);
      } catch (e) {
        print(e);
      }
    }, (error: any) => { this._sendWorkerError(id, error); });
  }
}

class EventDispatcher implements RenderEventDispatcher {
  // a set of all event properties that should be skipped when serializing events
  static nullOut = SetWrapper.createFromList(
      ["currentTarget", "releatedTarget", "view", "target", "toElement", "srcElement", "path"]);

  constructor(private _viewRef: RenderViewRef, private _sink: MessageBusSink,
              private _serializer: Serializer) {}

  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>) {
    var e = locals.get('$event');
    var serializedEvent = StringMapWrapper.create();
    for (var prop in e) {
      if (!SetWrapper.has(EventDispatcher.nullOut, prop) && !isFunction(e[prop])) {
        StringMapWrapper.set(serializedEvent, prop, e[prop]);
      }
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
