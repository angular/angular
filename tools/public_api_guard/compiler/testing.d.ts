export declare class MockDirectiveResolver extends DirectiveResolver {
    constructor(_injector: Injector);
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
    constructor(_injector: Injector);
    overrideViewDirective(component: Type, from: Type, to: Type): void;
    resolve(component: Type): ViewMetadata;
    setAnimations(component: Type, animations: AnimationEntryMetadata[]): void;
    setInlineTemplate(component: Type, template: string): void;
    setView(component: Type, view: ViewMetadata): void;
}

export declare class OverridingTestComponentBuilder extends TestComponentBuilder {
    constructor(injector: Injector);
    createAsync<T>(rootComponentType: ConcreteType<T>): Promise<ComponentFixture<T>>;
    createSync<T>(rootComponentType: ConcreteType<T>): ComponentFixture<T>;
    overrideAnimations(componentType: Type, animations: AnimationEntryMetadata[]): TestComponentBuilder;
    overrideDirective(componentType: Type, from: Type, to: Type): OverridingTestComponentBuilder;
    overrideProviders(type: Type, providers: any[]): OverridingTestComponentBuilder;
    overrideTemplate(componentType: Type, template: string): OverridingTestComponentBuilder;
    overrideView(componentType: Type, view: ViewMetadata): OverridingTestComponentBuilder;
    overrideViewProviders(type: Type, providers: any[]): OverridingTestComponentBuilder;
}
