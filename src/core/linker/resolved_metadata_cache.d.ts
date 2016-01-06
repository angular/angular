import { Type } from 'angular2/src/facade/lang';
import { DirectiveProvider } from './element';
import { DirectiveResolver } from './directive_resolver';
import { PipeProvider } from '../pipes/pipe_provider';
import { PipeResolver } from './pipe_resolver';
export declare class ResolvedMetadataCache {
    private _directiveResolver;
    private _pipeResolver;
    private _directiveCache;
    private _pipeCache;
    constructor(_directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver);
    getResolvedDirectiveMetadata(type: Type): DirectiveProvider;
    getResolvedPipeMetadata(type: Type): PipeProvider;
}
export declare var CODEGEN_RESOLVED_METADATA_CACHE: ResolvedMetadataCache;
