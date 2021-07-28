/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionsAcrossFiles/b.js
 ****************************************************************************************************/
function* f_generator() {
    yield a.f();
}
import { a } from './a';
export const b = {
    f: () => Zone.__awaiter(this, [], f_generator)
};

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionsAcrossFiles/b.d.ts
 ****************************************************************************************************/
export declare const b: {
    f: () => Promise<void>;
};

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionsAcrossFiles/a.js
 ****************************************************************************************************/
function* f_generator() {
    yield b.f();
}
import { b } from './b';
export const a = {
    f: () => Zone.__awaiter(this, [], f_generator)
};

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionsAcrossFiles/a.d.ts
 ****************************************************************************************************/
export declare const a: {
    f: () => Promise<void>;
};

/****************************************************************************************************
 * PARTIAL FILE: asyncMultiFile/a.js
 ****************************************************************************************************/
function* f_generator() { }
function f() {
    return Zone.__awaiter(this, [], f_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncMultiFile/a.d.ts
 ****************************************************************************************************/
declare function f(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncMultiFile/b.js
 ****************************************************************************************************/
function g() { }

/****************************************************************************************************
 * PARTIAL FILE: asyncMultiFile/b.d.ts
 ****************************************************************************************************/
declare function g(): void;

/****************************************************************************************************
 * PARTIAL FILE: asyncAliasReturnType_es6.js
 ****************************************************************************************************/
function* f_generator() { }
function f() {
    return Zone.__awaiter(this, [], f_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncAliasReturnType_es6.d.ts
 ****************************************************************************************************/
declare type PromiseAlias<T> = Promise<T>;
declare function f(): PromiseAlias<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction1_es6.js
 ****************************************************************************************************/
function* foo_generator() { }
var foo = () => Zone.__awaiter(this, [], foo_generator);

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction1_es6.d.ts
 ****************************************************************************************************/
declare var foo: () => Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction2_es6.js
 ****************************************************************************************************/
var f = (await) => { };

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction2_es6.d.ts
 ****************************************************************************************************/
declare var f: (await: any) => void;

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction4_es6.js
 ****************************************************************************************************/
var await = () => { };

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunction4_es6.d.ts
 ****************************************************************************************************/
declare var await: () => void;

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunctionCapturesArguments_es6.js
 ****************************************************************************************************/
class C {
    method() {
        const ɵarguments = arguments;
        function* asyncArrow_generator(foo) {
            yield foo;
            yield other.apply(this, ɵarguments);
        }
        function other() { }
        var asyncArrow = (foo) => Zone.__awaiter(this, [foo], asyncArrow_generator);
        const localArgs = arguments;
        const syncArrow = (foo) => {
            other.apply(this, arguments);
        };
    }
}

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunctionCapturesArguments_es6.d.ts
 ****************************************************************************************************/
declare class C {
    method(): void;
}

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunctionCapturesThis_es6.js
 ****************************************************************************************************/
class C {
    method() {
        function* fn_generator() { return yield this; }
        var fn = () => Zone.__awaiter(this, [], fn_generator);
    }
}

/****************************************************************************************************
 * PARTIAL FILE: asyncArrowFunctionCapturesThis_es6.d.ts
 ****************************************************************************************************/
declare class C {
    method(): void;
}

/****************************************************************************************************
 * PARTIAL FILE: asyncAwait_es6.js
 ****************************************************************************************************/
function* f0_generator() { }
function* f1_generator() { }
function* f3_generator() { }
function* f4_generator() { }
function* f5_generator() { }
function* f6_generator() { }
function* f7_generator() { }
function* f8_generator() { }
function* f9_generator() { }
function* f10_generator() { return p; }
function* f11_generator() { return mp; }
function* f12_generator() { return mp; }
function* f13_generator() { return p; }
function* m1_generator() { }
function* m2_generator() { }
function* m3_generator() { }
function* m1_generator_1() { }
function* m2_generator_1() { }
function* m3_generator_1() { }
function* m4_generator() { }
function* m5_generator() { }
function* m6_generator() { }
function* f14_generator() {
    block: {
        yield 1;
        break block;
    }
}
function f0() {
    return Zone.__awaiter(this, [], f0_generator);
}
function f1() {
    return Zone.__awaiter(this, [], f1_generator);
}
function f3() {
    return Zone.__awaiter(this, [], f3_generator);
}
let f4 = function () {
    return Zone.__awaiter(this, [], f4_generator);
};
let f5 = function () {
    return Zone.__awaiter(this, [], f5_generator);
};
let f6 = function () {
    return Zone.__awaiter(this, [], f6_generator);
};
let f7 = () => Zone.__awaiter(this, [], f7_generator);
let f8 = () => Zone.__awaiter(this, [], f8_generator);
let f9 = () => Zone.__awaiter(this, [], f9_generator);
let f10 = () => Zone.__awaiter(this, [], f10_generator);
let f11 = () => Zone.__awaiter(this, [], f11_generator);
let f12 = () => Zone.__awaiter(this, [], f12_generator);
let f13 = () => Zone.__awaiter(this, [], f13_generator);
let o = { m1() {
        return Zone.__awaiter(this, [], m1_generator);
    }, m2() {
        return Zone.__awaiter(this, [], m2_generator);
    }, m3() {
        return Zone.__awaiter(this, [], m3_generator);
    } };
class C {
    m1() {
        return Zone.__awaiter(this, [], m1_generator_1);
    }
    m2() {
        return Zone.__awaiter(this, [], m2_generator_1);
    }
    m3() {
        return Zone.__awaiter(this, [], m3_generator_1);
    }
    static m4() {
        return Zone.__awaiter(this, [], m4_generator);
    }
    static m5() {
        return Zone.__awaiter(this, [], m5_generator);
    }
    static m6() {
        return Zone.__awaiter(this, [], m6_generator);
    }
}
var M;
(function (M) {
    function* f1_generator_1() { }
    function f1() {
        return Zone.__awaiter(this, [], f1_generator_1);
    }
    M.f1 = f1;
})(M || (M = {}));
function f14() {
    return Zone.__awaiter(this, [], f14_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncAwait_es6.d.ts
 ****************************************************************************************************/
declare type MyPromise<T> = Promise<T>;
declare var MyPromise: typeof Promise;
declare var p: Promise<number>;
declare var mp: MyPromise<number>;
declare function f0(): Promise<void>;
declare function f1(): Promise<void>;
declare function f3(): MyPromise<void>;
declare let f4: () => Promise<void>;
declare let f5: () => Promise<void>;
declare let f6: () => MyPromise<void>;
declare let f7: () => Promise<void>;
declare let f8: () => Promise<void>;
declare let f9: () => MyPromise<void>;
declare let f10: () => Promise<number>;
declare let f11: () => Promise<number>;
declare let f12: () => Promise<number>;
declare let f13: () => MyPromise<number>;
declare let o: {
    m1(): Promise<void>;
    m2(): Promise<void>;
    m3(): MyPromise<void>;
};
declare class C {
    m1(): Promise<void>;
    m2(): Promise<void>;
    m3(): MyPromise<void>;
    static m4(): Promise<void>;
    static m5(): Promise<void>;
    static m6(): MyPromise<void>;
}
declare module M {
    function f1(): Promise<void>;
}
declare function f14(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration1_es6.js
 ****************************************************************************************************/
function* foo_generator() { }
function foo() {
    return Zone.__awaiter(this, [], foo_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration1_es6.d.ts
 ****************************************************************************************************/
declare function foo(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration2_es6.js
 ****************************************************************************************************/
function f(await) { }

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration2_es6.d.ts
 ****************************************************************************************************/
declare function f(await: any): void;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration4_es6.js
 ****************************************************************************************************/
function await() { }

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration4_es6.d.ts
 ****************************************************************************************************/
declare function await(): void;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration11_es6.js
 ****************************************************************************************************/
function* await_generator() { }
function await() {
    return Zone.__awaiter(this, [], await_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration11_es6.d.ts
 ****************************************************************************************************/
declare function await(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration14_es6.js
 ****************************************************************************************************/
function* foo_generator() {
    return;
}
function foo() {
    return Zone.__awaiter(this, [], foo_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration14_es6.d.ts
 ****************************************************************************************************/
declare function foo(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration15_es6.js
 ****************************************************************************************************/
function* fn1_generator() { }
function* fn7_generator() {
    return;
}
function* fn8_generator() {
    return 1;
}
function* fn9_generator() {
    return null;
}
function* fn10_generator() {
    return undefined;
}
function* fn11_generator() {
    return a;
}
function* fn12_generator() {
    return obj;
}
function* fn14_generator() {
    yield 1;
}
function* fn15_generator() {
    yield null;
}
function* fn16_generator() {
    yield undefined;
}
function* fn17_generator() {
    yield a;
}
function* fn18_generator() {
    yield obj;
}
function fn1() {
    return Zone.__awaiter(this, [], fn1_generator);
} // valid: Promise<void>
function fn7() {
    return Zone.__awaiter(this, [], fn7_generator);
} // valid: Promise<void>
function fn8() {
    return Zone.__awaiter(this, [], fn8_generator);
} // valid: Promise<number>
function fn9() {
    return Zone.__awaiter(this, [], fn9_generator);
} // valid: Promise<any>
function fn10() {
    return Zone.__awaiter(this, [], fn10_generator);
} // valid: Promise<any>
function fn11() {
    return Zone.__awaiter(this, [], fn11_generator);
} // valid: Promise<any>
function fn12() {
    return Zone.__awaiter(this, [], fn12_generator);
} // valid: Promise<{ then: string; }>
function fn14() {
    return Zone.__awaiter(this, [], fn14_generator);
} // valid: Promise<void>
function fn15() {
    return Zone.__awaiter(this, [], fn15_generator);
} // valid: Promise<void>
function fn16() {
    return Zone.__awaiter(this, [], fn16_generator);
} // valid: Promise<void>
function fn17() {
    return Zone.__awaiter(this, [], fn17_generator);
} // valid: Promise<void>
function fn18() {
    return Zone.__awaiter(this, [], fn18_generator);
} // valid: Promise<void>

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionDeclaration15_es6.d.ts
 ****************************************************************************************************/
declare let a: any;
declare let obj: {
    then: string;
};
declare function fn1(): Promise<void>;
declare function fn7(): Promise<void>;
declare function fn8(): Promise<number>;
declare function fn9(): Promise<null>;
declare function fn10(): Promise<undefined>;
declare function fn11(): Promise<any>;
declare function fn12(): Promise<{
    then: string;
}>;
declare function fn14(): Promise<void>;
declare function fn15(): Promise<void>;
declare function fn16(): Promise<void>;
declare function fn17(): Promise<void>;
declare function fn18(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionReturnType.js
 ****************************************************************************************************/
function* fAsync_generator() {
    // Without explicit type annotation, this is just an array.
    return [1, true];
}
function* fAsyncExplicit_generator() {
    // This is contextually typed as a tuple.
    return [1, true];
}
function* fIndexedTypeForStringProp_generator(obj) {
    return obj.stringProp;
}
function* fIndexedTypeForPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fIndexedTypeForExplicitPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fIndexedTypeForAnyProp_generator(obj) {
    return obj.anyProp;
}
function* fIndexedTypeForPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fIndexedTypeForExplicitPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForStringProp_generator(obj) {
    return obj.stringProp;
}
function* fGenericIndexedTypeForPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fGenericIndexedTypeForExplicitPromiseOfStringProp_generator(obj) {
    return Promise.resolve(obj.stringProp);
}
function* fGenericIndexedTypeForAnyProp_generator(obj) {
    return obj.anyProp;
}
function* fGenericIndexedTypeForPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForExplicitPromiseOfAnyProp_generator(obj) {
    return Promise.resolve(obj.anyProp);
}
function* fGenericIndexedTypeForKProp_generator(obj, key) {
    return obj[key];
}
function* fGenericIndexedTypeForPromiseOfKProp_generator(obj, key) {
    return Promise.resolve(obj[key]);
}
function* fGenericIndexedTypeForExplicitPromiseOfKProp_generator(obj, key) {
    return Promise.resolve(obj[key]);
}
function fAsync() {
    return Zone.__awaiter(this, [], fAsync_generator);
}
function fAsyncExplicit() {
    return Zone.__awaiter(this, [], fAsyncExplicit_generator);
}
function fIndexedTypeForStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForStringProp_generator);
}
function fIndexedTypeForPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForPromiseOfStringProp_generator);
}
function fIndexedTypeForExplicitPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForExplicitPromiseOfStringProp_generator);
}
function fIndexedTypeForAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForAnyProp_generator);
}
function fIndexedTypeForPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForPromiseOfAnyProp_generator);
}
function fIndexedTypeForExplicitPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fIndexedTypeForExplicitPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForStringProp_generator);
}
function fGenericIndexedTypeForPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForPromiseOfStringProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfStringProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForExplicitPromiseOfStringProp_generator);
}
function fGenericIndexedTypeForAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForAnyProp_generator);
}
function fGenericIndexedTypeForPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfAnyProp(obj) {
    return Zone.__awaiter(this, [obj], fGenericIndexedTypeForExplicitPromiseOfAnyProp_generator);
}
function fGenericIndexedTypeForKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForKProp_generator);
}
function fGenericIndexedTypeForPromiseOfKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForPromiseOfKProp_generator);
}
function fGenericIndexedTypeForExplicitPromiseOfKProp(obj, key) {
    return Zone.__awaiter(this, [obj, key], fGenericIndexedTypeForExplicitPromiseOfKProp_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncFunctionReturnType.d.ts
 ****************************************************************************************************/
declare function fAsync(): Promise<(number | boolean)[]>;
declare function fAsyncExplicit(): Promise<[number, boolean]>;
interface Obj {
    stringProp: string;
    anyProp: any;
}
declare function fIndexedTypeForStringProp(obj: Obj): Promise<Obj['stringProp']>;
declare function fIndexedTypeForPromiseOfStringProp(obj: Obj): Promise<Obj['stringProp']>;
declare function fIndexedTypeForExplicitPromiseOfStringProp(obj: Obj): Promise<Obj['stringProp']>;
declare function fIndexedTypeForAnyProp(obj: Obj): Promise<Obj['anyProp']>;
declare function fIndexedTypeForPromiseOfAnyProp(obj: Obj): Promise<Obj['anyProp']>;
declare function fIndexedTypeForExplicitPromiseOfAnyProp(obj: Obj): Promise<Obj['anyProp']>;
declare function fGenericIndexedTypeForStringProp<TObj extends Obj>(obj: TObj): Promise<TObj['stringProp']>;
declare function fGenericIndexedTypeForPromiseOfStringProp<TObj extends Obj>(obj: TObj): Promise<TObj['stringProp']>;
declare function fGenericIndexedTypeForExplicitPromiseOfStringProp<TObj extends Obj>(obj: TObj): Promise<TObj['stringProp']>;
declare function fGenericIndexedTypeForAnyProp<TObj extends Obj>(obj: TObj): Promise<TObj['anyProp']>;
declare function fGenericIndexedTypeForPromiseOfAnyProp<TObj extends Obj>(obj: TObj): Promise<TObj['anyProp']>;
declare function fGenericIndexedTypeForExplicitPromiseOfAnyProp<TObj extends Obj>(obj: TObj): Promise<TObj['anyProp']>;
declare function fGenericIndexedTypeForKProp<TObj extends Obj, K extends keyof TObj>(obj: TObj, key: K): Promise<TObj[K]>;
declare function fGenericIndexedTypeForPromiseOfKProp<TObj extends Obj, K extends keyof TObj>(obj: TObj, key: K): Promise<TObj[K]>;
declare function fGenericIndexedTypeForExplicitPromiseOfKProp<TObj extends Obj, K extends keyof TObj>(obj: TObj, key: K): Promise<TObj[K]>;

/****************************************************************************************************
 * PARTIAL FILE: asyncIIFE.js
 ****************************************************************************************************/
function f1() {
    function* anonymous_generator() {
        yield 10;
        throw new Error();
    }
    (() => Zone.__awaiter(this, [], anonymous_generator))();
    var x = 1;
}

/****************************************************************************************************
 * PARTIAL FILE: asyncIIFE.d.ts
 ****************************************************************************************************/
declare function f1(): void;

/****************************************************************************************************
 * PARTIAL FILE: asyncMethodWithSuper_es6.js
 ****************************************************************************************************/
class A {
    x() { }
    y() { }
}
class B extends A {
    // async method with only call/get on 'super' does not require a binding
    simple() {
        const ɵsuperIndex = name => super[name];
        const ɵsuper = Object.create(null, {
            x: { get: () => super.x },
            y: { get: () => super.y }
        });
        return Zone.__awaiter(this, [], function* () {
            // call with property access
            ɵsuper.x.call(this);
            // call additional property.
            ɵsuper.y.call(this);
            // call with element access
            ɵsuperIndex('x').call(this);
            // property access (read)
            const a = ɵsuper.x;
            // element access (read)
            const b = ɵsuperIndex('x');
        });
    }
    // async method with assignment/destructuring on 'super' requires a binding
    advanced() {
        const ɵsuperIndex_1 = (function (geti, seti) {
          const cache = Object.create(null);
          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });
        })(name => super[name], (name, value) => super[name] = value);
        const ɵsuper_1 = Object.create(null, {
            x: { get: () => super.x, set: v => super.x = v }
        });
        return Zone.__awaiter(this, [], function* () {
            const f = () => { };
            // call with property access
            ɵsuper_1.x.call(this);
            // call with element access
            ɵsuperIndex_1('x').value.call(this);
            // property access (read)
            const a = ɵsuper_1.x;
            // element access (read)
            const b = ɵsuperIndex_1('x').value;
            // property access (assign)
            ɵsuper_1.x = f;
            // element access (assign)
            ɵsuperIndex_1('x').value = f;
            // destructuring assign with property access
            ({ f: ɵsuper_1.x } = { f });
            // destructuring assign with element access
            ({ f: ɵsuperIndex_1('x').value } = { f });
            // property access in arrow
            (() => ɵsuper_1.x.call(this));
            // element access in arrow
            (() => ɵsuperIndex_1('x').value.call(this));
            // property access in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuper_1.x.call(this); }));
            // element access in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuperIndex_1('x').value.call(this); }));
        });
    }
    property_access_only_read_only() {
        const ɵsuper_2 = Object.create(null, {
            x: { get: () => super.x }
        });
        return Zone.__awaiter(this, [], function* () {
            // call with property access
            ɵsuper_2.x.call(this);
            // property access (read)
            const a = ɵsuper_2.x;
            // property access in arrow
            (() => ɵsuper_2.x.call(this));
            // property access in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuper_2.x.call(this); }));
        });
    }
    property_access_only_write_only() {
        const ɵsuper_3 = Object.create(null, {
            x: { get: () => super.x, set: v => super.x = v }
        });
        return Zone.__awaiter(this, [], function* () {
            const f = () => { };
            // property access (assign)
            ɵsuper_3.x = f;
            // destructuring assign with property access
            ({ f: ɵsuper_3.x } = { f });
            // property access (assign) in arrow
            (() => ɵsuper_3.x = f);
            // property access (assign) in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuper_3.x = f; }));
        });
    }
    element_access_only_read_only() {
        const ɵsuperIndex_2 = name => super[name];
        return Zone.__awaiter(this, [], function* () {
            // call with element access
            ɵsuperIndex_2('x').call(this);
            // element access (read)
            const a = ɵsuperIndex_2('x');
            // element access in arrow
            (() => ɵsuperIndex_2('x').call(this));
            // element access in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuperIndex_2('x').call(this); }));
        });
    }
    element_access_only_write_only() {
        const ɵsuperIndex_3 = (function (geti, seti) {
          const cache = Object.create(null);
          return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });
        })(name => super[name], (name, value) => super[name] = value);
        return Zone.__awaiter(this, [], function* () {
            const f = () => { };
            // element access (assign)
            ɵsuperIndex_3('x').value = f;
            // destructuring assign with element access
            ({ f: ɵsuperIndex_3('x').value } = { f });
            // element access (assign) in arrow
            (() => ɵsuperIndex_3('x').value = f);
            // element access (assign) in async arrow
            (() => Zone.__awaiter(this, [], function* () { return ɵsuperIndex_3('x').value = f; }));
        });
    }
}

