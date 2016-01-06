import { Type } from 'angular2/src/facade/lang';
import * as cpl from './directive_metadata';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
import { PipeResolver } from 'angular2/src/core/linker/pipe_resolver';
import { ViewResolver } from 'angular2/src/core/linker/view_resolver';
export declare class RuntimeMetadataResolver {
    private _directiveResolver;
    private _pipeResolver;
    private _viewResolver;
    private _platformDirectives;
    private _platformPipes;
    private _directiveCache;
    private _pipeCache;
    constructor(_directiveResolver: DirectiveResolver, _pipeResolver: PipeResolver, _viewResolver: ViewResolver, _platformDirectives: Type[], _platformPipes: Type[]);
    getDirectiveMetadata(directiveType: Type): cpl.CompileDirectiveMetadata;
    getPipeMetadata(pipeType: Type): cpl.CompilePipeMetadata;
    getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[];
    getViewPipesMetadata(component: Type): cpl.CompilePipeMetadata[];
}
