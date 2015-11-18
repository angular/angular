import { Type } from 'angular2/src/facade/lang';
import { ResolvedFactory, ResolvedProvider_ } from 'angular2/src/core/di/provider';
import { Key } from 'angular2/src/core/di';
import { PipeMetadata } from '../metadata/directives';
export declare class PipeProvider extends ResolvedProvider_ {
    name: string;
    pure: boolean;
    constructor(name: string, pure: boolean, key: Key, resolvedFactories: ResolvedFactory[], multiBinding: boolean);
    static createFromType(type: Type, metadata: PipeMetadata): PipeProvider;
}
