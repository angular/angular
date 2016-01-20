library angular2.src.core.linker.view_manager;

import "package:angular2/src/core/di.dart"
    show
        Injector,
        Inject,
        Provider,
        Injectable,
        ResolvedProvider,
        OpaqueToken,
        Optional;
import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, isArray, Type;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "view.dart" show AppView, HostViewFactory, flattenNestedViewRenderNodes;
import "element.dart" show AppElement;
import "element_ref.dart" show ElementRef, ElementRef_;
import "view_ref.dart"
    show
        HostViewFactoryRef,
        HostViewFactoryRef_,
        EmbeddedViewRef,
        HostViewRef,
        ViewRef_;
import "view_container_ref.dart" show ViewContainerRef;
import "template_ref.dart" show TemplateRef, TemplateRef_;
import "view_listener.dart" show AppViewListener, ViewFactoryProxy;
import "package:angular2/src/core/render/api.dart"
    show RootRenderer, RenderComponentType;
import "../profile/profile.dart" show wtfCreateScope, wtfLeave, WtfScopeFn;
import "package:angular2/src/core/application_tokens.dart" show APP_ID;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "view_type.dart" show ViewType;

/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like [DynamicComponentLoader] and
 * [ViewContainerRef] instead.
 */
abstract class AppViewManager {
  /**
   * Returns a [ViewContainerRef] of the View Container at the specified location.
   */
  ViewContainerRef getViewContainer(ElementRef location);
  /**
   * Returns the [ElementRef] that makes up the specified Host View.
   */
  ElementRef getHostElement(HostViewRef hostViewRef);
  /**
   * Searches the Component View of the Component specified via `hostLocation` and returns the
   * [ElementRef] for the Element identified via a Variable Name `variableName`.
   *
   * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
   * variable `variableName` couldn't be found in the Component View of this Component.
   */
  ElementRef getNamedElementInComponentView(
      ElementRef hostLocation, String variableName);
  /**
   * Returns the component instance for the provided Host Element.
   */
  dynamic getComponent(ElementRef hostLocation);
  /**
   * Creates an instance of a Component and attaches it to the first element in the global View
   * (usually DOM Document) that matches the component's selector or `overrideSelector`.
   *
   * This as a low-level way to bootstrap an application and upgrade an existing Element to a
   * Host Element. Most applications should use [DynamicComponentLoader#loadAsRoot] instead.
   *
   * The Component and its View are created based on the `hostProtoComponentRef` which can be
   * obtained
   * by compiling the component with [Compiler#compileInHost].
   *
   * Use [AppViewManager#destroyRootHostView] to destroy the created Component and it's Host
   * View.
   *
   * ### Example
   *
   * ```
   * @ng.Component({
   *   selector: 'child-component'
   * })
   * @ng.View({
   *   template: 'Child'
   * })
   * class ChildComponent {
   *
   * }
   *
   * @ng.Component({
   *   selector: 'my-app'
   * })
   * @ng.View({
   *   template: `
   *     Parent (<some-component></some-component>)
   *   `
   * })
   * class MyApp implements OnDestroy {
   *   viewRef: ng.ViewRef;
   *
   *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
   *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoComponentRef) => {
   *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
   *     })
   *   }
   *
   *   ngOnDestroy() {
   *     this.appViewManager.destroyRootHostView(this.viewRef);
   *     this.viewRef = null;
   *   }
   * }
   *
   * ng.bootstrap(MyApp);
   * ```
   */
  HostViewRef createRootHostView(HostViewFactoryRef hostViewFactoryRef,
      String overrideSelector, Injector injector,
      [List<List<dynamic>> projectableNodes]);
  /**
   * Destroys the Host View created via [AppViewManager#createRootHostView].
   *
   * Along with the Host View, the Component Instance as well as all nested View and Components are
   * destroyed as well.
   */
  destroyRootHostView(HostViewRef hostViewRef);
  /**
   * Instantiates an Embedded View based on the [TemplateRef `templateRef`] and inserts it
   * into the View Container specified via `viewContainerLocation` at the specified `index`.
   *
   * Returns the [ViewRef] for the newly created View.
   *
   * This as a low-level way to create and attach an Embedded via to a View Container. Most
   * applications should used [ViewContainerRef#createEmbeddedView] instead.
   *
   * Use [AppViewManager#destroyViewInContainer] to destroy the created Embedded View.
   */

  // TODO(i): this low-level version of ViewContainerRef#createEmbeddedView doesn't add anything new

