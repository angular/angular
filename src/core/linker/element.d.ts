import { Type } from 'angular2/src/facade/lang';
import { Injector, Key, Dependency, ResolvedProvider } from 'angular2/src/core/di';
import { ProtoInjector, ProviderWithVisibility, DependencyProvider } from 'angular2/src/core/di/injector';
import { ResolvedProvider_ } from 'angular2/src/core/di/provider';
import { QueryMetadata } from '../metadata/di';
import { AppView } from './view';
import { ViewType } from './view_type';
import { ElementRef_ } from './element_ref';
import { ViewContainerRef } from './view_container_ref';
import { ElementRef } from './element_ref';
import { TemplateRef } from './template_ref';
import { DirectiveMetadata } from '../metadata/directives';
import { QueryList } from './query_list';
import { SetterFn } from 'angular2/src/core/reflection/types';
import { AfterViewChecked } from 'angular2/src/core/linker/interfaces';
import { ResolvedMetadataCache } from './resolved_metadata_cache';
export declare class StaticKeys {
    templateRefId: number;
    viewContainerId: number;
    changeDetectorRefId: number;
    elementRefId: number;
    rendererId: number;
    constructor();
    static instance(): StaticKeys;
}
export declare class DirectiveDependency extends Dependency {
    attributeName: string;
    queryDecorator: QueryMetadata;
    constructor(key: Key, optional: boolean, lowerBoundVisibility: Object, upperBoundVisibility: Object, properties: any[], attributeName: string, queryDecorator: QueryMetadata);
    static createFrom(d: Dependency): DirectiveDependency;
}
export declare class DirectiveProvider extends ResolvedProvider_ {
    isComponent: boolean;
    providers: ResolvedProvider[];
    viewProviders: ResolvedProvider[];
    queries: QueryMetadataWithSetter[];
    constructor(key: Key, factory: Function, deps: Dependency[], isComponent: boolean, providers: ResolvedProvider[], viewProviders: ResolvedProvider[], queries: QueryMetadataWithSetter[]);
    displayName: string;
    static createFromType(type: Type, meta: DirectiveMetadata): DirectiveProvider;
}
export declare class QueryMetadataWithSetter {
    setter: SetterFn;
    metadata: QueryMetadata;
    constructor(setter: SetterFn, metadata: QueryMetadata);
}
export declare class AppProtoElement {
    firstProviderIsComponent: boolean;
    index: number;
    attributes: {
        [key: string]: string;
    };
    protoQueryRefs: ProtoQueryRef[];
    directiveVariableBindings: {
        [key: string]: number;
    };
    protoInjector: ProtoInjector;
    static create(metadataCache: ResolvedMetadataCache, index: number, attributes: {
        [key: string]: string;
    }, directiveTypes: Type[], directiveVariableBindings: {
        [key: string]: number;
    }): AppProtoElement;
    constructor(firstProviderIsComponent: boolean, index: number, attributes: {
        [key: string]: string;
    }, pwvs: ProviderWithVisibility[], protoQueryRefs: ProtoQueryRef[], directiveVariableBindings: {
        [key: string]: number;
    });
    getProviderAtIndex(index: number): any;
}
export declare class InjectorWithHostBoundary {
    injector: Injector;
    hostInjectorBoundary: boolean;
    constructor(injector: Injector, hostInjectorBoundary: boolean);
}
export declare class AppElement implements DependencyProvider, ElementRef, AfterViewChecked {
    proto: AppProtoElement;
    parentView: AppView;
    parent: AppElement;
    nativeElement: any;
    embeddedViewFactory: Function;
    static getViewParentInjector(parentViewType: ViewType, containerAppElement: AppElement, imperativelyCreatedProviders: ResolvedProvider[], rootInjector: Injector): InjectorWithHostBoundary;
    nestedViews: AppView[];
    componentView: AppView;
    private _queryStrategy;
    private _injector;
    private _strategy;
    ref: ElementRef_;
    constructor(proto: AppProtoElement, parentView: AppView, parent: AppElement, nativeElement: any, embeddedViewFactory: Function);
    attachComponentView(componentView: AppView): void;
    private _debugContext();
    hasVariableBinding(name: string): boolean;
    getVariableBinding(name: string): any;
    get(token: any): any;
    hasDirective(type: Type): boolean;
    getComponent(): any;
    getInjector(): Injector;
    getElementRef(): ElementRef;
    getViewContainerRef(): ViewContainerRef;
    getTemplateRef(): TemplateRef;
    getDependency(injector: Injector, provider: ResolvedProvider, dep: Dependency): any;
    private _buildAttribute(dep);
    addDirectivesMatchingQuery(query: QueryMetadata, list: any[]): void;
    private _buildQueryStrategy();
    getDirectiveAtIndex(index: number): any;
    ngAfterViewChecked(): void;
    ngAfterContentChecked(): void;
    traverseAndSetQueriesAsDirty(): void;
    private _setQueriesAsDirty();
}
export declare class ProtoQueryRef {
    dirIndex: number;
    setter: SetterFn;
    query: QueryMetadata;
    constructor(dirIndex: number, setter: SetterFn, query: QueryMetadata);
    usesPropertySyntax: boolean;
}
export declare class QueryRef {
    protoQueryRef: ProtoQueryRef;
    private originator;
    list: QueryList<any>;
    dirty: boolean;
    constructor(protoQueryRef: ProtoQueryRef, originator: AppElement);
    isViewQuery: boolean;
    update(): void;
    private _update();
    private _visit(inj, aggregator);
    private _visitInjector(inj, aggregator);
    private _visitViewContainerViews(views, aggregator);
    private _visitView(view, aggregator);
    private _aggregateVariableBinding(inj, aggregator);
    private _aggregateDirective(inj, aggregator);
}
