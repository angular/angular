export declare class ComponentFixture<T> {
    debugElement: DebugElement;
    componentInstance: any;
    nativeElement: any;
    elementRef: ElementRef;
    componentRef: ComponentRef<T>;
    changeDetectorRef: ChangeDetectorRef;
    ngZone: NgZone;
    constructor(componentRef: ComponentRef<T>, ngZone: NgZone, autoDetect: boolean);
    detectChanges(checkNoChanges?: boolean): void;
    checkNoChanges(): void;
    autoDetectChanges(autoDetect?: boolean): void;
    isStable(): boolean;
    whenStable(): Promise<any>;
    destroy(): void;
}

export declare var ComponentFixtureAutoDetect: OpaqueToken;

export declare var ComponentFixtureNoNgZone: OpaqueToken;

export declare class MockDirectiveResolver extends DirectiveResolver {
    resolve(type: Type): DirectiveMetadata;
    setProvidersOverride(type: Type, providers: any[]): void;
    setViewProvidersOverride(type: Type, viewProviders: any[]): void;
}

export declare class MockSchemaRegistry implements ElementSchemaRegistry {
    existingProperties: {
        [key: string]: boolean;
    };
    attrPropMapping: {
        [key: string]: string;
    };
    constructor(existingProperties: {
        [key: string]: boolean;
    }, attrPropMapping: {
        [key: string]: string;
    });
    hasProperty(tagName: string, property: string): boolean;
    securityContext(tagName: string, property: string): SecurityContext;
    getMappedPropName(attrName: string): string;
}

export declare class MockViewResolver extends ViewResolver {
    constructor();
    setView(component: Type, view: ViewMetadata): void;
    setInlineTemplate(component: Type, template: string): void;
    setAnimations(component: Type, animations: AnimationEntryMetadata[]): void;
    overrideViewDirective(component: Type, from: Type, to: Type): void;
    resolve(component: Type): ViewMetadata;
}

export declare class MockXHR extends XHR {
    get(url: string): Promise<string>;
    expect(url: string, response: string): void;
    when(url: string, response: string): void;
    flush(): void;
    verifyNoOutstandingExpectations(): void;
}

export declare class TestComponentBuilder {
    constructor(_injector: Injector);
    overrideTemplate(componentType: Type, template: string): TestComponentBuilder;
    overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]): TestComponentBuilder;
    overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder;
    overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder;
    overrideProviders(type: Type, providers: any[]): TestComponentBuilder;
    overrideBindings(type: Type, providers: any[]): TestComponentBuilder;
    overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder;
    overrideViewBindings(type: Type, providers: any[]): TestComponentBuilder;
    createAsync(rootComponentType: Type): Promise<ComponentFixture<any>>;
    createFakeAsync(rootComponentType: Type): ComponentFixture<any>;
    createSync<C>(componentFactory: ComponentFactory<C>): ComponentFixture<C>;
}

export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}
