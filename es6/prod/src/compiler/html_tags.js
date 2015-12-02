import { isPresent, isBlank, normalizeBool, CONST_EXPR } from 'angular2/src/facade/lang';
// see http://www.w3.org/TR/html51/syntax.html#named-character-references
// see https://html.spec.whatwg.org/multipage/entities.json
// This list is not exhaustive to keep the compiler footprint low.
// The `&#123;` / `&#x1ab;` syntax should be used when the named character reference does not exist.
export const NAMED_ENTITIES = CONST_EXPR({
    'lt': '<',
    'gt': '>',
    'nbsp': '\u00A0',
    'amp': '&',
    'Aacute': '\u00C1',
    'Acirc': '\u00C2',
    'Agrave': '\u00C0',
    'Atilde': '\u00C3',
    'Auml': '\u00C4',
    'Ccedil': '\u00C7',
    'Eacute': '\u00C9',
    'Ecirc': '\u00CA',
    'Egrave': '\u00C8',
    'Euml': '\u00CB',
    'Iacute': '\u00CD',
    'Icirc': '\u00CE',
    'Igrave': '\u00CC',
    'Iuml': '\u00CF',
    'Oacute': '\u00D3',
    'Ocirc': '\u00D4',
    'Ograve': '\u00D2',
    'Otilde': '\u00D5',
    'Ouml': '\u00D6',
    'Uacute': '\u00DA',
    'Ucirc': '\u00DB',
    'Ugrave': '\u00D9',
    'Uuml': '\u00DC',
    'aacute': '\u00E1',
    'acirc': '\u00E2',
    'agrave': '\u00E0',
    'atilde': '\u00E3',
    'auml': '\u00E4',
    'ccedil': '\u00E7',
    'eacute': '\u00E9',
    'ecirc': '\u00EA',
    'egrave': '\u00E8',
    'euml': '\u00EB',
    'iacute': '\u00ED',
    'icirc': '\u00EE',
    'igrave': '\u00EC',
    'iuml': '\u00EF',
    'oacute': '\u00F3',
    'ocirc': '\u00F4',
    'ograve': '\u00F2',
    'otilde': '\u00F5',
    'ouml': '\u00F6',
    'uacute': '\u00FA',
    'ucirc': '\u00FB',
    'ugrave': '\u00F9',
    'uuml': '\u00FC',
});
export var HtmlTagContentType;
(function (HtmlTagContentType) {
    HtmlTagContentType[HtmlTagContentType["RAW_TEXT"] = 0] = "RAW_TEXT";
    HtmlTagContentType[HtmlTagContentType["ESCAPABLE_RAW_TEXT"] = 1] = "ESCAPABLE_RAW_TEXT";
    HtmlTagContentType[HtmlTagContentType["PARSABLE_DATA"] = 2] = "PARSABLE_DATA";
})(HtmlTagContentType || (HtmlTagContentType = {}));
export class HtmlTagDefinition {
    constructor({ closedByChildren, requiredParents, implicitNamespacePrefix, contentType, closedByParent } = {}) {
        this.closedByChildren = {};
        this.closedByParent = false;
        if (isPresent(closedByChildren) && closedByChildren.length > 0) {
            closedByChildren.forEach(tagName => this.closedByChildren[tagName] = true);
        }
        this.closedByParent = normalizeBool(closedByParent);
        if (isPresent(requiredParents) && requiredParents.length > 0) {
            this.requiredParents = {};
            this.parentToAdd = requiredParents[0];
            requiredParents.forEach(tagName => this.requiredParents[tagName] = true);
        }
        this.implicitNamespacePrefix = implicitNamespacePrefix;
        this.contentType = isPresent(contentType) ? contentType : HtmlTagContentType.PARSABLE_DATA;
    }
    requireExtraParent(currentParent) {
        return isPresent(this.requiredParents) &&
            (isBlank(currentParent) || this.requiredParents[currentParent.toLowerCase()] != true);
    }
    isClosedByChild(name) {
        return normalizeBool(this.closedByChildren['*']) ||
            normalizeBool(this.closedByChildren[name.toLowerCase()]);
    }
}
// see http://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
var TAG_DEFINITIONS = {
    'link': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'ng-content': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'img': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'input': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'hr': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'br': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'wbr': new HtmlTagDefinition({ closedByChildren: ['*'], closedByParent: true }),
    'p': new HtmlTagDefinition({
        closedByChildren: [
            'address',
            'article',
            'aside',
            'blockquote',
            'div',
            'dl',
            'fieldset',
            'footer',
            'form',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'header',
            'hgroup',
            'hr',
            'main',
            'nav',
            'ol',
            'p',
            'pre',
            'section',
            'table',
            'ul'
        ],
        closedByParent: true
    }),
    'thead': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'] }),
    'tbody': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'], closedByParent: true }),
    'tfoot': new HtmlTagDefinition({ closedByChildren: ['tbody'], closedByParent: true }),
    'tr': new HtmlTagDefinition({
        closedByChildren: ['tr'],
        requiredParents: ['tbody', 'tfoot', 'thead'],
        closedByParent: true
    }),
    'td': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
    'th': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
    'col': new HtmlTagDefinition({ closedByChildren: ['col'], requiredParents: ['colgroup'] }),
    'svg': new HtmlTagDefinition({ implicitNamespacePrefix: 'svg' }),
    'math': new HtmlTagDefinition({ implicitNamespacePrefix: 'math' }),
    'li': new HtmlTagDefinition({ closedByChildren: ['li'], closedByParent: true }),
    'dt': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'] }),
    'dd': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'], closedByParent: true }),
    'rb': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
    'rt': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
    'rtc': new HtmlTagDefinition({ closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true }),
    'rp': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
    'optgroup': new HtmlTagDefinition({ closedByChildren: ['optgroup'], closedByParent: true }),
    'option': new HtmlTagDefinition({ closedByChildren: ['option', 'optgroup'], closedByParent: true }),
    'style': new HtmlTagDefinition({ contentType: HtmlTagContentType.RAW_TEXT }),
    'script': new HtmlTagDefinition({ contentType: HtmlTagContentType.RAW_TEXT }),
    'title': new HtmlTagDefinition({ contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT }),
    'textarea': new HtmlTagDefinition({ contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT }),
};
var DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();
export function getHtmlTagDefinition(tagName) {
    var result = TAG_DEFINITIONS[tagName.toLowerCase()];
    return isPresent(result) ? result : DEFAULT_TAG_DEFINITION;
}
