import { ViewMetadata } from '../metadata/view';
import { Type } from 'angular2/src/facade/lang';
/**
 * Resolves types to {@link ViewMetadata}.
 */
export declare class ViewResolver {
    resolve(component: Type): ViewMetadata;
}