  //    we should make it private, otherwise we have two apis to do the same thing.
  EmbeddedViewRef createEmbeddedViewInContainer(
      ElementRef viewContainerLocation, num index, TemplateRef templateRef);
  /**
   * Instantiates a single [Component] and inserts its Host View into the View Container
   * found at `viewContainerLocation`. Within the container, the view will be inserted at position
   * specified via `index`.
   *
   * The component is instantiated using its [ProtoViewRef `protoViewRef`] which can be
   * obtained via [Compiler#compileInHost].
   *
   * You can optionally specify `dynamicallyCreatedProviders`, which configure the [Injector]
   * that will be created for the Host View.
   *
   * Returns the [HostViewRef] of the Host View created for the newly instantiated Component.
   *
   * Use [AppViewManager#destroyViewInContainer] to destroy the created Host View.
   */
  HostViewRef createHostViewInContainer(
      ElementRef viewContainerLocation,
      num index,
      HostViewFactoryRef hostViewFactoryRef,
      List<ResolvedProvider> dynamicallyCreatedProviders,
      List<List<dynamic>> projectableNodes);
  /**
   * Destroys an Embedded or Host View attached to a View Container at the specified `index`.
   *
   * The View Container is located via `viewContainerLocation`.
   */
  destroyViewInContainer(ElementRef viewContainerLocation, num index);
  /**
   *
   * See [AppViewManager#detachViewInContainer].
   */

  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  EmbeddedViewRef attachViewInContainer(
      ElementRef viewContainerLocation, num index, EmbeddedViewRef viewRef);
  /**
   * See [AppViewManager#attachViewInContainer].
   */
  EmbeddedViewRef detachViewInContainer(
      ElementRef viewContainerLocation, num index);
}

@Injectable()
class AppViewManager_ extends AppViewManager {
  RootRenderer _renderer;
  AppViewListener _viewListener;
  ViewFactoryProxy _viewFactoryProxy;
  String _appId;
  num _nextCompTypeId = 0;
  AppViewManager_(this._renderer, this._viewListener, this._viewFactoryProxy,
      @Inject(APP_ID) this._appId)
      : super() {
    /* super call moved to initializer */;
  }
  ViewContainerRef getViewContainer(ElementRef_ location) {
    return location.internalElement.getViewContainerRef();
  }

  ElementRef getHostElement(ViewRef_ hostViewRef) {
    var hostView = hostViewRef.internalView;
    if (!identical(hostView.proto.type, ViewType.HOST)) {
      throw new BaseException("This operation is only allowed on host views");
    }
    return hostView.appElements[0].ref;
  }

  ElementRef getNamedElementInComponentView(
      ElementRef_ hostLocation, String variableName) {
    var appEl = hostLocation.internalElement;
    var componentView = appEl.componentView;
    if (isBlank(componentView)) {
      throw new BaseException(
          '''There is no component directive at element ${ hostLocation}''');
    }
    for (var i = 0; i < componentView.appElements.length; i++) {
      var compAppEl = componentView.appElements[i];
      if (StringMapWrapper.contains(
          compAppEl.proto.directiveVariableBindings, variableName)) {
        return compAppEl.ref;
      }
    }
    throw new BaseException('''Could not find variable ${ variableName}''');
  }

  dynamic getComponent(ElementRef_ hostLocation) {
    return hostLocation.internalElement.getComponent();
  }

