/// <reference path="../typings/es6-promise/es6-promise.d.ts" />


declare class Filter {
  constructor(inputTree: any);
  processString(contents: string, relativePath: string): string;
  // NB: This function is probably not intended as part of the public API
  processFile(srcDir: string, destDir: string, relativePath: string): Promise<any>;
}

export = Filter;
