export declare abstract class BasePortalHost extends BasePortalOutlet {
}

export declare abstract class BasePortalOutlet implements PortalOutlet {
    protected _attachedPortal: Portal<any> | null;
    attach<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attach<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T>;
    attach(portal: any): any;
    abstract attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    abstract attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    detach(): void;
    dispose(): void;
    hasAttached(): boolean;
    setDisposeFn(fn: () => void): void;
}

export declare class CdkPortal extends TemplatePortal {
    constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef);
}

export declare class CdkPortalOutlet extends BasePortalOutlet implements OnInit, OnDestroy {
    attached: EventEmitter<CdkPortalOutletAttachedRef>;
    readonly attachedRef: CdkPortalOutletAttachedRef;
    portal: Portal<any> | null;
    constructor(_componentFactoryResolver: ComponentFactoryResolver, _viewContainerRef: ViewContainerRef);
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    ngOnDestroy(): void;
    ngOnInit(): void;
}

export declare type CdkPortalOutletAttachedRef = ComponentRef<any> | EmbeddedViewRef<any> | null;

export declare class ComponentPortal<T> extends Portal<ComponentRef<T>> {
    component: ComponentType<T>;
    componentFactoryResolver?: ComponentFactoryResolver | null;
    injector?: Injector | null;
    viewContainerRef?: ViewContainerRef | null;
    constructor(component: ComponentType<T>, viewContainerRef?: ViewContainerRef | null, injector?: Injector | null, componentFactoryResolver?: ComponentFactoryResolver | null);
}

export interface ComponentType<T> {
    new (...args: any[]): T;
}

export declare class DomPortalHost extends DomPortalOutlet {
}

export declare class DomPortalOutlet extends BasePortalOutlet {
    outletElement: Element;
    constructor(
    outletElement: Element, _componentFactoryResolver: ComponentFactoryResolver, _appRef: ApplicationRef, _defaultInjector: Injector);
    attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;
    attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;
    dispose(): void;
}

export declare abstract class Portal<T> {
    readonly isAttached: boolean;
    attach(host: PortalOutlet): T;
    detach(): void;
    setAttachedHost(host: PortalOutlet | null): void;
}

export declare type PortalHost = PortalOutlet;

export declare class PortalHostDirective extends CdkPortalOutlet {
}

export declare class PortalInjector implements Injector {
    constructor(_parentInjector: Injector, _customTokens: WeakMap<any, any>);
    get(token: any, notFoundValue?: any): any;
}

export declare class PortalModule {
}

export interface PortalOutlet {
    attach(portal: Portal<any>): any;
    detach(): any;
    dispose(): void;
    hasAttached(): boolean;
}

export declare class TemplatePortal<C = any> extends Portal<EmbeddedViewRef<C>> {
    context: C | undefined;
    readonly origin: ElementRef;
    templateRef: TemplateRef<C>;
    viewContainerRef: ViewContainerRef;
    constructor(template: TemplateRef<C>, viewContainerRef: ViewContainerRef, context?: C);
    attach(host: PortalOutlet, context?: C | undefined): EmbeddedViewRef<C>;
    detach(): void;
}

export declare class TemplatePortalDirective extends CdkPortal {
}
