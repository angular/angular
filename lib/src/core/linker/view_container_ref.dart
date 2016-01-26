library angular2.src.core.linker.view_container_ref;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/core/di.dart" show ResolvedProvider;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "element.dart" show AppElement;
import "element_ref.dart" show ElementRef, ElementRef_;
import "template_ref.dart" show TemplateRef, TemplateRef_;
import "view_ref.dart"
    show
        EmbeddedViewRef,
        HostViewRef,
        HostViewFactoryRef,
        HostViewFactoryRef_,
        ViewRef,
        ViewRef_;

/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * [Component] via [#createHostView], and Embedded Views, created by instantiating an
 * [TemplateRef Embedded Template] via [#createEmbeddedView].
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a [Directive] injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * [AppViewManager#getViewContainer].
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
abstract class ViewContainerRef {
  /**
   * Anchor element that specifies the location of this container in the containing View.
   * <!-- TODO: rename to anchorElement -->
   */
  ElementRef get element {
    return unimplemented();
  }

  /**
   * Destroys all Views in this container.
   */
  void clear() {
    for (var i = this.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  /**
   * Returns the [ViewRef] for the View located in this container at the specified index.
   */
  ViewRef get(num index);
  /**
   * Returns the number of Views currently attached to this container.
   */
  num get length {
    return unimplemented();
  }

  /**
   * Instantiates an Embedded View based on the [TemplateRef `templateRef`] and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the [ViewRef] for the newly created View.
   */
  EmbeddedViewRef createEmbeddedView(TemplateRef templateRef, [num index]);
  /**
   * Instantiates a single [Component] and inserts its Host View into this container at the
   * specified `index`.
   *
   * The component is instantiated using its [ProtoViewRef `protoView`] which can be
   * obtained via [Compiler#compileInHost].
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify `dynamicallyCreatedProviders`, which configure the [Injector]
   * that will be created for the Host View.
   *
   * Returns the [HostViewRef] of the Host View created for the newly instantiated Component.
   */
  HostViewRef createHostView(HostViewFactoryRef hostViewFactoryRef,
      [num index,
      List<ResolvedProvider> dynamicallyCreatedProviders,
      List<List<dynamic>> projectableNodes]);
  /**
   * Inserts a View identified by a [ViewRef] into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted [ViewRef].
   */
  EmbeddedViewRef insert(EmbeddedViewRef viewRef, [num index]);
  /**
   * Returns the index of the View, specified via [ViewRef], within the current container or
   * `-1` if this container doesn't contain the View.
   */
  num indexOf(ViewRef viewRef);
  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  void remove([num index]);
  /**
   * Use along with [#insert] to move a View within the current container.
   *
   * If the `index` param is omitted, the last [ViewRef] is detached.
   */
  EmbeddedViewRef detach([num index]);
}

class ViewContainerRef_ extends ViewContainerRef {
  AppElement _element;
  ViewContainerRef_(this._element) : super() {
    /* super call moved to initializer */;
  }
  EmbeddedViewRef get(num index) {
    return this._element.nestedViews[index].ref;
  }

  num get length {
    var views = this._element.nestedViews;
    return isPresent(views) ? views.length : 0;
  }

  ElementRef_ get element {
    return this._element.ref;
  }
  // TODO(rado): profile and decide whether bounds checks should be added

  // to the methods below.
  EmbeddedViewRef createEmbeddedView(TemplateRef templateRef,
      [num index = -1]) {
    if (index == -1) index = this.length;
    var vm = this._element.parentView.viewManager;
    return vm.createEmbeddedViewInContainer(
        this._element.ref, index, templateRef);
  }

  HostViewRef createHostView(HostViewFactoryRef hostViewFactoryRef,
      [num index = -1,
      List<ResolvedProvider> dynamicallyCreatedProviders = null,
      List<List<dynamic>> projectableNodes = null]) {
    if (index == -1) index = this.length;
    var vm = this._element.parentView.viewManager;
    return vm.createHostViewInContainer(this._element.ref, index,
        hostViewFactoryRef, dynamicallyCreatedProviders, projectableNodes);
  }

  // TODO(i): refactor insert+remove into move
  EmbeddedViewRef insert(ViewRef viewRef, [num index = -1]) {
    if (index == -1) index = this.length;
    var vm = this._element.parentView.viewManager;
    return vm.attachViewInContainer(this._element.ref, index, viewRef);
  }

  num indexOf(ViewRef viewRef) {
    return ListWrapper.indexOf(
        this._element.nestedViews, ((viewRef as ViewRef_)).internalView);
  }

  // TODO(i): rename to destroy
  void remove([num index = -1]) {
    if (index == -1) index = this.length - 1;
    var vm = this._element.parentView.viewManager;
    return vm.destroyViewInContainer(this._element.ref, index);
  }

  // TODO(i): refactor insert+remove into move
  EmbeddedViewRef detach([num index = -1]) {
    if (index == -1) index = this.length - 1;
    var vm = this._element.parentView.viewManager;
    return vm.detachViewInContainer(this._element.ref, index);
  }
}
