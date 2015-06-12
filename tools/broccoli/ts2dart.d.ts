// TODO(martinprobst): This is a hand-written declarations file. Replace with an automatically
// generated one when TypeScript has a strategy to distribute TS source via npm.

export interface TranspilerOptions {
  failFast?: boolean;
  generateLibraryName?: boolean;
  generateSourceMap?: boolean;
  basePath?: string;
  translateBuiltins?: boolean;
}

export class Transpiler {
  constructor(options: TranspilerOptions);
  transpile(fileNames: string[], outdir?: string);
}
