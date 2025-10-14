/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import { PlatformReflectionCapabilities } from './platform_reflection_capabilities';
/**
 * Regular expression that detects pass-through constructors for ES5 output. This Regex
 * intends to capture the common delegation pattern emitted by TypeScript and Babel. Also
 * it intends to capture the pattern where existing constructors have been downleveled from
 * ES2015 to ES5 using TypeScript w/ downlevel iteration. e.g.
 *
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, arguments) || this;
 * ```
 *
 * downleveled to ES5 with `downlevelIteration` for TypeScript < 4.2:
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, __spread(arguments)) || this;
 * ```
 *
 * or downleveled to ES5 with `downlevelIteration` for TypeScript >= 4.2:
 * ```ts
 *   function MyClass() {
 *     var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
 * ```
 *
 * More details can be found in: https://github.com/angular/angular/issues/38453.
 */
export declare const ES5_DELEGATE_CTOR: RegExp;
/** Regular expression that detects ES2015 classes which extend from other classes. */
export declare const ES2015_INHERITED_CLASS: RegExp;
/**
 * Regular expression that detects ES2015 classes which extend from other classes and
 * have an explicit constructor defined.
 */
export declare const ES2015_INHERITED_CLASS_WITH_CTOR: RegExp;
/**
 * Regular expression that detects ES2015 classes which extend from other classes
 * and inherit a constructor.
 */
export declare const ES2015_INHERITED_CLASS_WITH_DELEGATE_CTOR: RegExp;
/**
 * Determine whether a stringified type is a class which delegates its constructor
 * to its parent.
 *
 * This is not trivial since compiled code can actually contain a constructor function
 * even if the original source code did not. For instance, when the child class contains
 * an initialized instance property.
 */
export declare function isDelegateCtor(typeStr: string): boolean;
export declare class ReflectionCapabilities implements PlatformReflectionCapabilities {
    private _reflect;
    constructor(reflect?: any);
    factory<T>(t: Type<T>): (args: any[]) => T;
    /** @internal */
    _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][];
    private _ownParameters;
    parameters(type: Type<any>): any[][];
    private _ownAnnotations;
    annotations(typeOrFunc: Type<any>): any[];
    private _ownPropMetadata;
    propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    ownPropMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    hasLifecycleHook(type: any, lcProperty: string): boolean;
}
