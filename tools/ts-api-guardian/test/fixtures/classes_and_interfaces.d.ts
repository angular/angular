export declare class A {
    field: string;
    method(a: string): number;
}
export interface B {
    field: A;
}
export declare class C {
    private privateProp;
    propWithDefault: number;
    protected protectedProp: number;
    someProp: string;
    constructor(someProp: string, propWithDefault: number, privateProp: any, protectedProp: number);
}
