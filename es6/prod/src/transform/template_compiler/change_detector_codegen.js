// Note: This class is only here so that we can reference it from TypeScript code.
// The actual implementation lives under modules_dart.
// TODO(tbosch): Move the corresponding code into angular2/src/compiler once
// the new compiler is done.
export class Codegen {
    constructor(moduleAlias) {
    }
    generate(typeName, changeDetectorTypeName, def) {
        throw "Not implemented in JS";
    }
    toString() { throw "Not implemented in JS"; }
}