/****************************************************************************************************
 * PARTIAL FILE: asyncMethodWithSuper_es6.d.ts
 ****************************************************************************************************/
declare class A {
    x(): void;
    y(): void;
}
declare class B extends A {
    simple(): Promise<void>;
    advanced(): Promise<void>;
    property_access_only_read_only(): Promise<void>;
    property_access_only_write_only(): Promise<void>;
    element_access_only_read_only(): Promise<void>;
    element_access_only_write_only(): Promise<void>;
}

/****************************************************************************************************
 * PARTIAL FILE: asyncUnParenthesizedArrowFunction_es6.js
 ****************************************************************************************************/
function* x_generator(i) { return yield someOtherFunction(i); }
function* x1_generator(i) { return yield someOtherFunction(i); }
const x = (i) => Zone.__awaiter(this, [i], x_generator);
const x1 = (i) => Zone.__awaiter(this, [i], x1_generator);

/****************************************************************************************************
 * PARTIAL FILE: asyncUnParenthesizedArrowFunction_es6.d.ts
 ****************************************************************************************************/
declare function someOtherFunction(i: any): Promise<void>;
declare const x: (i: any) => Promise<void>;
declare const x1: (i: any) => Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncUseStrict_es6.js
 ****************************************************************************************************/
function* func_generator() {
    'use strict';
    var b = (yield p) || a;
}
function func() {
    return Zone.__awaiter(this, [], func_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncUseStrict_es6.d.ts
 ****************************************************************************************************/
declare var a: boolean;
declare var p: Promise<boolean>;
declare function func(): Promise<void>;

/****************************************************************************************************
 * PARTIAL FILE: asyncWithVarShadowing_es6.js
 ****************************************************************************************************/
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
function* fn1_generator(x) {
    var x;
}
function* fn2_generator(x) {
    var x, z;
}
function* fn3_generator(x) {
    var z;
}
function* fn4_generator(x) {
    var x = y;
}
function* fn5_generator(x) {
    var { x } = y;
}
function* fn6_generator(x) {
    var { x, z } = y;
}
function* fn7_generator(x) {
    var { x = y } = y;
}
function* fn8_generator(x) {
    var { z: x } = y;
}
function* fn9_generator(x) {
    var { z: { x } } = y;
}
function* fn10_generator(x) {
    var { z: { x } = y } = y;
}
function* fn11_generator(x) {
    var x = __rest(y, []);
}
function* fn12_generator(x) {
    var [x] = y;
}
function* fn13_generator(x) {
    var [x = y] = y;
}
function* fn14_generator(x) {
    var [, x] = y;
}
function* fn15_generator(x) {
    var [...x] = y;
}
function* fn16_generator(x) {
    var [[x]] = y;
}
function* fn17_generator(x) {
    var [[x] = y] = y;
}
function* fn18_generator({ x }) {
    var x;
}
function* fn19_generator([x]) {
    var x;
}
function* fn20_generator(x) {
    {
        var x;
    }
}
function* fn21_generator(x) {
    if (y) {
        var x;
    }
}
function* fn22_generator(x) {
    if (y) {
    }
    else {
        var x;
    }
}
function* fn23_generator(x) {
    try {
        var x;
    }
    catch (e) {
    }
}
function* fn24_generator(x) {
    try {
    }
    catch (e) {
        var x;
    }
}
function* fn25_generator(x) {
    try {
    }
    catch (x) {
        var x;
    }
}
function* fn26_generator(x) {
    try {
    }
    catch ({ x }) {
        var x;
    }
}
function* fn27_generator(x) {
    try {
    }
    finally {
        var x;
    }
}
function* fn28_generator(x) {
    while (y) {
        var x;
    }
}
function* fn29_generator(x) {
    do {
        var x;
    } while (y);
}
function* fn30_generator(x) {
    for (var x = y;;) {
    }
}
function* fn31_generator(x) {
    for (var { x } = y;;) {
    }
}
function* fn32_generator(x) {
    for (;;) {
        var x;
    }
}
function* fn33_generator(x) {
    for (var x in y) {
    }
}
function* fn34_generator(x) {
    for (var z in y) {
        var x;
    }
}
function* fn35_generator(x) {
    for (var x of y) {
    }
}
function* fn36_generator(x) {
    for (var { x } of y) {
    }
}
function* fn37_generator(x) {
    for (var z of y) {
        var x;
    }
}
function* fn38_generator(x) {
    switch (y) {
        case y:
            var x;
    }
}
function* fn39_generator(x) {
    foo: {
        var x;
        break foo;
    }
}
function* fn40_generator(x) {
    try {
    }
    catch (_a) {
        var x;
    }
}
function fn1(x) {
    return Zone.__awaiter(this, [x], fn1_generator);
}
function fn2(x) {
    return Zone.__awaiter(this, [x], fn2_generator);
}
function fn3(x) {
    return Zone.__awaiter(this, [x], fn3_generator);
}
function fn4(x) {
    return Zone.__awaiter(this, [x], fn4_generator);
}
function fn5(x) {
    return Zone.__awaiter(this, [x], fn5_generator);
}
function fn6(x) {
    return Zone.__awaiter(this, [x], fn6_generator);
}
function fn7(x) {
    return Zone.__awaiter(this, [x], fn7_generator);
}
function fn8(x) {
    return Zone.__awaiter(this, [x], fn8_generator);
}
function fn9(x) {
    return Zone.__awaiter(this, [x], fn9_generator);
}
function fn10(x) {
    return Zone.__awaiter(this, [x], fn10_generator);
}
function fn11(x) {
    return Zone.__awaiter(this, [x], fn11_generator);
}
function fn12(x) {
    return Zone.__awaiter(this, [x], fn12_generator);
}
function fn13(x) {
    return Zone.__awaiter(this, [x], fn13_generator);
}
function fn14(x) {
    return Zone.__awaiter(this, [x], fn14_generator);
}
function fn15(x) {
    return Zone.__awaiter(this, [x], fn15_generator);
}
function fn16(x) {
    return Zone.__awaiter(this, [x], fn16_generator);
}
function fn17(x) {
    return Zone.__awaiter(this, [x], fn17_generator);
}
function fn18({ x }) {
    return Zone.__awaiter(this, [{ x }], fn18_generator);
}
function fn19([x]) {
    return Zone.__awaiter(this, [[x]], fn19_generator);
}
function fn20(x) {
    return Zone.__awaiter(this, [x], fn20_generator);
}
function fn21(x) {
    return Zone.__awaiter(this, [x], fn21_generator);
}
function fn22(x) {
    return Zone.__awaiter(this, [x], fn22_generator);
}
function fn23(x) {
    return Zone.__awaiter(this, [x], fn23_generator);
}
function fn24(x) {
    return Zone.__awaiter(this, [x], fn24_generator);
}
function fn25(x) {
    return Zone.__awaiter(this, [x], fn25_generator);
}
function fn26(x) {
    return Zone.__awaiter(this, [x], fn26_generator);
}
function fn27(x) {
    return Zone.__awaiter(this, [x], fn27_generator);
}
function fn28(x) {
    return Zone.__awaiter(this, [x], fn28_generator);
}
function fn29(x) {
    return Zone.__awaiter(this, [x], fn29_generator);
}
function fn30(x) {
    return Zone.__awaiter(this, [x], fn30_generator);
}
function fn31(x) {
    return Zone.__awaiter(this, [x], fn31_generator);
}
function fn32(x) {
    return Zone.__awaiter(this, [x], fn32_generator);
}
function fn33(x) {
    return Zone.__awaiter(this, [x], fn33_generator);
}
function fn34(x) {
    return Zone.__awaiter(this, [x], fn34_generator);
}
function fn35(x) {
    return Zone.__awaiter(this, [x], fn35_generator);
}
function fn36(x) {
    return Zone.__awaiter(this, [x], fn36_generator);
}
function fn37(x) {
    return Zone.__awaiter(this, [x], fn37_generator);
}
function fn38(x) {
    return Zone.__awaiter(this, [x], fn38_generator);
}
function fn39(x) {
    return Zone.__awaiter(this, [x], fn39_generator);
}
function fn40(x) {
    return Zone.__awaiter(this, [x], fn40_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: asyncWithVarShadowing_es6.d.ts
 ****************************************************************************************************/
declare const y: any;
declare function fn1(x: any): Promise<void>;
declare function fn2(x: any): Promise<void>;
declare function fn3(x: any): Promise<void>;
declare function fn4(x: any): Promise<void>;
declare function fn5(x: any): Promise<void>;
declare function fn6(x: any): Promise<void>;
declare function fn7(x: any): Promise<void>;
declare function fn8(x: any): Promise<void>;
declare function fn9(x: any): Promise<void>;
declare function fn10(x: any): Promise<void>;
declare function fn11(x: any): Promise<void>;
declare function fn12(x: any): Promise<void>;
declare function fn13(x: any): Promise<void>;
declare function fn14(x: any): Promise<void>;
declare function fn15(x: any): Promise<void>;
declare function fn16(x: any): Promise<void>;
declare function fn17(x: any): Promise<void>;
declare function fn18({ x }: {
    x: any;
}): Promise<void>;
declare function fn19([x]: [any]): Promise<void>;
declare function fn20(x: any): Promise<void>;
declare function fn21(x: any): Promise<void>;
declare function fn22(x: any): Promise<void>;
declare function fn23(x: any): Promise<void>;
declare function fn24(x: any): Promise<void>;
declare function fn25(x: any): Promise<void>;
declare function fn26(x: any): Promise<void>;
declare function fn27(x: any): Promise<void>;
declare function fn28(x: any): Promise<void>;
declare function fn29(x: any): Promise<void>;
declare function fn30(x: any): Promise<void>;
declare function fn31(x: any): Promise<void>;
declare function fn32(x: any): Promise<void>;
declare function fn33(x: string): Promise<void>;
declare function fn34(x: any): Promise<void>;
declare function fn35(x: any): Promise<void>;
declare function fn36(x: any): Promise<void>;
declare function fn37(x: any): Promise<void>;
declare function fn38(x: any): Promise<void>;
declare function fn39(x: any): Promise<void>;
declare function fn40(x: any): Promise<void>;

