import { ChangeDetectorRef, Injector, ComponentFactory, ComponentRef, SimpleChange } from 'angular2/core';
import { ComponentInfo } from './metadata';
import * as angular from './angular_js';
export declare class DowngradeNg2ComponentAdapter {
    private id;
    private info;
    private element;
    private attrs;
    private scope;
    private parentInjector;
    private parse;
    private componentFactory;
    component: any;
    inputChangeCount: number;
    inputChanges: {
        [key: string]: SimpleChange;
    };
    componentRef: ComponentRef<any>;
    changeDetector: ChangeDetectorRef;
    componentScope: angular.IScope;
    childNodes: Node[];
    contentInsertionPoint: Node;
    constructor(id: string, info: ComponentInfo, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, scope: angular.IScope, parentInjector: Injector, parse: angular.IParseService, componentFactory: ComponentFactory<any>);
    bootstrapNg2(): void;
    setupInputs(): void;
    projectContent(): void;
    setupOutputs(): void;
    registerCleanup(): void;
}
