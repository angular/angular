import { Type } from 'angular2/src/facade/lang';
import { DirectiveMetadata } from 'angular2/src/core/metadata';
export declare class DirectiveResolver {
    /**
     * Return {@link DirectiveMetadata} for a given `Type`.
     */
    resolve(type: Type): DirectiveMetadata;
    private _mergeWithPropertyMetadata(dm, propertyMetadata);
    private _merge(dm, inputs, outputs, host, queries);
}
