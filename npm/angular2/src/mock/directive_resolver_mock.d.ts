import { Type } from 'angular2/src/facade/lang';
import { DirectiveMetadata } from '../core/metadata';
import { DirectiveResolver } from 'angular2/src/compiler/directive_resolver';
/**
 * An implementation of {@link DirectiveResolver} that allows overriding
 * various properties of directives.
 */
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
    setProvidersOverride(type: Type, providers: any[]): void;
    setViewProvidersOverride(type: Type, viewProviders: any[]): void;
}
