import { Type } from 'angular2/src/facade/lang';
import { Predicate } from 'angular2/src/facade/collection';
import { DebugElement } from 'angular2/core';
export declare class By {
    static all(): Function;
    static css(selector: string): Predicate<DebugElement>;
    static directive(type: Type): Predicate<DebugElement>;
}
