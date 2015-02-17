// Type definitions for chai 1.7.2
// Project: http://chaijs.com/
// Definitions by: Jed Hunsaker <https://github.com/jedhunsaker/>, Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module chai {
    export class AssertionError {
        constructor(message: string, _props?: any, ssf?: Function);
        name: string;
        message: string;
        showDiff: boolean;
        stack: string;
    }

    export function expect(target: any, message?: string): Expect;

    export var assert: Assert;
    export var config: Config;

    export interface Config {
        includeStack: boolean;
    }

    // Provides a way to extend the internals of Chai
    function use(fn: (chai: any, utils: any) => void): any;

    interface ExpectStatic {
        (target: any): Expect;
    }

    interface Assertions {
        attr(name: string, value?: string): any;
        css(name: string, value?: string): any;
        data(name: string, value?: string): any;
        class(className: string): any;
        id(id: string): any;
        html(html: string): any;
        text(text: string): any;
        value(value: string): any;
        visible: any;
        hidden: any;
        selected: any;
        checked: any;
        disabled: any;
        empty: any;
        exist: any;
    }

    interface Expect extends LanguageChains, NumericComparison, TypeComparison, Assertions {
        not: Expect;
        deep: Deep;
        a: TypeComparison;
        an: TypeComparison;
        include: Include;
        contain: Include;
        ok: Expect;
        true: Expect;
        false: Expect;
        null: Expect;
        undefined: Expect;
        exist: Expect;
        empty: Expect;
        arguments: Expect;
        Arguments: Expect;
        equal: Equal;
        equals: Equal;
        eq: Equal;
        eql: Equal;
        eqls: Equal;
        property: Property;
        ownProperty: OwnProperty;
        haveOwnProperty: OwnProperty;
        length: Length;
        lengthOf: Length;
        match(RegularExpression: RegExp, message?: string): Expect;
        string(string: string, message?: string): Expect;
        keys: Keys;
        key(string: string): Expect;
        throw: Throw;
        throws: Throw;
        Throw: Throw;
        respondTo(method: string, message?: string): Expect;
        itself: Expect;
        satisfy(matcher: Function, message?: string): Expect;
        closeTo(expected: number, delta: number, message?: string): Expect;
        members: Members;
    }

    interface LanguageChains {
        to: Expect;
        be: Expect;
        been: Expect;
        is: Expect;
        that: Expect;
        and: Expect;
        have: Expect;
        has: Expect;
        with: Expect;
        at: Expect;
        of: Expect;
        same: Expect;
    }

    interface NumericComparison {
        above: NumberComparer;
        gt: NumberComparer;
        greaterThan: NumberComparer;
        least: NumberComparer;
        gte: NumberComparer;
        below: NumberComparer;
        lt: NumberComparer;
        lessThan: NumberComparer;
        most: NumberComparer;
        lte: NumberComparer;
        within(start: number, finish: number, message?: string): Expect;
    }

    interface NumberComparer {
        (value: number, message?: string): Expect;
    }

    interface TypeComparison {
        (type: string, message?: string): Expect;
        instanceof: InstanceOf;
        instanceOf: InstanceOf;
    }

    interface InstanceOf {
        (constructor: Object, message?: string): Expect;
    }

    interface Deep {
        equal: Equal;
        property: Property;
    }

    interface Equal {
        (value: any, message?: string): Expect;
    }

    interface Property {
        (name: string, value?: any, message?: string): Expect;
    }

    interface OwnProperty {
        (name: string, message?: string): Expect;
    }

    interface Length extends LanguageChains, NumericComparison {
        (length: number, message?: string): Expect;
    }

    interface Include {
        (value: Object, message?: string): Expect;
        (value: string, message?: string): Expect;
        (value: number, message?: string): Expect;
        keys: Keys;
        members: Members;
    }

    interface Keys {
        (...keys: string[]): Expect;
        (keys: any[]): Expect;
    }

    interface Members {
        (set: any[], message?: string): Expect;
    }

    interface Throw {
        (): Expect;
        (expected: string, message?: string): Expect;
        (expected: RegExp, message?: string): Expect;
        (constructor: Error, expected?: string, message?: string): Expect;
        (constructor: Error, expected?: RegExp, message?: string): Expect;
        (constructor: Function, expected?: string, message?: string): Expect;
        (constructor: Function, expected?: RegExp, message?: string): Expect;
    }

    export interface Assert {
        (express: any, msg?: string):void;

        fail(actual?: any, expected?: any, msg?: string, operator?: string):void;

        ok(val: any, msg?: string):void;
        notOk(val: any, msg?: string):void;

        equal(act: any, exp: any, msg?: string):void;
        notEqual(act: any, exp: any, msg?: string):void;

        strictEqual(act: any, exp: any, msg?: string):void;
        notStrictEqual(act: any, exp: any, msg?: string):void;

        deepEqual(act: any, exp: any, msg?: string):void;
        notDeepEqual(act: any, exp: any, msg?: string):void;

        isTrue(val: any, msg?: string):void;
        isFalse(val: any, msg?: string):void;

        isNull(val: any, msg?: string):void;
        isNotNull(val: any, msg?: string):void;

        isUndefined(val: any, msg?: string):void;
        isDefined(val: any, msg?: string):void;

        isFunction(val: any, msg?: string):void;
        isNotFunction(val: any, msg?: string):void;

        isObject(val: any, msg?: string):void;
        isNotObject(val: any, msg?: string):void;

        isArray(val: any, msg?: string):void;
        isNotArray(val: any, msg?: string):void;

        isString(val: any, msg?: string):void;
        isNotString(val: any, msg?: string):void;

        isNumber(val: any, msg?: string):void;
        isNotNumber(val: any, msg?: string):void;

        isBoolean(val: any, msg?: string):void;
        isNotBoolean(val: any, msg?: string):void;

        typeOf(val: any, type: string, msg?: string):void;
        notTypeOf(val: any, type: string, msg?: string):void;

        instanceOf(val: any, type: Function, msg?: string):void;
        notInstanceOf(val: any, type: Function, msg?: string):void;

        include(exp: string, inc: any, msg?: string):void;
        include(exp: any[], inc: any, msg?: string):void;

        notInclude(exp: string, inc: any, msg?: string):void;
        notInclude(exp: any[], inc: any, msg?: string):void;

        match(exp: any, re: RegExp, msg?: string):void;
        notMatch(exp: any, re: RegExp, msg?: string):void;

        property(obj: Object, prop: string, msg?: string):void;
        notProperty(obj: Object, prop: string, msg?: string):void;
        deepProperty(obj: Object, prop: string, msg?: string):void;
        notDeepProperty(obj: Object, prop: string, msg?: string):void;

        propertyVal(obj: Object, prop: string, val: any, msg?: string):void;
        propertyNotVal(obj: Object, prop: string, val: any, msg?: string):void;

        deepPropertyVal(obj: Object, prop: string, val: any, msg?: string):void;
        deepPropertyNotVal(obj: Object, prop: string, val: any, msg?: string):void;

        lengthOf(exp: any, len: number, msg?: string):void;
        //alias frenzy
        throw(fn: Function, msg?: string):void;
        throw(fn: Function, regExp: RegExp):void;
        throw(fn: Function, errType: Function, msg?: string):void;
        throw(fn: Function, errType: Function, regExp: RegExp):void;

        throws(fn: Function, msg?: string):void;
        throws(fn: Function, regExp: RegExp):void;
        throws(fn: Function, errType: Function, msg?: string):void;
        throws(fn: Function, errType: Function, regExp: RegExp):void;

        Throw(fn: Function, msg?: string):void;
        Throw(fn: Function, regExp: RegExp):void;
        Throw(fn: Function, errType: Function, msg?: string):void;
        Throw(fn: Function, errType: Function, regExp: RegExp):void;

        doesNotThrow(fn: Function, msg?: string):void;
        doesNotThrow(fn: Function, regExp: RegExp):void;
        doesNotThrow(fn: Function, errType: Function, msg?: string):void;
        doesNotThrow(fn: Function, errType: Function, regExp: RegExp):void;

        operator(val: any, operator: string, val2: any, msg?: string):void;
        closeTo(act: number, exp: number, delta: number, msg?: string):void;

        sameMembers(set1: any[], set2: any[], msg?: string):void;
        includeMembers(set1: any[], set2: any[], msg?: string):void;

        ifError(val: any, msg?: string):void;
    }
}

declare module "chai" {
    export = chai;
}
