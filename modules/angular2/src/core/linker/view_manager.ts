import {
  Injector,
  Inject,
  Provider,
  Injectable,
  ResolvedProvider,
  forwardRef
} from 'angular2/src/core/di';
import {isPresent, isBlank, isArray} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {AppView, HostViewFactory, flattenNestedViewRenderNodes, findLastRenderNode} from './view';
import {AppElement} from './element';
import {ElementRef, ElementRef_} from './element_ref';
import {
  HostViewFactoryRef,
  HostViewFactoryRef_,
  EmbeddedViewRef,
  HostViewRef,
  ViewRef,
  ViewRef_
} from './view_ref';
import {ViewContainerRef} from './view_container_ref';
import {TemplateRef, TemplateRef_} from './template_ref';
import {RootRenderer, RenderComponentType} from 'angular2/src/core/render/api';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {APP_ID} from 'angular2/src/core/application_tokens';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {ViewType} from './view_type';

/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export abstract class AppViewManager {
  /**
   * Returns a {@link ViewContainerRef} of the View Container at the specified location.
   */
  abstract getViewContainer(location: ElementRef): ViewContainerRef;

  /**
   * Returns the {@link ElementRef} that makes up the specified Host View.
   */
  abstract getHostElement(hostViewRef: HostViewRef): ElementRef;

  /**
   * Searches the Component View of the Component specified via `hostLocation` and returns the
   * {@link ElementRef} for the Element identified via a Variable Name `variableName`.
   *
   * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
   * variable `variableName` couldn't be found in the Component View of this Component.
   */
  abstract getNamedElementInComponentView(hostLocation: ElementRef,
                                          variableName: string): ElementRef;

  /**
   * Returns the component instance for the provided Host Element.
   */
  abstract getComponent(hostLocation: ElementRef): any;

  /**
   * Creates an instance of a Component and attaches it to the first element in the global View
   * (usually DOM Document) that matches the component's selector or `overrideSelector`.
   *
   * This as a low-level way to bootstrap an application and upgrade an existing Element to a
   * Host Element. Most applications should use {@link DynamicComponentLoader#loadAsRoot} instead.
   *
   * The Component and its View are created based on the `hostProtoComponentRef` which can be
   * obtained
   * by compiling the component with {@link Compiler#compileInHost}.
   *
   * Use {@link AppViewManager#destroyRootHostView} to destroy the created Component and it's Host
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
  abstract createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string,
                              injector: Injector, projectableNodes?: any[][]): HostViewRef;

  /**
   * Destroys the Host View created via {@link AppViewManager#createRootHostView}.
   *
   * Along with the Host View, the Component Instance as well as all nested View and Components are
   * destroyed as well.
   */
  abstract destroyRootHostView(hostViewRef: HostViewRef);

  /**
   * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
   * into the View Container specified via `viewContainerLocation` at the specified `index`.
   *
   * Returns the {@link ViewRef} for the newly created View.
   *
   * This as a low-level way to create and attach an Embedded via to a View Container. Most
   * applications should used {@link ViewContainerRef#createEmbeddedView} instead.
   *
   * Use {@link AppViewManager#destroyViewInContainer} to destroy the created Embedded View.
   */
  // TODO(i): this low-level version of ViewContainerRef#createEmbeddedView doesn't add anything new
  //    we should make it private, otherwise we have two apis to do the same thing.
  abstract createEmbeddedViewInContainer(viewContainerLocation: ElementRef, index: number,
                                         templateRef: TemplateRef): EmbeddedViewRef;

  /**
   * Instantiates a single {@link Component} and inserts its Host View into the View Container
   * found at `viewContainerLocation`. Within the container, the view will be inserted at position
   * specified via `index`.
   *
   * The component is instantiated using its {@link ProtoViewRef `protoViewRef`} which can be
   * obtained via {@link Compiler#compileInHost}.
   *
   * You can optionally specify `dynamicallyCreatedProviders`, which configure the {@link Injector}
   * that will be created for the Host View.
   *
   * Returns the {@link HostViewRef} of the Host View created for the newly instantiated Component.
   *
   * Use {@link AppViewManager#destroyViewInContainer} to destroy the created Host View.
   */
  abstract createHostViewInContainer(
      viewContainerLocation: ElementRef, index: number, hostViewFactoryRef: HostViewFactoryRef,
      dynamicallyCreatedProviders: ResolvedProvider[], projectableNodes: any[][]): HostViewRef;

  /**
   * Destroys an Embedded or Host View attached to a View Container at the specified `index`.
   *
   * The View Container is located via `viewContainerLocation`.
   */
  abstract destroyViewInContainer(viewContainerLocation: ElementRef, index: number);

  /**
   *
   * See {@link AppViewManager#detachViewInContainer}.
   */
  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  abstract attachViewInContainer(viewContainerLocation: ElementRef, index: number,
                                 viewRef: EmbeddedViewRef): EmbeddedViewRef;

  /**
   * See {@link AppViewManager#attachViewInContainer}.
   */
  abstract detachViewInContainer(viewContainerLocation: ElementRef, index: number): EmbeddedViewRef;
}

