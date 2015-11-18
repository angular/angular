import { Type } from 'angular2/src/facade/lang';
import { SetterFn, GetterFn, MethodFn } from './types';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
export { SetterFn, GetterFn, MethodFn } from './types';
export { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
export declare class ReflectionInfo {
    annotations: any[];
    parameters: any[][];
    factory: Function;
    interfaces: any[];
    propMetadata: {
        [key: string]: any[];
    };
    constructor(annotations?: any[], parameters?: any[][], factory?: Function, interfaces?: any[], propMetadata?: {
        [key: string]: any[];
    });
}
export declare class Reflector {
    reflectionCapabilities: PlatformReflectionCapabilities;
    constructor(reflectionCapabilities: PlatformReflectionCapabilities);
    isReflectionEnabled(): boolean;
    /**
     * Causes `this` reflector to track keys used to access
     * {@link ReflectionInfo} objects.
     */
    trackUsage(): void;
    /**
     * Lists types for which reflection information was not requested since
     * {@link #trackUsage} was called. This list could later be audited as
     * potential dead code.
     */
    listUnusedKeys(): any[];
    registerFunction(func: Function, funcInfo: ReflectionInfo): void;
    registerType(type: Type, typeInfo: ReflectionInfo): void;
    registerGetters(getters: {
        [key: string]: GetterFn;
    }): void;
    registerSetters(setters: {
        [key: string]: SetterFn;
    }): void;
    registerMethods(methods: {
        [key: string]: MethodFn;
    }): void;
    factory(type: Type): Function;
    parameters(typeOrFunc: any): any[];
    annotations(typeOrFunc: any): any[];
    propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    interfaces(type: Type): any[];
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
    importUri(type: Type): string;
}
