/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

interface Tree {
  read(readTree: (other: Tree) => Promise<string>);
  cleanup();
}

declare module "broccoli-writer" {
  class Writer {
    write(readTree: (tree: Tree) => Promise<string>, destDir: string): Promise<void>;
  }
  export = Writer;
}

declare module "broccoli-caching-writer" {
  class CachingWriter {
    updateCache(srcDirs: string | string[], destDir: string);

    constructor(inputTrees: Tree[], options: Object);
  }
  export = CachingWriter;
}

declare module "broccoli-filter" {
  interface FilterOptions {
    extensions?: string[]
  }

  class Filter {
    constructor(inputTree: Tree | string, options?: FilterOptions);
    processString(contents: string, relativePath: string): string;
    // NB: This function is probably not intended as part of the public API
    processFile(srcDir: string, destDir: string, relativePath: string): Promise<any>;
  }
  export = Filter;
}
