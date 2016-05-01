import { isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ViewType } from './view_type';
import { ElementRef } from './element_ref';
import { ViewContainerRef_ } from './view_container_ref';
/**
 * An AppElement is created for elements that have a ViewContainerRef,
 * a nested component or a <template> element to keep data around
 * that is needed for later instantiations.
 */
export class AppElement {
    constructor(index, parentIndex, parentView, nativeElement) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.parentView = parentView;
        this.nativeElement = nativeElement;
        this.nestedViews = null;
        this.componentView = null;
    }
    get elementRef() { return new ElementRef(this.nativeElement); }
    get vcRef() { return new ViewContainerRef_(this); }
    initComponent(component, componentConstructorViewQueries, view) {
        this.component = component;
        this.componentConstructorViewQueries = componentConstructorViewQueries;
        this.componentView = view;
    }
    get parentInjector() { return this.parentView.injector(this.parentIndex); }
    get injector() { return this.parentView.injector(this.index); }
    mapNestedViews(nestedViewClass, callback) {
        var result = [];
        if (isPresent(this.nestedViews)) {
            this.nestedViews.forEach((nestedView) => {
                if (nestedView.clazz === nestedViewClass) {
                    result.push(callback(nestedView));
                }
            });
        }
        return result;
    }
    attachView(view, viewIndex) {
        if (view.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        ListWrapper.insert(nestedViews, viewIndex, view);
        var refRenderNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refRenderNode = prevView.lastRootNode;
        }
        else {
            refRenderNode = this.nativeElement;
        }
        if (isPresent(refRenderNode)) {
            view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
        }
        view.addToContentChildren(this);
    }
    detachView(viewIndex) {
        var view = ListWrapper.removeAt(this.nestedViews, viewIndex);
        if (view.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        view.renderer.detachView(view.flatRootNodes);
        view.removeFromContentChildren(this);
        return view;
    }
}
