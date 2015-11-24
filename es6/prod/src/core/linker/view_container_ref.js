import { ListWrapper } from 'angular2/src/facade/collection';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { isPresent } from 'angular2/src/facade/lang';
import { internalView } from './view_ref';
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
    constructor(viewManager, element) {
        super();
        this.viewManager = viewManager;
        this.element = element;
    }
    _getViews() {
        let element = this.element;
        var vc = internalView(element.parentView).viewContainers[element.boundElementIndex];
        return isPresent(vc) ? vc.views : [];
    }
    get(index) { return this._getViews()[index].ref; }
    get length() { return this._getViews().length; }
    // TODO(rado): profile and decide whether bounds checks should be added
    // to the methods below.
    createEmbeddedView(templateRef, index = -1) {
        if (index == -1)
            index = this.length;
        return this.viewManager.createEmbeddedViewInContainer(this.element, index, templateRef);
    }
    createHostView(protoViewRef = null, index = -1, dynamicallyCreatedProviders = null) {
        if (index == -1)
            index = this.length;
        return this.viewManager.createHostViewInContainer(this.element, index, protoViewRef, dynamicallyCreatedProviders);
    }
    // TODO(i): refactor insert+remove into move
    insert(viewRef, index = -1) {
        if (index == -1)
            index = this.length;
        return this.viewManager.attachViewInContainer(this.element, index, viewRef);
    }
    indexOf(viewRef) {
        return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
    }
    // TODO(i): rename to destroy
    remove(index = -1) {
        if (index == -1)
            index = this.length - 1;
        this.viewManager.destroyViewInContainer(this.element, index);
        // view is intentionally not returned to the client.
    }
    // TODO(i): refactor insert+remove into move
    detach(index = -1) {
        if (index == -1)
            index = this.length - 1;
        return this.viewManager.detachViewInContainer(this.element, index);
    }
}
