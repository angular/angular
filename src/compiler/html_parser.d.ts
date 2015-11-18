import { HtmlAst } from './html_ast';
export declare class HtmlParser {
    parse(template: string, sourceInfo: string): HtmlAst[];
    unparse(nodes: HtmlAst[]): string;
}
