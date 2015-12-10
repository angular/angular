library angular2.src.web_workers.worker.renderer;

import "package:angular2/src/core/render/api.dart"
    show
        Renderer,
        RenderProtoViewRef,
        RenderViewRef,
        RenderElementRef,
        RenderEventDispatcher,
        RenderViewWithFragments,
        RenderFragmentRef,
        RenderTemplateCmd,
        RenderComponentTemplate;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments;
import "package:angular2/src/facade/lang.dart" show isPresent, print;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore, WebWorkerRenderViewRef;
import "package:angular2/src/web_workers/shared/api.dart"
    show WebWorkerElementRef, WebWorkerTemplateCmd;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show RENDERER_CHANNEL;
import "package:angular2/src/web_workers/worker/event_dispatcher.dart"
    show WebWorkerEventDispatcher;

@Injectable()
class WebWorkerRenderer implements Renderer {
  RenderProtoViewRefStore _renderProtoViewRefStore;
  RenderViewWithFragmentsStore _renderViewStore;
  WebWorkerEventDispatcher _eventDispatcher;
  var _messageBroker;
  WebWorkerRenderer(
      ClientMessageBrokerFactory messageBrokerFactory,
      this._renderProtoViewRefStore,
      this._renderViewStore,
      this._eventDispatcher) {
    this._messageBroker =
        messageBrokerFactory.createMessageBroker(RENDERER_CHANNEL);
  }
  registerComponentTemplate(RenderComponentTemplate template) {
    var fnArgs = [new FnArg(template, RenderComponentTemplate)];
    var args = new UiArguments("registerComponentTemplate", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  RenderProtoViewRef createProtoView(
      String componentTemplateId, List<RenderTemplateCmd> cmds) {
    var renderProtoViewRef = this._renderProtoViewRefStore.allocate();
    List<FnArg> fnArgs = [
      new FnArg(componentTemplateId, null),
      new FnArg(cmds, WebWorkerTemplateCmd),
      new FnArg(renderProtoViewRef, RenderProtoViewRef)
    ];
    UiArguments args = new UiArguments("createProtoView", fnArgs);
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
  RenderViewWithFragments createRootHostView(
      RenderProtoViewRef hostProtoViewRef,
      num fragmentCount,
      String hostElementSelector) {
    return this._createViewHelper(
        hostProtoViewRef, fragmentCount, hostElementSelector);
  }

  /**
   * Creates a regular view out of the given ProtoView
   * Note that the fragmentCount needs to be passed in so that we can create a result
   * synchronously even when dealing with webworkers!
   */
  RenderViewWithFragments createView(
      RenderProtoViewRef protoViewRef, num fragmentCount) {
    return this._createViewHelper(protoViewRef, fragmentCount);
  }

  RenderViewWithFragments _createViewHelper(
      RenderProtoViewRef protoViewRef, num fragmentCount,
      [String hostElementSelector]) {
    var renderViewWithFragments = this._renderViewStore.allocate(fragmentCount);
    var startIndex = (((renderViewWithFragments.viewRef)
        as WebWorkerRenderViewRef)).refNumber;
    List<FnArg> fnArgs = [
      new FnArg(protoViewRef, RenderProtoViewRef),
      new FnArg(fragmentCount, null)
    ];
    var method = "createView";
    if (isPresent(hostElementSelector) && hostElementSelector != null) {
      fnArgs.add(new FnArg(hostElementSelector, null));
      method = "createRootHostView";
    }
    fnArgs.add(new FnArg(startIndex, null));
    var args = new UiArguments(method, fnArgs);
    this._messageBroker.runOnService(args, null);
    return renderViewWithFragments;
  }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(RenderViewRef viewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("destroyView", fnArgs);
    this._messageBroker.runOnService(args, null);
    this._renderViewStore.remove(viewRef);
  }

  /**
   * Attaches a fragment after another fragment.
   */
  attachFragmentAfterFragment(
      RenderFragmentRef previousFragmentRef, RenderFragmentRef fragmentRef) {
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
  attachFragmentAfterElement(
      RenderElementRef elementRef, RenderFragmentRef fragmentRef) {
    var fnArgs = [
      new FnArg(elementRef, WebWorkerElementRef),
      new FnArg(fragmentRef, RenderFragmentRef)
    ];
    var args = new UiArguments("attachFragmentAfterElement", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Detaches a fragment.
   */
  detachFragment(RenderFragmentRef fragmentRef) {
    var fnArgs = [new FnArg(fragmentRef, RenderFragmentRef)];
    var args = new UiArguments("detachFragment", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(RenderViewRef viewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("hydrateView", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(RenderViewRef viewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("dehydrateView", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Returns the native element at the given location.
   * Attention: In a WebWorker scenario, this should always return null!
   */
  dynamic getNativeElementSync(RenderElementRef location) {
    return null;
  }

  /**
   * Sets a property on an element.
   */
  setElementProperty(
      RenderElementRef location, String propertyName, dynamic propertyValue) {
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
  setElementAttribute(
      RenderElementRef location, String attributeName, String attributeValue) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(attributeName, null),
      new FnArg(attributeValue, null)
    ];
    var args = new UiArguments("setElementAttribute", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  void setBindingDebugInfo(
      RenderElementRef location, String propertyName, String propertyValue) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ];
    var args = new UiArguments("setBindingDebugInfo", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets a class on an element.
   */
  setElementClass(RenderElementRef location, String className, bool isAdd) {
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
  setElementStyle(
      RenderElementRef location, String styleName, String styleValue) {
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
  invokeElementMethod(
      RenderElementRef location, String methodName, List<dynamic> args) {
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
  setText(RenderViewRef viewRef, num textNodeIndex, String text) {
    var fnArgs = [
      new FnArg(viewRef, RenderViewRef),
      new FnArg(textNodeIndex, null),
      new FnArg(text, null)
    ];
    var args = new UiArguments("setText", fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(RenderViewRef viewRef, RenderEventDispatcher dispatcher) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("setEventDispatcher", fnArgs);
    this._eventDispatcher.registerEventDispatcher(viewRef, dispatcher);
    this._messageBroker.runOnService(args, null);
  }
}
