/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef } from '../change_detection/change_detector_ref';
import { Injector } from '../di/injector';
import { EnvironmentInjector } from '../di/r3_injector';
import { Type } from '../interface/type';
import { ComponentFactory as AbstractComponentFactory, ComponentRef as AbstractComponentRef } from '../linker/component_factory';
import { ComponentFactoryResolver as AbstractComponentFactoryResolver } from '../linker/component_factory_resolver';
import { ElementRef } from '../linker/element_ref';
import { NgModuleRef } from '../linker/ng_module_factory';
import { ComponentDef } from './interfaces/definition';
import { LView } from './interfaces/view';
import { ViewRef } from './view_ref';
import { Binding, DirectiveWithBindings } from './dynamic_bindings';
export declare class ComponentFactoryResolver extends AbstractComponentFactoryResolver {
    private ngModule?;
    /**
     * @param ngModule The NgModuleRef to which all resolved factories are bound.
     */
    constructor(ngModule?: NgModuleRef<any> | undefined);
    resolveComponentFactory<T>(component: Type<T>): AbstractComponentFactory<T>;
}
/**
 * Infers the tag name that should be used for a component based on its definition.
 * @param componentDef Definition for which to resolve the tag name.
 */
export declare function inferTagNameFromDefinition(componentDef: ComponentDef<unknown>): string;
/**
 * ComponentFactory interface implementation.
 */
export declare class ComponentFactory<T> extends AbstractComponentFactory<T> {
    private componentDef;
    private ngModule?;
    selector: string;
    componentType: Type<any>;
    ngContentSelectors: string[];
    isBoundToModule: boolean;
    private cachedInputs;
    private cachedOutputs;
    get inputs(): {
        propName: string;
        templateName: string;
        isSignal: boolean;
        transform?: (value: any) => any;
    }[];
    get outputs(): {
        propName: string;
        templateName: string;
    }[];
    /**
     * @param componentDef The component definition.
     * @param ngModule The NgModuleRef to which the factory is bound.
     */
    constructor(componentDef: ComponentDef<any>, ngModule?: NgModuleRef<any> | undefined);
    create(injector: Injector, projectableNodes?: any[][] | undefined, rootSelectorOrNode?: any, environmentInjector?: NgModuleRef<any> | EnvironmentInjector | undefined, directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[], componentBindings?: Binding[]): AbstractComponentRef<T>;
}
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
export declare class ComponentRef<T> extends AbstractComponentRef<T> {
    private readonly _rootLView;
    private readonly _hasInputBindings;
    instance: T;
    hostView: ViewRef<T>;
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type<T>;
    location: ElementRef;
    private previousInputValues;
    private _tNode;
    constructor(componentType: Type<T>, _rootLView: LView, _hasInputBindings: boolean);
    setInput(name: string, value: unknown): void;
    get injector(): Injector;
    destroy(): void;
    onDestroy(callback: () => void): void;
}
