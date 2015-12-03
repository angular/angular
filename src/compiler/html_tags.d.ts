export declare const NAMED_ENTITIES: {
    'lt': string;
    'gt': string;
    'nbsp': string;
    'amp': string;
    'Aacute': string;
    'Acirc': string;
    'Agrave': string;
    'Atilde': string;
    'Auml': string;
    'Ccedil': string;
    'Eacute': string;
    'Ecirc': string;
    'Egrave': string;
    'Euml': string;
    'Iacute': string;
    'Icirc': string;
    'Igrave': string;
    'Iuml': string;
    'Oacute': string;
    'Ocirc': string;
    'Ograve': string;
    'Otilde': string;
    'Ouml': string;
    'Uacute': string;
    'Ucirc': string;
    'Ugrave': string;
    'Uuml': string;
    'aacute': string;
    'acirc': string;
    'agrave': string;
    'atilde': string;
    'auml': string;
    'ccedil': string;
    'eacute': string;
    'ecirc': string;
    'egrave': string;
    'euml': string;
    'iacute': string;
    'icirc': string;
    'igrave': string;
    'iuml': string;
    'oacute': string;
    'ocirc': string;
    'ograve': string;
    'otilde': string;
    'ouml': string;
    'uacute': string;
    'ucirc': string;
    'ugrave': string;
    'uuml': string;
};
export declare enum HtmlTagContentType {
    RAW_TEXT = 0,
    ESCAPABLE_RAW_TEXT = 1,
    PARSABLE_DATA = 2,
}
export declare class HtmlTagDefinition {
    private closedByChildren;
    closedByParent: boolean;
    requiredParents: {
        [key: string]: boolean;
    };
    parentToAdd: string;
    implicitNamespacePrefix: string;
    contentType: HtmlTagContentType;
    isVoid: boolean;
    constructor({closedByChildren, requiredParents, implicitNamespacePrefix, contentType, closedByParent, isVoid}?: {
        closedByChildren?: string[];
        closedByParent?: boolean;
        requiredParents?: string[];
        implicitNamespacePrefix?: string;
        contentType?: HtmlTagContentType;
        isVoid?: boolean;
    });
    requireExtraParent(currentParent: string): boolean;
    isClosedByChild(name: string): boolean;
}
export declare function getHtmlTagDefinition(tagName: string): HtmlTagDefinition;
