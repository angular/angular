import { ViewMetadata } from 'angular2/src/core/metadata/view';
import { Type } from 'angular2/src/facade/lang';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
/**
 * Resolves types to {@link ViewMetadata}.
 */
export declare class ViewResolver {
    private _reflector;
    constructor(_reflector?: ReflectorReader);
    resolve(component: Type): ViewMetadata;
}
