import { Type } from 'angular2/src/facade/lang';
import * as cpl from './directive_metadata';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
import { ViewResolver } from 'angular2/src/core/linker/view_resolver';
export declare class RuntimeMetadataResolver {
    private _directiveResolver;
    private _viewResolver;
    private _platformDirectives;
    private _cache;
    constructor(_directiveResolver: DirectiveResolver, _viewResolver: ViewResolver, _platformDirectives: Type[]);
    getMetadata(directiveType: Type): cpl.CompileDirectiveMetadata;
    getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[];
}
