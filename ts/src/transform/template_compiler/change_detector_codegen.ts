import {
  ChangeDetectorDefinition,
} from 'angular2/src/core/change_detection/change_detection';

// Note: This class is only here so that we can reference it from TypeScript code.
// The actual implementation lives under modules_dart.
// TODO(tbosch): Move the corresponding code into angular2/src/compiler once
// the new compiler is done.
export class Codegen {
  constructor(moduleAlias: string) {}
  generate(typeName: string, changeDetectorTypeName: string, def: ChangeDetectorDefinition): void {
    throw "Not implemented in JS";
  }
  toString(): string { throw "Not implemented in JS"; }
}
