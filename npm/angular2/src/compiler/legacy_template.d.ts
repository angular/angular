import { HtmlParser, HtmlParseTreeResult } from './html_parser';
export declare class LegacyHtmlParser extends HtmlParser {
    parse(sourceContent: string, sourceUrl: string, parseExpansionForms?: boolean): HtmlParseTreeResult;
}
