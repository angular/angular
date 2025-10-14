/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tss from 'typescript/lib/tsserverlibrary';
export declare function asPlainTextWithLinks(documentation: tss.SymbolDisplayPart[] | undefined, getScriptInfo: (fileName: string) => tss.server.ScriptInfo | undefined): string;
export declare function tagsToMarkdown(tags: tss.JSDocTagInfo[], getScriptInfo: (fileName: string) => tss.server.ScriptInfo | undefined): string;
export declare function documentationToMarkdown(documentation: tss.SymbolDisplayPart[] | undefined, tags: tss.JSDocTagInfo[] | undefined, getScriptInfo: (fileName: string) => tss.server.ScriptInfo | undefined): string[];
