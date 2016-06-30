/** @experimental */
export declare function bootstrap<C>(appComponentType: ConcreteType<C>, customProviders?: Array<any>): Promise<ComponentRef<C>>;

/** @stable */
export declare function bootstrapModule<M>(moduleType: ConcreteType<M>, compiler?: Compiler): Promise<AppModuleRef<M>>;

/** @experimental */
export declare function bootstrapWorkerApp(appComponentType: Type, customProviders?: Array<any>): Promise<ComponentRef<any>>;

/** @experimental */
export declare function bootstrapWorkerUi(workerScriptUri: string, customProviders?: Array<any>): Promise<ApplicationRef>;

/** @experimental */
export declare const BROWSER_APP_COMPILER_PROVIDERS: Array<any>;

/** @stable */
export declare function browserCompiler({useDebug, useJit, providers}?: {
    useDebug?: boolean;
    useJit?: boolean;
    providers?: Array<any>;
}): Compiler;

/** @experimental */
export declare const CACHED_TEMPLATE_PROVIDER: Array<any>;
