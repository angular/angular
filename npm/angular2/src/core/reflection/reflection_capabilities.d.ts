import { Type, ConcreteType } from 'angular2/src/facade/lang';
import { GetterFn, SetterFn, MethodFn } from './types';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
export declare class ReflectionCapabilities implements PlatformReflectionCapabilities {
    private _reflect;
    constructor(reflect?: any);
    isReflectionEnabled(): boolean;
    factory(t: ConcreteType): Function;
    parameters(typeOrFunc: Type): any[][];
    annotations(typeOrFunc: Type): any[];
    propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    interfaces(type: Type): any[];
    getter(name: string): GetterFn;
    setter(name: string): SetterFn;
    method(name: string): MethodFn;
    importUri(type: Type): string;
}
