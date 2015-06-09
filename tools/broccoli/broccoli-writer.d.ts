/// <reference path="./broccoli.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

declare class Writer implements BroccoliTree {
  inputPath: string;
  outputPath: string;
  write(readTree: BroccoliReadTree, destDir: string): Promise<any>;
  cleanup();
}

export = Writer;
