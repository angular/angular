import {
  Renderer,
  RenderProtoViewRef,
  RenderViewRef,
  RenderElementRef,
  RenderEventDispatcher,
  RenderViewWithFragments,
  RenderFragmentRef,
  RenderTemplateCmd,
  RenderComponentTemplate
} from 'angular2/src/core/render/api';
import {
  ClientMessageBroker,
  ClientMessageBrokerFactory,
  FnArg,
  UiArguments
} from "angular2/src/web_workers/shared/client_message_broker";
import {isPresent, print} from "angular2/src/facade/lang";
import {Injectable} from "angular2/src/core/di";
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore,
  WebWorkerRenderViewRef
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {WebWorkerElementRef, WebWorkerTemplateCmd} from 'angular2/src/web_workers/shared/api';
import {RENDERER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {WebWorkerEventDispatcher} from 'angular2/src/web_workers/worker/event_dispatcher';

@Injectable()
export class WebWorkerRenderer implements Renderer {
  private _messageBroker;
  constructor(messageBrokerFactory: ClientMessageBrokerFactory,
              private _renderProtoViewRefStore: RenderProtoViewRefStore,
              private _renderViewStore: RenderViewWithFragmentsStore,
              private _eventDispatcher: WebWorkerEventDispatcher) {
    this._messageBroker = messageBrokerFactory.createMessageBroker(RENDERER_CHANNEL);
  }

  registerComponentTemplate(template: RenderComponentTemplate) {
    var fnArgs = [new FnArg(template, RenderComponentTemplate)];
    var args = new UiArguments("registerComponentTemplate", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef {
    var renderProtoViewRef = this._renderProtoViewRefStore.allocate();

    var fnArgs: FnArg[] = [
      new FnArg(componentTemplateId, null),
      new FnArg(cmds, WebWorkerTemplateCmd),
      new FnArg(renderProtoViewRef, RenderProtoViewRef)
    ];
    var args: UiArguments = new UiArguments("createProtoView", fnArgs);
    this._messageBroker.runOnService(args, null);
    return renderProtoViewRef;
  }

  /**
   * Creates a root host view that includes the given element.
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   *
   * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
   * ProtoViewDto.HOST_VIEW_TYPE
   * @param {any} hostElementSelector css selector for the host element (will be queried against the
   * main document)
   * @return {RenderViewRef} the created view
   */
  createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number,
                     hostElementSelector: string): RenderViewWithFragments {
    return this._createViewHelper(hostProtoViewRef, fragmentCount, hostElementSelector);
  }

  /**
   * Creates a regular view out of the given ProtoView
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   */
  createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments {
    return this._createViewHelper(protoViewRef, fragmentCount);
  }

  private _createViewHelper(protoViewRef: RenderProtoViewRef, fragmentCount: number,
                            hostElementSelector?: string): RenderViewWithFragments {
    var renderViewWithFragments = this._renderViewStore.allocate(fragmentCount);

    var startIndex = (<WebWorkerRenderViewRef>(renderViewWithFragments.viewRef)).refNumber;
    var fnArgs: FnArg[] = [
      new FnArg(protoViewRef, RenderProtoViewRef),
      new FnArg(fragmentCount, null),
    ];
    var method = "createView";
    if (isPresent(hostElementSelector) && hostElementSelector != null) {
      fnArgs.push(new FnArg(hostElementSelector, null));
      method = "createRootHostView";
    }
    fnArgs.push(new FnArg(startIndex, null));

    var args = new UiArguments(method, fnArgs);
    this._messageBroker.runOnService(args, null);

    return renderViewWithFragments;
  }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("destroyView", fnArgs);
    this._messageBroker.runOnService(args, null);
    this._renderViewStore.remove(viewRef);
  }

  /**
   * Attaches a fragment after another fragment.
   */
  attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef,
                              fragmentRef: RenderFragmentRef) {
    var fnArgs = [
      new FnArg(previousFragmentRef, RenderFragmentRef),
      new FnArg(fragmentRef, RenderFragmentRef)
    ];
    var args = new UiArguments("attachFragmentAfterFragment", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Attaches a fragment after an element.
   */
  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {
    var fnArgs =
        [new FnArg(elementRef, WebWorkerElementRef), new FnArg(fragmentRef, RenderFragmentRef)];
    var args = new UiArguments("attachFragmentAfterElement", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Detaches a fragment.
   */
  detachFragment(fragmentRef: RenderFragmentRef) {
    var fnArgs = [new FnArg(fragmentRef, RenderFragmentRef)];
    var args = new UiArguments("detachFragment", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("hydrateView", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("dehydrateView", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Returns the native element at the given location.
   * Attention: In a WebWorker scenario, this should always return null!
   */
  getNativeElementSync(location: RenderElementRef): any { return null; }

  /**
   * Sets a property on an element.
   */
  setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ];
    var args = new UiArguments("setElementProperty", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets an attribute on an element.
   */
  setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(attributeName, null),
      new FnArg(attributeValue, null)
    ];
    var args = new UiArguments("setElementAttribute", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets a class on an element.
   */
  setElementClass(location: RenderElementRef, className: string, isAdd: boolean) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(className, null),
      new FnArg(isAdd, null)
    ];
    var args = new UiArguments("setElementClass", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets a style on an element.
   */
  setElementStyle(location: RenderElementRef, styleName: string, styleValue: string) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(styleName, null),
      new FnArg(styleValue, null)
    ];
    var args = new UiArguments("setElementStyle", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Calls a method on an element.
   * Note: For now we're assuming that everything in the args list are primitive
   */
  invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(methodName, null),
      new FnArg(args, null)
    ];
    var uiArgs = new UiArguments("invokeElementMethod", fnArgs);
    this._messageBroker.runOnService(uiArgs, null);
  }

  /**
   * Sets the value of a text node.
   */
  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string) {
    var fnArgs =
        [new FnArg(viewRef, RenderViewRef), new FnArg(textNodeIndex, null), new FnArg(text, null)];
    var args = new UiArguments("setText", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("setEventDispatcher", fnArgs);
    this._eventDispatcher.registerEventDispatcher(viewRef, dispatcher);
    this._messageBroker.runOnService(args, null);
  }
}