  /** @internal */
  WtfScopeFn _createRootHostViewScope =
      wtfCreateScope("AppViewManager#createRootHostView()");
  HostViewRef createRootHostView(HostViewFactoryRef_ hostViewFactoryRef,
      String overrideSelector, Injector injector,
      [List<List<dynamic>> projectableNodes = null]) {
    var s = this._createRootHostViewScope();
    var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
    var selector = isPresent(overrideSelector)
        ? overrideSelector
        : hostViewFactory.selector;
    var view = hostViewFactory.viewFactory(
        this._renderer, this, null, projectableNodes, selector, null, injector);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  WtfScopeFn _destroyRootHostViewScope =
      wtfCreateScope("AppViewManager#destroyRootHostView()");
  destroyRootHostView(ViewRef_ hostViewRef) {
    var s = this._destroyRootHostViewScope();
    var hostView = hostViewRef.internalView;
    hostView.renderer.detachView(
        flattenNestedViewRenderNodes(hostView.rootNodesOrAppElements));
    hostView.destroy();
    wtfLeave(s);
  }

  /** @internal */
  WtfScopeFn _createEmbeddedViewInContainerScope =
      wtfCreateScope("AppViewManager#createEmbeddedViewInContainer()");
  EmbeddedViewRef createEmbeddedViewInContainer(
      ElementRef_ viewContainerLocation, num index, TemplateRef_ templateRef) {
    var s = this._createEmbeddedViewInContainerScope();
    var contextEl = templateRef.elementRef.internalElement;
    AppView view = contextEl.embeddedViewFactory(
        contextEl.parentView.renderer,
        this,
        contextEl,
        contextEl.parentView.projectableNodes,
        null,
        null,
        null);
    this._attachViewToContainer(
        view, viewContainerLocation.internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  WtfScopeFn _createHostViewInContainerScope =
      wtfCreateScope("AppViewManager#createHostViewInContainer()");
  HostViewRef createHostViewInContainer(
      ElementRef_ viewContainerLocation,
      num index,
      HostViewFactoryRef_ hostViewFactoryRef,
      List<ResolvedProvider> dynamicallyCreatedProviders,
      List<List<dynamic>> projectableNodes) {
    var s = this._createHostViewInContainerScope();
    // TODO(tbosch): This should be specifiable via an additional argument!
    var contextEl = viewContainerLocation.internalElement;
    var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
    var view = hostViewFactory.viewFactory(
        contextEl.parentView.renderer,
        contextEl.parentView.viewManager,
        contextEl,
        projectableNodes,
        null,
        dynamicallyCreatedProviders,
        null);
    this._attachViewToContainer(
        view, viewContainerLocation.internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  var _destroyViewInContainerScope =
      wtfCreateScope("AppViewMananger#destroyViewInContainer()");
  destroyViewInContainer(ElementRef_ viewContainerLocation, num index) {
    var s = this._destroyViewInContainerScope();
    var view = this
        ._detachViewInContainer(viewContainerLocation.internalElement, index);
    view.destroy();
    wtfLeave(s);
  }

  /** @internal */
  var _attachViewInContainerScope =
      wtfCreateScope("AppViewMananger#attachViewInContainer()");
  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  EmbeddedViewRef attachViewInContainer(
      ElementRef_ viewContainerLocation, num index, ViewRef_ viewRef) {
    var s = this._attachViewInContainerScope();
    this._attachViewToContainer(
        viewRef.internalView, viewContainerLocation.internalElement, index);
    return wtfLeave(s, viewRef);
  }

  /** @internal */
  var _detachViewInContainerScope =
      wtfCreateScope("AppViewMananger#detachViewInContainer()");
  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  EmbeddedViewRef detachViewInContainer(
      ElementRef_ viewContainerLocation, num index) {
    var s = this._detachViewInContainerScope();
    var view = this
        ._detachViewInContainer(viewContainerLocation.internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  onViewCreated(AppView view) {
    this._viewListener.onViewCreated(view);
  }

  /** @internal */
  onViewDestroyed(AppView view) {
    this._viewListener.onViewDestroyed(view);
  }

  /** @internal */
  RenderComponentType createRenderComponentType(ViewEncapsulation encapsulation,
      List<dynamic /* String | List < dynamic > */ > styles) {
    return new RenderComponentType(
        '''${ this . _appId}-${ this . _nextCompTypeId ++}''',
        encapsulation,
        styles);
  }

  /** @internal */
  Function getComponentViewFactory(
      Type component, Function originalViewFactory) {
    return this
        ._viewFactoryProxy
        .getComponentViewFactory(component, originalViewFactory);
  }

  _attachViewToContainer(AppView view, AppElement vcAppElement, num viewIndex) {
    if (identical(view.proto.type, ViewType.COMPONENT)) {
      throw new BaseException('''Component views can\'t be moved!''');
    }
    var nestedViews = vcAppElement.nestedViews;
    if (nestedViews == null) {
      nestedViews = [];
      vcAppElement.nestedViews = nestedViews;
    }
    ListWrapper.insert(nestedViews, viewIndex, view);
    var refNode;
    if (viewIndex > 0) {
      var prevView = nestedViews[viewIndex - 1];
      refNode = prevView.rootNodesOrAppElements.length > 0
          ? prevView.rootNodesOrAppElements[
              prevView.rootNodesOrAppElements.length - 1]
          : null;
    } else {
      refNode = vcAppElement.nativeElement;
    }
    if (isPresent(refNode)) {
      var refRenderNode;
      if (refNode is AppElement) {
        refRenderNode = ((refNode as AppElement)).nativeElement;
      } else {
        refRenderNode = refNode;
      }
      view.renderer.attachViewAfter(refRenderNode,
          flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
    }
    // TODO: This is only needed when a view is destroyed,

    // not when it is detached for reordering with ng-for...
    vcAppElement.parentView.changeDetector.addContentChild(view.changeDetector);
    vcAppElement.traverseAndSetQueriesAsDirty();
  }

  AppView _detachViewInContainer(AppElement vcAppElement, num viewIndex) {
    var view = ListWrapper.removeAt(vcAppElement.nestedViews, viewIndex);
    if (identical(view.proto.type, ViewType.COMPONENT)) {
      throw new BaseException('''Component views can\'t be moved!''');
    }
    vcAppElement.traverseAndSetQueriesAsDirty();
    view.renderer
        .detachView(flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
    // TODO: This is only needed when a view is destroyed,

    // not when it is detached for reordering with ng-for...
    view.changeDetector.remove();
    return view;
  }
}
