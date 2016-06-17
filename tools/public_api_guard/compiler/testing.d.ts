export declare var ComponentFixtureAutoDetect: OpaqueToken;

export declare var ComponentFixtureNoNgZone: OpaqueToken;

export declare class MockDirectiveResolver extends DirectiveResolver {
    resolve(type: Type): DirectiveMetadata;
    setProvidersOverride(type: Type, providers: any[]): void;
    setViewProvidersOverride(type: Type, viewProviders: any[]): void;
}

export declare class MockSchemaRegistry implements ElementSchemaRegistry {
    attrPropMapping: {
        [key: string]: string;
    };
    existingProperties: {
        [key: string]: boolean;
    };
    constructor(existingProperties: {
        [key: string]: boolean;
    }, attrPropMapping: {
        [key: string]: string;
    });
    getMappedPropName(attrName: string): string;
    hasProperty(tagName: string, property: string): boolean;
    securityContext(tagName: string, property: string): SecurityContext;
}

export declare class MockViewResolver extends ViewResolver {
    constructor();
    overrideViewDirective(component: Type, from: Type, to: Type): void;
    resolve(component: Type): ViewMetadata;
    setAnimations(component: Type, animations: AnimationEntryMetadata[]): void;
    setInlineTemplate(component: Type, template: string): void;
    setView(component: Type, view: ViewMetadata): void;
}

export declare class TestComponentBuilder {
    constructor(_injector: Injector);
    createAsync(rootComponentType: Type): Promise<ComponentFixture<any>>;
    createFakeAsync(rootComponentType: Type): ComponentFixture<any>;
    createSync<C>(componentFactory: ComponentFactory<C>): ComponentFixture<C>;
    overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]): TestComponentBuilder;
    overrideBindings(type: Type, providers: any[]): TestComponentBuilder;
    overrideDirective(componentType: Type, from: Type, to: Type): TestComponentBuilder;
    overrideProviders(type: Type, providers: any[]): TestComponentBuilder;
    overrideTemplate(componentType: Type, template: string): TestComponentBuilder;
    overrideView(componentType: Type, view: ViewMetadata): TestComponentBuilder;
    overrideViewBindings(type: Type, providers: any[]): TestComponentBuilder;
    overrideViewProviders(type: Type, providers: any[]): TestComponentBuilder;
}

export declare class TestComponentRenderer {
    insertRootElement(rootElementId: string): void;
}