@Injectable()
export class AppViewManager_ extends AppViewManager {
  private _nextCompTypeId: number = 0;

  constructor(private _renderer: RootRenderer, @Inject(APP_ID) private _appId: string) { super(); }

  getViewContainer(location: ElementRef): ViewContainerRef {
    return (<ElementRef_>location).internalElement.getViewContainerRef();
  }

  getHostElement(hostViewRef: ViewRef): ElementRef {
    var hostView = (<ViewRef_>hostViewRef).internalView;
    if (hostView.proto.type !== ViewType.HOST) {
      throw new BaseException('This operation is only allowed on host views');
    }
    return hostView.appElements[0].ref;
  }

  getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef {
    var appEl = (<ElementRef_>hostLocation).internalElement;
    var componentView = appEl.componentView;
    if (isBlank(componentView)) {
      throw new BaseException(`There is no component directive at element ${hostLocation}`);
    }
    for (var i = 0; i < componentView.appElements.length; i++) {
      var compAppEl = componentView.appElements[i];
      if (StringMapWrapper.contains(compAppEl.proto.directiveVariableBindings, variableName)) {
        return compAppEl.ref;
      }
    }
    throw new BaseException(`Could not find variable ${variableName}`);
  }

  getComponent(hostLocation: ElementRef): any {
    return (<ElementRef_>hostLocation).internalElement.getComponent();
  }

  /** @internal */
  _createRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#createRootHostView()');

