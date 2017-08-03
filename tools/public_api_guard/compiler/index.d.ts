export declare class AttrAst implements TemplateAst {
    name: string;
    sourceSpan: ParseSourceSpan;
    value: string;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundDirectivePropertyAst implements TemplateAst {
    directiveName: string;
    sourceSpan: ParseSourceSpan;
    templateName: string;
    value: AST;
    constructor(directiveName: string, templateName: string, value: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundElementPropertyAst implements TemplateAst {
    name: string;
    securityContext: SecurityContext;
    sourceSpan: ParseSourceSpan;
    type: PropertyBindingType;
    unit: string;
    value: AST;
    constructor(name: string, type: PropertyBindingType, securityContext: SecurityContext, value: AST, unit: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundEventAst implements TemplateAst {
    fullName: string;
    handler: AST;
    name: string;
    sourceSpan: ParseSourceSpan;
    target: string;
    constructor(name: string, target: string, handler: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundTextAst implements TemplateAst {
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    value: AST;
    constructor(value: AST, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class CompileDiDependencyMetadata {
    isAttribute: boolean;
    isHost: boolean;
    isOptional: boolean;
    isSelf: boolean;
    isSkipSelf: boolean;
    isValue: boolean;
    query: CompileQueryMetadata;
    token: CompileTokenMetadata;
    value: any;
    viewQuery: CompileQueryMetadata;
    constructor({isAttribute, isSelf, isHost, isSkipSelf, isOptional, isValue, query, viewQuery, token, value}?: {
        isAttribute?: boolean;
        isSelf?: boolean;
        isHost?: boolean;
        isSkipSelf?: boolean;
        isOptional?: boolean;
        isValue?: boolean;
        query?: CompileQueryMetadata;
        viewQuery?: CompileQueryMetadata;
        token?: CompileTokenMetadata;
        value?: any;
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileDiDependencyMetadata;
}

export declare class CompileDirectiveMetadata implements CompileMetadataWithType {
    changeDetection: ChangeDetectionStrategy;
    exportAs: string;
    hostAttributes: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    identifier: CompileIdentifierMetadata;
    inputs: {
        [key: string]: string;
    };
    isComponent: boolean;
    lifecycleHooks: LifecycleHooks[];
    outputs: {
        [key: string]: string;
    };
    precompile: CompileTypeMetadata[];
    providers: CompileProviderMetadata[];
    queries: CompileQueryMetadata[];
    selector: string;
    template: CompileTemplateMetadata;
    type: CompileTypeMetadata;
    viewProviders: CompileProviderMetadata[];
    viewQueries: CompileQueryMetadata[];
    constructor({type, isComponent, selector, exportAs, changeDetection, inputs, outputs, hostListeners, hostProperties, hostAttributes, lifecycleHooks, providers, viewProviders, queries, viewQueries, precompile, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: {
            [key: string]: string;
        };
        outputs?: {
            [key: string]: string;
        };
        hostListeners?: {
            [key: string]: string;
        };
        hostProperties?: {
            [key: string]: string;
        };
        hostAttributes?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        precompile?: CompileTypeMetadata[];
        template?: CompileTemplateMetadata;
    });
    toJson(): {
        [key: string]: any;
    };
    static create({type, isComponent, selector, exportAs, changeDetection, inputs, outputs, host, lifecycleHooks, providers, viewProviders, queries, viewQueries, precompile, template}?: {
        type?: CompileTypeMetadata;
        isComponent?: boolean;
        selector?: string;
        exportAs?: string;
        changeDetection?: ChangeDetectionStrategy;
        inputs?: string[];
        outputs?: string[];
        host?: {
            [key: string]: string;
        };
        lifecycleHooks?: LifecycleHooks[];
        providers?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        viewProviders?: Array<CompileProviderMetadata | CompileTypeMetadata | CompileIdentifierMetadata | any[]>;
        queries?: CompileQueryMetadata[];
        viewQueries?: CompileQueryMetadata[];
        precompile?: CompileTypeMetadata[];
        template?: CompileTemplateMetadata;
    }): CompileDirectiveMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompileDirectiveMetadata;
}

export declare class CompileFactoryMetadata implements CompileIdentifierMetadata, CompileMetadataWithIdentifier {
    diDeps: CompileDiDependencyMetadata[];
    identifier: CompileIdentifierMetadata;
    moduleUrl: string;
    name: string;
    prefix: string;
    runtime: Function;
    value: any;
    constructor({runtime, name, moduleUrl, prefix, diDeps, value}: {
        runtime?: Function;
        name?: string;
        prefix?: string;
        moduleUrl?: string;
        value?: boolean;
        diDeps?: CompileDiDependencyMetadata[];
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileFactoryMetadata;
}

export declare class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
    identifier: CompileIdentifierMetadata;
    moduleUrl: string;
    name: string;
    prefix: string;
    runtime: any;
    value: any;
    constructor({runtime, name, moduleUrl, prefix, value}?: {
        runtime?: any;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        value?: any;
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileIdentifierMetadata;
}

export declare abstract class CompileMetadataWithIdentifier {
    identifier: CompileIdentifierMetadata;
    abstract toJson(): {
        [key: string]: any;
    };
}

export declare abstract class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    identifier: CompileIdentifierMetadata;
    type: CompileTypeMetadata;
    abstract toJson(): {
        [key: string]: any;
    };
}

export declare class CompilePipeMetadata implements CompileMetadataWithType {
    identifier: CompileIdentifierMetadata;
    lifecycleHooks: LifecycleHooks[];
    name: string;
    pure: boolean;
    type: CompileTypeMetadata;
    constructor({type, name, pure, lifecycleHooks}?: {
        type?: CompileTypeMetadata;
        name?: string;
        pure?: boolean;
        lifecycleHooks?: LifecycleHooks[];
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompilePipeMetadata;
}

export declare class CompileProviderMetadata {
    deps: CompileDiDependencyMetadata[];
    multi: boolean;
    token: CompileTokenMetadata;
    useClass: CompileTypeMetadata;
    useExisting: CompileTokenMetadata;
    useFactory: CompileFactoryMetadata;
    useValue: any;
    constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
        token?: CompileTokenMetadata;
        useClass?: CompileTypeMetadata;
        useValue?: any;
        useExisting?: CompileTokenMetadata;
        useFactory?: CompileFactoryMetadata;
        deps?: CompileDiDependencyMetadata[];
        multi?: boolean;
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileProviderMetadata;
}

export declare class CompileQueryMetadata {
    descendants: boolean;
    first: boolean;
    propertyName: string;
    read: CompileTokenMetadata;
    selectors: Array<CompileTokenMetadata>;
    constructor({selectors, descendants, first, propertyName, read}?: {
        selectors?: Array<CompileTokenMetadata>;
        descendants?: boolean;
        first?: boolean;
        propertyName?: string;
        read?: CompileTokenMetadata;
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileQueryMetadata;
}

export declare const COMPILER_PROVIDERS: Array<any | Type | {
    [k: string]: any;
} | any[]>;

export declare class CompilerConfig {
    defaultEncapsulation: ViewEncapsulation;
    genDebugInfo: boolean;
    logBindingUpdate: boolean;
    platformDirectives: any[];
    platformPipes: any[];
    renderTypes: RenderTypes;
    useJit: boolean;
    constructor({renderTypes, defaultEncapsulation, genDebugInfo, logBindingUpdate, useJit, platformDirectives, platformPipes}?: {
        renderTypes?: RenderTypes;
        defaultEncapsulation?: ViewEncapsulation;
        genDebugInfo?: boolean;
        logBindingUpdate?: boolean;
        useJit?: boolean;
        platformDirectives?: any[];
        platformPipes?: any[];
    });
}

export declare class CompileTemplateMetadata implements CompileStylesheetMetadata {
    animations: CompileAnimationEntryMetadata[];
    encapsulation: ViewEncapsulation;
    externalStylesheets: CompileStylesheetMetadata[];
    interpolation: [string, string];
    moduleUrl: string;
    ngContentSelectors: string[];
    styleUrls: string[];
    styles: string[];
    template: string;
    templateUrl: string;
    constructor({encapsulation, template, templateUrl, styles, styleUrls, externalStylesheets, animations, ngContentSelectors, interpolation}?: {
        encapsulation?: ViewEncapsulation;
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        externalStylesheets?: CompileStylesheetMetadata[];
        ngContentSelectors?: string[];
        animations?: CompileAnimationEntryMetadata[];
        interpolation?: [string, string];
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileTemplateMetadata;
}

export declare class CompileTokenMetadata implements CompileMetadataWithIdentifier {
    assetCacheKey: any;
    identifier: CompileIdentifierMetadata;
    identifierIsInstance: boolean;
    name: string;
    runtimeCacheKey: any;
    value: any;
    constructor({value, identifier, identifierIsInstance}: {
        value?: any;
        identifier?: CompileIdentifierMetadata;
        identifierIsInstance?: boolean;
    });
    equalsTo(token2: CompileTokenMetadata): boolean;
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileTokenMetadata;
}

export declare class CompileTypeMetadata implements CompileIdentifierMetadata, CompileMetadataWithType {
    diDeps: CompileDiDependencyMetadata[];
    identifier: CompileIdentifierMetadata;
    isHost: boolean;
    moduleUrl: string;
    name: string;
    prefix: string;
    runtime: Type;
    type: CompileTypeMetadata;
    value: any;
    constructor({runtime, name, moduleUrl, prefix, isHost, value, diDeps}?: {
        runtime?: Type;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        isHost?: boolean;
        value?: any;
        diDeps?: CompileDiDependencyMetadata[];
    });
    toJson(): {
        [key: string]: any;
    };
    static fromJson(data: {
        [key: string]: any;
    }): CompileTypeMetadata;
}

export declare function createOfflineCompileUrlResolver(): UrlResolver;

export declare var DEFAULT_PACKAGE_URL_PROVIDER: {
    provide: any;
    useValue: string;
};

export declare class DirectiveAst implements TemplateAst {
    directive: CompileDirectiveMetadata;
    hostEvents: BoundEventAst[];
    hostProperties: BoundElementPropertyAst[];
    inputs: BoundDirectivePropertyAst[];
    sourceSpan: ParseSourceSpan;
    constructor(directive: CompileDirectiveMetadata, inputs: BoundDirectivePropertyAst[], hostProperties: BoundElementPropertyAst[], hostEvents: BoundEventAst[], sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class DirectiveResolver {
    constructor(_reflector?: ReflectorReader);
    resolve(type: Type): DirectiveMetadata;
}

export declare class ElementAst implements TemplateAst {
    attrs: AttrAst[];
    children: TemplateAst[];
    directives: DirectiveAst[];
    hasViewContainer: boolean;
    inputs: BoundElementPropertyAst[];
    name: string;
    ngContentIndex: number;
    outputs: BoundEventAst[];
    providers: ProviderAst[];
    references: ReferenceAst[];
    sourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: AttrAst[], inputs: BoundElementPropertyAst[], outputs: BoundEventAst[], references: ReferenceAst[], directives: DirectiveAst[], providers: ProviderAst[], hasViewContainer: boolean, children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare abstract class ElementSchemaRegistry {
    abstract getMappedPropName(propName: string): string;
    abstract hasProperty(tagName: string, propName: string): boolean;
    abstract securityContext(tagName: string, propName: string): any;
}

export declare class EmbeddedTemplateAst implements TemplateAst {
    attrs: AttrAst[];
    children: TemplateAst[];
    directives: DirectiveAst[];
    hasViewContainer: boolean;
    ngContentIndex: number;
    outputs: BoundEventAst[];
    providers: ProviderAst[];
    references: ReferenceAst[];
    sourceSpan: ParseSourceSpan;
    variables: VariableAst[];
    constructor(attrs: AttrAst[], outputs: BoundEventAst[], references: ReferenceAst[], variables: VariableAst[], directives: DirectiveAst[], providers: ProviderAst[], hasViewContainer: boolean, children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class NgContentAst implements TemplateAst {
    index: number;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(index: number, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class NormalizedComponentWithViewDirectives {
    component: CompileDirectiveMetadata;
    directives: CompileDirectiveMetadata[];
    pipes: CompilePipeMetadata[];
    constructor(component: CompileDirectiveMetadata, directives: CompileDirectiveMetadata[], pipes: CompilePipeMetadata[]);
}

export declare class OfflineCompiler {
    constructor(_directiveNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _outputEmitter: OutputEmitter);
    compileTemplates(components: NormalizedComponentWithViewDirectives[]): SourceModule[];
    normalizeDirectiveMetadata(directive: CompileDirectiveMetadata): Promise<CompileDirectiveMetadata>;
}

export declare class PipeResolver {
    constructor(_reflector?: ReflectorReader);
    resolve(type: Type): PipeMetadata;
}

export declare enum PropertyBindingType {
    Property = 0,
    Attribute = 1,
    Class = 2,
    Style = 3,
    Animation = 4,
}

export declare class ProviderAst implements TemplateAst {
    eager: boolean;
    multiProvider: boolean;
    providerType: ProviderAstType;
    providers: CompileProviderMetadata[];
    sourceSpan: ParseSourceSpan;
    token: CompileTokenMetadata;
    constructor(token: CompileTokenMetadata, multiProvider: boolean, eager: boolean, providers: CompileProviderMetadata[], providerType: ProviderAstType, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare enum ProviderAstType {
    PublicService = 0,
    PrivateService = 1,
    Component = 2,
    Directive = 3,
    Builtin = 4,
}

export declare class ReferenceAst implements TemplateAst {
    name: string;
    sourceSpan: ParseSourceSpan;
    value: CompileTokenMetadata;
    constructor(name: string, value: CompileTokenMetadata, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare abstract class RenderTypes {
    renderComment: CompileIdentifierMetadata;
    renderElement: CompileIdentifierMetadata;
    renderEvent: CompileIdentifierMetadata;
    renderNode: CompileIdentifierMetadata;
    renderText: CompileIdentifierMetadata;
    renderer: CompileIdentifierMetadata;
}

export declare class RuntimeCompiler implements ComponentResolver, Compiler {
    constructor(_metadataResolver: CompileMetadataResolver, _templateNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _genConfig: CompilerConfig);
    clearCache(): void;
    clearCacheFor(compType: Type): void;
    compileComponentAsync<T>(compType: ConcreteType<T>): Promise<ComponentFactory<T>>;
    compileComponentSync<T>(compType: ConcreteType<T>): ComponentFactory<T>;
    resolveComponent(component: Type | string): Promise<ComponentFactory<any>>;
}

export declare class SourceModule {
    moduleUrl: string;
    source: string;
    constructor(moduleUrl: string, source: string);
}

export declare const TEMPLATE_TRANSFORMS: any;

export interface TemplateAst {
    sourceSpan: ParseSourceSpan;
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export interface TemplateAstVisitor {
    visitAttr(ast: AttrAst, context: any): any;
    visitBoundText(ast: BoundTextAst, context: any): any;
    visitDirective(ast: DirectiveAst, context: any): any;
    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
    visitElement(ast: ElementAst, context: any): any;
    visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
    visitEvent(ast: BoundEventAst, context: any): any;
    visitNgContent(ast: NgContentAst, context: any): any;
    visitReference(ast: ReferenceAst, context: any): any;
    visitText(ast: TextAst, context: any): any;
    visitVariable(ast: VariableAst, context: any): any;
}

export declare function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[], context?: any): any[];

export declare class TextAst implements TemplateAst {
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    value: string;
    constructor(value: string, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class UrlResolver {
    constructor(_packagePrefix?: string);
    resolve(baseUrl: string, url: string): string;
}

export declare class VariableAst implements TemplateAst {
    name: string;
    sourceSpan: ParseSourceSpan;
    value: string;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class ViewResolver {
    constructor(_reflector?: ReflectorReader);
    resolve(component: Type): ViewMetadata;
}

export declare class XHR {
    get(url: string): Promise<string>;
}
