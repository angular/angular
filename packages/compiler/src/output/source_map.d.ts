/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export type SourceMap = {
    version: number;
    file?: string;
    sourceRoot: string;
    sources: string[];
    sourcesContent: (string | null)[];
    mappings: string;
};
export declare class SourceMapGenerator {
    private file;
    private sourcesContent;
    private lines;
    private lastCol0;
    private hasMappings;
    constructor(file?: string | null);
    addSource(url: string, content?: string | null): this;
    addLine(): this;
    addMapping(col0: number, sourceUrl?: string, sourceLine0?: number, sourceCol0?: number): this;
    /**
     * @internal strip this from published d.ts files due to
     * https://github.com/microsoft/TypeScript/issues/36216
     */
    private get currentLine();
    toJSON(): SourceMap | null;
    toJsComment(): string;
}
export declare function toBase64String(value: string): string;
