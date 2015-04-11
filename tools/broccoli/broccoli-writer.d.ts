/// <reference path="../typings/es6-promise/es6-promise.d.ts" />


declare class Writer { write(readTree: (tree) => Promise<string>, destDir: string): Promise<any>; }

export = Writer;
