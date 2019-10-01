declare module '@cush/sorcery' {
  const sorcery: SorceryFn;
  export = sorcery;

  export interface SorceryFn {
    (chain: Source|Source[], opts?: Options): SourceMap;
    portal(chain: Source|Source[], opts?: Options): (line: number, column: number) => SourcePos;
  }

  export type Source = string | SourceObj | Omit<SourceObj, 'file'>| Omit<SourceObj, 'content'>;

  export interface SourceObj {
    file: string;
    content: string;
    map?: object;
  }

  export interface Options {
    readFile?: (filePath: string) => string;
    getMap?: (filePath: string) => object;
    generatedFile?: string;
    sourceRoot?: string;
    includeContent?: boolean;
  }

  export class SourceMap {
    version: number;
    file: string;
    sources: string[];
    sourceRoot: string;
    sourcesContent: string[];
    names: string[];
    mappings: string;

    constructor(opts: Options);
    toString(): string;
    toUrl(): string;
  }

  export interface SourcePos {
    source: string|null;
    line: number;
    column: number;
    name: string;
  }
}
