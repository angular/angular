import { ListWrapper } from 'angular2/src/facade/collection';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { isPresent } from 'angular2/src/facade/lang';
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
export class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing View.
     * <!-- TODO: rename to anchorElement -->
     */
    get element() { return unimplemented(); }
    /**
     * Destroys all Views in this container.
     */
    clear() {
        for (var i = this.length - 1; i >= 0; i--) {
            this.remove(i);
        }
    }
    /**
     * Returns the number of Views currently attached to this container.
     */
    get length() { return unimplemented(); }
    ;
}
export class ViewContainerRef_ extends ViewContainerRef {
    constructor(_element) {
        super();
        this._element = _element;
    }
    get(index) { return this._element.nestedViews[index].ref; }
    get length() {
        var views = this._element.nestedViews;
        return isPresent(views) ? views.length : 0;
    }
    get element() { return this._element.ref; }
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    createEmbeddedView(templateRef, index = -1) {
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.createEmbeddedViewInContainer(this._element.ref, index, templateRef);
    }
    createHostView(hostViewFactoryRef, index = -1, dynamicallyCreatedProviders = null, projectableNodes = null) {
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.createHostViewInContainer(this._element.ref, index, hostViewFactoryRef, dynamicallyCreatedProviders, projectableNodes);
    }
    // TODO(i): refactor insert+remove into move
    insert(viewRef, index = -1) {
        if (index == -1)
            index = this.length;
        var vm = this._element.parentView.viewManager;
        return vm.attachViewInContainer(this._element.ref, index, viewRef);
    }
    indexOf(viewRef) {
        return ListWrapper.indexOf(this._element.nestedViews, viewRef.internalView);
    }
    // TODO(i): rename to destroy
    remove(index = -1) {
        if (index == -1)
            index = this.length - 1;
        var vm = this._element.parentView.viewManager;
        return vm.destroyViewInContainer(this._element.ref, index);
        // view is intentionally not returned to the client.
    }
    // TODO(i): refactor insert+remove into move
    detach(index = -1) {
        if (index == -1)
            index = this.length - 1;
        var vm = this._element.parentView.viewManager;
        return vm.detachViewInContainer(this._element.ref, index);
    }
}
