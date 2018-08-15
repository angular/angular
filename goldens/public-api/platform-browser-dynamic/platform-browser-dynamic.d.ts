export declare class JitCompilerFactory implements CompilerFactory {
    createCompiler(options?: CompilerOptions[]): Compiler;
}

export declare const platformBrowserDynamic: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

export declare const RESOURCE_CACHE_PROVIDER: Provider[];

export declare const VERSION: Version;
