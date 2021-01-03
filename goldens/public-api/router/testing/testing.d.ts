export declare class RouterTestingModule {
    static withRoutes(routes: Routes, config?: ExtraOptions): ModuleWithProviders<RouterTestingModule>;
}

export declare function setupTestingRouter(urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location, loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][], opts?: ExtraOptions, urlHandlingStrategy?: UrlHandlingStrategy): Router;
export declare function setupTestingRouter(urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location, loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][], urlHandlingStrategy?: UrlHandlingStrategy): Router;

export declare class SpyNgModuleFactoryLoader implements NgModuleFactoryLoader {
    set stubbedModules(modules: {
        [path: string]: any;
    });
    get stubbedModules(): {
        [path: string]: any;
    };
    constructor(compiler: Compiler);
    load(path: string): Promise<NgModuleFactory<any>>;
}
