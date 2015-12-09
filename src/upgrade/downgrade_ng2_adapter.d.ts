import { AppViewManager, ChangeDetectorRef, HostViewRef, Injector, ProtoViewRef, SimpleChange } from 'angular2/angular2';
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
    private viewManager;
    private protoView;
    component: any;
    inputChangeCount: number;
    inputChanges: {
        [key: string]: SimpleChange;
    };
    hostViewRef: HostViewRef;
    changeDetector: ChangeDetectorRef;
    componentScope: angular.IScope;
    childNodes: Node[];
    contentInserctionPoint: Node;
    constructor(id: string, info: ComponentInfo, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, scope: angular.IScope, parentInjector: Injector, parse: angular.IParseService, viewManager: AppViewManager, protoView: ProtoViewRef);
    bootstrapNg2(): void;
    setupInputs(): void;
    projectContent(): void;
    setupOutputs(): void;
    registerCleanup(): void;
}
