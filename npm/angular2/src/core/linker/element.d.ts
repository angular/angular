import { Injector } from 'angular2/src/core/di';
import { AppView } from './view';
import { ElementRef } from './element_ref';
import { ViewContainerRef_ } from './view_container_ref';
import { QueryList } from './query_list';
/**
 * An AppElement is created for elements that have a ViewContainerRef,
 * a nested component or a <template> element to keep data around
 * that is needed for later instantiations.
 */
export declare class AppElement {
    index: number;
    parentIndex: number;
    parentView: AppView<any>;
    nativeElement: any;
    nestedViews: AppView<any>[];
    componentView: AppView<any>;
    component: any;
    componentConstructorViewQueries: QueryList<any>[];
    constructor(index: number, parentIndex: number, parentView: AppView<any>, nativeElement: any);
    elementRef: ElementRef;
    vcRef: ViewContainerRef_;
    initComponent(component: any, componentConstructorViewQueries: QueryList<any>[], view: AppView<any>): void;
    parentInjector: Injector;
    injector: Injector;
    mapNestedViews(nestedViewClass: any, callback: Function): any[];
    attachView(view: AppView<any>, viewIndex: number): void;
    detachView(viewIndex: number): AppView<any>;
}