  createRootHostView(hostViewFactoryRef: HostViewFactoryRef, overrideSelector: string,
                     injector: Injector, projectableNodes: any[][] = null): HostViewRef {
    var s = this._createRootHostViewScope();
    var hostViewFactory = (<HostViewFactoryRef_>hostViewFactoryRef).internalHostViewFactory;
    var selector = isPresent(overrideSelector) ? overrideSelector : hostViewFactory.selector;
    var view = hostViewFactory.viewFactory(this._renderer, this, null, projectableNodes, selector,
                                           null, injector);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _destroyRootHostViewScope: WtfScopeFn = wtfCreateScope('AppViewManager#destroyRootHostView()');

  destroyRootHostView(hostViewRef: ViewRef) {
    var s = this._destroyRootHostViewScope();
    var hostView = (<ViewRef_>hostViewRef).internalView;
    hostView.renderer.detachView(flattenNestedViewRenderNodes(hostView.rootNodesOrAppElements));
    hostView.destroy();
    wtfLeave(s);
  }

  /** @internal */
  _createEmbeddedViewInContainerScope: WtfScopeFn =
      wtfCreateScope('AppViewManager#createEmbeddedViewInContainer()');

  createEmbeddedViewInContainer(viewContainerLocation: ElementRef, index: number,
                                templateRef: TemplateRef): EmbeddedViewRef {
    var s = this._createEmbeddedViewInContainerScope();
    var contextEl = (<TemplateRef_>templateRef).elementRef.internalElement;
    var view: AppView =
        contextEl.embeddedViewFactory(contextEl.parentView.renderer, this, contextEl,
                                      contextEl.parentView.projectableNodes, null, null, null);
    this._attachViewToContainer(view, (<ElementRef_>viewContainerLocation).internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _createHostViewInContainerScope: WtfScopeFn =
      wtfCreateScope('AppViewManager#createHostViewInContainer()');

  createHostViewInContainer(viewContainerLocation: ElementRef, index: number,
                            hostViewFactoryRef: HostViewFactoryRef,
                            dynamicallyCreatedProviders: ResolvedProvider[],
                            projectableNodes: any[][]): HostViewRef {
    var s = this._createHostViewInContainerScope();
    // TODO(tbosch): This should be specifiable via an additional argument!
    var viewContainerLocation_ = <ElementRef_>viewContainerLocation;
    var contextEl = viewContainerLocation_.internalElement;
    var hostViewFactory = (<HostViewFactoryRef_>hostViewFactoryRef).internalHostViewFactory;
    var view = hostViewFactory.viewFactory(
        contextEl.parentView.renderer, contextEl.parentView.viewManager, contextEl,
        projectableNodes, null, dynamicallyCreatedProviders, null);
    this._attachViewToContainer(view, viewContainerLocation_.internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _destroyViewInContainerScope = wtfCreateScope('AppViewMananger#destroyViewInContainer()');

  destroyViewInContainer(viewContainerLocation: ElementRef, index: number) {
    var s = this._destroyViewInContainerScope();
    var view =
        this._detachViewInContainer((<ElementRef_>viewContainerLocation).internalElement, index);
    view.destroy();
    wtfLeave(s);
  }

  /** @internal */
  _attachViewInContainerScope = wtfCreateScope('AppViewMananger#attachViewInContainer()');

  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  attachViewInContainer(viewContainerLocation: ElementRef, index: number,
                        viewRef: ViewRef): EmbeddedViewRef {
    var viewRef_ = <ViewRef_>viewRef;
    var s = this._attachViewInContainerScope();
    this._attachViewToContainer(viewRef_.internalView,
                                (<ElementRef_>viewContainerLocation).internalElement, index);
    return wtfLeave(s, viewRef_);
  }

  /** @internal */
  _detachViewInContainerScope = wtfCreateScope('AppViewMananger#detachViewInContainer()');

  // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
  detachViewInContainer(viewContainerLocation: ElementRef, index: number): EmbeddedViewRef {
    var s = this._detachViewInContainerScope();
    var view =
        this._detachViewInContainer((<ElementRef_>viewContainerLocation).internalElement, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  onViewCreated(view: AppView) {}

  /** @internal */
  onViewDestroyed(view: AppView) {}

  /** @internal */
  createRenderComponentType(encapsulation: ViewEncapsulation,
                            styles: Array<string | any[]>): RenderComponentType {
    return new RenderComponentType(`${this._appId}-${this._nextCompTypeId++}`, encapsulation,
                                   styles);
  }

  private _attachViewToContainer(view: AppView, vcAppElement: AppElement, viewIndex: number) {
    if (view.proto.type === ViewType.COMPONENT) {
      throw new BaseException(`Component views can't be moved!`);
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
      refNode = prevView.rootNodesOrAppElements.length > 0 ?
                    prevView.rootNodesOrAppElements[prevView.rootNodesOrAppElements.length - 1] :
                    null;
    } else {
      refNode = vcAppElement.nativeElement;
    }
    if (isPresent(refNode)) {
      var refRenderNode = findLastRenderNode(refNode);
      view.renderer.attachViewAfter(refRenderNode,
                                    flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
    }
    // TODO: This is only needed when a view is destroyed,
    // not when it is detached for reordering with ng-for...
    vcAppElement.parentView.changeDetector.addContentChild(view.changeDetector);
    vcAppElement.traverseAndSetQueriesAsDirty();
  }

  private _detachViewInContainer(vcAppElement: AppElement, viewIndex: number): AppView {
    var view = ListWrapper.removeAt(vcAppElement.nestedViews, viewIndex);
    if (view.proto.type === ViewType.COMPONENT) {
      throw new BaseException(`Component views can't be moved!`);
    }
    vcAppElement.traverseAndSetQueriesAsDirty();

    view.renderer.detachView(flattenNestedViewRenderNodes(view.rootNodesOrAppElements));

    // TODO: This is only needed when a view is destroyed,
    // not when it is detached for reordering with ng-for...
    view.changeDetector.remove();
    return view;
  }
}
