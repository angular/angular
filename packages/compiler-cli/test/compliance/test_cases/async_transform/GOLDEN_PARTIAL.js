/****************************************************************************************************
 * PARTIAL FILE: async_functions_transformed.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function* fnDeclaration_generator(a, b) {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
}
function* fnExpression_generator(a, b) {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
}
function* fnArrowBlock_generator(a, b) {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
}
function* fnArrowExpression_generator(a, b) { return (yield a) > 10 ? yield 200 : yield b; }
function* staticMethodDeclaration_generator(a, b) {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
}
function* methodDeclaration_generator(a, b) {
    const x = yield a;
    if (x > 10) {
        return yield 200;
    }
    return yield b;
}
function Input() { }
export function fnDeclaration(a, b) {
    return Zone.__awaiter(this, [a, b], fnDeclaration_generator);
}
export const fnExpression = function (a, b) {
    return Zone.__awaiter(this, [a, b], fnExpression_generator);
};
export const fnArrowBlock = (a, b) => Zone.__awaiter(this, [a, b], fnArrowBlock_generator);
export const fnArrowExpression = (a, b) => Zone.__awaiter(this, [a, b], fnArrowExpression_generator);
export class Test {
    constructor() {
        function* methodExpression_generator(a, b) {
            const x = yield a;
            if (x > 10) {
                return yield 200;
            }
            return yield b;
        }
        function* methodArrowBlock_generator(a, b) {
            const x = yield a;
            if (x > 10) {
                return yield 200;
            }
            return yield b;
        }
        function* methodArrowExpression_generator(a, b) { return (yield a) > 10 ? yield 200 : yield b; }
        this.methodExpression = function (a, b) {
            return Zone.__awaiter(this, [a, b], methodExpression_generator);
        };
        this.methodArrowBlock = (a, b) => Zone.__awaiter(this, [a, b], methodArrowBlock_generator);
        this.methodArrowExpression = (a, b) => Zone.__awaiter(this, [a, b], methodArrowExpression_generator);
    }
    static staticMethodDeclaration(a, b) {
        return Zone.__awaiter(this, [a, b], staticMethodDeclaration_generator);
    }
    methodDeclaration(a, b) {
        return Zone.__awaiter(this, [a, b], methodDeclaration_generator);
    }
}
__decorate([
    Input(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Promise]),
    __metadata("design:returntype", Promise)
], Test.prototype, "methodDeclaration", null);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodExpression", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowBlock", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowExpression", void 0);

/****************************************************************************************************
 * PARTIAL FILE: async_functions_transformed.d.ts
 ****************************************************************************************************/
export declare function fnDeclaration(a: number, b: Promise<string>): Promise<number | string>;
export declare const fnExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare class Test {
    static staticMethodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    methodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    protected methodExpression: (a: number, b: Promise<string>) => Promise<number | string>;
    readonly methodArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
    methodArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
}

/****************************************************************************************************
 * PARTIAL FILE: async_functions_es2017.js
 ****************************************************************************************************/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function Input() { }
export async function fnDeclaration(a, b) {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
}
export const fnExpression = async function fnExpression(a, b) {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
};
export const fnArrowBlock = async (a, b) => {
    const x = await a;
    if (x > 10) {
        return await 200;
    }
    return await b;
};
export const fnArrowExpression = async (a, b) => await a > 10 ? await 200 : await b;
export class Test {
    constructor() {
        this.methodExpression = async function methodExpression(a, b) {
            const x = await a;
            if (x > 10) {
                return await 200;
            }
            return await b;
        };
        this.methodArrowBlock = async (a, b) => {
            const x = await a;
            if (x > 10) {
                return await 200;
            }
            return await b;
        };
        this.methodArrowExpression = async (a, b) => await a > 10 ? await 200 : await b;
    }
    static async staticMethodDeclaration(a, b) {
        const x = await a;
        if (x > 10) {
            return await 200;
        }
        return await b;
    }
    async methodDeclaration(a, b) {
        const x = await a;
        if (x > 10) {
            return await 200;
        }
        return await b;
    }
}
__decorate([
    Input(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Promise]),
    __metadata("design:returntype", Promise)
], Test.prototype, "methodDeclaration", null);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodExpression", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowBlock", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], Test.prototype, "methodArrowExpression", void 0);

/****************************************************************************************************
 * PARTIAL FILE: async_functions_es2017.d.ts
 ****************************************************************************************************/
export declare function fnDeclaration(a: number, b: Promise<string>): Promise<number | string>;
export declare const fnExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
export declare const fnArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
export declare class Test {
    static staticMethodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    methodDeclaration(a: number, b: Promise<string>): Promise<number | string>;
    protected methodExpression: (a: number, b: Promise<string>) => Promise<number | string>;
    readonly methodArrowBlock: (a: number, b: Promise<string>) => Promise<number | string>;
    methodArrowExpression: (a: number, b: Promise<string>) => Promise<number | string>;
}

/****************************************************************************************************
 * PARTIAL FILE: complex_params.js
 ****************************************************************************************************/
function* foo_generator(...[, { a }, { b: [{ c: d }] }]) {
    yield a;
    yield d;
}
export function foo(...[, { a }, { b: [{ c: d }] }]) {
    return Zone.__awaiter(this, [...[, { a }, { b: [{ c: d }] }]], foo_generator);
}

/****************************************************************************************************
 * PARTIAL FILE: complex_params.d.ts
 ****************************************************************************************************/
export declare function foo(...[, { a }, { b: [{ c: d }] }]: any[]): Promise<void>;

