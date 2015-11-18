import { ChangeDetectorDefinition } from 'angular2/src/core/change_detection/change_detection';
export declare class Codegen {
    constructor(moduleAlias: string);
    generate(typeName: string, changeDetectorTypeName: string, def: ChangeDetectorDefinition): void;
    toString(): string;
}
