export declare class AttrAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundDirectivePropertyAst implements TemplateAst {
    directiveName: string;
    templateName: string;
    value: AST;
    sourceSpan: ParseSourceSpan;
    constructor(directiveName: string, templateName: string, value: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundElementPropertyAst implements TemplateAst {
    name: string;
    type: PropertyBindingType;
    securityContext: SecurityContext;
    value: AST;
    unit: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, type: PropertyBindingType, securityContext: SecurityContext, value: AST, unit: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class BoundEventAst implements TemplateAst {
    name: string;
    target: string;
    handler: AST;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, target: string, handler: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
    fullName: string;
}

export declare class BoundTextAst implements TemplateAst {
    value: AST;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: AST, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class CompileDiDependencyMetadata {
    isAttribute: boolean;
    isSelf: boolean;
    isHost: boolean;
    isSkipSelf: boolean;
    isOptional: boolean;
    isValue: boolean;
    query: CompileQueryMetadata;
    viewQuery: CompileQueryMetadata;
    token: CompileTokenMetadata;
    value: any;
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
    static fromJson(data: {
        [key: string]: any;
    }): CompileDiDependencyMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileDirectiveMetadata implements CompileMetadataWithType {
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
    type: CompileTypeMetadata;
    isComponent: boolean;
    selector: string;
    exportAs: string;
    changeDetection: ChangeDetectionStrategy;
    inputs: {
        [key: string]: string;
    };
    outputs: {
        [key: string]: string;
    };
    hostListeners: {
        [key: string]: string;
    };
    hostProperties: {
        [key: string]: string;
    };
    hostAttributes: {
        [key: string]: string;
    };
    lifecycleHooks: LifecycleHooks[];
    providers: CompileProviderMetadata[];
    viewProviders: CompileProviderMetadata[];
    queries: CompileQueryMetadata[];
    viewQueries: CompileQueryMetadata[];
    precompile: CompileTypeMetadata[];
    template: CompileTemplateMetadata;
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
    identifier: CompileIdentifierMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompileDirectiveMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileFactoryMetadata implements CompileIdentifierMetadata, CompileMetadataWithIdentifier {
    runtime: Function;
    name: string;
    prefix: string;
    moduleUrl: string;
    value: any;
    diDeps: CompileDiDependencyMetadata[];
    constructor({runtime, name, moduleUrl, prefix, diDeps, value}: {
        runtime?: Function;
        name?: string;
        prefix?: string;
        moduleUrl?: string;
        value?: boolean;
        diDeps?: CompileDiDependencyMetadata[];
    });
    identifier: CompileIdentifierMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompileFactoryMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileIdentifierMetadata implements CompileMetadataWithIdentifier {
    runtime: any;
    name: string;
    prefix: string;
    moduleUrl: string;
    value: any;
    constructor({runtime, name, moduleUrl, prefix, value}?: {
        runtime?: any;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        value?: any;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileIdentifierMetadata;
    toJson(): {
        [key: string]: any;
    };
    identifier: CompileIdentifierMetadata;
}

export declare abstract class CompileMetadataWithIdentifier {
    abstract toJson(): {
        [key: string]: any;
    };
    identifier: CompileIdentifierMetadata;
}

export declare abstract class CompileMetadataWithType extends CompileMetadataWithIdentifier {
    abstract toJson(): {
        [key: string]: any;
    };
    type: CompileTypeMetadata;
    identifier: CompileIdentifierMetadata;
}

export declare class CompilePipeMetadata implements CompileMetadataWithType {
    type: CompileTypeMetadata;
    name: string;
    pure: boolean;
    lifecycleHooks: LifecycleHooks[];
    constructor({type, name, pure, lifecycleHooks}?: {
        type?: CompileTypeMetadata;
        name?: string;
        pure?: boolean;
        lifecycleHooks?: LifecycleHooks[];
    });
    identifier: CompileIdentifierMetadata;
    static fromJson(data: {
        [key: string]: any;
    }): CompilePipeMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileProviderMetadata {
    token: CompileTokenMetadata;
    useClass: CompileTypeMetadata;
    useValue: any;
    useExisting: CompileTokenMetadata;
    useFactory: CompileFactoryMetadata;
    deps: CompileDiDependencyMetadata[];
    multi: boolean;
    constructor({token, useClass, useValue, useExisting, useFactory, deps, multi}: {
        token?: CompileTokenMetadata;
        useClass?: CompileTypeMetadata;
        useValue?: any;
        useExisting?: CompileTokenMetadata;
        useFactory?: CompileFactoryMetadata;
        deps?: CompileDiDependencyMetadata[];
        multi?: boolean;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileProviderMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileQueryMetadata {
    selectors: Array<CompileTokenMetadata>;
    descendants: boolean;
    first: boolean;
    propertyName: string;
    read: CompileTokenMetadata;
    constructor({selectors, descendants, first, propertyName, read}?: {
        selectors?: Array<CompileTokenMetadata>;
        descendants?: boolean;
        first?: boolean;
        propertyName?: string;
        read?: CompileTokenMetadata;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileQueryMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare const COMPILER_PROVIDERS: Array<any | Type | {
    [k: string]: any;
} | any[]>;

export declare class CompilerConfig {
    renderTypes: RenderTypes;
    defaultEncapsulation: ViewEncapsulation;
    useJit: boolean;
    platformDirectives: any[];
    platformPipes: any[];
    constructor({renderTypes, defaultEncapsulation, genDebugInfo, logBindingUpdate, useJit, platformDirectives, platformPipes}?: {
        renderTypes?: RenderTypes;
        defaultEncapsulation?: ViewEncapsulation;
        genDebugInfo?: boolean;
        logBindingUpdate?: boolean;
        useJit?: boolean;
        platformDirectives?: any[];
        platformPipes?: any[];
    });
    genDebugInfo: boolean;
    logBindingUpdate: boolean;
}

export declare class CompileTemplateMetadata {
    encapsulation: ViewEncapsulation;
    template: string;
    templateUrl: string;
    styles: string[];
    styleUrls: string[];
    animations: CompileAnimationEntryMetadata[];
    ngContentSelectors: string[];
    interpolation: [string, string];
    constructor({encapsulation, template, templateUrl, styles, styleUrls, animations, ngContentSelectors, interpolation}?: {
        encapsulation?: ViewEncapsulation;
        template?: string;
        templateUrl?: string;
        styles?: string[];
        styleUrls?: string[];
        ngContentSelectors?: string[];
        animations?: CompileAnimationEntryMetadata[];
        interpolation?: [string, string];
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTemplateMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare class CompileTokenMetadata implements CompileMetadataWithIdentifier {
    value: any;
    identifier: CompileIdentifierMetadata;
    identifierIsInstance: boolean;
    constructor({value, identifier, identifierIsInstance}: {
        value?: any;
        identifier?: CompileIdentifierMetadata;
        identifierIsInstance?: boolean;
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTokenMetadata;
    toJson(): {
        [key: string]: any;
    };
    runtimeCacheKey: any;
    assetCacheKey: any;
    equalsTo(token2: CompileTokenMetadata): boolean;
    name: string;
}

export declare class CompileTypeMetadata implements CompileIdentifierMetadata, CompileMetadataWithType {
    runtime: Type;
    name: string;
    prefix: string;
    moduleUrl: string;
    isHost: boolean;
    value: any;
    diDeps: CompileDiDependencyMetadata[];
    constructor({runtime, name, moduleUrl, prefix, isHost, value, diDeps}?: {
        runtime?: Type;
        name?: string;
        moduleUrl?: string;
        prefix?: string;
        isHost?: boolean;
        value?: any;
        diDeps?: CompileDiDependencyMetadata[];
    });
    static fromJson(data: {
        [key: string]: any;
    }): CompileTypeMetadata;
    identifier: CompileIdentifierMetadata;
    type: CompileTypeMetadata;
    toJson(): {
        [key: string]: any;
    };
}

export declare function createOfflineCompileUrlResolver(): UrlResolver;

export declare var DEFAULT_PACKAGE_URL_PROVIDER: {
    provide: any;
    useValue: string;
};

export declare class DirectiveAst implements TemplateAst {
    directive: CompileDirectiveMetadata;
    inputs: BoundDirectivePropertyAst[];
    hostProperties: BoundElementPropertyAst[];
    hostEvents: BoundEventAst[];
    sourceSpan: ParseSourceSpan;
    constructor(directive: CompileDirectiveMetadata, inputs: BoundDirectivePropertyAst[], hostProperties: BoundElementPropertyAst[], hostEvents: BoundEventAst[], sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class DirectiveResolver {
    constructor(_reflector?: ReflectorReader);
    resolve(type: Type): DirectiveMetadata;
}

export declare class ElementAst implements TemplateAst {
    name: string;
    attrs: AttrAst[];
    inputs: BoundElementPropertyAst[];
    outputs: BoundEventAst[];
    references: ReferenceAst[];
    directives: DirectiveAst[];
    providers: ProviderAst[];
    hasViewContainer: boolean;
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: AttrAst[], inputs: BoundElementPropertyAst[], outputs: BoundEventAst[], references: ReferenceAst[], directives: DirectiveAst[], providers: ProviderAst[], hasViewContainer: boolean, children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare abstract class ElementSchemaRegistry {
    abstract hasProperty(tagName: string, propName: string): boolean;
    abstract securityContext(tagName: string, propName: string): any;
    abstract getMappedPropName(propName: string): string;
}

export declare class EmbeddedTemplateAst implements TemplateAst {
    attrs: AttrAst[];
    outputs: BoundEventAst[];
    references: ReferenceAst[];
    variables: VariableAst[];
    directives: DirectiveAst[];
    providers: ProviderAst[];
    hasViewContainer: boolean;
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
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
    constructor(_directiveNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _outputEmitter: OutputEmitter, _xhr: XHR);
    normalizeDirectiveMetadata(directive: CompileDirectiveMetadata): Promise<CompileDirectiveMetadata>;
    compileTemplates(components: NormalizedComponentWithViewDirectives[]): SourceModule;
    loadAndCompileStylesheet(stylesheetUrl: string, shim: boolean, suffix: string): Promise<StyleSheetSourceWithImports>;
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
    token: CompileTokenMetadata;
    multiProvider: boolean;
    eager: boolean;
    providers: CompileProviderMetadata[];
    providerType: ProviderAstType;
    sourceSpan: ParseSourceSpan;
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
    value: CompileTokenMetadata;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: CompileTokenMetadata, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare abstract class RenderTypes {
    renderer: CompileIdentifierMetadata;
    renderText: CompileIdentifierMetadata;
    renderElement: CompileIdentifierMetadata;
    renderComment: CompileIdentifierMetadata;
    renderNode: CompileIdentifierMetadata;
    renderEvent: CompileIdentifierMetadata;
}

export declare class RuntimeCompiler implements ComponentResolver {
    constructor(_metadataResolver: CompileMetadataResolver, _templateNormalizer: DirectiveNormalizer, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _xhr: XHR, _genConfig: CompilerConfig);
    resolveComponent(component: Type | string): Promise<ComponentFactory<any>>;
    clearCache(): void;
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
    visitNgContent(ast: NgContentAst, context: any): any;
    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
    visitElement(ast: ElementAst, context: any): any;
    visitReference(ast: ReferenceAst, context: any): any;
    visitVariable(ast: VariableAst, context: any): any;
    visitEvent(ast: BoundEventAst, context: any): any;
    visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
    visitAttr(ast: AttrAst, context: any): any;
    visitBoundText(ast: BoundTextAst, context: any): any;
    visitText(ast: TextAst, context: any): any;
    visitDirective(ast: DirectiveAst, context: any): any;
    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}

export declare function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[], context?: any): any[];

export declare class TextAst implements TemplateAst {
    value: string;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}

export declare class UrlResolver {
    constructor(_packagePrefix?: string);
    resolve(baseUrl: string, url: string): string;
}

export declare class VariableAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
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
