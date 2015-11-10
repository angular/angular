library angular2.src.core.linker.view_container_ref;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/exceptions.dart" show unimplemented;
import "package:angular2/src/core/di.dart" show ResolvedProvider;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "view_manager.dart" as avmModule;
import "view.dart" as viewModule;
import "element_ref.dart" show ElementRef, ElementRef_;
import "template_ref.dart" show TemplateRef;
import "view_ref.dart" show ViewRef, HostViewRef, ProtoViewRef, internalView;

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
  ElementRef element;
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
  ViewRef createEmbeddedView(TemplateRef templateRef, [num index]);
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
  HostViewRef createHostView(
      [ProtoViewRef protoViewRef,
      num index,
      List<ResolvedProvider> dynamicallyCreatedProviders]);
  /**
   * Inserts a View identified by a [ViewRef] into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted [ViewRef].
   */
  ViewRef insert(ViewRef viewRef, [num index]);
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
  ViewRef detach([num index]);
}

class ViewContainerRef_ extends ViewContainerRef {
  avmModule.AppViewManager viewManager;
  ViewContainerRef_(this.viewManager, ElementRef element) : super() {
    /* super call moved to initializer */;
    this.element = element;
  }
  List<viewModule.AppView> _getViews() {
    var element = (this.element as ElementRef_);
    var vc = internalView(element.parentView).viewContainers[
        element.boundElementIndex];
    return isPresent(vc) ? vc.views : [];
  }

  ViewRef get(num index) {
    return this._getViews()[index].ref;
  }

  num get length {
    return this._getViews().length;
  }
  // TODO(rado): profile and decide whether bounds checks should be added

  // to the methods below.
  ViewRef createEmbeddedView(TemplateRef templateRef, [num index = -1]) {
    if (index == -1) index = this.length;
    return this
        .viewManager
        .createEmbeddedViewInContainer(this.element, index, templateRef);
  }

  HostViewRef createHostView(
      [ProtoViewRef protoViewRef = null,
      num index = -1,
      List<ResolvedProvider> dynamicallyCreatedProviders = null]) {
    if (index == -1) index = this.length;
    return this.viewManager.createHostViewInContainer(
        this.element, index, protoViewRef, dynamicallyCreatedProviders);
  }

  // TODO(i): refactor insert+remove into move
  ViewRef insert(ViewRef viewRef, [num index = -1]) {
    if (index == -1) index = this.length;
    return this.viewManager.attachViewInContainer(this.element, index, viewRef);
  }

  num indexOf(ViewRef viewRef) {
    return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
  }

  // TODO(i): rename to destroy
  void remove([num index = -1]) {
    if (index == -1) index = this.length - 1;
    this.viewManager.destroyViewInContainer(this.element, index);
  }

  // TODO(i): refactor insert+remove into move
  ViewRef detach([num index = -1]) {
    if (index == -1) index = this.length - 1;
    return this.viewManager.detachViewInContainer(this.element, index);
  }
}
