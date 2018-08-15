export declare class A {
    field: string;
    method(a: string): number;
}

export interface B {
    field: A;
}

export declare class C {
    propWithDefault: number;
    protected protectedProp: number;
    someProp: string;
    constructor(someProp: string, propWithDefault: number, privateProp: any, protectedProp: number);
}
