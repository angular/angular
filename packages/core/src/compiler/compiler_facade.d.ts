import { CompilerFacade, Type } from './compiler_facade_interface';
export * from './compiler_facade_interface';
export declare const enum JitCompilerUsage {
    Decorator = 0,
    PartialDeclaration = 1
}
interface JitCompilerUsageRequest {
    usage: JitCompilerUsage;
    kind: 'directive' | 'component' | 'pipe' | 'injectable' | 'NgModule';
    type: Type;
}
export declare function getCompilerFacade(request: JitCompilerUsageRequest): CompilerFacade;
