import { Type } from 'angular2/src/facade/lang';
import * as cpl from './compile_metadata';
import * as dimd from 'angular2/src/core/metadata/di';
import { DirectiveResolver } from './directive_resolver';
import { PipeResolver } from './pipe_resolver';
import { ViewResolver } from './view_resolver';
import { Provider } from 'angular2/src/core/di/provider';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
export declare class CompileMetadataResolver {
    private _directiveResolver;
    private _pipeResolver;
    private _viewResolver;
    private _platformDirectives;
    private _platformPipes;
    private _directiveCache;
    private _pipeCache;
    private _anonymousTypes;
    private _anonymousTypeIndex;
    private _reflector;
    constructor(_directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver, _viewResolver: ViewResolver, _platformDirectives: Type[], _platformPipes: Type[], _reflector?: ReflectorReader);
    private sanitizeTokenName(token);
    getDirectiveMetadata(directiveType: Type): cpl.CompileDirectiveMetadata;
    /**
     * @param someType a symbol which may or may not be a directive type
     * @returns {cpl.CompileDirectiveMetadata} if possible, otherwise null.
     */
    maybeGetDirectiveMetadata(someType: Type): cpl.CompileDirectiveMetadata;
    getTypeMetadata(type: Type, moduleUrl: string): cpl.CompileTypeMetadata;
    getFactoryMetadata(factory: Function, moduleUrl: string): cpl.CompileFactoryMetadata;
    getPipeMetadata(pipeType: Type): cpl.CompilePipeMetadata;
    getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[];
    getViewPipesMetadata(component: Type): cpl.CompilePipeMetadata[];
    getDependenciesMetadata(typeOrFunc: Type | Function, dependencies: any[]): cpl.CompileDiDependencyMetadata[];
    getTokenMetadata(token: any): cpl.CompileTokenMetadata;
    getProvidersMetadata(providers: any[]): Array<cpl.CompileProviderMetadata | cpl.CompileTypeMetadata | any[]>;
    getProviderMetadata(provider: Provider): cpl.CompileProviderMetadata;
    getQueriesMetadata(queries: {
        [key: string]: dimd.QueryMetadata;
    }, isViewQuery: boolean): cpl.CompileQueryMetadata[];
    getQueryMetadata(q: dimd.QueryMetadata, propertyName: string): cpl.CompileQueryMetadata;
}
