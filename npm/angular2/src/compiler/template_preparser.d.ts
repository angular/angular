import { HtmlElementAst } from './html_ast';
export declare function preparseElement(ast: HtmlElementAst): PreparsedElement;
export declare enum PreparsedElementType {
    NG_CONTENT = 0,
    STYLE = 1,
    STYLESHEET = 2,
    SCRIPT = 3,
    OTHER = 4,
}
export declare class PreparsedElement {
    type: PreparsedElementType;
    selectAttr: string;
    hrefAttr: string;
    nonBindable: boolean;
    projectAs: string;
    constructor(type: PreparsedElementType, selectAttr: string, hrefAttr: string, nonBindable: boolean, projectAs: string);
}
