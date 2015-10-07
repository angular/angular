import {isPresent, isBlank, normalizeBool, CONST_EXPR} from 'angular2/src/facade/lang';

// TODO: fill this!
export const NAMED_ENTITIES: {[key: string]: string} = <any>CONST_EXPR({'amp': '&'});

export enum HtmlTagContentType {
  RAW_TEXT,
  ESCAPABLE_RAW_TEXT,
  PARSABLE_DATA
}

export class HtmlTagDefinition {
  private closedByChildren: {[key: string]: boolean} = {};
  public closedByParent: boolean;
  public requiredParent: string;
  public implicitNamespacePrefix: string;
  public contentType: HtmlTagContentType;

  constructor({closedByChildren, requiredParent, implicitNamespacePrefix, contentType}: {
    closedByChildren?: string[],
    requiredParent?: string,
    implicitNamespacePrefix?: string,
    contentType?: HtmlTagContentType
  } = {}) {
    if (isPresent(closedByChildren)) {
      closedByChildren.forEach(tagName => this.closedByChildren[tagName] = true);
    }
    this.closedByParent = isPresent(closedByChildren) && closedByChildren.length > 0;
    this.requiredParent = requiredParent;
    this.implicitNamespacePrefix = implicitNamespacePrefix;
    this.contentType = isPresent(contentType) ? contentType : HtmlTagContentType.PARSABLE_DATA;
  }

  requireExtraParent(currentParent: string) {
    return isPresent(this.requiredParent) &&
           (isBlank(currentParent) || this.requiredParent != currentParent.toLocaleLowerCase());
  }

  isClosedByChild(name: string) {
    return normalizeBool(this.closedByChildren['*']) ||
           normalizeBool(this.closedByChildren[name.toLowerCase()]);
  }
}

// TODO: Fill this table using
// https://github.com/greim/html-tokenizer/blob/master/parser.js
// and http://www.w3.org/TR/html51/syntax.html#optional-tags
var TAG_DEFINITIONS: {[key: string]: HtmlTagDefinition} = {
  'link': new HtmlTagDefinition({closedByChildren: ['*']}),
  'ng-content': new HtmlTagDefinition({closedByChildren: ['*']}),
  'img': new HtmlTagDefinition({closedByChildren: ['*']}),
  'input': new HtmlTagDefinition({closedByChildren: ['*']}),
  'p': new HtmlTagDefinition({closedByChildren: ['p']}),
  'tr': new HtmlTagDefinition({closedByChildren: ['tr'], requiredParent: 'tbody'}),
  'col': new HtmlTagDefinition({closedByChildren: ['col'], requiredParent: 'colgroup'}),
  'svg': new HtmlTagDefinition({implicitNamespacePrefix: 'svg'}),
  'math': new HtmlTagDefinition({implicitNamespacePrefix: 'math'}),
  'style': new HtmlTagDefinition({contentType: HtmlTagContentType.RAW_TEXT}),
  'script': new HtmlTagDefinition({contentType: HtmlTagContentType.RAW_TEXT}),
  'title': new HtmlTagDefinition({contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT}),
  'textarea': new HtmlTagDefinition({contentType: HtmlTagContentType.ESCAPABLE_RAW_TEXT})
};

var DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();

export function getHtmlTagDefinition(tagName: string): HtmlTagDefinition {
  var result = TAG_DEFINITIONS[tagName.toLowerCase()];
  return isPresent(result) ? result : DEFAULT_TAG_DEFINITION;
}
