import { Type } from 'angular2/src/facade/lang';
import { DirectiveMetadata } from '../core/metadata';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
export declare class MockDirectiveResolver extends DirectiveResolver {
    private _providerOverrides;
    private viewProviderOverrides;
    resolve(type: Type): DirectiveMetadata;
    /**
     * @deprecated
     */
    setBindingsOverride(type: Type, bindings: any[]): void;
    /**
     * @deprecated
     */
    setViewBindingsOverride(type: Type, viewBindings: any[]): void;
    setProvidersOverride(type: Type, bindings: any[]): void;
    setViewProvidersOverride(type: Type, viewBindings: any[]): void;
}
