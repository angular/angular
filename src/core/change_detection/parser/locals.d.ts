export declare class Locals {
    parent: Locals;
    current: Map<any, any>;
    constructor(parent: Locals, current: Map<any, any>);
    contains(name: string): boolean;
    get(name: string): any;
    set(name: string, value: any): void;
    clearValues(): void;
}
