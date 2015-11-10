import {isPresent, isBlank, normalizeBool, CONST_EXPR} from 'angular2/src/facade/lang';

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

export enum HtmlTagContentType {
  RAW_TEXT,
  ESCAPABLE_RAW_TEXT,
  PARSABLE_DATA
}

export class HtmlTagDefinition {
  private closedByChildren: {[key: string]: boolean} = {};
  public closedByParent: boolean = false;
  public requiredParent: string;
  public implicitNamespacePrefix: string;
  public contentType: HtmlTagContentType;

  constructor({closedByChildren, requiredParent, implicitNamespacePrefix, contentType}: {
    closedByChildren?: string,
    requiredParent?: string,
    implicitNamespacePrefix?: string,
    contentType?: HtmlTagContentType
  } = {}) {
    if (isPresent(closedByChildren) && closedByChildren.length > 0) {
      closedByChildren.split(',').forEach(tagName => this.closedByChildren[tagName.trim()] = true);
      this.closedByParent = true;
    }
    this.requiredParent = requiredParent;
    this.implicitNamespacePrefix = implicitNamespacePrefix;
    this.contentType = isPresent(contentType) ? contentType : HtmlTagContentType.PARSABLE_DATA;
  }

  requireExtraParent(currentParent: string): boolean {
    return isPresent(this.requiredParent) &&
           (isBlank(currentParent) || this.requiredParent != currentParent.toLowerCase());
  }

  isClosedByChild(name: string): boolean {
    return normalizeBool(this.closedByChildren['*']) ||
           normalizeBool(this.closedByChildren[name.toLowerCase()]);
  }
}

// see http://www.w3.org/TR/html51/syntax.html#optional-tags
// This implementation does not fully conform to the HTML5 spec.
var TAG_DEFINITIONS: {[key: string]: HtmlTagDefinition} = {
  'link': new HtmlTagDefinition({closedByChildren: '*'}),
  'ng-content': new HtmlTagDefinition({closedByChildren: '*'}),
  'img': new HtmlTagDefinition({closedByChildren: '*'}),
  'input': new HtmlTagDefinition({closedByChildren: '*'}),
  'hr': new HtmlTagDefinition({closedByChildren: '*'}),
  'br': new HtmlTagDefinition({closedByChildren: '*'}),
  'wbr': new HtmlTagDefinition({closedByChildren: '*'}),
  'p': new HtmlTagDefinition({
    closedByChildren:
        'address,article,aside,blockquote,div,dl,fieldset,footer,form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,main,nav,ol,p,pre,section,table,ul'
  }),
  'thead': new HtmlTagDefinition({closedByChildren: 'tbody,tfoot'}),
  'tbody': new HtmlTagDefinition({closedByChildren: 'tbody,tfoot'}),
  'tfoot': new HtmlTagDefinition({closedByChildren: 'tbody'}),
  'tr': new HtmlTagDefinition({closedByChildren: 'tr', requiredParent: 'tbody'}),
  'td': new HtmlTagDefinition({closedByChildren: 'td,th'}),
  'th': new HtmlTagDefinition({closedByChildren: 'td,th'}),
  'col': new HtmlTagDefinition({closedByChildren: 'col', requiredParent: 'colgroup'}),
  'svg': new HtmlTagDefinition({implicitNamespacePrefix: 'svg'}),
  'math': new HtmlTagDefinition({implicitNamespacePrefix: 'math'}),
  'li': new HtmlTagDefinition({closedByChildren: 'li'}),
  'dt': new HtmlTagDefinition({closedByChildren: 'dt,dd'}),
  'dd': new HtmlTagDefinition({closedByChildren: 'dt,dd'}),
  'rb': new HtmlTagDefinition({closedByChildren: 'rb,rt,rtc,rp'}),
  'rt': new HtmlTagDefinition({closedByChildren: 'rb,rt,rtc,rp'}),
  'rtc': new HtmlTagDefinition({closedByChildren: 'rb,rtc,rp'}),
  'rp': new HtmlTagDefinition({closedByChildren: 'rb,rt,rtc,rp'}),
  'optgroup': new HtmlTagDefinition({closedByChildren: 'optgroup'}),
  'style': new HtmlTagDefinition({contentType: HtmlTagContentType.RAW_TEXT}),
  'script': new HtmlTagDefinition({contentType: HtmlTagContentType.RAW_TEXT}),
  'title': new HtmlTagDefinition({contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT}),
  'textarea': new HtmlTagDefinition({contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT}),
};

var DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();

export function getHtmlTagDefinition(tagName: string): HtmlTagDefinition {
  var result = TAG_DEFINITIONS[tagName.toLowerCase()];
  return isPresent(result) ? result : DEFAULT_TAG_DEFINITION;
}
