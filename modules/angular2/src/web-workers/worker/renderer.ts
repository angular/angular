import {
  Renderer,
  RenderCompiler,
  RenderDirectiveMetadata,
  ProtoViewDto,
  ViewDefinition,
  RenderProtoViewRef,
  RenderViewRef,
  RenderElementRef,
  RenderEventDispatcher,
  RenderProtoViewMergeMapping,
  RenderViewWithFragments,
  RenderFragmentRef
} from 'angular2/src/render/api';
import {Promise, PromiseWrapper} from "angular2/src/facade/async";
import {MessageBroker, FnArg, UiArguments} from "angular2/src/web-workers/worker/broker";
import {isPresent, print, BaseException} from "angular2/src/facade/lang";
import {Injectable} from "angular2/di";
import {
  RenderViewWithFragmentsStore,
  WebWorkerRenderViewRef
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';
import {WebWorkerElementRef} from 'angular2/src/web-workers/shared/api';

@Injectable()
export class WebWorkerCompiler implements RenderCompiler {
  constructor(private _messageBroker: MessageBroker) {}
  /**
   * Creats a ProtoViewDto that contains a single nested component with the given componentId.
   */
  compileHost(directiveMetadata: RenderDirectiveMetadata): Promise<ProtoViewDto> {
    var fnArgs: List<FnArg> = [new FnArg(directiveMetadata, RenderDirectiveMetadata)];
    var args: UiArguments = new UiArguments("compiler", "compileHost", fnArgs);
    return this._messageBroker.runOnUiThread(args, ProtoViewDto);
  }

  /**
   * Compiles a single DomProtoView. Non recursive so that
   * we don't need to serialize all possible components over the wire,
   * but only the needed ones based on previous calls.
   */
  compile(view: ViewDefinition): Promise<ProtoViewDto> {
    var fnArgs: List<FnArg> = [new FnArg(view, ViewDefinition)];
    var args: UiArguments = new UiArguments("compiler", "compile", fnArgs);
    return this._messageBroker.runOnUiThread(args, ProtoViewDto);
  }

  /**
   * Merges ProtoViews.
   * The first entry of the array is the protoview into which all the other entries of the array
   * should be merged.
   * If the array contains other arrays, they will be merged before processing the parent array.
   * The array must contain an entry for every component and embedded ProtoView of the first entry.
   * @param protoViewRefs List of ProtoViewRefs or nested
   * @return the merge result for every input array in depth first order.
   */
  mergeProtoViewsRecursively(
      protoViewRefs: List<RenderProtoViewRef | List<any>>): Promise<RenderProtoViewMergeMapping> {
    var fnArgs: List<FnArg> = [new FnArg(protoViewRefs, RenderProtoViewRef)];
    var args: UiArguments = new UiArguments("compiler", "mergeProtoViewsRecursively", fnArgs);
    return this._messageBroker.runOnUiThread(args, RenderProtoViewMergeMapping);
  }
}


@Injectable()
export class WebWorkerRenderer implements Renderer {
  constructor(private _messageBroker: MessageBroker,
              private _renderViewStore: RenderViewWithFragmentsStore) {}
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
    var fnArgs: List<FnArg> = [
      new FnArg(protoViewRef, RenderProtoViewRef),
      new FnArg(fragmentCount, null),
    ];
    var method = "createView";
    if (isPresent(hostElementSelector) && hostElementSelector != null) {
      fnArgs.push(new FnArg(hostElementSelector, null));
      method = "createRootHostView";
    }
    fnArgs.push(new FnArg(startIndex, null));

    var args = new UiArguments("renderer", method, fnArgs);
    this._messageBroker.runOnUiThread(args, null);

    return renderViewWithFragments;
  }

  /**
   * Destroys the given view after it has been dehydrated and detached
   */
  destroyView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("renderer", "destroyView", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
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
    var args = new UiArguments("renderer", "attachFragmentAfterFragment", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Attaches a fragment after an element.
   */
  attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef) {
    var fnArgs =
        [new FnArg(elementRef, WebWorkerElementRef), new FnArg(fragmentRef, RenderFragmentRef)];
    var args = new UiArguments("renderer", "attachFragmentAfterElement", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Detaches a fragment.
   */
  detachFragment(fragmentRef: RenderFragmentRef) {
    var fnArgs = [new FnArg(fragmentRef, RenderFragmentRef)];
    var args = new UiArguments("renderer", "detachFragment", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  hydrateView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("renderer", "hydrateView", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
   * inside of the view pool.
   */
  dehydrateView(viewRef: RenderViewRef) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("renderer", "dehydrateView", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
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
    var args = new UiArguments("renderer", "setElementProperty", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
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
    var args = new UiArguments("renderer", "setElementAttribute", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
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
    var args = new UiArguments("renderer", "setElementClass", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
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
    var args = new UiArguments("renderer", "setElementStyle", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Calls a method on an element.
   * Note: For now we're assuming that everything in the args list are primitive
   */
  invokeElementMethod(location: RenderElementRef, methodName: string, args: List<any>) {
    var fnArgs = [
      new FnArg(location, WebWorkerElementRef),
      new FnArg(methodName, null),
      new FnArg(args, null)
    ];
    var uiArgs = new UiArguments("renderer", "invokeElementMethod", fnArgs);
    this._messageBroker.runOnUiThread(uiArgs, null);
  }

  /**
   * Sets the value of a text node.
   */
  setText(viewRef: RenderViewRef, textNodeIndex: number, text: string) {
    var fnArgs =
        [new FnArg(viewRef, RenderViewRef), new FnArg(textNodeIndex, null), new FnArg(text, null)];
    var args = new UiArguments("renderer", "setText", fnArgs);
    this._messageBroker.runOnUiThread(args, null);
  }

  /**
   * Sets the dispatcher for all events of the given view
   */
  setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher) {
    var fnArgs = [new FnArg(viewRef, RenderViewRef)];
    var args = new UiArguments("renderer", "setEventDispatcher", fnArgs);
    this._messageBroker.registerEventDispatcher(viewRef, dispatcher);
    this._messageBroker.runOnUiThread(args, null);
  }
}
