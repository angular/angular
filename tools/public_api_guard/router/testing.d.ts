/** @stable */
export declare class RouterTestingModule {
    static withRoutes(routes: Routes): ModuleWithProviders;
}

/** @stable */
export declare function setupTestingRouter(urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location, loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][], urlHandlingStrategy?: UrlHandlingStrategy): Router;

/** @stable */
export declare class SpyNgModuleFactoryLoader implements NgModuleFactoryLoader {
    stubbedModules: {
        [path: string]: any;
    };
    constructor(compiler: Compiler);
    load(path: string): Promise<NgModuleFactory<any>>;
}
