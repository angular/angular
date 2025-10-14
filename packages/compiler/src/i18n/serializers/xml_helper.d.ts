/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export interface IVisitor {
    visitTag(tag: Tag): any;
    visitText(text: Text): any;
    visitDeclaration(decl: Declaration): any;
    visitDoctype(doctype: Doctype): any;
}
export declare function serialize(nodes: Node[]): string;
export interface Node {
    visit(visitor: IVisitor): any;
}
export declare class Declaration implements Node {
    attrs: {
        [k: string]: string;
    };
    constructor(unescapedAttrs: {
        [k: string]: string;
    });
    visit(visitor: IVisitor): any;
}
export declare class Doctype implements Node {
    rootTag: string;
    dtd: string;
    constructor(rootTag: string, dtd: string);
    visit(visitor: IVisitor): any;
}
export declare class Tag implements Node {
    name: string;
    children: Node[];
    attrs: {
        [k: string]: string;
    };
    constructor(name: string, unescapedAttrs?: {
        [k: string]: string;
    }, children?: Node[]);
    visit(visitor: IVisitor): any;
}
export declare class Text implements Node {
    value: string;
    constructor(unescapedValue: string);
    visit(visitor: IVisitor): any;
}
export declare class CR extends Text {
    constructor(ws?: number);
}
export declare function escapeXml(text: string): string;
